# Side Quests spec

## Facts

The only source of truth about the program. Each fact is short, atomic and verifiable in the code.

### Platform
- Markup is in `index.html`.
- Styles are in `css/styles.css`.
- Font faces are in `css/fonts.css`.
- Scripts are classic scripts in `js/`, loaded in order: `icons.js`, `sound.js`, `app.js`, `effects.js`.
- Font files are in `fonts/`.
- Code is formatted with Prettier at print width 100.
- The app has no build step.
- The app has no JS dependencies.
- The app is deployed on Netlify.
- The app is a PWA.
- The app installs from the website to a phone home screen.
- The manifest display mode is `standalone`.
- The service worker registers only over HTTPS.
- The service worker is network-first.
- The service worker falls back to cache when offline.
- The service worker caches Google Fonts responses.
- The service worker cache name is `sq-v9`.
- The service worker precaches every app file.
- `netlify.toml` publishes the folder with no build.
- `sw.js` is served with `Cache-Control: no-cache`.
- `manifest.webmanifest` is served with `Cache-Control: no-cache`.
- Icons are never locked.

### Data
- Quests are stored in `localStorage`.
- The storage key is `sidequests.v1`.
- Data does not sync between devices.
- A quest has `id`, `name`, `icon`, `base`, `count` and `log`.
- A quest's `log` keeps at most 500 entries.
- The compact-mode preference is stored under `sidequests.compact`.

### Quests
- A quest name is at most 40 characters.
- A quest's pace is 3, 5 or 10 completions.
- The default pace is 5.
- Level n→n+1 needs `base + (n-1) * ceil(base/2)` completions.
- Quests start at level 1.
- New quests appear first in the list.
- The edit screen can change a quest's completion count.
- There are 68 quest icons.
- The icon picker has even 8px gaps.
- The icon picker shows 4.5 rows and scrolls.
- Editing a quest scrolls the icon picker to its icon.

### Views
- The tabs are All, To do and Done today.
- "Done today" counts completions with today's date.
- The sidebar shows completions today.
- The sidebar shows all-time completions.
- Compact mode shows each quest as one row.
- In compact mode, tapping a quest name opens its edit screen.
- Layout switches to phone mode at 820px wide or less.

### Feedback
- Completing a quest plays a ding.
- Completing a quest vibrates the phone.
- Completing a quest bursts confetti from the button.
- Levelling up plays a fanfare.
- Levelling up shows a full-width "Level N" banner.
- Every button except Complete plays a console click.
- Completions can be undone for 5 seconds.
- Deletes can be undone for 5 seconds.
- Reduced-motion users get no confetti.
- The app has no streaks.
- The app has no overdue states.

### Look
- Icons are Material Symbols Rounded.
- Icons are always filled.
- Icon grade is -25 for light glyphs on dark surfaces.
- Icon grade is 0 for dark glyphs on light surfaces.
- Icon optical size is 20, or 24 in the icon picker.
- Icons load as a Google Fonts subset of only the icons used.
- The theme is dark only.
- The display fonts are Pricedown, Barlow and Barlow Condensed.

## Decisions

Newest last. Each entry is dated and lists the facts it added or changed.

### 2026-11-20 — Write the README
README explains purpose, install steps, structure and data model.

### 2026-11-20 — No punishment
Missing days costs nothing. Facts: no streaks, no overdue states.

### 2026-11-20 — Compact mode
A toggle in the tab bar shows quests as single rows so more fit on screen. Edit moves to tapping the name. Facts: compact-mode row, tap-name-to-edit, `sidequests.compact`.

### 2026-11-20 — Console click on buttons
Every button except Complete plays a short click (filtered noise + square tick). Complete keeps its own ding so the sounds don't stack.

### 2026-11-20 — Material Symbols Rounded, filled
Replaced hand-drawn SVG icons. Rounded fits the soft game style. Uses only the FILL, GRAD and opsz axes, plus a fixed weight of 400. Grade -25 stops light icons on dark backgrounds from looking heavier than dark icons on light faces. Optical size follows the rendered size (20/24). Icons load via Google Fonts `icon_names` subset to keep the download small. The service worker now caches font responses so icons work offline (cache bumped to `sq-v7`).

### 2026-11-20 — Bigger icon list, scrollable picker
Grew from 16 to 68 icons covering hygiene, chores, food, health, movement, sleep, social, work, creative, money, home and fun. The old 16 keys stay so saved quests keep their icons. The picker uses equal 8px gaps, with tiles stretching to fill each row. Left padding keeps room for the pink selection bar. It shows 4.5 rows so the cut-off row signals scrolling. Cache bumped to `sq-v8`.

### 2026-11-20 — Split into readable files
`index.html` was one 210 KB file of minified code and base64 fonts. It's now split into `css/`, `js/` and `fonts/`, formatted with Prettier. The scripts stay plain classic scripts sharing globals, so there's still no build step. The service worker precaches all files (cache `sq-v9`).

### 2026-11-20 — Triage of open ideas
- Tiny tasks are the core. Quests are never split from big tasks; they are written tiny from the start. Categories are the most structure allowed.
- Icons are never locked behind levels.
- Rejected: two-level icon hierarchy, variable rewards, player-wide XP bar, starter templates, task breakdown.
- Accepted, not built: random quest, reorder/pin and time-of-day groups, effect settings, JSON backup.
- Install prompt: left to the browser (Chrome shows its own).
- Reminders: at most a nudge to open the app, never per-task.

### 2026-11-20 — Netlify headers
`netlify.toml` publishes the folder as-is and serves `sw.js` and the manifest with `Cache-Control: no-cache`, so updates reach installed apps. Facts: Netlify config, no-cache headers.

### Open
**Accepted, to build**
- Export/import JSON backup and `navigator.storage.persist()`. This is the biggest data-loss risk.
- Settings for sound, vibration and confetti intensity.
- "Pick one for me" random quest button.
- Reorder and pin quests; time-of-day groups.

**Maybe**
- Statistics: how many quests were done (per day, week, all time).
- Temporary quests: one-off quests that go away once done.
- Categories for quests.
- One gentle reminder to open the app (never per-task).
- Gentle daily goal ("3 quests today") with no penalty. Not discussed yet.

**Pinned for later**
- Themes, unlocked by levels. A plain calm theme is unlikely.
- Unlockable sounds and sound customisation.
