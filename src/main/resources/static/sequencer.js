// ── BeatForge v6 ──

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
analyser.connect(audioCtx.destination);

// ── INSTRUMENT FACTS ──
const INSTR_INFO = {
  'Kick':       { name:'Kick Drum',      origin:'Universal', desc:'The heartbeat of any beat. A bass drum hit using a foot pedal on a drum kit.', tip:'In music theory, the kick usually lands on beats 1 and 3.' },
  'Snare':      { name:'Snare Drum',     origin:'Western',   desc:'The crisp crack that defines the backbeat. Metal wires stretched under the drum create its buzzing sound.', tip:'Snare on beats 2 and 4 is the classic rock/pop pattern.' },
  'Hi-Hat':     { name:'Hi-Hat Cymbal',  origin:'Western',   desc:'Two cymbals on a stand played with a foot pedal or stick. Closed = short, open = long sustain.', tip:'Fast hi-hats create urgency; sparse hi-hats create space.' },
  'Open-Hat':   { name:'Open Hi-Hat',    origin:'Western',   desc:'A hi-hat left open so the sound rings out longer. Adds a washy, open texture.', tip:'Open hats at the end of phrases create anticipation.' },
  '808 Bass':   { name:'Roland 808 Bass',origin:'Western',   desc:'From the iconic Roland TR-808 drum machine (1980). Its deep sub-bass sound defined hip-hop and trap.', tip:'The 808 pitch drop is created by a sine wave with exponential frequency fall.' },
  'Guitar':     { name:'Electric Guitar',origin:'Western',   desc:'A guitar amplified electronically, often with overdrive or distortion effects for rock music.', tip:'Power chords (5th intervals) are the signature of rock guitar.' },
  'Piano':      { name:'Piano',          origin:'Western',   desc:'The "pianoforte" — invented in 1700. Hammers strike strings. Rich harmonic overtones make it versatile.', tip:'Piano has 88 keys spanning over 7 octaves.' },
  'Trumpet':    { name:'Trumpet',        origin:'Western',   desc:'A brass instrument played by buzzing lips into a mouthpiece. Bright, piercing tone used in jazz and orchestras.', tip:'The trumpet range is typically from F#3 to D6.' },
  'Strings':    { name:'String Section', origin:'Western',   desc:'Bowed string instruments (violins, violas, cellos) played together. Warm, rich and emotional.', tip:'Slow bow attacks create lush pads; fast strokes create staccato accents.' },
  'Synth':      { name:'Synthesizer',    origin:'Western',   desc:'An electronic instrument that generates sound through oscillators and filters. The foundation of electronic music.', tip:'Sawtooth waves are bright; sine waves are pure; square waves are hollow.' },
  'Tabla-Na':   { name:'Tabla (Na)',     origin:'North India', desc:'The Na bol (sound) is a high crisp stroke on the right dayan (smaller drum) using the index finger tip.', tip:'Tabla is the main percussion of Hindustani classical music, used in ragas.' },
  'Tabla-Ge':   { name:'Tabla (Ge)',     origin:'North India', desc:'The Ge/Ghe bol is a resonant bass stroke on the left bayan (larger metal drum) using the palm and fingers.', tip:'The left bayan produces a sliding bass sound unique to tabla.' },
  'Dhol':       { name:'Dhol (Bass)',    origin:'Punjab/Bengal', desc:'A large double-headed cylindrical drum. The bass side is struck with a curved beater for deep boom.', tip:'Dhol is the main instrument of Bhangra and Bengali festival music.' },
  'Dhol-Hi':    { name:'Dhol (Treble)',  origin:'Punjab/Bengal', desc:'The treble/thin side of the Dhol struck with a thin stick produces a sharp, high crack.', tip:'The interplay between both sides creates the signature Dhol pattern.' },
  'Dholak':     { name:'Dholak',         origin:'South Asia', desc:'A smaller hand-played barrel drum used widely across Indian folk and film music. Warm mid-range tone.', tip:'Dholak is tuned to a specific pitch and used in qawwali and folk songs.' },
  'Sitar':      { name:'Sitar',          origin:'North India', desc:'A plucked string instrument with sympathetic strings that create a rich buzzing sound called "jawari".', tip:'The sitar has 18-21 strings, 7 played and the rest sympathetic resonators.' },
  'Bansuri':    { name:'Bansuri Flute',  origin:'India',     desc:'A transverse bamboo flute. Breathy, pure tone with expressive microtonal bends called meend.', tip:'The bansuri is associated with Lord Krishna and is central to Hindustani music.' },
  'Mridangam':  { name:'Mridangam (R)',  origin:'South India', desc:'The right side (valanthalai) of the mridangam produces crisp high strokes for Carnatic rhythms.', tip:'Mridangam is the primary percussion of Carnatic classical music.' },
  'Mridangam-B':{ name:'Mridangam (L)',  origin:'South India', desc:'The left side (thoppi) of the mridangam produces deep bass tones. Smeared with semolina paste.', tip:'The two sides together create complex tala patterns in Carnatic music.' },
  'Sarangi':    { name:'Sarangi',        origin:'North India', desc:'A bowed string instrument with a haunting, nasal tone. Closely follows the human voice in classical music.', tip:'Sarangi has 3 main strings and 35-40 sympathetic strings for resonance.' },
  'Tanpura':    { name:'Tanpura (Drone)',origin:'India',     desc:'A 4-stringed plucked instrument played as a continuous drone to establish the tonal foundation in ragas.', tip:'The tanpura is never played melodically — only the open strings are plucked in sequence.' },
};

// ── SOUND ENGINE ──
function wire(osc, gain, dest) { osc.connect(gain); gain.connect(dest || analyser); }

function noise(dur, g, ff, ft, t0, ac) {
  const ctx = ac || audioCtx; const dest = ac ? ctx.destination : analyser;
  try {
    const sz = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i=0;i<sz;i++) d[i]=Math.random()*2-1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = ft||'bandpass'; flt.frequency.value = ff||1000; flt.Q.value = 1.5;
    const gn = ctx.createGain();
    src.connect(flt); flt.connect(gn); gn.connect(dest);
    gn.gain.setValueAtTime(g, t0); gn.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    src.start(t0); src.stop(t0+dur);
  } catch(e) {}
}

