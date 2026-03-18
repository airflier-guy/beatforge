// ── BeatForge v8 — Regional Genres + 3-Min Structured Output ──

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGainNode = audioCtx.createGain();
masterGainNode.gain.value = 0.85;
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;
masterGainNode.connect(analyser);
analyser.connect(audioCtx.destination);

// ── REVERB CONVOLVER for spatial depth ──
let reverbNode = null;
function createReverb(duration, decay, wet) {
  const ctx = audioCtx;
  const length = ctx.sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  const conv = ctx.createConvolver(); conv.buffer = impulse;
  const wg = ctx.createGain(); wg.gain.value = wet;
  const dg = ctx.createGain(); dg.gain.value = 1 - wet * 0.5;
  conv.connect(wg); wg.connect(masterGainNode);
  return { input: conv, dry: dg };
}
reverbNode = createReverb(2.0, 3.0, 0.18);

function getDestination(ac, useReverb) {
  if (ac) return ac.destination;
  return useReverb ? reverbNode.input : masterGainNode;
}

// ── HIGH-QUALITY NOISE ──
function noise(dur, g, ff, ft, t0, ac, useReverb) {
  const ctx = ac || audioCtx;
  const dest = getDestination(ac, useReverb);
  try {
    const sz = Math.ceil(ctx.sampleRate * Math.max(dur, 0.001));
    const buf = ctx.createBuffer(2, sz, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1; }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = ft || 'bandpass'; flt.frequency.value = ff || 1000; flt.Q.value = 2;
    const gn = ctx.createGain();
    src.connect(flt); flt.connect(gn); gn.connect(dest);
    gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.start(t0); src.stop(t0 + dur);
  } catch(e) {}
}

// ── INSTRUMENT FUNCTIONS ──
// All take (t0, ac) — works for both live playback and offline rendering

function playKick(t0, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(180, t0); o.frequency.exponentialRampToValueAtTime(38, t0 + 0.08);
    g.gain.setValueAtTime(1.1, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
    o.start(t0); o.stop(t0 + 0.55);
    noise(0.014, 0.55, 2800, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playSnare(t0, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, false);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'triangle';
    o.frequency.setValueAtTime(240, t0); o.frequency.exponentialRampToValueAtTime(90, t0 + 0.15);
    g.gain.setValueAtTime(0.55, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    o.start(t0); o.stop(t0 + 0.22);
    noise(0.22, 0.7, 4000, 'highpass', t0, ac, false);
    noise(0.08, 0.3, 1200, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playHihat(t0, open, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, false);
  const dur = open ? 0.45 : 0.06;
  noise(dur, open ? 0.25 : 0.32, 9500, 'highpass', t0, ac, false);
  noise(dur * 0.5, 0.1, 6000, 'bandpass', t0, ac, false);
}

function play808(t0, pitch, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = pitch || 55;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const ws = ctx.createWaveShaper();
    const c = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; c[i] = (Math.PI + 180) * x / (Math.PI + 180 * Math.abs(x)); }
    ws.curve = c;
    o.connect(ws); ws.connect(g); g.connect(dest);
    o.type = 'sine'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 0.45, t0 + 1.0);
    g.gain.setValueAtTime(0.95, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
    o.start(t0); o.stop(t0 + 1.1);
  } catch(e) {}
}

function playSynth(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 440;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(dest);
    o.type = 'sawtooth'; o.frequency.value = f;
    flt.type = 'lowpass'; flt.frequency.setValueAtTime(2400, t0); flt.frequency.exponentialRampToValueAtTime(280, t0 + 0.38); flt.Q.value = 10;
    g.gain.setValueAtTime(0.42, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
    o.start(t0); o.stop(t0 + 0.4);
  } catch(e) {}
}

function playGuitar(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 196;
  try {
    [1, 2, 3, 4, 5].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), ws = ctx.createWaveShaper();
      const c = new Float32Array(256);
      for (let j = 0; j < 256; j++) { const x = (j * 2) / 256 - 1; c[j] = x * (1 + 80 * Math.abs(x)) / (1 + 80 * Math.abs(x) * Math.abs(x)); }
      ws.curve = c;
      o.connect(ws); ws.connect(g); g.connect(dest);
      o.type = h <= 2 ? 'sawtooth' : 'sine';
      o.frequency.setValueAtTime(f * h, t0);
      o.frequency.setValueAtTime(f * h * 1.0015, t0 + 0.008);
      const amps = [0.52, 0.28, 0.14, 0.07, 0.03];
      const decs = [0.6, 0.45, 0.32, 0.22, 0.15];
      g.gain.setValueAtTime(amps[i], t0); g.gain.setValueAtTime(amps[i] * 0.85, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decs[i]);
      o.start(t0); o.stop(t0 + decs[i]);
    });
    noise(0.02, 0.1, 350, 'lowpass', t0, ac, false);
  } catch(e) {}
}

function playPiano(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 261.63;
  try {
    [1, 2, 3, 4, 5, 6].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'sine';
      o.frequency.value = f * h * (1 + i * 0.0005);
      const amps = [0.65, 0.32, 0.16, 0.09, 0.05, 0.02];
      const decs = [1.4, 1.0, 0.75, 0.55, 0.38, 0.25];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[i], t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decs[i]);
      o.start(t0); o.stop(t0 + decs[i]);
    });
    noise(0.007, 0.18, 5500, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playTrumpet(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 329.63;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(dest);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 0.97, t0); o.frequency.linearRampToValueAtTime(f, t0 + 0.05);
    flt.type = 'bandpass'; flt.frequency.setValueAtTime(1400, t0); flt.frequency.linearRampToValueAtTime(1800, t0 + 0.05); flt.Q.value = 4;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.55, t0 + 0.05);
    g.gain.setValueAtTime(0.5, t0 + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);
    o.start(t0); o.stop(t0 + 0.38);
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.connect(g2); g2.connect(dest); o2.type = 'square'; o2.frequency.value = f * 2;
    g2.gain.setValueAtTime(0.06, t0 + 0.05); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    o2.start(t0); o2.stop(t0 + 0.35);
  } catch(e) {}
}

function playStrings(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 196;
  try {
    [1, 2, 3, 4].forEach((h, i) => {
      const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
      vib.connect(vG); vG.connect(o.frequency); o.connect(g); g.connect(dest);
      o.type = 'sawtooth'; o.frequency.value = f * h;
      vib.frequency.value = 5.2; vG.gain.setValueAtTime(0, t0 + 0.15); vG.gain.linearRampToValueAtTime(5, t0 + 0.3);
      vib.start(t0); vib.stop(t0 + 0.9);
      const amps = [0.32, 0.18, 0.09, 0.04];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[i], t0 + 0.08);
      g.gain.setValueAtTime(amps[i], t0 + 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      o.start(t0); o.stop(t0 + 0.9);
    });
  } catch(e) {}
}

// ── EASTERN INSTRUMENTS (IMPROVED) ──

function playTabla(t0, variant, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const cfgs = {
    na: { f: 420, f2: 840, dec: 0.13, g: 0.75 },
    ta: { f: 260, f2: 520, dec: 0.20, g: 0.85 },
    ge: { f: 105, f2: 210, dec: 0.38, g: 0.95 },
    tin: { f: 580, f2: 1160, dec: 0.08, g: 0.6 }
  };
  const c = cfgs[variant] || cfgs.ta;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(c.f * 1.5, t0); o.frequency.exponentialRampToValueAtTime(c.f, t0 + 0.025);
    o.frequency.exponentialRampToValueAtTime(c.f * 0.65, t0 + c.dec);
    g.gain.setValueAtTime(c.g, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + c.dec);
    o.start(t0); o.stop(t0 + c.dec);
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.connect(g2); g2.connect(dest); o2.type = 'sine';
    o2.frequency.setValueAtTime(c.f2 * 1.2, t0); o2.frequency.exponentialRampToValueAtTime(c.f2 * 0.55, t0 + c.dec * 0.55);
    g2.gain.setValueAtTime(c.g * 0.35, t0); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + c.dec * 0.55);
    o2.start(t0); o2.stop(t0 + c.dec * 0.55);
    noise(0.018, 0.28, 1400, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playDhol(t0, side, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    if (side === 'treble') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'triangle';
      o.frequency.setValueAtTime(360, t0); o.frequency.exponentialRampToValueAtTime(200, t0 + 0.09);
      g.gain.setValueAtTime(0.75, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
      o.start(t0); o.stop(t0 + 0.13);
      noise(0.07, 0.4, 3500, 'highpass', t0, ac, false);
    } else {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'sine';
      o.frequency.setValueAtTime(95, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.32);
      g.gain.setValueAtTime(1.05, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.48);
      o.start(t0); o.stop(t0 + 0.48);
      noise(0.025, 0.28, 180, 'lowpass', t0, ac, false);
    }
  } catch(e) {}
}

function playSitar(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 196;
  try {
    [1, 2, 3, 4, 5, 6].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest);
      o.type = i === 0 ? 'sawtooth' : 'sine';
      const inHarm = 1 + i * 0.0025;
      o.frequency.setValueAtTime(f * h * inHarm, t0);
      o.frequency.setValueAtTime(f * h * inHarm * 0.997, t0 + 0.012);
      o.frequency.setValueAtTime(f * h * inHarm * 1.001, t0 + 0.025);
      const amps = [0.48, 0.26, 0.16, 0.09, 0.05, 0.02];
      const decs = [1.4, 1.0, 0.72, 0.48, 0.30, 0.18];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[i], t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decs[i]);
      o.start(t0); o.stop(t0 + decs[i]);
    });
    noise(0.08, 0.07, 3200, 'bandpass', t0, ac, true);
    noise(0.006, 0.22, 2000, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playBansuri(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 523;
  try {
    const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
    vib.connect(vG); vG.connect(o.frequency); o.connect(g); g.connect(dest);
    o.type = 'sine'; o.frequency.setValueAtTime(f * 0.995, t0);
    o.frequency.linearRampToValueAtTime(f * 1.006, t0 + 0.1);
    vib.frequency.value = 5.5; vG.gain.setValueAtTime(0, t0 + 0.12); vG.gain.linearRampToValueAtTime(6, t0 + 0.25);
    vib.start(t0); vib.stop(t0 + 0.65);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.52, t0 + 0.05);
    g.gain.setValueAtTime(0.48, t0 + 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.65);
    o.start(t0); o.stop(t0 + 0.65);
    const sz = Math.ceil(ctx.sampleRate * 0.65);
    const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = (Math.random() * 2 - 1) * 0.12;
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = f; flt.Q.value = 25;
    const ng = ctx.createGain();
    ns.connect(flt); flt.connect(ng); ng.connect(dest);
    ng.gain.setValueAtTime(0, t0); ng.gain.linearRampToValueAtTime(0.14, t0 + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    ns.start(t0); ns.stop(t0 + 0.65);
  } catch(e) {}
}

function playSarangi(t0, freq, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 261;
  try {
    [1, 2, 3, 4, 5].forEach((h, i) => {
      const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
      vib.connect(vG); vG.connect(o.frequency); o.connect(g); g.connect(dest);
      o.type = 'sawtooth'; o.frequency.value = f * h;
      vib.frequency.value = 6.5; vG.gain.value = 4;
      vib.start(t0); vib.stop(t0 + 0.65);
      const amps = [0.32, 0.22, 0.14, 0.07, 0.03];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[i], t0 + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.65);
      o.start(t0); o.stop(t0 + 0.65);
    });
  } catch(e) {}
}

