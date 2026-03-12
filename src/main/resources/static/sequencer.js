// ── BeatForge Sequencer v3 — with Moods ──

const TRACKS = [
  { name: 'Kick',    freq: 55,   type: 'sine',     duration: 0.35, pitchDrop: true,  color: '#e8521a', category: 'western' },
  { name: 'Snare',   freq: 180,  type: 'triangle', duration: 0.12, pitchDrop: false, color: '#f59e0b', category: 'western' },
  { name: 'Hi-Hat',  freq: 900,  type: 'square',   duration: 0.06, pitchDrop: false, color: '#10b981', category: 'western' },
  { name: 'Bass',    freq: 80,   type: 'sawtooth', duration: 0.25, pitchDrop: true,  color: '#6366f1', category: 'western' },
  { name: 'Synth',   freq: 440,  type: 'sine',     duration: 0.18, pitchDrop: true,  color: '#ec4899', category: 'western' },
  { name: 'Tabla',   freq: 120,  type: 'sine',     duration: 0.20, pitchDrop: true,  color: '#f97316', category: 'indian', tabla: true },
  { name: 'Dhol',    freq: 70,   type: 'triangle', duration: 0.30, pitchDrop: true,  color: '#ef4444', category: 'indian' },
  { name: 'Sitar',   freq: 329,  type: 'sawtooth', duration: 0.40, pitchDrop: false, color: '#a855f7', category: 'indian', sitar: true },
  { name: 'Dholak',  freq: 90,   type: 'sine',     duration: 0.28, pitchDrop: true,  color: '#14b8a6', category: 'indian' },
];

