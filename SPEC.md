# Side Quests spec

## Facts

The only source of truth about the program. Each fact is short, atomic and verifiable in the code.

### Platform
- Markup is in `index.html`.
- Styles are in `css/styles.css`.
- Font faces are in `css/fonts.css`.
- Scripts are classic scripts in `js/`, loaded in order: `settings.js`, `background.js`, `icons.js`, `sound.js`, `app.js`, `data.js`, `effects.js`, `intro.js`.
- Font files are in `fonts/`.
- Code is formatted with Prettier at print width 100.
- The app has no build step.
- The app has no JS dependencies.
- The app is deployed on Netlify.
- The app is a PWA.
- The app installs from the website to a phone home screen.
- The manifest display mode is `standalone`.
- The service worker registers only over HTTPS.
- The service worker is stale-while-revalidate: it answers from the cache and refreshes in the background.
- A new deploy shows on the launch after it is fetched.
- The service worker caches Google Fonts responses.
- The service worker cache name is `sq-v36`.
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
- A one-off quest also has `once: true`.
- A quest turned into a one-off stores its earlier count in `from`.
- A one-off is finished once its count passes `from` (0 if unset).
- A quest's `log` keeps at most 500 entries.
- The compact-mode preference is stored under `sidequests.compact`.
- Settings are stored under `sidequests.settings`.
- Whether the intro was seen is stored under `sidequests.intro`.
- The app asks the browser for persistent storage on every load.
- Settings can export a JSON backup of quests and settings.
- Export uses the share sheet when it can share files, otherwise a download.
- Backup files are named `side-quests-YYYY-MM-DD.json`.
- Settings can import a backup, which replaces all quests.
- An import can be undone for 9 seconds.
- Imports reject files that aren't valid Side Quests backups.
- Settings show when the last backup was made.
- Unreadable saved data is kept under `sidequests.v1.unreadable` instead of being overwritten.
- A failed save shows a message instead of failing silently.
- Messages without an action hide the Undo button.

### Quests
- A quest name is at most 40 characters.
- A quest's pace is 3, 5 or 10 completions.
- The default pace is 5.
- Level n→n+1 needs `base + (n-1) * ceil(base/2)` completions.
- Quests start at level 1.
- New quests appear first in the list.
- The new-quest sheet has a One-off switch on the pace label's line.
- Turning One-off on hides the pace tiles.
- A one-off quest has no level or progress bar.
- A one-off quest shows "One-off" under its icon.
- A finished one-off leaves All and To do, fading out after the Done lock.
- A finished one-off shows under Done today on the day it was done.
- A finished one-off stays stored, so its completion still counts as a point.
- Edit can switch a quest between one-off and repeating.
- The edit screen can change a quest's completion count.
- The completion count's label and stepper share one line.
- Stepper buttons are 32px with a 44px tap target.
- There are 68 quest icons.
- The icon picker has 8px row gaps and 10px column gaps.
- The icon picker shows 4.5 rows and scrolls.
- Editing a quest scrolls the icon picker to its icon.

