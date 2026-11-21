const KEY = "sidequests.v1";
let tasks = [];
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    tasks = JSON.parse(raw);
    if (!Array.isArray(tasks)) throw new Error("not a list");
  }
} catch (e) {
  // Never overwrite data we can't read: park it under another key before starting fresh.
  try {
    localStorage.setItem(KEY + ".unreadable", localStorage.getItem(KEY));
  } catch (_) {}
  tasks = [];
}
tasks.forEach((t) => {
  if (!ICONS[t.icon]) t.icon = EMOJI[t.icon] || "star";
});
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {
    // Storage full or blocked: say so instead of losing progress silently.
    snack("Couldn't save. Export a backup from Settings.", null);
  }
};
const $ = (id) => document.getElementById(id);
const today = () => new Date().toDateString();
const doneToday = (t) => t.log.filter((d) => d === today()).length;
// A one-off quest is finished once it's done. It stays stored (its point still counts),
// shows under "Done today" for the rest of the day, then is hidden for good.
// A quest turned into a one-off keeps its past completions in `from`, so only a new one finishes it.
const finished = (t) => t.once && t.count > (t.from || 0);
const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let filter = "all",
  icon = "shoe",
  pace = 5,
  once = false,
  editing = null,
  draftCount = 0;

// level n needs base + (n-1)*ceil(base/2) completions
function lvInfo(t) {
  let need = t.base,
    lv = 1,
    left = t.count;
  while (left >= need) {
    left -= need;
    lv++;
    need = t.base + (lv - 1) * Math.ceil(t.base / 2);
  }
  return { lv, into: left, need };
}
const times = (n) => (n === 1 ? "once" : n === 2 ? "twice" : n + " times");

// Mint "done" pill: shown once a quest is done at least once today.
const doneHTML = (d) =>
  d
    ? `<span class="done-pill" aria-label="Done ${times(d)} today">Done${d > 1 ? ` ×${d}` : ""}</span>`
    : "";
// The bar is split into one segment per completion needed, so quick and long-haul quests
// look different. Past SEG_MAX segments it stays a smooth bar so it never turns into noise.
const SEG_MAX = 30;
// Segmented: one rounded piece per completion, lit when done. Smooth: one fill.
const trackHTML = (L) =>
  L.need <= SEG_MAX
    ? Array.from({ length: L.need }, (_, i) => `<i${i < L.into ? ' class="on"' : ""}></i>`).join("")
    : `<i style="width:${(L.into / L.need) * 100}%"></i>`;
// Waypoint-style line under the blip, like "0.72 mi" on the map.
const toGo = (L) => `${L.need - L.into} to Lv ${L.lv + 1}`;

function cardHTML(t) {
  const L = lvInfo(t),
    d = doneToday(t);
  // One-offs never level, so they skip the level number and progress bar.
  if (t.once)
    return `<article class="card once${d ? " done" : ""}" data-id="${t.id}">
    <div class="hd"><span class="blip"><span class="pin">${ic(t.icon)}</span><small class="num">One-off</small></span>
      <div class="ttl"><h3 class="t-title">${esc(t.name)}</h3><p>${doneHTML(d)}</p></div></div>
    ${actionsHTML(t)}
  </article>`;
  return `<article class="card${d ? " done" : ""}" data-id="${t.id}">
    <div class="hd"><span class="blip"><span class="pin">${ic(t.icon)}</span><small class="num">${toGo(L)}</small></span>
      <div class="ttl"><h3 class="t-title">${esc(t.name)}</h3><p>${doneHTML(d)}</p></div>
      <div class="lv"><span>Level</span><b class="num">${L.lv}</b></div></div>
    <div class="prog"><div class="track${L.need <= SEG_MAX ? " seg" : ""}" role="progressbar" aria-label="${toGo(L)}" aria-valuemin="0" aria-valuemax="${L.need}" aria-valuenow="${L.into}">${trackHTML(L)}</div></div>
    ${actionsHTML(t)}
  </article>`;
}
const actionsHTML = (t) =>
  `<div class="actions"><button class="btn" data-done aria-label="Hold to complete ${esc(t.name)}"><span class="ring">${gl(P_CHECK)}</span><span class="bt">Complete</span></button>
      <button class="iconbtn" data-edit aria-label="Edit ${esc(t.name)}">${gl(P_EDIT)}</button></div>`;

