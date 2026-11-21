/* Keeping progress safe.
   Quests live in this browser's storage, which can disappear: deleting an iPhone home-screen app
   wipes it, and so does clearing site data. So:
   - ask the browser to keep storage persistent (it may then skip automatic clean-up),
   - let the user export a backup file and import it again,
   - remember when the last backup was made, shown quietly in Settings. */

const BKEY = "sidequests.lastBackup";

/* Persistent storage: the browser decides; we only ask. */
let persisted = false;
async function askPersist() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return;
    persisted = (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch (e) {}
  dataStatus();
}

function lastBackup() {
  try {
    return +localStorage.getItem(BKEY) || 0;
  } catch (e) {
    return 0;
  }
}
function ago(ms) {
  const d = Math.floor((Date.now() - ms) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}
function dataStatus() {
  const t = lastBackup();
  $("dataNote").textContent =
    (t ? `Last backup: ${ago(t)}.` : "No backup yet.") +
    (persisted ? " Storage is protected from automatic clean-up." : "");
}

/* Export: the share sheet where it can carry files (phones: "Save to Files"), otherwise a download. */
async function exportData() {
  const stamp = new Date().toISOString().slice(0, 10),
    payload = {
      app: "sidequests",
      version: 1,
      exported: new Date().toISOString(),
      tasks,
      settings: SET,
      compact,
    },
    name = `side-quests-${stamp}.json`,
    file = new File([JSON.stringify(payload, null, 2)], name, { type: "application/json" });
  let done = false;
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Side Quests backup" });
      done = true;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return; // user closed the share sheet
  }
  if (!done) {
    const url = URL.createObjectURL(file),
      a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  try {
    localStorage.setItem(BKEY, Date.now());
  } catch (e) {}
  dataStatus();
  snack("Backup saved", null);
}

/* Import: checks the file, replaces quests, and can be undone like everything else. */
const validTask = (t) =>
  t &&
  typeof t.name === "string" &&
  [3, 5, 10].includes(t.base) &&
  Number.isFinite(t.count) &&
  Array.isArray(t.log);
async function importData(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch (e) {
    snack("That file isn't a Side Quests backup", null);
    return;
  }
  const list = data && data.app === "sidequests" && Array.isArray(data.tasks) ? data.tasks : null;
  if (!list || !list.every(validTask)) {
    snack("That file isn't a Side Quests backup", null);
    return;
  }
  const before = tasks;
  tasks = list.map((t, i) => ({
    id: Number.isFinite(t.id) ? t.id : Date.now() + i,
    name: t.name.slice(0, 40),
    icon: ICONS[t.icon] ? t.icon : "star",
    base: t.base,
    count: Math.max(0, Math.floor(t.count)),
    log: t.log.slice(-500),
  }));
  save();
  closeSettings();
  render();
  snack(`Restored ${tasks.length} quest${tasks.length === 1 ? "" : "s"}`, () => {
    tasks = before;
    save();
    render();
  });
}

$("dExport").onclick = exportData;
$("dImport").onclick = () => $("dFile").click();
$("dFile").onchange = (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f) importData(f);
};
askPersist();
