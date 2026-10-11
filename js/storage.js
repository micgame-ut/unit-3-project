// The only localStorage access in the app (req. 17: last location, per-date picks, usual window).
// Wrapped in try/catch because storage can be blocked or unavailable (private windows, settings).

const PREFIX = 'fcw.';
export const KEYS = { location: 'location', picks: 'picks', window: 'window' };

export function load(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the app still works, it just won't remember.
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