function playKick(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(160,t0);o.frequency.exponentialRampToValueAtTime(40,t0+0.07);g.gain.setValueAtTime(1.0,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);o.start(t0);o.stop(t0+0.5);noise(0.012,0.5,2800,'bandpass',t0,ac);}catch(e){}}
function playSnare(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='triangle';o.frequency.setValueAtTime(220,t0);o.frequency.exponentialRampToValueAtTime(100,t0+0.14);g.gain.setValueAtTime(0.5,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.2);o.start(t0);o.stop(t0+0.2);noise(0.2,0.65,3000,'highpass',t0,ac);}catch(e){}}
function playHihat(t0,open,ac){noise(open?0.35:0.055,0.3,9000,'highpass',t0,ac);}
function play808(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{const o=ctx.createOscillator(),g=ctx.createGain(),ws=ctx.createWaveShaper();const c=new Float32Array(256);for(let i=0;i<256;i++){const x=(i*2)/256-1;c[i]=(Math.PI+200)*x/(Math.PI+200*Math.abs(x));}ws.curve=c;o.connect(ws);ws.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(55,t0);o.frequency.exponentialRampToValueAtTime(28,t0+0.9);g.gain.setValueAtTime(0.9,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+1.0);o.start(t0);o.stop(t0+1.0);}catch(e){}}
function playSynth(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.connect(flt);flt.connect(g);g.connect(dest);o.type='sawtooth';o.frequency.value=440;flt.type='lowpass';flt.frequency.setValueAtTime(2200,t0);flt.frequency.exponentialRampToValueAtTime(300,t0+0.3);flt.Q.value=9;g.gain.setValueAtTime(0.4,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.35);o.start(t0);o.stop(t0+0.35);}catch(e){}}
function playGuitar(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),ws=ctx.createWaveShaper();const c=new Float32Array(128);for(let j=0;j<128;j++){const x=(j*2)/128-1;c[j]=x*(1+60*Math.abs(x))/(1+60*Math.abs(x)*Math.abs(x));}ws.curve=c;o.connect(ws);ws.connect(g);g.connect(dest);o.type=h===1?'sawtooth':'sine';o.frequency.setValueAtTime(196*h,t0);o.frequency.setValueAtTime(196*h*1.002,t0+0.01);const amps=[0.5,0.25,0.12,0.06];g.gain.setValueAtTime(amps[i],t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);o.start(t0);o.stop(t0+0.5);});noise(0.025,0.12,400,'lowpass',t0,ac);}catch(e){}}
function playPiano(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.value=261.63*h;const amps=[0.6,0.3,0.15,0.08,0.04],dec=[1.2,0.9,0.7,0.5,0.35];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t0+dec[i]);o.start(t0);o.stop(t0+dec[i]);});noise(0.008,0.2,5000,'bandpass',t0,ac);}catch(e){}}
function playTrumpet(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{const o=ctx.createOscillator(),flt=ctx.createBiquadFilter(),g=ctx.createGain();o.connect(flt);flt.connect(g);g.connect(dest);o.type='sawtooth';o.frequency.setValueAtTime(329*0.98,t0);o.frequency.linearRampToValueAtTime(329,t0+0.04);flt.type='bandpass';flt.frequency.value=1200;flt.Q.value=3;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.5,t0+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.32);o.start(t0);o.stop(t0+0.32);}catch(e){}}
function playStrings(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{[1,2,3].forEach((h,i)=>{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest);o.type='sawtooth';o.frequency.value=196*h;vib.frequency.value=5.5;vG.gain.value=4;vib.start(t0);vib.stop(t0+0.7);const amps=[0.3,0.15,0.07];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.07);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.7);o.start(t0);o.stop(t0+0.7);});}catch(e){}}
function playTabla(t0,v,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;const cfgs={na:{f:380,f2:760,dec:0.12,gain:0.7},ta:{f:240,f2:480,dec:0.18,gain:0.8},ge:{f:110,f2:220,dec:0.35,gain:0.9}};const c=cfgs[v]||cfgs.ta;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(c.f*1.4,t0);o.frequency.exponentialRampToValueAtTime(c.f,t0+0.03);o.frequency.exponentialRampToValueAtTime(c.f*0.7,t0+c.dec);g.gain.setValueAtTime(c.gain,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+c.dec);o.start(t0);o.stop(t0+c.dec);const o2=ctx.createOscillator(),g2=ctx.createGain();o2.connect(g2);g2.connect(dest);o2.type='sine';o2.frequency.setValueAtTime(c.f2,t0);o2.frequency.exponentialRampToValueAtTime(c.f2*0.6,t0+c.dec*0.6);g2.gain.setValueAtTime(c.gain*0.3,t0);g2.gain.exponentialRampToValueAtTime(0.0001,t0+c.dec*0.6);o2.start(t0);o2.stop(t0+c.dec*0.6);noise(0.015,0.3,1200,'bandpass',t0,ac);}catch(e){}}
function playDhol(t0,side,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{if(side==='treble'){const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='triangle';o.frequency.setValueAtTime(320,t0);o.frequency.exponentialRampToValueAtTime(180,t0+0.08);g.gain.setValueAtTime(0.7,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);o.start(t0);o.stop(t0+0.12);noise(0.06,0.35,3000,'highpass',t0,ac);}else{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(90,t0);o.frequency.exponentialRampToValueAtTime(45,t0+0.28);g.gain.setValueAtTime(1.0,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.42);o.start(t0);o.stop(t0+0.42);noise(0.02,0.25,200,'lowpass',t0,ac);}}catch(e){}}
function playSitar(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;const f=196;try{[1,2,3,4,5].forEach((h,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type=i===0?'sawtooth':'sine';o.frequency.setValueAtTime(f*h*(1+i*0.002),t0);o.frequency.setValueAtTime(f*h*(1+i*0.002)*0.998,t0+0.01);const amps=[0.45,0.25,0.15,0.08,0.04],decs=[1.2,0.9,0.65,0.4,0.25];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t0+decs[i]);o.start(t0);o.stop(t0+decs[i]);});noise(0.06,0.08,3000,'bandpass',t0,ac);noise(0.005,0.2,1800,'bandpass',t0,ac);}catch(e){}}
function playDholak(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(160,t0);o.frequency.exponentialRampToValueAtTime(75,t0+0.15);g.gain.setValueAtTime(0.8,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.22);o.start(t0);o.stop(t0+0.22);noise(0.04,0.2,500,'bandpass',t0,ac);}catch(e){}}
function playBansuri(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;const f=523;try{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(f,t0);o.frequency.linearRampToValueAtTime(f*1.005,t0+0.08);vib.frequency.value=5;vG.gain.setValueAtTime(0,t0+0.1);vG.gain.linearRampToValueAtTime(5,t0+0.2);vib.start(t0);vib.stop(t0+0.55);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.5,t0+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);o.start(t0);o.stop(t0+0.55);const sz=Math.ceil(ctx.sampleRate*0.5);const buf=ctx.createBuffer(1,sz,ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<sz;i++)d[i]=(Math.random()*2-1)*0.15;const ns=ctx.createBufferSource();ns.buffer=buf;const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=f;flt.Q.value=20;const ng=ctx.createGain();ns.connect(flt);flt.connect(ng);ng.connect(dest);ng.gain.setValueAtTime(0,t0);ng.gain.linearRampToValueAtTime(0.12,t0+0.04);ng.gain.exponentialRampToValueAtTime(0.0001,t0+0.5);ns.start(t0);ns.stop(t0+0.5);}catch(e){}}
function playMridangam(t0,side,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{if(side==='thoppi'){const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(130,t0);o.frequency.exponentialRampToValueAtTime(60,t0+0.2);g.gain.setValueAtTime(0.85,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.28);o.start(t0);o.stop(t0+0.28);noise(0.015,0.2,300,'lowpass',t0,ac);}else{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.setValueAtTime(440,t0);o.frequency.exponentialRampToValueAtTime(300,t0+0.08);g.gain.setValueAtTime(0.7,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);o.start(t0);o.stop(t0+0.12);noise(0.012,0.4,4000,'highpass',t0,ac);}}catch(e){}}
function playSarangi(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;try{[1,2,3,4].forEach((h,i)=>{const o=ctx.createOscillator(),vib=ctx.createOscillator(),vG=ctx.createGain(),g=ctx.createGain();vib.connect(vG);vG.connect(o.frequency);o.connect(g);g.connect(dest);o.type='sawtooth';o.frequency.value=261*h;vib.frequency.value=6;vG.gain.value=3;vib.start(t0);vib.stop(t0+0.55);const amps=[0.3,0.2,0.12,0.06];g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(amps[i],t0+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.55);o.start(t0);o.stop(t0+0.55);});}catch(e){}}
function playTanpura(t0,ac){const ctx=ac||audioCtx,dest=ac?ctx.destination:analyser;const freqs=[130,195,261,261];freqs.forEach((f,i)=>{const delay=i*0.07;try{[1,2,3].forEach((h,hi)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);o.type='sine';o.frequency.value=f*h;const amps=[0.3,0.12,0.06];g.gain.setValueAtTime(amps[hi],t0+delay);g.gain.exponentialRampToValueAtTime(0.0001,t0+delay+1.8);o.start(t0+delay);o.stop(t0+delay+1.8);});noise(0.05,0.06,f*4,'bandpass',t0+delay,ac);}catch(e){}});}

