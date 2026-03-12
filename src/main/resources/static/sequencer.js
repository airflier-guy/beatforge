// ── BeatForge v5 — Genre × Mood System + Realistic Synthesis ──

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ─────────────────────────────────────────
// REALISTIC SOUND ENGINE
// ─────────────────────────────────────────

function noise(dur, gainVal, filterFreq, filterType, t0, ac) {
  try {
    const ctx = ac || audioCtx;
    const bufSize = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = filterType || 'bandpass';
    flt.frequency.value = filterFreq || 1000;
    flt.Q.value = 1.5;
    const g = ctx.createGain();
    src.connect(flt); flt.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(gainVal, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.start(t0); src.stop(t0 + dur);
  } catch(e) {}
}

function playKick(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(160, t0);
    o.frequency.exponentialRampToValueAtTime(40, t0 + 0.07);
    g.gain.setValueAtTime(1.0, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    o.start(t0); o.stop(t0 + 0.5);
    noise(0.012, 0.5, 2800, 'bandpass', t0, ctx);
  } catch(e) {}
}

function playSnare(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t0);
    o.frequency.exponentialRampToValueAtTime(100, t0 + 0.14);
    g.gain.setValueAtTime(0.5, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    o.start(t0); o.stop(t0 + 0.2);
    noise(0.2, 0.65, 3000, 'highpass', t0, ctx);
  } catch(e) {}
}

function playHihat(t0, open, ac) {
  const ctx = ac || audioCtx;
  noise(open ? 0.35 : 0.055, 0.3, 9000, 'highpass', t0, ctx);
}

function play808(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i*2)/256-1; curve[i] = (Math.PI+200)*x/(Math.PI+200*Math.abs(x)); }
    ws.curve = curve;
    o.connect(ws); ws.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(55, t0);
    o.frequency.exponentialRampToValueAtTime(28, t0 + 0.9);
    g.gain.setValueAtTime(0.9, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.0);
    o.start(t0); o.stop(t0 + 1.0);
  } catch(e) {}
}

function playSynth(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth'; o.frequency.value = 440;
    flt.type = 'lowpass'; flt.frequency.setValueAtTime(2200, t0); flt.frequency.exponentialRampToValueAtTime(300, t0 + 0.3); flt.Q.value = 9;
    g.gain.setValueAtTime(0.4, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    o.start(t0); o.stop(t0 + 0.35);
  } catch(e) {}
}

function playGuitar(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    [1,2,3,4].forEach((h,i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), ws = ctx.createWaveShaper();
      const c = new Float32Array(128);
      for (let j=0;j<128;j++) { const x=(j*2)/128-1; c[j]=x*(1+60*Math.abs(x))/(1+60*Math.abs(x)*Math.abs(x)); }
      ws.curve = c;
      o.connect(ws); ws.connect(g); g.connect(ctx.destination);
      o.type = h===1?'sawtooth':'sine';
      o.frequency.setValueAtTime(196*h, t0);
      o.frequency.setValueAtTime(196*h*1.002, t0+0.01);
      const amps=[0.5,0.25,0.12,0.06];
      g.gain.setValueAtTime(amps[i], t0);
      g.gain.setValueAtTime(amps[i]*0.8, t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0+0.5);
      o.start(t0); o.stop(t0+0.5);
    });
    noise(0.025, 0.12, 400, 'lowpass', t0, ctx);
  } catch(e) {}
}

function playPiano(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    [1,2,3,4,5].forEach((h,i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 261.63*h;
      const amps=[0.6,0.3,0.15,0.08,0.04], dec=[1.2,0.9,0.7,0.5,0.35];
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(amps[i],t0+0.005);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+dec[i]);
      o.start(t0); o.stop(t0+dec[i]);
    });
    noise(0.008, 0.2, 5000, 'bandpass', t0, ctx);
  } catch(e) {}
}

function playTrumpet(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    const o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.connect(flt); flt.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(329*0.98, t0); o.frequency.linearRampToValueAtTime(329, t0+0.04);
    flt.type = 'bandpass'; flt.frequency.value = 1200; flt.Q.value = 3;
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(0.5,t0+0.04);
    g.gain.setValueAtTime(0.45,t0+0.18); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.32);
    o.start(t0); o.stop(t0+0.32);
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.connect(g2); g2.connect(ctx.destination);
    o2.type='square'; o2.frequency.value=658;
    g2.gain.setValueAtTime(0.08,t0+0.04); g2.gain.exponentialRampToValueAtTime(0.0001,t0+0.32);
    o2.start(t0); o2.stop(t0+0.32);
  } catch(e) {}
}

