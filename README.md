# Side Quests

A to-do app that works like a game. Each task is a **quest**: one small step you can do in about a minute, like "put on shoes" or "drink a glass of water". Each time you do it, press and hold **Complete**. You get a sound, a little buzz and a burst of confetti, and the quest moves toward its next level.

It's made for brains that struggle to start things, including ADHD, autistic and other neurodivergent brains. Most to-do apps reward you for finishing big things. Side Quests rewards you for starting small things, and it rewards you right away and every time.

## Why it works this way

- **Teeny tiny tasks.** This is the core of the app. A quest is the smallest step that still counts, like "put on shoes" instead of "go for a run". Big tasks are never broken down for you. You write the tiny step yourself, and the app rewards each one.
- **Small steps.** The create screen asks for "one step you can do in 1 to 8 minutes". Small steps are easier to start, and starting is usually the hard part.
- **A reward every time.** Every tap plays a sound, vibrates the phone, throws confetti and fills the progress bar. Nothing has to be finished first.
- **Levels instead of checkboxes.** Quests don't disappear when you do them. They level up, so a habit you repeat keeps building a visible record.
- **You choose the pace.** A quest levels up every 3, 5 or 10 completions. After that, each level needs a little more than the last.
- **Nothing punishes you.** There are no streaks to break, no overdue items and no red badges. "Done today" resets each day and your levels stay. Missing a day, or a week, costs you nothing.
- **Mistakes are easy to fix.** Every completion and delete can be undone for 9 seconds. You can also correct the count from the edit screen.

## Install it on your phone

Side Quests is a Progressive Web App (PWA). You install it from the website and it works like a regular app, with its own icon, full screen and offline.

1. Open the Netlify site on your phone: `https://<your-site>.netlify.app`
2. Add it to your home screen:
   - **iPhone/iPad (Safari):** tap the Share button, then **Add to Home Screen**.
   - **Android (Chrome):** tap **⋮**, then **Install app** (or **Add to Home screen**).
3. Open it from the home screen icon.

Your quests are saved on your device (in `localStorage`). They don't sync between devices, and clearing the browser's site data deletes them.

## Project structure

There's no build step and no dependencies. It's plain HTML, CSS and JavaScript.

| File | What it does |
| --- | --- |
| `index.html` | Markup. |
| `css/styles.css` | All styles. |
| `css/fonts.css`, `fonts/` | Display and text fonts. Icons come from Material Symbols on Google Fonts. |
| `js/icons.js` | Quest icon list and labels. |
| `js/sound.js` | Web Audio sound effects. |
| `js/app.js` | Quests, storage, levels and UI. |
| `js/effects.js` | Level-up banner and confetti. |
| `SPEC.md` | Facts about the app and a log of design decisions. |
| `manifest.webmanifest` | PWA metadata: name, colors, icons and standalone display mode. |
| `sw.js` | Service worker. Loads from the network first and falls back to the cache when offline. |
| `icon-192.png`, `icon-512.png` | App icons (the 512px one is maskable). |

## Run it locally

Serve the folder with any static server:

```sh
npx serve .
# or
python -m http.server 8000
```

The service worker only registers over HTTPS, so offline mode and installing only work on the deployed site.

## Deploy

Drag the folder into Netlify, or connect the repo with no build command and `.` as the publish directory. If you change any cached file, bump the cache name in `sw.js` (for example `sq-v9` → `sq-v10`) so installed copies get the new version.

## Data model

Quests are stored under the `sidequests.v1` key:

```js
{ id, name, icon, base /* 3 | 5 | 10 */, count, log: [/* date strings, last 500 */] }
```

To get from level *n* to level *n+1* you need `base + (n-1) * ceil(base/2)` completions.