function render() {
  const list = tasks.filter((t) =>
    filter === "done" ? doneToday(t) : !finished(t) && (filter === "all" || !doneToday(t)),
  );
  $("grid").innerHTML = list.map(cardHTML).join("");
  const e = $("empty");
  e.hidden = !!list.length;
  if (!list.length) {
    e.innerHTML = !tasks.length
      ? `<p>Start with something tiny, like putting on shoes or drinking a glass of water. Each time you do it, press and hold Complete.</p><button class="btn" data-new>${gl(P_PLUS)}New quest</button>`
      : filter !== "done"
        ? "<p>Everything’s done for today.</p>"
        : "<p>Nothing completed yet today.</p>";
  }
  points();
}

/* points counter (styled like the money counter) */
let lastAll = null;
function points() {
  const td = tasks.reduce((a, t) => a + doneToday(t), 0),
    all = tasks.reduce((a, t) => a + t.count, 0);
  document.querySelectorAll("[data-points]").forEach((n) => {
    // Each line ends in a glyph, like the money counters: a star for all time, a check for today.
    n.innerHTML = `<span class="pt"><b class="num">${all}</b><i class="badge all" aria-hidden="true"><span class="ms">star</span></i></span><span class="pt day"><span class="num">${td} today</span><i class="badge" aria-hidden="true"><span class="ms">check</span></i></span>`;
    n.title = `${all} completed all time, ${td} today`;
    if (lastAll !== null && all > lastAll) n.querySelector("b").classList.add("bump");
  });
  lastAll = all;
}

/* tabs */
const tabs = [...$("tabs").children];
function selectTab(b, focus) {
  filter = b.dataset.f;
  tabs.forEach((x) => {
    x.setAttribute("aria-selected", x === b);
    x.tabIndex = x === b ? 0 : -1;
  });
  if (focus) b.focus();
  render();
}
const shiftTab = (d, focus) => {
  const i = tabs.findIndex((x) => x.dataset.f === filter);
  selectTab(tabs[(i + d + tabs.length) % tabs.length], focus);
};
$("tabs").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) selectTab(b);
};
$("tabs").onkeydown = (e) => {
  if (e.key === "ArrowRight") shiftTab(1, true);
  else if (e.key === "ArrowLeft") shiftTab(-1, true);
};
document
  .querySelectorAll("[data-shift]")
  .forEach((k) => (k.onclick = () => shiftTab(+k.dataset.shift)));

/* sheet: create + edit */
$("fIcons").innerHTML = Object.keys(ICONS)
  .map(
    (k) =>
      `<button type="button" class="sel" data-k="${k}" aria-label="${NAMES[k]}" aria-pressed="${k === icon}">${ic(k)}</button>`,
  )
  .join("");
const pick = (box, b) => [...box.children].forEach((x) => x.setAttribute("aria-pressed", x === b));
const pickVal = (box, attr, v) =>
  [...box.children].forEach((x) => x.setAttribute("aria-pressed", x.dataset[attr] == String(v)));
$("fIcons").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) {
    pick($("fIcons"), b);
    icon = b.dataset.k;
  }
};
$("fPace").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) {
    pick($("fPace"), b);
    pace = +b.dataset.v;
  }
};
// One-off switch: a one-off never levels, so the pace tiles and count stepper step aside.
function syncOnce() {
  $("fOnce").setAttribute("aria-checked", once);
  $("fPace").hidden = once;
  $("paceL").textContent = once ? "No levels. It’s gone once it’s done." : "Level up every";
  $("countF").hidden = !editing || once;
}
$("fOnce").onclick = () => {
  once = !once;
  syncOnce();
};
$("countF").onclick = (e) => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  draftCount = Math.max(0, draftCount + +b.dataset.step);
  $("fCount").textContent = draftCount;
};
let lastFocus = null,
  draft = null; // unsaved new-quest input, kept if the sheet closes by accident
