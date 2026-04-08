'use strict';

// ==================== UTILS ====================
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  el.style.left            = Math.random() * 100 + 'vw';
  el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.width           = (6 + Math.random() * 10) + 'px';
  el.style.height          = (6 + Math.random() * 10) + 'px';
  el.style.borderRadius    = Math.random() > 0.5 ? '50%' : '2px';
  const dur = 2.5 + Math.random() * 3;
  el.style.animationDuration = dur + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 200);
}

// Gentle ongoing drizzle once chat is open
let drizzleActive = false;
const drizzleInterval = setInterval(() => {
  if (drizzleActive) spawnConfettiPiece();
}, 400);

// ==================== INTERACTIVE CONFETTI ====================
let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
  if (!drizzleActive) return;
  const now = Date.now();
  if (now - lastTrailTime < 40) return; // throttle to ~25fps
  lastTrailTime = now;
  spawnInteractiveConfetti(e.clientX, e.clientY, 'trail');
});

document.addEventListener('click', (e) => {
  if (!drizzleActive) return;
  if (e.target.closest('#wa-send-btn, #wa-tap-hint, #chat-challenge-btn, a, button')) return;
  for (let i = 0; i < 22; i++) spawnInteractiveConfetti(e.clientX, e.clientY, 'explode');
  playPop();
});

function spawnInteractiveConfetti(x, y, type) {
  const el   = document.createElement('div');
  el.className = `confetti-interact ${type}`;
  const size = (type === 'trail' ? 4 : 6) + Math.random() * 6;
  el.style.width           = size + 'px';
  el.style.height          = size + 'px';
  el.style.left            = x + 'px';
  el.style.top             = y + 'px';
  el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.borderRadius    = Math.random() > 0.4 ? '50%' : '2px';

  if (type === 'explode') {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 80 + Math.random() * 160;
    el.style.setProperty('--tx',  Math.cos(angle) * dist + 'px');
    el.style.setProperty('--ty',  Math.sin(angle) * dist + 'px');
    el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    el.style.setProperty('--dur', (0.5 + Math.random() * 0.7) + 's');
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), type === 'trail' ? 700 : 1300);
}

// ==================== WEB AUDIO ====================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, start, gain = 0.28) {
  if (gain <= 0) return;
  const ctx  = getAudioCtx();
  const osc  = ctx.createOscillator();
  const vol  = ctx.createGain();
  osc.connect(vol); vol.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  vol.gain.setValueAtTime(gain, start);
  vol.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start); osc.stop(start + duration);
}
function playPop() {
  const ctx = getAudioCtx(), now = ctx.currentTime;
  playTone(600, 'sine', 0.1, now, 0.35);
  playTone(900, 'sine', 0.08, now + 0.05, 0.25);
}
function playFanfare() {
  const ctx = getAudioCtx(), now = ctx.currentTime;
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
    playTone(f, 'square', 0.18, now + i * 0.12, 0.22));
}
// WhatsApp-style message received "ding"
function playDing() {
  const ctx = getAudioCtx(), now = ctx.currentTime;
  playTone(880, 'sine', 0.15, now, 0.18);
  playTone(1100, 'sine', 0.1, now + 0.07, 0.12);
}

// ==================== TOAST ====================
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '5rem', left: '50%',
    transform: 'translateX(-50%) translateY(14px)',
    background: 'rgba(0,0,0,0.85)', color: '#fff',
    padding: '0.65rem 1.4rem', borderRadius: '99px',
    fontSize: '0.95rem', zIndex: '99999',
    opacity: '0', transition: 'opacity 0.3s, transform 0.3s',
    maxWidth: '90vw', textAlign: 'center', pointerEvents: 'none',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity   = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

// ==================== MESSAGE TEMPLATES ====================
function mkChessHTML() {
  return `<span class="chess-card-board">♟ ♔ ♛ ♜ ♝ ♞</span>
    <strong style="display:block;margin:0.35rem 0 0.2rem;">We made you a chess game 🎮</strong>
    <div style="font-size:0.82rem;color:var(--wa-text-dim);margin-bottom:0.6rem;">Two players · pass the device · zero regrets 😄</div>
    <a href="chess.html" class="chat-card-btn chess-btn">♟️ Open Chess</a>`;
}