// ── TRACKS ──
const TRACKS = [
  {name:'Kick',       color:'#e8521a',world:'western',label:'Kick',       play:(t,ac)=>playKick(t,ac)},
  {name:'Snare',      color:'#f59e0b',world:'western',label:'Snare',      play:(t,ac)=>playSnare(t,ac)},
  {name:'Hi-Hat',     color:'#10b981',world:'western',label:'Hi-Hat',     play:(t,ac)=>playHihat(t,false,ac)},
  {name:'Open-Hat',   color:'#059669',world:'western',label:'Open Hat',   play:(t,ac)=>playHihat(t,true,ac)},
  {name:'808 Bass',   color:'#6366f1',world:'western',label:'808 Bass',   play:(t,ac)=>play808(t,ac)},
  {name:'Guitar',     color:'#dc2626',world:'western',label:'E.Guitar',   play:(t,ac)=>playGuitar(t,ac)},
  {name:'Piano',      color:'#0ea5e9',world:'western',label:'Piano',      play:(t,ac)=>playPiano(t,ac)},
  {name:'Trumpet',    color:'#d97706',world:'western',label:'Trumpet',    play:(t,ac)=>playTrumpet(t,ac)},
  {name:'Strings',    color:'#7c3aed',world:'western',label:'Strings',    play:(t,ac)=>playStrings(t,ac)},
  {name:'Synth',      color:'#ec4899',world:'western',label:'Synth',      play:(t,ac)=>playSynth(t,ac)},
  {name:'Tabla-Na',   color:'#f97316',world:'eastern',label:'Tabla(Na)',  play:(t,ac)=>playTabla(t,'na',ac)},
  {name:'Tabla-Ge',   color:'#ea580c',world:'eastern',label:'Tabla(Ge)',  play:(t,ac)=>playTabla(t,'ge',ac)},
  {name:'Dhol',       color:'#ef4444',world:'eastern',label:'Dhol Bass',  play:(t,ac)=>playDhol(t,'bass',ac)},
  {name:'Dhol-Hi',    color:'#f87171',world:'eastern',label:'Dhol High',  play:(t,ac)=>playDhol(t,'treble',ac)},
  {name:'Dholak',     color:'#14b8a6',world:'eastern',label:'Dholak',     play:(t,ac)=>playDholak(t,ac)},
  {name:'Sitar',      color:'#a855f7',world:'eastern',label:'Sitar',      play:(t,ac)=>playSitar(t,ac)},
  {name:'Bansuri',    color:'#22d3ee',world:'eastern',label:'Bansuri',    play:(t,ac)=>playBansuri(t,ac)},
  {name:'Mridangam',  color:'#84cc16',world:'eastern',label:'Mridag.R',   play:(t,ac)=>playMridangam(t,'valanthalai',ac)},
  {name:'Mridangam-B',color:'#65a30d',world:'eastern',label:'Mridag.L',   play:(t,ac)=>playMridangam(t,'thoppi',ac)},
  {name:'Sarangi',    color:'#f472b6',world:'eastern',label:'Sarangi',    play:(t,ac)=>playSarangi(t,ac)},
  {name:'Tanpura',    color:'#818cf8',world:'eastern',label:'Tanpura',    play:(t,ac)=>playTanpura(t,ac)},
];

const trackVolumes = {};
TRACKS.forEach(t => trackVolumes[t.name] = 1.0);

function emptyGrid(){const g={};TRACKS.forEach(t=>g[t.name]=Array(16).fill(false));return g;}

