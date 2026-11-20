/* sound: low, warm synth hits (checkpoint-style), not a bright bell */
let ac, noiseBuf;
function A() {
  if (!SET.sound) return null;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
  } catch (e) {}
  return ac;
}
function bus(a, vol) {
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  const g = a.createGain();
  g.gain.value = vol;
  g.connect(comp).connect(a.destination);
  return g;
}
function noise(a) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = a.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}
function voice(
  a,
  out,
  {
    f,
    type = "sawtooth",
    at = 0,
    dur = 0.5,
    vol = 0.2,
    from = 1,
    glide = 0.05,
    cut = 1800,
    cutEnd = 500,
    q = 3,
    detune = 0,
  },
) {
  const t = a.currentTime + at,
    o = a.createOscillator(),
    lp = a.createBiquadFilter(),
    g = a.createGain();
  o.type = type;
  o.detune.value = detune;
  o.frequency.setValueAtTime(f * from, t);
  o.frequency.exponentialRampToValueAtTime(f, t + glide);
  lp.type = "lowpass";
  lp.Q.value = q;
  lp.frequency.setValueAtTime(cut, t);
  lp.frequency.exponentialRampToValueAtTime(cutEnd, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp).connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function tone(f, at, dur, vol, type = "sine") {
  const a = A();
  if (!a) return;
  const o = a.createOscillator(),
    g = a.createGain(),
    t = a.currentTime + at;
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function ding() {
  tone(1318.5, 0, 1.2, 0.2);
  tone(2637, 0, 0.5, 0.05);
  tone(1975.5, 0.085, 1.3, 0.15);
  tone(3951, 0.085, 0.35, 0.025);
}
function fanfare() {
  const a = A();
  if (!a) return;
  const out = bus(a, 0.85);
  // slow-opening analog chord swell (Fmaj9 voicing) with a sub hit
  [174.61, 261.63, 329.63, 392, 440].forEach((f, i) => {
    [-7, 7].forEach((d) => {
      const t = a.currentTime + i * 0.02,
        o = a.createOscillator(),
        lp = a.createBiquadFilter(),
        g = a.createGain();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = d;
      lp.type = "lowpass";
      lp.Q.value = 2;
      lp.frequency.setValueAtTime(250, t);
      lp.frequency.exponentialRampToValueAtTime(2600, t + 0.7);
      lp.frequency.exponentialRampToValueAtTime(600, t + 2.3);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.055, t + 0.25);
      g.gain.setValueAtTime(0.055, t + 1.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      o.connect(lp).connect(g).connect(out);
      o.start(t);
      o.stop(t + 2.5);
    });
  });
  voice(a, out, {
    f: 43.65,
    type: "sine",
    from: 2,
    glide: 0.12,
    dur: 1.1,
    vol: 0.6,
    cut: 300,
    cutEnd: 150,
    q: 0.5,
  });
  voice(a, out, { f: 87.31, type: "triangle", dur: 1.4, vol: 0.25, cut: 500, cutEnd: 200, q: 0.5 });
}
function blip(f, v) {
  const a = A();
  if (!a) return;
  voice(a, bus(a, 0.8), {
    f,
    type: "triangle",
    dur: 0.14,
    vol: v || 0.08,
    cut: 3000,
    cutEnd: 1200,
  });
}
function undoBlip() {
  const a = A();
  if (!a) return;
  voice(a, bus(a, 0.8), {
    f: 220,
    type: "triangle",
    from: 1.5,
    glide: 0.12,
    dur: 0.22,
    vol: 0.14,
    cut: 1800,
    cutEnd: 500,
  });
}

/* console click on every button except Complete (which has its own ding) */
function click() {
  const a = A();
  if (!a) return;
  const t = a.currentTime,
    s = noise(a),
    bp = a.createBiquadFilter(),
    g = a.createGain();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 4;
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  s.connect(bp).connect(g).connect(a.destination);
  s.start(t);
  s.stop(t + 0.04);
  voice(a, bus(a, 0.6), {
    f: 1400,
    type: "square",
    dur: 0.025,
    vol: 0.05,
    cut: 4000,
    cutEnd: 2000,
    q: 1,
  });
}
document.addEventListener(
  "pointerdown",
  (e) => {
    const b = e.target.closest("button");
    if (b && !b.matches("[data-done]") && SET.click) click();
  },
  true,
);