function openForm(t) {
  lastFocus = document.activeElement;
  editing = t || null;
  $("sheetT").textContent = t ? "Edit quest" : "New quest";
  $("sheetL").textContent = t
    ? "Rename it, change the icon or pace, or fix the count."
    : "Keep it tiny: one step you can do in 1 to 8 minutes.";
  $("fSubmit").textContent = t ? "Save" : "Start quest";
  $("fName").value = t ? t.name : draft ? draft.name : "";
  $("fName").placeholder = "Put on shoes";
  icon = t ? t.icon : draft ? draft.icon : "shoe";
  pace = t ? t.base : draft ? draft.pace : 5;
  once = t ? !!t.once : draft ? draft.once : false;
  draftCount = t ? t.count : 0;
  pickVal($("fIcons"), "k", icon);
  requestAnimationFrame(() => {
    const g = $("fIcons"),
      b = g.querySelector("[aria-pressed=true]");
    g.scrollTop = b ? b.offsetTop - g.offsetTop - 8 : 0;
  });
  pickVal($("fPace"), "v", pace);
  syncOnce();
  $("fDelete").hidden = !t;
  $("fCount").textContent = draftCount;
  if (!t) {
    $("mNew").setAttribute("aria-current", "page");
    $("mQuests").removeAttribute("aria-current");
  }
  showSheet($("overlay"));
  // Focus the name field only where it won't pop up a phone keyboard; otherwise the title.
  const typing = matchMedia("(hover:hover)").matches && !t;
  setTimeout(() => (typing ? $("fName") : $("sheetT")).focus(), 20);
}
function closeForm(saved) {
  if (!editing && saved !== true) {
    const name = $("fName").value.trim();
    draft = name ? { name, icon, pace, once } : null;
  }
  $("mQuests").setAttribute("aria-current", "page");
  $("mNew").removeAttribute("aria-current");
  hideSheet($("overlay"));
  editing = null;
  lastFocus && lastFocus.focus && lastFocus.focus();
}
$("mNew").onclick = () => openForm();
$("mSet").onclick = $("tSet").onclick = () => openSettings();
$("dNew").onclick = () => openForm();
$("mQuests").onclick = closeForm;
$("empty").onclick = (e) => {
  if (e.target.closest("[data-new]")) openForm();
};
$("cancel").onclick = () => {
  draft = null;
  closeForm(true);
};
$("overlay").onclick = (e) => {
  if (e.target === $("overlay")) closeForm();
};

/* sheets: show/hide with a simple focus trap */
const openSheet = () => document.querySelector(".overlay.show");
const showSheet = (o) => o.classList.add("show");
const hideSheet = (o) => o.classList.remove("show");
addEventListener("keydown", (e) => {
  if (!$("intro").hidden) return; // the intro handles its own keys
  const o = openSheet();
  if (o) {
    if (e.key === "Escape") o === $("overlay") ? closeForm() : closeSettings();
    if (e.key === "Tab") {
      const f = [...o.querySelectorAll("button:not([hidden]),input")].filter((x) => x.offsetParent);
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
    return;
  }
  // Desktop shortcuts, shown in the bottom-right legend.
  if (e.target.matches("input") || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === "n") {
    e.preventDefault();
    openForm();
  } else if (k === "q") shiftTab(-1);
  else if (k === "e") shiftTab(1);
});
// On touch screens, Enter ("Done" on the keyboard) just closes the keyboard so you can still
// pick an icon and pace. The quest is created only with the Start quest button.
$("fName").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !matchMedia("(hover: hover)").matches) {
    e.preventDefault();
    e.target.blur();
  }
});
$("form").onsubmit = (e) => {
  e.preventDefault();
  const name = $("fName").value.trim();
  if (!name) {
    $("fName").focus();
    $("fName").placeholder = "Give it a name first";
    return;
  }
  if (editing) {
    const t = editing,
      diff = draftCount - t.count;
    t.name = name;
    t.icon = icon;
    t.base = pace;
    if (once && !t.once) {
      t.once = true;
      if (draftCount) t.from = draftCount;
    } else if (!once) {
      delete t.once;
      delete t.from;
    }
    if (diff < 0) for (let i = 0; i < -diff; i++) t.log.pop(); // drop most recent completions
    if (diff > 0) for (let i = 0; i < diff; i++) t.log.push(null); // added by hand: not counted as "today"
    t.count = draftCount;
    save();
    closeForm(true);
    render();
    blip(660, 0.06);
    return;
  }
  const q = { id: Date.now(), name, icon, base: pace, count: 0, log: [] };
  if (once) q.once = true;
  tasks.unshift(q);
  save();
  draft = null;
  closeForm(true);
  if (filter === "done") $("tabs").children[0].click();
  else render();
  blip(660, 0.06);
};
$("fDelete").onclick = () => {
  const t = editing,
    i = tasks.indexOf(t);
  tasks.splice(i, 1);
  save();
  closeForm(true);
  render();
  snack(`Deleted “${t.name}”`, () => {
    tasks.splice(Math.min(i, tasks.length), 0, t);
    save();
    render();
  });
};

