// ── BeatForge Sequencer v2 ──
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

const STEPS = 16;
let bpm = 120;
let isPlaying = false;
let currentStep = 0;
let intervalId = null;
let grid = {};
let savedPatterns = [];

try { savedPatterns = JSON.parse(localStorage.getItem('beatforge_patterns') || '[]'); } catch(e) {}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

TRACKS.forEach(t => { grid[t.name] = Array(STEPS).fill(false); });

// ── Sound Engine ──
function playSound(track, ctx, timeOffset) {
  const ac = ctx || audioCtx;
  const t0 = timeOffset !== undefined ? timeOffset : ac.currentTime;
  try {
    if (track.sitar) {
      [1, 2, 3].forEach((h, i) => {
        const osc = ac.createOscillator(), g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(track.freq * h, t0);
        g.gain.setValueAtTime(0.3 / h, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + track.duration * (1.5 - i * 0.3));
        osc.start(t0); osc.stop(t0 + track.duration * 1.5);
      });
      return;
    }
    if (track.tabla) {
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(track.freq * 2, t0);
      osc.frequency.exponentialRampToValueAtTime(track.freq, t0 + 0.05);
      g.gain.setValueAtTime(0.8, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + track.duration);
      osc.start(t0); osc.stop(t0 + track.duration);
      const osc2 = ac.createOscillator(), g2 = ac.createGain();
      osc2.connect(g2); g2.connect(ac.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(track.freq * 3, t0);
      g2.gain.setValueAtTime(0.3, t0);
      g2.gain.exponentialRampToValueAtTime(0.001, t0 + track.duration * 0.5);
      osc2.start(t0); osc2.stop(t0 + track.duration * 0.5);
      return;
    }
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type = track.type;
    osc.frequency.setValueAtTime(track.freq, t0);
    if (track.pitchDrop) osc.frequency.exponentialRampToValueAtTime(track.freq * 0.5, t0 + track.duration);
    g.gain.setValueAtTime(0.7, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + track.duration);
    osc.start(t0); osc.stop(t0 + track.duration);
  } catch(e) {}
}

// ── Render Grid ──
function renderGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';
  ['western', 'indian'].forEach(cat => {
    const section = document.createElement('div');
    section.className = 'track-section';
    const lbl = document.createElement('div');
    lbl.className = 'section-label';
    lbl.textContent = cat === 'western' ? '🎸 Western' : '🪘 Indian';
    section.appendChild(lbl);
    TRACKS.filter(t => t.category === cat).forEach(track => {
      const row = document.createElement('div');
      row.className = 'track-row';
      const label = document.createElement('span');
      label.className = 'track-label';
      label.textContent = track.name;
      label.style.borderLeft = `3px solid ${track.color}`;
      row.appendChild(label);
      const stepsRow = document.createElement('div');
      stepsRow.className = 'steps-row';
      for (let i = 0; i < STEPS; i++) {
        const btn = document.createElement('button');
        btn.className = 'step-btn' + (grid[track.name][i] ? ' active' : '');
        btn.dataset.track = track.name;
        btn.dataset.step = i;
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
    btn.classList.toggle('current', parseInt(btn.dataset.step) === currentStep);
  });
  TRACKS.forEach(track => { if (grid[track.name][currentStep]) playSound(track); });
  currentStep = (currentStep + 1) % STEPS;
}

function getInterval() { return (60 / bpm / 4) * 1000; }
function restartPlayback() { clearInterval(intervalId); bpm = parseInt(document.getElementById('bpm').value) || 120; intervalId = setInterval(tick, getInterval()); }

// ── Controls ──
document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) return;
  audioCtx.resume();
  isPlaying = true;
  bpm = parseInt(document.getElementById('bpm').value) || 120;
  intervalId = setInterval(tick, getInterval());
  document.getElementById('playBtn').classList.add('active');
  setStatus('playing', '▶ Playing');
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (!isPlaying) return;
  isPlaying = false;
  clearInterval(intervalId);
  currentStep = 0;
  document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('current'));
  document.getElementById('playBtn').classList.remove('active');
  setStatus('', 'Stopped');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  TRACKS.forEach(t => { grid[t.name] = Array(STEPS).fill(false); });
  document.querySelectorAll('.step-btn').forEach(btn => { btn.classList.remove('active','current'); btn.style.background = ''; });
  setStatus('', 'Grid cleared');
});

document.getElementById('bpmUp').addEventListener('click', () => {
  const inp = document.getElementById('bpm');
  inp.value = Math.min(240, parseInt(inp.value) + 5);
  if (isPlaying) restartPlayback();
});

document.getElementById('bpmDown').addEventListener('click', () => {
  const inp = document.getElementById('bpm');
  inp.value = Math.max(40, parseInt(inp.value) - 5);
  if (isPlaying) restartPlayback();
});

document.getElementById('bpm').addEventListener('change', () => { if (isPlaying) restartPlayback(); });