### Views
- The tabs are All, To do and Done today.
- "Done today" counts completions with today's date.
- A points counter shows all-time completions in Pricedown.
- The points counter shows completions today below the total.
- The all-time total ends in a pink star in a small circle of dark pink.
- The today count ends in a mint check in a small circle of dark mint.
- Each counter circle has a 1.5px inset ring slightly lighter than its fill.
- The today count is white uppercase Barlow Condensed with a 2px `#1d0030` outline, like the total.
- The points counter is top right on desktop and in the phone header.
- Tabs sit centred between Q and E chips on desktop.
- Q and E switch tabs.
- Arrow keys move between tabs.
- On desktop, Q and E switch tabs.
- On desktop, N opens a new quest.
- A shortcut legend shows bottom right on desktop only.
- A quest done today shows a mint "Done" pill.
- The pill shows "×N" when done more than once today.
- A quest done today has a mint ring around its icon.
- A quest not done today has a barely visible ring (white at 7% opacity) around its icon.
- Under each quest icon is how many completions remain to the next level.
- The progress bar is 6px tall.
- The progress bar has one rounded segment per completion needed for the next level, 3px apart.
- A newly lit segment fills left to right.
- Above 30 completions needed, the progress bar is smooth instead of segmented.
- The phone header shows no clock.
- Settings open from the sidebar on desktop and a gear in the sunset band on phones.
- The phone sunset band is one line: logo, all-time total, settings gear.
- On phones, today's count is a mint badge on the Done today tab, hidden at 0.
- The today badge is a map-marker tag: mint, 2px `#1d0030` outline, 5px corners, pointer on its left toward the label.
- The phone dock holds Quests, New quest and Cards; New quest is the wide middle button.
- Cards open from the desktop sidebar menu and the phone dock.
- The Cards sheet lists milestones at 10, 20, 50, 100, 200, 500 and 1000 all-time completions.
- A milestone shows as earned once the all-time total reaches it.
- The Cards sheet shows milestones in 3 columns.
- In the Cards sheet only the card grid scrolls; the title and Done stay put.
- A card is its milestone number in Pricedown on a background, with no illustration.
- Card finish depends on the milestone: soft foil below 50, strong holo for 50 and 100, gold from 200.
- Tapping an earned card opens it big in a viewer.
- In the viewer the card tilts toward the pointer and its foil and glare follow it.
- The viewer card arrives with one glare sweep.
- Locked milestones show their number centred, with "N to go" at the bottom.
- Crossing a milestone pops the new card up mid-screen with a glare sweep.
- The milestone card lingers, then shrinks into the Cards button, 3.4 seconds in all.
- The milestone card has no dim and nothing to dismiss; only the card itself takes taps.
- Tapping the milestone card while it's up opens it in the viewer.
- Reduced-motion users get no card tilt or card animations.
- Compact mode shows each quest as one row.
- In compact mode, tapping a row anywhere but Complete opens its edit screen.
- On desktop, compact rows show a pointer cursor.
- In compact mode, the edit button is hidden until it has keyboard focus.
- Layout switches to phone mode at 820px wide or less.

### Intro
- A four-screen intro shows on launch when there are no quests and it hasn't been seen.
- The intro screens are: welcome, keep it tiny, level it up, make it yours.
- The intro covers the screen with an opaque page-colour background.
- The intro's welcome screen shows the Sunset scene full bleed behind a large outlined logo.
- The intro's example cards are real card markup made inert.
- The level-up screen fills the last segment, then shows Level 2.
- The last intro screen sets background, compact list and sound effects live.
- Finishing the intro opens the New quest sheet.
- Skip and Escape close the intro and mark it seen.
- Arrow keys move between intro screens.
- Intro step pips look like progress bar segments.
- Settings → How it works shows the intro again.

### Feedback
- Completing a quest needs an 800ms hold.
- Releasing after the full hold time completes, even if the last animation frame hasn't run.
- While holding, a pink ring closes around the check; it is the button's only animation.
- In compact view, Complete is a round white glyph whose grey ring fills white, as in `hold-button-reference.png`.
- Releasing early cancels and shows "Hold it".
- On touch screens, the compact Complete ring scales to 1.8× while held.
- Space or Enter can be held on a focused Complete button.
- Complete is locked for 900ms after completing.
- Completing a quest plays a ding.
- Completing a quest vibrates the phone.
- Completing a quest bursts confetti from the button.
- Levelling up plays a fanfare.
- Levelling up shows a full-width "Level N" banner for 1.5 seconds.
- The level-up banner does not dim the screen.
- Every button except Complete plays a console click.
- Completions can be undone for 9 seconds.
- Deletes can be undone for 9 seconds.
- Reduced-motion users get no confetti.
- Reduced-motion users get no vibration.
- Settings can turn off sound effects, button clicks, vibration and confetti.
- Settings choose the background: Map, Sunset or Plain.
- The default background is Map.
- The Map background is a dim, seeded city map drawn on a canvas.
- Map colours are exact hexes sampled from a GTA VI map close-up: blocks `#12152f`, streets `#66677d`, main roads `#828197`, open land `#275a58`, buildings `#4c5980`/`#4b4983`/`#535e8d`, highway `#fdffff` with `#536e73` glow.
- Built-up districts are rounded navy blocks separated by light streets, with small buildings inside.
- Open districts are green land with a few buildings.
- The map has parks, arterial roads, a coast, a river, cased highways, square markers and a vignette.
- The map has no text labels.
- Map markers are 6px rounded squares in `#ddbabb`, `#9099d7` or `#9dcfa3`, outlined in `#3f394a`.
- Map markers sit only on city blocks.
- The map canvas is shown at 70% opacity.
- The Sunset background is painted on a fixed layer, not with `background-attachment: fixed`.
- The Sunset background is pure CSS: five soft radial colour pools and a faint conic sweep over a dusk linear gradient.
- Quest cards are translucent with a 14px backdrop blur.
- The points counter digits are nudged up 0.08em to centre Pricedown optically.
- Holding Complete with a mouse does not select its label.
- The map looks the same on every visit.
- On desktop, Settings and the compact toggle sit together at the bottom of the sidebar.
- On desktop, the top right shows only the points counter.
- On phones, the compact toggle is in the top bar.
- Switches are pills: a lavender track when off, a pink track when on, with a white knob, outlined in `#1d0030`.
- The compact Complete disc is pinned 6px inside its 40px ring, which is 4px thick.
- Switches use whole-pixel sizes: a 48×28 track with 2px border and padding, and a 20px knob with a 2px border.
- Settings pick the background from three tiles: Map, Sunset and Plain.
- Closing the new-quest sheet without saving keeps the typed name for next time.
- Cancel clears the new-quest draft.
- On touch screens, Enter in the name field closes the keyboard instead of submitting.
- Sheets trap keyboard focus.
- Opening a sheet moves focus into it.
- The quest list is not an ARIA live region.
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
- Chrome colours are sampled from `ui-reference.png`: surface `#1c1c27`, page `#12131b`, pink `#eb66a2`.
- The logo sits on a sunset gradient band.
- The app icon is the SIDE QUESTS logo in Pricedown over the Sunset background gradient.
- The icon's text stays inside the central 80% so maskable crops keep it.
- The desktop sidebar is solid dark chrome with no diagonal seam.
- The phone header is a flat sunset band with no slanted edge.
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

