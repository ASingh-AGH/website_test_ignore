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

// ==================== STICKER ASSETS ====================
const STICKER_AFTER_HI  = 'https://github.com/user-attachments/assets/847194f1-748a-4dfa-9ca0-f5328ce6ecf7';
const STICKER_AFTER_BET = 'https://github.com/user-attachments/assets/d14a392f-0828-4423-8d50-cc61574e3d60';
const STICKER_END_1     = 'https://github.com/user-attachments/assets/defd0182-a554-49e9-93d9-e1cb6c261ad3';
const STICKER_END_2     = 'https://github.com/user-attachments/assets/c2ef7183-c644-40ca-9ba3-e1e8f029cf87';

// mkStickerHTML — builds sticker img tag from a hardcoded URL constant (never user input).
// Using createElement instead of string interpolation avoids any future XSS risk
// if the src value were ever made dynamic.
function mkStickerHTML(url) {
  const img = document.createElement('img');
  img.className = 'sticker-img';
  img.src       = url;
  img.alt       = 'sticker';
  img.loading   = 'eager';
  return img.outerHTML;
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
  return `<div style="font-size:0.85rem;color:var(--wa-text-dim);margin-bottom:0.25rem;">
      this plane is flying to Katowice. yes, really 😂
    </div>
    <div style="font-size:0.82rem;color:var(--wa-green);margin-top:0.15rem;">
      ✈️ catch the plane flying around your screen!
    </div>`;
}