function playTanpura(t0, key, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const freqs = key === 'low' ? [65, 98, 130, 130] : [130, 195, 261, 261];
  freqs.forEach((f, i) => {
    const delay = i * 0.08;
    try {
      [1, 2, 3, 4].forEach((h, hi) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(dest); o.type = 'sine'; o.frequency.value = f * h;
        const amps = [0.32, 0.14, 0.07, 0.03];
        g.gain.setValueAtTime(amps[hi], t0 + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 2.2);
        o.start(t0 + delay); o.stop(t0 + delay + 2.2);
      });
      noise(0.06, 0.05, f * 5, 'bandpass', t0 + delay, ac, true);
    } catch(e) {}
  });
}

function playMridangam(t0, side, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, false);
  try {
    if (side === 'thoppi') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'sine';
      o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(58, t0 + 0.22);
      g.gain.setValueAtTime(0.9, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      o.start(t0); o.stop(t0 + 0.3);
      noise(0.018, 0.22, 280, 'lowpass', t0, ac, false);
    } else {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'sine';
      o.frequency.setValueAtTime(460, t0); o.frequency.exponentialRampToValueAtTime(310, t0 + 0.09);
      g.gain.setValueAtTime(0.75, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
      o.start(t0); o.stop(t0 + 0.13);
      noise(0.014, 0.45, 5000, 'highpass', t0, ac, false);
    }
  } catch(e) {}
}

function playDholak(t0, ac) {
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(165, t0); o.frequency.exponentialRampToValueAtTime(72, t0 + 0.18);
    g.gain.setValueAtTime(0.85, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
    o.start(t0); o.stop(t0 + 0.25);
    noise(0.045, 0.22, 480, 'bandpass', t0, ac, false);
  } catch(e) {}
}

// ── NEW INSTRUMENTS ──

function playVeena(t0, freq, ac) {
  // South Indian plucked string — similar to sitar but brighter
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 220;
  try {
    [1, 2, 3, 4, 5].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest);
      o.type = i === 0 ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(f * h, t0);
      o.frequency.linearRampToValueAtTime(f * h * 1.003, t0 + 0.02);
      const amps = [0.5, 0.28, 0.15, 0.08, 0.04];
      const decs = [1.0, 0.75, 0.52, 0.33, 0.18];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[i], t0 + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decs[i]);
      o.start(t0); o.stop(t0 + decs[i]);
    });
    noise(0.005, 0.18, 2200, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playKanjira(t0, ac) {
  // South Indian frame drum with jingles
  const ctx = ac || audioCtx, dest = getDestination(ac, false);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(500, t0); o.frequency.exponentialRampToValueAtTime(250, t0 + 0.06);
    g.gain.setValueAtTime(0.65, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
    o.start(t0); o.stop(t0 + 0.1);
    noise(0.12, 0.4, 7000, 'highpass', t0, ac, false);
    noise(0.05, 0.2, 3000, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playKhol(t0, side, ac) {
  // Bengali drum (Rabindra Sangeet / Kirtan)
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    if (side === 'high') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'sine';
      o.frequency.setValueAtTime(320, t0); o.frequency.exponentialRampToValueAtTime(190, t0 + 0.08);
      g.gain.setValueAtTime(0.7, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
      o.start(t0); o.stop(t0 + 0.12);
      noise(0.06, 0.3, 2500, 'bandpass', t0, ac, false);
    } else {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest); o.type = 'sine';
      o.frequency.setValueAtTime(120, t0); o.frequency.exponentialRampToValueAtTime(55, t0 + 0.25);
      g.gain.setValueAtTime(0.9, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);
      o.start(t0); o.stop(t0 + 0.38);
    }
  } catch(e) {}
}

function playEsraj(t0, freq, ac) {
  // Bengali bowed instrument — between sarangi and violin
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 293;
  try {
    [1, 2, 3, 4].forEach((h, i) => {
      const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
      vib.connect(vG); vG.connect(o.frequency); o.connect(g); g.connect(dest);
      o.type = 'sawtooth'; o.frequency.value = f * h;
      vib.frequency.value = 5.8; vG.gain.setValueAtTime(0, t0 + 0.2); vG.gain.linearRampToValueAtTime(5, t0 + 0.35);
      vib.start(t0); vib.stop(t0 + 0.75);
      const amps = [0.35, 0.2, 0.1, 0.05];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[i], t0 + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.75);
      o.start(t0); o.stop(t0 + 0.75);
    });
  } catch(e) {}
}

function playNadhaswaram(t0, freq, ac) {
  // South Indian double reed — nasal, loud, ceremonial
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 277;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(dest);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.98, t0); o.frequency.linearRampToValueAtTime(f, t0 + 0.04);
    flt.type = 'bandpass'; flt.frequency.setValueAtTime(900, t0); flt.frequency.linearRampToValueAtTime(1600, t0 + 0.06); flt.Q.value = 6;
    const vib = ctx.createOscillator(), vG = ctx.createGain();
    vib.connect(vG); vG.connect(o.frequency);
    vib.frequency.value = 6; vG.gain.setValueAtTime(0, t0 + 0.1); vG.gain.linearRampToValueAtTime(8, t0 + 0.2);
    vib.start(t0); vib.stop(t0 + 0.55);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.58, t0 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
    o.start(t0); o.stop(t0 + 0.55);
  } catch(e) {}
}