function mkBirthdayHTML() {
  return `🎂🎉<br>HAPPY BIRTHDAY,<br>ALI!!<br>🎉🎂`;
}

function mkJokeHTML(emoji, tag, body) {
  return `<span class="joke-emoji">${emoji}</span>
    <strong style="color:var(--secondary);display:block;margin:0.15rem 0 0.35rem;">${tag}</strong>
    <span style="font-size:0.9rem;">${body}</span>`;
}

function mkPlaneHTML() {
  return `<div style="font-size:0.85rem;color:var(--wa-text-dim);margin-bottom:0.3rem;">
      this plane is flying to Katowice. yes, really 😂
    </div>
    <a href="map.html" class="chat-plane" title="See Ali's journey">✈️</a>
    <div style="font-size:0.72rem;color:var(--wa-text-dim);margin-top:0.15rem;">tap the plane ↑</div>`;
}

function mkChallengeHTML() {
  return `<div class="challenge-header">🔒 Unlock Ali's Secret Message</div>
    <p style="font-size:0.82rem;color:var(--wa-text-dim);margin:0.35rem 0 0.65rem;">
      Click <strong style="color:var(--secondary)">15&nbsp;times</strong>
      to unlock. No shortcuts. Pure dedication.
    </p>
    <span id="chat-challenge-count">0</span>
    <div id="chat-progress-wrap"><div id="chat-progress-bar"></div></div>
    <p id="chat-challenge-progress">15 clicks to go…</p>
    <button id="chat-challenge-btn">💖 Click for Ali</button>`;
}

function mkHeartfeltHTML() {
  return `<h3>🎂 For Ali, with love 🎂</h3>
    <p>Okay, the chaos is over — for a second. 🙂<br><br>
    In all seriousness, you are one of the most genuinely kind,
    hilariously funny, and wonderfully weird people I know.
    Every moment with you turns into a story worth retelling
    (sometimes against our will 😂).<br><br>
    You bring so much light and laughter into the lives of everyone
    around you, and today we get to celebrate <em>you</em> — the
    legend, the myth, the person who somehow makes even the most
    mundane Tuesday feel like an adventure.<br><br>
    I hope this birthday is as brilliant, chaotic, and utterly
    unforgettable as you are. You deserve every single good thing
    the universe has to offer — and maybe a slice (or five) of cake.
    🎂🍰🧁</p>
    <p class="heartfelt-sig">
      Happy Birthday, Ali! 🥳🎉<br>
      <span>— Your friends who definitely didn't spend too long on this</span>
    </p>`;
}