function mkChallengeHTML() {
  return `<div class="challenge-header">🔒 Unlock Ali's Secret Message</div>
    <p style="font-size:0.82rem;color:var(--wa-text-dim);margin:0.35rem 0 0.65rem;">
      Click <strong style="color:var(--secondary)">24&nbsp;times</strong>
      to unlock. No shortcuts. Pure dedication.
    </p>
    <span id="chat-challenge-count">0</span>
    <div id="chat-progress-wrap"><div id="chat-progress-bar"></div></div>
    <p id="chat-challenge-progress">24 clicks to go…</p>
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
  { type:'preload', bubbleClass:'',           text:'hi 👋',                                                          time:'10:28 AM' },
  { type:'preload', bubbleClass:'sticker-bubble', html:mkStickerHTML(STICKER_AFTER_HI),                               time:'10:29 AM' },
  { type:'preload', bubbleClass:'',           text:':)))))',                                                            time:'10:31 AM' },

  { type:'delay', ms: 1400 },

  // ---- Phase 1: calm intro (auto-play) ----
  { type:'msg', text:'Since you are unable to stop reading my mind',                                                           typing: 850  },
  { type:'msg', text:'You somehow already guessed that your birthday present is this website',                   typing: 1600 },
  { type:'msg', text:'bet you didnt think it would be an actual whatsapp message 😂',                typing: 1250 },
  { type:'msg', bubbleClass:'sticker-bubble', html:mkStickerHTML(STICKER_AFTER_BET),                 typing: 800  },

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
  { type:'msg', bubbleClass:'plane-bubble', html:mkPlaneHTML(),                                 typing:1050,
    onShow: () => launchFlyingPlane() },

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

// ==================== FLYING PLANE ====================
let planeActive = false; // prevent relaunching

function launchFlyingPlane() {
  const plane = document.getElementById('flying-plane');
  if (!plane || planeActive) return;
  planeActive = true;

  plane.removeAttribute('hidden');
  showToast('✈️ Catch the plane to see the map!');

  let x  = Math.random() * Math.max(1, window.innerWidth  - 80);
  let y  = 80 + Math.random() * Math.max(1, window.innerHeight - 180);
  let vx = (Math.random() < 0.5 ? 1 : -1) * (9 + Math.random() * 7);
  let vy = (Math.random() < 0.5 ? 1 : -1) * (6 + Math.random() * 6);

  plane.style.left = x + 'px';
  plane.style.top  = y + 'px';

  let rafId     = null;
  let startTime = null;
  const CHAOS_MS = 5500;
  const SLOW_MS  = 2000;

  function animPlane(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    if (elapsed < CHAOS_MS) {
      // Chaotic phase — random direction nudges
      if (Math.random() < 0.06) {
        vx += (Math.random() - 0.5) * 12;
        vy += (Math.random() - 0.5) * 12;
      }
      const spd = Math.hypot(vx, vy);
      if (spd > 16) { vx = vx / spd * 16; vy = vy / spd * 16; }
      if (spd < 7)  { vx = vx / spd * 7;  vy = vy / spd * 7;  }
    } else if (elapsed < CHAOS_MS + SLOW_MS) {
      // Decelerate toward viewport centre
      const t  = (elapsed - CHAOS_MS) / SLOW_MS;
      const cx = window.innerWidth  / 2 - 30;
      const cy = window.innerHeight / 2 - 30;
      vx = vx * 0.90 + (cx - x) * 0.018 * t;
      vy = vy * 0.90 + (cy - y) * 0.018 * t;
    } else {
      // Arrived — hover + make clickable
      plane.classList.add('plane-ready');
      showToast('✈️ Tap the plane to see the map!');
      return; // stop RAF
    }

    // Bounce off screen edges (leave room for header)
    const W = window.innerWidth, H = window.innerHeight;
    if (x < 8)      { x = 8;      vx =  Math.abs(vx); }
    if (x > W - 68) { x = W - 68; vx = -Math.abs(vx); }
    if (y < 64)     { y = 64;     vy =  Math.abs(vy); }
    if (y > H - 72) { y = H - 72; vy = -Math.abs(vy); }

    x += vx;
    y += vy;

    const angle = Math.atan2(vy, vx) * 180 / Math.PI;
    plane.style.left      = x + 'px';
    plane.style.top       = y + 'px';
    plane.style.transform = `rotate(${angle}deg)`;

    rafId = requestAnimationFrame(animPlane);
  }

  rafId = requestAnimationFrame(animPlane);

  // Navigate to map when the plane is ready and tapped
  plane.addEventListener('click', () => {
    if (!plane.classList.contains('plane-ready')) return;
    saveState();
    window.location.href = 'map.html';
  });
}
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
  const renderedIdxs = [];
  for (let i = 0; i < qIdx; i++) {
    const t = SCRIPT[i].type;
    if (t === 'preload' || t === 'msg') renderedIdxs.push(i);
  }

  sessionStorage.setItem('wa_state', JSON.stringify({
    renderedIdxs,
    heartfeltShown,
    endStickersShown,
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
  if (barEl)   barEl.style.width   = (challengeCount / CHALLENGE_CLICKS * 100) + '%';

  if (challengeDone) {
    if (progressEl) progressEl.textContent = '🎉 Unlocked!';
    if (btn) { btn.disabled = true; btn.textContent = '✅ Done!'; }
  } else {
    const rem = CHALLENGE_CLICKS - challengeCount;
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

// Builds a sticker wrap element from a hardcoded URL constant.
// The url parameter is always one of STICKER_END_1 / STICKER_END_2 —
// it is never sourced from sessionStorage or user input, so img.src is safe.
function buildStickerWrap(url) {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble sticker-bubble';
  const img = document.createElement('img');
  img.className = 'sticker-img';
  img.src       = url;   // hardcoded constant — not from sessionStorage
  img.alt       = 'sticker';
  img.loading   = 'eager';
  bubble.appendChild(img);
  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = getTime();
  bubble.appendChild(ts);
  wrap.appendChild(bubble);
  return wrap;
}

function buildChessWrap() {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble chess-bubble';
  bubble.innerHTML = mkChessHTML(); // mkChessHTML is hardcoded, not user-supplied
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

  qIdx              = s.qIdx              || 0;
  challengeCount    = s.challengeCount    || 0;
  challengeDone     = s.challengeDone     || false;
  heartfeltShown    = s.heartfeltShown    || false;
  endStickersShown  = s.endStickersShown  || 0;

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
    // Restore end stickers that had appeared after the heartfelt
    if (endStickersShown >= 1) chatEl.insertBefore(buildStickerWrap(STICKER_END_1), typingEl);
    if (endStickersShown >= 2) chatEl.insertBefore(buildStickerWrap(STICKER_END_2), typingEl);
    if (endStickersShown >= 3) chatEl.insertBefore(buildChessWrap(), typingEl);
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
const CHALLENGE_CLICKS = 24; // Ali is turning 24!
let challengeCount    = 0;
let challengeDone     = false;
let heartfeltShown    = false;
let endStickersShown  = 0;

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
    barEl.style.width   = (challengeCount / CHALLENGE_CLICKS * 100) + '%';

    for (let i = 0; i < 10; i++) spawnInteractiveConfetti(e.clientX, e.clientY, 'explode');
    playPop();

    if (challengeCount >= CHALLENGE_CLICKS) {
      challengeDone = true;
      progressEl.textContent = '🎉 Unlocked!';
      btn.disabled    = true;
      btn.textContent = '✅ Done!';
      setTimeout(revealHeartfelt, 900);
    } else {
      const rem = CHALLENGE_CLICKS - challengeCount;
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
    // End stickers appear shortly after the heartfelt message
    setTimeout(() => {
      endStickersShown = 1;
      chatEl.insertBefore(buildStickerWrap(STICKER_END_1), typingEl);
      scrollBottom();
      playDing();
    }, 1600);
    setTimeout(() => {
      endStickersShown = 2;
      chatEl.insertBefore(buildStickerWrap(STICKER_END_2), typingEl);
      scrollBottom();
      playDing();
    }, 3000);
    setTimeout(() => {
      endStickersShown = 3;
      chatEl.insertBefore(buildChessWrap(), typingEl);
      scrollBottom();
      playDing();
      // Dino wanders in ~3 s after chess
      setTimeout(showDinoGame, 3000);
    }, 4500);
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

  // ---- Hamburger menu ----
  const menuBtn      = document.getElementById('wa-menu-btn');
  const menuDropdown = document.getElementById('wa-menu-dropdown');
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menuDropdown.hasAttribute('hidden');
      if (isOpen) {
        menuDropdown.setAttribute('hidden', '');
        menuBtn.setAttribute('aria-expanded', 'false');
      } else {
        menuDropdown.removeAttribute('hidden');
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    });
    // Close on any outside click
    document.addEventListener('click', () => {
      if (!menuDropdown.hasAttribute('hidden')) {
        menuDropdown.setAttribute('hidden', '');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// ==================== DINO GAME ====================
// Phases: 'intro' (walk-in) → 'idle' (tap to start) → 'playing' → 'dead'
let dinoGameStarted = false;

function showDinoGame() {
  if (dinoGameStarted) return;
  dinoGameStarted = true;

  const overlay = document.getElementById('dino-overlay');
  const canvas  = document.getElementById('dino-canvas');
  if (!overlay || !canvas) return;

  overlay.removeAttribute('hidden');
  overlay.classList.add('active');

  // Size canvas to device pixels
  function resize() {
    canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx  = canvas.getContext('2d');
  const DPR  = () => window.devicePixelRatio || 1;

  // ---------- constants ----------
  const GROUND_RATIO = 0.72; // fraction of canvas height for ground line
  const GRAVITY  = 0.55;
  const JUMP_VEL = -12.5;
  const BASE_SPD = 6;

  // ---------- state ----------
  let phase     = 'intro'; // intro | idle | playing | dead
  let frameId   = 0;
  let score     = 0;
  let highScore = 0;
  let speed     = BASE_SPD;

  // dino walk sprite (3 leg frames)
  const DINO_W = 40, DINO_H = 52;
  let dinoX, dinoY, dinoVY = 0, dinoOnGround = true;
  let legFrame = 0, legTick = 0;

  // cacti
  let cacti = [];
  let cactusTimer = 0;
  let nextCactus  = 90;

  // intro: dino starts off-screen right and walks in
  let introX;

  function groundY() {
    return Math.floor(canvas.height * GROUND_RATIO);
  }

  function reset() {
    dinoY = groundY() - DINO_H;
    dinoVY = 0;
    dinoOnGround = true;
    dinoX = Math.floor(canvas.width * 0.12);
    cacti = [];
    cactusTimer = 0;
    nextCactus  = 80 + Math.floor(Math.random() * 60);
    score  = 0;
    speed  = BASE_SPD;
    legFrame = 0; legTick = 0;
  }

  function drawDino(x, y, dead) {
    const dpr = DPR();
    const s = dpr; // scale factor relative to CSS pixels already baked in
    ctx.save();

    // body
    ctx.fillStyle = dead ? '#e04060' : '#e9edef';
    ctx.beginPath();
    ctx.roundRect(x, y, DINO_W * dpr, DINO_H * 0.65 * dpr, 4 * dpr);
    ctx.fill();

    // neck + head
    ctx.fillStyle = dead ? '#e04060' : '#e9edef';
    ctx.beginPath();
    ctx.roundRect(x + DINO_W * 0.45 * dpr, y - DINO_H * 0.3 * dpr,
                  DINO_W * 0.55 * dpr, DINO_H * 0.48 * dpr, 4 * dpr);
    ctx.fill();

    // eye
    ctx.fillStyle = dead ? '#fff' : '#0b141a';
    const eyeR = 4 * dpr;
    ctx.beginPath();
    ctx.arc(x + DINO_W * 0.82 * dpr, y - DINO_H * 0.08 * dpr, eyeR, 0, Math.PI * 2);
    ctx.fill();
    if (dead) {
      // X eyes
      ctx.strokeStyle = '#0b141a';
      ctx.lineWidth = 2 * dpr;
      const ex = x + DINO_W * 0.82 * dpr, ey = y - DINO_H * 0.08 * dpr;
      ctx.beginPath(); ctx.moveTo(ex - eyeR, ey - eyeR); ctx.lineTo(ex + eyeR, ey + eyeR); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + eyeR, ey - eyeR); ctx.lineTo(ex - eyeR, ey + eyeR); ctx.stroke();
    }

    // tail
    ctx.fillStyle = dead ? '#e04060' : '#e9edef';
    ctx.beginPath();
    ctx.roundRect(x - DINO_W * 0.3 * dpr, y + DINO_H * 0.2 * dpr,
                  DINO_W * 0.35 * dpr, DINO_H * 0.18 * dpr, 3 * dpr);
    ctx.fill();

    // legs
    if (!dead) {
      const legOffsets = legFrame === 0 ? [0.15, 0.6] : legFrame === 1 ? [0.05, 0.5] : [0.2, 0.55];
      legOffsets.forEach((off) => {
        ctx.fillStyle = '#e9edef';
        ctx.beginPath();
        ctx.roundRect(x + off * DINO_W * dpr, y + DINO_H * 0.62 * dpr,
                      DINO_W * 0.2 * dpr, DINO_H * 0.38 * dpr, 3 * dpr);
        ctx.fill();
      });
    } else {
      // static legs when dead
      [[0.1, 0.25], [0.5, 0.35]].forEach(([off, ang]) => {
        ctx.fillStyle = '#e04060';
        ctx.save();
        ctx.translate(x + off * DINO_W * dpr, y + DINO_H * 0.62 * dpr);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.roundRect(0, 0, DINO_W * 0.2 * dpr, DINO_H * 0.38 * dpr, 3 * dpr);
        ctx.fill();
        ctx.restore();
      });
    }
    ctx.restore();
  }

  function drawCactus(cx, cy, w, h) {
    const dpr = DPR();
    ctx.fillStyle = '#25d366';
    // trunk
    const tw = w * 0.35 * dpr;
    ctx.beginPath();
    ctx.roundRect(cx + (w * dpr - tw) / 2, cy, tw, h * dpr, 3 * dpr);
    ctx.fill();
    // left arm
    ctx.beginPath();
    ctx.roundRect(cx, cy + h * 0.3 * dpr, (w * dpr - tw) / 2 + tw * 0.5, h * 0.25 * dpr, 3 * dpr);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx, cy + h * 0.1 * dpr, tw * 0.7, h * 0.22 * dpr, 3 * dpr);
    ctx.fill();
    // right arm
    const rx = cx + (w * dpr - tw) / 2 + tw * 0.5;
    ctx.beginPath();
    ctx.roundRect(rx, cy + h * 0.25 * dpr, (w * dpr - tw) / 2, h * 0.25 * dpr, 3 * dpr);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + w * dpr - tw * 0.7, cy + h * 0.05 * dpr, tw * 0.7, h * 0.22 * dpr, 3 * dpr);
    ctx.fill();
  }

  function drawScene(dead) {
    const dpr   = DPR();
    const W     = canvas.width;
    const H     = canvas.height;
    const gY    = groundY();

    ctx.clearRect(0, 0, W, H);

    // ground line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth   = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(W, gY);
    ctx.stroke();

    // score
    if (phase === 'playing' || phase === 'dead') {
      ctx.fillStyle   = 'rgba(233,237,239,0.8)';
      ctx.font        = `bold ${13 * dpr}px monospace`;
      ctx.textAlign   = 'right';
      ctx.fillText('HI ' + String(highScore).padStart(5,'0') + '  ' + String(score).padStart(5,'0'),
                   W - 12 * dpr, 22 * dpr);
    }

    // hint text
    if (phase === 'idle') {
      ctx.fillStyle = 'rgba(0,168,132,0.9)';
      ctx.font      = `${12 * dpr}px 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🦕  SPACE / TAP to start', W / 2, gY - 20 * dpr);
    }

    if (phase === 'dead') {
      ctx.fillStyle = 'rgba(233,237,239,0.92)';
      ctx.font      = `bold ${13 * dpr}px 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER — tap to restart', W / 2, gY - 22 * dpr);
    }

    // cacti
    cacti.forEach(c => drawCactus(c.x, gY - c.h * dpr, c.w, c.h));

    // dino
    drawDino(dinoX, dinoY, dead);
  }

  function jump() {
    if (dinoOnGround) {
      dinoVY = JUMP_VEL * DPR();
      dinoOnGround = false;
      playPop();
    }
  }

  function handleInput() {
    if (phase === 'idle') {
      phase = 'playing';
      reset();
    } else if (phase === 'playing') {
      jump();
    } else if (phase === 'dead') {
      phase = 'playing';
      reset();
    }
  }

  canvas.addEventListener('click', handleInput);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); }, { passive: false });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && (phase === 'idle' || phase === 'playing' || phase === 'dead')) {
      e.preventDefault();
      handleInput();
    }
  });

  // ---- intro walk-in ----
  function startIntro() {
    const dpr  = DPR();
    introX = canvas.width + DINO_W * dpr * 2;
    dinoY  = groundY() - DINO_H * dpr;
    dinoVY = 0;
    dinoOnGround = true;
    dinoX  = Math.floor(canvas.width * 0.12);
  }

  startIntro();

  function introFrame() {
    const dpr = DPR();
    const W   = canvas.width, H = canvas.height;
    const gY  = groundY();

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth   = 1.5 * dpr;
    ctx.beginPath(); ctx.moveTo(0, gY); ctx.lineTo(W, gY); ctx.stroke();

    // hint at idle position
    ctx.fillStyle = 'rgba(0,168,132,0.7)';
    ctx.font      = `${11 * dpr}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🦕  incoming…', W / 2, gY - 16 * dpr);

    // walk legs
    legTick++;
    if (legTick % 7 === 0) legFrame = (legFrame + 1) % 3;

    const walkSpeed = 4 * dpr;
    introX -= walkSpeed;

    drawDino(introX, gY - DINO_H * dpr, false);

    if (introX <= dinoX) {
      phase = 'idle';
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(gameLoop);
    } else {
      frameId = requestAnimationFrame(introFrame);
    }
  }

  function gameLoop() {
    const dpr = DPR();
    const W   = canvas.width;
    const gY  = groundY();

    if (phase === 'idle') {
      legTick++;
      if (legTick % 18 === 0) legFrame = (legFrame + 1) % 3;
      drawScene(false);
      frameId = requestAnimationFrame(gameLoop);
      return;
    }

    if (phase === 'dead') {
      drawScene(true);
      frameId = requestAnimationFrame(gameLoop);
      return;
    }

    // --- playing ---
    score++;
    if (score > highScore) highScore = score;
    if (score % 200 === 0) speed = Math.min(BASE_SPD + score / 200, 16);

    // dino physics
    if (!dinoOnGround) {
      dinoVY += GRAVITY * dpr;
      dinoY  += dinoVY;
      const floor = gY - DINO_H * dpr;
      if (dinoY >= floor) {
        dinoY = floor;
        dinoVY = 0;
        dinoOnGround = true;
      }
    }

    // legs walk animation
    legTick++;
    if (legTick % 6 === 0) legFrame = (legFrame + 1) % 3;

    // spawn cacti
    cactusTimer++;
    if (cactusTimer >= nextCactus) {
      const h = 28 + Math.floor(Math.random() * 24);
      const w = 18 + Math.floor(Math.random() * 14);
      cacti.push({ x: W, h, w });
      cactusTimer = 0;
      nextCactus  = 60 + Math.floor(Math.random() * 80);
    }

    // move + prune cacti
    cacti = cacti.filter(c => c.x > -c.w * dpr * 2);
    cacti.forEach(c => { c.x -= speed * dpr; });

    // collision
    const dLeft   = dinoX + DINO_W * 0.25 * dpr;
    const dRight  = dinoX + DINO_W * 0.85 * dpr;
    const dBottom = dinoY + DINO_H * 0.95 * dpr;
    const dTop    = dinoY + DINO_H * 0.2  * dpr;

    for (const c of cacti) {
      const cLeft   = c.x + c.w * 0.1 * dpr;
      const cRight  = c.x + c.w * 0.9 * dpr;
      const cTop    = gY - c.h * dpr;
      if (dRight > cLeft && dLeft < cRight && dBottom > cTop) {
        phase = 'dead';
        playTone(200, 'sawtooth', 0.3, getAudioCtx().currentTime, 0.35);
        break;
      }
    }

    drawScene(false);
    frameId = requestAnimationFrame(gameLoop);
  }

  frameId = requestAnimationFrame(introFrame);
}
