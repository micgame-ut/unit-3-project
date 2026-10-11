// Recommendation rules: out window, category, reminders, and window icon.
// Pure functions with no DOM or network access, so tests.html can check them directly.
// Thresholds come from research.md (Recommendation categories, Reminders).

export const LAST_DATE_INDEX = 6; // today + 6 days (req. 5)

// ---------- Out window ----------
// A window is { start, end } in whole local hours (0-23). end is exclusive.
// end <= start means the window crosses midnight (e.g. 20 -> 2 is 8pm-2am),
// and end === 0 means midnight.

/** Number of hours in a window (1-24). */
export function windowLength({ start, end }) {
  return ((end - start + 24) % 24) || 24;
}

/** Default for today: current hour to the next 6-hour mark (12am, 6am, 12pm, 6pm). */
export function todayDefaultWindow(nowHour) {
  const nextMark = (Math.floor(nowHour / 6) + 1) * 6; // 7pm (19) -> 24
  return { start: nowHour, end: nextMark % 24 };
}

export const FORECAST_DEFAULT_WINDOW = { start: 7, end: 19 };

/**
 * The window actually used for a date.
 * usual: the User's saved window, or null for the defaults.
 * On today, hours already passed are trimmed; if the whole usual window
 * has passed, today falls back to the 6-hour-mark default.
 * On the last date, a window crossing midnight is cut off at midnight.
 */
export function effectiveWindow({ usual, dateIndex, nowHour }) {
  let win;
  if (dateIndex === 0) {
    if (!usual) {
      win = todayDefaultWindow(nowHour);
    } else {
      const absEnd = usual.start + windowLength(usual); // may exceed 24 if crossing midnight
      if (nowHour >= absEnd) win = todayDefaultWindow(nowHour);           // all passed
      else if (nowHour > usual.start) win = { start: nowHour, end: usual.end }; // trim
      else win = { ...usual };
    }
  } else {
    win = usual ? { ...usual } : { ...FORECAST_DEFAULT_WINDOW };
  }

  const crosses = win.end !== 0 && win.end <= win.start;
  if (dateIndex === LAST_DATE_INDEX && crosses) win.end = 0;
  return win;
}

/** "3pm", "12am", "12pm" */
export function hourLabel(hour) {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? 'am' : 'pm';
  return `${h % 12 === 0 ? 12 : h % 12}${suffix}`;
}

export function windowLabel(win) {
  return `${hourLabel(win.start)}–${hourLabel(win.end)}`;
}

// ---------- Selecting hours from the forecast ----------

/**
 * Hourly rows inside the window for a date.
 * hourly: Open-Meteo `hourly` object (arrays keyed by variable, `time` as local "YYYY-MM-DDTHH:00").
 * date: "YYYY-MM-DD" of the selected date. Hours after midnight continue into the next
 * day's entries; the slice stops at the end of the data (the last date's cut-off).
 */
export function hoursInWindow(hourly, date, win) {
  const startTime = `${date}T${String(win.start).padStart(2, '0')}:00`;
  const first = hourly.time.indexOf(startTime);
  if (first === -1) return [];
  const last = Math.min(first + windowLength(win), hourly.time.length);

  const rows = [];
  for (let i = first; i < last; i++) {
    rows.push({
      time: hourly.time[i],
      // Rounded before the rules run, so the numbers shown always agree with the category.
      apparent: round(hourly.apparent_temperature[i]),
      temp: round(hourly.temperature_2m[i]),
      rain: round(hourly.precipitation_probability[i]),
      uv: round(hourly.uv_index[i]),
      code: hourly.weather_code[i],
    });
  }
  return rows;
}

function round(v) {
  return v == null ? null : Math.round(v);
}

/** True when any value the rules need is missing (drives the missing-data state). */
export function hasMissingData(rows) {
  return rows.length === 0 || rows.some(r =>
    r.apparent == null || r.temp == null || r.rain == null || r.uv == null || r.code == null);
}

// ---------- Category and reminders ----------

export const CATEGORIES = ['hot', 'warm', 'mild', 'cool', 'cold'];

/** Category from the max apparent temperature in the window (research.md bands). */
export function categoryFor(maxApparent) {
  if (maxApparent >= 90) return 'hot';  // NWS Extreme Caution
  if (maxApparent >= 75) return 'warm';
  if (maxApparent >= 60) return 'mild';
  if (maxApparent >= 45) return 'cool';
  return 'cold';
}

/** Summary of the window: feels-like high/low, highest rain chance, highest UV. */
export function summarize(rows) {
  const apparent = rows.map(r => r.apparent);
  return {
    feelsHigh: Math.max(...apparent),
    feelsLow: Math.min(...apparent),
    rainMax: Math.max(...rows.map(r => r.rain)),
    uvMax: Math.max(...rows.map(r => r.uv)),
    tempMin: Math.min(...rows.map(r => r.temp)),
  };
}

export const REMINDER_TYPES = ['umbrella', 'sunscreen', 'hydration', 'bundleUp', 'swing'];

/** Each reminder checked independently; any number can apply (research.md). */
export function remindersFor(summary) {
  const active = [];
  if (summary.rainMax >= 40) active.push('umbrella');                     // design judgment
  if (summary.uvMax >= 3) active.push('sunscreen');                       // EPA
  if (summary.feelsHigh >= 90) active.push('hydration');                  // NWS + CDC
  if (summary.tempMin <= 32) active.push('bundleUp');                     // NWS / CDC
  if (summary.feelsHigh - summary.feelsLow >= 20) active.push('swing');   // design judgment
  return active;
}

// ---------- Window icon ----------

// Ordered most to least severe; ties in the most-common count go to the earlier one.
export const ICON_SEVERITY = ['storm', 'snow', 'rain', 'fog', 'cloudy', 'partly', 'clear'];

/** WMO weather code (Open-Meteo) -> one of the 7 icons. */
export function iconForCode(code) {
  if (code >= 95) return 'storm';                                  // thunderstorm
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'; // drizzle, rain, showers
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'cloudy';
  if (code === 2) return 'partly';
  return 'clear';                                                  // 0 clear, 1 mainly clear
}

/** Most common icon across the window's hours; ties go to the more severe icon. */
export function windowIcon(rows) {
  const counts = {};
  for (const r of rows) {
    const icon = iconForCode(r.code);
    counts[icon] = (counts[icon] || 0) + 1;
  }
  let best = null;
  for (const icon of ICON_SEVERITY) {
    if (counts[icon] && (best === null || counts[icon] > counts[best])) best = icon;
  }
  return best;
}