// ── GENRE × MOOD ──
const GENRE_MOODS = {
  rock:{name:'Rock',icon:'🤘',world:'western',desc:'Heavy drums, distorted guitar, powerful bass',
    moods:{
      angry:{emoji:'😡',name:'Angry Rock',desc:'Maximum aggression — dense kick, full snare, overdriven guitar',bpm:155,tweak:g=>{g['Kick']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['Snare']=[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0];g['Hi-Hat']=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];g['Guitar']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['808 Bass']=[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1];}},
      excited:{emoji:'🤩',name:'Excited Rock',desc:'Energetic driving rhythm — faster tempo, open hats',bpm:140,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1];g['Open-Hat']=[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1];g['Guitar']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['808 Bass']=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0];}}
    }},
  jazz:{name:'Jazz',icon:'🎷',world:'western',desc:'Swinging rhythms, trumpet melody, brushed snare',
    moods:{
      calm:{emoji:'😌',name:'Calm Jazz',desc:'Sparse swing, soft brushes, late night lounge',bpm:80,tweak:g=>{g['Hi-Hat']=[1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Kick']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['808 Bass']=[1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0];g['Piano']=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0];g['Trumpet']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0];}},
      romantic:{emoji:'❤️',name:'Romantic Jazz',desc:'Warm ballad, piano lead, strings swell',bpm:72,tweak:g=>{g['Hi-Hat']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];g['Snare']=[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['Kick']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Piano']=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1];g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Trumpet']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];}},
      melancholic:{emoji:'🌧️',name:'Melancholic Jazz',desc:'Slow minor swing, brooding trumpet, sparse piano',bpm:65,tweak:g=>{g['Hi-Hat']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Snare']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0];g['Kick']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];g['808 Bass']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Piano']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Trumpet']=[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];}}
    }},
  hiphop:{name:'Hip-Hop',icon:'🎤',world:'western',desc:'Booming 808, crisp snare, sampled hi-hats',
    moods:{
      angry:{emoji:'😡',name:'Angry Hip-Hop',desc:'Trap — rattling hi-hats, punching 808, hard snare',bpm:140,tweak:g=>{g['Kick']=[1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1];g['Hi-Hat']=[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0];g['808 Bass']=[1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0];}},
      happy:{emoji:'😊',name:'Happy Hip-Hop',desc:'Bouncy old-school feel, funky piano, uplifting',bpm:95,tweak:g=>{g['Kick']=[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['808 Bass']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];g['Piano']=[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0];}},
      excited:{emoji:'🤩',name:'Excited Hip-Hop',desc:'High energy — fast hi-hats, layered 808, synth stabs',bpm:110,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0];g['Hi-Hat']=[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1];g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Synth']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];}}
    }},
  edm:{name:'EDM',icon:'🎛️',world:'western',desc:'Four-on-the-floor kick, synth lead, arpeggios',
    moods:{
      happy:{emoji:'😊',name:'Happy EDM',desc:'Uplifting melodic house — bright synth, steady groove',bpm:124,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Hi-Hat']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];g['Synth']=[1,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0];g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['808 Bass']=[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0];}},
      excited:{emoji:'🤩',name:'Excited EDM',desc:'Peak hour — massive drop, relentless kick',bpm:135,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1];g['Hi-Hat']=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];g['Synth']=[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0];g['808 Bass']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];}},
      festive:{emoji:'🎉',name:'Festival EDM',desc:'Anthem drops, strings swell, euphoric build',bpm:128,tweak:g=>{g['Kick']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Snare']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Hi-Hat']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1];g['Synth']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['Strings']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['808 Bass']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Trumpet']=[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];}}
    }},
  bollywood:{name:'Bollywood',icon:'🎬',world:'eastern',desc:'Filmi beats, Tabla groove, Sitar melody',
    moods:{
      happy:{emoji:'😊',name:'Happy Bollywood',desc:'Classic dance number — fast Tabla, Sitar hook',bpm:118,tweak:g=>{g['Tabla-Na']=[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1];g['Tabla-Ge']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Dholak']=[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1];g['Sitar']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];g['Bansuri']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Strings']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];}},
      festive:{emoji:'🎉',name:'Festive Bollywood',desc:'Shaadi vibes — Dhol + Tabla, high energy',bpm:130,tweak:g=>{g['Tabla-Na']=[1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0];g['Tabla-Ge']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Dhol']=[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];g['Dhol-Hi']=[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0];g['Dholak']=[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0];g['Sitar']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];}},
      romantic:{emoji:'❤️',name:'Romantic Bollywood',desc:'Slow love ballad — Sitar, Sarangi, soft Tabla',bpm:80,tweak:g=>{g['Tabla-Na']=[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0];g['Tabla-Ge']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Sitar']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Strings']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['Bansuri']=[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];}}
    }},
  hindustani:{name:'Hindustani',icon:'🪔',world:'eastern',desc:'Raga-inspired, Tabla taal, Tanpura drone',
    moods:{
      calm:{emoji:'😌',name:'Calm Hindustani',desc:'Vilambit laya — slow peaceful Tabla, steady Tanpura',bpm:55,tweak:g=>{g['Tabla-Na']=[1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0];g['Tabla-Ge']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Sitar']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];g['Sarangi']=[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];}},
      melancholic:{emoji:'🌧️',name:'Melancholic Hindustani',desc:'Evening raga — Bhairavi, longing Sarangi',bpm:50,tweak:g=>{g['Tabla-Na']=[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0];g['Tabla-Ge']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];}},
      romantic:{emoji:'❤️',name:'Romantic Hindustani',desc:'Yaman raga — Sitar, Tanpura, gentle Tabla',bpm:65,tweak:g=>{g['Tabla-Na']=[1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0];g['Tabla-Ge']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Sitar']=[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0];}}
    }},
  carnatic:{name:'Carnatic',icon:'🌺',world:'eastern',desc:'South Indian Mridangam, fast Bansuri phrases',
    moods:{
      excited:{emoji:'🤩',name:'Excited Carnatic',desc:'Madhyama kala — medium fast, energetic Mridangam',bpm:125,tweak:g=>{g['Mridangam']=[1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0];g['Mridangam-B']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Bansuri']=[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1];g['Sarangi']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}},
      happy:{emoji:'😊',name:'Happy Carnatic',desc:'Chapu talam — cheerful syncopated patterns',bpm:112,tweak:g=>{g['Mridangam']=[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0];g['Mridangam-B']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Bansuri']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Sarangi']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];}},
      festive:{emoji:'🎉',name:'Festive Carnatic',desc:'Tisra nadai — triplet feel, temple festival',bpm:140,tweak:g=>{g['Mridangam']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1];g['Mridangam-B']=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0];g['Bansuri']=[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];g['Dholak']=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}}
    }},
  sufi:{name:'Sufi/Folk',icon:'🌙',world:'eastern',desc:'Meditative Dhol, soulful Sarangi, Bansuri call',
    moods:{
      sad:{emoji:'😢',name:'Sad Sufi',desc:'Slow devotional — Bansuri lament, Sarangi weeps',bpm:60,tweak:g=>{g['Dhol']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Bansuri']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}},
      calm:{emoji:'😌',name:'Calm Sufi',desc:'Meditative qawwali — steady Dholak, Bansuri breathing',bpm:72,tweak:g=>{g['Dhol']=[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0];g['Dhol-Hi']=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];g['Dholak']=[1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0];g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0];g['Sarangi']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];g['Tanpura']=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}},
      melancholic:{emoji:'🌧️',name:'Melancholic Sufi',desc:'Night kafi — longing Sarangi, echo Bansuri, drone',bpm:55,tweak:g=>{g['Dhol']=[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0];g['Bansuri']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Sarangi']=[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0];g['Tanpura']=[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];g['Dholak']=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0];}}
    }}
};

// ── STATE ──
const STEPS=16; let bpm=120,isPlaying=false,currentStep=0,intervalId=null;
let grid=emptyGrid(),currentGenreKey=null,currentMoodKey=null,currentWorld='western';
let savedPatterns=[],activeMoodFilter='all',pendingGenre=null,pendingMoodSelected=null;
let learnMode=false,learnStepIndex=0,learnStepsList=[];
try{savedPatterns=JSON.parse(localStorage.getItem('bf6_patterns')||'[]');}catch(e){}

// ── DARK MODE ──
function initDarkMode(){
  const saved=localStorage.getItem('bf6_theme')||'light';
  document.documentElement.setAttribute('data-theme',saved);
  document.getElementById('darkToggle').textContent=saved==='dark'?'☀️':'🌙';
}
document.getElementById('darkToggle').addEventListener('click',()=>{
  const cur=document.documentElement.getAttribute('data-theme');
  const next=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  document.getElementById('darkToggle').textContent=next==='dark'?'☀️':'🌙';
  localStorage.setItem('bf6_theme',next);
});

// ── VISUALIZER ──
const canvas=document.getElementById('visualizer');
const canvasCtx=canvas.getContext('2d');
const vizLabel=document.getElementById('vizLabel');
let vizRunning=false;
function drawVisualizer(){
  if(!vizRunning)return;
  requestAnimationFrame(drawVisualizer);
  const W=canvas.width,H=canvas.height;
  const dataArr=new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArr);
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  canvasCtx.fillStyle=isDark?'#1a1916':'#ffffff';
  canvasCtx.fillRect(0,0,W,H);
  const barW=W/dataArr.length*2.5;
  let x=0;
  for(let i=0;i<dataArr.length;i++){
    const barH=(dataArr[i]/255)*H;
    const hue=200+i*0.8;
    canvasCtx.fillStyle=`hsl(${hue},70%,55%)`;
    canvasCtx.fillRect(x,H-barH,barW-1,barH);
    x+=barW;
  }
}
function startVisualizer(){vizLabel.style.display='none';vizRunning=true;canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;drawVisualizer();}
function stopVisualizer(){vizRunning=false;vizLabel.style.display='flex';const W=canvas.width,H=canvas.height;const isDark=document.documentElement.getAttribute('data-theme')==='dark';canvasCtx.fillStyle=isDark?'#1a1916':'#ffffff';canvasCtx.fillRect(0,0,W,H);}

