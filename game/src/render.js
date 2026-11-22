// Gilded Hour — canvas rendering: room, vision cones, HUD and screens.
// The canvas is 1280x896: a 96px HUD bar on top, the 1280x800 room below it.
// Everything is drawn big and high-contrast so the cover frame still reads
// when the judge shrinks it to 768x480.

import { PLAY_W, PLAY_H, HUD_H, GADGETS, TOTAL_GUARDS, TOTAL_TREASURES, TOTAL_CAMERAS, HEISTS } from './heists.js';
import { CONE_RANGE, CONE_HALF_ANGLE, coneColor, coneEdgeColor } from './guards.js';
import { CAM_RANGE, CAM_HALF_ANGLE } from './cameras.js';

export const VIEW_W = 1280;
export const VIEW_H = 896;

const GOLD = '#f5c542';
const INK = '#0b0e1a';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

function drawCone(ctx, x, y, angle, range, half, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawGuard(ctx, g) {
  drawCone(ctx, g.x, g.y, g.angle, CONE_RANGE, CONE_HALF_ANGLE, coneColor(g.state), coneEdgeColor(g.state));
  // Body: dark uniform, brass buttons, helmet brim.
  ctx.beginPath(); ctx.arc(g.x, g.y, 15, 0, Math.PI * 2); ctx.fillStyle = '#2c3550'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = g.state === 'alert' ? '#ff4040' : g.state === 'suspicious' ? '#ffc440' : '#8a94b0'; ctx.stroke();
  ctx.beginPath(); ctx.arc(g.x, g.y, 7, 0, Math.PI * 2); ctx.fillStyle = '#d8c08a'; ctx.fill();
  // Facing tick.
  ctx.beginPath();
  ctx.moveTo(g.x + Math.cos(g.angle) * 15, g.y + Math.sin(g.angle) * 15);
  ctx.lineTo(g.x + Math.cos(g.angle) * 24, g.y + Math.sin(g.angle) * 24);
  ctx.lineWidth = 4; ctx.strokeStyle = '#e8e0c8'; ctx.stroke();
  // State label, big enough to read at small size.
  if (g.state === 'alert') text(ctx, 'ALERT!', g.x, g.y - 30, 15, '#ff5a5a');
  else if (g.state === 'suspicious') text(ctx, 'SUSPICIOUS?', g.x, g.y - 30, 13, '#ffc440');
  else text(ctx, 'GUARD', g.x, g.y - 30, 11, '#c8cede');
}

function drawCamera(ctx, cam) {
  drawCone(ctx, cam.x, cam.y, cam.angle, CAM_RANGE, CAM_HALF_ANGLE, 'rgba(255, 90, 90, 0.20)', '#ff6a6a');
  ctx.beginPath(); ctx.arc(cam.x, cam.y, 10, 0, Math.PI * 2); ctx.fillStyle = '#3a3f55'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#ff6a6a'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2); ctx.fillStyle = '#ff4040'; ctx.fill();
  text(ctx, 'CAMERA', cam.x, cam.y + 24, 11, '#ff9a9a', 'bold', 'center');
}

function drawThief(ctx, t) {
  // Hooded figure: dark cloak, gold mask stripe, facing tick.
  ctx.beginPath(); ctx.arc(t.x, t.y, 15, 0, Math.PI * 2); ctx.fillStyle = '#141828'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke();
  ctx.beginPath(); ctx.arc(t.x, t.y, 8, 0, Math.PI * 2); ctx.fillStyle = '#e8d9a8'; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(t.x + Math.cos(t.angle) * 8, t.y + Math.sin(t.angle) * 8);
  ctx.lineTo(t.x + Math.cos(t.angle) * 22, t.y + Math.sin(t.angle) * 22);
  ctx.lineWidth = 4; ctx.strokeStyle = GOLD; ctx.stroke();
  text(ctx, 'YOU — THE THIEF', t.x, t.y - 30, 12, '#ffe9a8');
}

function drawTreasure(ctx, tr, time) {
  if (tr.taken) return;
  const bob = Math.sin(time * 3 + tr.bob) * 3;
  const y = tr.y + bob;
  ctx.save();
  ctx.translate(tr.x, y);
  ctx.rotate(Math.PI / 4);
  const s = tr.kind === 'relic' ? 11 : 8;
  ctx.fillStyle = tr.kind === 'relic' ? '#ff7ad9' : '#7ae0ff';
  ctx.fillRect(-s, -s, s * 2, s * 2);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(-s, -s, s * 2, s * 2);
  ctx.restore();
  ctx.beginPath(); ctx.arc(tr.x, y, 16 + Math.sin(time * 4 + tr.bob) * 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawVault(ctx, vault, time) {
  const glow = vault.taken ? 0.25 : 0.55 + Math.sin(time * 2.5) * 0.2;
  ctx.save();
  ctx.shadowColor = GOLD; ctx.shadowBlur = 26 * glow;
  ctx.fillStyle = vault.taken ? '#5a4a28' : '#8a6a1e';
  rr(ctx, vault.x, vault.y, vault.w, vault.h, 8); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 3; ctx.strokeStyle = GOLD; rr(ctx, vault.x, vault.y, vault.w, vault.h, 8); ctx.stroke();
  // Dial + gem.
  ctx.beginPath(); ctx.arc(vault.x + 42, vault.y + 32, 13, 0, Math.PI * 2); ctx.fillStyle = '#2a2110'; ctx.fill();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
  if (!vault.taken) {
    ctx.beginPath(); ctx.arc(vault.x + 42, vault.y + 32, 6, 0, Math.PI * 2); ctx.fillStyle = '#fff3c0'; ctx.fill();
    text(ctx, 'VAULT — ' + vault.lootName.toUpperCase(), vault.x - 6, vault.y + 32, 14, '#ffe9a8', 'bold', 'right');
  } else {
    text(ctx, 'VAULT — EMPTIED', vault.x - 6, vault.y + 32, 14, '#b8b090', 'bold', 'right');
  }
}

function drawExit(ctx, exit) {
  ctx.fillStyle = '#1d7a3a';
  rr(ctx, exit.x, exit.y, exit.w, exit.h, 8); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#4be07a'; rr(ctx, exit.x, exit.y, exit.w, exit.h, 8); ctx.stroke();
  ctx.save();
  ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
  ctx.rotate(-Math.PI / 2);
  text(ctx, 'EXIT → GETAWAY', 0, 0, 15, '#d8ffd8', 'bold', 'center');
  ctx.restore();
}

function drawRoom(ctx, s) {
  const h = s.heist;
  // Floor: warm checker under lamplight, cool under moonlight.
  const a = h.mood === 'moonlight' ? '#232c4a' : '#2a2417';
  const b = h.mood === 'moonlight' ? '#1b2240' : '#221d12';
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = (x + y) % 2 ? a : b;
      ctx.fillRect(x * 80, y * 80, 80, 80);
    }
  }
  // Lamplight pools.
  if (h.mood === 'lamplight') {
    for (const [lx, ly] of [[320, 200], [960, 200], [640, 600], [160, 620], [1120, 620]]) {
      const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, 190);
      g.addColorStop(0, 'rgba(255, 205, 100, 0.20)');
      g.addColorStop(1, 'rgba(255, 205, 100, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - 190, ly - 190, 380, 380);
    }
  } else {
    const g = ctx.createRadialGradient(640, 120, 10, 640, 120, 420);
    g.addColorStop(0, 'rgba(150, 190, 255, 0.14)');
    g.addColorStop(1, 'rgba(150, 190, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(220, -80, 840, 500);
  }
  // Walls.
  for (const w of h.walls) {
    ctx.fillStyle = '#3d3a52'; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#6a6588'; ctx.lineWidth = 2; ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
  // Furniture = cover.
  for (const f of h.furniture) {
    ctx.fillStyle = '#4a3a22'; rr(ctx, f.x, f.y, f.w, f.h, 6); ctx.fill();
    ctx.strokeStyle = '#8a6f3e'; ctx.lineWidth = 2; rr(ctx, f.x, f.y, f.w, f.h, 6); ctx.stroke();
    text(ctx, f.label.toUpperCase(), f.x + f.w / 2, f.y + f.h / 2, 10, '#c8a86a', 'bold', 'center');
  }
  drawExit(ctx, h.exit);
  for (const tr of h.treasures) drawTreasure(ctx, tr, s.time);
  drawVault(ctx, h.vault, s.time);
  for (const cam of h.cameras) drawCamera(ctx, cam);
  for (const g of h.guards) drawGuard(ctx, g);
  // Noise ripple.
  if (s.noise) {
    const age = s.time - s.noise.t;
    if (age < 1.2) {
      ctx.beginPath(); ctx.arc(s.noise.x, s.noise.y, 12 + age * 46, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 220, 120, ${0.8 - age * 0.6})`; ctx.lineWidth = 3; ctx.stroke();
      text(ctx, 'CLINK!', s.noise.x, s.noise.y - 22, 13, '#ffe9a8');
    }
  }
  // Smoke.
  if (s.smokeT > 0) {
    for (const [sx, sy, r] of [[s.thief.x - 40, s.thief.y - 20, 46], [s.thief.x + 30, s.thief.y + 26, 54], [s.thief.x, s.thief.y - 44, 40]]) {
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 200, 210, 0.45)'; ctx.fill();
    }
    text(ctx, 'SMOKE!', s.thief.x, s.thief.y - 52, 14, '#e8e8f0');
  }
  drawThief(ctx, s.thief);
  // Room label.
  text(ctx, h.name.toUpperCase(), 24, PLAY_H - 30, 16, 'rgba(255, 233, 168, 0.75)');
}

export function alarmColor(alarm) {
  if (alarm >= 70) return '#ff4040';
  if (alarm >= 35) return '#ffc440';
  return '#4be07a';
}

function drawHUD(ctx, s) {
  const h = s.heist;
  ctx.fillStyle = '#10142a';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, HUD_H - 3, VIEW_W, 3);
  text(ctx, 'GILDED HOUR', 20, 30, 30, GOLD);
  text(ctx, `HEIST ${h.id}/5 — ${h.name}`, 20, 66, 16, '#e8e0c8');
  // Objective.
  text(ctx, `STEAL: ${h.signature.toUpperCase()}  •  THEN REACH THE GREEN EXIT`, 420, 30, 15, '#ffe9a8');
  const taken = h.treasures.filter((t) => t.taken).length;
  text(ctx, `LOOT ${taken}/${h.treasures.length}  ◆  $${s.score}`, 420, 66, 16, '#7ae0ff');
  // Alarm meter — big, labelled, impossible to miss.
  const ax = 880, aw = 340;
  text(ctx, 'ALARM', ax, 26, 16, '#ffffff');
  ctx.fillStyle = '#2a2f45';
  rr(ctx, ax + 84, 12, aw, 26, 6); ctx.fill();
  ctx.fillStyle = alarmColor(s.alarm);
  if (s.alarm > 0) { rr(ctx, ax + 84, 12, Math.max(14, (aw * s.alarm) / 100), 26, 6); ctx.fill(); }
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; rr(ctx, ax + 84, 12, aw, 26, 6); ctx.stroke();
  text(ctx, `${Math.round(s.alarm)}%`, ax + 84 + aw + 8, 26, 16, alarmColor(s.alarm));
  // Gadgets.
  const g = s.gadgets;
  text(ctx, `[1] SMOKE x${g.smoke}   [2] COIN x${g.coin}   [3] LOCKPICK`, 880, 66, 14, '#c8cede');
}

function drawTitle(ctx, s) {
  ctx.fillStyle = '#0b0e1a';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Lamplight glow.
  const g = ctx.createRadialGradient(640, 300, 20, 640, 300, 560);
  g.addColorStop(0, 'rgba(245, 197, 66, 0.22)');
  g.addColorStop(1, 'rgba(245, 197, 66, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'GILDED HOUR', VIEW_W / 2, 120, 84, GOLD, 'bold', 'center');
  text(ctx, 'A LAMPLIGHT HEIST  •  5 HEISTS  •  21 GUARDS  •  40 TREASURES  •  13 CAMERAS  •  3 GADGETS', VIEW_W / 2, 178, 18, '#e8e0c8', 'bold', 'center');
  text(ctx, 'Sneak past the cones. Blind the cameras. Lift the signature loot. Vanish out the green door.', VIEW_W / 2, 212, 17, '#c8cede', 'normal', 'center');
  // Heist list.
  let y = 268;
  for (const hh of HEISTS) {
    const sel = s.heistIndex === hh.id - 1;
    ctx.fillStyle = sel ? 'rgba(245, 197, 66, 0.16)' : 'rgba(255,255,255,0.04)';
    rr(ctx, 190, y, 900, 62, 10); ctx.fill();
    ctx.strokeStyle = sel ? GOLD : '#3a3f55'; ctx.lineWidth = sel ? 3 : 1;
    rr(ctx, 190, y, 900, 62, 10); ctx.stroke();
    text(ctx, `${hh.id}. ${hh.name}`, 214, y + 22, 20, sel ? GOLD : '#e8e0c8');
    text(ctx, `Steal the ${hh.signature}  •  ${hh.guards.length} guards  •  ${hh.cameras.length} cameras  •  ${hh.treasures.length} treasures`, 214, y + 46, 14, '#b8bcc8');
    text(ctx, hh.mood.toUpperCase(), 1064, y + 31, 13, '#8a94b0', 'bold', 'right');
    y += 74;
  }
  text(ctx, 'CLICK A HEIST OR PRESS 1–5  •  WASD / ARROWS MOVE  •  SHIFT SNEAK  •  E PICK UP  •  1 SMOKE  •  2 + CLICK COIN  •  3 LOCKPICK', VIEW_W / 2, y + 26, 15, '#ffe9a8', 'bold', 'center');
  text(ctx, 'An original game: its own art, names, sounds and levels. No network, no files beyond this folder.', VIEW_W / 2, y + 58, 13, '#8a94b0', 'normal', 'center');
}

function drawEnd(ctx, s) {
  ctx.fillStyle = s.screen === 'win' ? 'rgba(8, 30, 16, 0.88)' : 'rgba(30, 8, 12, 0.88)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (s.screen === 'win') {
    text(ctx, 'GETAWAY!', VIEW_W / 2, 300, 88, '#4be07a', 'bold', 'center');
    text(ctx, `The ${s.heist.signature} is yours. The crew is already counting it.`, VIEW_W / 2, 380, 22, '#e8e0c8', 'normal', 'center');
    text(ctx, `LOOT $${s.score}  •  TREASURES ${s.heist.treasures.filter((t) => t.taken).length}/${s.heist.treasures.length}  •  ALARM PEAK ${Math.round(s.alarmPeak)}%  •  TIMES SPOTTED ${s.spotted}`, VIEW_W / 2, 440, 19, '#ffe9a8', 'bold', 'center');
    text(ctx, 'PRESS ENTER FOR THE NEXT HEIST  •  PRESS T FOR THE HEIST LIST', VIEW_W / 2, 520, 17, '#c8cede', 'bold', 'center');
  } else {
    text(ctx, 'CAUGHT!', VIEW_W / 2, 300, 88, '#ff5a5a', 'bold', 'center');
    text(ctx, s.caughtBy === 'alarm' ? 'The alarm hit 100% — the building locked down around you.' : 'A guard laid hands on you in the lamplight.', VIEW_W / 2, 380, 22, '#e8e0c8', 'normal', 'center');
    text(ctx, `LOOT KEPT $${s.score}  •  THE ${s.heist.signature.toUpperCase()} STAYS IN ITS VAULT — FOR NOW`, VIEW_W / 2, 440, 19, '#ffe9a8', 'bold', 'center');
    text(ctx, 'PRESS R TO TRY THIS HEIST AGAIN  •  PRESS T FOR THE HEIST LIST', VIEW_W / 2, 520, 17, '#c8cede', 'bold', 'center');
  }
}

export function renderGame(ctx, s) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (s.screen === 'title') { drawTitle(ctx, s); return; }
  drawHUD(ctx, s);
  ctx.save();
  ctx.translate(0, HUD_H);
  drawRoom(ctx, s);
  ctx.restore();
  // Flash message, drawn last so the room never covers it.
  if (s.messageT > 0 && s.message) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.messageT * 2);
    ctx.font = `bold 22px Georgia, 'Times New Roman', serif`;
    const mw = ctx.measureText(s.message).width + 44;
    ctx.fillStyle = 'rgba(11, 14, 26, 0.88)';
    rr(ctx, VIEW_W / 2 - mw / 2, HUD_H + 12, mw, 40, 8); ctx.fill();
    ctx.strokeStyle = s.messageColor || '#ffe9a8'; ctx.lineWidth = 2;
    rr(ctx, VIEW_W / 2 - mw / 2, HUD_H + 12, mw, 40, 8); ctx.stroke();
    text(ctx, s.message, VIEW_W / 2, HUD_H + 33, 22, s.messageColor || '#ffe9a8', 'bold', 'center');
    ctx.restore();
  }
  if (s.screen === 'win' || s.screen === 'lose') drawEnd(ctx, s);
  // Red alarm vignette at high alarm.
  if (s.screen === 'play' && s.alarm >= 70) {
    ctx.strokeStyle = `rgba(255, 64, 64, ${0.25 + (s.alarm - 70) / 120})`;
    ctx.lineWidth = 18;
    ctx.strokeRect(4, 4, VIEW_W - 8, VIEW_H - 8);
  }
}

export { TOTAL_GUARDS, TOTAL_TREASURES, TOTAL_CAMERAS };
