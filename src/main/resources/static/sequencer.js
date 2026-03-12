// ── BeatForge v4 — Realistic Eastern & Western Synthesis ──

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ─────────────────────────────────────────────
// REALISTIC SOUND SYNTHESIS ENGINE
// Each instrument uses layered oscillators,
// noise, filters and envelopes to approximate
// the real acoustic character of the instrument.
// ─────────────────────────────────────────────

function masterGain(val) {
  const g = audioCtx.createGain();
  g.gain.value = val;
  g.connect(audioCtx.destination);
  return g;
}

function osc(type, freq, start, stop, gainVal, pitchEnd, ctx) {
  const ac = ctx || audioCtx;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (pitchEnd) o.frequency.exponentialRampToValueAtTime(pitchEnd, stop);
  g.gain.setValueAtTime(gainVal, start);
  g.gain.exponentialRampToValueAtTime(0.0001, stop);
  o.start(start); o.stop(stop);
  return { osc: o, gain: g };
}

function noise(dur, gainVal, filterFreq, filterType, start, ctx) {
  const ac = ctx || audioCtx;
  const bufSize = ac.sampleRate * dur;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = filterType || 'bandpass';
  filter.frequency.value = filterFreq || 1000;
  filter.Q.value = 1.5;
  const g = ac.createGain();
  src.connect(filter); filter.connect(g); g.connect(ac.destination);
  g.gain.setValueAtTime(gainVal, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.start(start); src.stop(start + dur);
}

// ── WESTERN INSTRUMENTS ──

function playKick(t, ctx) {
  const ac = ctx || audioCtx;
  // Sub thud + punch layer
  const sub = ac.createOscillator(), subG = ac.createGain();
  sub.connect(subG); subG.connect(ac.destination);
  sub.type = 'sine';
  sub.frequency.setValueAtTime(160, t);
  sub.frequency.exponentialRampToValueAtTime(40, t + 0.06);
  subG.gain.setValueAtTime(1.0, t);
  subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  sub.start(t); sub.stop(t + 0.5);
  // Click transient
  noise(0.01, 0.4, 3000, 'bandpass', t, ac);
}

function playSnare(t, ctx) {
  const ac = ctx || audioCtx;
  // Tonal body
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'triangle';
  o.frequency.setValueAtTime(200, t);
  o.frequency.exponentialRampToValueAtTime(100, t + 0.12);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.start(t); o.stop(t + 0.18);
  // Snare rattle noise
  noise(0.18, 0.6, 2500, 'highpass', t, ac);
}

function playHihat(t, open, ctx) {
  const ac = ctx || audioCtx;
  const dur = open ? 0.35 : 0.055;
  noise(dur, 0.3, 8000, 'highpass', t, ac);
}

function playBass808(t, note, ctx) {
  const ac = ctx || audioCtx;
  const freq = note || 55;
  const o = ac.createOscillator(), g = ac.createGain();
  const dist = ac.createWaveShaper();
  // Soft clipping for 808 character
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
  }
  dist.curve = curve;
  o.connect(dist); dist.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.8);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
  o.start(t); o.stop(t + 0.9);
}

function playSynth(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 440;
  // Sawtooth through low-pass filter — classic synth
  const o = ac.createOscillator(), filter = ac.createBiquadFilter(), g = ac.createGain();
  o.connect(filter); filter.connect(g); g.connect(ac.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(f, t);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);
  filter.Q.value = 8;
  g.gain.setValueAtTime(0.4, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  o.start(t); o.stop(t + 0.35);
}

function playElectricGuitar(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 196; // G3
  // Plucked string: short attack sawtooth + harmonics + slight overdrive
  [1, 2, 3, 4].forEach((h, i) => {
    const o = ac.createOscillator(), g = ac.createGain();
    const dist = ac.createWaveShaper();
    const curve = new Float32Array(128);
    for (let j = 0; j < 128; j++) {
      const x = (j * 2) / 128 - 1;
      curve[j] = x * (1 + 50 * Math.abs(x)) / (1 + 50 * Math.abs(x) * Math.abs(x));
    }
    dist.curve = curve;
    o.connect(dist); dist.connect(g); g.connect(ac.destination);
    o.type = h === 1 ? 'sawtooth' : 'sine';
    o.frequency.setValueAtTime(f * h, t);
    // slight pitch instability for realism
    o.frequency.setValueAtTime(f * h * 1.002, t + 0.01);
    const amp = [0.5, 0.25, 0.12, 0.06][i];
    g.gain.setValueAtTime(amp, t);
    g.gain.setValueAtTime(amp * 0.8, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.start(t); o.stop(t + 0.45);
  });
  // Body thump
  noise(0.03, 0.15, 400, 'lowpass', t, ac);
}

function playPiano(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 261.63; // C4
  // Piano: hammer transient + decaying harmonics
  [1, 2, 3, 4, 5].forEach((h, i) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(f * h, t);
    const amps = [0.6, 0.3, 0.15, 0.08, 0.04];
    const decays = [1.2, 0.9, 0.7, 0.5, 0.35];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amps[i], t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decays[i]);
    o.start(t); o.stop(t + decays[i]);
  });
  // Hammer click
  noise(0.008, 0.2, 5000, 'bandpass', t, ac);
}