// ── INSTRUMENT TOOLTIP ──
function showTooltip(trackName,el){
  const info=INSTR_INFO[trackName]; if(!info)return;
  const tt=document.getElementById('instrTooltip');
  document.getElementById('ttName').textContent=info.name;
  document.getElementById('ttOrigin').textContent='📍 '+info.origin;
  document.getElementById('ttDesc').textContent=info.desc;
  document.getElementById('ttTip').textContent='💡 '+info.tip;
  tt.style.display='block';
  const rect=el.getBoundingClientRect();
  tt.style.left=Math.min(rect.right+8,window.innerWidth-260)+'px';
  tt.style.top=Math.max(rect.top-20,8)+'px';
}
function hideTooltip(){document.getElementById('instrTooltip').style.display='none';}
document.addEventListener('click',e=>{if(!e.target.classList.contains('track-label'))hideTooltip();});

// ── SEARCH ──
function handleSearch(query) {
  const q = query.trim().toLowerCase();
  const clearBtn = document.getElementById('searchClear');
  const resultsBox = document.getElementById('searchResults');
  clearBtn.style.display = q ? 'flex' : 'none';

  if (!q) { resultsBox.style.display = 'none'; return; }

  const results = [];

  // Search genres
  Object.entries(GENRE_MOODS).forEach(([genreKey, genre]) => {
    const matchGenre = genre.name.toLowerCase().includes(q) ||
      genre.desc.toLowerCase().includes(q) ||
      genre.world.includes(q) ||
      (genre.world === 'eastern' && ['eastern','indian','east'].some(k => q.includes(k))) ||
      (genre.world === 'western' && ['western','west'].some(k => q.includes(k)));

    if (matchGenre) {
      results.push({
        icon: genre.icon, name: genre.name,
        meta: genre.world === 'western' ? '🎸 Western' : '🪘 Eastern',
        type: 'genre', key: genreKey, moodKey: null,
        desc: genre.desc
      });
    }

    // Search moods within genres
    Object.entries(genre.moods).forEach(([moodKey, mood]) => {
      const matchMood = mood.name.toLowerCase().includes(q) ||
        mood.desc.toLowerCase().includes(q) ||
        moodKey.includes(q);
      if (matchMood) {
        results.push({
          icon: mood.emoji, name: mood.name,
          meta: `${genre.icon} ${genre.name} · ${mood.bpm} BPM`,
          type: 'mood', key: genreKey, moodKey: moodKey,
          desc: mood.desc
        });
      }
    });
  });

  // Search instrument names
  TRACKS.forEach(track => {
    const info = INSTR_INFO[track.name];
    if (track.label.toLowerCase().includes(q) ||
        track.name.toLowerCase().includes(q) ||
        (info && info.name.toLowerCase().includes(q)) ||
        (info && info.origin.toLowerCase().includes(q))) {
      results.push({
        icon: track.world === 'western' ? '🎸' : '🪘',
        name: info ? info.name : track.label,
        meta: `${track.world === 'western' ? 'Western' : 'Eastern'} · ${info ? info.origin : ''}`,
        type: 'instrument', key: track.name, moodKey: null,
        desc: info ? info.desc : ''
      });
    }
  });

  if (!results.length) {
    resultsBox.innerHTML = `<div class="search-results-title">Search results for "${query}"</div><div class="no-search-results">No genres, moods or instruments found. Try "Jazz", "Calm", "Tabla" or "Festive".</div>`;
    resultsBox.style.display = 'block';
    return;
  }

  const cards = results.slice(0, 12).map(r => `
    <div class="search-result-card" onclick="handleSearchClick('${r.type}','${r.key}','${r.moodKey||''}')">
      <span class="src-icon">${r.icon}</span>
      <div class="src-info">
        <div class="src-name">${r.name}</div>
        <div class="src-meta">${r.meta}</div>
      </div>
      <span class="src-type">${r.type}</span>
    </div>
  `).join('');

  resultsBox.innerHTML = `<div class="search-results-title">${results.length} result${results.length>1?'s':''} for "${query}"</div><div class="search-result-cards">${cards}</div>`;
  resultsBox.style.display = 'block';
}

