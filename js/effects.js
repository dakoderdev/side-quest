/* level up */
function levelUp(t, lv) {
  $("lvN").textContent = "Level " + lv;
  $("lvT").textContent = t.name;
  const el = $("lvup");
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(levelUp.t);
  levelUp.t = setTimeout(() => el.classList.remove("show"), 2500);
}

/* particles */
const cv = $("fx"),
  g = cv.getContext("2d");
let parts = [],
  running = false;
function size() {
  cv.width = innerWidth * devicePixelRatio;
  cv.height = innerHeight * devicePixelRatio;
  g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
size();
addEventListener("resize", size);
const COLS = ["#ff2d8a", "#3be8e2", "#f4f2fb"];
function burst(x, y, n, big) {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  for (let i = 0; i < n; i++) {
    const a = big ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 2.2,
      s = (big ? 3 : 2) + Math.random() * (big ? 7 : 4);
    parts.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - (big ? 2 : 1),
      life: 1,
      c: COLS[i % 3],
      w: big ? 3 : 2.5,
      h: big ? 8 : 6,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
    });
  }
  if (!running) {
    running = true;
    loop();
  }
}
function loop() {
  g.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of parts) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.vx *= 0.97;
    p.rot += p.vr;
    p.life -= 0.022;
    g.save();
    g.globalAlpha = Math.max(p.life, 0);
    g.translate(p.x, p.y);
    g.rotate(p.rot);
    g.fillStyle = p.c;
    g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    g.restore();
  }
  parts = parts.filter((p) => p.life > 0);
  if (parts.length) requestAnimationFrame(loop);
  else {
    running = false;
    g.clearRect(0, 0, innerWidth, innerHeight);
  }
}