// ==================== MESSAGE SCRIPT ====================
// Each beat is one of:
//   { type:'preload', ... }   — shown instantly when chat opens
//   { type:'delay',  ms }     — pause before continuing
//   { type:'msg',    ... }    — show typing indicator then append bubble
//   { type:'gate',   label }  — pause until user taps the input bar
const SCRIPT = [
  // ---- Pre-existing messages (already "sent" earlier today) ----
  { type:'preload', bubbleClass:'',           text:'hey!! 👀 we made you something...',         time:'10:29 AM' },
  { type:'preload', bubbleClass:'chess-bubble', html:mkChessHTML(),                              time:'10:31 AM' },
  { type:'preload', bubbleClass:'',           text:'let us know when you see this 😏',          time:'10:31 AM' },

  { type:'delay', ms: 1400 },

  // ---- Phase 1: calm intro (auto-play) ----
  { type:'msg', text:'Hey, Ali... 👀',                                                           typing: 850  },
  { type:'msg', text:'I just wanted to take a quiet moment to pass along...',                   typing: 1600 },
  { type:'msg', text:'a small, totally normal, completely ordinary message. 😇',                typing: 1250 },
  { type:'msg', text:'absolutely nothing unusual here. nope. 🙃',                              typing: 1000 },
  { type:'msg', text:'...are you ready? 🤔',                                                    typing: 850  },

  { type:'gate', label:'Tap to open 📩' },

  // ---- Phase 2: birthday reveal ----
  { type:'msg', bubbleClass:'birthday-bubble', html:mkBirthdayHTML(),                           typing:2200,
    onShow: () => { launchConfettiBurst(120); playFanfare(); } },
  { type:'msg', text:'You absolute legend!! You made it another year without being launched into the sun 🌞', typing:1800 },
  { type:'msg', text:'🎈🎊🎉🦄🚀🎂🥳🎉🎊🎈',                                                  typing: 700  },
  { type:'msg', text:'We brought the whole crew to celebrate 🥳',                              typing:1000  },

  { type:'gate', label:'Tap for the receipts 😬' },

  // ---- Phase 3: jokes ----
  { type:'msg', bubbleClass:'joke-bubble',
    html: mkJokeHTML('🤣','JOKE_A',
      'Remember the time you tried to <strong>[JOKE_A: insert the legendary story here]</strong>? '
    + 'To this day nobody has fully recovered. Scientists are still studying it.'),
    typing: 1300 },

  { type:'gate', label:'Next one 👀' },

  { type:'msg', bubbleClass:'joke-bubble',
    html: mkJokeHTML('😬','JOKE_B',
      'Nobody will EVER forget <strong>[JOKE_B: the incident with the thing at the place]</strong>. '
    + 'Historians will call it "the event". You know what you did.'),
    typing: 1400 },

  { type:'gate', label:"Oh no, there's more..." },

  { type:'msg', bubbleClass:'joke-bubble',
    html: mkJokeHTML('💀','JOKE_C',
      'And of course, who could overlook <strong>[JOKE_C: that one phrase you always say]</strong>? '
    + "It's been said approximately 4,000 times. Merch incoming."),
    typing: 1200 },

  { type:'msg', bubbleClass:'joke-bubble',
    html: mkJokeHTML('🏆','JOKE_D',
      'Special award to Ali for <strong>[JOKE_D: that impressive/embarrassing achievement]</strong>. '
    + 'Frame it. Put it on a resumé. Own it.'),
    typing: 1300 },

  { type:'gate', label:'One more thing... ✈️' },

  // ---- Phase 4: airplane ----
  { type:'msg', text:'oh also btw...',                                                           typing: 600 },
  { type:'msg', bubbleClass:'plane-bubble', html:mkPlaneHTML(),                                 typing:1050 },

  { type:'gate', label:'Unlock your birthday gift 🎁' },

  // ---- Phase 5: challenge (heartfelt is unlocked programmatically after) ----
  { type:'msg', bubbleClass:'challenge-bubble', html:mkChallengeHTML(),                         typing:1500 },
];

// ==================== CHAT ENGINE ====================
let qIdx     = 0;
let gateOpen = false;
let busy     = false;

const chatEl   = document.getElementById('chat-messages');
const winEl    = document.getElementById('chat-window');
const tapEl    = document.getElementById('wa-tap-hint');
const sendEl   = document.getElementById('wa-send-btn');
const typingEl = document.getElementById('typing-indicator');
const statusEl = document.getElementById('wa-header-status');

