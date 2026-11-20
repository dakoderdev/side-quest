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
- Scripts share globals and load in order (`settings.js`, `icons.js`, `sound.js`, `app.js`, `effects.js`). Keep that order in mind when adding top-level code.
- Format with `npx prettier --write --print-width 100 index.html css js sw.js`.
- New files must be added to the precache list in `sw.js`.
- When you change any cached file, bump the cache name in `sw.js`, and update the fact that records it.
- Adding an icon means adding its name to the Google Fonts `icon_names` list (kept in alphabetical order).

## Design rules
- The app is an extension of the user's life. It adds some dopamine but never pulls focus away from doing things. Celebrations stay short and never block the screen.
- The loud Complete button is intentional.

## Asking the user
- Don't use multiple-choice question menus. Write questions out in the chat as plain text, and the user will answer there.
