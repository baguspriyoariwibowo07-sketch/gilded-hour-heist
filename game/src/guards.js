// Gilded Hour — guard patrols, vision cones and suspicion.
// A guard walks its waypoints, sweeps its cone, and moves through three states:
// patrol (calm) -> suspicious (investigate a glimpse or a noise) -> alert (chase).
// Line of sight is blocked by walls and furniture, so cover is real cover.

export const CONE_RANGE = 210;
export const CONE_HALF_ANGLE = 0.46;
export const SPOT_TIME = 0.9;

function dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Segment (x1,y1)-(x2,y2) against an axis-aligned rect; true when blocked.
export function segmentBlocked(x1, y1, x2, y2, rects) {
  for (const r of rects) {
    const minX = r.x, maxX = r.x + r.w, minY = r.y, maxY = r.y + r.h;
    if (x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) return true;
    if (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY) return true;
    const dx = x2 - x1, dy = y2 - y1;
    const hits = [];
    if (dx !== 0) {
      let t = (minX - x1) / dx; if (t >= 0 && t <= 1) { const y = y1 + t * dy; if (y >= minY && y <= maxY) hits.push(t); }
      t = (maxX - x1) / dx; if (t >= 0 && t <= 1) { const y = y1 + t * dy; if (y >= minY && y <= maxY) hits.push(t); }
    }
    if (dy !== 0) {
      let t = (minY - y1) / dy; if (t >= 0 && t <= 1) { const x = x1 + t * dx; if (x >= minX && x <= maxX) hits.push(t); }
      t = (maxY - y1) / dy; if (t >= 0 && t <= 1) { const x = x1 + t * dx; if (x >= minX && x <= maxX) hits.push(t); }
    }
    if (hits.length) return true;
  }
  return false;
}

export function guardSeesThief(guard, thief, blockers) {
  const d = dist(guard.x, guard.y, thief.x, thief.y);
  if (d > CONE_RANGE) return 0;
  const toThief = Math.atan2(thief.y - guard.y, thief.x - guard.x);
  if (Math.abs(angleDiff(toThief, guard.angle)) > CONE_HALF_ANGLE) return 0;
  if (segmentBlocked(guard.x, guard.y, thief.x, thief.y, blockers)) return 0;
  // Closer and more centred reads are stronger; sneaking halves the read.
  const centred = 1 - Math.abs(angleDiff(toThief, guard.angle)) / CONE_HALF_ANGLE;
  const near = 1 - d / CONE_RANGE;
  const sneak = thief.sneaking ? 0.5 : 1;
  return (0.35 + 0.65 * centred * 0.6 + 0.4 * near) * sneak;
}

function moveToward(g, tx, ty, speed, dt, blockers) {
  const dx = tx - g.x, dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  const nx = g.x + (dx / d) * step, ny = g.y + (dy / d) * step;
  const r = 14;
  const blocked = blockers.some((b) => nx + r > b.x && nx - r < b.x + b.w && ny + r > b.y && ny - r < b.y + b.h);
  if (!blocked) { g.x = nx; g.y = ny; }
  g.angle = Math.atan2(dy, dx);
  return d <= step + 1;
}

export function updateGuard(g, dt, thief, blockers, noise, alarm) {
  g.stateT += dt;
  const seen = guardSeesThief(g, thief, blockers);
  if (g.state === 'patrol') {
    if (seen > 0) {
      g.suspicion = (g.suspicion || 0) + seen * dt;
      if (g.suspicion > SPOT_TIME) { g.state = 'alert'; g.stateT = 0; g.suspicion = 0; }
      else if (g.suspicion > 0.25) { g.state = 'suspicious'; g.stateT = 0; g.seen = { x: thief.x, y: thief.y }; }
    } else {
      g.suspicion = Math.max(0, (g.suspicion || 0) - dt * 0.8);
    }
    const target = g.waypoints[g.wp];
    const arrived = moveToward(g, target[0], target[1], g.speed, dt, blockers);
    if (arrived) g.wp = (g.wp + 1) % g.waypoints.length;
  } else if (g.state === 'suspicious') {
    if (seen > 0.55) { g.state = 'alert'; g.stateT = 0; return 'spotted'; }
    if (g.seen) {
      const arrived = moveToward(g, g.seen.x, g.seen.y, g.speed * 1.25, dt, blockers);
      if (arrived || g.stateT > 6) { g.state = 'patrol'; g.stateT = 0; g.seen = null; }
    } else if (noise) {
      moveToward(g, noise.x, noise.y, g.speed * 1.25, dt, blockers);
      if (dist(g.x, g.y, noise.x, noise.y) < 26 || g.stateT > 6) { g.state = 'patrol'; g.stateT = 0; }
    } else if (g.stateT > 4) { g.state = 'patrol'; g.stateT = 0; }
  } else { // alert: chase the thief; give up after 8s without a fresh sighting
    if (seen > 0) { g.stateT = 0; g.seen = { x: thief.x, y: thief.y }; }
    const target = g.seen || { x: thief.x, y: thief.y };
    moveToward(g, target.x, target.y, g.speed * 2.1, dt, blockers);
    if (g.stateT > 8) { g.state = 'suspicious'; g.stateT = 0; g.seen = { x: thief.x, y: thief.y }; }
    if (dist(g.x, g.y, thief.x, thief.y) < 26) return 'caught';
  }
  if (noise && g.state === 'patrol') { g.state = 'suspicious'; g.stateT = 0; g.seen = { x: noise.x, y: noise.y }; }
  return seen > 0 ? 'seen' : null;
}

export function coneColor(state) {
  if (state === 'alert') return 'rgba(255, 64, 64, 0.38)';
  if (state === 'suspicious') return 'rgba(255, 196, 64, 0.34)';
  return 'rgba(255, 214, 110, 0.24)';
}

export function coneEdgeColor(state) {
  if (state === 'alert') return '#ff4040';
  if (state === 'suspicious') return '#ffc440';
  return '#ffd66e';
}