function playStrings(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    [1,2,3].forEach((h,i) => {
      const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
      vib.connect(vG); vG.connect(o.frequency);
      o.connect(g); g.connect(ctx.destination);
      o.type='sawtooth'; o.frequency.value=196*h;
      vib.frequency.value=5.5; vG.gain.value=4;
      vib.start(t0); vib.stop(t0+0.7);
      const amps=[0.3,0.15,0.07];
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(amps[i],t0+0.07);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+0.7);
      o.start(t0); o.stop(t0+0.7);
    });
  } catch(e) {}
}

// ── EASTERN ──

function playTabla(t0, variant, ac) {
  const ctx = ac || audioCtx;
  const cfgs = {
    na:{f:380,f2:760,dec:0.12,gain:0.7},
    ta:{f:240,f2:480,dec:0.18,gain:0.8},
    ge:{f:110,f2:220,dec:0.35,gain:0.9}
  };
  const c = cfgs[variant]||cfgs.ta;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type='sine';
    o.frequency.setValueAtTime(c.f*1.4,t0); o.frequency.exponentialRampToValueAtTime(c.f,t0+0.03);
    o.frequency.exponentialRampToValueAtTime(c.f*0.7,t0+c.dec);
    g.gain.setValueAtTime(c.gain,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+c.dec);
    o.start(t0); o.stop(t0+c.dec);
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.connect(g2); g2.connect(ctx.destination);
    o2.type='sine'; o2.frequency.setValueAtTime(c.f2,t0); o2.frequency.exponentialRampToValueAtTime(c.f2*0.6,t0+c.dec*0.6);
    g2.gain.setValueAtTime(c.gain*0.3,t0); g2.gain.exponentialRampToValueAtTime(0.0001,t0+c.dec*0.6);
    o2.start(t0); o2.stop(t0+c.dec*0.6);
    noise(0.015,0.3,1200,'bandpass',t0,ctx);
  } catch(e) {}
}

function playDhol(t0, side, ac) {
  const ctx = ac || audioCtx;
  try {
    if (side==='treble') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='triangle'; o.frequency.setValueAtTime(320,t0); o.frequency.exponentialRampToValueAtTime(180,t0+0.08);
      g.gain.setValueAtTime(0.7,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);
      o.start(t0); o.stop(t0+0.12);
      noise(0.06,0.35,3000,'highpass',t0,ctx);
    } else {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine'; o.frequency.setValueAtTime(90,t0); o.frequency.exponentialRampToValueAtTime(45,t0+0.28);
      g.gain.setValueAtTime(1.0,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.42);
      o.start(t0); o.stop(t0+0.42);
      noise(0.02,0.25,200,'lowpass',t0,ctx);
    }
  } catch(e) {}
}

function playSitar(t0, ac) {
  const ctx = ac || audioCtx;
  const f = 196;
  try {
    [1,2,3,4,5].forEach((h,i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = i===0?'sawtooth':'sine';
      o.frequency.setValueAtTime(f*h*(1+i*0.002),t0);
      o.frequency.setValueAtTime(f*h*(1+i*0.002)*0.998,t0+0.01);
      const amps=[0.45,0.25,0.15,0.08,0.04],decs=[1.2,0.9,0.65,0.4,0.25];
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(amps[i],t0+0.004);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);
      o.start(t0); o.stop(t0+decs[i]);
    });
    noise(0.06,0.08,3000,'bandpass',t0,ctx);
    noise(0.005,0.2,1800,'bandpass',t0,ctx);
  } catch(e) {}
}

function playDholak(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type='sine'; o.frequency.setValueAtTime(160,t0); o.frequency.exponentialRampToValueAtTime(75,t0+0.15);
    g.gain.setValueAtTime(0.8,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.22);
    o.start(t0); o.stop(t0+0.22);
    noise(0.04,0.2,500,'bandpass',t0,ctx);
  } catch(e) {}
}

