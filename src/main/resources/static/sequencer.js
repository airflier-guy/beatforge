// ── BeatForge v9 — 28 Indian States + World Music + Melodic Patterns ──

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain(); masterGain.gain.value = 0.82;
const analyser = audioCtx.createAnalyser(); analyser.fftSize = 512;
masterGain.connect(analyser); analyser.connect(audioCtx.destination);

// ── REVERB ──
function makeReverb(dur, decay) {
  const len = audioCtx.sampleRate * dur;
  const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for (let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}
  const conv = audioCtx.createConvolver(); conv.buffer = buf;
  return conv;
}
const reverb = makeReverb(1.8, 3.5);
const reverbGain = audioCtx.createGain(); reverbGain.gain.value = 0.15;
reverb.connect(reverbGain); reverbGain.connect(masterGain);

function dest(ac, wet) {
  if (ac) return ac.destination;
  return wet ? reverb : masterGain;
}

// ── NOISE GENERATOR ──
function noise(dur, g, ff, ft, t0, ac, wet) {
  const ctx = ac||audioCtx;
  try {
    const sz = Math.ceil(ctx.sampleRate*Math.max(dur,0.001));
    const buf = ctx.createBuffer(2,sz,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<sz;i++)d[i]=Math.random()*2-1;}
    const src=ctx.createBufferSource(); src.buffer=buf;
    const flt=ctx.createBiquadFilter(); flt.type=ft||'bandpass'; flt.frequency.value=ff||1000; flt.Q.value=2;
    const gn=ctx.createGain();
    src.connect(flt);flt.connect(gn);gn.connect(dest(ac,wet));
    gn.gain.setValueAtTime(g,t0); gn.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    src.start(t0); src.stop(t0+dur);
  } catch(e){}
}

// ── MELODIC NOTE PLAYER ──
// This is the core of the realistic sound system
// notes are played as timed sequences within steps
function playMelodicNote(freq, type, dur, gain, t0, ac, wet) {
  const ctx = ac||audioCtx;
  try {
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(dest(ac,wet));
    o.type=type||'sine'; o.frequency.value=freq;
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(gain||0.4, t0+0.01);
    g.gain.setValueAtTime(gain||0.4, t0+dur*0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    o.start(t0); o.stop(t0+dur);
  } catch(e){}
}

function playVibNote(freq, type, dur, gain, vibRate, vibDepth, t0, ac, wet) {
  const ctx = ac||audioCtx;
  try {
    const o=ctx.createOscillator(), vib=ctx.createOscillator(), vG=ctx.createGain(), g=ctx.createGain();
    vib.connect(vG); vG.connect(o.frequency); o.connect(g); g.connect(dest(ac,wet));
    o.type=type||'sine'; o.frequency.value=freq;
    vib.frequency.value=vibRate||5.5; vG.gain.setValueAtTime(0,t0+0.1); vG.gain.linearRampToValueAtTime(vibDepth||5, t0+0.2);
    vib.start(t0); vib.stop(t0+dur);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(gain||0.4,t0+0.05);
    g.gain.setValueAtTime(gain||0.4,t0+dur*0.75); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.start(t0); o.stop(t0+dur);
  } catch(e){}
}

// ── SCALE/RAGA SYSTEMS ──
// These define authentic melodic patterns for each region
const SCALES = {
  // Indian ragas (frequencies in Hz from C4=261.63)
  bhairav:    [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25], // morning raga
  yaman:      [261.63, 293.66, 329.63, 369.99, 415.30, 440.00, 493.88, 523.25], // evening raga
  bhairavi:   [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 440.00, 523.25], // devotional
  kafi:       [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 466.16, 523.25], // sufi
  todi:       [261.63, 277.18, 311.13, 349.23, 369.99, 415.30, 466.16, 523.25], // complex
  bilawal:    [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // natural major
  // World scales
  pentatonic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],                 // universal
  blues:      [261.63, 311.13, 349.23, 369.99, 392.00, 466.16, 523.25],         // blues
  arabic:     [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 466.16, 523.25], // hijaz
  gamelan:    [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 523.25],         // slendro-ish
  flamenco:   [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 466.16, 523.25], // phrygian dominant
  minor:      [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25], // natural minor
  dorian:     [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 466.16, 523.25], // dorian mode
  major:      [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // major
  balkan:     [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 466.16, 523.25], // augmented 2nd
  celtic:     [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],                 // pentatonic
  african:    [261.63, 293.66, 349.23, 392.00, 466.16, 523.25],                 // 6-note
};

// ── PERCUSSION INSTRUMENTS ──
function playKick(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='sine';o.frequency.setValueAtTime(175,t0);o.frequency.exponentialRampToValueAtTime(38,t0+0.08);g.gain.setValueAtTime(1.1,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);o.start(t0);o.stop(t0+0.55);noise(0.012,0.5,2800,'bandpass',t0,ac,false);}catch(e){}}
function playSnare(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='triangle';o.frequency.setValueAtTime(235,t0);o.frequency.exponentialRampToValueAtTime(95,t0+0.14);g.gain.setValueAtTime(0.55,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.22);o.start(t0);o.stop(t0+0.22);noise(0.22,0.7,4000,'highpass',t0,ac,false);}catch(e){}}
function playHihat(t0,open,ac){noise(open?0.42:0.058,open?0.22:0.3,9500,'highpass',t0,ac,false);}
function play808(t0,freq,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain(),ws=ctx.createWaveShaper();const c=new Float32Array(256);for(let i=0;i<256;i++){const x=(i*2)/256-1;c[i]=(Math.PI+180)*x/(Math.PI+180*Math.abs(x));}ws.curve=c;o.connect(ws);ws.connect(g);g.connect(dest(ac));o.type='sine';o.frequency.setValueAtTime(freq||55,t0);o.frequency.exponentialRampToValueAtTime((freq||55)*0.45,t0+1.0);g.gain.setValueAtTime(0.95,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+1.1);o.start(t0);o.stop(t0+1.1);}catch(e){}}

// Indian percussion
function playTabla(t0,v,ac){const ctx=ac||audioCtx;const C={na:{f:420,f2:840,dec:0.13,g:0.75},ge:{f:105,f2:210,dec:0.38,g:0.95},tin:{f:580,dec:0.08,g:0.6},ta:{f:260,f2:520,dec:0.20,g:0.85}};const c=C[v]||C.ta;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(c.f*1.5,t0);o.frequency.exponentialRampToValueAtTime(c.f,t0+0.025);o.frequency.exponentialRampToValueAtTime(c.f*0.65,t0+c.dec);g.gain.setValueAtTime(c.g,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+c.dec);o.start(t0);o.stop(t0+c.dec);if(c.f2){const o2=ctx.createOscillator(),g2=ctx.createGain();o2.connect(g2);g2.connect(dest(ac));o2.type='sine';o2.frequency.setValueAtTime(c.f2,t0);o2.frequency.exponentialRampToValueAtTime(c.f2*0.55,t0+c.dec*0.55);g2.gain.setValueAtTime(c.g*0.3,t0);g2.gain.exponentialRampToValueAtTime(0.0001,t0+c.dec*0.55);o2.start(t0);o2.stop(t0+c.dec*0.55);}noise(0.015,0.28,1400,'bandpass',t0,ac,false);}catch(e){}}
function playDhol(t0,side,ac){const ctx=ac||audioCtx;try{if(side==='hi'){const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='triangle';o.frequency.setValueAtTime(355,t0);o.frequency.exponentialRampToValueAtTime(195,t0+0.09);g.gain.setValueAtTime(0.75,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.13);o.start(t0);o.stop(t0+0.13);noise(0.07,0.4,3500,'highpass',t0,ac);}else{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(92,t0);o.frequency.exponentialRampToValueAtTime(40,t0+0.32);g.gain.setValueAtTime(1.05,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.48);o.start(t0);o.stop(t0+0.48);}}catch(e){}}
function playDholak(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(162,t0);o.frequency.exponentialRampToValueAtTime(72,t0+0.17);g.gain.setValueAtTime(0.85,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.25);o.start(t0);o.stop(t0+0.25);noise(0.04,0.2,480,'bandpass',t0,ac);}catch(e){}}
function playMridangam(t0,side,ac){const ctx=ac||audioCtx;try{if(side==='L'){const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(138,t0);o.frequency.exponentialRampToValueAtTime(58,t0+0.22);g.gain.setValueAtTime(0.9,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.3);o.start(t0);o.stop(t0+0.3);noise(0.016,0.22,280,'lowpass',t0,ac);}else{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='sine';o.frequency.setValueAtTime(458,t0);o.frequency.exponentialRampToValueAtTime(308,t0+0.09);g.gain.setValueAtTime(0.75,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.13);o.start(t0);o.stop(t0+0.13);noise(0.013,0.45,5000,'highpass',t0,ac);}}catch(e){}}
function playKhol(t0,side,ac){const ctx=ac||audioCtx;try{if(side==='hi'){const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='sine';o.frequency.setValueAtTime(318,t0);o.frequency.exponentialRampToValueAtTime(188,t0+0.08);g.gain.setValueAtTime(0.7,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);o.start(t0);o.stop(t0+0.12);noise(0.06,0.3,2500,'bandpass',t0,ac);}else{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(118,t0);o.frequency.exponentialRampToValueAtTime(54,t0+0.25);g.gain.setValueAtTime(0.9,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.38);o.start(t0);o.stop(t0+0.38);}}catch(e){}}
function playTungi(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(198,t0);o.frequency.exponentialRampToValueAtTime(83,t0+0.14);g.gain.setValueAtTime(0.85,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.2);o.start(t0);o.stop(t0+0.2);noise(0.04,0.3,800,'bandpass',t0,ac);}catch(e){}}
function playNagara(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(78,t0);o.frequency.exponentialRampToValueAtTime(33,t0+0.5);g.gain.setValueAtTime(1.0,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.7);o.start(t0);o.stop(t0+0.7);noise(0.03,0.3,150,'lowpass',t0,ac);}catch(e){}}
function playKanjira(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='sine';o.frequency.setValueAtTime(498,t0);o.frequency.exponentialRampToValueAtTime(248,t0+0.06);g.gain.setValueAtTime(0.65,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.1);o.start(t0);o.stop(t0+0.1);noise(0.12,0.4,7000,'highpass',t0,ac);}catch(e){}}
function playDumru(t0,ac){const ctx=ac||audioCtx;try{[220,440].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='triangle';o.frequency.setValueAtTime(f,t0+i*0.05);g.gain.setValueAtTime(0.5,t0+i*0.05);g.gain.exponentialRampToValueAtTime(0.0001,t0+i*0.05+0.1);o.start(t0+i*0.05);o.stop(t0+i*0.05+0.1);});}catch(e){}}
function playClapSt(t0,ac){noise(0.08,0.5,1200,'bandpass',t0,ac);noise(0.05,0.3,3000,'highpass',t0,ac);}
function playCongas(t0,high,ac){const ctx=ac||audioCtx;try{const f=high?280:180;const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(f,t0);o.frequency.exponentialRampToValueAtTime(f*0.55,t0+0.18);g.gain.setValueAtTime(0.7,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.25);o.start(t0);o.stop(t0+0.25);}catch(e){}}
function playDjembe(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(200,t0);o.frequency.exponentialRampToValueAtTime(85,t0+0.15);g.gain.setValueAtTime(0.95,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.28);o.start(t0);o.stop(t0+0.28);noise(0.05,0.35,600,'bandpass',t0,ac);}catch(e){}}
function playDarabouka(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac));o.type='sine';o.frequency.setValueAtTime(320,t0);o.frequency.exponentialRampToValueAtTime(140,t0+0.09);g.gain.setValueAtTime(0.8,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.15);o.start(t0);o.stop(t0+0.15);noise(0.04,0.3,2000,'bandpass',t0,ac);}catch(e){}}
function playCajon(t0,bass,ac){const ctx=ac||audioCtx;try{const f=bass?80:280;const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,!bass));o.type='sine';o.frequency.setValueAtTime(f*1.5,t0);o.frequency.exponentialRampToValueAtTime(f,t0+(bass?0.1:0.04));g.gain.setValueAtTime(0.9,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+(bass?0.45:0.12));o.start(t0);o.stop(t0+(bass?0.45:0.12));if(!bass)noise(0.08,0.4,3500,'highpass',t0,ac);}catch(e){}}
function playTaiko(t0,ac){const ctx=ac||audioCtx;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(95,t0);o.frequency.exponentialRampToValueAtTime(42,t0+0.35);g.gain.setValueAtTime(1.1,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.6);o.start(t0);o.stop(t0+0.6);noise(0.02,0.25,200,'lowpass',t0,ac);}catch(e){}}

