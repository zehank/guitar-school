/* ============================================================
   吉他自习室 · 声音引擎
   Karplus-Strong 拨弦合成，不依赖任何音频文件
   ============================================================ */
window.GuitarAudio = (function () {
  'use strict';

  const OPEN = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };
  let ctx = null;
  let comp = null;
  let master = null;
  let volume = 0.9;
  let muted = false;
  const buffers = new Map();
  const live = new Set();

  const midiOf = (s, f) => OPEN[s] + f;
  const freqOf = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC({ latencyHint: 'interactive' });
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 24;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.004;
      comp.release.value = 0.28;
      master = ctx.createGain();
      master.gain.value = muted ? 0 : volume;
      comp.connect(master);
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---------- 合成一根被拨响的弦 ---------- */
  function makeBuffer(s, f) {
    const c = ensure();
    const sr = c.sampleRate;
    const freq = freqOf(midiOf(s, f));
    const dur = 2.6;
    const len = Math.floor(sr * dur);
    const buffer = c.createBuffer(1, len, sr);
    const out = buffer.getChannelData(0);
    const N = Math.max(2, Math.round(sr / freq - 0.5));

    const line = new Float32Array(N);
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const white = Math.random() * 2 - 1;
      lp = lp * 0.55 + white * 0.45;
      line[i] = lp;
    }
    // 拨弦位置：两个采样点相减，声音更有「木头味」
    const pick = Math.max(1, Math.round(N * 0.16));
    const copy = line.slice();
    for (let i = 0; i < N; i++) line[i] = copy[i] - 0.6 * copy[(i + pick) % N];

    let mean = 0;
    for (let i = 0; i < N; i++) mean += line[i];
    mean /= N;
    for (let i = 0; i < N; i++) line[i] -= mean;

    const g = Math.pow(10, -3 / (2.1 * freq));
    const fadeIn = Math.max(1, Math.floor(sr * 0.003));
    const fadeOutStart = len - Math.floor(sr * 0.4);
    let idx = 0;
    let prev = 0;
    for (let i = 0; i < len; i++) {
      const sample = line[idx];
      prev = 0.5 * sample + 0.5 * prev;
      line[idx] = prev * g;
      let v = sample;
      if (i < fadeIn) v *= i / fadeIn;
      if (i > fadeOutStart) {
        const t = (i - fadeOutStart) / (len - fadeOutStart);
        v *= 1 - t * t;
      }
      out[i] = v;
      idx = (idx + 1) % N;
    }
    let peak = 0;
    for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
    if (peak > 0) {
      const k = 0.92 / peak;
      for (let i = 0; i < len; i++) out[i] *= k;
    }
    return buffer;
  }

  function playString(s, f, opts) {
    opts = opts || {};
    const c = ensure();
    const when = opts.when == null ? c.currentTime + 0.008 : Math.max(opts.when, c.currentTime + 0.002);
    const key = s + ':' + f;
    if (!buffers.has(key)) buffers.set(key, makeBuffer(s, f));
    const src = c.createBufferSource();
    src.buffer = buffers.get(key);
    const gain = c.createGain();
    gain.gain.value = opts.gain == null ? 0.66 : opts.gain;
    src.connect(gain);
    if (c.createStereoPanner) {
      const pan = c.createStereoPanner();
      pan.pan.value = ((s - 3.5) / 3.5) * 0.14;
      gain.connect(pan);
      pan.connect(comp);
    } else {
      gain.connect(comp);
    }
    src.start(when);
    live.add(src);
    src.onended = () => live.delete(src);
    return src;
  }

  /* frets: [6弦, 5弦, 4弦, 3弦, 2弦, 1弦]，-1 不弹 */
  function strum(frets, dir, opts) {
    opts = opts || {};
    const c = ensure();
    const when = opts.when == null ? c.currentTime + 0.01 : opts.when;
    const order = dir === 'up' ? [1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1];
    const gap = opts.gap == null ? 0.026 : opts.gap;
    let k = 0;
    order.forEach((s) => {
      const f = frets[6 - s];
      if (f == null || f < 0) return;
      playString(s, f, {
        when: when + k * gap,
        gain: (opts.gain == null ? 0.5 : opts.gain) * (0.9 + Math.random() * 0.16)
      });
      k++;
    });
  }

  function arpeggio(frets, opts) {
    opts = opts || {};
    const order = opts.order || [6, 4, 3, 2, 1, 2, 3];
    const gap = opts.gap == null ? 0.12 : opts.gap;
    const when = opts.when == null ? ensure().currentTime + 0.01 : opts.when;
    let k = 0;
    order.forEach((s) => {
      const f = frets[6 - s];
      if (f == null || f < 0) return;
      playString(s, f, { when: when + k * gap, gain: opts.gain == null ? 0.5 : opts.gain });
      k++;
    });
  }

  function click(when, accent, gain) {
    const c = ensure();
    const t = when == null ? c.currentTime + 0.005 : when;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 1760 : 1180, t);
    osc.frequency.exponentialRampToValueAtTime(accent ? 880 : 620, t + 0.035);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime((gain == null ? 0.22 : gain) * (accent ? 1.25 : 0.8), t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(env);
    env.connect(comp);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  function stopAll() {
    live.forEach((src) => {
      try { src.stop(); } catch (e) { /* already stopped */ }
    });
    live.clear();
  }

  function setMuted(v) {
    muted = !!v;
    if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02);
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master && !muted) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
  }

  function now() {
    return ensure().currentTime;
  }

  return {
    ensure, now, playString, strum, arpeggio, click, stopAll,
    setMuted, setVolume,
    get muted() { return muted; },
    getContext: () => ensure(),
    freqOf, midiOf
  };
})();