function scrollBottom() {
  winEl.scrollTo({ top: winEl.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
  typingEl.style.display = 'flex';
  statusEl.textContent   = 'typing...';
  scrollBottom();
}

function hideTyping() {
  typingEl.style.display = 'none';
  statusEl.textContent   = 'online';
}

function buildBubble(beat, timeStr) {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';

  const bubble = document.createElement('div');
  bubble.className = `wa-bubble ${beat.bubbleClass || ''}`;

  if (beat.html) {
    bubble.innerHTML = beat.html;
  } else {
    bubble.textContent = beat.text || '';
  }

  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = timeStr;
  bubble.appendChild(ts);

  wrap.appendChild(bubble);
  return wrap;
}

function appendMsg(beat) {
  const el = buildBubble(beat, beat.time || getTime());
  chatEl.insertBefore(el, typingEl);
  scrollBottom();
  playDing();
  if (beat.onShow) beat.onShow();
  if (beat.bubbleClass === 'challenge-bubble') initChallenge();
  return el;
}

function setGate(label) {
  gateOpen = true;
  tapEl.textContent = label || 'Tap to continue...';
  tapEl.classList.add('active-hint');
  sendEl.classList.remove('locked');
}

function clearGate() {
  gateOpen = false;
  tapEl.textContent = 'Type a message';
  tapEl.classList.remove('active-hint');
  sendEl.classList.add('locked');
}

function advance() {
  if (busy || qIdx >= SCRIPT.length) return;

  const beat = SCRIPT[qIdx++];

  if (beat.type === 'preload') {
    appendMsg(beat);
    advance();
    return;
  }

  if (beat.type === 'delay') {
    setTimeout(advance, beat.ms || 1000);
    return;
  }

  if (beat.type === 'gate') {
    setGate(beat.label);
    return;
  }

  if (beat.type === 'msg') {
    busy = true;
    sendEl.classList.add('locked');
    showTyping();
    setTimeout(() => {
      hideTyping();
      appendMsg(beat);
      busy = false;
      // Immediately advance to see if next is gate/delay/another msg
      const next = SCRIPT[qIdx];
      if (!next) return;
      if (next.type === 'msg') {
        setTimeout(advance, 280);
      } else {
        advance();
      }
    }, beat.typing || 1000);
  }
}

function handleTap() {
  if (!gateOpen || busy) return;
  clearGate();
  playPop();
  advance();
}

tapEl.addEventListener('click',   handleTap);
sendEl.addEventListener('click',  handleTap);
tapEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
});

// ==================== STATE PERSISTENCE ====================
// State is saved to sessionStorage only when the user explicitly navigates to
// map.html or chess.html.  The wa_return flag is the guard: it is set on that
// click and consumed when index.html reloads.  A hard refresh (F5) never sets
// the flag, so the conversation always starts fresh on a true page reload.
//
// To avoid injecting raw HTML from sessionStorage (XSS risk), we serialise
// only primitive data: beat indices that have been rendered.  On restore we
// reconstruct each bubble from the original SCRIPT array and template
// functions — no external HTML ever enters innerHTML.

function saveState() {
  // Collect indices of beats that have already been rendered (preload/msg only)
  const renderedIdxs = [];
  for (let i = 0; i < qIdx; i++) {
    const t = SCRIPT[i].type;
    if (t === 'preload' || t === 'msg') renderedIdxs.push(i);
  }

  sessionStorage.setItem('wa_state', JSON.stringify({
    renderedIdxs,
    heartfeltShown,
    qIdx,
    gateOpen,
    gateLabel:      gateOpen ? tapEl.textContent : null,
    challengeCount,
    challengeDone,
  }));
  sessionStorage.setItem('wa_return', '1');
}

// Intercept clicks on outbound links so state is saved before navigating away
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href="map.html"], a[href="chess.html"]');
  if (!link) return;
  saveState();
}, true); // capture phase so it fires before any stopPropagation

function restoreChallenge() {
  const btn        = document.getElementById('chat-challenge-btn');
  const countEl    = document.getElementById('chat-challenge-count');
  const barEl      = document.getElementById('chat-progress-bar');
  const progressEl = document.getElementById('chat-challenge-progress');

  if (countEl) countEl.textContent = challengeCount;
  if (barEl)   barEl.style.width   = (challengeCount / 15 * 100) + '%';

  if (challengeDone) {
    if (progressEl) progressEl.textContent = '🎉 Unlocked!';
    if (btn) { btn.disabled = true; btn.textContent = '✅ Done!'; }
  } else {
    const rem = 15 - challengeCount;
    if (progressEl) progressEl.textContent = rem + ' click' + (rem === 1 ? '' : 's') + ' to go…';
    initChallenge(); // re-attach click handler
  }
}

function buildHeartfeltWrap() {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble heartfelt-bubble';
  bubble.innerHTML = mkHeartfeltHTML(); // mkHeartfeltHTML is hardcoded, not user-supplied
  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = getTime();
  bubble.appendChild(ts);
  wrap.appendChild(bubble);
  return wrap;
}

