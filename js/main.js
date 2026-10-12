// Entry point: wires controls, storage, and screen states.
// Built up checkpoint by checkpoint (see plan.md).

import { searchPlaces, nameFromCoords, fetchForecast, deviceCoords, ServiceError } from './weather.js';
import * as storage from './storage.js';
import { picksFor, withoutPastDates } from './variation.js';
import { buildState, sampleState, forecastDates, localNow } from './state.js';
import { render, onMotionPreferenceChange } from './render.js';
import { hourLabel } from './rules.js';

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

// ---------- Loading and error states (req. 13) ----------
const status = {
  screen: document.getElementById('status-screen'),
  text: document.getElementById('status-text'),
  retry: document.getElementById('retry-btn'),
  today: document.getElementById('today-btn'),
  changeLocation: document.getElementById('change-location-btn'),
  main: document.getElementById('main-screen'),
};

/**
 * Shows the full-screen loading or error state in place of the main screen.
 * kind: 'loading' | 'error'. showToday adds "Back to today" (missing data on a later date).
 */
function showStatus(kind, message = 'Loading', { showToday = false } = {}) {
  status.screen.classList.toggle('is-loading', kind === 'loading');
  status.screen.classList.toggle('is-error', kind === 'error');
  status.text.textContent = message;
  status.retry.hidden = kind !== 'error';
  status.changeLocation.hidden = kind !== 'error';
  status.today.hidden = !showToday;
  status.main.hidden = true;
  status.screen.hidden = false;
  if (kind === 'error') status.retry.focus();
}

function hideStatus() {
  status.screen.hidden = true;
  status.main.hidden = false;
}

status.retry.addEventListener('click', () => {
  if (app.location) setLocation(app.location);
});
status.today.addEventListener('click', () => {
  app.dateIndex = 0;
  refresh();
});
// Leave the error screen to search somewhere else. The sample fit shows meanwhile,
// so no stale or missing weather is ever displayed.
status.changeLocation.addEventListener('click', () => {
  app.forecast = null;
  app.dateIndex = 0;
  refresh();
  el.searchInput.focus();
});

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

  // Missing data for these hours uses the error layout (spec.md, States)
  if (app.state.missing) {
    showStatus('error', 'Some forecast data is missing for these hours.', { showToday: app.dateIndex !== 0 });
  } else {
    hideStatus();
  }
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

  // Show the loading sun only if the request is slow, so fast loads don't flash
  const loadingTimer = setTimeout(() => showStatus('loading'), 250);
  try {
    app.forecast = await fetchForecast(place.lat, place.lon);
  } catch (err) {
    clearTimeout(loadingTimer);
    app.forecast = null;
    showStatus('error', navigator.onLine
      ? "The weather service isn't responding right now."
      : "You're offline. Connect to the internet to get the forecast.");
    console.warn('[app] forecast failed', err);
    return;
  }
  clearTimeout(loadingTimer);
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

// The pick list floats on laptop, so close it on Esc or a click outside the location area
function dismissPlaceList() {
  if (el.placeList.hidden) return;
  hidePlaceList();
  showMessage('');
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !el.placeList.hidden) {
    dismissPlaceList();
    el.searchInput.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.area-location')) dismissPlaceList();
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

// ---------- Date picker (req. 5) ----------
document.getElementById('date-list').addEventListener('click', event => {
  const button = event.target.closest('.date-btn');
  if (!button) return;
  app.dateIndex = Number(button.dataset.index);
  refresh();
  // Keep focus on the selected day after the buttons are redrawn
  document.querySelector(`.date-btn[data-index="${app.dateIndex}"]`)?.focus();
});

// ---------- Out window (req. 10): any change becomes the saved usual window ----------
const startSelect = document.getElementById('window-start');
const endSelect = document.getElementById('window-end');
for (const select of [startSelect, endSelect]) {
  for (let hour = 0; hour < 24; hour++) select.add(new Option(hourLabel(hour), String(hour)));
  select.addEventListener('change', () => {
    // Change only the field the User touched. The other comes from the saved usual window,
    // not from today's trimmed display (e.g. usual 9am–5pm shown as 3pm–5pm at 3pm).
    const base = app.usualWindow || app.state.window;
    let start = select === startSelect ? Number(startSelect.value) : base.start;
    let end = select === endSelect ? Number(endSelect.value) : base.end;
    // A window needs at least one hour; move whichever end wasn't just changed
    if (start === end) {
      if (select === startSelect) end = (start + 1) % 24;
      else start = (end + 23) % 24;
    }
    app.usualWindow = { start, end };
    storage.save(storage.KEYS.window, app.usualWindow);
    refresh();
  });
}

// ---------- See the fit (req. 11) ----------
const fitDialog = document.getElementById('fit-dialog');
document.getElementById('fit-btn').addEventListener('click', () => fitDialog.showModal());
document.getElementById('fit-close').addEventListener('click', () => fitDialog.close());
// A click on the dialog element itself (not its box) is a click on the backdrop
fitDialog.addEventListener('click', event => {
  if (event.target === fitDialog) fitDialog.close();
});
// Esc closes <dialog> natively

// ---------- Icon animation (req. 16) ----------
document.getElementById('pause-btn').addEventListener('click', () => {
  app.iconsPaused = !app.iconsPaused;
  draw();
});
onMotionPreferenceChange(draw);

// ---------- Start: restore the saved location (req. 4) ----------
const saved = storage.load(storage.KEYS.location);
if (saved) {
  // Start on the loading sun rather than flashing the empty main screen
  showStatus('loading');
  setLocation(saved);
} else {
  refresh();
}
