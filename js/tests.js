// Browser tests for rules.js. Open tests.html through the local server.
// Cases follow the acceptance checks in spec.md (req. 8 and 10).

import {
  todayDefaultWindow, effectiveWindow, windowLabel, windowLength,
  hoursInWindow, hasMissingData, categoryFor, summarize, remindersFor,
  iconForCode, windowIcon,
} from './rules.js';

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

// ---------- Report ----------
const failed = results.filter(r => !r.pass);
document.getElementById('summary').textContent =
  `${results.length - failed.length} of ${results.length} passed` + (failed.length ? ` — ${failed.length} failed` : '');
document.getElementById('results').innerHTML = results.map(r =>
  `<li class="${r.pass ? 'pass' : 'fail'}">${r.name}${r.pass ? '' :
    ` — got ${JSON.stringify(r.actual)}, expected ${JSON.stringify(r.expected)}`}</li>`).join('');
console.info(`[tests] ${results.length - failed.length}/${results.length} passed`, failed);