/* undo bar */
const UNDO_MS = 9000;
let undoFn = null,
  snackT;
function snack(text, fn) {
  undoFn = fn;
  $("snackU").hidden = !fn;
  $("snackT").textContent = text;
  $("snack").classList.add("show");
  clearTimeout(snackT);
  snackT = setTimeout(hideSnack, UNDO_MS);
}
function hideSnack() {
  $("snack").classList.remove("show");
  undoFn = null;
}
$("snackU").onclick = () => {
  const f = undoFn;
  hideSnack();
  if (f) {
    f();
    undoBlip();
  }
};

/* cards */
const buzz = (p) => {
  if (!SET.vibe || reducedMotion()) return;
  try {
    navigator.vibrate && navigator.vibrate(p);
  } catch (e) {}
};
const taskOf = (el) => tasks.find((x) => x.id === +el.closest(".card").dataset.id);

$("grid").onclick = (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  // Compact: tap a row anywhere but Complete to edit it.
  if (e.target.closest("[data-edit]") || (compact && !e.target.closest("[data-done]")))
    openForm(taskOf(card));
};

/* Hold to complete: a ring fills around the check, like a game's hold prompt.
   Letting go early cancels. The button is locked while it shows "Done",
   so a double tap can't count twice. */
const HOLD_MS = 800;
let hold = null;
function holdStart(btn) {
  if (hold || btn.classList.contains("hit")) return;
  const t0 = performance.now();
  hold = { btn, raf: 0, t0 };
  btn.classList.add("holding");
  const step = (now) => {
    const p = Math.min(1, (now - t0) / HOLD_MS);
    btn.style.setProperty("--p", p);
    if (p < 1) hold.raf = requestAnimationFrame(step);
    else {
      holdEnd(false);
      complete(btn);
    }
  };
  hold.raf = requestAnimationFrame(step);
}
function holdEnd(early) {
  if (!hold) return;
  const b = hold.btn;
  cancelAnimationFrame(hold.raf);
  b.classList.remove("holding");
  b.style.removeProperty("--p");
  hold = null;
  if (early) {
    const l = b.querySelector(".bt");
    l.textContent = "Hold it";
    clearTimeout(b.hintT);
    b.hintT = setTimeout(() => (l.textContent = "Complete"), 1200);
  }
}
// Letting go: if the full hold time has passed, it counts, even if the last animation frame
// hasn't run yet (slow phones drop frames). Otherwise it's an early release.
function holdRelease() {
  if (!hold) return;
  if (performance.now() - hold.t0 >= HOLD_MS) {
    const b = hold.btn;
    holdEnd(false);
    complete(b);
  } else holdEnd(true);
}
$("grid").addEventListener("pointerdown", (e) => {
  const b = e.target.closest("[data-done]");
  if (b && e.button === 0) holdStart(b);
});
addEventListener("pointerup", holdRelease);
addEventListener("pointercancel", () => holdEnd(true));
$("grid").addEventListener("pointerout", (e) => {
  if (hold && e.target.closest("[data-done]") === hold.btn && !hold.btn.contains(e.relatedTarget))
    holdEnd(true);
});
$("grid").addEventListener("contextmenu", (e) => {
  if (e.target.closest("[data-done]")) e.preventDefault();
});
$("grid").addEventListener("keydown", (e) => {
  const b = e.target.closest("[data-done]");
  if (b && (e.key === " " || e.key === "Enter")) {
    e.preventDefault();
    if (!e.repeat) holdStart(b);
  }
});
$("grid").addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "Enter") holdRelease();
});

