/* Settings: effects the user can turn off. Loaded first so every other script can read SET. */
const SKEY = "sidequests.settings";
const SET = { sound: true, click: true, vibe: true, fx: true, bg: "map" };
try {
  Object.assign(SET, JSON.parse(localStorage.getItem(SKEY)) || {});
} catch (e) {}
const saveSet = () => {
  try {
    localStorage.setItem(SKEY, JSON.stringify(SET));
  } catch (e) {}
};
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