function playTrumpet(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 329.63; // E4
  // Trumpet: bright buzzy tone with formant filtering
  const o = ac.createOscillator(), filter = ac.createBiquadFilter(), g = ac.createGain();
  o.connect(filter); filter.connect(g); g.connect(ac.destination);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(f * 0.98, t);
  o.frequency.linearRampToValueAtTime(f, t + 0.04); // lip attack
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, t);
  filter.Q.value = 3;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.5, t + 0.04);
  g.gain.setValueAtTime(0.45, t + 0.18);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.start(t); o.stop(t + 0.3);
  // Second harmonic layer
  const o2 = ac.createOscillator(), g2 = ac.createGain();
  o2.connect(g2); g2.connect(ac.destination);
  o2.type = 'square';
  o2.frequency.setValueAtTime(f * 2, t);
  g2.gain.setValueAtTime(0.1, t + 0.04);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o2.start(t); o2.stop(t + 0.3);
}

function playStrings(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 196;
  // Bowed string: slow attack, rich harmonics, vibrato
  [1, 2, 3].forEach((h, i) => {
    const o = ac.createOscillator(), vib = ac.createOscillator(), vibG = ac.createGain(), g = ac.createGain();
    vib.connect(vibG); vibG.connect(o.frequency);
    o.connect(g); g.connect(ac.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * h, t);
    // vibrato
    vib.frequency.value = 5.5;
    vibG.gain.value = 4;
    vib.start(t); vib.stop(t + 0.7);
    const amp = [0.3, 0.15, 0.07][i];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.06); // slow bow attack
    g.gain.setValueAtTime(amp, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.start(t); o.stop(t + 0.7);
  });
}

// ── EASTERN INSTRUMENTS ──

function playTabla(t, variant, ctx) {
  // variant: 'na' (high), 'ta' (mid), 'ge' (low bass)
  const ac = ctx || audioCtx;
  const configs = {
    na: { f: 380, f2: 760, decay: 0.12, gain: 0.7 },
    ta: { f: 240, f2: 480, decay: 0.18, gain: 0.8 },
    ge: { f: 110, f2: 220, decay: 0.35, gain: 0.9 },
  };
  const cfg = configs[variant] || configs.ta;
  // Membrane resonance: pitch drops fast
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(cfg.f * 1.4, t);
  o.frequency.exponentialRampToValueAtTime(cfg.f, t + 0.03);
  o.frequency.exponentialRampToValueAtTime(cfg.f * 0.7, t + cfg.decay);
  g.gain.setValueAtTime(cfg.gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + cfg.decay);
  o.start(t); o.stop(t + cfg.decay);
  // Overtone ring
  const o2 = ac.createOscillator(), g2 = ac.createGain();
  o2.connect(g2); g2.connect(ac.destination);
  o2.type = 'sine';
  o2.frequency.setValueAtTime(cfg.f2, t);
  o2.frequency.exponentialRampToValueAtTime(cfg.f2 * 0.6, t + cfg.decay * 0.6);
  g2.gain.setValueAtTime(cfg.gain * 0.3, t);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + cfg.decay * 0.6);
  o2.start(t); o2.stop(t + cfg.decay * 0.6);
  // Skin attack noise
  noise(0.015, 0.3, 1200, 'bandpass', t, ac);
}

