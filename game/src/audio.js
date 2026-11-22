// Gilded Hour — all sound is WebAudio oscillators: no audio files, no network.
// Short bleeps for pickup, alarm, capture and the getaway fanfare.

export function createAudio() {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  return {
    unlock() { ensure(); },
    pickup() { tone(880, 0.09, 'sine', 0.12); tone(1318, 0.12, 'sine', 0.10, 0.07); },
    vault() { tone(523, 0.12, 'triangle', 0.14); tone(659, 0.12, 'triangle', 0.14, 0.1); tone(784, 0.2, 'triangle', 0.14, 0.2); },
    coin() { tone(1975, 0.05, 'square', 0.05); tone(1567, 0.06, 'square', 0.05, 0.06); },
    smoke() { tone(220, 0.35, 'sawtooth', 0.06, 0, 90); },
    spotted() { tone(440, 0.16, 'square', 0.12, 0, 880); },
    alarmTick() { tone(660, 0.08, 'square', 0.07); },
    caught() { tone(392, 0.25, 'sawtooth', 0.14, 0, 196); tone(196, 0.5, 'sawtooth', 0.14, 0.22, 98); },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, i * 0.13));
      tone(1318, 0.4, 'triangle', 0.12, 0.55);
    },
    step() { tone(140, 0.03, 'sine', 0.03); },
  };
}
