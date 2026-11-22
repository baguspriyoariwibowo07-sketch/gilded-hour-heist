// Gilded Hour — wall cameras: slow sweeping cones that feed the alarm.
// A camera never chases; it watches, and being caught in its cone raises the
// alarm fast. Smoke blinds cameras too.

import { segmentBlocked } from './guards.js';

export const CAM_RANGE = 230;
export const CAM_HALF_ANGLE = 0.38;

export function updateCamera(cam, dt) {
  cam.t += dt;
  cam.angle = cam.baseAngle + Math.sin(cam.t * cam.speed) * cam.sweep;
}

export function cameraSeesThief(cam, thief, blockers, smoked) {
  if (smoked) return false;
  const d = Math.hypot(thief.x - cam.x, thief.y - cam.y);
  if (d > CAM_RANGE) return false;
  const toThief = Math.atan2(thief.y - cam.y, thief.x - cam.x);
  let diff = toThief - cam.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > CAM_HALF_ANGLE) return false;
  if (segmentBlocked(cam.x, cam.y, thief.x, thief.y, blockers)) return false;
  return true;
}
