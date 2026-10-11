// Builds the one recommendation state (spec.md, Recommendation state and data flow).
// Every visual and written output renders from the object this returns.

import {
  effectiveWindow, windowLabel, hoursInWindow, hasMissingData,
  summarize, categoryFor, remindersFor, windowIcon, iconForCode,
} from './rules.js';
import { CATEGORY_LABELS, outfit, REMINDER_WORDINGS, REMINDER_ICONS, WEATHER_ICONS } from './content.js';

/** The 7 local dates ("YYYY-MM-DD") covered by a forecast, today first. */
export function forecastDates(forecast) {
  return [...new Set(forecast.hourly.time.map(t => t.slice(0, 10)))];
}

/** Location-local "now" from the forecast's current block. */
export function localNow(forecast) {
  const time = forecast.current.time; // "YYYY-MM-DDTHH:MM"
  return { date: time.slice(0, 10), hour: Number(time.slice(11, 13)) };
}

/**
 * location: { name, lat, lon }
 * forecast: Open-Meteo response
 * dateIndex: 0 (today) to 6
 * usualWindow: saved { start, end } or null
 * picks: { outfit, wording } for the selected date
 */
export function buildState({ location, forecast, dateIndex, usualWindow, picks }) {
  const dates = forecastDates(forecast);
  const date = dates[dateIndex];
  const now = localNow(forecast);
  const isToday = dateIndex === 0;
  const window = effectiveWindow({ usual: usualWindow, dateIndex, nowHour: now.hour });

  const rows = hoursInWindow(forecast.hourly, date, window);
  const base = { location, date, dateIndex, dates, window, windowText: windowLabel(window), isToday, isSample: false };

  const current = forecast.current;
  const nowLine = isToday && current?.temperature_2m != null ? {
    temp: Math.round(current.temperature_2m),
    feels: Math.round(current.apparent_temperature),
    icon: iconForCode(current.weather_code),
    word: WEATHER_ICONS[iconForCode(current.weather_code)].word,
  } : null;

  if (hasMissingData(rows)) return { ...base, missing: true, now: nowLine };

  const summary = summarize(rows);
  const category = categoryFor(summary.feelsHigh);
  const fit = outfit(category, picks.outfit);
  const reminders = remindersFor(summary).map(type => ({
    type,
    icon: REMINDER_ICONS[type],
    text: REMINDER_WORDINGS[type][picks.wording[type] - 1].replace('{layer}', fit.layer),
  }));

  return {
    ...base,
    missing: false,
    now: nowLine,
    forecast: summary,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    outfit: fit,
    icon: windowIcon(rows),
    reminders,
    summaryText: summaryText(category, fit, summary, window),
  };
}

/** Written recommendation, built from the same category, outfit, and window as everything else. */
function summaryText(category, fit, summary, window) {
  const feels = summary.feelsLow === summary.feelsHigh
    ? `${summary.feelsHigh}°F`
    : `${summary.feelsLow}–${summary.feelsHigh}°F`;
  return `It'll feel like ${feels} while you're out (${windowLabel(window)}), so it's a ${CATEGORY_LABELS[category].toLowerCase()} day. Wear ${fit.look}.`;
}

/** First visit or location denied: the Warm sample fit with no weather values. */
export function sampleState() {
  return {
    isSample: true,
    missing: false,
    category: 'warm',
    categoryLabel: CATEGORY_LABELS.warm,
    outfit: outfit('warm', 1),
    reminders: [],
    summaryText: '',
  };
}
