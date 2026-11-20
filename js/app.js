const KEY = "sidequests.v1";
let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem(KEY)) || [];
} catch (e) {}
tasks.forEach((t) => {
  if (!ICONS[t.icon]) t.icon = EMOJI[t.icon] || "star";
});
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {}
};
const $ = (id) => document.getElementById(id);
const today = () => new Date().toDateString();
const doneToday = (t) => t.log.filter((d) => d === today()).length;
const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let filter = "all",
  icon = "shoe",
  pace = 5,
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

function cardHTML(t) {
  const L = lvInfo(t),
    d = doneToday(t);
  return `<article class="card" data-id="${t.id}">
    <div class="hd"><span class="pin">${ic(t.icon)}</span>
      <div class="ttl"><h3 class="t-title">${esc(t.name)}</h3><p>${d ? `Done ${times(d)} today` : "Not done yet today"}</p></div>
      <div class="lv"><span>Level</span><b class="num">${L.lv}</b></div></div>
    <div class="prog"><div class="track" role="progressbar" aria-label="Progress to level ${L.lv + 1}" aria-valuemin="0" aria-valuemax="${L.need}" aria-valuenow="${L.into}"><i style="width:${(L.into / L.need) * 100}%"></i></div>
      <div class="meta t-meta num"><span>${L.into} of ${L.need} to level ${L.lv + 1}</span><span>${t.count} total</span></div></div>
    <div class="actions"><button class="btn" data-done>${gl(P_CHECK)}<span>Complete</span></button>
      <button class="iconbtn" data-edit aria-label="Edit ${esc(t.name)}">${gl(P_EDIT)}</button></div>
  </article>`;
}

function render() {
  const list = tasks.filter(
    (t) => filter === "all" || (filter === "todo" ? !doneToday(t) : doneToday(t)),
  );
  $("grid").innerHTML = list.map(cardHTML).join("");
  const e = $("empty");
  e.hidden = !!list.length;
  if (!list.length) {
    e.innerHTML = !tasks.length
      ? `<p>Start with something tiny, like putting on shoes or drinking a glass of water. Each time you do it, tap Complete.</p><button class="btn" data-new>${gl(P_PLUS)}New quest</button>`
      : filter === "todo"
        ? "<p>Everything’s done for today.</p>"
        : "<p>Nothing completed yet today.</p>";
  }
  const td = tasks.reduce((a, t) => a + doneToday(t), 0),
    all = tasks.reduce((a, t) => a + t.count, 0);
  $("summary").innerHTML =
    `<span><b>${td}</b> done today</span><span><b>${all}</b> all time</span>`;
}

/* tabs */
$("tabs").onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  filter = b.dataset.f;
  [...$("tabs").children].forEach((x) => x.setAttribute("aria-selected", x === b));
  render();
};

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
$("countF").onclick = (e) => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  draftCount = Math.max(0, draftCount + +b.dataset.step);
  $("fCount").textContent = draftCount;
};
let lastFocus = null;
function openForm(t) {
  lastFocus = document.activeElement;
  editing = t || null;
  $("sheetT").textContent = t ? "Edit quest" : "New quest";
  $("sheetL").textContent = t
    ? "Rename it, change the icon or pace, or fix the count."
    : "Keep it tiny: one step you can do in 1 to 8 minutes.";
  $("fSubmit").textContent = t ? "Save" : "Start quest";
  $("fName").value = t ? t.name : "";
  $("fName").placeholder = "Put on shoes";
  icon = t ? t.icon : "shoe";
  pace = t ? t.base : 5;
  draftCount = t ? t.count : 0;
  pickVal($("fIcons"), "k", icon);
  requestAnimationFrame(() => {
    const g = $("fIcons"),
      b = g.querySelector("[aria-pressed=true]");
    g.scrollTop = b ? b.offsetTop - g.offsetTop - 8 : 0;
  });
  pickVal($("fPace"), "v", pace);
  $("countF").hidden = !t;
  $("fDelete").hidden = !t;
  $("fCount").textContent = draftCount;
  if (!t) {
    $("mNew").setAttribute("aria-current", "page");
    $("mQuests").removeAttribute("aria-current");
  }
  $("overlay").classList.add("show");
  if (matchMedia("(hover:hover)").matches && !t) setTimeout(() => $("fName").focus(), 20);
}
function closeForm() {
  $("mQuests").setAttribute("aria-current", "page");
  $("mNew").removeAttribute("aria-current");
  $("overlay").classList.remove("show");
  editing = null;
  lastFocus && lastFocus.focus && lastFocus.focus();
}
$("mNew").onclick = () => openForm();
$("dNew").onclick = () => openForm();
$("mQuests").onclick = closeForm;
$("empty").onclick = (e) => {
  if (e.target.closest("[data-new]")) openForm();
};
$("cancel").onclick = closeForm;
$("overlay").onclick = (e) => {
  if (e.target === $("overlay")) closeForm();
};
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("overlay").classList.contains("show")) closeForm();
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
    if (diff < 0) for (let i = 0; i < -diff; i++) t.log.pop(); // drop most recent completions
    if (diff > 0) for (let i = 0; i < diff; i++) t.log.push(null); // added by hand: not counted as "today"
    t.count = draftCount;
    save();
    closeForm();
    render();
    blip(660, 0.06);
    return;
  }
  tasks.unshift({ id: Date.now(), name, icon, base: pace, count: 0, log: [] });
  save();
  closeForm();
  if (filter === "done") $("tabs").children[0].click();
  else render();
  blip(660, 0.06);
};
$("fDelete").onclick = () => {
  const t = editing,
    i = tasks.indexOf(t);
  tasks.splice(i, 1);
  save();
  closeForm();
  render();
  snack(`Deleted “${t.name}”`, () => {
    tasks.splice(Math.min(i, tasks.length), 0, t);
    save();
    render();
  });
};