// ── Save Pattern ──
document.getElementById('saveBtn').addEventListener('click', () => {
  const name = document.getElementById('patternName').value.trim() || 'Pattern ' + (savedPatterns.length + 1);
  const pattern = {
    id: Date.now(), name,
    bpm: parseInt(document.getElementById('bpm').value),
    grid: JSON.parse(JSON.stringify(grid)),
    createdAt: new Date().toLocaleString()
  };
  savedPatterns.unshift(pattern);
  try { localStorage.setItem('beatforge_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
  document.getElementById('patternName').value = '';
  setStatus('saved', `💾 "${name}" saved!`);
  fetch('/api/patterns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bpm: pattern.bpm, steps: STEPS, kickPattern: grid['Kick'], snarePattern: grid['Snare'], hihatPattern: grid['Hi-Hat'] })
  }).catch(() => {});
});

// ── Load Pattern ──
function loadPattern(pattern) {
  document.getElementById('bpm').value = pattern.bpm;
  bpm = pattern.bpm;
  TRACKS.forEach(t => { grid[t.name] = (pattern.grid && pattern.grid[t.name]) ? pattern.grid[t.name] : Array(STEPS).fill(false); });
  renderGrid();
  if (isPlaying) restartPlayback();
  setStatus('', `📂 Loaded "${pattern.name}"`);
  document.getElementById('sequencer').scrollIntoView({ behavior: 'smooth' });
}

// ── Delete Pattern ──
function deletePattern(id) {
  savedPatterns = savedPatterns.filter(p => p.id !== id);
  try { localStorage.setItem('beatforge_patterns', JSON.stringify(savedPatterns)); } catch(e) {}
  renderPatternLibrary();
}

// ── Render Library ──
function renderPatternLibrary() {
  const list = document.getElementById('patternList');
  if (savedPatterns.length === 0) {
    list.innerHTML = '<div class="no-patterns">No saved patterns yet. Build a beat and save it above!</div>';
    return;
  }
  list.innerHTML = savedPatterns.map(p => `
    <div class="pattern-card">
      <div class="pattern-info">
        <div class="pattern-name">${p.name}</div>
        <div class="pattern-meta">${p.bpm} BPM · ${p.createdAt}</div>
      </div>
      <div class="pattern-actions">
        <button class="pat-btn load" onclick='loadPattern(${JSON.stringify(p)})'>📂 Load</button>
        <button class="pat-btn share" onclick="sharePattern(${p.id})">🔗 Share</button>
        <button class="pat-btn delete" onclick="deletePattern(${p.id})">✕</button>
      </div>
    </div>
  `).join('');
}

// ── Share Pattern ──
function sharePattern(id) {
  const pattern = savedPatterns.find(p => p.id === id);
  if (!pattern) return;
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(pattern))));
  const url = window.location.origin + window.location.pathname + '?pattern=' + encoded;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => setStatus('saved', '🔗 Link copied to clipboard!'));
  } else {
    prompt('Copy this share link:', url);
  }
}

// ── Load from URL ──
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('pattern');
  if (encoded) {
    try {
      const pattern = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      loadPattern(pattern);
    } catch(e) {}
  }
}

// ── Download WAV ──
document.getElementById('downloadBtn').addEventListener('click', async () => {
  setStatus('', '⏳ Rendering audio...');
  const stepDuration = 60 / bpm / 4;
  const totalSteps = STEPS * 4;
  const totalDuration = totalSteps * stepDuration + 1;
  const offlineCtx = new OfflineAudioContext(2, Math.ceil(audioCtx.sampleRate * totalDuration), audioCtx.sampleRate);

  for (let step = 0; step < totalSteps; step++) {
    const stepIndex = step % STEPS;
    const t0 = step * stepDuration;
    TRACKS.forEach(track => {
      if (!grid[track.name][stepIndex]) return;
      try {
        const osc = offlineCtx.createOscillator(), g = offlineCtx.createGain();
        osc.connect(g); g.connect(offlineCtx.destination);
        osc.type = track.type;
        osc.frequency.setValueAtTime(track.freq, t0);
        if (track.pitchDrop) osc.frequency.exponentialRampToValueAtTime(track.freq * 0.5, t0 + track.duration);
        g.gain.setValueAtTime(0.6, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + track.duration);
        osc.start(t0); osc.stop(t0 + track.duration);
      } catch(e) {}
    });
  }

  const buffer = await offlineCtx.startRendering();
  const wav = encodeWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'beatforge-beat.wav'; a.click();
  URL.revokeObjectURL(url);
  setStatus('saved', '⬇️ WAV downloaded!');
});

function encodeWav(buffer) {
  const numCh = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length * numCh * 2;
  const ab = new ArrayBuffer(44 + len), v = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4,36+len,true); ws(8,'WAVE'); ws(12,'fmt ');
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,numCh,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*numCh*2,true);
  v.setUint16(32,numCh*2,true); v.setUint16(34,16,true);
  ws(36,'data'); v.setUint32(40,len,true);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      v.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return ab;
}

// ── Presets ──
const PRESETS = {
  'Basic Beat': { bpm: 120, grid: {
    'Kick':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    'Snare':  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    'Hi-Hat': [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    'Bass':   [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
    'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Tabla':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Dhol':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Sitar':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Dholak': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  }},
  'Tabla Groove': { bpm: 100, grid: {
    'Kick':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Snare':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Hi-Hat': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Bass':   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Synth':  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    'Tabla':  [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
    'Dhol':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    'Sitar':  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    'Dholak': [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
  }},
  'Fusion Mix': { bpm: 110, grid: {
    'Kick':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    'Snare':  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    'Hi-Hat': [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    'Bass':   [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    'Synth':  [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    'Tabla':  [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1],
    'Dhol':   [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    'Sitar':  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    'Dholak': [0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0],
  }}
};

function loadPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  document.getElementById('bpm').value = p.bpm;
  bpm = p.bpm;
  TRACKS.forEach(t => { grid[t.name] = p.grid[t.name].map(v => !!v); });
  renderGrid();
  if (isPlaying) restartPlayback();
  setStatus('', `🎵 Preset: ${name}`);
}

function setStatus(type, text) {
  document.getElementById('statusDot').className = 'status-dot' + (type ? ' '+type : '');
  document.getElementById('statusText').textContent = text;
}

// Init
renderGrid();
renderPatternLibrary();
loadFromURL();
setStatus('', 'Ready — click steps to build your beat!');