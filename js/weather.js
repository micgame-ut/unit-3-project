// Network access: Open-Meteo geocoding and forecast, BigDataCloud reverse geocoding.
// No API keys. Coordinates are rounded to 2 decimals (~1 km) before leaving the device (req. 3, 17).

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
// Redirects to api-bdc.io (BigDataCloud's own domain) as of 2026-10-11.
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const STATE_CODES = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO',
  Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', 'Washington, D.C.': 'DC',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA',
  Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE',
  Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
  Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD',
  Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA',
  'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY', 'Puerto Rico': 'PR',
};

export function roundCoord(value) {
  return Math.round(value * 100) / 100;
}

function stateCode(stateName) {
  return STATE_CODES[stateName] || stateName || '';
}

/** Thrown for network or service failures, so the UI can show the error state. */
export class ServiceError extends Error {}

async function getJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ServiceError('network');
  }
  if (!response.ok) throw new ServiceError(`HTTP ${response.status}`);
  return response.json();
}

/**
 * US places matching a city name or ZIP code (req. 2).
 * Returns [{ name: "Austin, TX", lat, lon }], possibly empty.
 */
export async function searchPlaces(query) {
  const params = new URLSearchParams({
    name: query.trim(), count: '10', language: 'en', format: 'json', countryCode: 'US',
  });
  const data = await getJson(`${GEOCODE_URL}?${params}`);
  const seen = new Set();
  const isZip = /^\d{5}$/.test(query.trim());
  const text = query.trim().toLowerCase();
  return (data.results || [])
    .filter(r => r.country_code === 'US')
    // Open-Meteo also matches alternate names (e.g. "Austin" -> Ardmore, TN); keep only names
    // that contain the search text. ZIP searches match by postcode, so they're kept as-is.
    .filter(r => isZip || r.name.toLowerCase().includes(text))
    .map(r => ({
      name: [r.name, stateCode(r.admin1)].filter(Boolean).join(', '),
      lat: roundCoord(r.latitude),
      lon: roundCoord(r.longitude),
    }))
    // Some searches return the same city twice (e.g. city and its county seat entry)
    .filter(p => !seen.has(p.name) && seen.add(p.name));
}

/**
 * Names rounded device coordinates as "City, ST" (req. 3).
 * Returns null when the point is outside the US.
 */
export async function nameFromCoords(lat, lon) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: 'en' });
  const data = await getJson(`${REVERSE_URL}?${params}`);
  if (data.countryCode !== 'US') return null;
  // Outside city limits, `city` holds a census area name (e.g. "Northeast Travis") that isn't
  // one of the administrative areas; show the county instead (Developer, 2026-10-11).
  // Real cities sit at different admin levels (NYC 5, Chicago 8), so match by name, not level.
  const admin = data.localityInfo?.administrative || [];
  const isRealCity = data.city && admin.some(a => a.name === data.city);
  const county = admin.find(a => a.adminLevel === 6)?.name;
  const city = (isRealCity ? data.city : county) || data.city || data.locality;
  const st = (data.principalSubdivisionCode || '').replace('US-', '') || stateCode(data.principalSubdivision);
  return [city, st].filter(Boolean).join(', ');
}

/** One forecast request per location: current conditions plus 7 days hourly, °F, local time (req. 1). */
export async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,weather_code',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,uv_index,weather_code',
    temperature_unit: 'fahrenheit',
    timezone: 'auto',
    forecast_days: '7',
  });
  return getJson(`${FORECAST_URL}?${params}`);
}

/** Browser location, requested only when called (req. 3). Rejects with the GeolocationPositionError. */
export function deviceCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 'unsupported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: roundCoord(pos.coords.latitude), lon: roundCoord(pos.coords.longitude) }),
      reject,
      { timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
