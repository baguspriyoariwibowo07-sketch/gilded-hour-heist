// Gilded Hour — keyboard and mouse input.
// WASD / arrows move, Shift sneaks, E picks up and opens, 1/2/3 use gadgets,
// mouse click throws a coin at the cursor (gadget 2) or clicks menu buttons.

export function createInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
  const pressed = new Set();

  function keyName(e) {
    const k = e.key.toLowerCase();
    if (k === ' ') return 'space';
    return k;
  }

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (!keys.has(k)) pressed.add(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(keyName(e)));
  window.addEventListener('blur', () => { keys.clear(); pressed.clear(); });

  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = 1280 / rect.width, sy = 896 / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }
  canvas.addEventListener('mousemove', (e) => { const p = toGame(e); mouse.x = p.x; mouse.y = p.y; });
  canvas.addEventListener('mousedown', (e) => {
    const p = toGame(e);
    mouse.x = p.x; mouse.y = p.y; mouse.clicked = true; mouse.clickX = p.x; mouse.clickY = p.y;
  });

  return {
    keys, mouse,
    axis() {
      let x = 0, y = 0;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },
    sneaking() { return keys.has('shift'); },
    takePressed(k) { const hit = pressed.has(k); pressed.delete(k); return hit; },
    consumeClick() { const c = mouse.clicked; mouse.clicked = false; return c ? { x: mouse.clickX, y: mouse.clickY } : null; },
    endFrame() { pressed.clear(); },
  };
}