function playBansuri(t0, ac) {
  const ctx = ac || audioCtx;
  const f = 523;
  try {
    const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
    vib.connect(vG); vG.connect(o.frequency);
    o.connect(g); g.connect(ctx.destination);
    o.type='sine'; o.frequency.setValueAtTime(f,t0); o.frequency.linearRampToValueAtTime(f*1.005,t0+0.08);
    vib.frequency.value=5; vG.gain.setValueAtTime(0,t0+0.1); vG.gain.linearRampToValueAtTime(5,t0+0.2);
    vib.start(t0); vib.stop(t0+0.55);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(0.5,t0+0.04);
    g.gain.setValueAtTime(0.45,t0+0.35); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);
    o.start(t0); o.stop(t0+0.55);
    const bufSize = Math.ceil(ctx.sampleRate*0.5);
    const buf = ctx.createBuffer(1,bufSize,ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0;i<bufSize;i++) d[i]=(Math.random()*2-1)*0.15;
    const ns = ctx.createBufferSource(); ns.buffer=buf;
    const flt = ctx.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=f; flt.Q.value=20;
    const ng = ctx.createGain();
    ns.connect(flt); flt.connect(ng); ng.connect(ctx.destination);
    ng.gain.setValueAtTime(0,t0); ng.gain.linearRampToValueAtTime(0.12,t0+0.04);
    ng.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);
    ns.start(t0); ns.stop(t0+0.5);
  } catch(e) {}
}

function playMridangam(t0, side, ac) {
  const ctx = ac || audioCtx;
  try {
    if (side==='thoppi') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine'; o.frequency.setValueAtTime(130,t0); o.frequency.exponentialRampToValueAtTime(60,t0+0.2);
      g.gain.setValueAtTime(0.85,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.28);
      o.start(t0); o.stop(t0+0.28);
      noise(0.015,0.2,300,'lowpass',t0,ctx);
    } else {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine'; o.frequency.setValueAtTime(440,t0); o.frequency.exponentialRampToValueAtTime(300,t0+0.08);
      g.gain.setValueAtTime(0.7,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);
      o.start(t0); o.stop(t0+0.12);
      noise(0.012,0.4,4000,'highpass',t0,ctx);
    }
  } catch(e) {}
}

function playSarangi(t0, ac) {
  const ctx = ac || audioCtx;
  try {
    [1,2,3,4].forEach((h,i) => {
      const o = ctx.createOscillator(), vib = ctx.createOscillator(), vG = ctx.createGain(), g = ctx.createGain();
      vib.connect(vG); vG.connect(o.frequency);
      o.connect(g); g.connect(ctx.destination);
      o.type='sawtooth'; o.frequency.value=261*h;
      vib.frequency.value=6; vG.gain.value=3;
      vib.start(t0); vib.stop(t0+0.55);
      const amps=[0.3,0.2,0.12,0.06];
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(amps[i],t0+0.05);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);
      o.start(t0); o.stop(t0+0.55);
    });
  } catch(e) {}
}

function playTanpura(t0, ac) {
  const ctx = ac || audioCtx;
  const freqs = [130,195,261,261];
  freqs.forEach((f,i) => {
    const delay = i*0.07;
    try {
      [1,2,3].forEach((h,hi) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sine'; o.frequency.value=f*h;
        const amps=[0.3,0.12,0.06];
        g.gain.setValueAtTime(amps[hi],t0+delay);
        g.gain.exponentialRampToValueAtTime(0.0001,t0+delay+1.8);
        o.start(t0+delay); o.stop(t0+delay+1.8);
      });
      noise(0.05,0.06,f*4,'bandpass',t0+delay,ctx);
    } catch(e) {}
  });
}

