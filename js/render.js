// Draws every main-screen output from the one recommendation state (req. 7).
// Nothing here reads weather data directly; it only reads `state`.

import { WEATHER_ICONS, iconPath } from './content.js';

const $ = id => document.getElementById(id);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Icons are still when the User paused them or prefers reduced motion (req. 16). */
export function iconsStill(paused) {
  return paused || reducedMotion.matches;
}

function dayParts(date, isToday) {
  // Noon avoids any time-zone edge turning the date into the previous day
  const d = new Date(`${date}T12:00:00`);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { weekday, line: isToday ? `Today · ${monthDay}` : monthDay };
}

export function render(state, { paused = false } = {}) {
  const still = iconsStill(paused);

  // Character card and sample label
  const img = $('character-img');
  img.src = state.outfit.character;
  img.alt = state.outfit.alt;
  $('sample-label').hidden = !state.isSample;

  // Pause control only matters when icons can move
  const pauseBtn = $('pause-btn');
  pauseBtn.hidden = reducedMotion.matches;
  pauseBtn.setAttribute('aria-pressed', String(paused));

  const hasWeather = !state.isSample && !state.missing;

  // Frosted icon card: window weather icon and category
  $('icon-card').hidden = !hasWeather;
  if (hasWeather) {
    const icon = WEATHER_ICONS[state.icon];
    $('weather-icon').src = iconPath(icon.file, still);
    $('icon-word').textContent = icon.word;
    $('icon-category').textContent = `${state.categoryLabel} fit`;
  }

  // Day
  if (state.isSample) {
    $('day-name').textContent = 'Fit Check Weather';
    $('day-date').textContent = '';
  } else {
    const day = dayParts(state.date, state.isToday);
    $('day-name').textContent = day.weekday;
    $('day-date').textContent = day.line;
  }

  // Weather summary: "Now" (today only) and "Forecast [hours]" (req. 6)
  $('weather-box').hidden = state.isSample;
  if (!state.isSample) {
    $('now-line').hidden = !state.now;
    if (state.now) {
      const nowIcon = WEATHER_ICONS[state.now.icon];
      $('now-icon').src = iconPath(nowIcon.file, still);
      $('now-text').textContent = `${state.now.temp}°F, feels ${state.now.feels}°F · ${state.now.word}`;
    }
    $('forecast-label').textContent = `Forecast ${state.windowText}`;
    $('forecast-text').textContent = state.missing
      ? 'Some forecast data is missing for these hours.'
      : `Feels ${state.forecast.feelsLow}–${state.forecast.feelsHigh}°F · Rain ${state.forecast.rainMax}% · UV ${state.forecast.uvMax}`;
  }

  // Written recommendation and reminders
  $('summary-text').textContent = state.summaryText || '';
  $('reminder-list').replaceChildren(...(state.reminders || []).map(reminder => {
    const li = document.createElement('li');
    const icon = document.createElement('img');
    icon.src = iconPath(reminder.icon, still);
    icon.alt = '';
    icon.width = 40;
    icon.height = 40;
    const text = document.createElement('span');
    text.textContent = reminder.text;
    li.append(icon, text);
    return li;
  }));

  // Screen-reader announcement of the new recommendation
  $('announcer').textContent = hasWeather
    ? `${state.categoryLabel} fit for ${dayParts(state.date, state.isToday).weekday}, ${state.windowText}. ` +
      `${state.reminders.length} reminder${state.reminders.length === 1 ? '' : 's'}.`
    : '';
}

/** Re-renders when the system reduced-motion setting changes. */
export function onMotionPreferenceChange(callback) {
  reducedMotion.addEventListener('change', callback);
}
