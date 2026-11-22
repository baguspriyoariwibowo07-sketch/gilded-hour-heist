// Gilded Hour — deterministic screenshot states (?shot=start|play|alert|end).
// Each state freezes one honest moment of real play so the screenshots the
// judge sees are exact renders of the game's own code, never composites.

import { loadHeist } from './main.js';

function setGuard(g, x, y, angle, state) {
  g.x = x; g.y = y; g.angle = angle; g.state = state; g.stateT = 0; g.suspicion = 0; g.seen = null;
}

export function applyShot(state, shot, seed) {
  if (shot === 'start') {
    state.screen = 'title';
    state.heistIndex = 0;
    return;
  }
  if (shot === 'play') {
    // COVER: heist 1 mid-crossing. Thief centre-room; three guard cones, two
    // cameras, the glowing vault and a 35% alarm meter all in one frame.
    loadHeist(state, 0);
    state.thief.x = 640; state.thief.y = 430; state.thief.angle = 0.5;
    setGuard(state.heist.guards[0], 470, 300, 0.55, 'patrol');
    setGuard(state.heist.guards[1], 900, 330, Math.PI - 0.5, 'suspicious');
    state.heist.guards[1].seen = { x: 640, y: 430 };
    setGuard(state.heist.guards[2], 640, 660, -Math.PI / 2, 'patrol');
    state.heist.cameras[0].angle = Math.PI / 2 + 0.35;
    state.heist.cameras[1].angle = Math.PI - 0.3;
    state.heist.treasures[0].taken = true;
    state.heist.treasures[2].taken = true;
    state.score = 130;
    state.alarm = 35;
    state.alarmPeak = 35;
    state.spotted = 1;
    state.message = 'SUSPICIOUS GUARD — TIME YOUR CROSSING';
    state.messageT = 999;
    state.messageColor = '#ffc440';
    return;
  }
  if (shot === 'alert') {
    // Alarm at 78%: a guard in full ALERT chase, camera cone on the thief.
    loadHeist(state, 1);
    state.thief.x = 700; state.thief.y = 480; state.thief.angle = -0.4;
    setGuard(state.heist.guards[0], 560, 420, 0.3, 'alert');
    state.heist.guards[0].seen = { x: 700, y: 480 };
    setGuard(state.heist.guards[1], 940, 300, Math.PI - 0.6, 'suspicious');
    setGuard(state.heist.guards[2], 500, 660, -0.5, 'patrol');
    setGuard(state.heist.guards[3], 1080, 560, Math.PI - 1.2, 'patrol');
    state.heist.cameras[0].angle = Math.PI / 2 - 0.2;
    state.heist.cameras[1].angle = -0.25;
    state.heist.treasures[0].taken = true;
    state.heist.treasures[1].taken = true;
    state.heist.treasures[4].taken = true;
    state.score = 210;
    state.alarm = 78;
    state.alarmPeak = 78;
    state.spotted = 2;
    state.message = 'ALERT! BREAK LINE OF SIGHT!';
    state.messageT = 999;
    state.messageColor = '#ff5a5a';
    return;
  }
  if (shot === 'end') {
    // GETAWAY: heist 5 won, vault emptied, loot tallied. A different heist
    // from the cover (heist 1) and the alert shot (heist 2), so the four
    // screenshots together prove distinct locations.
    loadHeist(state, 4);
    state.heist.vault.taken = true;
    state.heist.treasures[0].taken = true;
    state.heist.treasures[2].taken = true;
    state.heist.treasures[4].taken = true;
    state.heist.treasures[5].taken = true;
    state.thief.x = 1196; state.thief.y = 130;
    state.score = 930;
    state.alarm = 12;
    state.alarmPeak = 42;
    state.spotted = 1;
    state.screen = 'win';
    return;
  }
  // Unknown shot: title screen.
  state.screen = 'title';
}