// ── TRACK DEFINITIONS ──
const TRACKS = [
  {name:'Kick',      color:'#e8521a', world:'western', label:'Kick',      play:(t,ac)=>playKick(t,ac)},
  {name:'Snare',     color:'#f59e0b', world:'western', label:'Snare',     play:(t,ac)=>playSnare(t,ac)},
  {name:'Hi-Hat',    color:'#10b981', world:'western', label:'Hi-Hat',    play:(t,ac)=>playHihat(t,false,ac)},
  {name:'Open-Hat',  color:'#059669', world:'western', label:'Open Hat',  play:(t,ac)=>playHihat(t,true,ac)},
  {name:'808 Bass',  color:'#6366f1', world:'western', label:'808 Bass',  play:(t,ac)=>play808(t,ac)},
  {name:'Guitar',    color:'#dc2626', world:'western', label:'E.Guitar',  play:(t,ac)=>playGuitar(t,ac)},
  {name:'Piano',     color:'#0ea5e9', world:'western', label:'Piano',     play:(t,ac)=>playPiano(t,ac)},
  {name:'Trumpet',   color:'#d97706', world:'western', label:'Trumpet',   play:(t,ac)=>playTrumpet(t,ac)},
  {name:'Strings',   color:'#7c3aed', world:'western', label:'Strings',   play:(t,ac)=>playStrings(t,ac)},
  {name:'Synth',     color:'#ec4899', world:'western', label:'Synth',     play:(t,ac)=>playSynth(t,ac)},
  {name:'Tabla-Na',  color:'#f97316', world:'eastern', label:'Tabla(Na)', play:(t,ac)=>playTabla(t,'na',ac)},
  {name:'Tabla-Ge',  color:'#ea580c', world:'eastern', label:'Tabla(Ge)', play:(t,ac)=>playTabla(t,'ge',ac)},
  {name:'Dhol',      color:'#ef4444', world:'eastern', label:'Dhol Bass', play:(t,ac)=>playDhol(t,'bass',ac)},
  {name:'Dhol-Hi',   color:'#f87171', world:'eastern', label:'Dhol High', play:(t,ac)=>playDhol(t,'treble',ac)},
  {name:'Dholak',    color:'#14b8a6', world:'eastern', label:'Dholak',    play:(t,ac)=>playDholak(t,ac)},
  {name:'Sitar',     color:'#a855f7', world:'eastern', label:'Sitar',     play:(t,ac)=>playSitar(t,ac)},
  {name:'Bansuri',   color:'#22d3ee', world:'eastern', label:'Bansuri',   play:(t,ac)=>playBansuri(t,ac)},
  {name:'Mridangam', color:'#84cc16', world:'eastern', label:'Mridag.R',  play:(t,ac)=>playMridangam(t,'valanthalai',ac)},
  {name:'Mridangam-B',color:'#65a30d',world:'eastern', label:'Mridag.L', play:(t,ac)=>playMridangam(t,'thoppi',ac)},
  {name:'Sarangi',   color:'#f472b6', world:'eastern', label:'Sarangi',   play:(t,ac)=>playSarangi(t,ac)},
  {name:'Tanpura',   color:'#818cf8', world:'eastern', label:'Tanpura',   play:(t,ac)=>playTanpura(t,ac)},
];

function emptyGrid() {
  const g={}; TRACKS.forEach(t=>g[t.name]=Array(16).fill(false)); return g;
}