function playDhol(t, side, ctx) {
  // side: 'bass' (left) or 'treble' (right)
  const ac = ctx || audioCtx;
  if (side === 'treble') {
    // Thin stick hit
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(320, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.08);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.start(t); o.stop(t + 0.12);
    noise(0.06, 0.35, 3000, 'highpass', t, ac);
  } else {
    // Deep booming bass side
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    g.gain.setValueAtTime(1.0, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.start(t); o.stop(t + 0.4);
    noise(0.02, 0.25, 200, 'lowpass', t, ac);
  }
}

function playSitar(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 196;
  // Sitar: plucked with sympathetic string buzz
  [1, 2, 3, 4, 5].forEach((h, i) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = i === 0 ? 'sawtooth' : 'sine';
    // Slight inharmonicity (jawari buzzing)
    const inharmonic = 1 + (i * 0.002);
    o.frequency.setValueAtTime(f * h * inharmonic, t);
    o.frequency.setValueAtTime(f * h * inharmonic * 0.998, t + 0.01); // jawari flutter
    const amps = [0.45, 0.25, 0.15, 0.08, 0.04];
    const decays = [1.2, 0.9, 0.65, 0.4, 0.25];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amps[i], t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decays[i]);
    o.start(t); o.stop(t + decays[i]);
  });
  // Sympathetic strings hiss
  noise(0.06, 0.08, 3000, 'bandpass', t, ac);
  // Pluck transient
  noise(0.005, 0.2, 1800, 'bandpass', t, ac);
}

function playDholak(t, ctx) {
  const ac = ctx || audioCtx;
  // Mid-pitched double-headed drum
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(75, t + 0.15);
  g.gain.setValueAtTime(0.8, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.start(t); o.stop(t + 0.22);
  noise(0.04, 0.2, 500, 'bandpass', t, ac);
}

function playBansuri(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 523; // C5 — bansuri sits high
  // Breathy flute: sine + noise blend
  const o = ac.createOscillator(), vib = ac.createOscillator(), vibG = ac.createGain(), g = ac.createGain();
  vib.connect(vibG); vibG.connect(o.frequency);
  o.connect(g); g.connect(ac.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(f, t);
  // Gentle meend (glide up)
  o.frequency.linearRampToValueAtTime(f * 1.005, t + 0.08);
  // Slow vibrato
  vib.frequency.value = 5;
  vibG.gain.setValueAtTime(0, t + 0.1);
  vibG.gain.linearRampToValueAtTime(5, t + 0.2);
  vib.start(t); vib.stop(t + 0.5);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.5, t + 0.04);
  g.gain.setValueAtTime(0.45, t + 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  o.start(t); o.stop(t + 0.55);
  // Breath noise layer
  const bufSize = ac.sampleRate * 0.5;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
  const ns = ac.createBufferSource(); ns.buffer = buf;
  const flt = ac.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = f; flt.Q.value = 20;
  const ng = ac.createGain();
  ns.connect(flt); flt.connect(ng); ng.connect(ac.destination);
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.12, t + 0.04);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  ns.start(t); ns.stop(t + 0.5);
}

function playMridangam(t, side, ctx) {
  const ac = ctx || audioCtx;
  if (side === 'thoppi') {
    // Bass left side
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.2);
    g.gain.setValueAtTime(0.85, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.start(t); o.stop(t + 0.28);
    noise(0.015, 0.2, 300, 'lowpass', t, ac);
  } else {
    // Crisp right side (valanthalai)
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(440, t);
    o.frequency.exponentialRampToValueAtTime(300, t + 0.08);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.start(t); o.stop(t + 0.12);
    noise(0.012, 0.4, 4000, 'highpass', t, ac);
  }
}

function playSarangi(t, freq, ctx) {
  const ac = ctx || audioCtx;
  const f = freq || 261;
  // Bowed, nasal, lots of harmonics — similar to a hurdy-gurdy timbre
  [1, 2, 3, 4].forEach((h, i) => {
    const o = ac.createOscillator(), vib = ac.createOscillator(), vG = ac.createGain(), g = ac.createGain();
    vib.connect(vG); vG.connect(o.frequency);
    o.connect(g); g.connect(ac.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * h, t);
    vib.frequency.value = 6;
    vG.gain.value = 3;
    vib.start(t); vib.stop(t + 0.55);
    const amps = [0.3, 0.2, 0.12, 0.06];
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amps[i], t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.start(t); o.stop(t + 0.55);
  });
}

function playTanpura(t, key, ctx) {
  const ac = ctx || audioCtx;
  // Tanpura: four open strings plucked in sequence, continuous drone
  // Tuned to Sa-Pa-Sa-Sa (1-5-8-8)
  const freqs = key === 'low' ? [65, 98, 130, 130] : [130, 195, 261, 261];
  freqs.forEach((f, i) => {
    const delay = i * 0.06;
    // Each string: strong fundamental + decay
    [1, 2, 3].forEach((h, hi) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(f * h, t + delay);
      const amp = [0.3, 0.12, 0.06][hi];
      g.gain.setValueAtTime(amp, t + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.8);
      o.start(t + delay); o.stop(t + delay + 1.8);
    });
    // Jawari buzz per string
    noise(0.05, 0.06, f * 4, 'bandpass', t + delay, ac);
  });
}

