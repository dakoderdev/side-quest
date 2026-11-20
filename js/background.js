/* Page backgrounds, chosen in Settings: a pause-menu city map (drawn here), or the CSS-only Sunset and Plain.
   They sit behind everything and stay dim so they never pull focus from the quests. */
const BGS = ["map", "sunset", "plain"];
const BG_NAMES = { map: "Map", sunset: "Sunset", plain: "Plain" };
if (!BGS.includes(SET.bg)) SET.bg = "map";

const bgc = document.getElementById("bgmap"),
  bg = bgc.getContext("2d");

// Small seeded random generator, so the city looks the same on every visit.
function seeded(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Exact colours sampled from the GTA VI map close-up the user supplied.
const MAP = {
  land: "#12152f", // dark navy city blocks
  street: "#66677d", // minor streets
  arterial: "#828197", // main roads
  urban: { fill: "#12152f", build: "#4c5980" },
  purple: { fill: "#12152f", build: "#4b4983" },
  green: { fill: "#275a58", build: "#535e8d" },
  park: "#275a58",
  water: "#090b13",
  shore: "rgba(130, 110, 230, 0.3)",
  casing: "#536e73", // soft glow around highways
  highway: "#fdffff",
  poi: ["#ddbabb", "#9099d7", "#9dcfa3"], // peach, periwinkle, mint markers
  poiEdge: "#3f394a",
};

// Map marker: a small rounded square with a dark outline, like the reference's map icons.
function marker(x, y, size, color) {
  bg.beginPath();
  bg.roundRect(x, y, size, size, 1.5);
  bg.fillStyle = color;
  bg.fill();
  bg.strokeStyle = MAP.poiEdge;
  bg.lineWidth = 1.5;
  bg.stroke();
}

const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// Closed shape through points, smoothed with curves so edges read as land, not polygons.
function smoothClosed(pts) {
  bg.beginPath();
  const s = mid(pts[pts.length - 1], pts[0]);
  bg.moveTo(s[0], s[1]);
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    bg.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  });
  bg.closePath();
}
function blobPts(rnd, cx, cy, r, n = 10, wobble = 0.35) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2,
      k = r * (1 - wobble / 2 + rnd() * wobble);
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k];
  });
}
// Open curve through points (roads, coast).
function smoothOpen(pts) {
  bg.beginPath();
  bg.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const m = mid(pts[i], pts[i + 1]);
    bg.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  const l = pts[pts.length - 1];
  bg.lineTo(l[0], l[1]);
}
function wander(rnd, x0, y0, x1, y1, steps, amp) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      j = i && i < steps ? (rnd() - 0.5) * amp : 0;
    pts.push([x0 + (x1 - x0) * t + j, y0 + (y1 - y0) * t + j * 0.6]);
  }
  return pts;
}

