// Gilded Hour — the five heists: rooms, patrols, cameras, loot and exits.
// Every heist is one named location with a signature loot item. Coordinates are
// in the 1280x800 playfield; walls and furniture are cover the thief hides behind.

export const PLAY_W = 1280;
export const PLAY_H = 800;
export const HUD_H = 96;

export const GADGETS = [
  { id: 'smoke', name: 'Smoke Vial', key: '1', count: 3, blurb: 'Blinds every cone for 4s' },
  { id: 'coin', name: 'Coin Toss', key: '2', count: 5, blurb: 'Click to throw: guards investigate the clink' },
  { id: 'lockpick', name: 'Lockpick', key: '3', count: 99, blurb: 'Opens the vault in 2s instead of 5s' },
];

export function makeWall(x, y, w, h) { return { x, y, w, h }; }
export function makeGuard(x, y, waypoints, speed = 46) { return { x, y, waypoints, wp: 0, speed, angle: 0, state: 'patrol', stateT: 0, seen: null, stuckT: 0 }; }
export function makeCamera(x, y, baseAngle, sweep, speed = 0.55) { return { x, y, baseAngle, sweep, speed, t: 0 }; }
export function makeTreasure(x, y, value, kind = 'gem') { return { x, y, value, kind, taken: false, bob: Math.random() * 6.28 }; }
export function makeVault(x, y, lootName) { return { x, y, w: 84, h: 64, lootName, open: false, openT: 0, taken: false }; }

