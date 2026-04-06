// ==================== CONFIG ====================
const CHALLENGE_TARGET = 15; // clicks needed to unlock heartfelt message
let challengeCount = 0;
let chaosStarted = false;

// ==================== DOM REFS ====================
const introPage       = document.getElementById('intro-page');
const chaosPage       = document.getElementById('chaos-page');
const calmBtn         = document.getElementById('calm-btn');
const dodgeBtn        = document.getElementById('dodge-btn');
const challengeBtn    = document.getElementById('challenge-btn');
const challengeCountEl = document.getElementById('challenge-count');
const challengeProgress = document.getElementById('challenge-progress');
const progressBar     = document.getElementById('progress-bar');
const heartfeltSection = document.getElementById('heartfelt-section');
const confettiContainer = document.getElementById('confetti-container');

// ==================== INTRO → CHAOS ====================
calmBtn.addEventListener('click', launchChaos);

// Also auto-launch after 5 seconds for maximum ambush effect
setTimeout(() => {
  if (!chaosStarted) launchChaos();
}, 5000);

function launchChaos() {
  if (chaosStarted) return;
  chaosStarted = true;

  // Flash the intro page white
  introPage.style.transition = 'opacity 0.3s';
  introPage.style.opacity = '0';

  setTimeout(() => {
    introPage.style.display = 'none';
    chaosPage.classList.add('visible', 'chaos-bg');

    // Fire confetti immediately
    launchConfettiBurst(120);

    // Play a fun web-audio fanfare
    playFanfare();

    // Activate dodging button
    initDodgeButton();
  }, 350);
}

// ==================== CONFETTI ====================
const CONFETTI_COLORS = ['#ff4fa3','#ffe94f','#4ff0ff','#a84fff','#ff6b35','#7fff00'];

function launchConfettiBurst(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnConfettiPiece(), Math.random() * 1800);
  }
}

function spawnConfettiPiece() {
  const el = document.createElement('div');
  el.className = 'confetti-piece';
  el.style.left = Math.random() * 100 + 'vw';
  el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.width  = (6 + Math.random() * 10) + 'px';
  el.style.height = (6 + Math.random() * 10) + 'px';
  el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
  const duration = 2.5 + Math.random() * 3;
  el.style.animationDuration = duration + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000 + 200);
}

// Ongoing confetti drizzle – stored so it can be cleared if needed
const confettiInterval = setInterval(() => {
  if (chaosStarted) spawnConfettiPiece();
}, 300);

// ==================== DODGE BUTTON ====================
function initDodgeButton() {
  dodgeBtn.style.left = '50%';
  dodgeBtn.style.top  = '50%';
}

document.addEventListener('mousemove', (e) => {
  if (!chaosStarted) return;

  const btnRect = dodgeBtn.getBoundingClientRect();
  const btnCx = btnRect.left + btnRect.width  / 2;
  const btnCy = btnRect.top  + btnRect.height / 2;

  const dx = e.clientX - btnCx;
  const dy = e.clientY - btnCy;
  const dist = Math.hypot(dx, dy);
  const FLEE_RADIUS = 140;

  if (dist < FLEE_RADIUS) {
    const flee = FLEE_RADIUS - dist;
    const angle = Math.atan2(dy, dx);
    let newX = btnRect.left - Math.cos(angle) * flee;
    let newY = btnRect.top  - Math.sin(angle) * flee;

    // Clamp to viewport
    newX = Math.max(10, Math.min(window.innerWidth  - btnRect.width  - 10, newX));
    newY = Math.max(10, Math.min(window.innerHeight - btnRect.height - 10, newY));

    dodgeBtn.style.left = newX + 'px';
    dodgeBtn.style.top  = newY + 'px';
    dodgeBtn.style.transition = 'left 0.15s, top 0.15s';
  }
});

dodgeBtn.addEventListener('click', () => {
  playPop();
  showToast('😱 You caught me! Here, have a virtual cupcake 🧁');
  launchConfettiBurst(30);
});

// Touch / mobile dodge
document.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  document.dispatchEvent(new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  }));
}, { passive: true });

// ==================== CHALLENGE BUTTON ====================
challengeBtn.addEventListener('click', () => {
  if (challengeCount >= CHALLENGE_TARGET) return;
  challengeCount++;
  const pct = (challengeCount / CHALLENGE_TARGET) * 100;

  challengeCountEl.textContent = challengeCount;
  progressBar.style.width = pct + '%';
  challengeProgress.textContent =
    challengeCount < CHALLENGE_TARGET
      ? `${CHALLENGE_TARGET - challengeCount} more click${CHALLENGE_TARGET - challengeCount !== 1 ? 's' : ''} to go...`
      : '';

  playPop();
  launchConfettiBurst(8);

  if (challengeCount >= CHALLENGE_TARGET) {
    unlockHeartfelt();
  }
});

function unlockHeartfelt() {
  challengeBtn.disabled = true;
  challengeBtn.textContent = '🎉 UNLOCKED!';

  setTimeout(() => {
    heartfeltSection.classList.add('visible');
    heartfeltSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    launchConfettiBurst(200);
    playFanfare();
  }, 600);
}

// ==================== WEB AUDIO SOUNDS ====================
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, type, duration, startTime, gainVal = 0.3) {
  if (gainVal <= 0) return;
  const ctx = getAudioCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playPop() {
  const ctx  = getAudioCtx();
  const now  = ctx.currentTime;
  playTone(600, 'sine', 0.1, now, 0.4);
  playTone(900, 'sine', 0.08, now + 0.05, 0.3);
}

function playFanfare() {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523, 659, 784, 1047, 784, 1047]; // C5 E5 G5 C6 G5 C6
  notes.forEach((freq, i) => playTone(freq, 'square', 0.18, now + i * 0.12, 0.25));
}

// Random silly sound on emoji click
document.querySelectorAll('.emoji-ring span').forEach(el => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freq = 200 + Math.random() * 800;
    playTone(freq, ['sine','square','sawtooth'][Math.floor(Math.random()*3)], 0.3, now, 0.4);
    launchConfettiBurst(15);
  });
});

// ==================== TOAST NOTIFICATIONS ====================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '999px',
    fontSize: '1rem',
    zIndex: '99999',
    opacity: '0',
    transition: 'opacity 0.3s, transform 0.3s',
    maxWidth: '90vw',
    textAlign: 'center'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