// ── DISPATCH TABLE ──
// Maps track name → play function + pitch
const INSTRUMENTS = {
  // Western
  'Kick':     (t, ctx) => playKick(t, ctx),
  'Snare':    (t, ctx) => playSnare(t, ctx),
  'Hi-Hat':   (t, ctx) => playHihat(t, false, ctx),
  'Open-Hat': (t, ctx) => playHihat(t, true, ctx),
  '808 Bass': (t, ctx) => playBass808(t, 55, ctx),
  'Synth':    (t, ctx) => playSynth(t, 440, ctx),
  'Guitar':   (t, ctx) => playElectricGuitar(t, 196, ctx),
  'Piano':    (t, ctx) => playPiano(t, 261.63, ctx),
  'Trumpet':  (t, ctx) => playTrumpet(t, 329.63, ctx),
  'Strings':  (t, ctx) => playStrings(t, 196, ctx),
  // Eastern
  'Tabla-Na': (t, ctx) => playTabla(t, 'na', ctx),
  'Tabla-Ge': (t, ctx) => playTabla(t, 'ge', ctx),
  'Dhol':     (t, ctx) => playDhol(t, 'bass', ctx),
  'Dhol-Hi':  (t, ctx) => playDhol(t, 'treble', ctx),
  'Sitar':    (t, ctx) => playSitar(t, 196, ctx),
  'Dholak':   (t, ctx) => playDholak(t, ctx),
  'Bansuri':  (t, ctx) => playBansuri(t, 523, ctx),
  'Mridangam':(t, ctx) => playMridangam(t, 'valanthalai', ctx),
  'Mridangam-B':(t, ctx) => playMridangam(t, 'thoppi', ctx),
  'Sarangi':  (t, ctx) => playSarangi(t, 261, ctx),
  'Tanpura':  (t, ctx) => playTanpura(t, 'mid', ctx),
};

// ── TRACK DEFINITIONS ──
const TRACKS = [
  // WESTERN
  { name:'Kick',     color:'#e8521a', world:'western', label:'Kick Drum' },
  { name:'Snare',    color:'#f59e0b', world:'western', label:'Snare' },
  { name:'Hi-Hat',   color:'#10b981', world:'western', label:'Hi-Hat' },
  { name:'Open-Hat', color:'#059669', world:'western', label:'Open Hat' },
  { name:'808 Bass', color:'#6366f1', world:'western', label:'808 Bass' },
  { name:'Guitar',   color:'#dc2626', world:'western', label:'E. Guitar' },
  { name:'Piano',    color:'#0ea5e9', world:'western', label:'Piano' },
  { name:'Trumpet',  color:'#d97706', world:'western', label:'Trumpet' },
  { name:'Strings',  color:'#7c3aed', world:'western', label:'Strings' },
  { name:'Synth',    color:'#ec4899', world:'western', label:'Synth' },
  // EASTERN
  { name:'Tabla-Na', color:'#f97316', world:'eastern', label:'Tabla (Na)' },
  { name:'Tabla-Ge', color:'#ea580c', world:'eastern', label:'Tabla (Ge)' },
  { name:'Dhol',     color:'#ef4444', world:'eastern', label:'Dhol Bass' },
  { name:'Dhol-Hi',  color:'#f87171', world:'eastern', label:'Dhol Treble' },
  { name:'Dholak',   color:'#14b8a6', world:'eastern', label:'Dholak' },
  { name:'Sitar',    color:'#a855f7', world:'eastern', label:'Sitar' },
  { name:'Bansuri',  color:'#22d3ee', world:'eastern', label:'Bansuri' },
  { name:'Mridangam',color:'#84cc16', world:'eastern', label:'Mridangam R' },
  { name:'Mridangam-B',color:'#65a30d',world:'eastern',label:'Mridangam L' },
  { name:'Sarangi',  color:'#f472b6', world:'eastern', label:'Sarangi' },
  { name:'Tanpura',  color:'#818cf8', world:'eastern', label:'Tanpura' },
];