### 2026-11-20 — Rule: rewards stay in the background
The app is an extension of your life. It adds some dopamine, but it never pulls focus away from doing things. Celebrations stay short and don't block the screen. Level-up is now 1.5 seconds with no screen dim. Facts: level-up duration, no dim.

### 2026-11-20 — Hold to complete
Complete now needs a short hold (450ms). It adds intention, and it stops double taps from counting twice. A pink ring closes around the check while the button fills, modelled on game hold prompts. No official GTA VI documentation of the hold visual was found; the ring is a common game convention. Complete is locked for 900ms after completing. The loud Complete button style is intentional and stays.

### 2026-11-20 — Done-today signifier
Quests can be done more than once, so done quests aren't dimmed. A mint pill ("Done", "Done ×2") and a mint icon ring mark quests done at least once today. Mint comes from the green pill in `ui-reference.png`. "Not done yet today" was removed.

### 2026-11-20 — Points counter, legend, tabs
- The sidebar summary (hard to read on the sunset glow) is replaced by a points counter in Pricedown, like the money counter.
- Tabs are centred between working Q/E chips.
- Desktop shortcuts with a bottom-right legend.
- A waypoint-style "N to Lv X" line under each icon replaces the meta row.
- The progress bar is thicker.
- The phone header is shorter and has no clock.

### 2026-11-20 — Settings, safety and accessibility
- Settings sheet for sound, clicks, vibration, confetti and compact view. No mute button on the main screen.
- Undo lasts 9 seconds.
- New-quest drafts survive accidental closes.
- Sheets move focus in and trap it.
- Tabs support arrow keys.
- The list is no longer re-announced on every change.
- Input borders have more contrast.

### 2026-11-20 — Polish pass
- On desktop the points counter sits on one line in the top bar ("10 today 8").
- On phones the undo bar slides behind the dock instead of across it.
- The "Level" label uses the condensed uppercase style, like the other small labels.
- The name field's placeholder contrast is raised to 4.9:1.
- Page scrollbars use the app's colours.
Cache bumped to `sq-v11`.

### 2026-11-20 — One hold animation, cleaner sidebar, reference colours
- Complete had a face fill, ring, pink bar and cyan flash. Now only the ring animates, and a full ring means done. Confetti and sound stay as the reward.
- Compact Complete copies GTA VI's hold glyph: a white disc with a grey ring that fills white.
- The palette moved from saturated indigo to the reference's neutral blue-charcoal chrome and softer pink. Selected tiles are flatter and lighter, like the reference.
- The sidebar's glow blob and diagonal seam are gone. The sunset now lives only in a band behind the logo, on desktop and phone.
Cache bumped to `sq-v12`.

### 2026-11-20 — Backgrounds, settings placement, top right
- Without a map the content area felt empty. Added backgrounds in Settings: **Map** (default), a dim procedural city in the reference's map colours with districts, parks, coast, river and highways; **Sunset**, a dusk gradient; **Plain**. All are kept dim so they don't pull focus.
- On desktop, Settings moved to the bottom of the sidebar, apart from the quest actions.
- The top right belongs to the points counter, like the money in GTA. The compact toggle left the desktop top bar; it stays in Settings, and in the phone top bar.
Cache bumped to `sq-v13`.

