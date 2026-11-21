/* First-run intro: four short screens shown once, when there are no quests yet.
   It ends by opening the New quest sheet, so the first thing you do is real.
   Settings → How it works shows it again. */
const IKEY = "sidequests.intro";
const STEPS = 4;
let step = 0,
  introFocus = null,
  levelT = [];

const demo = (count) =>
  cardHTML({ id: 0, name: "Put on shoes", icon: "shoe", base: 5, count, log: [] });

function introSeen() {
  try {
    return localStorage.getItem(IKEY) === "1";
  } catch (e) {
    return true; // can't remember it, so don't risk showing it every launch
  }
}

function syncIntroPrefs() {
  $("introBg")
    .querySelectorAll("[data-bg]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.bg === SET.bg));
  $("introCompact").setAttribute("aria-checked", compact);
  $("introSound").setAttribute("aria-checked", SET.sound);
}

// Step 3: the last segment fills, then the card ticks over to Level 2.
function playLevel() {
  levelT.forEach(clearTimeout);
  const box = $("introCard2");
  box.innerHTML = demo(4);
  if (reducedMotion()) {
    box.innerHTML = demo(5);
    return;
  }
  levelT = [
    setTimeout(() => box.querySelectorAll(".track i")[4]?.classList.add("on"), 700),
    setTimeout(() => {
      box.innerHTML = demo(5);
      box.querySelector(".lv b").classList.add("bump");
    }, 1500),
  ];
}

function goStep(n) {
  const from = n > step ? "24px" : "-24px";
  step = Math.max(0, Math.min(STEPS - 1, n));
  document.querySelectorAll(".intro-step").forEach((s, i) => {
    s.style.setProperty("--from", i < step ? "-24px" : i > step ? "24px" : from);
    s.classList.toggle("on", i === step);
    s.setAttribute("aria-hidden", i !== step);
  });
  document.querySelectorAll(".intro-pips i").forEach((p, i) => p.classList.toggle("on", i <= step));
  $("intro").classList.toggle("welcome", step === 0);
  $("introBack").hidden = step === 0;
  $("introNext").textContent =
    step === 0 ? "Let’s go" : step === STEPS - 1 ? "Make my first quest" : "Next";
  if (step === 2) playLevel();
  setTimeout(() => document.querySelector(".intro-step.on h2").focus(), 30);
}

function openIntro() {
  introFocus = document.activeElement;
  $("introCard1").innerHTML = demo(2);
  syncIntroPrefs();
  $("intro").hidden = false;
  goStep(0);
}

function closeIntro(toNewQuest) {
  levelT.forEach(clearTimeout);
  $("intro").hidden = true;
  try {
    localStorage.setItem(IKEY, "1");
  } catch (e) {}
  if (toNewQuest) openForm();
  else introFocus && introFocus.focus && introFocus.focus();
}

$("introNext").onclick = () => (step === STEPS - 1 ? closeIntro(true) : goStep(step + 1));
$("introBack").onclick = () => goStep(step - 1);
$("introSkip").onclick = () => closeIntro(false);
$("introBg").onclick = (e) => {
  const b = e.target.closest("[data-bg]");
  if (!b) return;
  SET.bg = b.dataset.bg;
  saveSet();
  applyBg();
  syncIntroPrefs();
};
$("introCompact").onclick = () => {
  setDensity(!compact);
  syncIntroPrefs();
};
$("introSound").onclick = () => {
  SET.sound = !SET.sound;
  saveSet();
  syncIntroPrefs();
};
$("setIntro").onclick = () => {
  closeSettings();
  openIntro();
};

// Keys: arrows move between steps, Escape skips, Tab stays inside.
$("intro").addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeIntro(false);
  else if (e.key === "ArrowRight" && !e.target.closest(".choices")) goStep(step + 1);
  else if (e.key === "ArrowLeft" && !e.target.closest(".choices")) goStep(step - 1);
  else if (e.key === "Tab") {
    const f = [...$("intro").querySelectorAll("button")].filter(
      (x) => !x.hidden && x.offsetParent && !x.closest(".intro-step:not(.on)"),
    );
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
});

if (!tasks.length && !introSeen()) openIntro();
