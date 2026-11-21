# Agent instructions

`SPEC.md` is the source of truth for this project. Read it before changing anything.

## SPEC.md rules
- **Facts** (top of the file) are the only source of truth about the program.
- Each fact must be short, atomic (it can't be split or shortened) and verifiable in the code.
- **Decisions** (below the facts) log every design or behaviour decision.
- Every decision gets a date (`YYYY-MM-DD`) and a short reason.
- Every decision must add, change or remove facts. Update the Facts list in the same change.
- If the code and a fact disagree, fix one of them, then log a decision.
- Undecided ideas go under **Open**, not in Facts.

## Project notes
- No build step. Edit the files directly: `index.html` (markup), `css/styles.css`, `js/*.js`.
- Scripts share globals and load in order (`settings.js`, `background.js`, `icons.js`, `sound.js`, `app.js`, `data.js`, `effects.js`). Keep that order in mind when adding top-level code.
- Format with `npx prettier --write --print-width 100 index.html css js sw.js`.
- New files must be added to the precache list in `sw.js`.
- When you change any cached file, bump the cache name in `sw.js`, and update the fact that records it.
- Adding an icon means adding its name to the Google Fonts `icon_names` list (kept in alphabetical order).

## Commit names
- The user makes the commits. Don't commit or push unless the user explicitly says to; when asked for a commit name, just suggest one.
- Lowercase, short, no trailing period, no prefix like `feat:`.
- Start with a verb or name the feature; join several changes with commas or "and".
- Examples: `add one-off quests and hold to edit in compact`, `counter icons, bigger compact hold ring on phones`.

## Design rules
- The app is an extension of the user's life. It adds some dopamine but never pulls focus away from doing things. Celebrations stay short and never block the screen.
- The loud Complete button is intentional.

## Asking the user
- Don't use multiple-choice question menus. Write questions out in the chat as plain text, and the user will answer there.
