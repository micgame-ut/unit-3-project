// Browser tests for rules.js. Open tests.html through the local server.
// Cases follow the acceptance checks in spec.md (req. 8 and 10).

import {
  todayDefaultWindow, effectiveWindow, windowLabel, windowLength,
  hoursInWindow, hasMissingData, categoryFor, summarize, remindersFor,
  iconForCode, windowIcon,
} from './rules.js';
import { newPicks, picksFor, withoutPastDates } from './variation.js';
import { buildState, sampleState, forecastDates } from './state.js';

const results = [];
function check(name, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual, expected });
}

// ---------- Out window defaults (req. 10) ----------
check('today default at 1am is 1am–6am', windowLabel(todayDefaultWindow(1)), '1am–6am');
check('today default at 7:15pm is 7pm–12am', windowLabel(todayDefaultWindow(19)), '7pm–12am');
check('today default at 5:40am is 5am–6am', windowLabel(todayDefaultWindow(5)), '5am–6am');
check('today default at 12pm is 12pm–6pm', windowLabel(todayDefaultWindow(12)), '12pm–6pm');
check('today default at 11pm is 11pm–12am', windowLabel(todayDefaultWindow(23)), '11pm–12am');
check('forecast date default is 7am–7pm',
  windowLabel(effectiveWindow({ usual: null, dateIndex: 2, nowHour: 15 })), '7am–7pm');

// ---------- Saved usual window ----------
const nineToFive = { start: 9, end: 17 };
check('usual 9am–5pm at 3pm today trims to 3pm–5pm',
  windowLabel(effectiveWindow({ usual: nineToFive, dateIndex: 0, nowHour: 15 })), '3pm–5pm');
check('usual 9am–5pm at 8am today stays 9am–5pm',
  windowLabel(effectiveWindow({ usual: nineToFive, dateIndex: 0, nowHour: 8 })), '9am–5pm');
check('usual 9am–5pm after 5pm today falls back to default',
  windowLabel(effectiveWindow({ usual: nineToFive, dateIndex: 0, nowHour: 19 })), '7pm–12am');
check('usual 9am–5pm applies to a forecast date unchanged',
  windowLabel(effectiveWindow({ usual: nineToFive, dateIndex: 3, nowHour: 19 })), '9am–5pm');

// ---------- Crossing midnight ----------
const night = { start: 20, end: 2 };
check('8pm–2am is 6 hours long', windowLength(night), 6);
check('usual 8pm–2am at 11pm today trims to 11pm–2am',
  windowLabel(effectiveWindow({ usual: night, dateIndex: 0, nowHour: 23 })), '11pm–2am');
check('8pm–2am on the 7th date is cut to 8pm–12am',
  windowLabel(effectiveWindow({ usual: night, dateIndex: 6, nowHour: 10 })), '8pm–12am');
check('8pm–2am on the 6th date is not cut',
  windowLabel(effectiveWindow({ usual: night, dateIndex: 5, nowHour: 10 })), '8pm–2am');

// Fake 2-day hourly forecast: hour h of day d has apparent temp 50 + h, rain = d*10.
function fakeHourly(days) {
  const h = { time: [], apparent_temperature: [], temperature_2m: [],
    precipitation_probability: [], uv_index: [], weather_code: [] };
  for (let d = 0; d < days; d++) {
    for (let hr = 0; hr < 24; hr++) {
      h.time.push(`2026-10-1${1 + d}T${String(hr).padStart(2, '0')}:00`);
      h.apparent_temperature.push(50 + hr + 0.4);
      h.temperature_2m.push(48 + hr);
      h.precipitation_probability.push(d * 10);
      h.uv_index.push(hr >= 10 && hr <= 15 ? 5.6 : 0);
      h.weather_code.push(0);
    }
  }
  return h;
}
const hourly = fakeHourly(2);

const nightRows = hoursInWindow(hourly, '2026-10-11', night);
check('8pm–2am uses the next day\'s hours after midnight',
  nightRows.map(r => r.time.slice(5)), ['10-11T20:00', '10-11T21:00', '10-11T22:00', '10-11T23:00', '10-12T00:00', '10-12T01:00']);
check('window on the last day of data stops at the end of the data',
  hoursInWindow(hourly, '2026-10-12', { start: 22, end: 2 }).length, 2);
check('3pm–6pm covers 3 hours (end exclusive)',
  hoursInWindow(hourly, '2026-10-11', { start: 15, end: 18 }).map(r => r.time.slice(11)), ['15:00', '16:00', '17:00']);
check('values are rounded before rules (50.4 -> 50)',
  hoursInWindow(hourly, '2026-10-11', { start: 0, end: 1 })[0].apparent, 50);
check('a missing date returns no hours', hoursInWindow(hourly, '2026-10-20', night), []);
check('no hours counts as missing data', hasMissingData([]), true);
check('a null value counts as missing data',
  hasMissingData([{ apparent: 70, temp: 68, rain: null, uv: 1, code: 0 }]), true);