// ── GENRE × MOOD DEFINITIONS ──
// Each genre has a base pattern + mood variations that tweak density/BPM
const GENRE_MOODS = {
  rock: {
    name:'Rock', icon:'🤘', world:'western', desc:'Heavy drums, distorted guitar, powerful bass',
    moods: {
      angry: {
        emoji:'😡', name:'Angry Rock', desc:'Maximum aggression — dense kick, snare on every beat, overdriven', bpm:155,
        tweak: g => { g['Kick']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]; g['Snare']=[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]; g['Hi-Hat']=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]; g['Guitar']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]; g['808 Bass']=[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]; }
      },
      excited: {
        emoji:'🤩', name:'Excited Rock', desc:'Energetic and fun — faster tempo, driving rhythm', bpm:140,
        tweak: g => { g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1]; g['Open-Hat']=[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]; g['Guitar']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]; g['808 Bass']=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0]; }
      }
    }
  },
  jazz: {
    name:'Jazz', icon:'🎷', world:'western', desc:'Swinging rhythms, trumpet melody, brushed snare',
    moods: {
      calm: {
        emoji:'😌', name:'Calm Jazz', desc:'Sparse swing, soft brushes, late night lounge feel', bpm:80,
        tweak: g => { g['Hi-Hat']=[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Kick']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['808 Bass']=[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0]; g['Piano']=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0]; g['Trumpet']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]; }
      },
      romantic: {
        emoji:'❤️', name:'Romantic Jazz', desc:'Warm ballad, piano lead, strings swell, gentle brushes', bpm:72,
        tweak: g => { g['Hi-Hat']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]; g['Snare']=[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; g['Kick']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Piano']=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1]; g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Trumpet']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; }
      },
      melancholic: {
        emoji:'🌧️', name:'Melancholic Jazz', desc:'Slow minor swing, brooding trumpet, sparse piano', bpm:65,
        tweak: g => { g['Hi-Hat']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]; g['Snare']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]; g['Kick']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; g['808 Bass']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Piano']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Trumpet']=[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; }
      }
    }
  },
  hiphop: {
    name:'Hip-Hop', icon:'🎤', world:'western', desc:'Booming 808, crisp snare, sampled hi-hats',
    moods: {
      angry: {
        emoji:'😡', name:'Angry Hip-Hop', desc:'Trap-style — rattling hi-hats, punching 808, hard snare', bpm:140,
        tweak: g => { g['Kick']=[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1]; g['Hi-Hat']=[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0]; g['808 Bass']=[1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0]; }
      },
      happy: {
        emoji:'😊', name:'Happy Hip-Hop', desc:'Bouncy old-school feel, funky piano, uplifting', bpm:95,
        tweak: g => { g['Kick']=[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]; g['808 Bass']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]; g['Piano']=[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0]; }
      },
      excited: {
        emoji:'🤩', name:'Excited Hip-Hop', desc:'High energy — fast hi-hats, layered 808, synth stabs', bpm:110,
        tweak: g => { g['Kick']=[1,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0]; g['Hi-Hat']=[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]; g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Synth']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]; }
      }
    }
  },
  edm: {
    name:'EDM', icon:'🎛️', world:'western', desc:'Four-on-the-floor kick, synth lead, arpeggios',
    moods: {
      happy: {
        emoji:'😊', name:'Happy EDM', desc:'Uplifting melodic house — bright synth, steady groove', bpm:124,
        tweak: g => { g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Hi-Hat']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]; g['Synth']=[1,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0]; g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['808 Bass']=[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0]; }
      },
      excited: {
        emoji:'🤩', name:'Excited EDM', desc:'Peak hour — massive drop, layered synths, relentless kick', bpm:135,
        tweak: g => { g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Snare']=[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1]; g['Hi-Hat']=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]; g['Open-Hat']=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]; g['Synth']=[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0]; g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; }
      },
      festive: {
        emoji:'🎉', name:'Festival EDM', desc:'Anthem drops, crowd-pleasing strings swell, euphoric build', bpm:128,
        tweak: g => { g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1]; g['Synth']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]; g['Strings']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; g['808 Bass']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]; g['Trumpet']=[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; }
      }
    }
  },
  bollywood: {
    name:'Bollywood', icon:'🎬', world:'eastern', desc:'Filmi beats, Tabla groove, Sitar melody',
    moods: {
      happy: {
        emoji:'😊', name:'Happy Bollywood', desc:'Classic dance number — fast Tabla, Sitar hook, Dholak rhythm', bpm:118,
        tweak: g => { g['Tabla-Na']=[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1]; g['Tabla-Ge']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]; g['Dholak']=[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1]; g['Sitar']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]; g['Bansuri']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; }
      },
      festive: {
        emoji:'🎉', name:'Festive Bollywood', desc:'Shaadi vibes — Dhol, Tabla together, high energy', bpm:130,
        tweak: g => { g['Tabla-Na']=[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0]; g['Tabla-Ge']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Dhol']=[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]; g['Dhol-Hi']=[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0]; g['Dholak']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]; g['Sitar']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; }
      },
      romantic: {
        emoji:'❤️', name:'Romantic Bollywood', desc:'Slow love ballad — Sitar, Sarangi, soft Tabla', bpm:80,
        tweak: g => { g['Tabla-Na']=[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0]; g['Tabla-Ge']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Sitar']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0]; g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Strings']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; g['Bansuri']=[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; }
      }
    }
  },
  hindustani: {
    name:'Hindustani', icon:'🪔', world:'eastern', desc:'Raga-inspired, slow Tabla taal, Tanpura drone',
    moods: {
      calm: {
        emoji:'😌', name:'Calm Hindustani', desc:'Vilambit laya — slow peaceful Tabla, steady Tanpura drone', bpm:55,
        tweak: g => { g['Tabla-Na']=[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0]; g['Tabla-Ge']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Sitar']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; g['Sarangi']=[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; }
      },
      melancholic: {
        emoji:'🌧️', name:'Melancholic Hindustani', desc:'Evening raga — Bhairavi-style, longing Sarangi, sparse Tabla', bpm:50,
        tweak: g => { g['Tabla-Na']=[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]; g['Tabla-Ge']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; }
      },
      romantic: {
        emoji:'❤️', name:'Romantic Hindustani', desc:'Yaman raga mood — Sitar, Tanpura, gentle Tabla', bpm:65,
        tweak: g => { g['Tabla-Na']=[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0]; g['Tabla-Ge']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Sitar']=[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]; g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]; }
      }
    }
  },
  carnatic: {
    name:'Carnatic', icon:'🌺', world:'eastern', desc:'South Indian Mridangam, fast Bansuri phrases',
    moods: {
      excited: {
        emoji:'🤩', name:'Excited Carnatic', desc:'Madhyama kala — medium fast, energetic Mridangam', bpm:125,
        tweak: g => { g['Mridangam']=[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]; g['Mridangam-B']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Bansuri']=[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1]; g['Sarangi']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
      },
      happy: {
        emoji:'😊', name:'Happy Carnatic', desc:'Chapu talam — cheerful, syncopated Mridangam patterns', bpm:112,
        tweak: g => { g['Mridangam']=[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0]; g['Mridangam-B']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Bansuri']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]; g['Sarangi']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; }
      },
      festive: {
        emoji:'🎉', name:'Festive Carnatic', desc:'Tisra nadai — triplet feel, temple festival energy', bpm:140,
        tweak: g => { g['Mridangam']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]; g['Mridangam-B']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]; g['Bansuri']=[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]; g['Dholak']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
      }
    }
  },
  sufi: {
    name:'Sufi/Folk', icon:'🌙', world:'eastern', desc:'Meditative Dhol, soulful Sarangi, Bansuri call',
    moods: {
      sad: {
        emoji:'😢', name:'Sad Sufi', desc:'Slow devotional — Bansuri lament, Sarangi weeps, sparse Dhol', bpm:60,
        tweak: g => { g['Dhol']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Bansuri']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
      },
      calm: {
        emoji:'😌', name:'Calm Sufi', desc:'Meditative qawwali pulse — steady Dholak, Bansuri breathing', bpm:72,
        tweak: g => { g['Dhol']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0]; g['Dhol-Hi']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]; g['Dholak']=[1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0]; g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0]; g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
      },
      melancholic: {
        emoji:'🌧️', name:'Melancholic Sufi', desc:'Night-time kafi — longing Sarangi, echo Bansuri, Tanpura drone', bpm:55,
        tweak: g => { g['Dhol']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]; g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Sarangi']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]; g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]; g['Dholak']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]; }
      }
    }
  }
};

// ── STATE ──
const STEPS = 16;
let bpm = 120;
let isPlaying = false;
let currentStep = 0;
let intervalId = null;
let grid = emptyGrid();
let currentGenreKey = null;
let currentMoodKey = null;
let currentWorld = 'western';
let savedPatterns = [];
let activeMoodFilter = 'all';
let pendingGenre = null;
let pendingMoodSelected = null;
try { savedPatterns = JSON.parse(localStorage.getItem('bf5_patterns') || '[]'); } catch(e) {}

// ── Mood Filter ──
function filterByMood(mood, btn) {
  activeMoodFilter = mood;
  document.querySelectorAll('.mood-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.genre-card').forEach(card => {
    const moods = card.dataset.moods || '';
    if (mood === 'all' || moods.split(',').includes(mood)) {
      card.classList.remove('dimmed');
    } else {
      card.classList.add('dimmed');
    }
  });
}

function switchWorld(world, btn) {
  document.querySelectorAll('.genre-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('westernGenres').style.display = world === 'western' ? 'grid' : 'none';
  document.getElementById('easternGenres').style.display = world === 'eastern' ? 'grid' : 'none';
}

// ── Open Mood Picker Modal ──
function openGenreMoodPicker(genreKey) {
  const genre = GENRE_MOODS[genreKey];
  if (!genre) return;
  pendingGenre = genreKey;
  pendingMoodSelected = null;

  document.getElementById('modalGenreIcon').textContent = genre.icon;
  document.getElementById('modalGenreName').textContent = genre.name;
  document.getElementById('modalGenreDesc').textContent = genre.desc;

  const container = document.getElementById('modalMoodOptions');
  container.innerHTML = '';

  // Pre-select mood if filter is active
  const preselect = activeMoodFilter !== 'all' && genre.moods[activeMoodFilter] ? activeMoodFilter : null;

  Object.entries(genre.moods).forEach(([moodKey, mood]) => {
    const btn = document.createElement('button');
    btn.className = 'modal-mood-btn' + (preselect === moodKey ? ' selected' : '');
    btn.innerHTML = `
      <span class="mmb-emoji">${mood.emoji}</span>
      <div class="mmb-info">
        <div class="mmb-name">${mood.name}</div>
        <div class="mmb-desc">${mood.desc}</div>
      </div>
      <span class="mmb-bpm">${mood.bpm} BPM</span>
    `;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.modal-mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      pendingMoodSelected = moodKey;
    });
    container.appendChild(btn);
  });

  if (preselect) pendingMoodSelected = preselect;

  // Load button
  const loadBtn = document.createElement('button');
  loadBtn.className = 'modal-load-btn';
  loadBtn.textContent = 'Load This Beat →';
  loadBtn.addEventListener('click', () => {
    if (!pendingMoodSelected) {
      // auto-select first
      const first = Object.keys(genre.moods)[0];
      pendingMoodSelected = first;
    }
    loadGenreMood(pendingGenre, pendingMoodSelected);
    document.getElementById('moodModal').style.display = 'none';
  });
  container.appendChild(loadBtn);

  document.getElementById('moodModal').style.display = 'flex';
}

