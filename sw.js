// Stale-while-revalidate: answer instantly from the cache, refresh it in the background.
// The app opens at once even on a weak connection; a new deploy shows on the next launch.
// Bumping the cache name still installs a complete fresh copy.
const C = "sq-v26",
  F = [
    "./",
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "css/fonts.css",
    "css/styles.css",
    "js/settings.js",
    "js/background.js",
    "js/icons.js",
    "js/sound.js",
    "js/app.js",
    "js/data.js",
    "js/effects.js",
    "fonts/pricedown.otf",
    "fonts/barlow-400.woff2",
    "fonts/barlow-500.woff2",
    "fonts/barlow-condensed-700.woff2",
  ];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(F)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x))))
      .then(() => self.clients.claim()),
  ),
);
const ours = (u) =>
  u.origin === location.origin || /^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !ours(new URL(e.request.url))) return;
  e.respondWith(
    caches.open(C).then(async (c) => {
      const hit = await c.match(e.request);
      const fresh = fetch(e.request, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) c.put(e.request, res.clone());
          return res;
        })
        .catch(() => null);
      if (hit) {
        e.waitUntil(fresh);
        return hit;
      }
      const res = await fresh;
      if (res) return res;
      return e.request.mode === "navigate" ? c.match("index.html") : Response.error();
    }),
  );
});