function playKonakkol(t0, syllable, ac) {
  // Carnatic vocal percussion — mouth drum
  const ctx = ac || audioCtx, dest = getDestination(ac, false);
  const freqs = { ta: [800, 400], di: [600, 300], ki: [1200, 600], na: [500, 250] };
  const [hi, lo] = freqs[syllable] || freqs.ta;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'triangle';
    o.frequency.setValueAtTime(hi, t0); o.frequency.exponentialRampToValueAtTime(lo, t0 + 0.04);
    g.gain.setValueAtTime(0.5, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
    o.start(t0); o.stop(t0 + 0.07);
    noise(0.04, 0.2, hi, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playTungi(t0, ac) {
  // Odia tribal drum
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(200, t0); o.frequency.exponentialRampToValueAtTime(85, t0 + 0.14);
    g.gain.setValueAtTime(0.85, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    o.start(t0); o.stop(t0 + 0.2);
    noise(0.04, 0.3, 800, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playMahuri(t0, freq, ac) {
  // Odia double-reed wind instrument
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 370;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(dest);
    o.type = 'sawtooth'; o.frequency.value = f;
    flt.type = 'bandpass'; flt.frequency.value = 1100; flt.Q.value = 5;
    const vib = ctx.createOscillator(), vG = ctx.createGain();
    vib.connect(vG); vG.connect(o.frequency);
    vib.frequency.value = 5.5; vG.gain.value = 7;
    vib.start(t0); vib.stop(t0 + 0.5);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.04);
    g.gain.setValueAtTime(0.45, t0 + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    o.start(t0); o.stop(t0 + 0.5);
  } catch(e) {}
}

function playHarmonium(t0, freq, ac) {
  // North Indian / Bhojpuri harmonium
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 261;
  try {
    [1, 2, 3, 4, 5].forEach((h, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest);
      o.type = h <= 2 ? 'square' : 'sawtooth';
      o.frequency.value = f * h;
      const amps = [0.4, 0.25, 0.15, 0.08, 0.04];
      g.gain.setValueAtTime(amps[i], t0); g.gain.setValueAtTime(amps[i] * 0.9, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      o.start(t0); o.stop(t0 + 0.5);
    });
  } catch(e) {}
}

function playNagara(t0, ac) {
  // Bhojpuri/Rajasthani large kettledrum
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(80, t0); o.frequency.exponentialRampToValueAtTime(35, t0 + 0.5);
    g.gain.setValueAtTime(1.0, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    o.start(t0); o.stop(t0 + 0.7);
    noise(0.03, 0.3, 150, 'lowpass', t0, ac, false);
  } catch(e) {}
}

function playShehnai(t0, freq, ac) {
  // North Indian oboe — weddings, classical
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 370;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(dest);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.99, t0); o.frequency.linearRampToValueAtTime(f, t0 + 0.06);
    flt.type = 'bandpass'; flt.frequency.value = 1300; flt.Q.value = 5;
    const vib = ctx.createOscillator(), vG = ctx.createGain();
    vib.connect(vG); vG.connect(o.frequency);
    vib.frequency.value = 5.8; vG.gain.setValueAtTime(0, t0 + 0.1); vG.gain.linearRampToValueAtTime(7, t0 + 0.22);
    vib.start(t0); vib.stop(t0 + 0.6);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.55, t0 + 0.06);
    g.gain.setValueAtTime(0.5, t0 + 0.42); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
    o.start(t0); o.stop(t0 + 0.6);
  } catch(e) {}
}

function playOrchHit(t0, freq, ac) {
  // Orchestral stab — Western pop/orchestra
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 261;
  try {
    playStrings(t0, f, ac);
    playTrumpet(t0, f * 2, ac);
    noise(0.008, 0.15, 4000, 'bandpass', t0, ac, false);
  } catch(e) {}
}

function playOrchPerc(t0, ac) {
  // Orchestral timpani
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(dest); o.type = 'sine';
    o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(55, t0 + 0.4);
    g.gain.setValueAtTime(0.9, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
    o.start(t0); o.stop(t0 + 0.8);
    noise(0.02, 0.2, 200, 'lowpass', t0, ac, false);
  } catch(e) {}
}

function playChoirPad(t0, freq, ac) {
  // Western choral pad — 'Aah' vowel formant
  const ctx = ac || audioCtx, dest = getDestination(ac, true);
  const f = freq || 261;
  try {
    const formants = [800, 1200, 2500];
    formants.forEach((ff, fi) => {
      const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
      o.connect(flt); flt.connect(g); g.connect(dest);
      o.type = 'sawtooth'; o.frequency.value = f;
      flt.type = 'bandpass'; flt.frequency.value = ff; flt.Q.value = 8;
      const amps = [0.25, 0.18, 0.08];
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(amps[fi], t0 + 0.1);
      g.gain.setValueAtTime(amps[fi], t0 + 0.65); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
      o.start(t0); o.stop(t0 + 0.8);
    });
  } catch(e) {}
}

// ── TRACK DEFINITIONS ──
const TRACKS = [
  // WESTERN
  { name:'Kick',         color:'#e8521a', world:'western', label:'Kick',       play:(t,ac)=>playKick(t,ac) },
  { name:'Snare',        color:'#f59e0b', world:'western', label:'Snare',       play:(t,ac)=>playSnare(t,ac) },
  { name:'Hi-Hat',       color:'#10b981', world:'western', label:'Hi-Hat',      play:(t,ac)=>playHihat(t,false,ac) },
  { name:'Open-Hat',     color:'#059669', world:'western', label:'Open Hat',    play:(t,ac)=>playHihat(t,true,ac) },
  { name:'808 Bass',     color:'#6366f1', world:'western', label:'808 Bass',    play:(t,ac)=>play808(t,55,ac) },
  { name:'Guitar',       color:'#dc2626', world:'western', label:'E.Guitar',    play:(t,ac)=>playGuitar(t,196,ac) },
  { name:'Piano',        color:'#0ea5e9', world:'western', label:'Piano',       play:(t,ac)=>playPiano(t,261.63,ac) },
  { name:'Trumpet',      color:'#d97706', world:'western', label:'Trumpet',     play:(t,ac)=>playTrumpet(t,329.63,ac) },
  { name:'Strings',      color:'#7c3aed', world:'western', label:'Strings',     play:(t,ac)=>playStrings(t,196,ac) },
  { name:'Synth',        color:'#ec4899', world:'western', label:'Synth',       play:(t,ac)=>playSynth(t,440,ac) },
  { name:'Choir',        color:'#8b5cf6', world:'western', label:'Choir',       play:(t,ac)=>playChoirPad(t,261,ac) },
  { name:'OrchHit',      color:'#f97316', world:'western', label:'Orch.Hit',    play:(t,ac)=>playOrchHit(t,196,ac) },
  { name:'Timpani',      color:'#b45309', world:'western', label:'Timpani',     play:(t,ac)=>playOrchPerc(t,ac) },
  // EASTERN
  { name:'Tabla-Na',     color:'#f97316', world:'eastern', label:'Tabla(Na)',   play:(t,ac)=>playTabla(t,'na',ac) },
  { name:'Tabla-Ge',     color:'#ea580c', world:'eastern', label:'Tabla(Ge)',   play:(t,ac)=>playTabla(t,'ge',ac) },
  { name:'Dhol',         color:'#ef4444', world:'eastern', label:'Dhol Bass',   play:(t,ac)=>playDhol(t,'bass',ac) },
  { name:'Dhol-Hi',      color:'#f87171', world:'eastern', label:'Dhol High',   play:(t,ac)=>playDhol(t,'treble',ac) },
  { name:'Dholak',       color:'#14b8a6', world:'eastern', label:'Dholak',      play:(t,ac)=>playDholak(t,ac) },
  { name:'Sitar',        color:'#a855f7', world:'eastern', label:'Sitar',       play:(t,ac)=>playSitar(t,196,ac) },
  { name:'Bansuri',      color:'#22d3ee', world:'eastern', label:'Bansuri',     play:(t,ac)=>playBansuri(t,523,ac) },
  { name:'Mridangam',    color:'#84cc16', world:'eastern', label:'Mridag.R',    play:(t,ac)=>playMridangam(t,'valanthalai',ac) },
  { name:'Mridangam-B',  color:'#65a30d', world:'eastern', label:'Mridag.L',    play:(t,ac)=>playMridangam(t,'thoppi',ac) },
  { name:'Sarangi',      color:'#f472b6', world:'eastern', label:'Sarangi',     play:(t,ac)=>playSarangi(t,261,ac) },
  { name:'Tanpura',      color:'#818cf8', world:'eastern', label:'Tanpura',     play:(t,ac)=>playTanpura(t,'mid',ac) },
  { name:'Veena',        color:'#c084fc', world:'eastern', label:'Veena',       play:(t,ac)=>playVeena(t,220,ac) },
  { name:'Kanjira',      color:'#fb923c', world:'eastern', label:'Kanjira',     play:(t,ac)=>playKanjira(t,ac) },
  { name:'Khol-Hi',      color:'#fbbf24', world:'eastern', label:'Khol(Hi)',    play:(t,ac)=>playKhol(t,'high',ac) },
  { name:'Khol-Lo',      color:'#d97706', world:'eastern', label:'Khol(Lo)',    play:(t,ac)=>playKhol(t,'low',ac) },
  { name:'Esraj',        color:'#e879f9', world:'eastern', label:'Esraj',       play:(t,ac)=>playEsraj(t,293,ac) },
  { name:'Nadhaswaram',  color:'#f43f5e', world:'eastern', label:'Nadhsw.',     play:(t,ac)=>playNadhaswaram(t,277,ac) },
  { name:'Tungi',        color:'#10b981', world:'eastern', label:'Tungi',       play:(t,ac)=>playTungi(t,ac) },
  { name:'Mahuri',       color:'#06b6d4', world:'eastern', label:'Mahuri',      play:(t,ac)=>playMahuri(t,370,ac) },
  { name:'Harmonium',    color:'#6d28d9', world:'eastern', label:'Harmonium',   play:(t,ac)=>playHarmonium(t,261,ac) },
  { name:'Nagara',       color:'#be123c', world:'eastern', label:'Nagara',      play:(t,ac)=>playNagara(t,ac) },
  { name:'Shehnai',      color:'#0891b2', world:'eastern', label:'Shehnai',     play:(t,ac)=>playShehnai(t,370,ac) },
  { name:'Konakkol',     color:'#16a34a', world:'eastern', label:'Konakkol',    play:(t,ac)=>playKonakkol(t,'ta',ac) },
];

function emptyGrid() { const g={}; TRACKS.forEach(t=>g[t.name]=Array(16).fill(false)); return g; }

const trackVolumes = {};
TRACKS.forEach(t => trackVolumes[t.name] = 1.0);

// ── 3-MINUTE STRUCTURED ARRANGEMENT ENGINE ──
// Each genre/mood has a full arrangement: sections with layer progression
// Intro(sparse) → Build(adding layers) → Drop(full) → Variation(evolve) → Outro(fade)

const ARRANGEMENTS = {

  // ── RABINDRA SANGEET (BENGAL) ──
  rabindra: {
    name:'Rabindra Sangeet', icon:'🌸', region:'Bengal', bpm:72, world:'eastern',
    desc:'Tagore\'s music — esraj drone, khol rhythm, bansuri melody, meditative flow',
    moods:{ calm:'😌', romantic:'❤️', melancholic:'🌧️' },
    sections: [
      { name:'Alap (Intro)', bars:4, bpm:62, tracks:['Tanpura','Esraj','Bansuri'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Esraj':[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], 'Bansuri':[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0] }},
      { name:'Nibaddha (Build)', bars:8, bpm:68, tracks:['Tanpura','Esraj','Bansuri','Khol-Lo','Khol-Hi'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Esraj':[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0], 'Bansuri':[1,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0], 'Khol-Lo':[1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0], 'Khol-Hi':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0] }},
      { name:'Drut (Full Drop)', bars:8, bpm:76, tracks:['Tanpura','Esraj','Bansuri','Khol-Lo','Khol-Hi','Sarangi'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Esraj':[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0], 'Bansuri':[1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,1], 'Khol-Lo':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], 'Khol-Hi':[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1], 'Sarangi':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0] }},
      { name:'Variation', bars:8, bpm:80, tracks:['Tanpura','Esraj','Bansuri','Khol-Lo','Khol-Hi','Sarangi','Tabla-Na'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Esraj':[0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,1], 'Bansuri':[1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0], 'Khol-Lo':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Khol-Hi':[0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0], 'Sarangi':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Tabla-Na':[1,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0] }},
      { name:'Sam (Outro)', bars:4, bpm:65, tracks:['Tanpura','Esraj','Bansuri'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Esraj':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Bansuri':[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0] }}
    ]
  },

  // ── ODIA FOLK ──
  odia: {
    name:'Odia Folk', icon:'🌻', region:'Odisha', bpm:88, world:'eastern',
    desc:'Sambalpuri folk rhythm — Tungi drum, Mahuri melody, Dholak, festival energy',
    moods:{ festive:'🎉', happy:'😊', excited:'🤩' },
    sections:[
      { name:'Pavitra (Intro)', bars:4, bpm:78, tracks:['Tungi','Mahuri'],
        patterns:{ 'Tungi':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Mahuri':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0] }},
      { name:'Pada (Build)', bars:8, bpm:86, tracks:['Tungi','Mahuri','Dholak','Bansuri'],
        patterns:{ 'Tungi':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0], 'Mahuri':[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0], 'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Bansuri':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] }},
      { name:'Dhemsa (Full Drop)', bars:8, bpm:96, tracks:['Tungi','Mahuri','Dholak','Bansuri','Dhol','Dhol-Hi'],
        patterns:{ 'Tungi':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Mahuri':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1], 'Dholak':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Bansuri':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], 'Dhol':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], 'Dhol-Hi':[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1] }},
      { name:'Variation', bars:8, bpm:100, tracks:['Tungi','Mahuri','Dholak','Bansuri','Dhol','Dhol-Hi','Tabla-Na'],
        patterns:{ 'Tungi':[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0], 'Mahuri':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1], 'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Bansuri':[1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0], 'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Dhol-Hi':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], 'Tabla-Na':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1] }},
      { name:'Vida (Outro)', bars:4, bpm:82, tracks:['Tungi','Mahuri','Dholak'],
        patterns:{ 'Tungi':[1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0], 'Mahuri':[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], 'Dholak':[1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0] }}
    ]
  },

  // ── BHOJPURI ──
  bhojpuri: {
    name:'Bhojpuri', icon:'🎺', region:'Bihar/UP', bpm:110, world:'eastern',
    desc:'Nagara thunder, Harmonium melody, Dholak groove, Shehnai call — raw village energy',
    moods:{ festive:'🎉', happy:'😊', excited:'🤩' },
    sections:[
      { name:'Mukhda (Intro)', bars:4, bpm:96, tracks:['Harmonium','Tabla-Ge'],
        patterns:{ 'Harmonium':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] }},
      { name:'Antara (Build)', bars:8, bpm:105, tracks:['Harmonium','Tabla-Ge','Tabla-Na','Dholak','Shehnai'],
        patterns:{ 'Harmonium':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Tabla-Na':[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1], 'Dholak':[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1], 'Shehnai':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Dhamaka (Full Drop)', bars:8, bpm:118, tracks:['Harmonium','Tabla-Ge','Tabla-Na','Dholak','Shehnai','Nagara','Dhol','Dhol-Hi'],
        patterns:{ 'Harmonium':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1], 'Tabla-Ge':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0], 'Tabla-Na':[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0], 'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Shehnai':[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0], 'Nagara':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Dhol':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], 'Dhol-Hi':[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1] }},
      { name:'Vibration', bars:8, bpm:122, tracks:['Harmonium','Tabla-Na','Tabla-Ge','Dholak','Nagara','Dhol','Dhol-Hi','Shehnai','Bansuri'],
        patterns:{ 'Harmonium':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1], 'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Dholak':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Nagara':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], 'Dhol':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0], 'Dhol-Hi':[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0], 'Shehnai':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Bansuri':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Alvida (Outro)', bars:4, bpm:100, tracks:['Harmonium','Dholak','Tabla-Ge'],
        patterns:{ 'Harmonium':[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], 'Dholak':[1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0] }}
    ]
  },

  // ── SOUTH INDIAN BGM ──
  southindian: {
    name:'South Indian BGM', icon:'🌺', region:'Tamil/Telugu/Kerala', bpm:120, world:'eastern',
    desc:'Epic film BGM — Mridangam, Nadhaswaram, Kanjira, Veena, Konakkol cycles',
    moods:{ excited:'🤩', festive:'🎉', happy:'😊' },
    sections:[
      { name:'Raga Alapana', bars:4, bpm:72, tracks:['Tanpura','Veena','Nadhaswaram'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Veena':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0], 'Nadhaswaram':[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0] }},
      { name:'Pallavi (Build)', bars:8, bpm:108, tracks:['Tanpura','Veena','Nadhaswaram','Mridangam','Mridangam-B','Kanjira'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Veena':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], 'Nadhaswaram':[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], 'Mridangam':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0], 'Mridangam-B':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Kanjira':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0] }},
      { name:'Anupallavi (Full Drop)', bars:8, bpm:128, tracks:['Tanpura','Veena','Nadhaswaram','Mridangam','Mridangam-B','Kanjira','Konakkol','Bansuri'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 'Veena':[1,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0], 'Nadhaswaram':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], 'Mridangam':[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1], 'Mridangam-B':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Kanjira':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1], 'Konakkol':[0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0], 'Bansuri':[1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0] }},
      { name:'Charanam (Variation)', bars:8, bpm:135, tracks:['Veena','Nadhaswaram','Mridangam','Mridangam-B','Kanjira','Konakkol','Dhol'],
        patterns:{ 'Veena':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], 'Nadhaswaram':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Mridangam':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1], 'Mridangam-B':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0], 'Kanjira':[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1], 'Konakkol':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] }},
      { name:'Mangalam (Outro)', bars:4, bpm:90, tracks:['Tanpura','Veena','Nadhaswaram'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Veena':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Nadhaswaram':[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] }}
    ]
  },

  // ── NORTH INDIAN CLASSICAL ──
  northindian: {
    name:'North Indian Classical', icon:'🪔', region:'Hindustani', bpm:65, world:'eastern',
    desc:'Raga exposition — Sitar, Shehnai, Sarangi, Tabla taal, Tanpura foundation',
    moods:{ calm:'😌', romantic:'❤️', melancholic:'🌧️' },
    sections:[
      { name:'Alap', bars:4, bpm:52, tracks:['Tanpura','Sitar','Sarangi'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], 'Sarangi':[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Jod (Build)', bars:8, bpm:62, tracks:['Tanpura','Sitar','Sarangi','Shehnai','Tabla-Ge'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0], 'Sarangi':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Shehnai':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Tabla-Ge':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Vilambit (Full Drop)', bars:8, bpm:72, tracks:['Tanpura','Sitar','Sarangi','Shehnai','Tabla-Ge','Tabla-Na','Bansuri'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1], 'Sarangi':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Shehnai':[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0], 'Tabla-Ge':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Tabla-Na':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0], 'Bansuri':[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0] }},
      { name:'Drut (Variation)', bars:8, bpm:86, tracks:['Tanpura','Sitar','Tabla-Ge','Tabla-Na','Sarangi','Shehnai','Bansuri'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1], 'Tabla-Ge':[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0], 'Tabla-Na':[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1], 'Sarangi':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Shehnai':[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0], 'Bansuri':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Sam (Outro)', bars:4, bpm:58, tracks:['Tanpura','Sitar','Sarangi'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 'Sarangi':[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }}
    ]
  },

  // ── WESTERN POP/ORCHESTRAL ──
  westernpop: {
    name:'Western Pop/Orchestral', icon:'🎻', region:'Western', bpm:120, world:'western',
    desc:'Epic orchestral pop — strings swell, choir, trumpet fanfare, driving kick and snare',
    moods:{ excited:'🤩', happy:'😊', festive:'🎉' },
    sections:[
      { name:'Prelude (Intro)', bars:4, bpm:90, tracks:['Strings','Choir'],
        patterns:{ 'Strings':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Choir':[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0] }},
      { name:'Theme (Build)', bars:8, bpm:108, tracks:['Strings','Choir','Trumpet','Piano','Kick','Snare'],
        patterns:{ 'Strings':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Choir':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Trumpet':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Piano':[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0], 'Kick':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Snare':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] }},
      { name:'Climax (Full Drop)', bars:8, bpm:120, tracks:['Strings','Choir','Trumpet','Piano','Kick','Snare','Hi-Hat','OrchHit','808 Bass','Timpani'],
        patterns:{ 'Strings':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], 'Choir':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Trumpet':[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0], 'Piano':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Kick':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Snare':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Hi-Hat':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1], 'OrchHit':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], '808 Bass':[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0], 'Timpani':[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0] }},
      { name:'Variation', bars:8, bpm:125, tracks:['Strings','Choir','Trumpet','Piano','Kick','Snare','Hi-Hat','Guitar','Synth'],
        patterns:{ 'Strings':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Choir':[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Trumpet':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], 'Piano':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], 'Kick':[1,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0], 'Snare':[0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0], 'Hi-Hat':[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 'Guitar':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0], 'Synth':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1] }},
      { name:'Coda (Outro)', bars:4, bpm:95, tracks:['Strings','Choir','Trumpet'],
        patterns:{ 'Strings':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Choir':[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 'Trumpet':[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }}
    ]
  },

  // ── BOLLYWOOD FUSION ──
  bollywood: {
    name:'Bollywood Fusion', icon:'🎬', region:'Mumbai/Pan-India', bpm:115, world:'eastern',
    desc:'Modern Bollywood — Tabla groove, Sitar, Strings, Synth, 808 bass fusion',
    moods:{ happy:'😊', festive:'🎉', romantic:'❤️' },
    sections:[
      { name:'Mukhda (Intro)', bars:4, bpm:95, tracks:['Tanpura','Sitar','Tabla-Ge'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] }},
      { name:'Antara (Build)', bars:8, bpm:108, tracks:['Tanpura','Sitar','Tabla-Ge','Tabla-Na','Dholak','Strings'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0], 'Tabla-Ge':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0], 'Tabla-Na':[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1], 'Dholak':[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1], 'Strings':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Drop', bars:8, bpm:118, tracks:['Sitar','Tabla-Ge','Tabla-Na','Dholak','Strings','Kick','Snare','Hi-Hat','808 Bass','Synth'],
        patterns:{ 'Sitar':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1], 'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0], 'Dholak':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Strings':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], 'Kick':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Snare':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Hi-Hat':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], '808 Bass':[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0], 'Synth':[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0] }},
      { name:'Variation', bars:8, bpm:122, tracks:['Sitar','Tabla-Na','Tabla-Ge','Dholak','Kick','Snare','Hi-Hat','808 Bass','Bansuri','Sarangi'],
        patterns:{ 'Sitar':[0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,1], 'Tabla-Na':[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], 'Kick':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0], 'Snare':[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1], 'Hi-Hat':[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], '808 Bass':[1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0], 'Bansuri':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'Sarangi':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] }},
      { name:'Outro', bars:4, bpm:98, tracks:['Tanpura','Sitar','Tabla-Ge'],
        patterns:{ 'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 'Sitar':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0], 'Tabla-Ge':[1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0] }}
    ]
  }
};

