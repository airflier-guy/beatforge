// ── BeatForge Sequencer ──
const TRACKS = [
  { name: 'Kick',   freq: 55,  type: 'sine',     duration: 0.35, pitch: true  },
  { name: 'Snare',  freq: 180, type: 'triangle', duration: 0.12, pitch: false },
  { name: 'Hi-Hat', freq: 900, type: 'square',   duration: 0.06, pitch: false },
  { name: 'Bass',   freq: 80,  type: 'sawtooth', duration: 0.25, pitch: true  },
  { name: 'Synth',  freq: 440, type: 'sine',     duration: 0.18, pitch: true  },
];

const STEPS = 16;
let bpm = 120;
let isPlaying = false;
let currentStep = 0;
let intervalId = null;
let grid = {};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Init grid
TRACKS.forEach(t => { grid[t.name] = Array(STEPS).fill(false); });

// Render grid
function renderGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';
  TRACKS.forEach(track => {
    const row = document.createElement('div');
    row.className = 'track-row';

    const label = document.createElement('span');
    label.className = 'track-label';
    label.textContent = track.name;
    row.appendChild(label);

    const stepsRow = document.createElement('div');
    stepsRow.className = 'steps-row';

    for (let i = 0; i < STEPS; i++) {
      const btn = document.createElement('button');
      btn.className = 'step-btn';
      btn.dataset.track = track.name;
      btn.dataset.step = i;
      btn.addEventListener('click', () => {
        grid[track.name][i] = !grid[track.name][i];
        btn.classList.toggle('active', grid[track.name][i]);
      });
      stepsRow.appendChild(btn);
    }
    row.appendChild(stepsRow);
    gridEl.appendChild(row);
  });
}

// Play a sound
function playSound(track) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = track.type;
    osc.frequency.setValueAtTime(track.freq, now);

    if (track.pitch) {
      osc.frequency.exponentialRampToValueAtTime(track.freq * 0.5, now + track.duration);
    }

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + track.duration);

    osc.start(now);
    osc.stop(now + track.duration);
  } catch(e) {}
}

// Sequencer tick
function tick() {
  // Update highlight
  document.querySelectorAll('.step-btn').forEach(btn => {
    const step = parseInt(btn.dataset.step);
    btn.classList.toggle('current', step === currentStep);
  });

  // Play active steps
  TRACKS.forEach(track => {
    if (grid[track.name][currentStep]) {
      playSound(track);
    }
  });

  currentStep = (currentStep + 1) % STEPS;
}

// Update interval based on BPM
function getInterval() {
  return (60 / bpm / 4) * 1000; // 16th notes
}

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
  document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('active', 'current'));
  setStatus('', 'Grid cleared');
});

// BPM Controls
document.getElementById('bpmUp').addEventListener('click', () => {
  const input = document.getElementById('bpm');
  const val = Math.min(240, parseInt(input.value) + 5);
  input.value = val;
  if (isPlaying) restartPlayback();
});

document.getElementById('bpmDown').addEventListener('click', () => {
  const input = document.getElementById('bpm');
  const val = Math.max(40, parseInt(input.value) - 5);
  input.value = val;
  if (isPlaying) restartPlayback();
});

document.getElementById('bpm').addEventListener('change', () => {
  bpm = parseInt(document.getElementById('bpm').value) || 120;
  if (isPlaying) restartPlayback();
});

function restartPlayback() {
  clearInterval(intervalId);
  bpm = parseInt(document.getElementById('bpm').value) || 120;
  intervalId = setInterval(tick, getInterval());
}

// Save pattern
document.getElementById('saveBtn').addEventListener('click', async () => {
  const pattern = {
    name: 'BeatForge Pattern',
    bpm: parseInt(document.getElementById('bpm').value),
    steps: STEPS,
    kickPattern: grid['Kick'],
    snarePattern: grid['Snare'],
    hihatPattern: grid['Hi-Hat']
  };

  try {
    const res = await fetch('/api/patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pattern)
    });
    const saved = await res.json();
    setStatus('saved', 'Pattern saved');
    document.getElementById('savedInfo').textContent = 'ID: ' + saved.id;
  } catch (e) {
    setStatus('', 'Save failed — is the server running?');
  }
});

// Status helper
function setStatus(type, text) {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  dot.className = 'status-dot' + (type ? ' ' + type : '');
  txt.textContent = text;
}

// Init
renderGrid();
setStatus('', 'Ready');