// ---------- Category boundaries (req. 8) ----------
check('max feels-like 90 → hot', categoryFor(90), 'hot');
check('max feels-like 89 → warm', categoryFor(89), 'warm');
check('max feels-like 75 → warm', categoryFor(75), 'warm');
check('max feels-like 74 → mild', categoryFor(74), 'mild');
check('max feels-like 60 → mild', categoryFor(60), 'mild');
check('max feels-like 59 → cool', categoryFor(59), 'cool');
check('max feels-like 45 → cool', categoryFor(45), 'cool');
check('max feels-like 44 → cold', categoryFor(44), 'cold');

// ---------- Reminder boundaries ----------
const base = { feelsHigh: 70, feelsLow: 65, rainMax: 0, uvMax: 0, tempMin: 60 };
check('rain chance 39% → no umbrella', remindersFor({ ...base, rainMax: 39 }), []);
check('rain chance 40% → umbrella', remindersFor({ ...base, rainMax: 40 }), ['umbrella']);
check('UV 2 → no sunscreen', remindersFor({ ...base, uvMax: 2 }), []);
check('UV 3 → sunscreen', remindersFor({ ...base, uvMax: 3 }), ['sunscreen']);
check('feels-like 89 → no hydration', remindersFor({ ...base, feelsHigh: 89, feelsLow: 80 }), []);
check('feels-like 90 → hydration', remindersFor({ ...base, feelsHigh: 90, feelsLow: 80 }), ['hydration']);
check('temp 33 → no bundle up', remindersFor({ ...base, tempMin: 33 }), []);
check('temp 32 → bundle up', remindersFor({ ...base, tempMin: 32 }), ['bundleUp']);
check('swing 19 → no swing', remindersFor({ ...base, feelsHigh: 79, feelsLow: 60 }), []);
check('swing 20 → swing', remindersFor({ ...base, feelsHigh: 80, feelsLow: 60 }), ['swing']);
check('several reminders apply together',
  remindersFor({ feelsHigh: 95, feelsLow: 72, rainMax: 50, uvMax: 8, tempMin: 70 }),
  ['umbrella', 'sunscreen', 'hydration', 'swing']);
check('summary of 10am–4pm fake hours',
  summarize(hoursInWindow(hourly, '2026-10-12', { start: 10, end: 16 })),
  { feelsHigh: 65, feelsLow: 60, rainMax: 10, uvMax: 6, tempMin: 58 });

// ---------- Window icon ----------
check('code 0 → clear', iconForCode(0), 'clear');
check('code 2 → partly', iconForCode(2), 'partly');
check('code 3 → cloudy', iconForCode(3), 'cloudy');
check('code 45 → fog', iconForCode(45), 'fog');
check('code 61 → rain', iconForCode(61), 'rain');
check('code 81 → rain (showers)', iconForCode(81), 'rain');
check('code 73 → snow', iconForCode(73), 'snow');
check('code 95 → storm', iconForCode(95), 'storm');
const rows = codes => codes.map(code => ({ code }));
check('most common icon wins', windowIcon(rows([0, 0, 0, 61])), 'clear');
check('tie goes to the more severe icon', windowIcon(rows([0, 0, 61, 61])), 'rain');
check('three-way tie goes to storm', windowIcon(rows([0, 95, 3])), 'storm');

// ---------- Variation picks (Content variation) ----------
// Feeds a fixed sequence instead of Math.random: 0 -> 1, 0.4 -> 2, 0.9 -> 3.
const sequence = values => { let i = 0; return () => values[i++ % values.length]; };

const first = picksFor({}, '2026-10-12', sequence([0.9, 0, 0.4, 0.9, 0, 0.4]));
check('new date gets an outfit and 5 wordings',
  first.picks, { outfit: 3, wording: { umbrella: 1, sunscreen: 2, hydration: 3, bundleUp: 1, swing: 2 } });
check('new picks are marked changed (to be saved)', first.changed, true);
const again = picksFor(first.all, '2026-10-12', sequence([0, 0, 0, 0, 0, 0]));
check('returning to a date gives the same picks', again.picks, first.picks);
check('returning to a date does not change storage', again.changed, false);
check('outfit and wordings drawn independently (outfit 3 with wording 1)',
  [first.picks.outfit, first.picks.wording.umbrella], [3, 1]);

let distinct = new Set();
for (let i = 0; i < 200; i++) distinct.add(JSON.stringify(newPicks()));
check('random picks vary across many dates (more than 20 distinct combos in 200)', distinct.size > 20, true);

const stored = { '2026-10-10': first.picks, '2026-10-11': first.picks, '2026-10-12': first.picks };
check('past dates are dropped on load',
  Object.keys(withoutPastDates(stored, '2026-10-11').all), ['2026-10-11', '2026-10-12']);