/* undo bar */
let undoFn = null,
  snackT;
function snack(text, fn) {
  undoFn = fn;
  $("snackT").textContent = text;
  $("snack").classList.add("show");
  clearTimeout(snackT);
  snackT = setTimeout(hideSnack, 5000);
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
  try {
    navigator.vibrate && navigator.vibrate(p);
  } catch (e) {}
};
const summary = () =>
  ($("summary").innerHTML =
    `<span><b>${tasks.reduce((a, t) => a + doneToday(t), 0)}</b> done today</span><span><b>${tasks.reduce((a, t) => a + t.count, 0)}</b> all time</span>`);
$("grid").onclick = (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = +card.dataset.id,
    t = tasks.find((x) => x.id === id);
  if (e.target.closest("[data-edit]") || (compact && e.target.closest(".ttl"))) {
    openForm(t);
    return;
  }
  if (!e.target.closest("[data-done]")) return;
  const before = lvInfo(t).lv;
  t.count++;
  t.log.push(today());
  if (t.log.length > 500) t.log = t.log.slice(-500);
  save();
  const btn = card.querySelector("[data-done]"),
    r = btn.getBoundingClientRect(),
    L = lvInfo(t);
  // update in place so the bar animates instead of re-rendering
  const n = document.createElement("div");
  n.innerHTML = cardHTML(t);
  card.querySelector(".ttl p").textContent = n.querySelector(".ttl p").textContent;
  card.querySelector(".meta").innerHTML = n.querySelector(".meta").innerHTML;
  card.querySelector(".track i").style.width = (L.into / L.need) * 100 + "%";
  btn.classList.add("hit");
  btn.querySelector("span:not(.ms)").textContent = "Done";
  setTimeout(() => {
    btn.classList.remove("hit");
    btn.querySelector("span:not(.ms)").textContent = "Complete";
  }, 900);
  if (L.lv > before) {
    const b = card.querySelector(".lv b");
    b.textContent = L.lv;
    b.classList.add("bump");
    buzz([30, 60, 30, 60, 90]);
    fanfare();
    levelUp(t, L.lv);
    burst(innerWidth / 2, innerHeight / 2, 110, true);
  } else {
    buzz(20);
    ding();
    burst(r.left + r.width / 2, r.top + r.height / 2, 28, false);
  }
  summary();
  snack(`+1 ${t.name}`, () => {
    t.count = Math.max(0, t.count - 1);
    const i = t.log.lastIndexOf(today());
    if (i > -1) t.log.splice(i, 1);
    else t.log.pop();
    save();
    $("lvup").classList.remove("show");
    render();
  });
  if (filter !== "all") setTimeout(render, 950);
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
  try {
    localStorage.setItem(DKEY, v ? "1" : "0");
  } catch (e) {}
}
setDensity(compact);
$("density").onclick = () => setDensity(!compact);
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
