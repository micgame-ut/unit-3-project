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

/** Outfit details for a category and outfit number (1-3). */
export function outfit(category, number) {
  const { look, layer } = OUTFITS[category][number - 1];
  const img = `${category}-${number}`;
  return {
    id: img,
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

// Full-screen backgrounds, one per window icon (Developer, 2026-10-11).
// Photos from Wikimedia Commons, licenses checked there on 2026-10-11; candidates kept in
// reference/background-candidates.html. CC BY photos must be credited on the info screen.
export const BACKGROUNDS = {
  clear: { file: 'img/bg/clear.jpg', title: 'Georgia College and State University south campus (2023)', creator: 'Motorblade7', license: 'CC0', url: 'https://commons.wikimedia.org/w/index.php?curid=141397578' },
  partly: { file: 'img/bg/partly.jpg', title: 'Clouds over Lyman Hall, Syracuse University (2014)', creator: 'Michael Scialdone', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/w/index.php?curid=157896639' },
  cloudy: { file: 'img/bg/cloudy.jpg', title: '500px photo (128017399)', creator: 'Willem V', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:500px_photo_(128017399).jpeg' },
  fog: { file: 'img/bg/fog.jpg', title: 'Fog on Campus', creator: 'Dennis Sylvester Hurd', license: 'CC0', url: 'https://commons.wikimedia.org/w/index.php?curid=87618285' },
  rain: { file: 'img/bg/rain.jpg', title: 'Cornell rainy north campus from bridge', creator: 'Notyourbroom', license: 'CC BY 3.0', url: 'https://commons.wikimedia.org/w/index.php?curid=5955003' },
  storm: { file: 'img/bg/storm.jpg', title: 'Hailstone-generating storm system (4 July 2010)', creator: 'James St. John', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/w/index.php?curid=153990871' },
  snow: { file: 'img/bg/snow.jpg', title: 'Rutgers University snow in February', creator: 'Tomwsulcer', license: 'CC0', url: 'https://commons.wikimedia.org/w/index.php?curid=31298044' },
};

/** Animated icon path, or the still version for reduced motion / paused. */
export function iconPath(file, still) {
  return still ? `art/icons/static/${file}.svg` : `art/icons/${file}.svg`;
}