function handleSearchClick(type, key, moodKey) {
  if (type === 'genre') {
    // Switch to correct world tab
    const genre = GENRE_MOODS[key];
    if (genre) {
      const isEastern = genre.world === 'eastern';
      document.querySelectorAll('.genre-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.genre-tab')[isEastern ? 1 : 0].classList.add('active');
      document.getElementById('westernGenres').style.display = isEastern ? 'none' : 'grid';
      document.getElementById('easternGenres').style.display = isEastern ? 'grid' : 'none';
      openGenreMoodPicker(key);
    }
  } else if (type === 'mood') {
    loadGenreMood(key, moodKey);
    clearSearch();
  } else if (type === 'instrument') {
    // Show instrument info tooltip and scroll to studio
    const track = TRACKS.find(t => t.name === key);
    if (track) {
      const world = track.world;
      showWorld(world);
      document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
      setStatus('', `💡 Showing ${track.label} — hover the track label for info`);
    }
    clearSearch();
  }
}

function clearSearch() {
  document.getElementById('genreSearch').value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('searchResults').style.display = 'none';
}

// ── SEARCH ──
function filterByMood(mood,btn){
  activeMoodFilter=mood;
  document.querySelectorAll('.mood-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.genre-card').forEach(card=>{
    const moods=card.dataset.moods||'';
    card.classList.toggle('dimmed',mood!=='all'&&!moods.split(',').includes(mood));
  });
}
function switchWorld(world,btn){
  document.querySelectorAll('.genre-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('westernGenres').style.display=world==='western'?'grid':'none';
  document.getElementById('easternGenres').style.display=world==='eastern'?'grid':'none';
}

// ── MOOD MODAL ──
function openGenreMoodPicker(genreKey){
  const genre=GENRE_MOODS[genreKey]; if(!genre)return;
  pendingGenre=genreKey; pendingMoodSelected=null;
  document.getElementById('modalGenreIcon').textContent=genre.icon;
  document.getElementById('modalGenreName').textContent=genre.name;
  document.getElementById('modalGenreDesc').textContent=genre.desc;
  const container=document.getElementById('modalMoodOptions'); container.innerHTML='';
  const preselect=activeMoodFilter!=='all'&&genre.moods[activeMoodFilter]?activeMoodFilter:null;
  Object.entries(genre.moods).forEach(([moodKey,mood])=>{
    const btn=document.createElement('button');
    btn.className='modal-mood-btn'+(preselect===moodKey?' selected':'');
    btn.innerHTML=`<span class="mmb-emoji">${mood.emoji}</span><div class="mmb-info"><div class="mmb-name">${mood.name}</div><div class="mmb-desc">${mood.desc}</div></div><span class="mmb-bpm">${mood.bpm} BPM</span>`;
    btn.addEventListener('click',()=>{container.querySelectorAll('.modal-mood-btn').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');pendingMoodSelected=moodKey;});
    container.appendChild(btn);
  });
  if(preselect)pendingMoodSelected=preselect;
  const loadBtn=document.createElement('button'); loadBtn.className='modal-load-btn'; loadBtn.textContent='Load This Beat →';
  loadBtn.addEventListener('click',()=>{if(!pendingMoodSelected)pendingMoodSelected=Object.keys(genre.moods)[0];loadGenreMood(pendingGenre,pendingMoodSelected);document.getElementById('moodModal').style.display='none';});
  container.appendChild(loadBtn);
  document.getElementById('moodModal').style.display='flex';
}
function closeMoodModal(e){if(e.target===document.getElementById('moodModal'))document.getElementById('moodModal').style.display='none';}

// ── LOAD GENRE+MOOD ──
function loadGenreMood(genreKey,moodKey){
  const genre=GENRE_MOODS[genreKey],mood=genre.moods[moodKey]; if(!genre||!mood)return;
  currentGenreKey=genreKey; currentMoodKey=moodKey;
  grid=emptyGrid(); mood.tweak(grid);
  document.getElementById('bpm').value=mood.bpm; bpm=mood.bpm;
  document.querySelectorAll('.genre-card').forEach(c=>c.classList.remove('selected'));
  const card=document.querySelector(`.genre-card[data-genre="${genreKey}"]`); if(card)card.classList.add('selected');
  const banner=document.getElementById('genreBanner');
  document.getElementById('genreBannerIcon').textContent=genre.icon+' '+mood.emoji;
  document.getElementById('genreBannerName').textContent=mood.name+' loaded — '+mood.bpm+' BPM';
  document.getElementById('genreBannerDesc').textContent=mood.desc;
  banner.style.display='flex';
  document.getElementById('activeGenreRow').style.display='flex';
  document.getElementById('activeGenreBadge').textContent=genre.icon+' '+genre.name;
  document.getElementById('activeMoodBadge').textContent=mood.emoji+' '+mood.name.split(' ')[0];
  document.getElementById('activeGenreDesc').textContent=mood.desc;
  document.getElementById('patternName').placeholder='My '+mood.name;
  const w=genre.world;
  document.querySelectorAll('.world-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(w==='western'?'tabWestern':'tabEastern').classList.add('active');
  currentWorld=w;
  renderGrid(currentWorld);
  if(isPlaying)restartPlayback();
  setStatus('',genre.icon+mood.emoji+' '+mood.name+' loaded!');
  document.getElementById('sequencer').scrollIntoView({behavior:'smooth'});
}

// ── GRID RENDER ──
function showWorld(world){
  currentWorld=world;
  document.querySelectorAll('.world-tab').forEach(t=>t.classList.remove('active'));
  const ids={western:'tabWestern',eastern:'tabEastern',both:'tabBoth'};
  document.getElementById(ids[world]).classList.add('active');
  renderGrid(world);
}
function renderGrid(world){
  const w=world||currentWorld||'western';
  const gridEl=document.getElementById('grid'); gridEl.innerHTML='';
  const sections=[];
  if(w==='western'||w==='both')sections.push({label:'🎸 Western Instruments',tracks:TRACKS.filter(t=>t.world==='western')});
  if(w==='eastern'||w==='both')sections.push({label:'🪘 Eastern Instruments',tracks:TRACKS.filter(t=>t.world==='eastern')});
  sections.forEach(sec=>{
    const section=document.createElement('div'); section.className='track-section';
    const hdr=document.createElement('div'); hdr.className='track-section-header'; hdr.textContent=sec.label;
    section.appendChild(hdr);
    sec.tracks.forEach(track=>{
      const row=document.createElement('div'); row.className='track-row';
      const label=document.createElement('span'); label.className='track-label';
      label.textContent=track.label; label.style.borderLeft=`3px solid ${track.color}`;
      label.title='Click for instrument info';
      label.addEventListener('mouseenter',e=>showTooltip(track.name,e.target));
      label.addEventListener('mouseleave',hideTooltip);
      label.addEventListener('click',e=>showTooltip(track.name,e.target));
      row.appendChild(label);
      const stepsRow=document.createElement('div'); stepsRow.className='steps-row';
      for(let i=0;i<STEPS;i++){
        const btn=document.createElement('button');
        const active=grid[track.name]&&grid[track.name][i];
        btn.className='step-btn'+(active?' active':'');
        btn.dataset.track=track.name; btn.dataset.step=i;
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
      // Volume slider
      const volWrap=document.createElement('div'); volWrap.className='vol-slider-wrap';
      const slider=document.createElement('input'); slider.type='range'; slider.min=0; slider.max=1; slider.step=0.05;
      slider.value=trackVolumes[track.name]||1; slider.className='vol-slider';
      slider.addEventListener('input',()=>{ trackVolumes[track.name]=parseFloat(slider.value); });
      volWrap.appendChild(slider); row.appendChild(volWrap);
      section.appendChild(row);
    });
    gridEl.appendChild(section);
  });
}

// ── LEARN MODE ──
function buildLearnSteps(){
  const steps=[];
  // Analyze active steps per track
  const activeTracks=TRACKS.filter(t=>grid[t.name]&&grid[t.name].some(v=>v));
  if(activeTracks.length===0){steps.push({text:'No steps activated yet! Load a genre or click some steps first.',track:null,stepIdx:null});}
  else{
    steps.push({text:`This beat has ${activeTracks.length} active tracks. Let's learn each one!`,track:null,stepIdx:null});
    activeTracks.forEach(track=>{
      const activeIdxs=grid[track.name].map((v,i)=>v?i+1:null).filter(Boolean);
      const info=INSTR_INFO[track.name];
      steps.push({text:`${track.label}: Active on steps ${activeIdxs.join(', ')}. ${info?info.desc:''}`,track:track.name,stepIdx:null});
      activeIdxs.forEach(si=>{
        steps.push({text:`Step ${si} — ${track.label} hits here. ${info?'Tip: '+info.tip:''}`,track:track.name,stepIdx:si-1});
      });
    });
    steps.push({text:`Great job! You've learned this beat. Now try modifying some steps and see how it changes the feel!`,track:null,stepIdx:null});
  }
  return steps;
}

function enterLearnMode(){
  learnMode=true; learnStepIndex=0;
  learnStepsList=buildLearnSteps();
  document.getElementById('learnPanel').style.display='block';
  document.getElementById('learnBtn').classList.add('active');
  const genre=currentGenreKey?GENRE_MOODS[currentGenreKey]:null;
  const mood=genre&&currentMoodKey?genre.moods[currentMoodKey]:null;
  document.getElementById('learnTitle').textContent=mood?'Learning: '+mood.name:'Learn This Beat';
  document.getElementById('learnSubtitle').textContent=mood?mood.desc:'Follow the steps below';
  renderLearnSteps();
  updateLearnStep();
}
function exitLearnMode(){
  learnMode=false;
  document.getElementById('learnPanel').style.display='none';
  document.getElementById('learnBtn').classList.remove('active');
  document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('learn-highlight'));
}
function renderLearnSteps(){
  const container=document.getElementById('learnSteps'); container.innerHTML='';
  learnStepsList.forEach((step,i)=>{
    const div=document.createElement('div');
    div.className='learn-step'+(i===learnStepIndex?' active':i<learnStepIndex?' done':'');
    div.textContent=(i<learnStepIndex?'✓ ':'')+(i===learnStepIndex?'▶ ':'')+step.text;
    container.appendChild(div);
  });
  // Scroll active into view
  const active=container.querySelector('.learn-step.active');
  if(active)active.scrollIntoView({block:'nearest'});
}
function updateLearnStep(){
  const step=learnStepsList[learnStepIndex]; if(!step)return;
  document.getElementById('learnProgress').textContent=`${learnStepIndex+1} / ${learnStepsList.length}`;
  // Highlight relevant step buttons
  document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('learn-highlight'));
  if(step.track&&step.stepIdx!==null){
    document.querySelectorAll(`.step-btn[data-track="${step.track}"][data-step="${step.stepIdx}"]`).forEach(b=>b.classList.add('learn-highlight'));
  } else if(step.track){
    document.querySelectorAll(`.step-btn[data-track="${step.track}"]`).forEach(b=>b.classList.add('learn-highlight'));
  }
  // Tip
  document.getElementById('learnTip').textContent=step.text;
  renderLearnSteps();
}
function learnNext(){if(learnStepIndex<learnStepsList.length-1){learnStepIndex++;updateLearnStep();}}
function learnPrev(){if(learnStepIndex>0){learnStepIndex--;updateLearnStep();}}
document.getElementById('learnBtn').addEventListener('click',()=>{if(learnMode)exitLearnMode();else enterLearnMode();});

// ── PLAYBACK ──
function tick(){
  document.querySelectorAll('.step-btn').forEach(btn=>{btn.classList.toggle('current',parseInt(btn.dataset.step)===currentStep);});
  TRACKS.forEach(track=>{
    if(grid[track.name]&&grid[track.name][currentStep]){
      const vol=trackVolumes[track.name]||1;
      if(vol>0) track.play(audioCtx.currentTime);
    }
  });
  currentStep=(currentStep+1)%STEPS;
}
function getInterval(){return(60/bpm/4)*1000;}
function restartPlayback(){clearInterval(intervalId);bpm=parseInt(document.getElementById('bpm').value)||120;intervalId=setInterval(tick,getInterval());}

document.getElementById('playBtn').addEventListener('click',()=>{
  if(isPlaying)return;
  audioCtx.resume(); isPlaying=true;
  bpm=parseInt(document.getElementById('bpm').value)||120;
  intervalId=setInterval(tick,getInterval());
  document.getElementById('playBtn').classList.add('active');
  startVisualizer();
  setStatus('playing','▶ Playing');
});
document.getElementById('stopBtn').addEventListener('click',()=>{
  if(!isPlaying)return;
  isPlaying=false; clearInterval(intervalId); currentStep=0;
  document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('current'));
  document.getElementById('playBtn').classList.remove('active');
  stopVisualizer();
  setStatus('','Stopped');
});
document.getElementById('clearBtn').addEventListener('click',()=>{
  grid=emptyGrid();
  document.querySelectorAll('.step-btn').forEach(b=>{b.classList.remove('active','current');b.style.background='';});
  setStatus('','Grid cleared');
});
document.getElementById('bpmUp').addEventListener('click',()=>{const i=document.getElementById('bpm');i.value=Math.min(240,parseInt(i.value)+5);if(isPlaying)restartPlayback();});
document.getElementById('bpmDown').addEventListener('click',()=>{const i=document.getElementById('bpm');i.value=Math.max(40,parseInt(i.value)-5);if(isPlaying)restartPlayback();});
document.getElementById('bpm').addEventListener('change',()=>{if(isPlaying)restartPlayback();});

// ── SAVE ──
document.getElementById('saveBtn').addEventListener('click',()=>{
  const genre=currentGenreKey?GENRE_MOODS[currentGenreKey]:null;
  const mood=genre&&currentMoodKey?genre.moods[currentMoodKey]:null;
  const name=document.getElementById('patternName').value.trim()||(mood?'My '+mood.name:'Pattern '+(savedPatterns.length+1));
  const pattern={id:Date.now(),name,bpm:parseInt(document.getElementById('bpm').value),genre:currentGenreKey,genreIcon:genre?.icon,genreName:genre?.name,mood:currentMoodKey,moodEmoji:mood?.emoji,moodName:mood?.name,grid:JSON.parse(JSON.stringify(grid)),likes:0,createdAt:new Date().toLocaleString()};
  savedPatterns.unshift(pattern);
  try{localStorage.setItem('bf6_patterns',JSON.stringify(savedPatterns));}catch(e){}
  renderGallery();
  document.getElementById('patternName').value='';
  setStatus('saved',`💾 "${name}" saved to gallery!`);
});

// ── GALLERY ──
function loadPattern(pattern){
  document.getElementById('bpm').value=pattern.bpm; bpm=pattern.bpm;
  grid=pattern.grid||emptyGrid();
  currentGenreKey=pattern.genre||null; currentMoodKey=pattern.mood||null;
  renderGrid(currentWorld);
  if(isPlaying)restartPlayback();
  if(pattern.genreIcon){
    document.getElementById('activeGenreRow').style.display='flex';
    document.getElementById('activeGenreBadge').textContent=pattern.genreIcon+' '+pattern.genreName;
    document.getElementById('activeMoodBadge').textContent=pattern.moodEmoji?(pattern.moodEmoji+' '+(pattern.moodName?.split(' ')[0])):'';
    document.getElementById('activeGenreDesc').textContent='';
  }
  setStatus('',`📂 Loaded "${pattern.name}"`);
  document.getElementById('sequencer').scrollIntoView({behavior:'smooth'});
}
function deletePattern(id){savedPatterns=savedPatterns.filter(p=>p.id!==id);try{localStorage.setItem('bf6_patterns',JSON.stringify(savedPatterns));}catch(e){}renderGallery();}
function likePattern(id){
  const p=savedPatterns.find(p=>p.id===id); if(!p)return;
  p.likes=(p.likes||0)+1;
  try{localStorage.setItem('bf6_patterns',JSON.stringify(savedPatterns));}catch(e){}
  renderGallery();
}
function sharePattern(id){
  const p=savedPatterns.find(p=>p.id===id); if(!p)return;
  const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(p))));
  const url=window.location.origin+window.location.pathname+'?pattern='+encoded;
  if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>setStatus('saved','🔗 Link copied!'));}
  else{prompt('Copy this link:',url);}
}