// ── Mood Definitions ──
const MOODS = {
  happy: {
    emoji: '😊', name: 'Happy', bpm: 140,
    desc: 'Upbeat, energetic and fun',
    color: '#f59e0b', bg: '#fef9c3',
    grid: {
      'Kick':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      'Snare':  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      'Hi-Hat': [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      'Bass':   [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],
      'Synth':  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
      'Tabla':  [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1],
      'Dhol':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Sitar':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dholak': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    }
  },
  sad: {
    emoji: '😢', name: 'Sad', bpm: 60,
    desc: 'Slow, deep and emotional',
    color: '#3b82f6', bg: '#dbeafe',
    grid: {
      'Kick':   [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      'Snare':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Hi-Hat': [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      'Bass':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dhol':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Sitar':  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0],
      'Dholak': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    }
  },
  angry: {
    emoji: '😡', name: 'Angry', bpm: 160,
    desc: 'Heavy, loud and intense',
    color: '#ef4444', bg: '#fee2e2',
    grid: {
      'Kick':   [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      'Snare':  [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      'Hi-Hat': [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      'Bass':   [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dhol':   [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
      'Sitar':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dholak': [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    }
  },
  calm: {
    emoji: '😌', name: 'Calm', bpm: 70,
    desc: 'Peaceful, soft and relaxing',
    color: '#22c55e', bg: '#dcfce7',
    grid: {
      'Kick':   [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Snare':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Hi-Hat': [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
      'Bass':   [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dhol':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Sitar':  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
      'Dholak': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    }
  },
  romantic: {
    emoji: '❤️', name: 'Romantic', bpm: 80,
    desc: 'Soft, warm and melodic',
    color: '#ec4899', bg: '#fce7f3',
    grid: {
      'Kick':   [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      'Snare':  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      'Hi-Hat': [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      'Bass':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      'Synth':  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dhol':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Sitar':  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
      'Dholak': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    }
  },
  excited: {
    emoji: '🤩', name: 'Excited', bpm: 150,
    desc: 'Fast, wild and celebratory',
    color: '#8b5cf6', bg: '#ede9fe',
    grid: {
      'Kick':   [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],
      'Snare':  [0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1],
      'Hi-Hat': [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      'Bass':   [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1],
      'Synth':  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dhol':   [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1],
      'Sitar':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dholak': [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
    }
  },
  focused: {
    emoji: '🎯', name: 'Focused', bpm: 100,
    desc: 'Steady rhythm for deep work',
    color: '#14b8a6', bg: '#f0fdf4',
    grid: {
      'Kick':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      'Snare':  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      'Hi-Hat': [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      'Bass':   [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dhol':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Sitar':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Dholak': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    }
  },
  festive: {
    emoji: '🎉', name: 'Festive', bpm: 130,
    desc: 'Indian celebration energy',
    color: '#f97316', bg: '#fff7ed',
    grid: {
      'Kick':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      'Snare':  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      'Hi-Hat': [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      'Bass':   [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
      'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      'Tabla':  [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
      'Dhol':   [1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,1],
      'Sitar':  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
      'Dholak': [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    }
  }
};

const STEPS = 16;
let bpm = 120;
let isPlaying = false;
let currentStep = 0;
let intervalId = null;
let grid = {};
let currentMood = null;
let savedPatterns = [];

try { savedPatterns = JSON.parse(localStorage.getItem('beatforge_patterns') || '[]'); } catch(e) {}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
TRACKS.forEach(t => { grid[t.name] = Array(STEPS).fill(false); });

// ── Sound Engine ──
function playSound(track) {
  try {
    const now = audioCtx.currentTime;
    if (track.sitar) {
      [1,2,3].forEach((h,i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(track.freq*h, now);
        g.gain.setValueAtTime(0.3/h, now); g.gain.exponentialRampToValueAtTime(0.001, now+track.duration*(1.5-i*0.3));
        o.start(now); o.stop(now+track.duration*1.5);
      }); return;
    }
    if (track.tabla) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination); o.type='sine';
      o.frequency.setValueAtTime(track.freq*2,now); o.frequency.exponentialRampToValueAtTime(track.freq,now+0.05);
      g.gain.setValueAtTime(0.8,now); g.gain.exponentialRampToValueAtTime(0.001,now+track.duration);
      o.start(now); o.stop(now+track.duration); return;
    }
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = track.type; o.frequency.setValueAtTime(track.freq, now);
    if (track.pitchDrop) o.frequency.exponentialRampToValueAtTime(track.freq*0.5, now+track.duration);
    g.gain.setValueAtTime(0.7,now); g.gain.exponentialRampToValueAtTime(0.001,now+track.duration);
    o.start(now); o.stop(now+track.duration);
  } catch(e) {}
}

// ── Mood Selector ──
function selectMood(moodKey) {
  const mood = MOODS[moodKey];
  if (!mood) return;
  currentMood = moodKey;

  // Highlight selected card
  document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.mood-card[data-mood="${moodKey}"]`);
  if (card) card.classList.add('selected');

  // Load beat
  document.getElementById('bpm').value = mood.bpm;
  bpm = mood.bpm;
  TRACKS.forEach(t => { grid[t.name] = mood.grid[t.name].map(v => !!v); });
  renderGrid();
  if (isPlaying) restartPlayback();

  // Show banner
  const banner = document.getElementById('moodBanner');
  document.getElementById('moodBannerEmoji').textContent = mood.emoji;
  document.getElementById('moodBannerText').textContent = `${mood.name} beat loaded — ${mood.desc}. BPM set to ${mood.bpm}.`;
  banner.style.display = 'flex';
  banner.style.background = mood.color;

  // Show in studio
  document.getElementById('activeMoodRow').style.display = 'flex';
  document.getElementById('activeMoodBadge').textContent = `${mood.emoji} ${mood.name}`;
  document.getElementById('activeMoodBadge').style.background = mood.color;
  document.getElementById('activeMoodDesc').textContent = mood.desc;
  document.getElementById('currentMoodLabel').textContent = `${mood.emoji} ${mood.name}`;

  // Suggest pattern name
  document.getElementById('patternName').placeholder = `My ${mood.name} Beat`;

  setStatus('', `${mood.emoji} ${mood.name} beat loaded!`);
}

// ── Render Grid ──
function renderGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';
  ['western','indian'].forEach(cat => {
    const section = document.createElement('div');
    section.className = 'track-section';
    const lbl = document.createElement('div');
    lbl.className = 'section-label';
    lbl.textContent = cat === 'western' ? '🎸 Western' : '🪘 Indian';
    section.appendChild(lbl);
    TRACKS.filter(t => t.category===cat).forEach(track => {
      const row = document.createElement('div');
      row.className = 'track-row';
      const label = document.createElement('span');
      label.className = 'track-label';
      label.textContent = track.name;
      label.style.borderLeft = `3px solid ${track.color}`;
      row.appendChild(label);
      const stepsRow = document.createElement('div');
      stepsRow.className = 'steps-row';
      for (let i=0; i<STEPS; i++) {
        const btn = document.createElement('button');
        btn.className = 'step-btn' + (grid[track.name][i]?' active':'');
        btn.dataset.track = track.name; btn.dataset.step = i;
        if (grid[track.name][i]) btn.style.background = track.color;
        btn.addEventListener('click', () => {
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
    btn.classList.toggle('current', parseInt(btn.dataset.step)===currentStep);
  });
  TRACKS.forEach(track => { if (grid[track.name][currentStep]) playSound(track); });
  currentStep = (currentStep+1) % STEPS;
}

function getInterval() { return (60/bpm/4)*1000; }
function restartPlayback() { clearInterval(intervalId); bpm=parseInt(document.getElementById('bpm').value)||120; intervalId=setInterval(tick,getInterval()); }

// ── Controls ──
document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) return;
  audioCtx.resume(); isPlaying=true;
  bpm=parseInt(document.getElementById('bpm').value)||120;
  intervalId=setInterval(tick,getInterval());
  document.getElementById('playBtn').classList.add('active');
  setStatus('playing','▶ Playing');
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (!isPlaying) return;
  isPlaying=false; clearInterval(intervalId); currentStep=0;
  document.querySelectorAll('.step-btn').forEach(b=>b.classList.remove('current'));
  document.getElementById('playBtn').classList.remove('active');
  setStatus('','Stopped');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  TRACKS.forEach(t=>{grid[t.name]=Array(STEPS).fill(false);});
  document.querySelectorAll('.step-btn').forEach(b=>{b.classList.remove('active','current');b.style.background='';});
  setStatus('','Grid cleared');
});

document.getElementById('bpmUp').addEventListener('click', () => {
  const i=document.getElementById('bpm'); i.value=Math.min(240,parseInt(i.value)+5); if(isPlaying)restartPlayback();
});
document.getElementById('bpmDown').addEventListener('click', () => {
  const i=document.getElementById('bpm'); i.value=Math.max(40,parseInt(i.value)-5); if(isPlaying)restartPlayback();
});
document.getElementById('bpm').addEventListener('change', ()=>{ if(isPlaying)restartPlayback(); });

// ── Save Pattern ──
document.getElementById('saveBtn').addEventListener('click', () => {
  const mood = currentMood ? MOODS[currentMood] : null;
  const name = document.getElementById('patternName').value.trim() || (mood ? `My ${mood.name} Beat` : 'Pattern '+(savedPatterns.length+1));
  const pattern = {
    id: Date.now(), name,
    bpm: parseInt(document.getElementById('bpm').value),
    mood: currentMood,
    moodEmoji: mood ? mood.emoji : null,
    moodName: mood ? mood.name : null,
    grid: JSON.parse(JSON.stringify(grid)),
    createdAt: new Date().toLocaleString()
  };
  savedPatterns.unshift(pattern);
  try { localStorage.setItem('beatforge_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
  document.getElementById('patternName').value='';
  setStatus('saved', `💾 "${name}" saved!`);
  fetch('/api/patterns', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name, bpm:pattern.bpm, steps:STEPS, kickPattern:grid['Kick'], snarePattern:grid['Snare'], hihatPattern:grid['Hi-Hat']})
  }).catch(()=>{});
});

// ── Load Pattern ──
function loadPattern(pattern) {
  document.getElementById('bpm').value = pattern.bpm; bpm=pattern.bpm;
  TRACKS.forEach(t=>{ grid[t.name]=(pattern.grid&&pattern.grid[t.name])?pattern.grid[t.name]:Array(STEPS).fill(false); });
  if (pattern.mood) { currentMood=pattern.mood; selectMood(pattern.mood); } else renderGrid();
  if (isPlaying) restartPlayback();
  setStatus('',`📂 Loaded "${pattern.name}"`);
  document.getElementById('sequencer').scrollIntoView({behavior:'smooth'});
}

// ── Delete Pattern ──
function deletePattern(id) {
  savedPatterns = savedPatterns.filter(p=>p.id!==id);
  try { localStorage.setItem('beatforge_patterns',JSON.stringify(savedPatterns)); } catch(e){}
  renderPatternLibrary();
}

// ── Render Library ──
function renderPatternLibrary() {
  const list = document.getElementById('patternList');
  if (savedPatterns.length===0) {
    list.innerHTML='<div class="no-patterns">No saved patterns yet. Pick a mood and save your beat!</div>'; return;
  }
  list.innerHTML = savedPatterns.map(p=>`
    <div class="pattern-card">
      <div class="pattern-info">
        <div class="pattern-name">${p.name}</div>
        <div class="pattern-meta">
          ${p.bpm} BPM · ${p.createdAt}
          ${p.moodEmoji ? `<span class="pattern-mood-tag">${p.moodEmoji} ${p.moodName}</span>` : ''}
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
  const p = savedPatterns.find(p=>p.id===id);
  if (!p) return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(p))));
  const url = window.location.origin+window.location.pathname+'?pattern='+encoded;
  if (navigator.clipboard) { navigator.clipboard.writeText(url).then(()=>setStatus('saved','🔗 Link copied!')); }
  else { prompt('Copy this share link:',url); }
}

// ── Load from URL ──
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('pattern');
  if (encoded) {
    try { const p=JSON.parse(decodeURIComponent(escape(atob(encoded)))); loadPattern(p); } catch(e){}
  }
}

// ── Download WAV ──
document.getElementById('downloadBtn').addEventListener('click', async () => {
  setStatus('','⏳ Rendering audio...');
  const stepDur = 60/bpm/4;
  const total = STEPS*4;
  const offCtx = new OfflineAudioContext(2, Math.ceil(audioCtx.sampleRate*(total*stepDur+1)), audioCtx.sampleRate);
  for (let step=0; step<total; step++) {
    const si=step%STEPS, t0=step*stepDur;
    TRACKS.forEach(track=>{
      if (!grid[track.name][si]) return;
      try {
        const o=offCtx.createOscillator(), g=offCtx.createGain();
        o.connect(g); g.connect(offCtx.destination);
        o.type=track.type; o.frequency.setValueAtTime(track.freq,t0);
        if (track.pitchDrop) o.frequency.exponentialRampToValueAtTime(track.freq*0.5,t0+track.duration);
        g.gain.setValueAtTime(0.6,t0); g.gain.exponentialRampToValueAtTime(0.001,t0+track.duration);
        o.start(t0); o.stop(t0+track.duration);
      } catch(e){}
    });
  }
  const buf = await offCtx.startRendering();
  const wav = encodeWav(buf);
  const blob = new Blob([wav],{type:'audio/wav'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='beatforge-beat.wav'; a.click();
  URL.revokeObjectURL(url);
  setStatus('saved','⬇️ WAV downloaded!');
});

function encodeWav(buf) {
  const nc=buf.numberOfChannels, sr=buf.sampleRate, len=buf.length*nc*2;
  const ab=new ArrayBuffer(44+len), v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF'); v.setUint32(4,36+len,true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,nc,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*nc*2,true); v.setUint16(32,nc*2,true); v.setUint16(34,16,true);
  ws(36,'data'); v.setUint32(40,len,true);
  let off=44;
  for (let i=0;i<buf.length;i++) for(let c=0;c<nc;c++) {
    const s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));
    v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true); off+=2;
  }
  return ab;
}

// ── Presets ──
const PRESETS = {
  'Basic Beat': { bpm:120, grid:{ 'Kick':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Snare':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],'Hi-Hat':[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],'Bass':[1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],'Synth':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Tabla':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Dhol':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Sitar':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Dholak':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] }},
  'Tabla Groove': { bpm:100, grid:{ 'Kick':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Snare':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Hi-Hat':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Bass':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Synth':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],'Tabla':[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Sitar':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],'Dholak':[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0] }},
  'Fusion Mix': { bpm:110, grid:{ 'Kick':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Snare':[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],'Hi-Hat':[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],'Bass':[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],'Synth':[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],'Tabla':[1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1],'Dhol':[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],'Sitar':[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],'Dholak':[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0] }}
};

function loadPreset(name) {
  const p=PRESETS[name]; if(!p)return;
  document.getElementById('bpm').value=p.bpm; bpm=p.bpm;
  TRACKS.forEach(t=>{grid[t.name]=p.grid[t.name].map(v=>!!v);});
  renderGrid(); if(isPlaying)restartPlayback();
  setStatus('',`🎵 Preset: ${name}`);
}

function setStatus(type,text) {
  document.getElementById('statusDot').className='status-dot'+(type?' '+type:'');
  document.getElementById('statusText').textContent=text;
}

// Init
renderGrid();
renderPatternLibrary();
loadFromURL();
setStatus('','Ready — pick a mood or click steps to build your beat!');