// ── MELODIC INSTRUMENTS ──
function playSitar(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||196;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type=i===0?'sawtooth':'sine';o.frequency.setValueAtTime(f*h*(1+i*0.0025),t0);o.frequency.setValueAtTime(f*h*(1+i*0.0025)*0.997,t0+0.012);const amps=[0.48,0.26,0.15,0.08,0.04],decs=[1.4,1.0,0.7,0.45,0.28];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.006,0.22,2000,'bandpass',t0,ac);}catch(e){}}
function playBansuri(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||523;try{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(f*0.995,t0);o.frequency.linearRampToValueAtTime(f*1.006,t0+0.1);vib.frequency.value=5.5;vG.gain.setValueAtTime(0,t0+0.12);vG.gain.linearRampToValueAtTime(6,t0+0.25);vib.start(t0);vib.stop(t0+0.65);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.52,t0+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.65);o.start(t0);o.stop(t0+0.65);noise(0.65,0.1,f,'bandpass',t0,ac);}catch(e){}}
function playSarangi(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.value=f*h;vib.frequency.value=6.5;vG.gain.value=4;vib.start(t0);vib.stop(t0+0.65);const amps=[0.32,0.2,0.12,0.06];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.06);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.65);o.start(t0);o.stop(t0+0.65);});}catch(e){}}
function playTanpura(t0,ac){const ctx=ac||audioCtx;const freqs=[130,195,261,261];freqs.forEach((f,i)=>{const delay=i*0.08;try{[1,2,3].forEach((h,hi)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.value=f*h;const amps=[0.32,0.12,0.06];g.gain.setValueAtTime(amps[hi],t0+delay);g.gain.exponentialRampToValueAtTime(0.0001,t0+delay+2.2);o.start(t0+delay);o.stop(t0+delay+2.2);});noise(0.05,0.05,f*5,'bandpass',t0+delay,ac,true);}catch(e){}});}
function playVeena(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||220;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type=i===0?'sawtooth':'triangle';o.frequency.setValueAtTime(f*h,t0);o.frequency.linearRampToValueAtTime(f*h*1.003,t0+0.02);const amps=[0.5,0.28,0.15,0.08,0.04],decs=[1.0,0.75,0.52,0.33,0.18];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.005,0.18,2200,'bandpass',t0,ac);}catch(e){}}
function playShehnai(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||370;try{const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.connect(flt);flt.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.setValueAtTime(f*0.99,t0);o.frequency.linearRampToValueAtTime(f,t0+0.06);flt.type='bandpass';flt.frequency.value=1300;flt.Q.value=5;const vib=ctx.createOscillator(),vG=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);vib.frequency.value=5.8;vG.gain.setValueAtTime(0,t0+0.1);vG.gain.linearRampToValueAtTime(7,t0+0.22);vib.start(t0);vib.stop(t0+0.6);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.55,t0+0.06);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.6);o.start(t0);o.stop(t0+0.6);}catch(e){}}
function playHarmonium(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type=h<=2?'square':'sawtooth';o.frequency.value=f*h;const amps=[0.4,0.25,0.15,0.08,0.04];g.gain.setValueAtTime(amps[i],t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);o.start(t0);o.stop(t0+0.5);});}catch(e){}}
function playEsraj(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||293;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.value=f*h;vib.frequency.value=5.8;vG.gain.setValueAtTime(0,t0+0.2);vG.gain.linearRampToValueAtTime(5,t0+0.35);vib.start(t0);vib.stop(t0+0.75);const amps=[0.35,0.2,0.1,0.05];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.08);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.75);o.start(t0);o.stop(t0+0.75);});}catch(e){}}
function playNadhaswaram(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||277;try{const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.connect(flt);flt.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.setValueAtTime(f*0.98,t0);o.frequency.linearRampToValueAtTime(f,t0+0.04);flt.type='bandpass';flt.frequency.value=1100;flt.Q.value=6;const vib=ctx.createOscillator(),vG=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);vib.frequency.value=6;vG.gain.setValueAtTime(0,t0+0.1);vG.gain.linearRampToValueAtTime(8,t0+0.2);vib.start(t0);vib.stop(t0+0.55);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.58,t0+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);o.start(t0);o.stop(t0+0.55);}catch(e){}}
function playMahuri(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||370;try{const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.connect(flt);flt.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.value=f;flt.type='bandpass';flt.frequency.value=1100;flt.Q.value=5;const vib=ctx.createOscillator(),vG=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);vib.frequency.value=5.5;vG.gain.value=7;vib.start(t0);vib.stop(t0+0.5);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.5,t0+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);o.start(t0);o.stop(t0+0.5);}catch(e){}}
// World melodic instruments
function playKora(t0,freq,ac){// West African harp-lute
  const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='triangle';o.frequency.setValueAtTime(f*h,t0);const amps=[0.45,0.25,0.12],decs=[0.9,0.65,0.4];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.004,0.15,2000,'bandpass',t0,ac);}catch(e){}}
function playOud(t0,freq,ac){// Middle Eastern lute
  const ctx=ac||audioCtx;const f=freq||196;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type=i===0?'sawtooth':'sine';o.frequency.setValueAtTime(f*h,t0);o.frequency.linearRampToValueAtTime(f*h*0.998,t0+0.02);const amps=[0.5,0.28,0.15,0.07],decs=[1.1,0.8,0.55,0.35];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.005,0.18,1800,'bandpass',t0,ac);}catch(e){}}
function playErhu(t0,freq,ac){// Chinese bowed string
  const ctx=ac||audioCtx;const f=freq||329;try{[1,2,3].forEach((h,i)=>{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.value=f*h;vib.frequency.value=7;vG.gain.setValueAtTime(0,t0+0.08);vG.gain.linearRampToValueAtTime(6,t0+0.2);vib.start(t0);vib.stop(t0+0.7);const amps=[0.38,0.2,0.09];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.06);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.7);o.start(t0);o.stop(t0+0.7);});}catch(e){}}
function playKoto(t0,freq,ac){// Japanese zither
  const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='triangle';o.frequency.setValueAtTime(f*h,t0);o.frequency.exponentialRampToValueAtTime(f*h*0.995,t0+0.3);const amps=[0.5,0.28,0.14,0.07],decs=[1.2,0.9,0.62,0.38];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.004,0.12,3000,'bandpass',t0,ac);}catch(e){}}
function playAccordion(t0,freq,ac){// European folk
  const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='square';o.frequency.value=f*h*(1+i*0.002);const amps=[0.35,0.22,0.12,0.06];g.gain.setValueAtTime(amps[i],t0);g.gain.setValueAtTime(amps[i]*0.9,t0+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);o.start(t0);o.stop(t0+0.5);});}catch(e){}}
function playViolin(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||440;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.value=f*h;vib.frequency.value=6.2;vG.gain.setValueAtTime(0,t0+0.1);vG.gain.linearRampToValueAtTime(5,t0+0.22);vib.start(t0);vib.stop(t0+0.7);const amps=[0.35,0.2,0.1,0.05];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.7);o.start(t0);o.stop(t0+0.7);});}catch(e){}}
function playBagpipe(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||233;try{// Drone
  const od=ctx.createOscillator(),gd=ctx.createGain();od.connect(gd);gd.connect(dest(ac,true));od.type='sawtooth';od.frequency.value=f*0.5;gd.gain.setValueAtTime(0.2,t0);gd.gain.exponentialRampToValueAtTime(0.0001,t0+0.6);od.start(t0);od.stop(t0+0.6);
  // Chanter
  const oc=ctx.createOscillator(),flt=ctx.createBiquadFilter(),gc=ctx.createGain();oc.connect(flt);flt.connect(gc);gc.connect(dest(ac,true));oc.type='sawtooth';oc.frequency.value=f;flt.type='bandpass';flt.frequency.value=900;flt.Q.value=4;gc.gain.setValueAtTime(0,t0);gc.gain.linearRampToValueAtTime(0.45,t0+0.04);gc.gain.exponentialRampToValueAtTime(0.0001,t0+0.6);oc.start(t0);oc.stop(t0+0.6);}catch(e){}}
function playMarimba(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.value=f*h*(h===2?1.02:1);const amps=[0.6,0.2,0.08],decs=[0.6,0.35,0.2];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.005,0.1,4000,'bandpass',t0,ac);}catch(e){}}
function playPanFlute(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||523;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.setValueAtTime(f,t0);const sz=Math.ceil(ctx.sampleRate*0.5);const buf=ctx.createBuffer(1,sz,ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=(Math.random()*2-1)*0.1;const ns=ctx.createBufferSource();ns.buffer=buf;const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=f*2;flt.Q.value=15;const ng=ctx.createGain();ns.connect(flt);flt.connect(ng);ng.connect(dest(ac,true));ng.gain.setValueAtTime(0.14,t0);ng.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);ns.start(t0);ns.stop(t0+0.5);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.5,t0+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);o.start(t0);o.stop(t0+0.55);}catch(e){}}
function playGuitarAc(t0,freq,ac){// Acoustic guitar
  const ctx=ac||audioCtx;const f=freq||196;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type=i===0?'triangle':'sine';o.frequency.setValueAtTime(f*h,t0);const amps=[0.55,0.3,0.15,0.08,0.04],decs=[0.8,0.6,0.4,0.25,0.15];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.003,0.1,400,'lowpass',t0,ac);}catch(e){}}
function playTrumpet(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||329;try{const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.connect(flt);flt.connect(g);g.connect(dest(ac,true));o.type='sawtooth';o.frequency.setValueAtTime(f*0.97,t0);o.frequency.linearRampToValueAtTime(f,t0+0.05);flt.type='bandpass';flt.frequency.value=1400;flt.Q.value=4;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.55,t0+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.38);o.start(t0);o.stop(t0+0.38);}catch(e){}}
function playPiano(t0,freq,ac){const ctx=ac||audioCtx;const f=freq||261;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest(ac,true));o.type='sine';o.frequency.value=f*h;const amps=[0.65,0.32,0.15,0.08,0.04],dec=[1.2,0.9,0.7,0.5,0.35];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t0+dec[i]);o.start(t0);o.stop(t0+dec[i]);});}catch(e){}}

// ── MELODIC PATTERN RENDERER ──
// Plays a sequence of scale notes over steps
function playMelodicPattern(scale, pattern, stepDur, t0, instrFn, ac) {
  pattern.forEach((noteIdx, step) => {
    if (noteIdx < 0) return; // -1 = rest
    const freq = scale[noteIdx % scale.length];
    const noteDur = stepDur * 0.85;
    instrFn(t0 + step * stepDur, freq, ac);
  });
}

// ── TRACK DEFINITIONS ──
const TRACKS = [
  {name:'Kick',     color:'#e8521a',world:'western',label:'Kick',       play:(t,ac)=>playKick(t,ac)},
  {name:'Snare',    color:'#f59e0b',world:'western',label:'Snare',      play:(t,ac)=>playSnare(t,ac)},
  {name:'Hi-Hat',   color:'#10b981',world:'western',label:'Hi-Hat',     play:(t,ac)=>playHihat(t,false,ac)},
  {name:'Open-Hat', color:'#059669',world:'western',label:'Open Hat',   play:(t,ac)=>playHihat(t,true,ac)},
  {name:'808 Bass', color:'#6366f1',world:'western',label:'808 Bass',   play:(t,ac)=>play808(t,55,ac)},
  {name:'Piano',    color:'#0ea5e9',world:'western',label:'Piano',      play:(t,ac)=>playPiano(t,261,ac)},
  {name:'Trumpet',  color:'#d97706',world:'western',label:'Trumpet',    play:(t,ac)=>playTrumpet(t,329,ac)},
  {name:'Violin',   color:'#7c3aed',world:'western',label:'Violin',     play:(t,ac)=>playViolin(t,440,ac)},
  {name:'Guitar',   color:'#dc2626',world:'western',label:'Ac.Guitar',  play:(t,ac)=>playGuitarAc(t,196,ac)},
  {name:'Marimba',  color:'#0891b2',world:'western',label:'Marimba',    play:(t,ac)=>playMarimba(t,261,ac)},
  {name:'Tabla-Na', color:'#f97316',world:'eastern',label:'Tabla(Na)',  play:(t,ac)=>playTabla(t,'na',ac)},
  {name:'Tabla-Ge', color:'#ea580c',world:'eastern',label:'Tabla(Ge)',  play:(t,ac)=>playTabla(t,'ge',ac)},
  {name:'Dhol',     color:'#ef4444',world:'eastern',label:'Dhol Bass',  play:(t,ac)=>playDhol(t,'bass',ac)},
  {name:'Dhol-Hi',  color:'#f87171',world:'eastern',label:'Dhol High',  play:(t,ac)=>playDhol(t,'hi',ac)},
  {name:'Dholak',   color:'#14b8a6',world:'eastern',label:'Dholak',     play:(t,ac)=>playDholak(t,ac)},
  {name:'Sitar',    color:'#a855f7',world:'eastern',label:'Sitar',      play:(t,ac)=>playSitar(t,261,ac)},
  {name:'Bansuri',  color:'#22d3ee',world:'eastern',label:'Bansuri',    play:(t,ac)=>playBansuri(t,523,ac)},
  {name:'Sarangi',  color:'#f472b6',world:'eastern',label:'Sarangi',    play:(t,ac)=>playSarangi(t,261,ac)},
  {name:'Tanpura',  color:'#818cf8',world:'eastern',label:'Tanpura',    play:(t,ac)=>playTanpura(t,ac)},
  {name:'Shehnai',  color:'#0891b2',world:'eastern',label:'Shehnai',    play:(t,ac)=>playShehnai(t,370,ac)},
  {name:'Veena',    color:'#c084fc',world:'eastern',label:'Veena',      play:(t,ac)=>playVeena(t,220,ac)},
  {name:'Harmonium',color:'#6d28d9',world:'eastern',label:'Harmonium',  play:(t,ac)=>playHarmonium(t,261,ac)},
  {name:'Mridag.R', color:'#84cc16',world:'eastern',label:'Mridag.R',   play:(t,ac)=>playMridangam(t,'R',ac)},
  {name:'Mridag.L', color:'#65a30d',world:'eastern',label:'Mridag.L',   play:(t,ac)=>playMridangam(t,'L',ac)},
  {name:'Khol-Hi',  color:'#fbbf24',world:'eastern',label:'Khol(Hi)',   play:(t,ac)=>playKhol(t,'hi',ac)},
  {name:'Khol-Lo',  color:'#d97706',world:'eastern',label:'Khol(Lo)',   play:(t,ac)=>playKhol(t,'low',ac)},
  {name:'Esraj',    color:'#e879f9',world:'eastern',label:'Esraj',      play:(t,ac)=>playEsraj(t,293,ac)},
  {name:'Nadhasw.', color:'#f43f5e',world:'eastern',label:'Nadhsw.',    play:(t,ac)=>playNadhaswaram(t,277,ac)},
  {name:'Tungi',    color:'#10b981',world:'eastern',label:'Tungi',      play:(t,ac)=>playTungi(t,ac)},
  {name:'Mahuri',   color:'#06b6d4',world:'eastern',label:'Mahuri',     play:(t,ac)=>playMahuri(t,370,ac)},
  {name:'Nagara',   color:'#be123c',world:'eastern',label:'Nagara',     play:(t,ac)=>playNagara(t,ac)},
  {name:'Kanjira',  color:'#fb923c',world:'eastern',label:'Kanjira',    play:(t,ac)=>playKanjira(t,ac)},
  {name:'Dumru',    color:'#fcd34d',world:'eastern',label:'Dumru',      play:(t,ac)=>playDumru(t,ac)},
  {name:'Oud',      color:'#92400e',world:'eastern',label:'Oud',        play:(t,ac)=>playOud(t,196,ac)},
  {name:'Kora',     color:'#065f46',world:'eastern',label:'Kora',       play:(t,ac)=>playKora(t,261,ac)},
  {name:'Erhu',     color:'#7c2d12',world:'eastern',label:'Erhu',       play:(t,ac)=>playErhu(t,329,ac)},
  {name:'Koto',     color:'#1e3a5f',world:'eastern',label:'Koto',       play:(t,ac)=>playKoto(t,261,ac)},
  {name:'Accordion',color:'#4c1d95',world:'eastern',label:'Accordion',  play:(t,ac)=>playAccordion(t,261,ac)},
  {name:'Bagpipe',  color:'#166534',world:'eastern',label:'Bagpipe',    play:(t,ac)=>playBagpipe(t,233,ac)},
  {name:'Pan Flute',color:'#0e7490',world:'eastern',label:'Pan Flute',  play:(t,ac)=>playPanFlute(t,523,ac)},
  {name:'Djembe',   color:'#7f1d1d',world:'eastern',label:'Djembe',     play:(t,ac)=>playDjembe(t,ac)},
  {name:'Darabouka',color:'#78350f',world:'eastern',label:'Darabouka',  play:(t,ac)=>playDarabouka(t,ac)},
  {name:'Cajon',    color:'#92400e',world:'eastern',label:'Cajon',      play:(t,ac)=>playCajon(t,true,ac)},
  {name:'Taiko',    color:'#831843',world:'eastern',label:'Taiko',      play:(t,ac)=>playTaiko(t,ac)},
  {name:'Congas',   color:'#854d0e',world:'eastern',label:'Congas',     play:(t,ac)=>playCongas(t,false,ac)},
  {name:'Congas-Hi',color:'#a16207',world:'eastern',label:'Congas Hi',  play:(t,ac)=>playCongas(t,true,ac)},
];