function loadState() {
  if (sessionStorage.getItem('wa_return') !== '1') return false;
  const raw = sessionStorage.getItem('wa_state');
  if (!raw) { sessionStorage.removeItem('wa_return'); return false; }
  sessionStorage.removeItem('wa_return');

  let s;
  try { s = JSON.parse(raw); } catch (e) { return false; }

  qIdx           = s.qIdx           || 0;
  challengeCount = s.challengeCount || 0;
  challengeDone  = s.challengeDone  || false;
  heartfeltShown = s.heartfeltShown || false;

  // Re-render saved beats without pop-in animation
  chatEl.classList.add('restore-mode');

  for (const idx of (s.renderedIdxs || [])) {
    const beat = SCRIPT[idx];
    if (!beat) continue;
    const el = buildBubble(beat, beat.time || getTime());
    chatEl.insertBefore(el, typingEl);
    // initChallenge is handled separately via restoreChallenge below
  }

  if (heartfeltShown) {
    chatEl.insertBefore(buildHeartfeltWrap(), typingEl);
  }

  requestAnimationFrame(() => chatEl.classList.remove('restore-mode'));

  // Re-wire the challenge button if it's in the restored DOM
  if (document.getElementById('chat-challenge-btn')) {
    restoreChallenge();
  }

  if (s.gateOpen && s.gateLabel) {
    setGate(s.gateLabel);
  } else {
    clearGate();
    if (qIdx < SCRIPT.length) setTimeout(advance, 350);
  }

  scrollBottom();
  return true;
}

// ==================== CHALLENGE ====================
let challengeCount = 0;
let challengeDone  = false;
let heartfeltShown = false;

function initChallenge() {
  const btn = document.getElementById('chat-challenge-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    if (challengeDone) return;
    challengeCount++;

    const countEl    = document.getElementById('chat-challenge-count');
    const barEl      = document.getElementById('chat-progress-bar');
    const progressEl = document.getElementById('chat-challenge-progress');

    countEl.textContent = challengeCount;
    barEl.style.width   = (challengeCount / 15 * 100) + '%';

    for (let i = 0; i < 10; i++) spawnInteractiveConfetti(e.clientX, e.clientY, 'explode');
    playPop();

    if (challengeCount >= 15) {
      challengeDone = true;
      progressEl.textContent = '🎉 Unlocked!';
      btn.disabled    = true;
      btn.textContent = '✅ Done!';
      setTimeout(revealHeartfelt, 900);
    } else {
      const rem = 15 - challengeCount;
      progressEl.textContent = rem + ' click' + (rem === 1 ? '' : 's') + ' to go…';
    }
  });
}

function revealHeartfelt() {
  showTyping();
  statusEl.textContent = 'typing...';
  setTimeout(() => {
    hideTyping();
    heartfeltShown = true;
    chatEl.insertBefore(buildHeartfeltWrap(), typingEl);
    scrollBottom();
    launchConfettiBurst(80);
    playFanfare();
  }, 1800);
}

// ==================== LOADING SCREEN ====================
function runLoadingBar() {
  const bar      = document.getElementById('wa-load-progress');
  const isReturn = sessionStorage.getItem('wa_return') === '1';
  let pct = 0;
  const tick = isReturn ? 70 : 160;
  const iv = setInterval(() => {
    pct += isReturn ? (Math.random() * 45 + 30) : (Math.random() * 18 + 4);
    if (pct > 100) pct = 100;
    bar.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(openChat, isReturn ? 180 : 500);
    }
  }, tick);
}

function openChat() {
  const loading = document.getElementById('wa-loading');
  const app     = document.getElementById('wa-app');

  loading.classList.add('fade-out');
  setTimeout(() => {
    loading.style.display = 'none';
    app.removeAttribute('aria-hidden');
    app.classList.add('visible');
    drizzleActive = true;

    // If returning from map/chess, restore saved state; otherwise start fresh
    if (!loadState()) {
      setTimeout(advance, 500);
    }
  }, 580);
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  const isReturn = sessionStorage.getItem('wa_return') === '1';
  if (isReturn) {
    const hint = document.querySelector('.wa-load-hint');
    if (hint) hint.innerHTML = 'Reconnecting<span class="wa-load-dots"></span>';
  }
  clearGate();
  runLoadingBar();
});