### 2026-11-20 — Better map and sunset, blurred cards, compact toggle by Settings
- The first map looked crude. The new one has smooth district shapes filled with city blocks, smooth coast and river edges, cased highways, faint POI blips and a vignette. Colours still come from the reference.
- The sunset now has a warm horizon glow under a violet sky, with more gradient stops.
- Cards are translucent with a backdrop blur, like the reference's info panel.
- The compact toggle moved out of Settings to sit beside it at the bottom of the sidebar.
- Pricedown digits are optically centred.
- Holding Complete no longer selects its label text.
Cache bumped to `sq-v14`.

### 2026-11-20 — Map closer to the reference, sunset as a scene
- The map now draws like the reference without copying it: two land types (violet built-up, teal-green open), uneven building footprints, brighter highways, small square markers and faint made-up district names. It's still zoomed in, so it never gets busy.
- The sunset is now a drawn scene instead of a single gradient: layered sky, a warm glow, thin cloud streaks, a sun cut by widening bands sinking behind a city skyline with a few lit windows, and its broken reflection on the water. The colours are unchanged.
Cache bumped to `sq-v15`.

### 2026-11-20 — Removed map place names
The faint district names looked bad, so the map has no text now.

### 2026-11-20 — Sunset back to a gradient
The drawn sunset scene went further than asked. Sunset is now a layered CSS gradient: warm pools rising from the bottom right, violet settling top left, over a dusk base. Same colours, more depth than a single linear fade.

### 2026-11-20 — Bigger map markers
Markers grew from 3–4px to 5–6px, with 1.5px rounded corners and a dark outline so they read as map icons.

### 2026-11-20 — Exact map colours
The map uses exact colours sampled from the user's GTA VI map close-up. City blocks are now navy rounded blocks with light streets between them, like the reference. Markers use the reference's peach, periwinkle and mint with its dark outline, and only sit on blocks (some had landed in water). The vignette still darkens the edges.

### 2026-11-20 — Dimmer map
The whole map canvas is shown at 70% opacity so it pulls less attention. Individual colours are unchanged.

### 2026-11-20 — New app icon
The home-screen icon now shows the real logo text (SIDE QUESTS in Pricedown, white with the dark outline) over the same layered gradient as the Sunset background. The text is sized to survive Android's round crop.

### 2026-11-20 — Protect against data loss
Deleting the home-screen app on iPhone, or clearing site data, wipes local storage. Added:
- persistent-storage request;
- Export backup / Import backup in Settings (share sheet "Save to Files" on phones, download elsewhere);
- "Last backup" note in Settings, kept quiet per the no-pulling-focus rule (no nag);
- import validation and undo;
- unreadable data is parked, never overwritten;
- failed saves are reported.

### 2026-11-21 — Meaningful icon ring, segmented progress
- The pink ring around every icon was decoration. Now the icon has no ring until the quest is done today, then a mint ring. That's also the done signal in compact view, where the pill is hidden.
- The progress bar is split into one segment per completion needed, so a quick quest shows a few chunky steps and a long-haul quest many small ones. Segments went on the bar, not the ring: at 20–25 segments a 40px ring turns into a blur. Above 30 it falls back to a smooth bar.
- Storage format unchanged: no migration, nobody loses progress.
Cache bumped to `sq-v23`.

### 2026-11-21 — Rounded segments, reliable hold
- Segments are now separate rounded pieces instead of a masked bar, which had cut them square.
- Hold time is 800ms (changed in the code; fact updated to match).
- Letting go after the full hold time now always completes. Slow phones can drop the last animation frame, which made a full hold count as an early release.
Cache bumped to `sq-v24`.

### 2026-11-21 — Faint ring back, segment fill animation
The icon ring is back as a barely visible outline (white at 7%), still turning mint when done today. Each segment now fills left to right as it lights up, keeping the bar's old motion.
Cache bumped to `sq-v25`.

### 2026-11-21 — Performance
Measured with 4× CPU slowdown on a phone-size screen: the map draws in about 20ms and scrolling holds 60fps, so the app itself is light. Fixed the real-world costs:
- the service worker now answers from the cache instantly and refreshes in the background, instead of waiting on the network every launch;
- the Sunset gradient sits on a fixed layer, so phones no longer repaint it on every scroll frame;
- the browser connects to the icon-font server early.
Trade-off: a new deploy appears on the second launch after it goes live.
Cache bumped to `sq-v26`.