function emptyGrid(){const g={};TRACKS.forEach(t=>g[t.name]=Array(16).fill(false));return g;}
const trackVolumes={};TRACKS.forEach(t=>trackVolumes[t.name]=1.0);

// ── ALL 28 INDIAN STATES + WORLD REGIONS ──
// Each region has: icon, name, state/country, region group, tune type, 
// description, instruments, scale, and 2-3 variations with melodic patterns

const INDIAN_REGIONS = {
  // ── NORTH INDIA ──
  punjab:{icon:'🌾',name:'Punjabi Bhangra',state:'Punjab',group:'north',tuneType:'Bhangra / Giddha',
    desc:'High-energy harvest dance from Punjab — thundering Dhol, Shehnai melody and celebratory rhythm.',
    instruments:['Dhol','Dhol-Hi','Shehnai','Harmonium','Tabla-Na'],
    scale:'bilawal', bpm:132,
    variations:{
      bhangra:{name:'Bhangra Beat',emoji:'💃',bpm:138,desc:'Classic Bhangra — heavy Dhol with Boli shout pattern',
        percussion:{'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dhol-Hi':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],'Tabla-Na':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1]},
        melody:{instr:'Shehnai',scale:'bilawal',pattern:[0,2,4,3,4,6,5,4,2,4,3,2,0,-1,0,2]}},
      giddha:{name:'Giddha Folk',emoji:'🎶',bpm:110,desc:'Womens folk dance — lighter Dholak with Bolian melody',
        percussion:{'Dholak':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Tabla-Na':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]},
        melody:{instr:'Harmonium',scale:'bilawal',pattern:[0,1,2,3,2,1,0,-1,0,2,3,4,3,2,1,0]}}
    }},
  haryana:{icon:'🏺',name:'Haryanvi Folk',state:'Haryana',group:'north',tuneType:'Ragini / Saang',
    desc:'Rural folk music of Haryana — Nagara drums, Harmonium, storytelling Saang tradition.',
    instruments:['Nagara','Harmonium','Dholak','Tabla-Ge'],
    scale:'kafi', bpm:105,
    variations:{
      ragini:{name:'Ragini Folk',emoji:'🌻',bpm:108,desc:'Traditional Ragini song with Harmonium lead',
        percussion:{'Nagara':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Harmonium',scale:'kafi',pattern:[0,2,3,2,0,3,2,0,2,3,4,3,2,0,-1,0]}}
    }},
  himachal:{icon:'🏔️',name:'Himachali Nati',state:'Himachal Pradesh',group:'north',tuneType:'Nati Dance',
    desc:'Mountain folk dance from Himachal — Dhol, flute melody, slow graceful rhythm.',
    instruments:['Dhol','Bansuri','Tabla-Na'],
    scale:'bhairavi', bpm:88,
    variations:{
      nati:{name:'Nati Rhythm',emoji:'🏔️',bpm:90,desc:'Traditional Nati folk dance pattern',
        percussion:{'Dhol':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Dhol-Hi':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],'Tabla-Na':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Bansuri',scale:'bhairavi',pattern:[0,2,3,5,3,2,0,-1,0,2,3,5,4,3,2,0]}}
    }},
  up:{icon:'🕌',name:'UP Thumri / Kajri',state:'Uttar Pradesh',group:'north',tuneType:'Thumri / Kajri',
    desc:'Classical-folk blend from UP — Tabla taal, Harmonium, soulful Sarangi melody.',
    instruments:['Tabla-Na','Tabla-Ge','Harmonium','Sarangi','Tanpura'],
    scale:'bhairavi', bpm:72,
    variations:{
      thumri:{name:'Thumri Style',emoji:'🎶',bpm:68,desc:'Slow expressive Thumri with ornamentation',
        percussion:{'Tabla-Na':[1,0,0,1,0,1,0,0,1,0,0,1,0,0,1,0],'Tabla-Ge':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
        melody:{instr:'Harmonium',scale:'bhairavi',pattern:[0,1,2,3,2,1,0,2,3,4,5,4,3,2,1,0]}},
      kajri:{name:'Kajri Monsoon',emoji:'🌧️',bpm:78,desc:'Rainy season folk song of Varanasi',
        percussion:{'Tabla-Na':[1,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1],'Dholak':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
        melody:{instr:'Sarangi',scale:'kafi',pattern:[2,3,4,3,2,0,2,4,3,2,1,0,2,3,2,0]}}
    }},
  rajasthan:{icon:'🏜️',name:'Rajasthani Folk',state:'Rajasthan',group:'north',tuneType:'Manganiyar / Kalbeliya',
    desc:'Desert music of Rajasthan — Kamaicha, Morchang, Khartal and Sarangi with vivid ornamentation.',
    instruments:['Sarangi','Tabla-Na','Dholak','Shehnai'],
    scale:'bhairav', bpm:96,
    variations:{
      manganiyar:{name:'Manganiyar Style',emoji:'🏜️',bpm:98,desc:'Classical folk of the Manganiyar community',
        percussion:{'Dholak':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]},
        melody:{instr:'Shehnai',scale:'bhairav',pattern:[0,1,2,4,2,1,0,2,4,5,4,2,0,2,1,0]}},
      kalbeliya:{name:'Kalbeliya Dance',emoji:'🐍',bpm:118,desc:'Snake charmer folk dance — fast and rhythmic',
        percussion:{'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Tabla-Na':[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0]},
        melody:{instr:'Shehnai',scale:'bhairav',pattern:[0,2,4,5,4,2,4,5,6,5,4,2,4,2,0,-1]}}
    }},
  jk:{icon:'❄️',name:'Kashmiri Sufiana',state:'J&K / Ladakh',group:'north',tuneType:'Sufiana Kalam',
    desc:'Mystical music of Kashmir — Santoor, Rabab and Setar in meditative Sufiana tradition.',
    instruments:['Sitar','Tabla-Na','Sarangi','Tanpura'],
    scale:'bhairav', bpm:58,
    variations:{
      sufiana:{name:'Sufiana Kalam',emoji:'❄️',bpm:55,desc:'Meditative Sufi devotional of Kashmir valley',
        percussion:{'Tabla-Na':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],'Tabla-Ge':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
        melody:{instr:'Sitar',scale:'bhairav',pattern:[0,1,2,4,2,1,0,-1,0,2,4,5,4,2,1,0]}}
    }},
  // ── EAST INDIA ──
  bengal:{icon:'🌸',name:'Rabindra Sangeet',state:'West Bengal',group:'east',tuneType:'Rabindra Sangeet / Baul',
    desc:"Tagore's songs — Esraj drone, Khol rhythm, Bansuri melody. Also Baul mystical folk.",
    instruments:['Esraj','Khol-Hi','Khol-Lo','Bansuri','Tanpura'],
    scale:'bhairavi', bpm:72,
    variations:{
      rabindra:{name:'Rabindra Sangeet',emoji:'🌸',bpm:68,desc:"Tagore's lyrical style — slow, devotional",
        percussion:{'Khol-Lo':[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],'Khol-Hi':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],'Tanpura':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
        melody:{instr:'Esraj',scale:'bhairavi',pattern:[0,2,3,5,3,2,0,2,3,5,6,5,3,2,0,-1]}},
      baul:{name:'Baul Folk',emoji:'🎭',bpm:85,desc:'Mystical wandering minstrel tradition',
        percussion:{'Khol-Lo':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Khol-Hi':[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1]},
        melody:{instr:'Bansuri',scale:'kafi',pattern:[2,3,4,3,2,0,2,4,5,4,3,2,4,3,2,0]}}
    }},
  odisha:{icon:'🌻',name:'Odia Folk / Odissi',state:'Odisha',group:'east',tuneType:'Odissi / Sambalpuri',
    desc:'Classical Odissi and Sambalpuri folk — Mardala drum, Mahuri wind, Tungi rhythms.',
    instruments:['Tungi','Mahuri','Dholak','Bansuri'],
    scale:'bhairav', bpm:88,
    variations:{
      odissi:{name:'Odissi Classical',emoji:'💃',bpm:82,desc:'Classical Odissi dance rhythm — Mardala taal',
        percussion:{'Tungi':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dholak':[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0]},
        melody:{instr:'Mahuri',scale:'bhairav',pattern:[0,1,2,4,2,1,0,2,4,5,6,5,4,2,1,0]}},
      sambalpuri:{name:'Sambalpuri Beat',emoji:'🌻',bpm:98,desc:'Vibrant folk from western Odisha',
        percussion:{'Tungi':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Dholak':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0]},
        melody:{instr:'Bansuri',scale:'bilawal',pattern:[0,2,3,5,3,5,4,3,2,4,3,2,0,2,3,0]}}
    }},
  bihar:{icon:'🎺',name:'Bhojpuri / Bihari',state:'Bihar / Jharkhand',group:'east',tuneType:'Bhojpuri / Jhumar',
    desc:'Raw village energy of Bihar — Nagara thunder, Harmonium, Shehnai call.',
    instruments:['Nagara','Harmonium','Shehnai','Dholak','Tabla-Na'],
    scale:'kafi', bpm:112,
    variations:{
      bhojpuri:{name:'Bhojpuri Beat',emoji:'🎺',bpm:118,desc:'Classic Bhojpuri folk with Nagara',
        percussion:{'Nagara':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Tabla-Na':[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0]},
        melody:{instr:'Shehnai',scale:'kafi',pattern:[0,2,3,4,3,2,4,5,4,3,2,0,2,3,2,0]}},
      jhumar:{name:'Jhumar Dance',emoji:'💃',bpm:105,desc:'Slow-fast cycle dance of Bihar',
        percussion:{'Dholak':[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],'Tabla-Na':[0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Harmonium',scale:'bhairavi',pattern:[0,1,2,3,2,1,2,3,4,3,2,1,0,2,1,0]}}
    }},
  assam:{icon:'🍵',name:'Bihu / Assamese',state:'Assam',group:'northeast',tuneType:'Bihu / Borgeet',
    desc:'Festival folk of Assam — Dhol, Pepa buffalo horn, Gogona jaw harp, Bihu dance rhythm.',
    instruments:['Dhol','Dhol-Hi','Bansuri','Tabla-Na'],
    scale:'bilawal', bpm:118,
    variations:{
      bihu:{name:'Rongali Bihu',emoji:'🍵',bpm:125,desc:'Spring harvest festival beat — energetic and joyful',
        percussion:{'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dhol-Hi':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]},
        melody:{instr:'Bansuri',scale:'bilawal',pattern:[0,2,4,5,4,2,4,5,6,5,4,2,0,2,4,0]}}
    }},
  manipur:{icon:'🌺',name:'Manipuri Sankirtana',state:'Manipur',group:'northeast',tuneType:'Sankirtana / Lai Haraoba',
    desc:'Sacred dance music of Manipur — Pung drum, Kartal cymbals, devotional Sankirtana.',
    instruments:['Khol-Hi','Khol-Lo','Tabla-Na','Bansuri'],
    scale:'yaman', bpm:88,
    variations:{
      sankirtana:{name:'Sankirtana Rhythm',emoji:'🌺',bpm:85,desc:'Devotional Vaishnavite kirtan of Manipur',
        percussion:{'Khol-Lo':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Khol-Hi':[0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0],'Tabla-Na':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Bansuri',scale:'yaman',pattern:[1,2,4,5,4,2,1,4,5,6,5,4,2,1,2,0]}}
    }},
  meghalaya:{icon:'🌧️',name:'Khasi Folk',state:'Meghalaya',group:'northeast',tuneType:'Nongkrem / War Dance',
    desc:'Tribal music of the Khasi hills — bamboo flutes, war drum patterns, harvest celebration.',
    instruments:['Dhol','Bansuri','Tabla-Na'],
    scale:'pentatonic', bpm:105,
    variations:{
      nongkrem:{name:'Nongkrem Festival',emoji:'🌧️',bpm:108,desc:'Sacred Nongkrem dance rhythm of the Khasi',
        percussion:{'Dhol':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Dhol-Hi':[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1],'Tabla-Na':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Bansuri',scale:'pentatonic',pattern:[0,2,3,5,3,2,5,3,2,3,5,3,2,0,3,0]}}
    }},
  sikkim:{icon:'🏔️',name:'Sikkimese Folk',state:'Sikkim',group:'northeast',tuneType:'Maruni / Tamang Selo',
    desc:'Himalayan music of Sikkim — Damphu drum, Tungna string, Tibetan-influenced melodies.',
    instruments:['Dhol','Bansuri','Tabla-Na'],
    scale:'pentatonic', bpm:92,
    variations:{
      maruni:{name:'Maruni Dance',emoji:'🏔️',bpm:95,desc:'Ceremonial dance of Sikkim with Damphu',
        percussion:{'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dhol-Hi':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
        melody:{instr:'Bansuri',scale:'pentatonic',pattern:[0,2,3,0,2,3,5,3,2,0,3,2,0,3,2,0]}}
    }},
  nagaland:{icon:'🦅',name:'Naga War Dance',state:'Nagaland',group:'northeast',tuneType:'War Dance / Hornbill',
    desc:'Tribal music of Nagaland — log drums, war chants, hornbill festival rhythms.',
    instruments:['Dhol','Dhol-Hi','Tabla-Na'],
    scale:'pentatonic', bpm:125,
    variations:{
      wardance:{name:'War Dance Beat',emoji:'🦅',bpm:130,desc:'Powerful tribal war dance rhythm of Naga warriors',
        percussion:{'Dhol':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Dhol-Hi':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],'Tabla-Na':[0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0]},
        melody:{instr:'Bansuri',scale:'pentatonic',pattern:[0,0,3,0,0,3,5,3,0,0,3,0,5,3,0,0]}}
    }},
  arunachal:{icon:'🦋',name:'Arunachali Folk',state:'Arunachal Pradesh',group:'northeast',tuneType:'Aji Lamu / Popi',
    desc:'Diverse tribal music of Arunachal — bamboo instruments, Monpa and Adi tribal rhythms.',
    instruments:['Dhol','Bansuri','Tabla-Na'],
    scale:'pentatonic', bpm:100,
    variations:{
      tribal:{name:'Adi Tribal Beat',emoji:'🦋',bpm:102,desc:'Forest tribal rhythm of the Adi people',
        percussion:{'Dhol':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Dhol-Hi':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Bansuri',scale:'pentatonic',pattern:[0,2,0,3,2,0,3,5,3,0,2,3,2,0,2,0]}}
    }},
  mizoram:{icon:'🎸',name:'Mizo Cheraw',state:'Mizoram',group:'northeast',tuneType:'Cheraw Bamboo Dance',
    desc:'Bamboo dance music of Mizoram — rhythmic clapping, bamboo percussion, folk melodies.',
    instruments:['Dhol','Bansuri','Tabla-Na'],
    scale:'major', bpm:112,
    variations:{
      cheraw:{name:'Cheraw Rhythm',emoji:'🎸',bpm:115,desc:'Bamboo dance beat — precise and joyful',
        percussion:{'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dhol-Hi':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],'Tabla-Na':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Bansuri',scale:'major',pattern:[0,2,4,5,4,2,4,5,6,5,4,2,0,2,4,0]}}
    }},
  tripura:{icon:'🌿',name:'Tripuri Garia',state:'Tripura',group:'northeast',tuneType:'Garia / Hojagiri',
    desc:'Hojagiri dance music of Tripura — Kham drum, melodious flute, balancing performance.',
    instruments:['Dhol','Bansuri','Dholak'],
    scale:'bilawal', bpm:98,
    variations:{
      hojagiri:{name:'Hojagiri Dance',emoji:'🌿',bpm:100,desc:'Traditional Hojagiri balancing dance rhythm',
        percussion:{'Dholak':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
        melody:{instr:'Bansuri',scale:'bilawal',pattern:[0,2,3,5,3,2,3,5,4,3,2,0,2,3,2,0]}}
    }},
  // ── SOUTH INDIA ──
  tamilnadu:{icon:'🌺',name:'Carnatic / Kollywood',state:'Tamil Nadu',group:'south',tuneType:'Carnatic / Tamil BGM',
    desc:'Carnatic classical and epic film BGM — Mridangam, Veena, Nadhaswaram, Konakkol vocals.',
    instruments:['Mridag.R','Mridag.L','Veena','Nadhasw.','Kanjira'],
    scale:'bhairavi', bpm:120,
    variations:{
      carnatic:{name:'Carnatic Adi Talam',emoji:'🌺',bpm:120,desc:'Classical 8-beat Adi talam with Mridangam',
        percussion:{'Mridag.R':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0],'Mridag.L':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Kanjira':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]},
        melody:{instr:'Veena',scale:'bhairavi',pattern:[0,1,2,3,2,1,2,3,4,3,2,1,0,2,1,0]}},
      bgm:{name:'Tamil Film BGM',emoji:'🎬',bpm:130,desc:'Epic South Indian film background music',
        percussion:{'Mridag.R':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],'Kanjira':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],'Mridag.L':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
        melody:{instr:'Nadhasw.',scale:'bilawal',pattern:[0,2,4,5,4,2,4,5,6,5,4,2,4,2,0,-1]}}
    }},
  kerala:{icon:'🥥',name:'Kerala Sopana',state:'Kerala',group:'south',tuneType:'Sopana Sangeetam / Theyyam',
    desc:'Temple music of Kerala — Chenda drum, Sopana classical style, Panchavadyam ensemble.',
    instruments:['Mridag.R','Mridag.L','Kanjira','Bansuri'],
    scale:'bhairav', bpm:95,
    variations:{
      sopana:{name:'Sopana Classical',emoji:'🥥',bpm:88,desc:'Temple staircase music — meditative and ornate',
        percussion:{'Mridag.L':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Mridag.R':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]},
        melody:{instr:'Bansuri',scale:'bhairav',pattern:[0,1,2,4,2,1,0,1,2,4,5,4,2,1,0,-1]}},
      theyyam:{name:'Theyyam Ritual',emoji:'🔥',bpm:108,desc:'Powerful ritual dance beat of North Kerala',
        percussion:{'Mridag.R':[1,0,1,0,1,1,0,1,1,0,1,0,1,1,0,1],'Kanjira':[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],'Mridag.L':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
        melody:{instr:'Nadhasw.',scale:'bilawal',pattern:[0,2,4,2,0,4,5,4,2,4,5,4,2,0,2,0]}}
    }},
  karnataka:{icon:'🏛️',name:'Carnatic / Yakshagana',state:'Karnataka',group:'south',tuneType:'Carnatic / Yakshagana',
    desc:'Karnataka classical and Yakshagana folk theatre — Mridangam, Harmonium, Veena.',
    instruments:['Mridag.R','Mridag.L','Veena','Harmonium'],
    scale:'yaman', bpm:110,
    variations:{
      yakshagana:{name:'Yakshagana Style',emoji:'🏛️',bpm:115,desc:'Folk theatre music of coastal Karnataka',
        percussion:{'Mridag.R':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Mridag.L':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
        melody:{instr:'Harmonium',scale:'yaman',pattern:[1,2,4,5,4,2,1,4,5,6,5,4,2,1,2,0]}}
    }},
  andhra:{icon:'🌴',name:'Telugu Folk / Kuchipudi',state:'Andhra / Telangana',group:'south',tuneType:'Kuchipudi / Burra Katha',
    desc:'Classical Kuchipudi dance and Burra Katha folk — Mridangam, Veena, Nadaswaram.',
    instruments:['Mridag.R','Veena','Nadhasw.','Kanjira'],
    scale:'bilawal', bpm:115,
    variations:{
      kuchipudi:{name:'Kuchipudi Dance',emoji:'🌴',bpm:112,desc:'Classical dance style of Andhra Pradesh',
        percussion:{'Mridag.R':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],'Kanjira':[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1],'Mridag.L':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
        melody:{instr:'Veena',scale:'bilawal',pattern:[0,2,4,5,4,2,4,5,6,5,4,2,0,2,4,0]}}
    }},
  // ── WEST INDIA ──
  gujarat:{icon:'🦚',name:'Gujarati Garba',state:'Gujarat',group:'west',tuneType:'Garba / Dandiya',
    desc:'Navratri festival music of Gujarat — Dhol, Tabla, claps in circular Garba dance.',
    instruments:['Dhol','Dhol-Hi','Tabla-Na','Shehnai'],
    scale:'bilawal', bpm:128,
    variations:{
      garba:{name:'Garba Rhythm',emoji:'🦚',bpm:132,desc:'Nine-night festival circular dance beat',
        percussion:{'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dhol-Hi':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]},
        melody:{instr:'Shehnai',scale:'bilawal',pattern:[0,2,4,5,4,2,4,5,4,2,0,2,4,5,4,0]}},
      dandiya:{name:'Dandiya Raas',emoji:'🥢',bpm:145,desc:'Stick dance of Navratri — fast and rhythmic',
        percussion:{'Dhol':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Dhol-Hi':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]},
        melody:{instr:'Shehnai',scale:'bilawal',pattern:[0,2,4,2,0,4,5,4,2,4,5,4,2,0,4,0]}}
    }},
  maharashtra:{icon:'🥁',name:'Marathi Powada',state:'Maharashtra',group:'west',tuneType:'Lavani / Powada',
    desc:'Powerful folk of Maharashtra — Dholki beats, Tamasha theatre, Lavani dance.',
    instruments:['Dholak','Tabla-Na','Harmonium','Shehnai'],
    scale:'kafi', bpm:115,
    variations:{
      lavani:{name:'Lavani Dance',emoji:'💃',bpm:118,desc:'Energetic Lavani folk dance of Maharashtra',
        percussion:{'Dholak':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]},
        melody:{instr:'Harmonium',scale:'kafi',pattern:[0,2,3,4,3,2,4,5,4,3,2,0,2,3,2,0]}}
    }},
  goa:{icon:'🏖️',name:'Goan Mando / Tiatr',state:'Goa',group:'west',tuneType:'Mando / Dekhni',
    desc:'Portuguese-Indian fusion of Goa — Guitar, violin, Mando love songs, Dekhni folk dance.',
    instruments:['Guitar','Violin','Tabla-Na','Piano'],
    scale:'major', bpm:88,
    variations:{
      mando:{name:'Mando Song',emoji:'🏖️',bpm:85,desc:'Romantic Goan Mando with Guitar and Violin',
        percussion:{'Tabla-Na':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Dholak':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]},
        melody:{instr:'Violin',scale:'major',pattern:[0,2,4,5,4,2,4,5,4,2,0,2,4,5,4,0]}}
    }},
  // ── CENTRAL INDIA ──
  mp:{icon:'🐯',name:'Malwa / Bundelkhand',state:'Madhya Pradesh',group:'central',tuneType:'Rai / Karma',
    desc:'Folk music of Madhya Pradesh — Rai dance, Karma festival, Baiga tribal beats.',
    instruments:['Dhol','Bansuri','Dholak','Tabla-Na'],
    scale:'bhairavi', bpm:108,
    variations:{
      rai:{name:'Rai Folk Dance',emoji:'🐯',bpm:112,desc:'Energetic Rai folk dance of Bundelkhand',
        percussion:{'Dhol':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Dholak':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Tabla-Na':[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1]},
        melody:{instr:'Bansuri',scale:'bhairavi',pattern:[0,1,2,3,2,1,0,2,3,4,3,2,0,2,1,0]}}
    }},
  chattisgarh:{icon:'🌿',name:'Chhattisgarhi Pandwani',state:'Chhattisgarh',group:'central',tuneType:'Pandwani / Karma',
    desc:'Forest tribal music of Chhattisgarh — Tasa drum, bamboo flute, Karma dance.',
    instruments:['Dhol','Bansuri','Dholak'],
    scale:'bilawal', bpm:100,
    variations:{
      karma:{name:'Karma Dance',emoji:'🌿',bpm:102,desc:'Tribal harvest dance of Chhattisgarh',
        percussion:{'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Dholak':[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0]},
        melody:{instr:'Bansuri',scale:'bilawal',pattern:[0,2,3,5,3,2,5,3,2,3,5,3,2,0,3,0]}}
    }},
  telangana:{icon:'🌾',name:'Telangana Folk',state:'Telangana',group:'central',tuneType:'Bathukamma / Bonalu',
    desc:'Festival folk of Telangana — Bathukamma flower festival, Bonalu goddess celebration.',
    instruments:['Dhol','Dholak','Bansuri','Tabla-Na'],
    scale:'bilawal', bpm:120,
    variations:{
      bathukamma:{name:'Bathukamma Festival',emoji:'🌸',bpm:122,desc:'Flower festival circle dance of Telangana',
        percussion:{'Dholak':[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],'Dhol':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Tabla-Na':[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0]},
        melody:{instr:'Bansuri',scale:'bilawal',pattern:[0,2,4,5,4,2,4,5,4,2,0,2,4,5,4,0]}}
    }},
};

// ── WORLD REGIONS ──
const WORLD_REGIONS = {
  // AFRICA
  westAfrica:{icon:'🥁',name:'West African Djembe',country:'West Africa (Mali/Guinea)',group:'africa',tuneType:'Djembe / Griot',
    desc:'Heartbeat of West Africa — Djembe leads, Kora melody, talking drum rhythms used in ceremonies.',
    instruments:['Djembe','Kora','Congas','Congas-Hi'],
    scale:'african', bpm:118,
    variations:{
      djembe:{name:'Djembe Ceremony',emoji:'🥁',bpm:122,desc:'Ceremonial Djembe polyrhythm — call and response',
        percussion:{'Djembe':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],'Congas':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],'Congas-Hi':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]},
        melody:{instr:'Kora',scale:'african',pattern:[0,2,3,5,3,2,5,3,5,2,3,5,3,2,0,2]}},
      griot:{name:'Griot Storytelling',emoji:'🎵',bpm:105,desc:'Traditional Griot narrative music',
        percussion:{'Djembe':[1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0],'Congas':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Kora',scale:'african',pattern:[0,2,3,0,2,3,5,3,0,2,3,0,5,3,2,0]}}
    }},
  ethiopia:{icon:'🌍',name:'Ethiopian Tizita',country:'Ethiopia / Horn of Africa',group:'africa',tuneType:'Tizita / Kiñit',
    desc:'Soul music of Ethiopia — pentatonic Kiñit scale, Massinko bowed lute, nostalgic Tizita blues.',
    instruments:['Erhu','Congas','Bansuri'],
    scale:'pentatonic', bpm:78,
    variations:{
      tizita:{name:'Tizita Blues',emoji:'🌍',bpm:75,desc:'Ethiopian blues — nostalgic and melancholic',
        percussion:{'Congas':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Congas-Hi':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Erhu',scale:'pentatonic',pattern:[0,2,3,0,2,3,5,3,2,0,3,2,0,2,3,0]}}
    }},
  // LATIN AMERICA
  brazil:{icon:'🌴',name:'Brazilian Samba',country:'Brazil',group:'latin',tuneType:'Samba / Baião',
    desc:'Rio carnival music — syncopated Cajon, Congas, Guitar, and driving samba de roda rhythm.',
    instruments:['Cajon','Congas','Congas-Hi','Guitar'],
    scale:'major', bpm:128,
    variations:{
      samba:{name:'Samba de Roda',emoji:'🌴',bpm:132,desc:'Traditional samba circle dance — syncopated and joyful',
        percussion:{'Cajon':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],'Congas':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],'Congas-Hi':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]},
        melody:{instr:'Guitar',scale:'major',pattern:[0,2,4,5,4,2,4,5,4,2,0,2,4,5,4,0]}},
      baiao:{name:'Baião Northeast',emoji:'🌵',bpm:112,desc:'Northeast Brazilian folk rhythm — accordion and zabumba',
        percussion:{'Cajon':[1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0],'Congas':[0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0]},
        melody:{instr:'Accordion',scale:'major',pattern:[0,2,3,5,3,2,3,5,4,3,2,0,2,3,2,0]}}
    }},
  cuba:{icon:'🎺',name:'Cuban Son / Rumba',country:'Cuba / Caribbean',group:'latin',tuneType:'Son / Rumba / Bolero',
    desc:'Afro-Cuban music — clave rhythm, Congas, Trumpet melody, Son Cubano roots of salsa.',
    instruments:['Congas','Congas-Hi','Trumpet','Piano'],
    scale:'major', bpm:110,
    variations:{
      son:{name:'Son Cubano',emoji:'🎺',bpm:108,desc:'Root of salsa — Afro-Cuban clave pattern',
        percussion:{'Congas':[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],'Congas-Hi':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Trumpet',scale:'major',pattern:[0,2,4,5,4,2,4,5,4,2,0,2,4,5,4,0]}}
    }},
  colombia:{icon:'🪗',name:'Colombian Cumbia',country:'Colombia',group:'latin',tuneType:'Cumbia / Vallenato',
    desc:'Caribbean coast music — Cajon, Congas, Accordion — mestizo fusion of African and indigenous.',
    instruments:['Cajon','Congas','Accordion'],
    scale:'minor', bpm:100,
    variations:{
      cumbia:{name:'Cumbia Beat',emoji:'🪗',bpm:102,desc:'Classic cumbia rhythm — infectious and danceable',
        percussion:{'Cajon':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0],'Congas-Hi':[1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0]},
        melody:{instr:'Accordion',scale:'minor',pattern:[0,2,3,5,3,2,3,5,3,2,0,2,3,5,3,0]}}
    }},
  // MIDDLE EAST
  egypt:{icon:'🏺',name:'Egyptian Maqam',country:'Egypt / North Africa',group:'middleeast',tuneType:'Maqam / Shaabi',
    desc:'Classical Arabic music — Oud melody in Maqam scales, Darabouka rhythm, Hijaz mode.',
    instruments:['Oud','Darabouka','Violin'],
    scale:'arabic', bpm:88,
    variations:{
      maqam:{name:'Maqam Hijaz',emoji:'🏺',bpm:82,desc:'Classical Arabic Hijaz maqam — exotic and ornate',
        percussion:{'Darabouka':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],'Congas':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
        melody:{instr:'Oud',scale:'arabic',pattern:[0,1,3,4,3,1,0,3,4,5,4,3,1,0,3,0]}},
      shaabi:{name:'Shaabi Folk',emoji:'🎵',bpm:102,desc:'Egyptian street folk music — energetic and popular',
        percussion:{'Darabouka':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Congas':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1]},
        melody:{instr:'Oud',scale:'arabic',pattern:[0,1,3,4,3,1,3,4,5,4,3,1,0,1,3,0]}}
    }},
  persia:{icon:'🌙',name:'Persian Dastgah',country:'Iran / Persia',group:'middleeast',tuneType:'Dastgah / Radif',
    desc:'Classical Persian music — Tar and Setar, Dastgah modal system, intricate ornamentation.',
    instruments:['Sitar','Darabouka','Sarangi'],
    scale:'arabic', bpm:72,
    variations:{
      dastgah:{name:'Dastgah Shur',emoji:'🌙',bpm:68,desc:'Melancholic Persian modal style — longing',
        percussion:{'Darabouka':[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],'Congas':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
        melody:{instr:'Sitar',scale:'arabic',pattern:[0,1,3,4,3,1,0,-1,0,1,3,4,5,4,3,1]}}
    }},
  turkey:{icon:'🕌',name:'Turkish Makam',country:'Turkey / Ottoman',group:'middleeast',tuneType:'Makam / Sufi Sema',
    desc:'Ottoman classical music — Oud, Darabouka in complex Makam modes, Sufi whirling Sema.',
    instruments:['Oud','Darabouka','Violin'],
    scale:'arabic', bpm:80,
    variations:{
      sufi:{name:'Sufi Sema',emoji:'🌀',bpm:75,desc:'Whirling dervish ceremony — trance-inducing',
        percussion:{'Darabouka':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
        melody:{instr:'Oud',scale:'arabic',pattern:[0,1,3,4,3,1,3,4,3,1,0,3,1,0,3,0]}}
    }},
  // EAST ASIA
  japan:{icon:'🎎',name:'Japanese Taiko',country:'Japan',group:'eastasia',tuneType:'Taiko / Gagaku',
    desc:'Japanese drumming — Taiko thunder, Koto melody in pentatonic, Gagaku court music.',
    instruments:['Taiko','Koto','Bansuri'],
    scale:'pentatonic', bpm:95,
    variations:{
      taiko:{name:'Taiko Drumming',emoji:'🎎',bpm:98,desc:'Powerful ensemble Taiko — precision and power',
        percussion:{'Taiko':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],'Congas-Hi':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Koto',scale:'pentatonic',pattern:[0,2,3,5,3,2,0,3,5,3,2,0,3,2,0,-1]}},
      gagaku:{name:'Gagaku Court',emoji:'🏯',bpm:72,desc:'Ancient Japanese imperial court music',
        percussion:{'Taiko':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]},
        melody:{instr:'Koto',scale:'pentatonic',pattern:[0,2,3,0,2,3,5,3,0,2,3,0,5,3,2,0]}}
    }},
  china:{icon:'🐉',name:'Chinese Folk / Opera',country:'China',group:'eastasia',tuneType:'Erhu / Peking Opera',
    desc:'Chinese folk and Peking Opera — Erhu bowed strings, pentatonic melodies, dynamic opera rhythm.',
    instruments:['Erhu','Taiko','Koto'],
    scale:'pentatonic', bpm:105,
    variations:{
      erhu:{name:'Erhu Folk Song',emoji:'🐉',bpm:98,desc:'Traditional folk melody on the Erhu',
        percussion:{'Taiko':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]},
        melody:{instr:'Erhu',scale:'pentatonic',pattern:[0,2,3,5,3,2,5,3,2,3,5,3,2,0,3,0]}}
    }},
  korea:{icon:'🥁',name:'Korean Nanta',country:'Korea',group:'eastasia',tuneType:'Samulnori / Pansori',
    desc:'Korean percussion — Samulnori four-instrument ensemble, Pansori drama, Janggu rhythms.',
    instruments:['Taiko','Congas','Congas-Hi','Bansuri'],
    scale:'pentatonic', bpm:118,
    variations:{
      samulnori:{name:'Samulnori',emoji:'🥁',bpm:122,desc:'Four percussion celebration — Jangdan rhythms',
        percussion:{'Taiko':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas':[1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1],'Congas-Hi':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]},
        melody:{instr:'Bansuri',scale:'pentatonic',pattern:[0,2,3,5,3,2,3,5,3,2,0,3,2,0,3,0]}}
    }},
  bali:{icon:'🌺',name:'Balinese Gamelan',country:'Indonesia / Bali',group:'eastasia',tuneType:'Gamelan / Kecak',
    desc:'Hypnotic Balinese gamelan — interlocking Marimba patterns, Kecak vocal chant, ceremonial.',
    instruments:['Marimba','Kanjira','Taiko'],
    scale:'gamelan', bpm:108,
    variations:{
      gamelan:{name:'Gamelan Bleganjur',emoji:'🌺',bpm:112,desc:'Processional gamelan — interlocking patterns',
        percussion:{'Taiko':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Kanjira':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Congas':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]},
        melody:{instr:'Marimba',scale:'gamelan',pattern:[0,2,3,5,3,2,5,3,2,3,5,3,2,0,3,0]}}
    }},
  // EUROPE
  ireland:{icon:'🍀',name:'Irish Jig / Reel',country:'Ireland / Celtic',group:'europe',tuneType:'Jig / Reel / Uilleann',
    desc:'Celtic folk music — fast Jig and Reel patterns, Uilleann pipes, Fiddle melody.',
    instruments:['Violin','Bagpipe','Cajon'],
    scale:'celtic', bpm:138,
    variations:{
      jig:{name:'Irish Jig',emoji:'🍀',bpm:142,desc:'6/8 jig — bouncy and energetic Celtic dance',
        percussion:{'Cajon':[1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1],'Congas':[0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,0]},
        melody:{instr:'Violin',scale:'celtic',pattern:[0,2,3,5,3,2,0,3,5,3,2,0,3,2,3,0]}},
      reel:{name:'Irish Reel',emoji:'🎻',bpm:155,desc:'Fast 4/4 reel — traditional Irish céilí',
        percussion:{'Cajon':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas-Hi':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Violin',scale:'celtic',pattern:[0,2,3,5,3,5,3,2,0,3,2,0,3,5,3,0]}}
    }},
  spain:{icon:'💃',name:'Spanish Flamenco',country:'Spain / Andalusia',group:'europe',tuneType:'Flamenco / Bulería',
    desc:'Passionate flamenco — Cajon Palmas, Guitar Rasgueado, Violin, intense Bulería rhythm.',
    instruments:['Cajon','Guitar','Violin'],
    scale:'flamenco', bpm:125,
    variations:{
      bulerias:{name:'Bulería',emoji:'💃',bpm:130,desc:'Fastest flamenco form — intense and fiery',
        percussion:{'Cajon':[1,0,1,0,0,1,0,1,0,1,0,0,1,0,1,0],'Congas-Hi':[0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0]},
        melody:{instr:'Guitar',scale:'flamenco',pattern:[0,1,3,4,3,1,0,1,3,4,5,4,3,1,0,3]}},
      solea:{name:'Soleá',emoji:'🌹',bpm:88,desc:'Soulful foundational flamenco — deep and expressive',
        percussion:{'Cajon':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Congas':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Violin',scale:'flamenco',pattern:[0,1,3,4,3,1,3,4,3,1,0,3,1,0,1,0]}}
    }},
  russia:{icon:'❄️',name:'Russian Folk',country:'Russia / Eastern Europe',group:'europe',tuneType:'Barynya / Kalinka',
    desc:'Russian folk dances — Balalaika-style melody, Accordion, fast Barynya dance rhythms.',
    instruments:['Accordion','Violin','Cajon'],
    scale:'minor', bpm:122,
    variations:{
      barynya:{name:'Barynya Dance',emoji:'❄️',bpm:128,desc:'Fast Russian folk dance — energetic and proud',
        percussion:{'Cajon':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Congas-Hi':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]},
        melody:{instr:'Accordion',scale:'minor',pattern:[0,2,3,5,3,2,3,5,4,3,2,0,2,3,2,0]}}
    }},
  greece:{icon:'🏛️',name:'Greek Rebetiko',country:'Greece',group:'europe',tuneType:'Rebetiko / Sirtaki',
    desc:'Greek blues — Bouzouki-style melody, Darabouka, melancholic Rebetiko and festive Sirtaki.',
    instruments:['Oud','Darabouka','Violin'],
    scale:'dorian', bpm:98,
    variations:{
      rebetiko:{name:'Rebetiko Blues',emoji:'🏛️',bpm:92,desc:'Emotional Greek underground music',
        percussion:{'Darabouka':[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],'Congas':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]},
        melody:{instr:'Oud',scale:'dorian',pattern:[0,2,3,5,3,2,3,5,3,2,0,2,3,5,3,0]}},
      sirtaki:{name:'Sirtaki Dance',emoji:'💃',bpm:115,desc:'Famous Greek line dance — slow to fast',
        percussion:{'Darabouka':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Congas-Hi':[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]},
        melody:{instr:'Violin',scale:'dorian',pattern:[0,2,3,5,3,5,3,2,0,3,2,0,3,5,3,0]}}
    }},
  // AMERICAS
  usa:{icon:'🎸',name:'American Blues / Jazz',country:'USA',group:'americas',tuneType:'Delta Blues / Jazz',
    desc:'Foundation of modern music — Blues scale, Jazz swing, Piano and Guitar improvisation.',
    instruments:['Guitar','Piano','Trumpet','Cajon'],
    scale:'blues', bpm:95,
    variations:{
      blues:{name:'Delta Blues',emoji:'🎸',bpm:88,desc:'Raw Mississippi Delta blues — Guitar, Bass',
        percussion:{'Cajon':[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],'Congas':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Guitar',scale:'blues',pattern:[0,2,3,4,3,2,4,3,2,3,4,3,2,0,3,0]}},
      jazz:{name:'Swing Jazz',emoji:'🎺',bpm:105,desc:'New Orleans swing — Trumpet and Piano',
        percussion:{'Cajon':[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0],'Congas':[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]},
        melody:{instr:'Trumpet',scale:'blues',pattern:[0,2,3,4,3,2,4,3,4,2,3,4,3,2,0,2]}}
    }},
  andes:{icon:'🏔️',name:'Andean Music',country:'Peru / Bolivia / Ecuador',group:'americas',tuneType:'Huayno / Siku',
    desc:'Haunting music of the Andes — Pan Flute (Siku), Charango, pentatonic melodies.',
    instruments:['Pan Flute','Cajon','Congas'],
    scale:'pentatonic', bpm:88,
    variations:{
      huayno:{name:'Huayno',emoji:'🏔️',bpm:90,desc:'Traditional Andean highland dance — pentatonic',
        percussion:{'Cajon':[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],'Congas':[0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1]},
        melody:{instr:'Pan Flute',scale:'pentatonic',pattern:[0,2,3,5,3,2,5,3,2,3,5,3,2,0,3,0]}}
    }},
};

// ── STATE ──
const STEPS=16;let bpm=120,isPlaying=false,currentStep=0,intervalId=null;
let grid=emptyGrid(),currentRegionKey=null,currentVariation=null,currentRegionType=null;
let savedPatterns=[],currentWorld='eastern';
let learnMode=false,learnStepIndex=0,learnStepsList=[];
try{savedPatterns=JSON.parse(localStorage.getItem('bf9_patterns')||'[]');}catch(e){}

// ── DARK MODE ──
function initDarkMode(){const s=localStorage.getItem('bf9_theme')||'light';document.documentElement.setAttribute('data-theme',s);const b=document.getElementById('darkToggle');if(b)b.textContent=s==='dark'?'☀️':'🌙';}
const dkBtn=document.getElementById('darkToggle');
if(dkBtn)dkBtn.addEventListener('click',()=>{const c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);dkBtn.textContent=n==='dark'?'☀️':'🌙';localStorage.setItem('bf9_theme',n);});

// ── VISUALIZER ──
const canvas=document.getElementById('visualizer');
const canvasCtx=canvas?canvas.getContext('2d'):null;
const vizLabel=document.getElementById('vizLabel');
let vizRunning=false;
function drawVisualizer(){if(!vizRunning||!canvasCtx)return;requestAnimationFrame(drawVisualizer);const W=canvas.width,H=canvas.height;const d=new Uint8Array(analyser.frequencyBinCount);analyser.getByteFrequencyData(d);const isDark=document.documentElement.getAttribute('data-theme')==='dark';canvasCtx.fillStyle=isDark?'#1a1916':'#ffffff';canvasCtx.fillRect(0,0,W,H);const bw=W/d.length*2.8;let x=0;for(let i=0;i<d.length;i++){const bh=(d[i]/255)*H;canvasCtx.fillStyle=`hsl(${180+i*0.9},75%,${isDark?60:50}%)`;canvasCtx.fillRect(x,H-bh,bw-1,bh);x+=bw;}}
function startVisualizer(){if(!canvas)return;if(vizLabel)vizLabel.style.display='none';vizRunning=true;canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;drawVisualizer();}
function stopVisualizer(){vizRunning=false;if(vizLabel)vizLabel.style.display='flex';if(canvasCtx&&canvas)canvasCtx.clearRect(0,0,canvas.width,canvas.height);}

// ── TOOLTIP ──
const INSTR_INFO={
  'Kick':{name:'Kick Drum',origin:'Universal',desc:'Deep bass drum. Sine wave drops 175Hz→38Hz.',tip:'Kick on beats 1&3 is classic.'},
  'Snare':{name:'Snare',origin:'Western',desc:'Triangle wave + highpass noise rattle.',tip:'Snare on 2&4 defines the backbeat.'},
  'Hi-Hat':{name:'Hi-Hat',origin:'Western',desc:'Highpass noise at 9500Hz.',tip:'Fast hi-hats double perceived tempo.'},
  'Open-Hat':{name:'Open Hi-Hat',origin:'Western',desc:'Longer sustain hi-hat.',tip:'Use at phrase endings.'},
  '808 Bass':{name:'808 Bass',origin:'Western',desc:'Roland TR-808 inspired sub-bass.',tip:'Defined hip-hop and trap.'},
  'Piano':{name:'Piano',origin:'Western',desc:'6 harmonic partials with hammer transient.',tip:'88 keys, 7+ octaves.'},
  'Trumpet':{name:'Trumpet',origin:'Western',desc:'Sawtooth with lip-attack + bandpass filter.',tip:'Jazz uses blue notes and vibrato.'},
  'Violin':{name:'Violin',origin:'Western',desc:'4 sawtooth harmonics with vibrato LFO.',tip:'Fastest bowed instrument.'},
  'Guitar':{name:'Acoustic Guitar',origin:'Western',desc:'5 triangle harmonics, natural decay.',tip:'Nylon strings = classical; steel = folk.'},
  'Marimba':{name:'Marimba',origin:'Africa/Latin',desc:'Sine harmonics with mallet attack.',tip:'African origin, adopted worldwide.'},
  'Tabla-Na':{name:'Tabla (Na)',origin:'North India',desc:'High crisp bol. Pitch drops from 630Hz.',tip:'Central to Hindustani music.'},
  'Tabla-Ge':{name:'Tabla (Ge)',origin:'North India',desc:'Bass bol on metal bayan drum.',tip:'Unique sliding bass pitch.'},
  'Dhol':{name:'Dhol',origin:'Punjab',desc:'Cylindrical drum. Bass sine 92Hz→40Hz.',tip:'Backbone of Bhangra.'},
  'Dhol-Hi':{name:'Dhol (High)',origin:'Punjab',desc:'Treble side — triangle + highpass noise.',tip:'Both sides create signature patterns.'},
  'Dholak':{name:'Dholak',origin:'South Asia',desc:'Barrel drum. Sine 162Hz→72Hz.',tip:'Gives Bollywood its warmth.'},
  'Sitar':{name:'Sitar',origin:'North India',desc:'6 harmonics with jawari micro-flutter.',tip:'18-21 strings, 7 played.'},
  'Bansuri':{name:'Bansuri',origin:'India',desc:'Bamboo flute with breath noise and meend.',tip:'Associated with Lord Krishna.'},
  'Sarangi':{name:'Sarangi',origin:'North India',desc:'Bowed string, 4 harmonics, 6.5Hz vibrato.',tip:'Follows the human voice in ragas.'},
  'Tanpura':{name:'Tanpura',origin:'India',desc:'4-string drone, 4 harmonics per string.',tip:'Always open strings only.'},
  'Shehnai':{name:'Shehnai',origin:'North India',desc:'Conical double-reed with bandpass filter.',tip:'Ustad Bismillah Khan made it famous.'},
  'Veena':{name:'Veena',origin:'South India',desc:'5 triangle harmonics, brighter than sitar.',tip:'1500+ years old.'},
  'Harmonium':{name:'Harmonium',origin:'North India',desc:'Pumped reed organ — square+sawtooth.',tip:'Introduced by French missionaries.'},
  'Mridag.R':{name:'Mridangam (R)',origin:'South India',desc:'Right valanthalai — crisp 458Hz→308Hz.',tip:'Primary Carnatic percussion.'},
  'Mridag.L':{name:'Mridangam (L)',origin:'South India',desc:'Left thoppi smeared with semolina.',tip:'Creates complex tala patterns.'},
  'Khol-Hi':{name:'Khol (High)',origin:'Bengal',desc:'Bengali clay drum high side.',tip:'Sacred in kirtan tradition.'},
  'Khol-Lo':{name:'Khol (Low)',origin:'Bengal',desc:'Deep resonant palm stroke.',tip:'Core to Rabindra Sangeet.'},
  'Esraj':{name:'Esraj',origin:'Bengal/Punjab',desc:'Bowed string between sarangi and violin.',tip:'Unique to Bengali and Sikh music.'},
  'Nadhasw.':{name:'Nadhaswaram',origin:'Tamil Nadu',desc:'Double-reed oboe. Nasal, ceremonial.',tip:'Played at Hindu weddings.'},
  'Tungi':{name:'Tungi',origin:'Odisha',desc:'Odia tribal drum. Sine 198Hz→83Hz.',tip:'Central to Sambalpuri folk.'},
  'Mahuri':{name:'Mahuri',origin:'Odisha',desc:'Odia double-reed wind instrument.',tip:'Ceremonial wind of Odisha temples.'},
  'Nagara':{name:'Nagara',origin:'Rajasthan/Bihar',desc:'Large kettledrum. Sine 78Hz→33Hz.',tip:'Used in Mughal courts.'},
  'Kanjira':{name:'Kanjira',origin:'South India',desc:'Frame drum with jingles.',tip:'Complex rhythmic patterns.'},
  'Dumru':{name:'Dumru',origin:'India',desc:'Two-headed hourglass drum of Shiva.',tip:'Symbol of cosmic rhythm.'},
  'Oud':{name:'Oud',origin:'Middle East',desc:'Plucked lute. 4 sawtooth harmonics.',tip:'Father of the guitar.'},
  'Kora':{name:'Kora',origin:'West Africa',desc:'21-string harp-lute. Triangle harmonics.',tip:'West African classical instrument.'},
  'Erhu':{name:'Erhu',origin:'China',desc:'Two-string bowed lute with fast vibrato.',tip:'Called the "Chinese violin".'},
  'Koto':{name:'Koto',origin:'Japan',desc:'13-string zither. Triangle harmonics.',tip:'National instrument of Japan.'},
  'Accordion':{name:'Accordion',origin:'Europe',desc:'Bellows-driven reed organ. Square waves.',tip:'From 1820s Vienna, now worldwide.'},
  'Bagpipe':{name:'Bagpipe',origin:'Scotland/Ireland',desc:'Chanter melody + constant drone.',tip:'Scotland\'s national instrument.'},
  'Pan Flute':{name:'Pan Flute',origin:'Andes/Eastern Europe',desc:'Sine + breath noise blend.',tip:'Ancient instrument — 6000+ years old.'},
  'Djembe':{name:'Djembe',origin:'West Africa',desc:'Goblet drum. Sine 200Hz→85Hz.',tip:'Means "gather in peace".'},
  'Darabouka':{name:'Darabouka',origin:'Middle East',desc:'Goblet drum. 320Hz→140Hz.',tip:'Core of Arabic rhythm.'},
  'Cajon':{name:'Cajón',origin:'Peru/Spain',desc:'Box drum — bass+snare combined.',tip:'Invented by African slaves in Peru.'},
  'Taiko':{name:'Taiko',origin:'Japan',desc:'Japanese barrel drum. Sine 95Hz→42Hz.',tip:'Used in ceremonies for 2000+ years.'},
  'Congas':{name:'Congas',origin:'Cuba/Africa',desc:'Tall Afro-Cuban drum. Bass voice.',tip:'Core of salsa and rumba.'},
  'Congas-Hi':{name:'Congas (High)',origin:'Cuba/Africa',desc:'High congas — faster attack.',tip:'Dialogue with bass conga.'},
};
function showTooltip(n,el){const i=INSTR_INFO[n];if(!i)return;const tt=document.getElementById('instrTooltip');if(!tt)return;document.getElementById('ttName').textContent=i.name;document.getElementById('ttOrigin').textContent='📍 '+i.origin;document.getElementById('ttDesc').textContent=i.desc;document.getElementById('ttTip').textContent='💡 '+i.tip;tt.style.display='block';const r=el.getBoundingClientRect();tt.style.left=Math.min(r.right+8,window.innerWidth-260)+'px';tt.style.top=Math.max(r.top-20,8)+'px';}
function hideTooltip(){const tt=document.getElementById('instrTooltip');if(tt)tt.style.display='none';}
document.addEventListener('click',e=>{if(!e.target.classList.contains('track-label'))hideTooltip();});

// ── WAV DURATION ──
let selectedDuration = 3;
function setDuration(mins) {
  selectedDuration = mins;
  document.getElementById('wavDuration').value = mins;
  document.querySelectorAll('.wav-dur-btn').forEach(b => b.classList.toggle('active', parseFloat(b.textContent) === mins));
}
document.getElementById('wavDuration').addEventListener('change', function() {
  selectedDuration = Math.max(2, parseFloat(this.value) || 3);
  this.value = selectedDuration;
  document.querySelectorAll('.wav-dur-btn').forEach(b => b.classList.remove('active'));
});
// Set default active
setTimeout(() => { document.querySelectorAll('.wav-dur-btn')[1]?.classList.add('active'); }, 100);

// ── REGION RENDERING ──
function showIndianGroup(group, btn) {
  document.querySelectorAll('#regional-indian .rgt-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderRegionGrid('indian', group);
}
function showWorldGroup(group, btn) {
  document.querySelectorAll('#regional-world .rgt-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderRegionGrid('world', group);
}

function renderRegionGrid(type, group) {
  const regions = type === 'indian' ? INDIAN_REGIONS : WORLD_REGIONS;
  const gridEl = document.getElementById(type === 'indian' ? 'indianGrid' : 'worldGrid');
  const filtered = Object.entries(regions).filter(([k, r]) => r.group === group);
  gridEl.innerHTML = filtered.map(([key, r]) => `
    <div class="region-card" data-key="${key}" data-type="${type}" onclick="openRegionModal('${key}','${type}')">
      <div class="rc-top">
        <div class="rc-icon">${r.icon}</div>
        <span class="rc-type">${r.tuneType}</span>
      </div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-region">📍 ${r.state || r.country}</div>
      <div class="rc-desc">${r.desc}</div>
      <div class="rc-instruments">🎵 ${r.instruments.slice(0,4).join(' · ')}</div>
      <button class="rc-btn">Load Beat →</button>
    </div>
  `).join('') || '<div style="color:var(--text-muted);padding:20px;grid-column:1/-1">No regions in this group.</div>';
}

// ── REGION MODAL ──
function openRegionModal(key, type) {
  const regions = type === 'indian' ? INDIAN_REGIONS : WORLD_REGIONS;
  const r = regions[key]; if (!r) return;
  document.getElementById('modalRegionIcon').textContent = r.icon;
  document.getElementById('modalRegionName').textContent = r.name;
  document.getElementById('modalRegionSub').textContent = '📍 ' + (r.state || r.country) + ' · ' + r.tuneType;
  document.getElementById('modalRegionDesc').textContent = r.desc;
  document.getElementById('modalInstruments').innerHTML = r.instruments.map(i => `<span class="modal-instr-tag">${i}</span>`).join('');
  const container = document.getElementById('modalVariations'); container.innerHTML = '';
  let firstKey = null;
  Object.entries(r.variations).forEach(([vKey, v], idx) => {
    if (!firstKey) firstKey = vKey;
    const btn = document.createElement('button');
    btn.className = 'modal-mood-btn';
    btn.innerHTML = `<span class="mmb-emoji">${v.emoji}</span><div class="mmb-info"><div class="mmb-name">${v.name}</div><div class="mmb-desc">${v.desc}</div></div><span class="mmb-bpm">${v.bpm} BPM</span>`;
    btn.addEventListener('click', () => { container.querySelectorAll('.modal-mood-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); });
    if (idx === 0) btn.classList.add('selected');
    container.appendChild(btn);
  });
  const loadBtn = document.createElement('button'); loadBtn.className = 'modal-load-btn';
  loadBtn.textContent = 'Load This Beat & Open Studio →';
  loadBtn.addEventListener('click', () => {
    const selectedBtn = container.querySelector('.modal-mood-btn.selected');
    const varKeys = Object.keys(r.variations);
    const varIdx = Array.from(container.querySelectorAll('.modal-mood-btn')).indexOf(selectedBtn);
    const vKey = varKeys[varIdx >= 0 ? varIdx : 0];
    loadRegionBeat(key, vKey, type);
    document.getElementById('regionModal').style.display = 'none';
  });
  container.appendChild(loadBtn);
  document.getElementById('regionModal').style.display = 'flex';
}
function closeRegionModal(e) { if (e.target === document.getElementById('regionModal') || e.target.classList.contains('modal-close')) document.getElementById('regionModal').style.display = 'none'; }

// ── LOAD REGION BEAT ──
function loadRegionBeat(regionKey, variationKey, type) {
  const regions = type === 'indian' ? INDIAN_REGIONS : WORLD_REGIONS;
  const r = regions[regionKey]; if (!r) return;
  const v = r.variations[variationKey]; if (!v) return;
  currentRegionKey = regionKey; currentVariation = variationKey; currentRegionType = type;

  // Build grid from percussion patterns
  grid = emptyGrid();
  Object.entries(v.percussion).forEach(([track, pat]) => { if (grid[track] !== undefined) grid[track] = pat.map(x=>!!x); });

  // Build melodic pattern into appropriate track
  if (v.melody) {
    const scale = SCALES[r.scale] || SCALES.pentatonic;
    const melTrack = v.melody.instr;
    if (grid[melTrack] !== undefined) {
      // Convert note indices to boolean active steps (non-rest = active)
      grid[melTrack] = v.melody.pattern.map(n => n >= 0);
    }
  }

  document.getElementById('bpm').value = v.bpm; bpm = v.bpm;

  // Choose world view
  const hasEastern = r.instruments.some(i => TRACKS.find(t=>t.label===i&&t.world==='eastern'));
  const world = hasEastern ? 'eastern' : 'western';
  document.querySelectorAll('.world-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(world==='western'?'tabWestern':'tabEastern').classList.add('active');
  currentWorld = world;
  renderGrid(world);

  // Badge
  document.getElementById('activeGenreRow').style.display = 'flex';
  document.getElementById('activeGenreBadge').textContent = r.icon + ' ' + r.name;
  document.getElementById('activeMoodBadge').textContent = v.emoji + ' ' + v.name;
  document.getElementById('activeGenreDesc').textContent = v.desc + ' · ' + v.bpm + ' BPM';
  document.getElementById('patternName').placeholder = 'My ' + v.name;

  // Highlight card
  document.querySelectorAll('.region-card').forEach(c=>c.classList.remove('selected'));
  const card = document.querySelector(`.region-card[data-key="${regionKey}"]`);
  if (card) card.classList.add('selected');

  if (isPlaying) restartPlayback();
  setStatus('', r.icon + ' ' + v.name + ' loaded! Hit ▶ Play to hear it.');
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}

// ── GRID RENDER ──
function showWorld(world){currentWorld=world;document.querySelectorAll('.world-tab').forEach(t=>t.classList.remove('active'));const ids={western:'tabWestern',eastern:'tabEastern',both:'tabBoth'};document.getElementById(ids[world]).classList.add('active');renderGrid(world);}
function renderGrid(world){
  const w=world||currentWorld||'eastern';
  const gridEl=document.getElementById('grid');gridEl.innerHTML='';
  const sections=[];
  if(w==='western'||w==='both')sections.push({label:'🎸 Western / World Instruments',tracks:TRACKS.filter(t=>t.world==='western')});
  if(w==='eastern'||w==='both')sections.push({label:'🪘 Eastern / Regional Instruments',tracks:TRACKS.filter(t=>t.world==='eastern')});
  sections.forEach(sec=>{
    const section=document.createElement('div');section.className='track-section';
    const hdr=document.createElement('div');hdr.className='track-section-header';hdr.textContent=sec.label;
    section.appendChild(hdr);
    sec.tracks.forEach(track=>{
      const row=document.createElement('div');row.className='track-row';
      const label=document.createElement('span');label.className='track-label';
      label.textContent=track.label;label.style.borderLeft=`3px solid ${track.color}`;
      label.addEventListener('mouseenter',e=>showTooltip(track.name,e.target));
      label.addEventListener('mouseleave',hideTooltip);
      row.appendChild(label);
      const stepsRow=document.createElement('div');stepsRow.className='steps-row';
      for(let i=0;i<STEPS;i++){
        const btn=document.createElement('button');
        const active=grid[track.name]&&grid[track.name][i];
        btn.className='step-btn'+(active?' active':'');
        btn.dataset.track=track.name;btn.dataset.step=i;
        if(active)btn.style.background=track.color;
        btn.addEventListener('click',()=>{
          if(!grid[track.name])grid[track.name]=Array(STEPS).fill(false);
          grid[track.name][i]=!grid[track.name][i];
          btn.classList.toggle('active',grid[track.name][i]);
          btn.style.background=grid[track.name][i]?track.color:'';
        });
        stepsRow.appendChild(btn);
      }
      row.appendChild(stepsRow);
      const vw=document.createElement('div');vw.className='vol-slider-wrap';
      const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=1;sl.step=0.05;
      sl.value=trackVolumes[track.name]||1;sl.className='vol-slider';
      sl.addEventListener('input',()=>{trackVolumes[track.name]=parseFloat(sl.value);});
      vw.appendChild(sl);row.appendChild(vw);
      section.appendChild(row);
    });
    gridEl.appendChild(section);
  });
}

// ── SEARCH ──
function handleSearch(query) {
  const q = query.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClear');
  const resultsBox = document.getElementById('searchResults');
  if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';
  if (!q) { if (resultsBox) resultsBox.style.display = 'none'; return; }
  const results = [];
  // Search Indian regions
  Object.entries(INDIAN_REGIONS).forEach(([key, r]) => {
    if (r.name.toLowerCase().includes(q) || r.state.toLowerCase().includes(q) || r.tuneType.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.instruments.some(i=>i.toLowerCase().includes(q)))
      results.push({ icon:r.icon, name:r.name, meta:'🇮🇳 '+r.state, type:'indian', key, vKey:null });
    Object.entries(r.variations).forEach(([vk,v])=>{
      if(v.name.toLowerCase().includes(q)||v.desc.toLowerCase().includes(q))
        results.push({ icon:v.emoji, name:v.name, meta:r.icon+' '+r.name+' · '+v.bpm+' BPM', type:'indian', key, vKey:vk });
    });
  });
  // Search World regions
  Object.entries(WORLD_REGIONS).forEach(([key, r]) => {
    if (r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q) || r.tuneType.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.instruments.some(i=>i.toLowerCase().includes(q)))
      results.push({ icon:r.icon, name:r.name, meta:'🌍 '+r.country, type:'world', key, vKey:null });
    Object.entries(r.variations).forEach(([vk,v])=>{
      if(v.name.toLowerCase().includes(q)||v.desc.toLowerCase().includes(q))
        results.push({ icon:v.emoji, name:v.name, meta:r.icon+' '+r.name+' · '+v.bpm+' BPM', type:'world', key, vKey:vk });
    });
  });
  // Search instruments
  TRACKS.forEach(t=>{const i=INSTR_INFO[t.name];if(t.label.toLowerCase().includes(q)||(i&&i.name.toLowerCase().includes(q))||(i&&i.origin.toLowerCase().includes(q)))results.push({icon:t.world==='western'?'🎸':'🪘',name:i?i.name:t.label,meta:i?i.origin:'',type:'instrument',key:t.name,vKey:null});});
  if (!results.length) { if (resultsBox){resultsBox.innerHTML=`<div class="search-results-title">No results for "${query}"</div><div class="no-search-results">Try: "Bengal", "Bhangra", "Carnatic", "Japan", "Flamenco", "Tabla", "Djembe"...</div>`;resultsBox.style.display='block';} return; }
  const cards = results.slice(0,12).map(r=>`<div class="search-result-card" onclick="handleSearchClick('${r.type}','${r.key}','${r.vKey||''}')"><span class="src-icon">${r.icon}</span><div class="src-info"><div class="src-name">${r.name}</div><div class="src-meta">${r.meta}</div></div><span class="src-type">${r.type}</span></div>`).join('');
  if(resultsBox){resultsBox.innerHTML=`<div class="search-results-title">${results.length} result${results.length>1?'s':''} for "${query}"</div><div class="search-result-cards">${cards}</div>`;resultsBox.style.display='block';}
}
function handleSearchClick(type, key, vKey) {
  if (type==='indian'||type==='world') {
    if (vKey) { loadRegionBeat(key, vKey, type); clearSearch(); }
    else { openRegionModal(key, type); clearSearch(); }
  } else if (type==='instrument') {
    const t=TRACKS.find(t=>t.name===key);
    if(t){showWorld(t.world);document.getElementById('sequencer').scrollIntoView({behavior:'smooth'});}
    clearSearch();
  }
}
function clearSearch(){const si=document.getElementById('genreSearch');if(si)si.value='';const sc=document.getElementById('searchClear');if(sc)sc.style.display='none';const sr=document.getElementById('searchResults');if(sr)sr.style.display='none';}

// ── PLAYBACK ──
// For melodic tracks, play scale notes at each active step
function getStepSound(trackName, stepIdx, t0, ac) {
  const track = TRACKS.find(t=>t.name===trackName);
  if (!track) return;
  // Check if this is a melodic track in an active region with melody
  const regions = currentRegionType === 'indian' ? INDIAN_REGIONS : (currentRegionType === 'world' ? WORLD_REGIONS : null);
  const region = regions && currentRegionKey ? regions[currentRegionKey] : null;
  const variation = region && currentVariation ? region.variations[currentVariation] : null;

  if (variation && variation.melody && variation.melody.instr === trackName) {
    const scale = SCALES[region.scale] || SCALES.pentatonic;
    const noteIdx = variation.melody.pattern[stepIdx];
    if (noteIdx >= 0) {
      const freq = scale[noteIdx % scale.length];
      const stepDur = (60 / bpm / 4);
      // Play the instrument function with the correct frequency
      playMelodicInstrument(trackName, freq, t0, ac);
      return;
    }
  }
  // Normal percussion/instrument hit
  track.play(t0, ac);
}

function playMelodicInstrument(name, freq, t0, ac) {
  switch(name) {
    case 'Sitar': playSitar(t0,freq,ac); break;
    case 'Bansuri': playBansuri(t0,freq,ac); break;
    case 'Veena': playVeena(t0,freq,ac); break;
    case 'Shehnai': playShehnai(t0,freq,ac); break;
    case 'Harmonium': playHarmonium(t0,freq,ac); break;
    case 'Esraj': playEsraj(t0,freq,ac); break;
    case 'Sarangi': playSarangi(t0,freq,ac); break;
    case 'Nadhasw.': playNadhaswaram(t0,freq,ac); break;
    case 'Mahuri': playMahuri(t0,freq,ac); break;
    case 'Oud': playOud(t0,freq,ac); break;
    case 'Kora': playKora(t0,freq,ac); break;
    case 'Erhu': playErhu(t0,freq,ac); break;
    case 'Koto': playKoto(t0,freq,ac); break;
    case 'Accordion': playAccordion(t0,freq,ac); break;
    case 'Bagpipe': playBagpipe(t0,freq,ac); break;
    case 'Pan Flute': playPanFlute(t0,freq,ac); break;
    case 'Violin': playViolin(t0,freq,ac); break;
    case 'Guitar': playGuitarAc(t0,freq,ac); break;
    case 'Piano': playPiano(t0,freq,ac); break;
    case 'Trumpet': playTrumpet(t0,freq,ac); break;
    case 'Marimba': playMarimba(t0,freq,ac); break;
    default: { const track=TRACKS.find(t=>t.name===name); if(track)track.play(t0,ac); }
  }
}

function tick() {
  document.querySelectorAll('.step-btn').forEach(btn=>{btn.classList.toggle('current',parseInt(btn.dataset.step)===currentStep);});
  TRACKS.forEach(track=>{
    if(grid[track.name]&&grid[track.name][currentStep]&&(trackVolumes[track.name]||1)>0)
      getStepSound(track.name, currentStep, audioCtx.currentTime, null);
  });
  currentStep=(currentStep+1)%STEPS;
}
function getInterval(){return(60/bpm/4)*1000;}
function restartPlayback(){clearInterval(intervalId);bpm=parseInt(document.getElementById('bpm').value)||120;intervalId=setInterval(tick,getInterval());}

document.getElementById('playBtn').addEventListener('click',()=>{if(isPlaying)return;audioCtx.resume();isPlaying=true;bpm=parseInt(document.getElementById('bpm').value)||120;intervalId=setInterval(tick,getInterval());document.getElementById('playBtn').classList.add('active');startVisualizer();setStatus('playing','▶ Playing');});
document.getElementById('stopBtn').addEventListener('click',()=>{if(!isPlaying)return;isPlaying=false;clearInterval(intervalId);currentStep=0;document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('current'));document.getElementById('playBtn').classList.remove('active');stopVisualizer();setStatus('','Stopped');});
document.getElementById('clearBtn').addEventListener('click',()=>{grid=emptyGrid();document.querySelectorAll('.step-btn').forEach(b=>{b.classList.remove('active','current');b.style.background='';});setStatus('','Grid cleared');});
document.getElementById('bpmUp').addEventListener('click',()=>{const i=document.getElementById('bpm');i.value=Math.min(240,parseInt(i.value)+5);if(isPlaying)restartPlayback();});
document.getElementById('bpmDown').addEventListener('click',()=>{const i=document.getElementById('bpm');i.value=Math.max(40,parseInt(i.value)-5);if(isPlaying)restartPlayback();});
document.getElementById('bpm').addEventListener('change',()=>{if(isPlaying)restartPlayback();});

// ── SAVE/GALLERY ──
document.getElementById('saveBtn').addEventListener('click',()=>{
  const regions=currentRegionType==='indian'?INDIAN_REGIONS:currentRegionType==='world'?WORLD_REGIONS:null;
  const region=regions&&currentRegionKey?regions[currentRegionKey]:null;
  const variation=region&&currentVariation?region.variations[currentVariation]:null;
  const name=document.getElementById('patternName').value.trim()||(variation?'My '+variation.name:'Pattern '+(savedPatterns.length+1));
  const pattern={id:Date.now(),name,bpm:parseInt(document.getElementById('bpm').value),regionKey:currentRegionKey,regionType:currentRegionType,regionIcon:region?.icon,regionName:region?.name,variationName:variation?.name,variationEmoji:variation?.emoji,grid:JSON.parse(JSON.stringify(grid)),likes:0,createdAt:new Date().toLocaleString()};
  savedPatterns.unshift(pattern);
  try{localStorage.setItem('bf9_patterns',JSON.stringify(savedPatterns));}catch(e){}
  renderGallery();document.getElementById('patternName').value='';setStatus('saved',`💾 "${name}" saved!`);
});
function loadPattern(p){document.getElementById('bpm').value=p.bpm;bpm=p.bpm;grid=p.grid||emptyGrid();currentRegionKey=p.regionKey||null;currentVariation=null;currentRegionType=p.regionType||null;renderGrid(currentWorld);if(isPlaying)restartPlayback();setStatus('',`📂 Loaded "${p.name}"`);document.getElementById('sequencer').scrollIntoView({behavior:'smooth'});}
function deletePattern(id){savedPatterns=savedPatterns.filter(p=>p.id!==id);try{localStorage.setItem('bf9_patterns',JSON.stringify(savedPatterns));}catch(e){}renderGallery();}
function likePattern(id){const p=savedPatterns.find(p=>p.id===id);if(!p)return;p.likes=(p.likes||0)+1;try{localStorage.setItem('bf9_patterns',JSON.stringify(savedPatterns));}catch(e){}renderGallery();}
function sharePattern(id){const p=savedPatterns.find(p=>p.id===id);if(!p)return;const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(p))));const url=window.location.origin+window.location.pathname+'?pattern='+encoded;if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>setStatus('saved','🔗 Link copied!'));}else{prompt('Copy:',url);}}
function renderGallery(){const c=document.getElementById('galleryGrid');if(!savedPatterns.length){c.innerHTML='<div class="no-gallery">No saved patterns yet. Pick a region and save your beat!</div>';return;}c.innerHTML=savedPatterns.map(p=>{const ft=TRACKS.find(t=>p.grid&&p.grid[t.name]&&p.grid[t.name].some(v=>v));const ms=ft?(p.grid[ft.name]||Array(16).fill(false)):Array(16).fill(false);const mh=ms.map((v,i)=>`<div class="gc-step${v?' on':''}" style="${v?'background:'+(ft&&ft.color||'#e8521a'):''}"></div>`).join('');return`<div class="gallery-card"><div class="gc-name">${p.name}</div><div class="gc-tags">${p.regionIcon?`<span class="gc-tag">${p.regionIcon} ${p.regionName}</span>`:''} ${p.variationEmoji?`<span class="gc-tag">${p.variationEmoji} ${p.variationName}</span>`:''}</div><div class="gc-mini-grid">${mh}</div><div class="gc-meta">${p.bpm} BPM · ${p.createdAt}</div><div class="gc-actions"><button class="gc-btn" onclick='loadPattern(${JSON.stringify(p)})'>📂</button><button class="gc-btn" onclick="sharePattern(${p.id})">🔗</button><button class="gc-btn delete" onclick="deletePattern(${p.id})">✕</button><button class="gc-like${(p.likes||0)>0?' liked':''}" onclick="likePattern(${p.id})">♥ ${p.likes||0}</button></div></div>`;}).join('');}

// ── LEARN MODE ──
function buildLearnSteps(){const s=[];const at=TRACKS.filter(t=>grid[t.name]&&grid[t.name].some(v=>v));if(!at.length){s.push({text:'No steps active. Pick a region to load a beat!',track:null,stepIdx:null});return s;}s.push({text:`This beat has ${at.length} active tracks. Let's explore each!`,track:null,stepIdx:null});const regions=currentRegionType==='indian'?INDIAN_REGIONS:currentRegionType==='world'?WORLD_REGIONS:null;const region=regions&&currentRegionKey?regions[currentRegionKey]:null;if(region)s.push({text:`Style: ${region.name} (${region.state||region.country}). ${region.desc}`,track:null,stepIdx:null});at.forEach(track=>{const ai=grid[track.name].map((v,i)=>v?i+1:null).filter(Boolean);const info=INSTR_INFO[track.name];s.push({text:`${track.label}: hits on steps ${ai.join(', ')}. ${info?info.desc:''}`,track:track.name,stepIdx:null});ai.forEach(si=>{s.push({text:`Step ${si} → ${track.label}. ${info?'Tip: '+info.tip:''}`,track:track.name,stepIdx:si-1});});});s.push({text:'Great! Now try modifying steps to personalise this regional beat.',track:null,stepIdx:null});return s;}
function enterLearnMode(){learnMode=true;learnStepIndex=0;learnStepsList=buildLearnSteps();document.getElementById('learnPanel').style.display='block';document.getElementById('learnBtn').classList.add('active');const regions=currentRegionType==='indian'?INDIAN_REGIONS:currentRegionType==='world'?WORLD_REGIONS:null;const region=regions&&currentRegionKey?regions[currentRegionKey]:null;document.getElementById('learnTitle').textContent=region?'Learning: '+region.name:'Learn This Beat';document.getElementById('learnSubtitle').textContent=region?region.tuneType:'Follow the steps';renderLearnSteps();updateLearnStep();}
function exitLearnMode(){learnMode=false;document.getElementById('learnPanel').style.display='none';document.getElementById('learnBtn').classList.remove('active');document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('learn-highlight'));}
function renderLearnSteps(){const c=document.getElementById('learnSteps');c.innerHTML='';learnStepsList.forEach((s,i)=>{const d=document.createElement('div');d.className='learn-step'+(i===learnStepIndex?' active':i<learnStepIndex?' done':'');d.textContent=(i<learnStepIndex?'✓ ':'')+(i===learnStepIndex?'▶ ':'')+s.text;c.appendChild(d);});const a=c.querySelector('.learn-step.active');if(a)a.scrollIntoView({block:'nearest'});}
function updateLearnStep(){const s=learnStepsList[learnStepIndex];if(!s)return;document.getElementById('learnProgress').textContent=`${learnStepIndex+1} / ${learnStepsList.length}`;document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('learn-highlight'));if(s.track&&s.stepIdx!==null)document.querySelectorAll(`.step-btn[data-track="${s.track}"][data-step="${s.stepIdx}"]`).forEach(b=>b.classList.add('learn-highlight'));else if(s.track)document.querySelectorAll(`.step-btn[data-track="${s.track}"]`).forEach(b=>b.classList.add('learn-highlight'));document.getElementById('learnTip').textContent=s.text;renderLearnSteps();}
function learnNext(){if(learnStepIndex<learnStepsList.length-1){learnStepIndex++;updateLearnStep();}}
function learnPrev(){if(learnStepIndex>0){learnStepIndex--;updateLearnStep();}}
const lBtn=document.getElementById('learnBtn');if(lBtn)lBtn.addEventListener('click',()=>{if(learnMode)exitLearnMode();else enterLearnMode();});

// ── WAV DOWNLOAD — UNLIMITED DURATION ──
document.getElementById('downloadBtn').addEventListener('click', async () => {
  const durationMins = Math.max(2, selectedDuration);
  const TARGET = durationMins * 60;
  const btn = document.getElementById('downloadBtn');
  btn.textContent = '⏳ Rendering...'; btn.disabled = true;
  setStatus('', `⏳ Rendering ${durationMins.toFixed(1)} min WAV — please wait...`);

  // Small delay so UI updates before heavy work
  await new Promise(r => setTimeout(r, 80));

  try {
    const SR = 44100;
    const stepDur = 60 / bpm / 4;
    const loopDur = STEPS * stepDur;
    const totalLoops = Math.ceil(TARGET / loopDur);
    const totalSamples = Math.ceil(SR * (TARGET + 2));

    const offCtx = new OfflineAudioContext(2, totalSamples, SR);

    // Master gain for offline
    const masterOff = offCtx.createGain(); masterOff.gain.value = 0.85;
    masterOff.connect(offCtx.destination);

    const regions = currentRegionType === 'indian' ? INDIAN_REGIONS : currentRegionType === 'world' ? WORLD_REGIONS : null;
    const region = regions && currentRegionKey ? regions[currentRegionKey] : null;
    const variation = region && currentVariation ? region.variations[currentVariation] : null;
    const scale = region ? (SCALES[region.scale] || SCALES.pentatonic) : SCALES.pentatonic;

    // Helper: play instrument into offline ctx routed through masterOff
    function playOffline(trackName, stepIdx, t0) {
      const track = TRACKS.find(t => t.name === trackName); if (!track) return;

      // If melodic instrument with pattern
      if (variation && variation.melody && variation.melody.instr === trackName) {
        const noteIdx = variation.melody.pattern[stepIdx];
        if (noteIdx >= 0) {
          const freq = scale[noteIdx % scale.length];
          playOfflineNote(trackName, freq, t0, offCtx, masterOff);
          return;
        } else return; // rest
      }
      // Percussion — simple approach: create a tiny buffer and play via track function
      // We wrap dest() temporarily
      playOfflinePerc(track, t0, offCtx, masterOff);
    }

    for (let loop = 0; loop < totalLoops; loop++) {
      const loopOffset = loop * loopDur;
      if (loopOffset >= TARGET) break;
      for (let step = 0; step < STEPS; step++) {
        const t0 = loopOffset + step * stepDur;
        if (t0 >= TARGET) break;
        TRACKS.forEach(track => {
          if (!grid[track.name] || !grid[track.name][step]) return;
          try { playOffline(track.name, step, t0); } catch(e) {}
        });
      }
    }

    const buf = await offCtx.startRendering();

    // Fade out last 3 seconds
    const fadeStart = Math.floor((TARGET - 3) * SR);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = fadeStart; i < d.length; i++) d[i] *= Math.max(0, 1 - (i - fadeStart) / (3 * SR));
    }

    const wav = encodeWav(buf);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const regionName = region ? region.name.replace(/\s+/g, '-') : 'BeatForge';
    const a = document.createElement('a'); a.href = url;
    a.download = `BeatForge-${regionName}-${durationMins.toFixed(1)}min.wav`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setStatus('saved', `✅ ${durationMins.toFixed(1)}-min WAV downloaded!`);
  } catch(err) {
    setStatus('', '❌ Error: ' + err.message);
    console.error(err);
  }
  btn.textContent = '⬇️ WAV Export'; btn.disabled = false;
});

// Offline percussion player — rebuilds instrument directly into offline ctx
function playOfflinePerc(track, t0, offCtx, masterNode) {
  // Map track name to a simplified offline synth
  const n = track.name;
  try {
    if (n==='Kick'||n==='808 Bass') {
      const o=offCtx.createOscillator(),g=offCtx.createGain();
      o.connect(g);g.connect(masterNode);
      o.type='sine';
      o.frequency.setValueAtTime(n==='808 Bass'?80:170,t0);
      o.frequency.exponentialRampToValueAtTime(n==='808 Bass'?30:38,t0+(n==='808 Bass'?0.9:0.5));
      g.gain.setValueAtTime(1.0,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+(n==='808 Bass'?1.0:0.5));
      o.start(t0);o.stop(t0+(n==='808 Bass'?1.0:0.55));
    } else if (n==='Snare') {
      offNoise(offCtx,masterNode,0.2,0.6,4000,'highpass',t0);
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='triangle';o.frequency.setValueAtTime(220,t0);o.frequency.exponentialRampToValueAtTime(90,t0+0.14);
      g.gain.setValueAtTime(0.5,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.2);o.start(t0);o.stop(t0+0.2);
    } else if (n==='Hi-Hat') {
      offNoise(offCtx,masterNode,0.06,0.28,9000,'highpass',t0);
    } else if (n==='Open-Hat') {
      offNoise(offCtx,masterNode,0.35,0.2,8000,'highpass',t0);
    } else if (n==='Tabla-Na'||n==='Tabla-Ge') {
      const f=n==='Tabla-Na'?420:105;
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='sine';o.frequency.setValueAtTime(f*1.4,t0);o.frequency.exponentialRampToValueAtTime(f*0.6,t0+0.18);
      g.gain.setValueAtTime(0.8,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.28);o.start(t0);o.stop(t0+0.3);
    } else if (n==='Dhol'||n==='Dhol-Hi') {
      if(n==='Dhol'){const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);o.type='sine';o.frequency.setValueAtTime(90,t0);o.frequency.exponentialRampToValueAtTime(38,t0+0.3);g.gain.setValueAtTime(1.0,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.45);o.start(t0);o.stop(t0+0.45);}
      else offNoise(offCtx,masterNode,0.1,0.4,3500,'highpass',t0);
    } else if (n==='Dholak') {
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='sine';o.frequency.setValueAtTime(160,t0);o.frequency.exponentialRampToValueAtTime(70,t0+0.2);
      g.gain.setValueAtTime(0.85,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.28);o.start(t0);o.stop(t0+0.3);
    } else if (n.startsWith('Mridag')) {
      const hi=n.endsWith('R');const f=hi?450:135;
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='sine';o.frequency.setValueAtTime(f,t0);o.frequency.exponentialRampToValueAtTime(f*0.6,t0+(hi?0.1:0.25));
      g.gain.setValueAtTime(0.75,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+(hi?0.14:0.32));o.start(t0);o.stop(t0+(hi?0.15:0.35));
    } else if (n.startsWith('Khol')) {
      const hi=n.endsWith('Hi');const f=hi?310:115;
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='sine';o.frequency.setValueAtTime(f,t0);o.frequency.exponentialRampToValueAtTime(f*0.55,t0+(hi?0.1:0.28));
      g.gain.setValueAtTime(0.75,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+(hi?0.14:0.38));o.start(t0);o.stop(t0+(hi?0.15:0.4));
    } else if (n==='Djembe'||n==='Darabouka'||n==='Congas'||n==='Congas-Hi'||n==='Cajon'||n==='Taiko'||n==='Nagara'||n==='Kanjira'||n==='Tungi'||n==='Dumru') {
      const fMap={Djembe:185,Darabouka:310,Congas:175,['Congas-Hi']:280,Cajon:85,Taiko:90,Nagara:75,Kanjira:490,Tungi:195,Dumru:220};
      const dMap={Djembe:0.28,Darabouka:0.15,Congas:0.25,['Congas-Hi']:0.18,Cajon:0.42,Taiko:0.6,Nagara:0.65,Kanjira:0.1,Tungi:0.2,Dumru:0.1};
      const f=fMap[n]||200,d=dMap[n]||0.2;
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='sine';o.frequency.setValueAtTime(f*1.4,t0);o.frequency.exponentialRampToValueAtTime(f*0.55,t0+d);
      g.gain.setValueAtTime(0.85,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);o.start(t0);o.stop(t0+d+0.02);
    } else {
      // Generic tone for any other track
      const o=offCtx.createOscillator(),g=offCtx.createGain();o.connect(g);g.connect(masterNode);
      o.type='sine';o.frequency.value=261;
      g.gain.setValueAtTime(0.4,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.3);o.start(t0);o.stop(t0+0.35);
    }
  } catch(e) {}
}

function playOfflineNote(name, freq, t0, offCtx, masterNode) {
  try {
    const melodyInstrs = ['Sitar','Bansuri','Veena','Shehnai','Harmonium','Esraj','Sarangi','Nadhasw.','Mahuri','Oud','Kora','Erhu','Koto','Accordion','Bagpipe','Pan Flute','Violin','Guitar','Piano','Trumpet','Marimba'];
    if (!melodyInstrs.includes(name)) return;
    // All melodic instruments: sawtooth/sine with harmonics
    const isBowed = ['Sarangi','Esraj','Erhu','Violin'].includes(name);
    const isWind = ['Bansuri','Shehnai','Nadhasw.','Mahuri','Pan Flute','Bagpipe'].includes(name);
    const type = isBowed ? 'sawtooth' : isWind ? 'sine' : 'triangle';
    const harmonics = isBowed ? [1,2,3] : isWind ? [1] : [1,2,3];
    const amps = isBowed ? [0.35,0.18,0.08] : isWind ? [0.5] : [0.45,0.22,0.1];
    const dur = isWind ? 0.55 : 0.7;
    harmonics.forEach((h,i) => {
      const o=offCtx.createOscillator(),g=offCtx.createGain();
      o.connect(g);g.connect(masterNode);
      o.type=type;o.frequency.value=freq*h;
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t0+dur*(1-i*0.15));
      o.start(t0);o.stop(t0+dur+0.05);
    });
  } catch(e) {}
}

function offNoise(offCtx, masterNode, dur, gain, freq, type, t0) {
  try {
    const sz=Math.ceil(offCtx.sampleRate*Math.max(dur,0.001));
    const buf=offCtx.createBuffer(1,sz,offCtx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=Math.random()*2-1;
    const src=offCtx.createBufferSource();src.buffer=buf;
    const flt=offCtx.createBiquadFilter();flt.type=type;flt.frequency.value=freq;flt.Q.value=1.5;
    const g=offCtx.createGain();
    src.connect(flt);flt.connect(g);g.connect(masterNode);
    g.gain.setValueAtTime(gain,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    src.start(t0);src.stop(t0+dur);
  } catch(e) {}
}

function encodeWav(buf) {
  const nc=buf.numberOfChannels,sr=buf.sampleRate,len=buf.length*nc*2;
  const ab=new ArrayBuffer(44+len),v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*nc*2,true);v.setUint16(32,nc*2,true);v.setUint16(34,16,true);
  ws(36,'data');v.setUint32(40,len,true);
  let off=44;
  for(let i=0;i<buf.length;i++)for(let c=0;c<nc;c++){const s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;}
  return ab;
}

function setStatus(type,text){const d=document.getElementById('statusDot'),t=document.getElementById('statusText');if(d)d.className='status-dot'+(type?' '+type:'');if(t)t.textContent=text;}
function loadFromURL(){const enc=new URLSearchParams(window.location.search).get('pattern');if(enc){try{loadPattern(JSON.parse(decodeURIComponent(escape(atob(enc)))));}catch(e){}}}

// Init
initDarkMode();
renderRegionGrid('indian', 'north');
renderRegionGrid('world', 'africa');
renderGrid('eastern');
renderGallery();
loadFromURL();
setStatus('', 'Pick a region above to load an authentic beat with melodic patterns!');