function closeMoodModal(e) {
  if (e.target === document.getElementById('moodModal')) {
    document.getElementById('moodModal').style.display = 'none';
  }
}

// ── Load Genre + Mood ──
function loadGenreMood(genreKey, moodKey) {
  const genre = GENRE_MOODS[genreKey];
  const mood = genre.moods[moodKey];
  if (!genre || !mood) return;

  currentGenreKey = genreKey;
  currentMoodKey = moodKey;

  // Build grid from mood tweak
  grid = emptyGrid();
  mood.tweak(grid);

  document.getElementById('bpm').value = mood.bpm;
  bpm = mood.bpm;

  // Highlight genre card
  document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.genre-card[data-genre="${genreKey}"]`);
  if (card) card.classList.add('selected');

  // Show banner
  const banner = document.getElementById('genreBanner');
  document.getElementById('genreBannerIcon').textContent = genre.icon + ' ' + mood.emoji;
  document.getElementById('genreBannerName').textContent = `${mood.name} loaded — ${mood.bpm} BPM`;
  document.getElementById('genreBannerDesc').textContent = mood.desc;
  banner.style.display = 'flex';

  // Studio badge
  document.getElementById('activeGenreRow').style.display = 'flex';
  document.getElementById('activeGenreBadge').textContent = `${genre.icon} ${genre.name}`;
  document.getElementById('activeMoodBadge').textContent = `${mood.emoji} ${mood.name.split(' ')[0]}`;
  document.getElementById('activeGenreDesc').textContent = mood.desc;

  document.getElementById('patternName').placeholder = `My ${mood.name}`;

  // Switch world tab
  const w = genre.world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(w === 'western' ? 'tabWestern' : 'tabEastern').classList.add('active');
  currentWorld = w;

  renderGrid(currentWorld);
  if (isPlaying) restartPlayback();
  setStatus('', `${genre.icon}${mood.emoji} ${mood.name} loaded!`);
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}

// ── Grid Render ──
function showWorld(world) {
  currentWorld = world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
  const ids = { western: 'tabWestern', eastern: 'tabEastern', both: 'tabBoth' };
  document.getElementById(ids[world]).classList.add('active');
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
      const row = document.createElement('div'); row.className = 'track-row';
      const label = document.createElement('span'); label.className = 'track-label';
      label.textContent = track.label; label.style.borderLeft = `3px solid ${track.color}`;
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
      row.appendChild(stepsRow); section.appendChild(row);
    });
    gridEl.appendChild(section);
  });
}

// ── Playback ──
function tick() {
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.classList.toggle('current', parseInt(btn.dataset.step) === currentStep);
  });
  TRACKS.forEach(track => {
    if (grid[track.name] && grid[track.name][currentStep]) track.play(audioCtx.currentTime);
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
  document.querySelectorAll('.step-btn').forEach(b => { b.classList.remove('active','current'); b.style.background=''; });
  setStatus('', 'Grid cleared');
});
document.getElementById('bpmUp').addEventListener('click', () => { const i=document.getElementById('bpm'); i.value=Math.min(240,parseInt(i.value)+5); if(isPlaying)restartPlayback(); });
document.getElementById('bpmDown').addEventListener('click', () => { const i=document.getElementById('bpm'); i.value=Math.max(40,parseInt(i.value)-5); if(isPlaying)restartPlayback(); });
document.getElementById('bpm').addEventListener('change', () => { if(isPlaying) restartPlayback(); });

// ── Save ──
document.getElementById('saveBtn').addEventListener('click', () => {
  const genre = currentGenreKey ? GENRE_MOODS[currentGenreKey] : null;
  const mood = (genre && currentMoodKey) ? genre.moods[currentMoodKey] : null;
  const name = document.getElementById('patternName').value.trim() || (mood ? `My ${mood.name}` : 'Pattern '+(savedPatterns.length+1));
  const pattern = {
    id: Date.now(), name,
    bpm: parseInt(document.getElementById('bpm').value),
    genre: currentGenreKey, genreIcon: genre?.icon, genreName: genre?.name,
    mood: currentMoodKey, moodEmoji: mood?.emoji, moodName: mood?.name,
    grid: JSON.parse(JSON.stringify(grid)),
    createdAt: new Date().toLocaleString()
  };
  savedPatterns.unshift(pattern);
  try { localStorage.setItem('bf5_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
  document.getElementById('patternName').value = '';
  setStatus('saved', `💾 "${name}" saved!`);
});

function loadPattern(pattern) {
  document.getElementById('bpm').value = pattern.bpm; bpm = pattern.bpm;
  grid = pattern.grid || emptyGrid();
  currentGenreKey = pattern.genre || null;
  currentMoodKey = pattern.mood || null;
  renderGrid(currentWorld);
  if (isPlaying) restartPlayback();
  if (pattern.genreIcon) {
    document.getElementById('activeGenreRow').style.display = 'flex';
    document.getElementById('activeGenreBadge').textContent = `${pattern.genreIcon} ${pattern.genreName}`;
    document.getElementById('activeMoodBadge').textContent = pattern.moodEmoji ? `${pattern.moodEmoji} ${pattern.moodName?.split(' ')[0]}` : '';
    document.getElementById('activeGenreDesc').textContent = '';
  }
  setStatus('', `📂 Loaded "${pattern.name}"`);
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}
function deletePattern(id) {
  savedPatterns = savedPatterns.filter(p => p.id !== id);
  try { localStorage.setItem('bf5_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
}
function renderPatternLibrary() {
  const list = document.getElementById('patternList');
  if (!savedPatterns.length) { list.innerHTML = '<div class="no-patterns">No saved patterns yet. Pick a genre + mood and save your beat!</div>'; return; }
  list.innerHTML = savedPatterns.map(p => `
    <div class="pattern-card">
      <div class="pattern-info">
        <div class="pattern-name">${p.name}</div>
        <div class="pattern-meta">
          ${p.bpm} BPM · ${p.createdAt}
          ${p.genreIcon ? `<span class="p-tag">${p.genreIcon} ${p.genreName}</span>` : ''}
          ${p.moodEmoji ? `<span class="p-tag">${p.moodEmoji} ${p.moodName}</span>` : ''}
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

function sharePattern(id) {
  const p = savedPatterns.find(p => p.id === id); if (!p) return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(p))));
  const url = window.location.origin + window.location.pathname + '?pattern=' + encoded;
  if (navigator.clipboard) { navigator.clipboard.writeText(url).then(() => setStatus('saved', '🔗 Link copied!')); }
  else { prompt('Copy this link:', url); }
}