function renderGallery(){
  const container=document.getElementById('galleryGrid');
  if(!savedPatterns.length){container.innerHTML='<div class="no-gallery">No saved patterns yet. Build a beat and save it to your gallery!</div>';return;}
  container.innerHTML=savedPatterns.map(p=>{
    // Mini grid preview using first active track
    const firstTrack=TRACKS.find(t=>p.grid&&p.grid[t.name]&&p.grid[t.name].some(v=>v));
    const miniSteps=firstTrack?(p.grid[firstTrack.name]||Array(16).fill(false)):Array(16).fill(false);
    const miniHTML=miniSteps.map((v,i)=>`<div class="gc-step${v?' on':''}" style="${v?'background:'+((firstTrack&&firstTrack.color)||'#e8521a'):''}"></div>`).join('');
    return`<div class="gallery-card">
      <div class="gc-header">
        <div>
          <div class="gc-name">${p.name}</div>
          <div class="gc-tags">
            ${p.genreIcon?`<span class="gc-tag">${p.genreIcon} ${p.genreName}</span>`:''}
            ${p.moodEmoji?`<span class="gc-tag">${p.moodEmoji} ${p.moodName}</span>`:''}
          </div>
        </div>
      </div>
      <div class="gc-mini-grid">${miniHTML}</div>
      <div class="gc-meta">${p.bpm} BPM · ${p.createdAt}</div>
      <div class="gc-actions">
        <button class="gc-btn" onclick='loadPattern(${JSON.stringify(p)})'>📂 Load</button>
        <button class="gc-btn" onclick="sharePattern(${p.id})">🔗 Share</button>
        <button class="gc-btn delete" onclick="deletePattern(${p.id})">✕</button>
        <button class="gc-like${(p.likes||0)>0?' liked':''}" onclick="likePattern(${p.id})">♥ ${p.likes||0}</button>
      </div>
    </div>`;
  }).join('');
}

