# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Research your context of use, references, weather guidance, technical options, and choices that will guide the specification.

## Instructions for the Developer

Judge sources and recommendations, make the consequential decisions, and keep this file current as the work develops.

To begin, open the project repository in a fresh chat and enter:

`Read ./research.md and help me begin Project 3 research.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, and this file. Ask one focused question at a time. Help investigate and compare options without deciding for the Developer. Verify sources directly and keep this file concise.

## Context of use

As the User, describe when and where you would use the app and what you need from it. Record important circumstances, assumptions, and limitations.

I check the app on my phone in the morning before leaving for campus, often one-handed while getting ready or walking out the door. I'm outside a lot between classes (walking, waiting for buses), usually away from home for 8+ hours, so I need to dress for the whole day, not just the current temperature. Austin afternoons are much hotter than mornings, and summer and early fall bring high heat, strong UV and sudden storms. Sometimes I also check the night before on my laptop, or look ahead a few days before a trip or an outdoor event.

- **Assumptions:** US locations only; the User knows their city or ZIP; the User has a phone with location services, though they may deny permission.
- **Limitations:** forecasts beyond a few days are less reliable; clothing comfort is personal; the app gives suggestions, not safety advice.

## User story

Write at least one user story grounded in your context of use:

> As a [type of user], I want to [need or goal], so that [reason or outcome].

Focus on the need rather than prescribing an interface or feature.

1. As a college student who is out on campus all day, I want to know what to wear for the whole day's weather before I leave, so that I'm not too hot, too cold, or caught in the rain between classes.
2. As a student planning ahead, I want to check the weather for an upcoming day, so that I can have the right clothes ready for a trip or event.
3. As a student who spends hours outside between classes, I want to know what extra things to bring for the day's conditions, so that I'm not caught without protection from rain, sun, or heat.
4. As a student whose hours outside change from day to day, I want recommendations based only on the time I'll actually be out, so that I'm not dressed for a cool morning I'll miss or a hot afternoon I'll spend indoors.

## References

Collect 5–10 reference images from relevant products and interfaces. Save each image in `reference/`, identify its source, and record a brief observation about what is useful, ineffective, or relevant to this project. Reference images are examples only; do not use them in the app.

Gathered 2026-09-28; the Developer selected 10 of 18 candidates. App Store images are the publishers' marketing screenshots from each public listing. The web image was captured with headless Chrome at 1440×1000 for Austin, TX.

| File | Source | Observation |
|---|---|---|
| `appstore-apple-weather-1.jpg` | [Weather, Apple Inc.](https://apps.apple.com/us/app/weather/id1069513131) | Useful: an at-a-glance overview of how the weather changes day to day. |
| `appstore-apple-weather-2.jpg` | same | Useful: a large temperature at the top center over a sky background that matches that day's conditions. |
| `appstore-weather-channel-1.jpg` | [The Weather Channel](https://apps.apple.com/us/app/the-weather-channel-radar/id295646461) | Same strength as Apple Weather 2: a prominent temperature over a sky background for the day. |
| `appstore-carrot-weather-1.png` | [CARROT Weather, Grailr LLC](https://apps.apple.com/us/app/carrot-weather-alerts-radar/id961390574) | Useful: a minimal UI that keeps the screen uncluttered. |
| `appstore-not-boring-weather-2.jpg` | [(Not Boring) Weather, Not Boring Software](https://apps.apple.com/us/app/not-boring-weather/id1531063436) | Useful: an animated visual of the weather conditions. |
| `appstore-daily-dress-me-1.jpg` | [Daily Dress Me, Daily Dress Me Inc.](https://apps.apple.com/us/app/daily-dress-me-what-to-wear/id6447927117) | The model for how clothing should appear: pieces overlap to fit the space but each stays readable. |
| `appstore-daily-dress-me-2.jpg` | same | Same as above. |
| `appstore-what-to-wear-weather-outfit-1.jpg` | [What to Wear: Weather Outfit, Phuc Pham](https://apps.apple.com/us/app/what-to-wear-weather-outfit/id6767791003) | The closest example of the overall app format: weather summary, outfit, and supporting details on one screen. |
| `appstore-what-to-wear-weather-outfit-2.jpg` | same | Same as above. |
| `web-weathercom-austin-laptop.png` | [weather.com, Austin](https://weather.com/weather/today/l/30.27,-97.74) | Useful for the laptop layout: where to place the weather data on a larger screen. |

## Weather and technical evidence

Record each useful source, what it supports, and important limitations. Research the weather variables, apparel guidance, reminders, accessibility, privacy, artwork, weather providers, and technical options needed for informed decisions.

All sources below were checked directly on 2026-09-28.

| Source | Supports | Limitations |
|---|---|---|
| [Open-Meteo Forecast API docs](https://open-meteo.com/en/docs) | Free, no key; up to 16-day forecast; hourly/daily temperature, **apparent temperature**, precipitation probability, UV index, wind, weather code; °F/mph/inch units; `timezone=auto` | Model data, not an official US forecast |
| [Open-Meteo terms](https://open-meteo.com/en/terms) | Non-commercial use free (<10,000 calls/day); data is CC BY 4.0, so attribution is required | A real brand launch would count as commercial use and need a paid plan (note for the Client) |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | City name or postal-code search, `countryCode=US` filter, returns lat/lon and time zone | Location data from GeoNames (attribution required); ZIP search returns the city, not the exact ZIP centroid |
| [NWS API docs](https://www.weather.gov/documentation/services-web-api) | Official US forecasts, free, no key; 7 days; two-step `/points` → `/forecast` flow | Asks for a User-Agent header (browsers can't set this); no UV index in the text forecast; rate limit not published |
| [OpenWeatherMap pricing](https://openweathermap.org/price) | Free: 5-day forecast in 3-hour steps; One Call API: 1,000 calls/day free, then paid per call | Needs an API key, which would be exposed on a static site; hourly on the free tier is limited |
| [WeatherAPI.com pricing](https://www.weatherapi.com/pricing.aspx) | Free: 100,000 calls/month, hourly data | Only a **3-day** forecast on the free plan (short of 7); key required; link-back requested |
| [Visual Crossing plans](https://www.visualcrossing.com/weather-data-editions/) | Free: ~1,000 records/day, 15-day forecast | Key required; attribution with a link required |
| Browser test (Agent, curl) | Both `api.open-meteo.com` and `api.weather.gov` return `Access-Control-Allow-Origin: *`, so a static GitHub Pages app can call them directly | — |
| [EPA UV Index scale](https://www.epa.gov/sunsafety/uv-index-scale-0) | UV 1–2: minimal protection; **UV 3+: SPF 15+ sunscreen, hat, sunglasses**; 8+: extra precautions | — |
| [NWS Heat Index](https://www.weather.gov/ama/heatindex) | Caution 80–90°F; **Extreme Caution 90–103°F**; Danger 103–124°F; Extreme Danger 125°F+ | Values are for shade; direct sun can feel up to 15°F hotter |
| [CDC heat health](https://www.cdc.gov/heat-health/about/index.html) | "Carry a water bottle. Drink and refill it throughout the day." | No clothing guidance |
| [NWS wind chill](https://www.weather.gov/safety/cold-wind-chill-chart) | Wind chill is defined at ≤50°F with wind >3 mph; frostbite needs an actual air temperature below freezing | No clothing guidance |
| [CDC winter weather](https://www.cdc.gov/winter-weather/prevention/index.html) | Cold outfit: hat, scarf, gloves, water-resistant coat and boots, loose layers | — |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (checked 2026-10-05) | Target AA. **1.1.1** (A): text alternatives for images, so each character image needs alt text describing the outfit. **1.4.3** (AA): text contrast 4.5:1, or 3:1 for large text, which matters for text over the 3D scenes. **1.4.11** (AA): controls and meaningful graphics 3:1. **2.2.2** (A): moving content that starts automatically, lasts over 5 s, and sits beside other content needs a way to pause, stop, or hide it, which **applies to the looping animated icons**. **2.5.8** (AA): targets at least 24×24 CSS px (2.5.5 AAA: 44×44, a better one-handed phone goal). **1.4.10** (AA): reflow at 320 px wide with no two-way scrolling | Guidelines, not a test suite; manual checks still needed |
| [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | Detects the device's reduce-motion setting (`reduce` / `no-preference`); widely supported since 2020. Use it to swap in the static icons | Only covers users who have set it, so 2.2.2 still needs an in-app pause control |
| [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) | HTTPS only (GitHub Pages qualifies); the browser always asks permission; denial is reported to an error callback (`PERMISSION_DENIED`), which drives the brief's denied-location state | Permission may be remembered by the browser; the app can't re-prompt after a denial |
| [Open-Meteo terms/privacy](https://open-meteo.com/en/terms) | No cookies or tracking; no data shared with third parties; free use collects no personal data. May log IP addresses for maintenance and abuse prevention | Coordinates and IP still reach Open-Meteo, so the info screen should say so |
| [Google Terms of Service](https://policies.google.com/terms) | On generated content: "Google won't claim ownership over that content." Users must not violate others' IP rights or use outputs to train AI models | Doesn't address copyright status |
| [Gemini with a school account](https://support.google.com/gemini/answer/14620100?hl=en&co=DASHER._Family%3DEducation) | Developer's UT Edu account: Education editions get enterprise data protections (chats not human-reviewed or used for training) | The school's admin settings may add limits |
| [US Copyright Office, AI](https://www.copyright.gov/ai/) | Its 2025 report concludes that output from prompts alone generally isn't copyrightable | **Note for the Client:** a brand can't own exclusive rights to these images as-is; fine for a prototype, but worth flagging |

**Gaps to discuss:** no authoritative source defines temperature bands for everyday outfits (e.g., "hoodie weather"), so the category thresholds below are design judgments based on apparent temperature and should be labeled that way on the info screen.

**Privacy approach (confirmed by Developer, 2026-10-05):** no accounts, cookies, analytics, or API keys. Device location is requested only when the User taps "Use my location," never on load. Only latitude/longitude (or the typed city/ZIP) is sent to Open-Meteo. Per the brief, only the most recent location is saved, in the browser's `localStorage`, with a "forget location" control. Saved outfit/wording picks per date are stored the same way and hold no personal data. The info screen states all of this, plus Open-Meteo's IP logging.

**Art credit (confirmed by Developer, 2026-10-05; creator name still to fill in):** "Character and outfit images generated with Google Gemini (Nano Banana 2) by [Developer]. Weather icons: Meteocons by Bas Milius, MIT License." No disclosure is required by Google's terms, but labeling AI images is honest and fits the brief's credits requirement.

## Decisions

Record the selected weather provider, forecast range, recommendation categories and rules, screen structure, visual direction, artwork approach (original, AI-generated, or appropriately licensed), deployment method, and one additional feature justified by the research. Briefly explain important trade-offs.

Once the recommendation categories are chosen, estimate the art needed: the character, three outfit variations per category, weather icons, and reminder icons. Use that estimate to choose the artwork approach.

> **Approved by the Developer on 2026-10-05** (see Approval). Items still marked open below carry into the specification.

**Weather provider (decided by Developer): Open-Meteo**, for both the forecast and the location search (geocoding).
- **Why:** no API key (nothing to expose on a static site); hourly apparent temperature, precipitation probability, and UV index in one call, which the out-window feature and sunscreen reminder need; built-in ZIP/city search.
- **Trade-offs accepted:** model data rather than the official NWS forecast. CC BY 4.0 attribution (plus GeoNames for locations) must appear on the info screen. The free tier is non-commercial, so the Client would need a paid plan for a real launch.
- **Not chosen:** NWS (no UV, two calls, separate geocoder); OpenWeatherMap and Visual Crossing (keys exposed on GitHub Pages); WeatherAPI.com (3-day free forecast).

**Forecast range (decided by Developer):** today plus the next 6 days (7 total), where accuracy is reasonable.

**Recommendation categories** (by the max hourly apparent temperature within the User's out window; the 90°F breakpoint aligns with NWS Extreme Caution). Open-Meteo provides hourly apparent temperature, precipitation probability, and UV index, so all rules below use values from the window:

**Style direction (Developer):** layered fits in every category, not only cold ones. Each outfit is built from pieces: base top + outer layer + bottom + shoes + optional accessory. Hot-weather layers follow NWS guidance: "Wear lightweight, loose fitting, light-colored clothing to reflect heat and sunlight" ([NWS heat safety](https://www.weather.gov/safety/heat-during)).

Categories, bands, and pieces confirmed by the Developer. The 90°F breakpoint and the cold items are sourced (NWS, CDC); the other breakpoints are design judgments.

| Category | Feels-like max | Base | Outer layer | Bottom / shoes / accessory |
|---|---|---|---|---|
| Hot | ≥ 90°F | tank or light tee | open camp-collar or linen button-up (light color) | shorts, sandals or slides, cap |
| Warm | 75–89°F | tee | open short-sleeve button-up or light overshirt | shorts or lightweight chinos, sneakers |
| Mild | 60–74°F | tee or long-sleeve tee | flannel, shacket, or denim jacket | jeans or cargos, sneakers |
| Cool | 45–59°F | long-sleeve tee | hoodie + jacket (e.g., bomber or chore coat) | jeans, sneakers or boots, beanie |
| Cold | < 45°F | thermal or long-sleeve | sweater/hoodie + puffer or water-resistant coat | jeans, water-resistant boots, hat, gloves, scarf (CDC) |

**Reminders** (confirmed by the Developer; independent of category; any number can show). Because rules read only the User's out window, a night window naturally drops the sunscreen reminder, so the EPA UV ≥ 3 threshold stays as-is. The swing reminder's wording should name the removable outer layer from the current outfit. *Open for spec: whether a window can cross midnight.*

| Reminder | Rule | Source |
|---|---|---|
| Umbrella | any hour in window: precipitation probability ≥ 40% | threshold is a design judgment |
| Sunscreen | any hour in window: UV ≥ 3 | EPA |
| Hydration | any hour in window: apparent temp ≥ 90°F | NWS heat index + CDC |
| Bundle up extremities | any hour in window: temp ≤ 32°F | NWS wind chill / CDC |
| Big temperature swing (layer) | within window: max − min apparent temp ≥ 20°F | design judgment; fits Austin mornings vs. afternoons |

**Screen structure (decided by Developer):** a main screen where the dressed character is the focus, with the date picker, location, weather, and reminders around it, plus an info screen. A **"See the fit"** view shows the same outfit's pieces laid out separately, overlapping but readable in the style of Daily Dress Me. It's based on the Daily Dress Me and What to Wear references. "See the fit" is part of the core design, **not** the brief's one additional feature.

**Visual direction:** bright, playful, and brand-neutral, since the Client's brand isn't defined yet. *Developer to choose.*

**Additional feature (decided by Developer): "I'm out from ___ to ___" time window.** The User sets the hours they'll be outside, and the outfit and reminders use only the hourly forecast inside that window (e.g., 8am–6pm) instead of the whole day.
- **Justification:** context of use and user story 1. The User is out on campus all day, and Austin mornings run much cooler than afternoons (the 2026-09-28 NWS forecast shows lows of 70–77°F and highs of 84–97°F), so whole-day or current-only values can mislead.
- **Trade-off:** it uses hourly rather than daily data, and adds a time control that must stay usable one-handed.
- **Open for spec:** the default window, and whether the window is saved on the device.
- **Considered and not chosen:** a share-outfit card (weaker research support); a separate layer alert (already covered by the temperature-swing reminder).

**Deployment:** GitHub Pages, as a static HTML/CSS/JS site with no build step and no API keys to protect.

**Art estimate:** 1 base character + 15 outfits (5 × 3) + ~7 weather icons (clear, partly cloudy, cloudy, fog, rain, storm, snow) + 5 reminder icons, about **28 assets**.
- **Under test (2026-09-28):** AI generation with [OpenArt](https://openart.ai/features/ai-character/), using its saved "Characters" feature to keep one character consistent across outfits. The Developer is testing Hot and Cold outfits for consistency of face, pose, and style. Constraints: commercial use only on paid plans (record the plan in credits); no transparent output, so backgrounds must be removed; whole dressed images don't split into pieces, so "See the fit" would need separate generated piece images. Tool comparison: [Neolemon](https://www.neolemon.com/blog/best-ai-image-generator/), [OpenArt blog](https://openart.ai/blog/best-ai-image-generator/), [Transparify](https://transparify.app/blog/ai-image-generators-transparent-background) (review sites, not official benchmarks).
  - **Test results (2026-10-05, Free plan, 40 credits):** the base character (Seedream 4, "Vector art" style, 15 credits) and the Hot outfit (Nano Banana 2 with the saved character, 20 credits) are saved as `reference/ai-test-base.webp` and `ai-test-hot.webp`. The Cold outfit was not made because only 5 credits remained. *Consistent:* mustache, face style, pose, flat look. *Drifted:* hair darker, skin more tan, thin outlines appeared despite "no outlines," an unrequested palm print and cap logo, and different body scale and framing (so outfits would not line up in the same spot). Free-plan images carry an OpenArt watermark across the middle and are stored for 7 days.
  - **Gemini test (2026-10-05, Developer's UT Edu Google account, free):** new character (white man, octagonal glasses, mustache, short hair with short bangs) in a dynamic Hot pose (mid-stride, shading his eyes, holding a water bottle), made in 2D and 3D versions, plus a separate flat-lay of the outfit for "See the fit." Saved as `reference/ai-gemini-hot-2d.jpg`, `-3d.jpg`, `-flatlay.jpg` (1408×768). *Worked:* the 2D→3D conversion kept the same face, pose, and framing; the pose reads as "hot day"; the flat-lay pieces are readable; no visible watermark. *Problems:* "transparent background" produced a checkerboard painted into a JPEG, so backgrounds must be removed separately; landscape output leaves the character small in the frame; the flat-lay drifted from the worn outfit (the cap gained a white front panel, and the shirt's inside shows as an odd tan stripe). Consistency across categories is not yet tested.
  - **Gemini Cold test (2026-10-05, Developer chose 3D character + flat 2D "See the fit"):** `reference/ai-gemini-cold-3d.jpg` and `-cold-flatlay.jpg` (848×1264, after asking for a 2:3 portrait frame). *Worked:* recognizably the same character as Hot 3D; the cold pose (hunched, rubbing gloved hands) reads clearly; portrait framing fills the height; flat-lay colors match the worn outfit closely. *Problems:* the face looks a little older and heavier than in Hot; the glasses are octagonal here but came out round in both Hot images; the Cold flat-lay has outlines and texture while the Hot flat-lay is soft and outline-free, so the 2D style drifts between outfits; the thermal shirt was drawn as a knit sweater.
  - **Direction set by Developer (2026-10-05):** 3D character images with a soft, blurred campus scene matched to each category (no transparency); 2D flat-lay "fit" images on plain white; generated category by category in Gemini, using the same chat so the Cold 3D image stays the character reference. Proposed 15 outfits and per-category scenes approved by the Developer. Files go in `art/` as `<category>-<n>-character.jpg` and `<category>-<n>-fit.jpg` (848×1264).
  - **Hot batch (2026-10-05):** all 6 images generated. Character stays consistent (octagonal glasses, mustache, bangs). Issues: the cold image's red nose carried into Hot 2 and 3; Hot 1 and Hot 3 reuse nearly the same background and shading-eyes pose; Hot 1's fit copied the earlier test flat-lay (cap with a white front panel the worn cap doesn't have); Hot 3's fit drew buckle sandals and cargo pockets that the worn outfit doesn't show.
  - **Warm batch (2026-10-05, Developer chose to accept Hot as-is):** prompts now ask for natural skin with no red nose, a distinct pose per outfit, and fits that draw only what is visible. Warm 1 and 2 (character + fit) saved to `art/`. Distinct poses and backgrounds worked (phone-walk on an open lawn; waving with a brick building behind); fits match closely, though the nose is still slightly red and Warm 2's rolled-sleeve denim overshirt became short-sleeved in the fit. **Warm 3 stalled** in Gemini ("Creating your image" with no result after several minutes, ~15 images into the day), probably the free daily limit.
  - **Warm 3 to Cool 2 batch (2026-10-11, same Gemini chat):** 12 images kept (Warm 3, Mild 1–3, Cool 1–2), 20 generated before Gemini's daily limit message. *Character drift:* Mild 1 (first try) and Mild 2 came out with big round cartoon eyes and round glasses; open-mouth laughing poses made it worse. Re-pointing the face reference at Warm 3 and asking for a calm, closed-mouth smile fixed the eye size, but Mild 2, Mild 3 and Cool 1 then drifted to realistic eyes (whites, irises, eyelids) instead of the **solid dot eyes** of Hot 1 to Mild 1. Asking Gemini to *edit* those images, changing only the eyes, fixed it and kept outfit, pose and background identical, so the fits still match. Prompts now name Warm 3 as the fixed face reference and describe the eyes as "small, solid, dark-brown round dots with no white, iris or eyelids." *Fits:* two came back with duplicated items (two pairs of shoes in Mild 3, two beanies in Cool 2) and were regenerated; asking for "exactly one of each item" fixed both. *Downloads:* Chrome began silently dropping Gemini downloads (no entry in its download list) after a few per session; restarting Chrome allows one more download each time.
  - **Cool 3 to Cold 3 batch (2026-10-12):** all 8 images kept, 13 generated. *Proportions:* the first Cool 3 came back with a toy-figure build (head about 1/5 of his height, short torso, small in the frame) because the only reference was the seated Warm 3 and the prompt said "toy-like." Asking Gemini to edit it, and then to make a new image in the same chat, both returned near-identical images: in a long chat Gemini anchors on the latest image with the same outfit and scene and ignores text references to older ones. *Fix:* a new chat with `warm-3-character.jpg` (face) and `cool-2-character.jpg` (body, style, framing) attached as real files, with "toy-like" dropped. Cool 3 and Cold 1–3 then matched the earlier images on the first try. Cold uses one snowy-campus scene with distinct poses (rubbing hands, walking while adjusting the scarf, holding a hot drink). *Fits:* the existing Cool 3 fit still matched the new character and was kept; `cool-3-fit.jpg` was attached as the flat-lay style reference. The Cold 3 fit drew a duplicate hoodie and jeans, and a correction in the same chat fixed only the hoodie; a fresh chat with the character and `cold-1-fit.jpg` attached produced a clean one. *Downloads:* all worked without a reload or restart.
  - **Background removal:** Gemini returns JPEGs with a painted-in checkerboard. An Agent-written PowerShell script (flood fill from the edges through neutral light pixels, plus enclosed regions that contain both checker shades) produced transparent PNGs next to each JPEG. Gray clothing close to the checker's darker shade (~165) is the main risk; the cutoff was set at 163.
  - **Gemini costs (checked 2026-10-05):** the Gemini app's free Basic tier allows up to ~20 Nano Banana 2 images/day (secondary sources citing Google's help page; Google now meters by compute, so the count varies). The API charges ~$0.067 per 1K image ([Google pricing](https://ai.google.dev/gemini-api/docs/pricing)).
- **Previous option (sample built, set aside for the AI test):** original layered SVG, with the character as a base and each outfit as separate top/bottom/shoes/accessory pieces. The same piece files render on the character and on their own in "See the fit," so that view adds little or no extra art. It's cheap to make consistent, easy to credit, and has no license risk.
- **Alternatives:** AI-generated art, which is hard to keep consistent across 15 outfits; or licensed icon sets for the weather icons only (e.g., Meteocons, whose license needs verifying).
- **Icons (decided by Developer, 2026-10-05): Meteocons Fill, animated, shown on a frosted translucent card** so they stay readable over the 3D scenes. Saved in `art/icons/` (animated) and `art/icons/static/` (still versions for reduced-motion users), with `LICENSE-meteocons.txt` (MIT, © 2020–2024 Bas Milius) kept alongside as the license requires. Compared in a preview against Line (thin strokes lost on sky and pale walls) and Monochrome (clear but plain).
- **Icon research:** [Meteocons](https://github.com/basmilius/weather-icons) by Bas Milius, MIT license (verified on the repository). Transparent SVGs in four styles (fill, flat, line, monochrome), each static or animated. One set covers all 12 needed icons (checked that each file exists): weather `clear-day`, `partly-cloudy-day`, `overcast`, `fog`, `rain`, `thunderstorms`, `snow`; reminders `umbrella`, `uv-index` (sunscreen), `raindrop` (hydration), `thermometer-colder` (bundle up), `thermometer-warmer` (temperature swing). Backup: [Tabler Icons](https://tabler.io/icons) (MIT) has umbrella, bottle, sunglasses, jacket and shirt, but no mitten. Credit on the info screen: "Weather icons: Meteocons by Bas Milius, MIT License." `.ico` files are a Windows icon format and are not suited to in-page icons.

## Revisions

Record new evidence or changed decisions and explain why they changed.

- **2026-10-05, after approval:** added accessibility (WCAG 2.2, prefers-reduced-motion), location/privacy (Geolocation API, Open-Meteo), and AI-art terms (Google ToS, Gemini Education, US Copyright Office) sources, plus a proposed privacy approach and art credit. New finding: WCAG 2.2.2 means the looping animated icons need a pause control.
- **2026-10-05, art approach:** moved from original layered SVG to AI-generated art in Gemini (3D character images with campus backgrounds; 2D flat-lay fits on white). The Developer preferred the richer look and dynamic weather poses; the OpenArt test drifted more and added watermarks; Gemini's lack of transparency is handled by baking the scene into each character image.
- **2026-10-05, during spec:** added user story 4 (recommendations for only the hours outside) so the "I'm out from ___ to ___" feature traces to a stated need. Approved by the Developer in chat on 2026-10-05.
- **2026-10-05, during spec (privacy approach):** Open-Meteo has no reverse geocoding, so device location needs a second service to show a city name. The Developer chose [BigDataCloud's free client-side API](https://www.bigdatacloud.com/blog/new-feature-update-free-client-side-reverse-geocoding-api-with-ip-geolocation-fallback) (no key; fair use for the device's own real-time location; the free tier helps improve its IP geolocation data) over [Nominatim](https://operations.osmfoundation.org/policies/nominatim/) (asks not to submit personal data; requires caching). Coordinates are rounded to 2 decimals (~1 km) before being sent to either service. The Developer also chose to save a changed out window on the device. Both update the privacy approach above; the info screen must disclose them.

## Approval

The Developer reviews the sources and decisions, corrects this file, and explicitly approves it before specification begins.

**Approved by the Developer in chat on 2026-10-05.** Open at approval, to be resolved in the spec: accessibility sources, the privacy approach, and Gemini's terms for art credits (sources added and privacy approach and art credit confirmed 2026-10-05), and the remaining 20 images (Warm 3 through Cold 3).

## Saving the transcript

After the Developer approves the research, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/research-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