function loadFromURL() {
  const enc = new URLSearchParams(window.location.search).get('pattern');
  if (enc) { try { loadPattern(JSON.parse(decodeURIComponent(escape(atob(enc))))); } catch(e) {} }
}

// ── WAV Download ──
document.getElementById('downloadBtn').addEventListener('click', async () => {
  setStatus('', '⏳ Rendering audio...');
  const stepDur = 60 / bpm / 4;
  const loops = 4;
  const totalDur = STEPS * loops * stepDur + 2;
  const offCtx = new OfflineAudioContext(2, Math.ceil(audioCtx.sampleRate * totalDur), audioCtx.sampleRate);
  for (let step = 0; step < STEPS * loops; step++) {
    const si = step % STEPS, t0 = step * stepDur;
    TRACKS.forEach(track => {
      if (grid[track.name] && grid[track.name][si]) {
        try { track.play(t0, offCtx); } catch(e) {}
      }
    });
  }
  const buf = await offCtx.startRendering();
  const wav = encodeWav(buf);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `beatforge-${currentGenreKey||'beat'}-${currentMoodKey||'custom'}.wav`; a.click();
  URL.revokeObjectURL(url);
  setStatus('saved', '⬇️ WAV downloaded!');
});

function encodeWav(buf) {
  const nc=buf.numberOfChannels,sr=buf.sampleRate,len=buf.length*nc*2;
  const ab=new ArrayBuffer(44+len),v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*nc*2,true);v.setUint16(32,nc*2,true);v.setUint16(34,16,true);
  ws(36,'data');v.setUint32(40,len,true);
  let off=44;
  for(let i=0;i<buf.length;i++) for(let c=0;c<nc;c++){
    const s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));
    v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;
  }
  return ab;
}

function setStatus(type, text) {
  document.getElementById('statusDot').className = 'status-dot' + (type ? ' ' + type : '');
  document.getElementById('statusText').textContent = text;
}

// Init
renderGrid('western');
renderPatternLibrary();
loadFromURL();
setStatus('', 'Ready — filter by mood, then pick a genre to start!');