### 2026-11-21 — Enter doesn't submit on phones
Pressing Done/Enter on the phone keyboard after typing a name created the quest and closed the sheet before you could pick an icon or pace. On touch screens it now just closes the keyboard. Desktop Enter still submits.

### 2026-11-21 — One-off quests, hold to edit in compact
- One-off quests ("temporary quests" from Open). A fourth pace tile crowded the sheet, so One-off is a small switch on the pace label's line instead: no new row, and the pace tiles hide when it's on. Finished one-offs stay stored so points stay honest, show in Done today for the day, then are hidden.
- Compact mode: hold a row to edit, instead of tapping the name. It keeps compact free of extra controls; the edit button stays reachable by keyboard.
Cache bumped to `sq-v28`.

### 2026-11-21 — Any quest can become a one-off
Edit can now turn a repeating quest into a one-off. Its past completions are kept in `from` so they still count as points, and only the next completion finishes it. Compact rows show a pointer cursor on desktop.
Cache bumped to `sq-v30`.

### 2026-11-21 — Bigger hold ring in compact on phones
The finger hid the small compact ring while holding. It now grows to 1.8× while held, so the fill shows around the fingertip.
Cache bumped to `sq-v31`.

### 2026-11-21 — Counter badges
Like the money counters in `ui-reference.png`, each counter line ends in a glyph in a small circle, a dark shade of the glyph colour: a pink star for all-time completions, a mint check (the done colour) for today. Each circle has a lighter inset ring. The today label lost its dark box on phones and gets the total's outlined text instead.
Cache bumped to `sq-v32`.

### 2026-11-21 — Tap to edit in compact
Holding a row to edit felt slow. A plain tap anywhere on the row (except Complete) now opens edit.
Cache bumped to `sq-v33`.

### 2026-11-21 — First-run intro
A designated intro instead of scattered hints, kept to four screens (simple apps need about three to five). It teaches the three things that matter (keep quests tiny, repeat to level up, make it yours) and ends inside the real loop by opening the New quest sheet. Hold-to-complete is mentioned in passing, not taught. Examples use real card markup so they look exactly like the app. The customise screen changes the real settings. The intro is opaque, so the app behind it doesn't compete. Shown once to people with no quests; replayable from Settings.
Cache bumped to `sq-v34`.

### 2026-11-21 — Pill switches, background tiles
"‹ Off ›" in dim grey read as disabled, and the arrows were too small to signal anything on a phone. Switches now use the reference's pill toggle (lavender off, pink on, white knob, dark outline). The background setting, which cycled on tap, is now three tiles like the pace picker and the intro, so every option is visible and one tap away.
Cache bumped to `sq-v35`.

### 2026-11-21 — Slimmer phone header, dock nav, Cards placeholder
The phone header took about 150px before the first quest. The sunset band is now one line (logo, total, gear), and today's count moved to a badge on the Done today tab. The dock became the phone nav, with Quests and Cards on either side of New quest, so the coming card collection has a home without crowding the top. Cards is a placeholder for now: a sheet of milestones, no card art yet.
Cache bumped to `sq-v36`.

### 2026-11-21 — Holo cards and milestone glint
Nobody here illustrates, so a card is its milestone number on the sunset, and the shine is code: a rainbow foil and a glare that follow the pointer while the card tilts. Rarity is the finish (foil, holo, gold) so it costs no art. Reaching a milestone doesn't open the card over the screen, per the rewards-stay-in-the-background rule: a small card slides in with a glint and leaves on its own; tapping it opens the big view.

### 2026-11-21 — Milestone card pops, then stashes
The rule against blocking means no chains of screens or buttons to click through, not "keep it tiny". So the new card pops up mid-screen and glints, stays a moment, then flies into the Cards button. Nothing to dismiss, no dim. It replaces the corner toast. Locked milestone numbers are now centred and bigger.

### Open
**Accepted, to build**
- "Pick one for me" random quest button.
- Reorder and pin quests; time-of-day groups.
- Desktop sidebar as a narrow icon column for categories or time-of-day groups (waits on groups existing).

**Maybe**
- Statistics: how many quests were done (per day, week, all time).
- Categories for quests.
- One gentle reminder to open the app (never per-task).
- Gentle daily goal ("3 quests today") with no penalty. Not discussed yet.

**Pinned for later**
- Themes, unlocked by levels. A plain calm theme is unlikely.
- Unlockable sounds and sound customisation.
- Guess a new quest's icon from its name.