// ── GENRE PRESETS ──
function emptyGrid() {
  const g = {};
  TRACKS.forEach(t => g[t.name] = Array(16).fill(false));
  return g;
}

const GENRES = {
  rock: {
    name:'Rock', icon:'🤘', bpm:140, world:'western',
    desc:'Heavy drums, overdriven guitar, powerful bass lines',
    grid: (() => { const g=emptyGrid();
      g['Kick']    = [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];
      g['Snare']   = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
      g['Hi-Hat']  = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];
      g['Open-Hat']= [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1];
      g['Guitar']  = [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];
      g['808 Bass']= [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0];
      return g; })()
  },
  jazz: {
    name:'Jazz', icon:'🎷', bpm:100, world:'western',
    desc:'Swinging ride, brushed snare, walking bass, trumpet melody',
    grid: (() => { const g=emptyGrid();
      g['Hi-Hat']  = [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0]; // swing pattern
      g['Snare']   = [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1];
      g['Kick']    = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];
      g['808 Bass']= [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0];
      g['Piano']   = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
      g['Trumpet'] = [0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0];
      return g; })()
  },
  hiphop: {
    name:'Hip-Hop', icon:'🎤', bpm:90, world:'western',
    desc:'Booming 808, crisp snare on 2&4, chopped hi-hats',
    grid: (() => { const g=emptyGrid();
      g['Kick']    = [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0];
      g['Snare']   = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
      g['Hi-Hat']  = [1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0];
      g['Open-Hat']= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
      g['808 Bass']= [1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0];
      g['Synth']   = [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0];
      return g; })()
  },
  edm: {
    name:'EDM', icon:'🎛️', bpm:128, world:'western',
    desc:'Four-on-the-floor kick, synth arpeggio, strings swell',
    grid: (() => { const g=emptyGrid();
      g['Kick']    = [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];
      g['Snare']   = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
      g['Hi-Hat']  = [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];
      g['Open-Hat']= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
      g['Synth']   = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];
      g['Strings'] = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];
      g['808 Bass']= [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0];
      return g; })()
  },
  bollywood: {
    name:'Bollywood', icon:'🎬', bpm:110, world:'eastern',
    desc:'Tabla groove, Sitar melody, Dholak rhythm, filmi energy',
    grid: (() => { const g=emptyGrid();
      g['Tabla-Na']  = [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1];
      g['Tabla-Ge']  = [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];
      g['Dholak']    = [1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1];
      g['Sitar']     = [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];
      g['Bansuri']   = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
      g['Strings']   = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];
      return g; })()
  },
  hindustani: {
    name:'Hindustani', icon:'🪔', bpm:60, world:'eastern',
    desc:'Slow Vilambit taal, Tanpura drone, Sitar alap phrases',
    grid: (() => { const g=emptyGrid();
      g['Tabla-Na']   = [1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0];
      g['Tabla-Ge']   = [1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0];
      g['Tanpura']    = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; // sparse — drones
      g['Sitar']      = [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0];
      g['Sarangi']    = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
      return g; })()
  },
  carnatic: {
    name:'Carnatic', icon:'🌺', bpm:120, world:'eastern',
    desc:'Adi talam Mridangam, fast Bansuri gamakam, Sarangi support',
    grid: (() => { const g=emptyGrid();
      g['Mridangam']  = [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0];
      g['Mridangam-B']= [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];
      g['Bansuri']    = [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1];
      g['Sarangi']    = [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];
      g['Tanpura']    = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      return g; })()
  },
  sufi: {
    name:'Sufi/Folk', icon:'🌙', bpm:75, world:'eastern',
    desc:'Meditative Dhol, soulful Sarangi, Bansuri call and response',
    grid: (() => { const g=emptyGrid();
      g['Dhol']     = [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];
      g['Dhol-Hi']  = [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];
      g['Dholak']   = [1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0];
      g['Bansuri']  = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0];
      g['Sarangi']  = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];
      g['Tanpura']  = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      return g; })()
  },
};

