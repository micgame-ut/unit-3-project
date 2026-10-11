# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved specification into an ordered, trackable build and verification plan.

## Instructions for the Developer

Set priorities, review the checklist, verify results rather than relying only on the Agent's report, and keep the project documents current as the work changes. Expect the build to take many rounds of testing and fixing; record material changes under Revisions.

To begin planning, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me create the Project 3 implementation plan.`

After approving the plan, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me implement the approved Project 3 plan in working checkpoints.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, `spec.md`, and this file, then inspect the relevant project files. Propose concrete tasks and checks without expanding the approved scope.

During implementation, follow the approved plan in working checkpoints and keep it current. Never mark approvals or items requiring Developer verification complete on the Developer's behalf.

## Approach

Summarize the structure, data flow, dependencies, task order, and main risks.

> **Approved by the Developer (2026-10-11).** Stack, image handling, and missing-art handling chosen by the Developer on 2026-10-11.

**Stack (Developer, 2026-10-11):** plain HTML, CSS, and JavaScript modules, with no framework, build step, or installs (Node and Python aren't installed). The repo root deploys to GitHub Pages as-is.

**Structure**
- `index.html`: both screens (main and info) in one page; the info screen is shown and hidden in place, so returning keeps the main screen's state (req. 12).
- `css/styles.css`: color tokens, phone single-column order, laptop two-column layout from 900px up.
- `js/`, one module per job:
  - `rules.js`: pure functions for the out window, category, reminders, and window icon. No DOM or network, so they can be tested alone.
  - `content.js`: the outfit table (alt text and removable outer layer per outfit), reminder wordings, and weather-code to icon map.
  - `weather.js`: Open-Meteo geocoding and forecast requests, BigDataCloud reverse geocoding, and rounding coordinates to 2 decimals.
  - `variation.js`: per-date random picks, saved in `localStorage`; past dates cleared on load.
  - `state.js`: builds the one recommendation state from the selections, weather, and picks.
  - `render.js`: draws every output from that state.
  - `main.js`: wires controls, storage, and screen states.
- `img/`: compressed copies of the character and fit images (Developer, 2026-10-11), made by `scripts/compress-images.ps1` from the originals in `art/`. `art/icons/` is used directly.
- `tests.html` + `js/tests.js`: browser test page for `rules.js` and `variation.js`, covering the boundary cases in req. 8 and 10.
- `scripts/serve.ps1`: a small local web server (localhost counts as a secure origin, so geolocation works).

**Data flow:** location change → one Open-Meteo request (cached) → date and window pick the hours → `rules.js` returns category, reminders, icon → `variation.js` adds the outfit and wordings → `state.js` returns the recommendation state → `render.js` updates every output together and announces the change to screen readers.

**Missing art (Developer, 2026-10-11):** build continues while Cool 3 and Cold 1–3 are still to make. Until then, a missing variation falls back to one that exists in the same category, and Cold uses a temporary placeholder. The fallback is removed once all 30 images are in.

**Main risks**
- **Hour handling:** the window crosses midnight and uses the location's time zone, not the device's. Mitigation: request `timezone=auto`, index hours by the API's local time strings, and test the req. 10 examples on the test page.
- **Text over 3D scenes:** contrast can fail on bright backgrounds. Mitigation: text sits on the frosted card or solid panels; check contrast in the accessibility checkpoint.
- **Art downloads:** Chrome allows one Gemini download per restart; the last 8 images will take longer to save.
- **Free-tier limits:** Open-Meteo's free tier is non-commercial (fine for a prototype; noted in research). Gemini allows about 20 images a day.

## Checklist

### Approvals

- [x] Research approved (Developer, 2026-10-05)
- [x] Specification approved (Developer, 2026-10-05)
- [x] Plan approved (Developer, 2026-10-11)

### Build

- [ ] Create or source the assets listed in `spec.md`, starting early (22 of 30 images done; Cool 3 and Cold 1–3 remain)
- [x] **1. Scaffold:** `index.html`, CSS tokens, module files, `serve.ps1`, and `compress-images.ps1`. *Result:* the page loads at localhost with the compressed images in `img/`. *Verified by Developer, 2026-10-11.*
- [x] **2. Rules engine:** `rules.js` (out window, category, reminders, window icon) and the browser test page. *Result:* every boundary case in req. 8 and 10 passes on `tests.html`. *Verified by Developer, 2026-10-11 (52 of 52 tests pass).*
- [x] **3. Location and weather data:** US-only search with a pick list, "Use my location" with rounding and BigDataCloud naming, the Open-Meteo forecast request, and the saved last location. *Result:* req. 1–4 checks pass in the network and storage panels. *Verified by Developer, 2026-10-11, including "Use my location."*
- [x] **4. Recommendation state and variation:** `state.js` and `variation.js`, with picks saved per date and past dates cleared. *Result:* reloading or revisiting a date shows the same outfit and wordings; new dates vary independently. *Verified by Developer, 2026-10-11.*
- [x] **5. Main screen, phone:** character card, frosted icon card with pause, day name, Now and Forecast lines, reminders, written recommendation, Open-Meteo credit, all drawn from the state. *Result:* req. 6, 7, and 14 (phone) pass at 320px and 390px. *Verified by Developer, 2026-10-11.*
- [ ] **6. Controls:** date picker (7 dates), out-window control, See the fit overlay. *Result:* req. 5, 10, 11, and 15 pass.
- [ ] **7. Laptop layout:** two columns from 900px up. *Result:* req. 14 passes at 1280px+.
- [ ] **8. States:** loading sun, error image, location denied, first-visit sample fit, "No US location found." *Result:* each req. 13 state triggers on purpose.
- [ ] **9. Info screen:** all sections, Forget location, and back without losing state. *Result:* req. 12 and 18 pass.
- [ ] **10. Accessibility and privacy pass:** keyboard, focus, alt text, live region, contrast, reduced motion. *Result:* req. 16 and 17 checks pass.
- [ ] **11. Finish art:** generate, compress, and add Cool 3 and Cold 1–3; remove the fallback. *Result:* all 15 outfits show their own images.
- [ ] Use the approved screen drawings to guide layout and interaction work
- [ ] Keep one recommendation state driving every visual and written output
- [ ] Test and fix each checkpoint against the specification before starting the next
- [ ] Commit meaningful working checkpoints
- [ ] Deploy to a public HTTPS URL

### Verify and revise

- [ ] Check every specification requirement
- [ ] Test multiple locations, current and forecast dates, recommendation categories, outfit and reminder variations, and failure states
- [ ] Verify that eligible outfit and reminder variations are selected independently rather than as fixed pairs
- [ ] Verify that returning to a previously selected date shows the same variations
- [ ] Test the deployed app, independently of the local version, on a real phone and a laptop, including both screens, accessibility, and one-handed controls
- [ ] Prepare the usability test below
- [ ] Test with three peers and record each session
- [ ] Add the chosen improvement to this checklist, and update `spec.md` if the intended result changes
- [ ] Implement, verify, and redeploy at least one meaningful revision

### Deliver

- [ ] Confirm all brief deliverables, sources, privacy information, and asset credits
- [ ] Save all chat transcripts
- [ ] Complete the debrief

## Usability testing

Before testing, record the purpose, a few realistic tasks, non-leading prompts, and a consistent note format. For each session, use a non-identifying label and record the task, what the tester did or said, successes, barriers or questions, and possible changes. Keep observations separate from interpretations. After all three sessions, summarize the strongest findings and the improvement they support.

## Revisions

Record material plan changes and why they were made.

## Saving transcripts

At the end of planning, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.

At the end of every implementation chat, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/build-YYYY-MM-DD_HHMMSS.md` using the same formatting.