function drawMap(W, H) {
  const rnd = seeded(1983),
    x0 = W > 820 ? 280 : 0; // content starts right of the desktop sidebar
  bg.fillStyle = MAP.land;
  bg.fillRect(0, 0, W, H);

  // Neighbourhoods on a jittered grid. Built-up ones are rounded navy blocks separated by
  // light streets, with small buildings inside; open ones are green land with a few buildings.
  const cell = 300;
  for (let gy = -1; gy * cell < H + cell; gy++) {
    for (let gx = -1; gx * cell < W + cell; gx++) {
      const cx = gx * cell + rnd() * cell,
        cy = gy * cell + rnd() * cell,
        r = 150 + rnd() * 110,
        ang = (rnd() - 0.5) * 0.9,
        roll = rnd(),
        kind = roll < 0.45 ? MAP.urban : roll < 0.65 ? MAP.purple : MAP.green,
        open = kind === MAP.green;
      bg.save();
      smoothClosed(blobPts(rnd, cx, cy, r));
      bg.fillStyle = open ? kind.fill : MAP.street;
      bg.fill();
      bg.clip();
      bg.translate(cx, cy);
      bg.rotate(ang);
      const bw = 70 + rnd() * 50,
        bh = 55 + rnd() * 40,
        street = 7;
      for (let y = -r * 1.2; y < r * 1.2; y += bh + street)
        for (let x = -r * 1.2; x < r * 1.2; x += bw + street) {
          if (!open) {
            bg.beginPath();
            bg.roundRect(x, y, bw, bh, 7);
            bg.fillStyle = kind.fill;
            bg.fill();
          }
          // A handful of uneven buildings inside each block.
          bg.fillStyle = kind.build;
          const count = open ? (rnd() < 0.3 ? 1 : 0) : 2 + Math.floor(rnd() * 4);
          for (let k = 0; k < count; k++) {
            const w = 6 + rnd() * 18,
              h = 5 + rnd() * 12;
            bg.fillRect(x + 5 + rnd() * (bw - w - 10), y + 5 + rnd() * (bh - h - 10), w, h);
          }
          // Now and then a marker sits on a block, like the reference's points of interest.
          if (!open && rnd() < 0.16)
            marker(x + bw / 2 - 3, y + bh / 2 - 3, 6, MAP.poi[Math.floor(rnd() * MAP.poi.length)]);
        }
      bg.restore();
    }
  }

  // Parks.
  for (let i = 0; i < (W * H) / 220000 + 2; i++) {
    smoothClosed(blobPts(rnd, rnd() * W, rnd() * H, 35 + rnd() * 55, 8, 0.5));
    bg.fillStyle = MAP.park;
    bg.fill();
  }

  // Arterial roads: long, gently wandering lines.
  bg.lineCap = "round";
  bg.lineJoin = "round";
  bg.strokeStyle = MAP.arterial;
  bg.lineWidth = 6;
  for (let i = 0; i < 7; i++) {
    const horiz = i % 2,
      a = rnd();
    smoothOpen(
      horiz
        ? wander(rnd, -40, H * a, W + 40, H * (a + (rnd() - 0.5) * 0.4), 8, 60)
        : wander(rnd, W * a, -40, W * (a + (rnd() - 0.5) * 0.4), H + 40, 8, 60),
    );
    bg.stroke();
  }

  // Coastline and bay on the left, plus a river. The river is drawn first and the bay
  // over its mouth, so the two waters join without a seam.
  const coast = [[x0 + W * 0.1, -20]];
  let cx = coast[0][0];
  for (let y = 60; y < H + 80; y += 80) {
    cx += (rnd() - 0.4) * 70;
    coast.push([Math.max(x0 + 30, cx), y]);
  }
  const ry = H * 0.66,
    mouth = coast.reduce((a, p) => (Math.abs(p[1] - ry) < Math.abs(a[1] - ry) ? p : a));
  const river = wander(rnd, mouth[0] - 60, mouth[1], W + 60, H * 0.82, 7, 90);
  smoothOpen(river);
  bg.strokeStyle = MAP.shore;
  bg.lineWidth = 24;
  bg.stroke();
  smoothOpen(river);
  bg.strokeStyle = MAP.water;
  bg.lineWidth = 21;
  bg.stroke();
  smoothOpen(coast);
  bg.lineTo(-20, H + 40);
  bg.lineTo(-20, -20);
  bg.closePath();
  bg.fillStyle = MAP.water;
  bg.fill();
  smoothOpen(coast);
  bg.strokeStyle = MAP.shore;
  bg.lineWidth = 1.5;
  bg.stroke();

  // Highways: dark casing under a light core, the brightest lines on the map.
  const highways = [
    wander(rnd, x0 + W * 0.2, -40, W * 0.75, H + 40, 6, 160),
    wander(rnd, x0 - 40, H * 0.3, W + 40, H * 0.45, 6, 140),
  ];
  for (const h of highways) {
    smoothOpen(h);
    bg.strokeStyle = MAP.casing;
    bg.lineWidth = 10;
    bg.stroke();
    smoothOpen(h);
    bg.strokeStyle = MAP.highway;
    bg.lineWidth = 3;
    bg.stroke();
  }

  // Vignette: darker at the edges so the eye stays on the cards.
  const v = bg.createRadialGradient(
    (x0 + W) / 2,
    H * 0.45,
    Math.min(W, H) * 0.2,
    (x0 + W) / 2,
    H * 0.45,
    Math.max(W, H) * 0.75,
  );
  v.addColorStop(0, "rgba(10, 11, 17, 0.15)");
  v.addColorStop(1, "rgba(10, 11, 17, 0.75)");
  bg.fillStyle = v;
  bg.fillRect(0, 0, W, H);
}

function applyBg() {
  document.body.dataset.bg = SET.bg;
  if (SET.bg !== "map") return; // Sunset and Plain are pure CSS
  const W = innerWidth,
    H = innerHeight,
    dpr = Math.min(devicePixelRatio || 1, 2);
  bgc.width = W * dpr;
  bgc.height = H * dpr;
  bg.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawMap(W, H);
}
let bgT, lastW;
addEventListener("resize", () => {
  // Phones resize on scroll as the address bar hides; only redraw when the width changes.
  if (innerWidth === lastW) return;
  lastW = innerWidth;
  clearTimeout(bgT);
  bgT = setTimeout(applyBg, 150);
});
lastW = innerWidth;
applyBg();