function loadFromURL(){
  const enc=new URLSearchParams(window.location.search).get('pattern');
  if(enc){try{loadPattern(JSON.parse(decodeURIComponent(escape(atob(enc)))));}catch(e){}}
}

// ── WAV DOWNLOAD ──
document.getElementById('downloadBtn').addEventListener('click',async()=>{
  setStatus('','⏳ Rendering audio...');
  const stepDur=60/bpm/4,loops=4,totalDur=STEPS*loops*stepDur+2;
  const offCtx=new OfflineAudioContext(2,Math.ceil(audioCtx.sampleRate*totalDur),audioCtx.sampleRate);
  for(let step=0;step<STEPS*loops;step++){
    const si=step%STEPS,t0=step*stepDur;
    TRACKS.forEach(track=>{if(grid[track.name]&&grid[track.name][si]){try{track.play(t0,offCtx);}catch(e){}}});
  }
  const buf=await offCtx.startRendering();
  const wav=encodeWav(buf);
  const blob=new Blob([wav],{type:'audio/wav'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`beatforge-${currentGenreKey||'beat'}-${currentMoodKey||'custom'}.wav`;a.click();
  URL.revokeObjectURL(url);
  setStatus('saved','⬇️ WAV downloaded!');
});

function encodeWav(buf){
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

function setStatus(type,text){document.getElementById('statusDot').className='status-dot'+(type?' '+type:'');document.getElementById('statusText').textContent=text;}

// Init
initDarkMode();
renderGrid('western');
renderGallery();
loadFromURL();
setStatus('','Ready — filter by mood, pick a genre, and build your beat!');