function complete(btn) {
  const card = btn.closest(".card"),
    t = taskOf(card),
    before = lvInfo(t).lv;
  t.count++;
  t.log.push(today());
  if (t.log.length > 500) t.log = t.log.slice(-500);
  save();
  const r = btn.getBoundingClientRect(),
    L = lvInfo(t);
  // update in place so the bar animates instead of re-rendering
  card.classList.add("done");
  card.querySelector(".ttl p").innerHTML = doneHTML(doneToday(t));
  const track = card.querySelector(".track"); // one-offs have no bar
  if (track) updateTrack(card, track, L);
  btn.classList.add("hit");
  clearTimeout(btn.hintT);
  btn.querySelector(".bt").textContent = "Done";
  setTimeout(() => {
    btn.classList.remove("hit");
    btn.querySelector(".bt").textContent = "Complete";
  }, 900);
  if (L.lv > before) {
    const b = card.querySelector(".lv b");
    b.textContent = L.lv;
    b.classList.add("bump");
    buzz([30, 60, 30, 60, 90]);
    fanfare();
    levelUp(t, L.lv);
    burst(r.left + r.width / 2, r.top + r.height / 2, 70, true);
  } else {
    buzz(20);
    ding();
    burst(r.left + r.width / 2, r.top + r.height / 2, 28, false);
  }
  points();
  snack(`+1 ${t.name}`, () => {
    t.count = Math.max(0, t.count - 1);
    const i = t.log.lastIndexOf(today());
    if (i > -1) t.log.splice(i, 1);
    else t.log.pop();
    save();
    $("lvup").classList.remove("show");
    render();
  });
  // A finished one-off leaves the list when the "Done" lock ends, like quests leaving a filtered tab.
  if (t.once && filter !== "done") {
    setTimeout(() => card.classList.add("leaving"), 700);
    setTimeout(render, 950);
  } else if (filter !== "all") setTimeout(render, 950);
}
function updateTrack(card, track, L) {
  card.querySelector(".blip small").textContent = toGo(L);
  track.setAttribute("aria-valuenow", L.into);
  track.setAttribute("aria-valuemax", L.need);
  track.setAttribute("aria-label", toGo(L));
  const seg = L.need <= SEG_MAX;
  if (seg && track.children.length === L.need) track.children[L.into - 1]?.classList.add("on");
  else if (!seg && !track.classList.contains("seg"))
    track.firstElementChild.style.width = (L.into / L.need) * 100 + "%";
  else {
    // Level-up: the next level needs a different number of segments.
    track.classList.toggle("seg", seg);
    track.innerHTML = trackHTML(L);
  }
}

/* settings */
function syncSettings() {
  $("setList")
    .querySelectorAll("[data-s]")
    .forEach((b) => {
      const k = b.dataset.s;
      b.setAttribute("aria-checked", k === "compact" ? compact : SET[k]);
    });
  $("setBg")
    .querySelectorAll("[data-bg]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.bg === SET.bg));
}
function openSettings() {
  lastFocus = document.activeElement;
  syncSettings();
  dataStatus();
  showSheet($("setO"));
  setTimeout(() => $("setT").focus(), 20);
}
function closeSettings() {
  hideSheet($("setO"));
  lastFocus && lastFocus.focus && lastFocus.focus();
}
$("setList").onclick = (e) => {
  const b = e.target.closest("[data-s]");
  if (!b) return;
  const k = b.dataset.s;
  if (k === "compact") setDensity(!compact);
  else {
    SET[k] = !SET[k];
    saveSet();
  }
  syncSettings();
};
$("setBg").onclick = (e) => {
  const b = e.target.closest("[data-bg]");
  if (!b) return;
  SET.bg = b.dataset.bg;
  saveSet();
  applyBg();
  syncSettings();
};
$("setDone").onclick = closeSettings;
$("setO").onclick = (e) => {
  if (e.target === $("setO")) closeSettings();
};

/* compact mode */
const DKEY = "sidequests.compact";
let compact = false;
try {
  compact = localStorage.getItem(DKEY) === "1";
} catch (e) {}
function setDensity(v) {
  compact = v;
  document.body.classList.toggle("compact", v);
  $("density").setAttribute("aria-pressed", v);
  $("sDensity").setAttribute("aria-pressed", v);
  try {
    localStorage.setItem(DKEY, v ? "1" : "0");
  } catch (e) {}
}
setDensity(compact);
$("density").onclick = $("sDensity").onclick = () => setDensity(!compact);
/* clock */
function clk() {
  const v = new Date()
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  document.querySelectorAll("[data-clock]").forEach((n) => (n.textContent = v));
}
clk();
setInterval(clk, 15000);
render();
try {
  if ("serviceWorker" in navigator && location.protocol === "https:")
    navigator.serviceWorker.register("sw.js").catch(() => {});
} catch (e) {}