export const HEISTS = [
  {
    id: 1, name: 'The Brass Lantern Gallery', mood: 'lamplight',
    signature: 'Sunfire Opal', signatureValue: 500,
    brief: 'Slip through the gallery, lift the Sunfire Opal from its vault, and leave by the green door.',
    start: { x: 90, y: 700 }, exit: { x: 1196, y: 84, w: 56, h: 96 },
    walls: [
      makeWall(0, 0, 1280, 18), makeWall(0, 782, 1280, 18), makeWall(0, 0, 18, 800), makeWall(1262, 0, 18, 800),
      makeWall(300, 220, 220, 26), makeWall(300, 220, 26, 180),
      makeWall(760, 430, 240, 26), makeWall(760, 430, 26, 180),
      makeWall(560, 150, 26, 170), makeWall(980, 180, 26, 170),
    ],
    furniture: [
      { x: 180, y: 330, w: 90, h: 46, label: 'bench' },
      { x: 620, y: 560, w: 110, h: 50, label: 'display case' },
      { x: 1020, y: 560, w: 100, h: 50, label: 'display case' },
      { x: 420, y: 640, w: 90, h: 46, label: 'bench' },
    ],
    guards: [
      makeGuard(430, 300, [[430, 300], [700, 300], [700, 480], [430, 480]]),
      makeGuard(900, 300, [[900, 300], [1150, 300], [1150, 520], [900, 520]]),
      makeGuard(640, 640, [[640, 640], [640, 360], [960, 360], [960, 640]]),
    ],
    cameras: [
      makeCamera(640, 24, Math.PI / 2, 0.9),
      makeCamera(1256, 400, Math.PI, 0.8),
    ],
    treasures: [
      makeTreasure(250, 300, 50), makeTreasure(360, 560, 50), makeTreasure(700, 200, 80, 'relic'),
      makeTreasure(1080, 300, 50), makeTreasure(880, 660, 80, 'relic'), makeTreasure(540, 430, 50),
    ],
    vault: makeVault(1120, 110, 'Sunfire Opal'),
  },
  {
    id: 2, name: 'Alder Bank Moon Vault', mood: 'moonlight',
    signature: 'Ember Diamond', signatureValue: 600,
    brief: 'The bank vault glows under moonlight. Four guards, two cameras — take the Ember Diamond.',
    start: { x: 90, y: 700 }, exit: { x: 1196, y: 84, w: 56, h: 96 },
    walls: [
      makeWall(0, 0, 1280, 18), makeWall(0, 782, 1280, 18), makeWall(0, 0, 18, 800), makeWall(1262, 0, 18, 800),
      makeWall(240, 200, 26, 220), makeWall(240, 420, 200, 26),
      makeWall(700, 200, 260, 26), makeWall(960, 200, 26, 220),
      makeWall(520, 520, 240, 26), makeWall(520, 520, 26, 160),
    ],
    furniture: [
      { x: 340, y: 300, w: 120, h: 52, label: 'teller desk' },
      { x: 820, y: 330, w: 110, h: 50, label: 'safe row' },
      { x: 160, y: 560, w: 100, h: 50, label: 'bench' },
      { x: 1060, y: 600, w: 110, h: 50, label: 'safe row' },
    ],
    guards: [
      makeGuard(360, 260, [[360, 260], [640, 260], [640, 460], [360, 460]]),
      makeGuard(820, 300, [[820, 300], [1120, 300], [1120, 520], [820, 520]]),
      makeGuard(640, 640, [[640, 640], [300, 640], [300, 700], [900, 700]]),
      makeGuard(1150, 620, [[1150, 620], [1150, 380], [980, 380], [980, 620]]),
    ],
    cameras: [
      makeCamera(640, 24, Math.PI / 2, 1.0),
      makeCamera(24, 400, 0, 0.9),
    ],
    treasures: [
      makeTreasure(300, 150, 50), makeTreasure(480, 340, 80, 'relic'), makeTreasure(700, 150, 50),
      makeTreasure(860, 470, 50), makeTreasure(1120, 200, 80, 'relic'), makeTreasure(200, 640, 50),
      makeTreasure(700, 720, 50), makeTreasure(1000, 700, 80, 'relic'),
    ],
    vault: makeVault(1120, 110, 'Ember Diamond'),
  },
  {
    id: 3, name: 'The Gilded Conservatory', mood: 'lamplight',
    signature: 'Songbird Locket', signatureValue: 550,
    brief: 'Glass, gold and green leaves — and three cameras. Lift the Songbird Locket from the aviary vault.',
    start: { x: 90, y: 700 }, exit: { x: 1196, y: 84, w: 56, h: 96 },
    walls: [
      makeWall(0, 0, 1280, 18), makeWall(0, 782, 1280, 18), makeWall(0, 0, 18, 800), makeWall(1262, 0, 18, 800),
      makeWall(320, 180, 200, 26), makeWall(520, 180, 26, 200),
      makeWall(780, 420, 220, 26), makeWall(780, 420, 26, 200),
      makeWall(200, 520, 220, 26),
    ],
    furniture: [
      { x: 150, y: 260, w: 110, h: 90, label: 'palm planter' },
      { x: 620, y: 250, w: 100, h: 50, label: 'bird table' },
      { x: 420, y: 480, w: 110, h: 50, label: 'fern bed' },
      { x: 1020, y: 300, w: 110, h: 90, label: 'palm planter' },
    ],
    guards: [
      makeGuard(400, 320, [[400, 320], [700, 320], [700, 560], [400, 560]]),
      makeGuard(900, 260, [[900, 260], [1150, 260], [1150, 480], [900, 480]]),
      makeGuard(640, 680, [[640, 680], [640, 420], [300, 420], [300, 680]]),
      makeGuard(1100, 640, [[1100, 640], [820, 640], [820, 700], [1100, 700]]),
    ],
    cameras: [
      makeCamera(640, 24, Math.PI / 2, 0.9),
      makeCamera(1256, 300, Math.PI, 0.9),
      makeCamera(24, 620, 0, 0.8),
    ],
    treasures: [
      makeTreasure(260, 180, 50), makeTreasure(620, 180, 80, 'relic'), makeTreasure(900, 180, 50),
      makeTreasure(1120, 420, 50), makeTreasure(660, 520, 80, 'relic'), makeTreasure(300, 640, 50),
      makeTreasure(880, 700, 50),
    ],
    vault: makeVault(1120, 110, 'Songbird Locket'),
  },
  {
    id: 4, name: "Harbourmaster's Strongroom", mood: 'moonlight',
    signature: 'Tidegold Compass', signatureValue: 650,
    brief: 'Salt air, rope coils and five guards. The Tidegold Compass waits in the strongroom vault.',
    start: { x: 90, y: 700 }, exit: { x: 1196, y: 84, w: 56, h: 96 },
    walls: [
      makeWall(0, 0, 1280, 18), makeWall(0, 782, 1280, 18), makeWall(0, 0, 18, 800), makeWall(1262, 0, 18, 800),
      makeWall(260, 240, 26, 200), makeWall(260, 440, 220, 26),
      makeWall(700, 180, 240, 26), makeWall(940, 180, 26, 220),
      makeWall(560, 560, 260, 26), makeWall(820, 560, 26, 150),
      makeWall(180, 600, 200, 26),
    ],
    furniture: [
      { x: 380, y: 300, w: 120, h: 52, label: 'rope coils' },
      { x: 1040, y: 300, w: 110, h: 50, label: 'crate stack' },
      { x: 620, y: 420, w: 110, h: 50, label: 'chart table' },
      { x: 200, y: 180, w: 100, h: 50, label: 'crate stack' },
    ],
    guards: [
      makeGuard(380, 320, [[380, 320], [640, 320], [640, 500], [380, 500]]),
      makeGuard(860, 280, [[860, 280], [1140, 280], [1140, 500], [860, 500]]),
      makeGuard(640, 660, [[640, 660], [300, 660], [300, 720], [900, 720]]),
      makeGuard(1120, 620, [[1120, 620], [1120, 420], [960, 420], [960, 620]]),
      makeGuard(200, 480, [[200, 480], [440, 480], [440, 660], [200, 660]]),
    ],
    cameras: [
      makeCamera(640, 24, Math.PI / 2, 1.0),
      makeCamera(1256, 500, Math.PI, 0.9),
      makeCamera(24, 300, 0, 0.9),
    ],
    treasures: [
      makeTreasure(200, 300, 50), makeTreasure(480, 200, 80, 'relic'), makeTreasure(760, 140, 50),
      makeTreasure(1080, 200, 80, 'relic'), makeTreasure(620, 480, 50), makeTreasure(880, 620, 50),
      makeTreasure(300, 720, 80, 'relic'), makeTreasure(1100, 700, 50), makeTreasure(500, 640, 50),
    ],
    vault: makeVault(1120, 110, 'Tidegold Compass'),
  },
  {
    id: 5, name: 'The Ivory Athenaeum', mood: 'lamplight',
    signature: 'Gilded Quill', signatureValue: 700,
    brief: 'The grandest heist: five guards, three cameras, ten treasures. Steal the Gilded Quill and vanish.',
    start: { x: 90, y: 700 }, exit: { x: 1196, y: 84, w: 56, h: 96 },
    walls: [
      makeWall(0, 0, 1280, 18), makeWall(0, 782, 1280, 18), makeWall(0, 0, 18, 800), makeWall(1262, 0, 18, 800),
      makeWall(280, 200, 240, 26), makeWall(520, 200, 26, 200),
      makeWall(760, 200, 240, 26), makeWall(760, 200, 26, 200),
      makeWall(280, 560, 240, 26), makeWall(760, 560, 240, 26),
      makeWall(520, 560, 26, 140), makeWall(760, 560, 26, 140),
    ],
    furniture: [
      { x: 360, y: 320, w: 110, h: 60, label: 'book stack' },
      { x: 840, y: 320, w: 110, h: 60, label: 'book stack' },
      { x: 600, y: 440, w: 90, h: 50, label: 'reading desk' },
      { x: 180, y: 640, w: 110, h: 50, label: 'book stack' },
      { x: 1020, y: 640, w: 110, h: 50, label: 'book stack' },
    ],
    guards: [
      makeGuard(400, 300, [[400, 300], [640, 300], [640, 480], [400, 480]]),
      makeGuard(880, 300, [[880, 300], [1120, 300], [1120, 480], [880, 480]]),
      makeGuard(640, 660, [[640, 660], [340, 660], [340, 720], [940, 720]]),
      makeGuard(1120, 640, [[1120, 640], [1120, 420], [940, 420], [940, 640]]),
      makeGuard(160, 420, [[160, 420], [420, 420], [420, 640], [160, 640]]),
    ],
    cameras: [
      makeCamera(640, 24, Math.PI / 2, 1.0),
      makeCamera(1256, 300, Math.PI, 0.9),
      makeCamera(24, 600, 0, 0.9),
    ],
    treasures: [
      makeTreasure(300, 140, 50), makeTreasure(640, 140, 80, 'relic'), makeTreasure(980, 140, 50),
      makeTreasure(420, 420, 50), makeTreasure(860, 420, 80, 'relic'), makeTreasure(640, 500, 50),
      makeTreasure(240, 700, 50), makeTreasure(1080, 700, 80, 'relic'), makeTreasure(480, 680, 50),
      makeTreasure(820, 680, 50),
    ],
    vault: makeVault(1120, 110, 'Gilded Quill'),
  },
];

export const TOTAL_GUARDS = HEISTS.reduce((n, h) => n + h.guards.length, 0);
export const TOTAL_TREASURES = HEISTS.reduce((n, h) => n + h.treasures.length, 0);
export const TOTAL_CAMERAS = HEISTS.reduce((n, h) => n + h.cameras.length, 0);
