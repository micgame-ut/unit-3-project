// Entry point: wires controls, storage, and screen states.
// Built up checkpoint by checkpoint (see plan.md).

import { searchPlaces, nameFromCoords, fetchForecast, deviceCoords, ServiceError } from './weather.js';
import * as storage from './storage.js';
import { picksFor, withoutPastDates } from './variation.js';
import { buildState, sampleState, forecastDates, localNow } from './state.js';
import { render, onMotionPreferenceChange } from './render.js';

const app = {
  location: null,     // { name, lat, lon }
  forecast: null,     // Open-Meteo response for app.location
  dateIndex: 0,       // 0 = today ... 6
  usualWindow: storage.load(storage.KEYS.window), // saved { start, end } or null
  state: sampleState(),
  iconsPaused: false, // icon pause control (req. 16); not saved
};

const el = {
  locationName: document.getElementById('location-name'),
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  locateBtn: document.getElementById('locate-btn'),
  message: document.getElementById('location-message'),
  placeList: document.getElementById('place-list'),
};

function showMessage(text) {
  el.message.textContent = text;
}

/**
 * Rebuilds the recommendation state from the current selections and renders it.
 * Called after any change to location, date, or window (req. 7).
 */
function refresh() {
  if (!app.forecast) {
    app.state = sampleState();
  } else {
    const today = localNow(app.forecast).date;
    const date = forecastDates(app.forecast)[app.dateIndex];

    // Picks: drop past dates, then get (or create) this date's picks.
    const pruned = withoutPastDates(storage.load(storage.KEYS.picks), today);
    const result = picksFor(pruned.all, date);
    if (pruned.changed || result.changed) storage.save(storage.KEYS.picks, result.all);

    app.state = buildState({
      location: app.location, forecast: app.forecast,
      dateIndex: app.dateIndex, usualWindow: app.usualWindow, picks: result.picks,
    });
  }
  draw();
}

function draw() {
  render(app.state, { paused: app.iconsPaused });
}

function hidePlaceList() {
  el.placeList.hidden = true;
  el.placeList.replaceChildren();
}

/** Makes a place the current location: saves it and fetches its forecast once (data flow step 1). */
async function setLocation(place) {
  hidePlaceList();
  showMessage('');
  app.location = place;
  storage.save(storage.KEYS.location, place);
  el.locationName.textContent = place.name;
  try {
    app.forecast = await fetchForecast(place.lat, place.lon);
    console.info('[app] forecast loaded', place.name, app.forecast.timezone, app.forecast.hourly.time.length, 'hours');
  } catch (err) {
    app.forecast = null;
    showMessage("Weather service isn't responding. Try again in a minute.");
    console.warn('[app] forecast failed', err);
  }
  refresh();
}

// ---------- Manual search (req. 2) ----------
el.searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  const query = el.searchInput.value.trim();
  if (!query) return;
  hidePlaceList();
  showMessage('Searching…');
  let places;
  try {
    places = await searchPlaces(query);
  } catch (err) {
    showMessage(err instanceof ServiceError ? "Location search isn't responding. Try again in a minute." : 'Search failed.');
    return;
  }
  if (places.length === 0) {
    showMessage('No US location found');
  } else if (places.length === 1) {
    setLocation(places[0]);
  } else {
    showMessage('Pick your city:');
    el.placeList.replaceChildren(...places.map(place => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = place.name;
      button.addEventListener('click', () => setLocation(place));
      li.append(button);
      return li;
    }));
    el.placeList.hidden = false;
    el.placeList.querySelector('button').focus();
  }
});

// ---------- Device location (req. 3): only on tap ----------
el.locateBtn.addEventListener('click', async () => {
  hidePlaceList();
  showMessage('Finding you…');
  let coords;
  try {
    coords = await deviceCoords();
  } catch (err) {
    // 1 = PERMISSION_DENIED
    showMessage(err.code === 1
      ? 'Location is blocked. Search for your city instead.'
      : "Couldn't get your location. Search for your city instead.");
    return;
  }
  try {
    const name = await nameFromCoords(coords.lat, coords.lon);
    if (!name) {
      showMessage('No US location found');
      return;
    }
    setLocation({ name, ...coords });
  } catch {
    showMessage("Couldn't name your location. Search for your city instead.");
  }
});

// ---------- Icon animation (req. 16) ----------
document.getElementById('pause-btn').addEventListener('click', () => {
  app.iconsPaused = !app.iconsPaused;
  draw();
});
onMotionPreferenceChange(draw);

// ---------- Start: restore the saved location (req. 4) ----------
const saved = storage.load(storage.KEYS.location);
if (saved) setLocation(saved);
else refresh();