check('nothing to drop reports unchanged',
  withoutPastDates({ '2026-10-12': first.picks }, '2026-10-11').changed, false);

// ---------- Recommendation state ----------
// 7-day fake forecast; "now" is 3pm on day 1. Day 1 afternoons are hot and rainy.
function fakeForecast() {
  const hourly = { time: [], apparent_temperature: [], temperature_2m: [],
    precipitation_probability: [], uv_index: [], weather_code: [] };
  for (let d = 0; d < 7; d++) {
    for (let hr = 0; hr < 24; hr++) {
      hourly.time.push(`2026-10-${String(11 + d).padStart(2, '0')}T${String(hr).padStart(2, '0')}:00`);
      hourly.apparent_temperature.push(d === 0 ? 70 + hr : 40);
      hourly.temperature_2m.push(d === 0 ? 68 + hr : 38);
      hourly.precipitation_probability.push(d === 0 && hr === 16 ? 60 : 0);
      hourly.uv_index.push(d === 0 && hr < 17 ? 7 : 0);
      hourly.weather_code.push(d === 0 && hr === 16 ? 61 : 0);
    }
  }
  return { current: { time: '2026-10-11T15:00', temperature_2m: 84, apparent_temperature: 86.4, weather_code: 2 }, hourly };
}
const fc = fakeForecast();
const austinLoc = { name: 'Austin, TX', lat: 30.27, lon: -97.74 };
const picks = { outfit: 2, wording: { umbrella: 3, sunscreen: 1, hydration: 2, bundleUp: 1, swing: 1 } };
const today = buildState({ location: austinLoc, forecast: fc, dateIndex: 0, usualWindow: null, picks });

check('forecast has 7 dates', forecastDates(fc).length, 7);
check('today window at 3pm is 3pm–6pm', today.windowText, '3pm–6pm');
check('today shows a Now line', today.now, { temp: 84, feels: 86, icon: 'partly', word: 'Partly cloudy' });
check('window max feels-like 87 → warm', today.category, 'warm');
check('outfit follows category + picked number', today.outfit.id, 'warm-2');
check('character and fit images are the same outfit',
  [today.outfit.character, today.outfit.fit], ['img/warm-2-character.jpg', 'img/warm-2-fit.jpg']);
check('alt text names the category and outfit', today.outfit.alt.includes('warm weather') && today.outfit.alt.includes('denim overshirt'), true);
check('reminders use the picked wordings',
  today.reminders.map(r => [r.type, r.text]),
  [['umbrella', "Don't get caught in the rain. Grab an umbrella."],
   ['sunscreen', 'UV is up today. Put on sunscreen before you head out.']]);
check('window icon: 2 clear hours vs 1 rain → clear', today.icon, 'clear');
check('summary text uses the same window and category',
  today.summaryText.startsWith("It'll feel like 85–87°F while you're out (3pm–6pm), so it's a warm day."), true);

const later = buildState({ location: austinLoc, forecast: fc, dateIndex: 3, usualWindow: null, picks });
check('forecast date has no Now line', later.now, null);
check('forecast date uses 7am–7pm and its own weather', [later.windowText, later.category], ['7am–7pm', 'cold']);
check('same outfit number carries to the new category', later.outfit.id, 'cold-2');
check('Cold outfit uses its own images', [later.outfit.character, later.outfit.fit],
  ['img/cold-2-character.jpg', 'img/cold-2-fit.jpg']);

const swingFc = fakeForecast();
swingFc.hourly.apparent_temperature[15] = 60; // 3pm feels 60, 10pm feels 92: a 32° swing, Hot
const swingState = buildState({ location: austinLoc, forecast: swingFc, dateIndex: 0, usualWindow: { start: 15, end: 23 }, picks });
check('swing wording names the outfit layer (Hot 2 linen shirt)',
  swingState.reminders.find(r => r.type === 'swing')?.text, 'Big temperature swing today. Wear your linen shirt and take it off when it warms up.');

const broken = fakeForecast();
broken.hourly.apparent_temperature[16] = null;
check('a null hour in the window gives the missing-data state',
  buildState({ location: austinLoc, forecast: broken, dateIndex: 0, usualWindow: null, picks }).missing, true);
check('sample state is Warm 1 with no weather', [sampleState().isSample, sampleState().outfit.id, sampleState().summaryText], [true, 'warm-1', '']);

// ---------- Report ----------
const failed = results.filter(r => !r.pass);
document.getElementById('summary').textContent =
  `${results.length - failed.length} of ${results.length} passed` + (failed.length ? ` — ${failed.length} failed` : '');
document.getElementById('results').innerHTML = results.map(r =>
  `<li class="${r.pass ? 'pass' : 'fail'}">${r.name}${r.pass ? '' :
    ` — got ${JSON.stringify(r.actual)}, expected ${JSON.stringify(r.expected)}`}</li>`).join('');
console.info(`[tests] ${results.length - failed.length}/${results.length} passed`, failed);
