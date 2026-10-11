// Per-date variation picks (spec.md, Content variation).
// For each date, one outfit number and one wording number per reminder type are drawn
// independently at random, then saved so returning to the date shows the same ones.
// Picks belong to the date only, not the location or window.

import { REMINDER_TYPES } from './rules.js';

const pickOneToThree = random => 1 + Math.floor(random() * 3);

/** New picks for one date. `random` is injectable so tests can control it. */
export function newPicks(random = Math.random) {
  const outfit = pickOneToThree(random);
  const wording = {};
  for (const type of REMINDER_TYPES) wording[type] = pickOneToThree(random);
  return { outfit, wording };
}

/**
 * Returns the picks for `date` ("YYYY-MM-DD") from `all` (the saved object),
 * creating and adding them if missing. Returns { picks, all, changed }.
 */
export function picksFor(all, date, random = Math.random) {
  const saved = all?.[date];
  if (saved) return { picks: saved, all, changed: false };
  const picks = newPicks(random);
  return { picks, all: { ...(all || {}), [date]: picks }, changed: true };
}

/** Drops picks for dates before `today` ("YYYY-MM-DD"). Returns { all, changed }. */
export function withoutPastDates(all, today) {
  if (!all) return { all: {}, changed: false };
  const kept = Object.fromEntries(Object.entries(all).filter(([date]) => date >= today));
  return { all: kept, changed: Object.keys(kept).length !== Object.keys(all).length };
}