// ── EXISTING GENRE/MOOD SYSTEM (kept for live studio) ──
const GENRE_MOODS = {
  rock:{name:'Rock',icon:'🤘',world:'western',desc:'Heavy drums, distorted guitar',moods:{angry:{emoji:'😡',name:'Angry Rock',desc:'Max aggression',bpm:155,tweak:g=>{g['Kick']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['Snare']=[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0];g['Hi-Hat']=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];g['Guitar']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['808 Bass']=[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1];}},excited:{emoji:'🤩',name:'Excited Rock',desc:'Driving energy',bpm:140,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1];g['Guitar']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['808 Bass']=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0];}}}},
  jazz:{name:'Jazz',icon:'🎷',world:'western',desc:'Swinging rhythms, trumpet',moods:{calm:{emoji:'😌',name:'Calm Jazz',desc:'Late night lounge',bpm:80,tweak:g=>{g['Hi-Hat']=[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Kick']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Piano']=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0];g['Trumpet']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0];}},romantic:{emoji:'❤️',name:'Romantic Jazz',desc:'Warm ballad',bpm:72,tweak:g=>{g['Piano']=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1];g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Trumpet']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];}}}},
  hiphop:{name:'Hip-Hop',icon:'🎤',world:'western',desc:'808 bass, crisp snare',moods:{angry:{emoji:'😡',name:'Angry Hip-Hop',desc:'Trap style',bpm:140,tweak:g=>{g['Kick']=[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1];g['Hi-Hat']=[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0];g['808 Bass']=[1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0];}},happy:{emoji:'😊',name:'Happy Hip-Hop',desc:'Old school bounce',bpm:95,tweak:g=>{g['Kick']=[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['808 Bass']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];}}}},
  edm:{name:'EDM',icon:'🎛️',world:'western',desc:'Four on the floor',moods:{excited:{emoji:'🤩',name:'Peak EDM',desc:'Festival drop',bpm:135,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1];g['Hi-Hat']=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];g['Synth']=[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0];g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];}},happy:{emoji:'😊',name:'Happy EDM',desc:'Melodic house',bpm:124,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Synth']=[1,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0];g['808 Bass']=[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0];}}}},
  bollywood:{name:'Bollywood',icon:'🎬',world:'eastern',desc:'Tabla, Sitar, Dholak',moods:{happy:{emoji:'😊',name:'Happy Bollywood',desc:'Dance number',bpm:118,tweak:g=>{g['Tabla-Na']=[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1];g['Tabla-Ge']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Dholak']=[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1];g['Sitar']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];}},festive:{emoji:'🎉',name:'Festive Bollywood',desc:'Shaadi vibes',bpm:130,tweak:g=>{g['Tabla-Na']=[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0];g['Dhol']=[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];g['Dholak']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];}}}},
  hindustani:{name:'Hindustani',icon:'🪔',world:'eastern',desc:'Raga, Tabla, Tanpura',moods:{calm:{emoji:'😌',name:'Calm Hindustani',desc:'Vilambit laya',bpm:55,tweak:g=>{g['Tabla-Na']=[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Sitar']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}},melancholic:{emoji:'🌧️',name:'Melancholic Hindustani',desc:'Evening raga',bpm:50,tweak:g=>{g['Tabla-Na']=[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];}}}},
  carnatic:{name:'Carnatic',icon:'🌺',world:'eastern',desc:'Mridangam, Bansuri',moods:{excited:{emoji:'🤩',name:'Excited Carnatic',desc:'Madhyama kala',bpm:125,tweak:g=>{g['Mridangam']=[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0];g['Bansuri']=[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}},festive:{emoji:'🎉',name:'Festive Carnatic',desc:'Temple festival',bpm:140,tweak:g=>{g['Mridangam']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1];g['Bansuri']=[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];}}}},
  sufi:{name:'Sufi/Folk',icon:'🌙',world:'eastern',desc:'Dhol, Sarangi, Bansuri',moods:{calm:{emoji:'😌',name:'Calm Sufi',desc:'Meditative qawwali',bpm:72,tweak:g=>{g['Dhol']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}},sad:{emoji:'😢',name:'Sad Sufi',desc:'Lament',bpm:60,tweak:g=>{g['Dhol']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Bansuri']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0];}}}},
};

// ── STATE ──
const STEPS = 16;
let bpm = 120, isPlaying = false, currentStep = 0, intervalId = null;
let grid = emptyGrid(), currentGenreKey = null, currentMoodKey = null, currentWorld = 'western';
let savedPatterns = [], activeMoodFilter = 'all', pendingGenre = null, pendingMoodSelected = null;
let learnMode = false, learnStepIndex = 0, learnStepsList = [];
let currentArrangement = null;
try { savedPatterns = JSON.parse(localStorage.getItem('bf8_patterns') || '[]'); } catch(e) {}

// ── INSTRUMENT INFO ──
const INSTR_INFO = {
  'Kick':{name:'Kick Drum',origin:'Universal',desc:'The heartbeat. Sine wave drops from 180Hz to 38Hz simulating membrane impact.',tip:'Kick on beats 1 & 3 is the classic pattern.'},
  'Snare':{name:'Snare Drum',origin:'Western',desc:'Triangle wave body + highpass noise for the snare rattle.',tip:'Snare on 2 & 4 defines the backbeat.'},
  'Hi-Hat':{name:'Hi-Hat',origin:'Western',desc:'Highpass filtered noise at 9500Hz. Closed = 60ms. Open = 450ms.',tip:'16th note hi-hats double perceived tempo.'},
  'Open-Hat':{name:'Open Hi-Hat',origin:'Western',desc:'Same as hi-hat but longer sustain ring.',tip:'Use at phrase endings for anticipation.'},
  '808 Bass':{name:'Roland 808 Bass',origin:'Western',desc:'Named after the Roland TR-808 (1980). Sine with soft clipping and pitch dive.',tip:'The 808 defined hip-hop and trap music.'},
  'Guitar':{name:'Electric Guitar',origin:'Western',desc:'5 harmonic layers with overdrive waveshaper. Slight detuning for realism.',tip:'Power chords (root+5th) define rock.'},
  'Piano':{name:'Piano',origin:'Western',desc:'6 harmonic partials with hammer transient. Each harmonic has different decay.',tip:'The piano spans over 7 octaves — 88 keys.'},
  'Trumpet':{name:'Trumpet',origin:'Western',desc:'Sawtooth with lip-attack glide + bandpass filter for brass formant character.',tip:'Jazz trumpet uses lots of vibrato and blue notes.'},
  'Strings':{name:'Orchestral Strings',origin:'Western',desc:'4 sawtooth harmonics with slow bow attack and vibrato LFO.',tip:'Slow strings = emotion; fast strings = tension.'},
  'Synth':{name:'Synthesizer',origin:'Western',desc:'Sawtooth through lowpass filter with envelope sweep — classic analog synth.',tip:'Filter cutoff sweep is the most expressive synth technique.'},
  'Choir':{name:'Choir Pad',origin:'Western',desc:'Formant synthesis simulating "Aah" vowel. Three bandpass filters at 800, 1200, 2500Hz.',tip:'Choir is used in epic film scores for grandeur.'},
  'OrchHit':{name:'Orchestral Hit',origin:'Western',desc:'Strings + trumpet simultaneously creating a powerful stab accent.',tip:'Famous in 80s pop and hip-hop sampling.'},
  'Timpani':{name:'Timpani',origin:'Western',desc:'Orchestral kettledrum. Sine wave from 110Hz to 55Hz with long decay.',tip:'Timpani was used in Beethoven\'s 9th Symphony.'},
  'Tabla-Na':{name:'Tabla (Na)',origin:'North India',desc:'High crisp bol — index finger tip on right dayan. Pitch drops from 630Hz.',tip:'Tabla is the main percussion of Hindustani classical music.'},
  'Tabla-Ge':{name:'Tabla (Ge)',origin:'North India',desc:'Resonant bass bol on left bayan (metal drum). Deep sliding bass.',tip:'The bayan produces unique sliding pitches.'},
  'Dhol':{name:'Dhol Bass',origin:'Punjab/Bengal',desc:'Large cylindrical drum. Curved beater produces deep boom from 95Hz.',tip:'Dhol is the backbone of Bhangra music.'},
  'Dhol-Hi':{name:'Dhol Treble',origin:'Punjab/Bengal',desc:'Thin stick on treble side. Triangle wave + highpass noise for sharp crack.',tip:'The two Dhol sides interplay creates signature patterns.'},
  'Dholak':{name:'Dholak',origin:'South Asia',desc:'Barrel drum. Sine from 165Hz. Used in qawwali, folk, and Bollywood.',tip:'Dholak gives Bollywood music its rustic warmth.'},
  'Sitar':{name:'Sitar',origin:'North India',desc:'6 harmonic layers with jawari (inharmonic buzz) — micro-pitch flutter per harmonic.',tip:'The sitar has 18-21 strings, 7 played + 11-14 sympathetic.'},
  'Bansuri':{name:'Bansuri Flute',origin:'India',desc:'Transverse bamboo flute. Breath noise + vibrato LFO + meend glide.',tip:'Bansuri is associated with Lord Krishna.'},
  'Mridangam':{name:'Mridangam R',origin:'South India',desc:'Right side (valanthalai) — sine from 460Hz + highpass attack.',tip:'Mridangam is the primary Carnatic percussion.'},
  'Mridangam-B':{name:'Mridangam L',origin:'South India',desc:'Left thoppi smeared with semolina for bass. Sine from 140Hz.',tip:'Two sides together create complex tala patterns.'},
  'Sarangi':{name:'Sarangi',origin:'North India',desc:'Bowed string, 5 sawtooth harmonics with fast 6.5Hz vibrato.',tip:'Sarangi follows the human voice closely in ragas.'},
  'Tanpura':{name:'Tanpura Drone',origin:'India',desc:'4-string drone plucked in sequence. 4 harmonics per string + jawari.',tip:'Always plays open strings only — never melodic.'},
  'Veena':{name:'Veena',origin:'South India',desc:'Plucked string instrument. 5 harmonic layers, brighter than sitar.',tip:'Veena is one of the oldest Indian instruments — 1500+ years old.'},
  'Kanjira':{name:'Kanjira',origin:'South India',desc:'Small tambourine-like frame drum with lizard skin. Jingle ring.',tip:'Kanjira provides rhythmic color in Carnatic ensembles.'},
  'Khol-Hi':{name:'Khol (High)',origin:'Bengal/Assam',desc:'Bengali clay drum. High side played with fingers.',tip:'Khol is sacred in kirtan — Chaitanya Mahaprabhu popularized it.'},
  'Khol-Lo':{name:'Khol (Low)',origin:'Bengal/Assam',desc:'Khol low side — deep resonant bass stroke with full palm.',tip:'Khol rhythm is fundamental to Rabindra Sangeet accompaniment.'},
  'Esraj':{name:'Esraj',origin:'Bengal/Punjab',desc:'Bowed string between sarangi and violin. 4 harmonics with warm vibrato.',tip:'Esraj is unique to Bengali and Sikh classical music.'},
  'Nadhaswaram':{name:'Nadhaswaram',origin:'Tamil Nadu',desc:'Double-reed South Indian oboe. Nasal, ceremonial tone with vibrato.',tip:'Nadhaswaram is played at Hindu weddings and temples.'},
  'Tungi':{name:'Tungi',origin:'Odisha',desc:'Odia tribal drum. Sine from 200Hz — warm mid-range folk character.',tip:'Tungi is central to Sambalpuri folk dance music.'},
  'Mahuri':{name:'Mahuri',origin:'Odisha',desc:'Odia double-reed wind instrument — cousin of Shehnai/Nadhaswaram.',tip:'Mahuri is the ceremonial wind instrument of Odisha temples.'},
  'Harmonium':{name:'Harmonium',origin:'North India/Bhojpuri',desc:'Pumped reed organ. Square+sawtooth harmonics. Central to Indian folk.',tip:'Harmonium was introduced to India by French missionaries in 1800s.'},
  'Nagara':{name:'Nagara',origin:'Rajasthan/Bihar',desc:'Large kettledrum. Sine from 80Hz to 35Hz. Deep ceremonial thunder.',tip:'Nagara was used in Mughal courts and temples for announcements.'},
  'Shehnai':{name:'Shehnai',origin:'North India',desc:'Conical double-reed instrument. Bandpass filter + vibrato LFO.',tip:'Ustad Bismillah Khan made Shehnai world-famous.'},
  'Konakkol':{name:'Konakkol',origin:'South India',desc:'Carnatic vocal percussion — mouth drum syllables (ta, di, ki, na).',tip:'Konakkol musicians can perform complex konnakol solos without instruments.'},
};

// ── DARK MODE ──
function initDarkMode() {
  const saved = localStorage.getItem('bf8_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
}
const darkBtn = document.getElementById('darkToggle');
if (darkBtn) darkBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  darkBtn.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('bf8_theme', next);
});

// ── VISUALIZER ──
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas ? canvas.getContext('2d') : null;
const vizLabel = document.getElementById('vizLabel');
let vizRunning = false;
function drawVisualizer() {
  if (!vizRunning || !canvasCtx) return;
  requestAnimationFrame(drawVisualizer);
  const W = canvas.width, H = canvas.height;
  const dataArr = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArr);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  canvasCtx.fillStyle = isDark ? '#1a1916' : '#ffffff';
  canvasCtx.fillRect(0, 0, W, H);
  const barW = W / dataArr.length * 2.8;
  let x = 0;
  for (let i = 0; i < dataArr.length; i++) {
    const barH = (dataArr[i] / 255) * H;
    const hue = 180 + i * 0.9;
    canvasCtx.fillStyle = `hsl(${hue},75%,${isDark ? 60 : 50}%)`;
    canvasCtx.fillRect(x, H - barH, barW - 1, barH);
    x += barW;
  }
}
function startVisualizer() {
  if (!canvas) return;
  if (vizLabel) vizLabel.style.display = 'none';
  vizRunning = true;
  canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
  drawVisualizer();
}
function stopVisualizer() {
  vizRunning = false;
  if (vizLabel) vizLabel.style.display = 'flex';
  if (canvasCtx && canvas) { canvasCtx.clearRect(0, 0, canvas.width, canvas.height); }
}

// ── INSTRUMENT TOOLTIP ──
function showTooltip(trackName, el) {
  const info = INSTR_INFO[trackName]; if (!info) return;
  const tt = document.getElementById('instrTooltip'); if (!tt) return;
  document.getElementById('ttName').textContent = info.name;
  document.getElementById('ttOrigin').textContent = '📍 ' + info.origin;
  document.getElementById('ttDesc').textContent = info.desc;
  document.getElementById('ttTip').textContent = '💡 ' + info.tip;
  tt.style.display = 'block';
  const rect = el.getBoundingClientRect();
  tt.style.left = Math.min(rect.right + 8, window.innerWidth - 260) + 'px';
  tt.style.top = Math.max(rect.top - 20, 8) + 'px';
}
function hideTooltip() { const tt = document.getElementById('instrTooltip'); if (tt) tt.style.display = 'none'; }
document.addEventListener('click', e => { if (!e.target.classList.contains('track-label')) hideTooltip(); });

// ── MOOD FILTER ──
function filterByMood(mood, btn) {
  activeMoodFilter = mood;
  document.querySelectorAll('.mood-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.genre-card').forEach(card => {
    const moods = card.dataset.moods || '';
    card.classList.toggle('dimmed', mood !== 'all' && !moods.split(',').includes(mood));
  });
}
function switchWorld(world, btn) {
  document.querySelectorAll('.genre-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('westernGenres').style.display = world === 'western' ? 'grid' : 'none';
  document.getElementById('easternGenres').style.display = world === 'eastern' ? 'grid' : 'none';
}

// ── ARRANGEMENT PICKER ──
function openArrangementPicker() {
  const modal = document.getElementById('arrangementModal');
  if (!modal) return;
  const grid = document.getElementById('arrangementGrid');
  grid.innerHTML = Object.entries(ARRANGEMENTS).map(([key, arr]) => `
    <div class="arr-card" onclick="selectArrangement('${key}')">
      <div class="arr-icon">${arr.icon}</div>
      <div class="arr-name">${arr.name}</div>
      <div class="arr-region">📍 ${arr.region}</div>
      <div class="arr-desc">${arr.desc}</div>
      <div class="arr-bpm">${arr.bpm} BPM · ${arr.sections.reduce((s,sec)=>s+sec.bars,0)} bars</div>
      <div class="arr-moods">${Object.entries(arr.moods).map(([k,v])=>`<span class="gmt ${k}">${v} ${k}</span>`).join('')}</div>
    </div>
  `).join('');
  modal.style.display = 'flex';
}
function closeArrangementModal(e) {
  if (e.target === document.getElementById('arrangementModal') || e.target.classList.contains('modal-close'))
    document.getElementById('arrangementModal').style.display = 'none';
}
function selectArrangement(key) {
  currentArrangement = key;
  document.getElementById('arrangementModal').style.display = 'none';
  const arr = ARRANGEMENTS[key];
  // Load first section into grid for preview
  grid = emptyGrid();
  const firstSec = arr.sections[0];
  Object.entries(firstSec.patterns).forEach(([track, pat]) => { if (grid[track] !== undefined) grid[track] = pat.map(v => !!v); });
  document.getElementById('bpm').value = arr.bpm; bpm = arr.bpm;
  const w = arr.world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(w === 'western' ? 'tabWestern' : 'tabEastern').classList.add('active');
  currentWorld = w;
  renderGrid(currentWorld);
  if (isPlaying) restartPlayback();
  // Update badge
  document.getElementById('activeGenreRow').style.display = 'flex';
  document.getElementById('activeGenreBadge').textContent = arr.icon + ' ' + arr.name;
  document.getElementById('activeMoodBadge').textContent = '📍 ' + arr.region;
  document.getElementById('activeGenreDesc').textContent = arr.desc;
  setStatus('', arr.icon + ' ' + arr.name + ' loaded! Hit ⬇️ WAV — choose your duration (2 min, 5 min, 10 min...)');
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}

// ── MOOD MODAL ──
function openGenreMoodPicker(genreKey) {
  const genre = GENRE_MOODS[genreKey]; if (!genre) return;
  pendingGenre = genreKey; pendingMoodSelected = null;
  document.getElementById('modalGenreIcon').textContent = genre.icon;
  document.getElementById('modalGenreName').textContent = genre.name;
  document.getElementById('modalGenreDesc').textContent = genre.desc;
  const container = document.getElementById('modalMoodOptions'); container.innerHTML = '';
  const preselect = activeMoodFilter !== 'all' && genre.moods[activeMoodFilter] ? activeMoodFilter : null;
  Object.entries(genre.moods).forEach(([moodKey, mood]) => {
    const btn = document.createElement('button');
    btn.className = 'modal-mood-btn' + (preselect === moodKey ? ' selected' : '');
    btn.innerHTML = `<span class="mmb-emoji">${mood.emoji}</span><div class="mmb-info"><div class="mmb-name">${mood.name}</div><div class="mmb-desc">${mood.desc}</div></div><span class="mmb-bpm">${mood.bpm} BPM</span>`;
    btn.addEventListener('click', () => { container.querySelectorAll('.modal-mood-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); pendingMoodSelected = moodKey; });
    container.appendChild(btn);
  });
  if (preselect) pendingMoodSelected = preselect;
  const loadBtn = document.createElement('button'); loadBtn.className = 'modal-load-btn'; loadBtn.textContent = 'Load This Beat →';
  loadBtn.addEventListener('click', () => { if (!pendingMoodSelected) pendingMoodSelected = Object.keys(genre.moods)[0]; loadGenreMood(pendingGenre, pendingMoodSelected); document.getElementById('moodModal').style.display = 'none'; });
  container.appendChild(loadBtn);
  document.getElementById('moodModal').style.display = 'flex';
}
function closeMoodModal(e) { if (e.target === document.getElementById('moodModal')) document.getElementById('moodModal').style.display = 'none'; }

function loadGenreMood(genreKey, moodKey) {
  const genre = GENRE_MOODS[genreKey], mood = genre.moods[moodKey]; if (!genre || !mood) return;
  currentGenreKey = genreKey; currentMoodKey = moodKey; currentArrangement = null;
  grid = emptyGrid(); mood.tweak(grid);
  document.getElementById('bpm').value = mood.bpm; bpm = mood.bpm;
  document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.genre-card[data-genre="${genreKey}"]`); if (card) card.classList.add('selected');
  const banner = document.getElementById('genreBanner');
  document.getElementById('genreBannerIcon').textContent = genre.icon + ' ' + mood.emoji;
  document.getElementById('genreBannerName').textContent = mood.name + ' loaded — ' + mood.bpm + ' BPM';
  document.getElementById('genreBannerDesc').textContent = mood.desc;
  banner.style.display = 'flex';
  document.getElementById('activeGenreRow').style.display = 'flex';
  document.getElementById('activeGenreBadge').textContent = genre.icon + ' ' + genre.name;
  document.getElementById('activeMoodBadge').textContent = mood.emoji + ' ' + mood.name.split(' ')[0];
  document.getElementById('activeGenreDesc').textContent = mood.desc;
  document.getElementById('patternName').placeholder = 'My ' + mood.name;
  const w = genre.world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(w === 'western' ? 'tabWestern' : 'tabEastern').classList.add('active');
  currentWorld = w;
  renderGrid(currentWorld);
  if (isPlaying) restartPlayback();
  setStatus('', genre.icon + mood.emoji + ' ' + mood.name + ' loaded!');
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}

// ── GRID RENDER ──
function showWorld(world) {
  currentWorld = world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  const ids = { western: 'tabWestern', eastern: 'tabEastern', both: 'tabBoth' };
  document.getElementById(ids[world]).classList.add('active');
  renderGrid(world);
}
function renderGrid(world) {
  const w = world || currentWorld || 'western';
  const gridEl = document.getElementById('grid'); gridEl.innerHTML = '';
  const sections = [];
  if (w === 'western' || w === 'both') sections.push({ label: '🎸 Western Instruments', tracks: TRACKS.filter(t => t.world === 'western') });
  if (w === 'eastern' || w === 'both') sections.push({ label: '🪘 Eastern Instruments', tracks: TRACKS.filter(t => t.world === 'eastern') });
  sections.forEach(sec => {
    const section = document.createElement('div'); section.className = 'track-section';
    const hdr = document.createElement('div'); hdr.className = 'track-section-header'; hdr.textContent = sec.label;
    section.appendChild(hdr);
    sec.tracks.forEach(track => {
      const row = document.createElement('div'); row.className = 'track-row';
      const label = document.createElement('span'); label.className = 'track-label';
      label.textContent = track.label; label.style.borderLeft = `3px solid ${track.color}`;
      label.addEventListener('mouseenter', e => showTooltip(track.name, e.target));
      label.addEventListener('mouseleave', hideTooltip);
      row.appendChild(label);
      const stepsRow = document.createElement('div'); stepsRow.className = 'steps-row';
      for (let i = 0; i < STEPS; i++) {
        const btn = document.createElement('button');
        const active = grid[track.name] && grid[track.name][i];
        btn.className = 'step-btn' + (active ? ' active' : '');
        btn.dataset.track = track.name; btn.dataset.step = i;
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
      const volWrap = document.createElement('div'); volWrap.className = 'vol-slider-wrap';
      const slider = document.createElement('input'); slider.type = 'range'; slider.min = 0; slider.max = 1; slider.step = 0.05;
      slider.value = trackVolumes[track.name] || 1; slider.className = 'vol-slider';
      slider.addEventListener('input', () => { trackVolumes[track.name] = parseFloat(slider.value); });
      volWrap.appendChild(slider); row.appendChild(volWrap);
      section.appendChild(row);
    });
    gridEl.appendChild(section);
  });
}

// ── PLAYBACK ──
function tick() {
  document.querySelectorAll('.step-btn').forEach(btn => { btn.classList.toggle('current', parseInt(btn.dataset.step) === currentStep); });
  TRACKS.forEach(track => {
    if (grid[track.name] && grid[track.name][currentStep] && (trackVolumes[track.name] || 1) > 0) track.play(audioCtx.currentTime);
  });
  currentStep = (currentStep + 1) % STEPS;
}
function getInterval() { return (60 / bpm / 4) * 1000; }
function restartPlayback() { clearInterval(intervalId); bpm = parseInt(document.getElementById('bpm').value) || 120; intervalId = setInterval(tick, getInterval()); }

document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) return;
  audioCtx.resume(); isPlaying = true;
  bpm = parseInt(document.getElementById('bpm').value) || 120;
  intervalId = setInterval(tick, getInterval());
  document.getElementById('playBtn').classList.add('active');
  startVisualizer();
  setStatus('playing', '▶ Playing');
});
document.getElementById('stopBtn').addEventListener('click', () => {
  if (!isPlaying) return;
  isPlaying = false; clearInterval(intervalId); currentStep = 0;
  document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('current'));
  document.getElementById('playBtn').classList.remove('active');
  stopVisualizer();
  setStatus('', 'Stopped');
});
document.getElementById('clearBtn').addEventListener('click', () => {
  grid = emptyGrid();
  document.querySelectorAll('.step-btn').forEach(b => { b.classList.remove('active', 'current'); b.style.background = ''; });
  setStatus('', 'Grid cleared');
});
document.getElementById('bpmUp').addEventListener('click', () => { const i = document.getElementById('bpm'); i.value = Math.min(240, parseInt(i.value) + 5); if (isPlaying) restartPlayback(); });
document.getElementById('bpmDown').addEventListener('click', () => { const i = document.getElementById('bpm'); i.value = Math.max(40, parseInt(i.value) - 5); if (isPlaying) restartPlayback(); });
document.getElementById('bpm').addEventListener('change', () => { if (isPlaying) restartPlayback(); });

// ── SAVE/LOAD ──
document.getElementById('saveBtn').addEventListener('click', () => {
  const genre = currentGenreKey ? GENRE_MOODS[currentGenreKey] : null;
  const mood = genre && currentMoodKey ? genre.moods[currentMoodKey] : null;
  const arr = currentArrangement ? ARRANGEMENTS[currentArrangement] : null;
  const name = document.getElementById('patternName').value.trim() || (mood ? 'My ' + mood.name : arr ? 'My ' + arr.name : 'Pattern ' + (savedPatterns.length + 1));
  const pattern = { id: Date.now(), name, bpm: parseInt(document.getElementById('bpm').value), genre: currentGenreKey, genreIcon: genre?.icon, genreName: genre?.name, mood: currentMoodKey, moodEmoji: mood?.emoji, moodName: mood?.name, arrangement: currentArrangement, arrangementName: arr?.name, arrangementIcon: arr?.icon, grid: JSON.parse(JSON.stringify(grid)), likes: 0, createdAt: new Date().toLocaleString() };
  savedPatterns.unshift(pattern);
  try { localStorage.setItem('bf8_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderGallery();
  document.getElementById('patternName').value = '';
  setStatus('saved', `💾 "${name}" saved!`);
});
function loadPattern(pattern) {
  document.getElementById('bpm').value = pattern.bpm; bpm = pattern.bpm;
  grid = pattern.grid || emptyGrid();
  currentGenreKey = pattern.genre || null; currentMoodKey = pattern.mood || null; currentArrangement = pattern.arrangement || null;
  renderGrid(currentWorld);
  if (isPlaying) restartPlayback();
  setStatus('', `📂 Loaded "${pattern.name}"`);
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}
function deletePattern(id) { savedPatterns = savedPatterns.filter(p => p.id !== id); try { localStorage.setItem('bf8_patterns', JSON.stringify(savedPatterns)); } catch(e) {} renderGallery(); }
function likePattern(id) { const p = savedPatterns.find(p => p.id === id); if (!p) return; p.likes = (p.likes || 0) + 1; try { localStorage.setItem('bf8_patterns', JSON.stringify(savedPatterns)); } catch(e) {} renderGallery(); }
function sharePattern(id) {
  const p = savedPatterns.find(p => p.id === id); if (!p) return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(p))));
  const url = window.location.origin + window.location.pathname + '?pattern=' + encoded;
  if (navigator.clipboard) { navigator.clipboard.writeText(url).then(() => setStatus('saved', '🔗 Link copied!')); }
  else { prompt('Copy this link:', url); }
}

// ── GALLERY ──
function renderGallery() {
  const container = document.getElementById('galleryGrid');
  if (!savedPatterns.length) { container.innerHTML = '<div class="no-gallery">No saved patterns yet. Build a beat and save it!</div>'; return; }
  container.innerHTML = savedPatterns.map(p => {
    const firstTrack = TRACKS.find(t => p.grid && p.grid[t.name] && p.grid[t.name].some(v => v));
    const miniSteps = firstTrack ? (p.grid[firstTrack.name] || Array(16).fill(false)) : Array(16).fill(false);
    const miniHTML = miniSteps.map((v, i) => `<div class="gc-step${v ? ' on' : ''}" style="${v ? 'background:' + ((firstTrack && firstTrack.color) || '#e8521a') : ''}"></div>`).join('');
    return `<div class="gallery-card">
      <div class="gc-header"><div>
        <div class="gc-name">${p.name}</div>
        <div class="gc-tags">
          ${p.genreIcon ? `<span class="gc-tag">${p.genreIcon} ${p.genreName}</span>` : ''}
          ${p.moodEmoji ? `<span class="gc-tag">${p.moodEmoji} ${p.moodName}</span>` : ''}
          ${p.arrangementIcon ? `<span class="gc-tag">${p.arrangementIcon} ${p.arrangementName}</span>` : ''}
        </div>
      </div></div>
      <div class="gc-mini-grid">${miniHTML}</div>
      <div class="gc-meta">${p.bpm} BPM · ${p.createdAt}</div>
      <div class="gc-actions">
        <button class="gc-btn" onclick='loadPattern(${JSON.stringify(p)})'>📂 Load</button>
        <button class="gc-btn" onclick="sharePattern(${p.id})">🔗 Share</button>
        <button class="gc-btn delete" onclick="deletePattern(${p.id})">✕</button>
        <button class="gc-like${(p.likes || 0) > 0 ? ' liked' : ''}" onclick="likePattern(${p.id})">♥ ${p.likes || 0}</button>
      </div>
    </div>`;
  }).join('');
}

// ── SEARCH ──
function handleSearch(query) {
  const q = query.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClear');
  const resultsBox = document.getElementById('searchResults');
  if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
  if (!q) { if (resultsBox) resultsBox.style.display = 'none'; return; }
  const results = [];
  Object.entries(GENRE_MOODS).forEach(([genreKey, genre]) => {
    if (genre.name.toLowerCase().includes(q) || genre.world.includes(q)) results.push({ icon: genre.icon, name: genre.name, meta: genre.world === 'western' ? '🎸 Western' : '🪘 Eastern', type: 'genre', key: genreKey, moodKey: null });
    Object.entries(genre.moods).forEach(([moodKey, mood]) => { if (mood.name.toLowerCase().includes(q) || moodKey.includes(q)) results.push({ icon: mood.emoji, name: mood.name, meta: genre.icon + ' ' + genre.name + ' · ' + mood.bpm + ' BPM', type: 'mood', key: genreKey, moodKey }); });
  });
  Object.entries(ARRANGEMENTS).forEach(([key, arr]) => {
    if (arr.name.toLowerCase().includes(q) || arr.region.toLowerCase().includes(q) || arr.desc.toLowerCase().includes(q)) results.push({ icon: arr.icon, name: arr.name, meta: '📍 ' + arr.region, type: 'arrangement', key, moodKey: null });
  });
  TRACKS.forEach(track => {
    const info = INSTR_INFO[track.name];
    if (track.label.toLowerCase().includes(q) || track.name.toLowerCase().includes(q) || (info && info.name.toLowerCase().includes(q)) || (info && info.origin.toLowerCase().includes(q)))
      results.push({ icon: track.world === 'western' ? '🎸' : '🪘', name: info ? info.name : track.label, meta: info ? info.origin : '', type: 'instrument', key: track.name, moodKey: null });
  });
  if (!results.length) { if (resultsBox) { resultsBox.innerHTML = `<div class="search-results-title">No results for "${query}"</div><div class="no-search-results">Try "Rabindra", "Bhojpuri", "Odia", "South Indian", "Jazz", "Sitar"...</div>`; resultsBox.style.display = 'block'; } return; }
  const cards = results.slice(0, 12).map(r => `<div class="search-result-card" onclick="handleSearchClick('${r.type}','${r.key}','${r.moodKey || ''}')"><span class="src-icon">${r.icon}</span><div class="src-info"><div class="src-name">${r.name}</div><div class="src-meta">${r.meta}</div></div><span class="src-type">${r.type}</span></div>`).join('');
  if (resultsBox) { resultsBox.innerHTML = `<div class="search-results-title">${results.length} result${results.length > 1 ? 's' : ''} for "${query}"</div><div class="search-result-cards">${cards}</div>`; resultsBox.style.display = 'block'; }
}
function handleSearchClick(type, key, moodKey) {
  if (type === 'genre') { const genre = GENRE_MOODS[key]; if (genre) { const isEastern = genre.world === 'eastern'; document.querySelectorAll('.genre-tab').forEach(b => b.classList.remove('active')); document.querySelectorAll('.genre-tab')[isEastern ? 1 : 0].classList.add('active'); document.getElementById('westernGenres').style.display = isEastern ? 'none' : 'grid'; document.getElementById('easternGenres').style.display = isEastern ? 'grid' : 'none'; openGenreMoodPicker(key); } }
  else if (type === 'mood') { loadGenreMood(key, moodKey); clearSearch(); }
  else if (type === 'arrangement') { selectArrangement(key); clearSearch(); }
  else if (type === 'instrument') { const track = TRACKS.find(t => t.name === key); if (track) { showWorld(track.world); document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' }); setStatus('', '💡 ' + (INSTR_INFO[key] ? INSTR_INFO[key].name : key) + ' — hover the label for info'); } clearSearch(); }
}
function clearSearch() { const si = document.getElementById('genreSearch'); if (si) si.value = ''; const sc = document.getElementById('searchClear'); if (sc) sc.style.display = 'none'; const sr = document.getElementById('searchResults'); if (sr) sr.style.display = 'none'; }

function loadFromURL() { const enc = new URLSearchParams(window.location.search).get('pattern'); if (enc) { try { loadPattern(JSON.parse(decodeURIComponent(escape(atob(enc))))); } catch(e) {} } }

// ── LEARN MODE ──
function buildLearnSteps() {
  const steps = [];
  const activeTracks = TRACKS.filter(t => grid[t.name] && grid[t.name].some(v => v));
  if (!activeTracks.length) { steps.push({ text: 'No steps activated yet! Load a genre or click some steps first.', track: null, stepIdx: null }); return steps; }
  steps.push({ text: `This beat has ${activeTracks.length} active tracks. Let\'s learn each one!`, track: null, stepIdx: null });
  activeTracks.forEach(track => {
    const activeIdxs = grid[track.name].map((v, i) => v ? i + 1 : null).filter(Boolean);
    const info = INSTR_INFO[track.name];
    steps.push({ text: `${track.label}: Active on steps ${activeIdxs.join(', ')}. ${info ? info.desc : ''}`, track: track.name, stepIdx: null });
    activeIdxs.forEach(si => { steps.push({ text: `Step ${si} — ${track.label} hits here. ${info ? 'Tip: ' + info.tip : ''}`, track: track.name, stepIdx: si - 1 }); });
  });
  steps.push({ text: `Great! You\'ve learned this beat. Try modifying steps to explore!`, track: null, stepIdx: null });
  return steps;
}
function enterLearnMode() {
  learnMode = true; learnStepIndex = 0; learnStepsList = buildLearnSteps();
  document.getElementById('learnPanel').style.display = 'block';
  document.getElementById('learnBtn').classList.add('active');
  const arr = currentArrangement ? ARRANGEMENTS[currentArrangement] : null;
  document.getElementById('learnTitle').textContent = arr ? 'Learning: ' + arr.name : 'Learn This Beat';
  document.getElementById('learnSubtitle').textContent = arr ? arr.desc : 'Follow the steps below';
  renderLearnSteps(); updateLearnStep();
}
function exitLearnMode() { learnMode = false; document.getElementById('learnPanel').style.display = 'none'; document.getElementById('learnBtn').classList.remove('active'); document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('learn-highlight')); }
function renderLearnSteps() { const container = document.getElementById('learnSteps'); container.innerHTML = ''; learnStepsList.forEach((step, i) => { const div = document.createElement('div'); div.className = 'learn-step' + (i === learnStepIndex ? ' active' : i < learnStepIndex ? ' done' : ''); div.textContent = (i < learnStepIndex ? '✓ ' : '') + (i === learnStepIndex ? '▶ ' : '') + step.text; container.appendChild(div); }); const active = container.querySelector('.learn-step.active'); if (active) active.scrollIntoView({ block: 'nearest' }); }
function updateLearnStep() { const step = learnStepsList[learnStepIndex]; if (!step) return; document.getElementById('learnProgress').textContent = `${learnStepIndex + 1} / ${learnStepsList.length}`; document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('learn-highlight')); if (step.track && step.stepIdx !== null) { document.querySelectorAll(`.step-btn[data-track="${step.track}"][data-step="${step.stepIdx}"]`).forEach(b => b.classList.add('learn-highlight')); } else if (step.track) { document.querySelectorAll(`.step-btn[data-track="${step.track}"]`).forEach(b => b.classList.add('learn-highlight')); } document.getElementById('learnTip').textContent = step.text; renderLearnSteps(); }
function learnNext() { if (learnStepIndex < learnStepsList.length - 1) { learnStepIndex++; updateLearnStep(); } }
function learnPrev() { if (learnStepIndex > 0) { learnStepIndex--; updateLearnStep(); } }
const learnBtn = document.getElementById('learnBtn');
if (learnBtn) learnBtn.addEventListener('click', () => { if (learnMode) exitLearnMode(); else enterLearnMode(); });

// ── 3-MINUTE STRUCTURED WAV DOWNLOAD ──
document.getElementById('downloadBtn').addEventListener('click', async () => {
  const arr = currentArrangement ? ARRANGEMENTS[currentArrangement] : null;

  if (arr) {
    // ── ARRANGEMENT MODE: Full 3-minute structured output ──
    setStatus('', '⏳ Rendering 3-minute structured arrangement...');
    const offCtx = new OfflineAudioContext(2, Math.ceil(audioCtx.sampleRate * (TARGET_DURATION + 3)), audioCtx.sampleRate);

    let timeOffset = 0;
    const fadeDuration = 2.5;

    // Calculate total bars
    const totalBars = arr.sections.reduce((s, sec) => s + sec.bars, 0);
    const timePerBar = (sec) => (60 / sec.bpm) * 4; // 4 beats per bar

    // Calculate total natural duration
    let naturalDuration = arr.sections.reduce((sum, sec) => sum + sec.bars * timePerBar(sec), 0);

    // Scale to fill 3 minutes
    const loops = Math.ceil(TARGET_DURATION / naturalDuration);

    for (let loop = 0; loop < loops && timeOffset < TARGET_DURATION; loop++) {
      for (const section of arr.sections) {
        if (timeOffset >= TARGET_DURATION) break;
        const barDuration = timePerBar(section);
        const stepDuration = barDuration / 16;
        const sectionBpm = section.bpm;

        // Render each bar in this section
        for (let bar = 0; bar < section.bars; bar++) {
          if (timeOffset >= TARGET_DURATION) break;

          // Auto-variation: on odd bars in later sections, add subtle variations
          const useVariation = bar % 2 === 1 && loop > 0;

          for (let step = 0; step < 16; step++) {
            const t0 = timeOffset + step * stepDuration;
            if (t0 >= TARGET_DURATION) break;

            section.tracks.forEach(trackName => {
              const pattern = section.patterns[trackName];
              if (!pattern) return;
              let active = pattern[step];
              // Auto-variation: occasionally add ghost notes on off-beats
              if (useVariation && !active && step % 4 !== 0 && Math.random() < 0.12) active = true;
              if (!active) return;
              const track = TRACKS.find(t => t.name === trackName);
              if (!track) return;

              // Volume fade at the very end (outro)
              const remainingTime = TARGET_DURATION - t0;
              if (remainingTime < fadeDuration) {
                // Apply fade out by adjusting gain
                try {
                  const gainNode = offCtx.createGain();
                  gainNode.gain.setValueAtTime(remainingTime / fadeDuration, t0);
                  gainNode.connect(offCtx.destination);
                  // Note: simplified fade — full fade handled in final mix
                } catch(e) {}
              }
              try { track.play(t0, offCtx); } catch(e) {}
            });
          }
          timeOffset += barDuration;
        }
      }
    }

    // Render
    const buf = await offCtx.startRendering();

    // Apply master fade out on last 3 seconds
    const fadeStart = Math.floor((TARGET_DURATION - 3) * audioCtx.sampleRate);
    const fadeEnd = Math.floor(TARGET_DURATION * audioCtx.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const data = buf.getChannelData(c);
      for (let i = fadeStart; i < Math.min(fadeEnd, data.length); i++) {
        data[i] *= 1 - (i - fadeStart) / (fadeEnd - fadeStart);
      }
    }

    const wav = encodeWav(buf);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `BeatForge-${arr.name.replace(/\s+/g, '-')}-${durationMins.toFixed(1)}min.wav`;
    a.click(); URL.revokeObjectURL(url);
    setStatus('saved', `⬇️ ${durationMins.toFixed(1)}-minute "${arr.name}" WAV downloaded!`);

  } else {
    // ── STANDARD MODE ──
    const durationMins2 = parseFloat(prompt('Output duration in minutes (minimum 2, no maximum):', '3')) || 3;
    const TARGET = Math.max(2, durationMins2) * 60;
    setStatus('', `⏳ Rendering ${durationMins2.toFixed(1)}-minute loop...`);
    const stepDur = 60 / bpm / 4;
    const loopDur = STEPS * stepDur;
    const totalLoops = Math.ceil(TARGET / loopDur);
    const totalDur = TARGET + 3;
    const offCtx = new OfflineAudioContext(2, Math.ceil(audioCtx.sampleRate * totalDur), audioCtx.sampleRate);

    for (let loop = 0; loop < totalLoops; loop++) {
      const loopOffset = loop * loopDur;
      if (loopOffset >= TARGET) break;
      // Auto-variation every 4 loops
      const variationLevel = Math.floor(loop / 4);
      for (let step = 0; step < STEPS; step++) {
        const t0 = loopOffset + step * stepDur;
        if (t0 >= TARGET) break;
        TRACKS.forEach(track => {
          if (!grid[track.name]) return;
          let active = grid[track.name][step];
          // Add layers progressively
          if (!active && variationLevel >= 1 && step % 8 === 4 && ['Hi-Hat','Snare','Tabla-Na'].includes(track.name)) active = Math.random() < 0.3;
          if (!active) return;
          try { track.play(t0, offCtx); } catch(e) {}
        });
      }
    }
    const buf = await offCtx.startRendering();
    // Fade out last 3s
    const fs = Math.floor((TARGET - 3) * audioCtx.sampleRate);
    const fe = Math.floor(TARGET * audioCtx.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = fs; i < Math.min(fe, d.length); i++) d[i] *= 1 - (i - fs) / (fe - fs);
    }
    const wav = encodeWav(buf);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `BeatForge-${currentGenreKey || 'beat'}-${durationMins2.toFixed(1)}min.wav`;
    a.click(); URL.revokeObjectURL(url);
    setStatus('saved', `⬇️ ${durationMins2.toFixed(1)}-minute WAV downloaded!`);
  }
});

function encodeWav(buf) {
  const nc = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length * nc * 2;
  const ab = new ArrayBuffer(44 + len), v = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + len, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * nc * 2, true); v.setUint16(32, nc * 2, true); v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, len, true);
  let off = 44;
  for (let i = 0; i < buf.length; i++) for (let c = 0; c < nc; c++) {
    const s = Math.max(-1, Math.min(1, buf.getChannelData(c)[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
  }
  return ab;
}

function setStatus(type, text) {
  const dot = document.getElementById('statusDot'), txt = document.getElementById('statusText');
  if (dot) dot.className = 'status-dot' + (type ? ' ' + type : '');
  if (txt) txt.textContent = text;
}

// Init
initDarkMode();
renderGrid('western');
renderGallery();
loadFromURL();
setStatus('', 'Ready — pick Regional Styles, then hit ⬇️ WAV to choose output duration!');