// ── SEQUENCER STATE ──
const STEPS = 16;
let bpm = 120;
let isPlaying = false;
let currentStep = 0;
let intervalId = null;
let grid = emptyGrid();
let currentGenre = null;
let currentWorld = 'western';
let savedPatterns = [];
try { savedPatterns = JSON.parse(localStorage.getItem('bf4_patterns') || '[]'); } catch(e) {}

// ── Genre Selector UI ──
function switchWorld(world, btn) {
  document.querySelectorAll('.genre-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('westernGenres').style.display = world === 'western' ? 'grid' : 'none';
  document.getElementById('easternGenres').style.display = world === 'eastern' ? 'grid' : 'none';
}

function selectGenre(key) {
  const genre = GENRES[key];
  if (!genre) return;
  currentGenre = key;

  document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.genre-card[data-genre="${key}"]`);
  if (card) card.classList.add('selected');

  document.getElementById('bpm').value = genre.bpm;
  bpm = genre.bpm;
  grid = JSON.parse(JSON.stringify(genre.grid));
  renderGrid(currentWorld === 'both' ? 'both' : genre.world);

  // Show banner
  const banner = document.getElementById('genreBanner');
  document.getElementById('genreBannerIcon').textContent = genre.icon;
  document.getElementById('genreBannerName').textContent = `${genre.name} loaded — ${genre.bpm} BPM`;
  document.getElementById('genreBannerDesc').textContent = genre.desc;
  banner.style.display = 'flex';

  // Studio badge
  document.getElementById('activeGenreRow').style.display = 'flex';
  const badge = document.getElementById('activeGenreBadge');
  badge.textContent = `${genre.icon} ${genre.name}`;
  document.getElementById('activeGenreDesc').textContent = genre.desc;

  document.getElementById('patternName').placeholder = `My ${genre.name} Beat`;

  // Auto-switch world tab in studio
  const w = genre.world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(w === 'western' ? 'tabWestern' : 'tabEastern').classList.add('active');
  currentWorld = w;

  if (isPlaying) restartPlayback();
  setStatus('', `${genre.icon} ${genre.name} beat loaded!`);
}

// ── Grid Render ──
function showWorld(world) {
  currentWorld = world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(world === 'western' ? 'tabWestern' : world === 'eastern' ? 'tabEastern' : 'tabBoth').classList.add('active');
  renderGrid(world);
}

function renderGrid(world) {
  const w = world || currentWorld || 'western';
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';

  const sections = [];
  if (w === 'western' || w === 'both') sections.push({ label: '🎸 Western Instruments', tracks: TRACKS.filter(t => t.world === 'western') });
  if (w === 'eastern' || w === 'both') sections.push({ label: '🪘 Eastern Instruments', tracks: TRACKS.filter(t => t.world === 'eastern') });

  sections.forEach(sec => {
    const section = document.createElement('div');
    section.className = 'track-section';
    const hdr = document.createElement('div');
    hdr.className = 'track-section-header';
    hdr.textContent = sec.label;
    section.appendChild(hdr);

    sec.tracks.forEach(track => {
      const row = document.createElement('div');
      row.className = 'track-row';
      const label = document.createElement('span');
      label.className = 'track-label';
      label.textContent = track.label;
      label.style.borderLeft = `3px solid ${track.color}`;
      row.appendChild(label);
      const stepsRow = document.createElement('div');
      stepsRow.className = 'steps-row';
      for (let i = 0; i < STEPS; i++) {
        const btn = document.createElement('button');
        const active = grid[track.name] && grid[track.name][i];
        btn.className = 'step-btn' + (active ? ' active' : '');
        btn.dataset.track = track.name;
        btn.dataset.step = i;
        if (active) btn.style.background = track.color;
        btn.addEventListener('click', () => {
          if (!grid[track.name]) grid[track.name] = Array(STEPS).fill(false);
          grid[track.name][i] = !grid[track.name][i];
          btn.classList.toggle('active', grid[track.name][i]);
          btn.style.background = grid[track.name][i] ? track.color : '';
        });
        stepsRow.appendChild(btn);
      }
      row.appendChild(stepsRow);
      section.appendChild(row);
    });
    gridEl.appendChild(section);
  });
}

// ── Tick ──
function tick() {
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.classList.toggle('current', parseInt(btn.dataset.step) === currentStep);
  });
  TRACKS.forEach(track => {
    if (grid[track.name] && grid[track.name][currentStep]) {
      const fn = INSTRUMENTS[track.name];
      if (fn) fn(audioCtx.currentTime);
    }
  });
  currentStep = (currentStep + 1) % STEPS;
}

function getInterval() { return (60 / bpm / 4) * 1000; }
function restartPlayback() { clearInterval(intervalId); bpm = parseInt(document.getElementById('bpm').value) || 120; intervalId = setInterval(tick, getInterval()); }

// ── Controls ──
document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) return;
  audioCtx.resume(); isPlaying = true;
  bpm = parseInt(document.getElementById('bpm').value) || 120;
  intervalId = setInterval(tick, getInterval());
  document.getElementById('playBtn').classList.add('active');
  setStatus('playing', '▶ Playing');
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (!isPlaying) return;
  isPlaying = false; clearInterval(intervalId); currentStep = 0;
  document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('current'));
  document.getElementById('playBtn').classList.remove('active');
  setStatus('', 'Stopped');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  grid = emptyGrid();
  document.querySelectorAll('.step-btn').forEach(b => { b.classList.remove('active', 'current'); b.style.background = ''; });
  setStatus('', 'Grid cleared');
});

document.getElementById('bpmUp').addEventListener('click', () => {
  const i = document.getElementById('bpm'); i.value = Math.min(240, parseInt(i.value) + 5); if (isPlaying) restartPlayback();
});
document.getElementById('bpmDown').addEventListener('click', () => {
  const i = document.getElementById('bpm'); i.value = Math.max(40, parseInt(i.value) - 5); if (isPlaying) restartPlayback();
});
document.getElementById('bpm').addEventListener('change', () => { if (isPlaying) restartPlayback(); });

// ── Save ──
document.getElementById('saveBtn').addEventListener('click', () => {
  const genre = currentGenre ? GENRES[currentGenre] : null;
  const name = document.getElementById('patternName').value.trim() || (genre ? `My ${genre.name} Beat` : 'Pattern ' + (savedPatterns.length + 1));
  const pattern = {
    id: Date.now(), name,
    bpm: parseInt(document.getElementById('bpm').value),
    genre: currentGenre,
    genreIcon: genre ? genre.icon : null,
    genreName: genre ? genre.name : null,
    grid: JSON.parse(JSON.stringify(grid)),
    createdAt: new Date().toLocaleString()
  };
  savedPatterns.unshift(pattern);
  try { localStorage.setItem('bf4_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
  document.getElementById('patternName').value = '';
  setStatus('saved', `💾 "${name}" saved!`);
});

// ── Load ──
function loadPattern(pattern) {
  document.getElementById('bpm').value = pattern.bpm; bpm = pattern.bpm;
  grid = pattern.grid || emptyGrid();
  if (pattern.genre) { currentGenre = pattern.genre; }
  renderGrid(currentWorld);
  if (isPlaying) restartPlayback();
  setStatus('', `📂 Loaded "${pattern.name}"`);
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}

function deletePattern(id) {
  savedPatterns = savedPatterns.filter(p => p.id !== id);
  try { localStorage.setItem('bf4_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
}

function renderPatternLibrary() {
  const list = document.getElementById('patternList');
  if (!savedPatterns.length) {
    list.innerHTML = '<div class="no-patterns">No saved patterns yet. Pick a genre and save your beat!</div>'; return;
  }
  list.innerHTML = savedPatterns.map(p => `
    <div class="pattern-card">
      <div class="pattern-info">
        <div class="pattern-name">${p.name}</div>
        <div class="pattern-meta">
          ${p.bpm} BPM · ${p.createdAt}
          ${p.genreIcon ? `<span class="pattern-genre-tag">${p.genreIcon} ${p.genreName}</span>` : ''}
        </div>
      </div>
      <div class="pattern-actions">
        <button class="pat-btn load" onclick='loadPattern(${JSON.stringify(p)})'>📂 Load</button>
        <button class="pat-btn share" onclick="sharePattern(${p.id})">🔗 Share</button>
        <button class="pat-btn delete" onclick="deletePattern(${p.id})">✕</button>
      </div>
    </div>
  `).join('');
}

// ── Share ──
function sharePattern(id) {
  const p = savedPatterns.find(p => p.id === id); if (!p) return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(p))));
  const url = window.location.origin + window.location.pathname + '?pattern=' + encoded;
  if (navigator.clipboard) { navigator.clipboard.writeText(url).then(() => setStatus('saved', '🔗 Link copied!')); }
  else { prompt('Copy this link:', url); }
}

function loadFromURL() {
  const encoded = new URLSearchParams(window.location.search).get('pattern');
  if (encoded) { try { loadPattern(JSON.parse(decodeURIComponent(escape(atob(encoded))))); } catch(e) {} }
}

// ── WAV Download ──
document.getElementById('downloadBtn').addEventListener('click', async () => {
  setStatus('', '⏳ Rendering audio...');
  const stepDur = 60 / bpm / 4;
  const loops = 4;
  const totalDur = STEPS * loops * stepDur + 2;
  const offCtx = new OfflineAudioContext(2, Math.ceil(audioCtx.sampleRate * totalDur), audioCtx.sampleRate);

  // Re-wire all instrument functions to use offCtx
  const offInstruments = {};
  Object.keys(INSTRUMENTS).forEach(name => {
    offInstruments[name] = (t) => INSTRUMENTS[name](t, offCtx);
  });
  // Override destination routing for offline context
  const origDest = audioCtx.destination;

  for (let step = 0; step < STEPS * loops; step++) {
    const si = step % STEPS;
    const t0 = step * stepDur;
    TRACKS.forEach(track => {
      if (grid[track.name] && grid[track.name][si]) {
        try {
          // Inline render for offline ctx
          const fn = INSTRUMENTS[track.name];
          if (fn) {
            // call with offline context
            const name = track.name;
            if (name === 'Kick') playKick(t0, offCtx);
            else if (name === 'Snare') playSnare(t0, offCtx);
            else if (name === 'Hi-Hat') playHihat(t0, false, offCtx);
            else if (name === 'Open-Hat') playHihat(t0, true, offCtx);
            else if (name === '808 Bass') playBass808(t0, 55, offCtx);
            else if (name === 'Synth') playSynth(t0, 440, offCtx);
            else if (name === 'Guitar') playElectricGuitar(t0, 196, offCtx);
            else if (name === 'Piano') playPiano(t0, 261.63, offCtx);
            else if (name === 'Trumpet') playTrumpet(t0, 329.63, offCtx);
            else if (name === 'Strings') playStrings(t0, 196, offCtx);
            else if (name === 'Tabla-Na') playTabla(t0, 'na', offCtx);
            else if (name === 'Tabla-Ge') playTabla(t0, 'ge', offCtx);
            else if (name === 'Dhol') playDhol(t0, 'bass', offCtx);
            else if (name === 'Dhol-Hi') playDhol(t0, 'treble', offCtx);
            else if (name === 'Dholak') playDholak(t0, offCtx);
            else if (name === 'Sitar') playSitar(t0, 196, offCtx);
            else if (name === 'Bansuri') playBansuri(t0, 523, offCtx);
            else if (name === 'Mridangam') playMridangam(t0, 'valanthalai', offCtx);
            else if (name === 'Mridangam-B') playMridangam(t0, 'thoppi', offCtx);
            else if (name === 'Sarangi') playSarangi(t0, 261, offCtx);
            else if (name === 'Tanpura') playTanpura(t0, 'mid', offCtx);
          }
        } catch(e) {}
      }
    });
  }

  const buf = await offCtx.startRendering();
  const wav = encodeWav(buf);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'beatforge-beat.wav'; a.click();
  URL.revokeObjectURL(url);
  setStatus('saved', '⬇️ WAV downloaded!');
});

function encodeWav(buf) {
  const nc = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length * nc * 2;
  const ab = new ArrayBuffer(44 + len), v = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4,36+len,true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,nc,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*nc*2,true); v.setUint16(32,nc*2,true); v.setUint16(34,16,true);
  ws(36,'data'); v.setUint32(40,len,true);
  let off = 44;
  for (let i = 0; i < buf.length; i++) for (let c = 0; c < nc; c++) {
    const s = Math.max(-1, Math.min(1, buf.getChannelData(c)[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
  }
  return ab;
}

function setStatus(type, text) {
  document.getElementById('statusDot').className = 'status-dot' + (type ? ' ' + type : '');
  document.getElementById('statusText').textContent = text;
}

// ── Init ──
renderGrid('western');
renderPatternLibrary();
loadFromURL();
setStatus('', 'Ready — pick a genre or build your own beat!');