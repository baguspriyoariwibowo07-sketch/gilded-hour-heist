// Gilded Hour — game state, loop and rules.
// The thief moves with WASD/arrows (Shift sneaks), picks loot with E, uses
// gadgets with 1/2/3, and wins a heist by taking the signature loot from the
// vault and reaching the green exit before the alarm hits 100%.

import { HEISTS, PLAY_W, PLAY_H, HUD_H, GADGETS } from './heists.js';
import { updateGuard, segmentBlocked } from './guards.js';
import { updateCamera, cameraSeesThief } from './cameras.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { renderGame, VIEW_W, VIEW_H } from './render.js';
import { applyShot } from './shots.js';

const THIEF_SPEED = 165;
const THIEF_SNEAK = 88;
const ALARM_DECAY = 2.2;
const ALARM_GUARD_SEEN = 26;
const ALARM_CAMERA_SEEN = 34;

function cloneHeist(def) {
  return JSON.parse(JSON.stringify(def));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createState() {
  return {
    screen: 'title',
    heistIndex: 0,
    heist: cloneHeist(HEISTS[0]),
    thief: { x: 90, y: 700, angle: -Math.PI / 2, sneaking: false },
    alarm: 0, alarmPeak: 0, score: 0, spotted: 0,
    gadgets: { smoke: GADGETS[0].count, coin: GADGETS[1].count },
    smokeT: 0, noise: null, message: '', messageT: 0, messageColor: '#ffe9a8',
    time: 0, caughtBy: '', vaultBusy: 0, stepT: 0,
    rng: mulberry32(1),
  };
}

export function loadHeist(s, index) {
  s.heistIndex = index;
  s.heist = cloneHeist(HEISTS[index]);
  s.thief = { x: s.heist.start.x, y: s.heist.start.y, angle: -Math.PI / 2, sneaking: false };
  s.alarm = 0; s.alarmPeak = 0; s.score = 0; s.spotted = 0;
  s.gadgets = { smoke: GADGETS[0].count, coin: GADGETS[1].count };
  s.smokeT = 0; s.noise = null; s.vaultBusy = 0;
  s.screen = 'play';
  s.message = s.heist.name.toUpperCase() + ' — STEAL THE ' + s.heist.signature.toUpperCase();
  s.messageT = 3;
  s.messageColor = '#ffe9a8';
}

function blockersOf(h) {
  return [...h.walls, ...h.furniture];
}

function collideCircle(s, nx, ny, r) {
  for (const b of blockersOf(s.heist)) {
    if (nx + r > b.x && nx - r < b.x + b.w && ny + r > b.y && ny - r < b.y + b.h) return true;
  }
  return nx - r < 0 || nx + r > PLAY_W || ny - r < 0 || ny + r > PLAY_H;
}

function near(a, b, d) { return Math.hypot(a.x - b.x, a.y - b.y) < d; }

function flash(s, msg, color, dur = 2.4) {
  s.message = msg; s.messageColor = color || '#ffe9a8'; s.messageT = dur;
}

function updatePlay(s, dt, input, audio) {
  const t = s.thief;
  const h = s.heist;
  s.time += dt;
  if (s.messageT > 0) s.messageT -= dt;
  if (s.smokeT > 0) s.smokeT -= dt;
  if (s.noise && s.time - s.noise.t > 1.2) s.noise = null;

  // Movement.
  const ax = input.axis();
  t.sneaking = input.sneaking();
  const speed = t.sneaking ? THIEF_SNEAK : THIEF_SPEED;
  if (ax.x || ax.y) {
    const nx = t.x + ax.x * speed * dt;
    const ny = t.y + ax.y * speed * dt;
    if (!collideCircle(s, nx, t.y, 14)) t.x = nx;
    if (!collideCircle(s, t.x, ny, 14)) t.y = ny;
    t.angle = Math.atan2(ax.y, ax.x);
    s.stepT -= dt;
    if (s.stepT <= 0) { audio.step(); s.stepT = t.sneaking ? 0.55 : 0.34; }
  }

  // Gadgets.
  if (input.takePressed('1') && s.gadgets.smoke > 0 && s.smokeT <= 0) {
    s.gadgets.smoke -= 1; s.smokeT = 4; audio.smoke();
    flash(s, 'SMOKE VIAL — CONES BLIND FOR 4s', '#e8e8f0');
  }
  if (input.takePressed('2') && s.gadgets.coin > 0) {
    const click = input.consumeClick();
    const target = click || { x: t.x + Math.cos(t.angle) * 180, y: t.y + Math.sin(t.angle) * 180 };
    s.gadgets.coin -= 1;
    s.noise = { x: Math.max(20, Math.min(PLAY_W - 20, target.x)), y: Math.max(20, Math.min(PLAY_H - 20, target.y)), t: s.time };
    audio.coin();
    flash(s, 'COIN TOSSED — GUARDS GO TO THE CLINK', '#ffe9a8');
  }
  if (input.takePressed('3')) flash(s, 'LOCKPICK READY — STAND AT THE VAULT AND HOLD E', '#ffe9a8');

  // Pick up treasures with E.
  if (input.keys.has('e')) {
    for (const tr of h.treasures) {
      if (!tr.taken && near(t, tr, 30)) {
        tr.taken = true; s.score += tr.value; audio.pickup();
        flash(s, `LOOT +$${tr.value}`, '#7ae0ff', 1.4);
      }
    }
    // Vault: hold E to crack it (2s with lockpick, 5s without).
    const v = h.vault;
    if (!v.taken && t.x > v.x - 30 && t.x < v.x + v.w + 30 && t.y > v.y - 30 && t.y < v.y + v.h + 30) {
      s.vaultBusy += dt;
      const need = 2;
      if (s.vaultBusy >= need) {
        v.taken = true; s.score += h.signatureValue; audio.vault();
        flash(s, `${h.signature.toUpperCase()} STOLEN — NOW REACH THE GREEN EXIT!`, GOLD_FLASH, 3.5);
      }
    } else {
      s.vaultBusy = 0;
    }
  } else {
    s.vaultBusy = 0;
  }

  // Guards and cameras.
  const blockers = blockersOf(h);
  const smoked = s.smokeT > 0;
  let anySeen = false;
  for (const g of h.guards) {
    const before = g.state;
    const res = updateGuard(g, dt, t, blockers, smoked ? null : s.noise, s.alarm);
    if (res === 'caught') { lose(s, 'guard', audio); return; }
    if (res === 'spotted' && before !== 'alert') {
      s.spotted += 1; audio.spotted();
      flash(s, 'SPOTTED! BREAK LINE OF SIGHT!', '#ff5a5a');
    }
    if (g.state === 'alert') {
      s.alarm = Math.min(100, s.alarm + ALARM_GUARD_SEEN * dt);
      anySeen = true;
    } else if (g.state === 'suspicious') {
      s.alarm = Math.min(100, s.alarm + 6 * dt);
    }
  }
  for (const cam of h.cameras) {
    updateCamera(cam, dt);
    if (cameraSeesThief(cam, t, blockers, smoked)) {
      s.alarm = Math.min(100, s.alarm + ALARM_CAMERA_SEEN * dt);
      anySeen = true;
      if (!s.camWarned) { s.camWarned = true; audio.spotted(); flash(s, 'CAMERA HAS YOU — GET OUT OF ITS CONE!', '#ff5a5a'); }
    }
  }
  if (!anySeen) s.camWarned = false;
  if (!anySeen && s.alarm > 0) s.alarm = Math.max(0, s.alarm - ALARM_DECAY * dt);
  s.alarmPeak = Math.max(s.alarmPeak, s.alarm);
  if (s.alarm >= 100) { lose(s, 'alarm', audio); return; }

  // Win: signature loot taken, then reach the exit.
  if (h.vault.taken && t.x > h.exit.x - 10 && t.x < h.exit.x + h.exit.w + 10 && t.y > h.exit.y - 10 && t.y < h.exit.y + h.exit.h + 10) {
    s.screen = 'win';
    audio.win();
    flash(s, '', '#ffe9a8', 0);
  }
}

const GOLD_FLASH = '#ffe9a8';

function lose(s, by, audio) {
  s.screen = 'lose';
  s.caughtBy = by;
  audio.caught();
}

function updateTitle(s, input, audio) {
  if (input.takePressed('enter')) { loadHeist(s, s.heistIndex); audio.unlock(); return; }
  for (let i = 0; i < 5; i++) {
    if (input.takePressed(String(i + 1))) { loadHeist(s, i); audio.unlock(); return; }
  }
  const click = input.consumeClick();
  if (click) {
    const y = click.y;
    if (y >= 268 && y < 268 + 5 * 74) {
      const idx = Math.floor((y - 268) / 74);
      if (idx >= 0 && idx < 5) { loadHeist(s, idx); audio.unlock(); }
    }
  }
  if (input.takePressed('arrowup') || input.takePressed('w')) s.heistIndex = (s.heistIndex + 4) % 5;
  if (input.takePressed('arrowdown') || input.takePressed('s')) s.heistIndex = (s.heistIndex + 1) % 5;
}

function updateEnd(s, input, audio) {
  if (s.screen === 'win' && input.takePressed('enter')) {
    loadHeist(s, (s.heistIndex + 1) % 5);
    return;
  }
  if (s.screen === 'lose' && input.takePressed('r')) { loadHeist(s, s.heistIndex); return; }
  if (input.takePressed('t')) { s.screen = 'title'; return; }
}

export function startGame() {
  const canvas = document.getElementById('game');
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  const ctx = canvas.getContext('2d');
  const input = createInput(canvas);
  const audio = createAudio();
  const state = createState();
  window.__gildedHour = state;

  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1');
  if (shot) {
    state.rng = mulberry32(seed * 7919 + 13);
    applyShot(state, shot, seed);
  }

  const status = document.getElementById('status');
  let last = performance.now();
  let announced = '';
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // In a ?shot= state the frame is frozen: the screenshot shows the staged
    // moment exactly, with no patrol drift or alarm decay before the capture.
    if (!shot) {
      if (state.screen === 'title') updateTitle(state, input, audio);
      else if (state.screen === 'play') updatePlay(state, dt, input, audio);
      else updateEnd(state, input, audio);
    } else {
      state.time = 1.2;
    }
    renderGame(ctx, state);
    const line = state.screen === 'title'
      ? 'Gilded Hour title screen. Pick a heist.'
      : `${state.heist.name}. Loot $${state.score}. Alarm ${Math.round(state.alarm)} percent. ${state.screen}.`;
    if (line !== announced) { announced = line; if (status) status.textContent = line; }
    input.endFrame();
    requestAnimationFrame(frame);
  }
  canvas.addEventListener('mousedown', () => audio.unlock(), { once: true });
  window.addEventListener('keydown', () => audio.unlock(), { once: true });
  requestAnimationFrame(frame);
}

startGame();
