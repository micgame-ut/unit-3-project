# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved research, project brief, and hand-drawn screen designs into testable requirements.

## Instructions for the Developer

Make and approve the product decisions, draw every proposed screen, provide the drawings to the Agent, and keep this file current as the intended result changes.

To begin, open the project repository in a fresh chat and enter:

`Read ./spec.md and help me begin the Project 3 specification.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, and this file. Review the screen drawings the Developer provides. Ask one focused question at a time, surface gaps and trade-offs without inventing requirements, and keep the specification concise and testable.

## Goal

State what the app should help its Users accomplish and name the user story or stories that define that need.

> **Approved by the Developer (2026-10-05).**

Help US college students who are out on campus all day decide, before they leave, what to wear and what to bring for the weather during the hours they'll actually be outside. They can do this for today or an upcoming forecast date, quickly and one-handed on a phone, or with more room on a laptop. Recommendations are playful suggestions shown through a dressed character, not safety advice.

Defining user stories (from `research.md`):
1. **Whole-day outfit:** as a college student out on campus all day, I want to know what to wear for the whole day's weather before I leave, so that I'm not too hot, too cold, or caught in the rain between classes.
2. **Planning ahead:** as a student planning ahead, I want to check the weather for an upcoming day, so that I can have the right clothes ready for a trip or event.
3. **What to bring:** as a student who spends hours outside between classes, I want to know what extra things to bring for the day's conditions, so that I'm not caught without protection from rain, sun, or heat.
4. **Hours outside:** as a student whose hours outside change from day to day, I want recommendations based only on the time I'll actually be out, so that I'm not dressed for a cool morning I'll miss or a hot afternoon I'll spend indoors. *(Supports the "I'm out from ___ to ___" feature.)*

## Screen designs

Draw every proposed screen by hand, in both phone and laptop layouts, on paper, a tablet, a whiteboard, or another hand-drawing surface. Save photos or exports in `reference/`, provide them to the Agent, and link them here. Use the drawings to define layout, hierarchy, controls, navigation, and important interaction states.

> **Reviewed (2026-10-05):** the Developer's sketches and decisions, reviewed in a spec session; final approval comes with the full spec.

| Sketch | Screen |
|---|---|
| [sketch-phone-main.jpg](reference/sketch-phone-main.jpg) | Main screen, phone |
| [sketch-laptop-main.jpg](reference/sketch-laptop-main.jpg) | Main screen, laptop |
| [sketch-loading.jpg](reference/sketch-loading.jpg) | Loading state |
| [sketch-phone-info.png](reference/sketch-phone-info.png) | Info screen, phone |

**Main screen (Developer decisions):**
- **Top (laptop):** large day name, with the date picker directly under it, then the location search with a "Use my location" button.
- **Center:** the character image card (3D scene) with the frosted icon card over its lower part. This is the focal point.
- **Below / right column (laptop):** weather summary (°F), "See the fit," "I'm out from ___ to ___," and an extra-info box holding the written recommendation, reminders, and the link to the info screen.
- **Phone order (top to bottom, revised 2026-10-05):** location, character card (See the fit button beside it), out window, day name, weather summary, date picker, then the extra-info box. This differs from the phone sketch, which put the day and date picker at the top.
- **Phone thumb reach (Developer, 2026-10-05):** tappable controls sit in the lower part of the screen for one-handed use; the date picker moved below the weather summary for this reason. Two deliberate exceptions follow convention: the location search stays at the top, and the info screen's back button stays at the top left.
- **Icon pause control:** on the frosted card. **Open-Meteo credit:** in the extra-info box.
- **Laptop:** character card on the left with location under it; right column with weather summary, See the fit, out window, extra info.

**"See the fit":** opens as an overlay over the character; tapping outside the box closes it.

**Info screen (Developer decisions):** a back button at the top left returns to the main screen. Sections, top to bottom, as sketched:
- **Header:** "Info," then "Michael Game, Creator."
- **Weather data:** Open-Meteo, with CC BY 4.0 attribution and the GeoNames credit for location search. Device-location names: BigDataCloud.
- **How recommendations work:** the five categories and their apparent-temperature bands, noting which breakpoints are sourced (NWS, CDC) and which are design judgments; the reminder rules with linked sources.
- **Privacy:** the confirmed approach in `research.md` (no accounts, cookies, analytics, or API keys; location requested only on tap; coordinates rounded to about 1 km; only rounded coordinates or the typed city sent to Open-Meteo, which may log IP addresses; after "Use my location," rounded coordinates also sent to BigDataCloud to name the city, which may use them to improve its location data; last location, per-date picks, and any changed out window saved in `localStorage`), plus the **Forget location** button.
- **Art credits:** "Character and outfit images generated with Google Gemini (Nano Banana 2) by Michael Game. Weather icons: Meteocons by Bas Milius, MIT License."
- **Laptop:** the same single-column format, centered, with decorative side bars filling the extra width. No separate sketch needed.
- Only User-facing content appears here; Client-facing notes (such as Open-Meteo's non-commercial free tier) are left out.

**States:**
- **Loading:** a sun icon whose rays light up progressively to full brightness, plus "Loading" text.
- **Error** (service down or missing data): same layout as loading, with an error message in place of the loading text and image.
- **Location denied:** a small inline error on the main page; the main page shows a default fit set to the Warm category.
- **First visit (no saved location):** same as location denied, showing the sample Warm fit labeled "Sample outfit: search a city to get yours," with the weather summary left blank.

**Sketch coverage (Developer, 2026-10-05):** the revised phone order and the laptop info layout are recorded here in writing instead of being redrawn.

## Requirements

Translate every fixed brief requirement and the selected research-driven feature into a testable requirement. Define the chosen behavior, content, controls, current and forecast data, responsive layout, accessibility, error handling, privacy, credits, and deployment. The main screen should make clear the location, date, units, data source, and whether conditions are current or forecast. Include an acceptance check for each requirement.

**Current vs. forecast (Developer, 2026-10-05):**
- **Today:** the weather summary shows current conditions labeled "Now," plus the window forecast labeled with its hours (e.g., "Forecast 3pm–6pm").
- **Forecast dates:** the window forecast only, labeled "Forecast" with its hours.
- The outfit and reminders always come from the window forecast, not current conditions.
- **Summary values:** *Now* line: condition icon and word, temperature, feels-like. *Forecast* line: feels-like high and low, highest rain chance, highest UV. All temperatures in °F. No wind or humidity for now.

**Out-window decisions (Developer, 2026-10-05):**
- **Default window (today):** from the current hour to the next 6-hour mark (12am, 6am, 12pm, or 6pm), so hours that have already passed are skipped. Example: at 7:15pm the window is 7pm to 12am.
  Short windows near a mark (e.g., 5pm to 6pm at 5:40pm) are accepted, since the User can adjust the window.
- **Default window (forecast dates):** 7am to 7pm.
- **Saved on device:** yes, a window the User changes is saved in `localStorage` and noted in the info screen's privacy text. It is one usual window applied to every date (today and forecast) until changed, replacing the defaults above. On today, hours of the usual window that have already passed are trimmed (usual 9am to 5pm, checked at 3pm → 3pm to 5pm). Once the whole usual window has passed, today falls back to the 6-hour-mark default.
- **Crossing midnight:** allowed, for overnight workers and night owls (e.g., 8pm to 2am). The window belongs to the date it starts on, and hours after midnight use the next day's forecast. On the 7th (last) date, a window that crosses midnight is cut off at midnight, since no further forecast is requested.
- **Granularity:** whole hours, matching Open-Meteo's hourly forecast. The current hour counts as the start (e.g., 9:40am → 9am).

### Requirement list

> **Approved by the Developer (2026-10-05).**

**Data and location**
1. **Live weather.** All weather values come from one Open-Meteo forecast request per location: current conditions plus hourly apparent temperature, temperature, precipitation probability, UV index, and weather code, in °F and the location's local time zone, for today plus 6 days.
   *Check:* the browser's network panel shows the Open-Meteo request, and the values on screen match its response.
2. **Manual location.** The User can type a US city or ZIP code; the search uses Open-Meteo geocoding limited to US results. When several places match, the User picks one from a list shown as "City, State."
   *Check:* "78705" and "Austin" both resolve to Austin, TX; "Paris" lists Paris, TX and other US matches, never France.
3. **Device location.** "Use my location" requests the browser location only when tapped, never on load.
   *Check:* a fresh load shows no permission prompt; tapping the button does.
   The coordinates are rounded to 2 decimal places (about 1 km) before leaving the device, then named with BigDataCloud's free client-side reverse-geocoding API (no key) and shown as "City, State." The same rounded coordinates are used for the Open-Meteo request.
   *Check:* the network panel shows only 2-decimal coordinates in both requests; the main screen shows the correct city and state.
4. **Saved location.** Only the most recent location is saved, in `localStorage`, and restored on the next visit. **Forget location** (info screen) clears it and returns the app to the first-visit state.
   *Check:* reload keeps the last location; after Forget location, a reload shows the sample fit.
5. **Date.** The User picks today or one of the next 6 days. The main screen shows the selected day name and date.
   *Check:* all 7 dates are selectable; an 8th is not; changing the date updates every output.
6. **Main-screen clarity.** The main screen shows the location name, the selected date, °F units, "Weather: Open-Meteo," and the "Now" / "Forecast [hours]" labels.
   *Check:* each item is visible on the main screen on phone and laptop.

**Recommendation**
7. **One recommendation state.** The location, date, out window, and weather data produce one recommendation state; the character image, weather icon, written recommendation, reminders, and See the fit image are all drawn from it.
   *Check:* changing location, date, or window updates every output together; no output ever shows a different category or reminder set than the others.
8. **Category and reminder rules.** Categories and reminders follow the tables in `research.md`, applied to the hours in the out window.
   *Check:* test cases at each boundary (e.g., max feels-like 89°F → Warm, 90°F → Hot; rain chance 39% → no umbrella, 40% → umbrella).
9. **Content variation.** As defined in Content variation below.
   *Check:* defined with that section.
10. **Out window.** Behaves as defined in the out-window decisions above.
    *Check:* defaults at 1am, 7:15pm, and for a forecast date match the examples; a saved 9am–5pm window shows 3pm–5pm at 3pm; an 8pm–2am window uses the next day's hours; on the 7th date it ends at 12am and the control shows 12am.
11. **See the fit.** Opens an overlay with the current outfit's fit image; closes by tapping outside, a close button, or Esc.
    *Check:* each close method works; the fit matches the character's outfit.

**Screens and states**
12. **Info screen.** Contains the creator, weather-data source and attribution, recommendation methods and sources, privacy practices with Forget location, and art credits, as defined in Screen designs. The back button returns to the main screen without losing its state.
    *Check:* each section is present; back returns to the same location, date, and window.
13. **States.** Loading, service error, missing data, location denied, and first visit behave as defined in Screen designs. A search with no US match shows an inline "No US location found" message.
    *Check:* each state is triggered on purpose (offline, blocked permission, cleared storage, nonsense search) and shows its defined screen.

**Layout, accessibility, privacy, delivery**
14. **Responsive layout.** Phone (narrow) uses the single-column order in Screen designs; laptop uses the two-column layout. No horizontal scrolling at 320px wide.
    *Check:* view at 320px, 390px, and 1280px+.
15. **One-handed phone use.** Frequently used controls (out window, date picker, See the fit) sit in the lower part of the phone screen; tap targets are at least 44×44px.
    *Check:* every control except location search can be reached one-handed on a phone; targets measure ≥ 44px.
16. **Accessibility (WCAG 2.2 AA).** All controls work by keyboard with a visible focus; the character image has alt text naming the outfit and category; text meets 4.5:1 contrast, including over the scenes; inputs have labels; updates to the recommendation are announced to screen readers; the icon pause control stops animation, and `prefers-reduced-motion` shows the static icons.
    *Check:* keyboard-only run-through; a contrast check; screen-reader spot check; toggle reduced motion.
17. **Privacy.** No accounts, cookies, analytics, or API keys; only the typed search or rounded coordinates go to Open-Meteo, and rounded coordinates go to BigDataCloud only after "Use my location" is tapped; `localStorage` holds only the last location, per-date picks, and the usual window.
    *Check:* network panel shows requests only to Open-Meteo, BigDataCloud (after the tap), and the site itself; storage panel shows only those keys.
18. **Credits.** Open-Meteo credit in the extra-info box; full credits on the info screen.
    *Check:* both present and matching the wording in Screen designs.
19. **Deployment.** Deployed to GitHub Pages at a public HTTPS URL.
    *Check:* the URL loads over HTTPS on a phone and a laptop, and location permission works there.

## Recommendation state and data flow

Define the weather inputs, recommendation categories, coded rules, and shared state. Weather values must come from the provider, and rules must follow the weather guidance cited in `research.md`. The selected location, date, and live weather data must produce one recommendation state that drives every visual and written output.

> **Approved by the Developer (2026-10-05).**

**Inputs**
- **Selections:** location (name, rounded latitude/longitude, time zone), date (today or +1 to +6), out window (start and end hour; may cross midnight).
- **Weather (Open-Meteo):** current temperature, apparent temperature, and weather code (today only); hourly apparent temperature, temperature, precipitation probability, UV index, and weather code.

**Flow**
1. A location change fetches the forecast once; date and window changes reuse it without a new request.
2. The app takes the hourly values inside the window (hours after midnight come from the next day).
3. Rules run on those hours:
   - **Category:** the max apparent temperature in the window, using the bands in `research.md` (Hot ≥ 90°F, Warm 75–89, Mild 60–74, Cool 45–59, Cold < 45).
   - **Reminders:** each reminder rule in `research.md` checked independently (umbrella: rain chance ≥ 40%; sunscreen: UV ≥ 3; hydration: feels-like ≥ 90°F; bundle up: temperature ≤ 32°F; swing: feels-like max − min ≥ 20°F). Any number can apply.
   - **Window icon (Developer, 2026-10-05):** the most common icon across the window's hours (weather codes mapped to the 7 Meteocons). Ties go to the more severe icon (storm > snow > rain > fog > cloudy > partly cloudy > clear). The icon may show clear while an umbrella reminder is active; the reminder covers the rainy hour.
4. Variation picks (Content variation) choose one outfit for the category and one wording per active reminder.
5. The result is stored as one **recommendation state**, and every output renders from it.

**Recommendation state**

| Field | Example | Drives |
|---|---|---|
| `location`, `date`, `window` | Austin, TX · Tue Oct 6 · 3pm–6pm | Day name, labels, summary headings |
| `now` (today only) | 84°F, feels 88°F, partly cloudy | "Now" line |
| `forecast` | feels 82–93°F, rain 45%, UV 7 | "Forecast" line |
| `category` | Hot | Outfit choice |
| `outfit` | Hot 2 | Character image, its alt text, See the fit image |
| `icon` | rain | Frosted-card weather icon |
| `reminders` | umbrella (wording 3), sunscreen (wording 1), hydration (wording 2) | Reminder icons and text |
| `summaryText` | written recommendation built from category, outfit, and reminders | Extra-info box |
| `isSample` | false | Sample-fit label; blank summary |

- The **sample state** (first visit, location denied) uses the Warm category with `isSample: true` and no weather values, so it is never shown as a real forecast.
- The temperature-swing wording names the outfit's removable outer layer.

## Content variation

Define at least three outfit variations for each recommendation category and at least three wording variations for each reminder type. Define how outfit and reminder variations are chosen independently at random, and how a previously selected date keeps the same variations, including whether they persist after the page reloads.

> **Approved by the Developer (2026-10-05).**

**Outfits:** 3 per category, 15 in total, one image pair each (`art/<category>-<n>-character.jpg` and `-fit.jpg`). Pieces follow the category table in `research.md`; each variation has its own pose and campus scene.

| Category | Variations | Art status |
|---|---|---|
| Hot | Hot 1, 2, 3 | done |
| Warm | Warm 1, 2, 3 | 1–2 done, 3 to make |
| Mild | Mild 1, 2, 3 | to make |
| Cool | Cool 1, 2, 3 | to make |
| Cold | Cold 1, 2, 3 | to make |

**Reminder wording:** 3 per reminder. `{layer}` is replaced with the current outfit's removable outer layer (e.g., "flannel").

| Reminder | Wording 1 | Wording 2 | Wording 3 |
|---|---|---|---|
| Umbrella | Rain's in the forecast. Pack an umbrella. | Good chance of rain while you're out. Bring an umbrella. | Don't get caught in the rain. Grab an umbrella. |
| Sunscreen | UV is up today. Put on sunscreen before you head out. | Strong sun while you're out. Sunscreen's a good call. | Sunscreen on: UV is high enough to burn. |
| Hydration | It's going to be hot. Carry a water bottle and refill it. | Stay hydrated: bring water and keep sipping. | Heat's up. Keep a water bottle on you all day. |
| Bundle up | Freezing temps ahead. Cover up with a hat, gloves, and a scarf. | It's below freezing out there. Don't skip the gloves and hat. | Bundle up: hat, gloves, and scarf for the freeze. |
| Temperature swing | Big temperature swing today. Wear your {layer} and take it off when it warms up. | It'll feel very different later. Your {layer} is easy to shed. | Layer up: start with your {layer}, ditch it when it heats up. |

**How picks are chosen**
- For each date, the app picks at random, independently: one outfit number (1–3) and one wording number (1–3) for each of the 5 reminder types. Picking all reminder wordings up front means a reminder that appears later (after a window change) also stays stable.
- Picks are tied to the **date only**, not the location or window. If a window change moves the date to another category, the same outfit number is used in the new category (e.g., Warm 2 → Hot 2).
- **Persistence:** picks are saved in `localStorage` and survive a reload. Picks for past dates are deleted on load.
- *Check:* reloading or returning to a date shows the same outfit and wordings; across several new dates, outfits and wordings vary independently (e.g., the same outfit with different wordings).

## Assets

List every art and graphical asset: the character, each outfit variation, icons, and any other visuals. For each, note where it appears, its format, and whether it will be created, generated, or licensed, with its credit or license.

> **Approved by the Developer (2026-10-05).**

| Asset | Count | Appears | Format | Source | Credit / license |
|---|---|---|---|---|---|
| Character images (dressed character in a soft campus scene) | 15 (3 per category) | Main-screen character card | JPEG, 848×1264, `art/<category>-<n>-character.jpg` | Generated, Google Gemini (Nano Banana 2) | "Generated with Google Gemini (Nano Banana 2) by Michael Game"; no copyright claimed (US Copyright Office) |
| Fit images (flat-lay of the outfit on white) | 15 | See the fit overlay | JPEG, 848×1264, `art/<category>-<n>-fit.jpg` | Generated, Gemini | Same as above |
| Sample fit | reuses Warm 1 | First visit, location denied | (reuses character image) | — | — |
| Weather icons: clear, partly cloudy, cloudy, fog, rain, storm, snow | 7 | Frosted icon card; "Now" line | SVG, animated (`art/icons/`) + static (`art/icons/static/`) | Licensed, Meteocons Fill | MIT, © Bas Milius; `LICENSE-meteocons.txt` shipped with the icons |
| Reminder icons: umbrella, UV, raindrop, thermometer-colder, thermometer-warmer | 5 | Reminders in the extra-info box | SVG, animated + static | Licensed, Meteocons Fill | Same as above |
| Loading sun (rays light up one by one; full brightness, no animation, under reduced motion) | 1 | Loading state | Inline SVG + CSS animation | Created | Original; no credit needed |
| Error image (variant of the loading sun; dimmed or cloud-covered, chosen during build) | 1 | Error state | Inline SVG | Created | Original; no credit needed |
| Info-screen side bars | — | Info screen, laptop | CSS (colors, no image) | Created | — |
| Site icon (browser tab) | 1 | Browser tab | SVG | Reuses Meteocons `clear-day` | MIT, as above |

- Art status is tracked in Content variation (10 of 30 images made).
- Every character image needs alt text naming the outfit and category (requirement 16); it is written when each image is added.

## Out of scope

Record features intentionally excluded from this project.

> **Approved by the Developer (2026-10-05).**

- **Locations outside the US**, and more than one saved location.
- **Celsius or other units:** °F only.
- **Forecasts beyond 7 days**, and data past midnight of the 7th date.
- **Wind and humidity** in the weather summary.
- **Severe-weather alerts or safety advice:** recommendations are suggestions, not warnings.
- **Accounts, syncing across devices, notifications, and analytics.**
- **Offline use:** the app needs a connection for live weather.
- **Share-outfit card and a separate layer alert:** considered in research and not chosen.
- **Personal fit preferences** (e.g., "I run cold"), which would change the category bands.
- **The Client's final branding and a commercial launch:** a launch would need a paid Open-Meteo plan, and AI-generated art can't be exclusively owned as-is.

## Revisions

After implementation or testing, record requirement changes and the evidence that prompted them. Update the screen drawings when a material layout or interaction changes.

## Approval

The Developer reviews and explicitly approves this specification and its screen designs before planning begins.

**Approved by the Developer in chat on 2026-10-05**, including the four sketches and the written layout changes recorded in Screen designs.

## Saving the transcript

After the Developer approves the specification, ask them to enter `save transcript`. When directed, save the complete conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.
