// Content tables: outfits, reminder wordings, and icon files.
// Outfits and wordings follow spec.md, Content variation.

export const CATEGORY_LABELS = { hot: 'Hot', warm: 'Warm', mild: 'Mild', cool: 'Cool', cold: 'Cold' };

// 3 outfits per category. `layer` is the removable outer layer named by the swing reminder.
export const OUTFITS = {
  hot: [
    { look: 'a cream ribbed tank under an open palm-print camp-collar shirt, khaki shorts, brown slides, and a red cap', layer: 'camp shirt' },
    { look: 'a white tee under an open white linen shirt, navy shorts, tan strap sandals, and a tan cap', layer: 'linen shirt' },
    { look: 'a gray ribbed tank under an open pastel-striped camp-collar shirt, olive shorts, brown sandals, and a navy cap', layer: 'striped shirt' },
  ],
  warm: [
    { look: 'a white tee under an open sage-green short-sleeve button-up, beige chino shorts, and white sneakers', layer: 'button-up' },
    { look: 'a navy-and-white striped tee under an open light-wash denim overshirt, khaki chinos, and off-white canvas sneakers', layer: 'denim overshirt' },
    { look: 'a heather-gray tee under an open rust-orange short-sleeve button-up, navy chino shorts, and white sneakers', layer: 'button-up' },
  ],
  mild: [
    { look: 'a white tee under an open red-and-black buffalo-plaid flannel, medium-wash jeans, and white sneakers', layer: 'flannel' },
    { look: 'a heather-gray long-sleeve tee under an open olive shacket, dark-wash jeans, and tan suede sneakers', layer: 'shacket' },
    { look: 'a black tee under a light-wash denim jacket, khaki cargo pants, and gray sneakers', layer: 'denim jacket' },
  ],
  cool: [
    { look: 'a gray hoodie under a navy bomber, dark-wash jeans, white sneakers, and a charcoal beanie', layer: 'bomber' },
    { look: 'an oatmeal hoodie under a brown chore coat, black jeans, brown leather boots, and a mustard beanie', layer: 'chore coat' },
    { look: 'a burgundy hoodie under a black bomber, light-wash jeans, gray high-tops, and a navy beanie', layer: 'bomber' },
  ],
  cold: [
    { look: 'a gray sweater under a navy puffer, dark jeans, brown water-resistant boots, a red knit hat, gray gloves, and a red scarf', layer: 'puffer' },
    { look: 'a cream cable-knit sweater under a long olive parka, black jeans, black waterproof boots, a gray pom beanie, black gloves, and a plaid scarf', layer: 'parka' },
    { look: 'a maroon hoodie under a black puffer, medium-wash jeans, tan duck boots, a navy beanie, navy gloves, and a mustard scarf', layer: 'puffer' },
  ],
};

// Images made so far (plan.md, Missing art). Until the rest exist, a missing outfit
// borrows the first existing image in its category, or Cool 1 for Cold.
// Remove this fallback once all 15 outfits have art (checkpoint 11).
const MADE = new Set(['hot-1', 'hot-2', 'hot-3', 'warm-1', 'warm-2', 'warm-3',
  'mild-1', 'mild-2', 'mild-3', 'cool-1', 'cool-2']);

function imageId(category, number) {
  const id = `${category}-${number}`;
  if (MADE.has(id)) return id;
  const sibling = [1, 2, 3].map(n => `${category}-${n}`).find(x => MADE.has(x));
  return sibling || 'cool-1';
}

/** Outfit details for a category and outfit number (1-3). */
export function outfit(category, number) {
  const { look, layer } = OUTFITS[category][number - 1];
  const img = imageId(category, number);
  return {
    id: `${category}-${number}`,
    name: `${CATEGORY_LABELS[category]} ${number}`,
    look,
    layer,
    alt: `The character dressed for ${CATEGORY_LABELS[category].toLowerCase()} weather in ${look}.`,
    character: `img/${img}-character.jpg`,
    fit: `img/${img}-fit.jpg`,
  };
}

// 3 wordings per reminder. {layer} is replaced with the outfit's outer layer.
export const REMINDER_WORDINGS = {
  umbrella: [
    "Rain's in the forecast. Pack an umbrella.",
    "Good chance of rain while you're out. Bring an umbrella.",
    "Don't get caught in the rain. Grab an umbrella.",
  ],
  sunscreen: [
    'UV is up today. Put on sunscreen before you head out.',
    "Strong sun while you're out. Sunscreen's a good call.",
    'Sunscreen on: UV is high enough to burn.',
  ],
  hydration: [
    "It's going to be hot. Carry a water bottle and refill it.",
    'Stay hydrated: bring water and keep sipping.',
    "Heat's up. Keep a water bottle on you all day.",
  ],
  bundleUp: [
    'Freezing temps ahead. Cover up with a hat, gloves, and a scarf.',
    "It's below freezing out there. Don't skip the gloves and hat.",
    'Bundle up: hat, gloves, and scarf for the freeze.',
  ],
  swing: [
    'Big temperature swing today. Wear your {layer} and take it off when it warms up.',
    "It'll feel very different later. Your {layer} is easy to shed.",
    'Layer up: start with your {layer}, ditch it when it heats up.',
  ],
};

export const REMINDER_ICONS = {
  umbrella: 'umbrella', sunscreen: 'uv-index', hydration: 'raindrop',
  bundleUp: 'thermometer-colder', swing: 'thermometer-warmer',
};

// Window icon key -> Meteocons Fill file name and the word shown with it.
export const WEATHER_ICONS = {
  clear: { file: 'clear-day', word: 'Clear' },
  partly: { file: 'partly-cloudy-day', word: 'Partly cloudy' },
  cloudy: { file: 'overcast', word: 'Cloudy' },
  fog: { file: 'fog', word: 'Fog' },
  rain: { file: 'rain', word: 'Rain' },
  storm: { file: 'thunderstorms', word: 'Storms' },
  snow: { file: 'snow', word: 'Snow' },
};

/** Animated icon path, or the still version for reduced motion / paused. */
export function iconPath(file, still) {
  return still ? `art/icons/static/${file}.svg` : `art/icons/${file}.svg`;
}
