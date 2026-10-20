/* ============================================================
   吉他自习室 · 可视化组件
   指板 / 和弦图 / 六线谱 / 吉他构造 / 手型图
   ============================================================ */
window.GuitarVisuals = (function () {
  'use strict';

  const D = window.GuitarData;
  const L = window.I18N || { isEN: false, t: function (k, z) { return z; }, part: function (p) { return p; } };
  const NS = 'http://www.w3.org/2000/svg';
  let uidCounter = 0;

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(e);
    return e;
  }
  function textEl(parent, x, y, str, attrs) {
    const t = svgEl('text', Object.assign({ x, y }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }

  /* ============================================================
     横向指板
     ============================================================ */
  const FB = { W: 1200, H: 250, left: 96, right: 1152, top: 44, bottom: 206 };

  class Fretboard {
    constructor(mount, opts) {
      this.mount = typeof mount === 'string' ? document.querySelector(mount) : mount;
      this.o = Object.assign({ frets: 15, mode: 'scale', interactive: true, onNote: null }, opts || {});
      this.uid = 'fb' + (++uidCounter);
      this.highlights = [];
      this.build();
    }

    stringY(s) {
      return FB.top + (s - 1) * ((FB.bottom - FB.top) / 5);
    }
    fretX(f) {
      const step = (FB.right - FB.left) / this.o.frets;
      return FB.left + f * step;
    }
    dotX(f) {
      const step = (FB.right - FB.left) / this.o.frets;
      return f === 0 ? FB.left - 30 : FB.left + (f - 0.5) * step;
    }

    build() {
      const self = this;
      const o = this.o;
      const uid = this.uid;
      this.mount.innerHTML = '';
      const svg = svgEl('svg', {
        viewBox: '0 0 ' + FB.W + ' ' + FB.H,
        class: 'fb-svg',
        role: 'img',
        'aria-label': L.t('fretboardAria', '吉他指板，点击任意品格可以听到声音')
      });
      const defs = svgEl('defs', null, svg);
      const wood = svgEl('linearGradient', { id: uid + '-wood', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
      svgEl('stop', { offset: '0', 'stop-color': '#3d2c1f' }, wood);
      svgEl('stop', { offset: '0.45', 'stop-color': '#2e2117' }, wood);
      svgEl('stop', { offset: '1', 'stop-color': '#241a12' }, wood);
      const glow = svgEl('filter', { id: uid + '-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
      svgEl('feGaussianBlur', { stdDeviation: '4.5', result: 'b' }, glow);
      const merge = svgEl('feMerge', null, glow);
      svgEl('feMergeNode', { in: 'b' }, merge);
      svgEl('feMergeNode', { in: 'SourceGraphic' }, merge);

      // 木板
      svgEl('rect', {
        x: FB.left - 12, y: FB.top - 26, width: FB.right - FB.left + 24, height: FB.bottom - FB.top + 52,
        rx: 10, fill: 'url(#' + uid + '-wood)', stroke: 'rgba(240,225,200,.10)'
      }, svg);

      // 品丝
      const fretG = svgEl('g', { class: 'fb-frets' }, svg);
      for (let f = 1; f <= o.frets; f++) {
        svgEl('line', {
          x1: this.fretX(f), y1: FB.top - 18, x2: this.fretX(f), y2: FB.bottom + 18,
          stroke: 'rgba(235,220,196,.55)', 'stroke-width': f === 12 ? 2.4 : 1.3
        }, fretG);
      }
      // 品记
      const inlayG = svgEl('g', { class: 'fb-inlays' }, svg);
      const midY = (FB.top + FB.bottom) / 2;
      [3, 5, 7, 9, 15].forEach((f) => {
        svgEl('circle', { cx: this.dotX(f), cy: midY, r: 4.2, fill: 'rgba(240,228,206,.38)' }, inlayG);
      });
      [12].forEach((f) => {
        svgEl('circle', { cx: this.dotX(f), cy: midY - 20, r: 4.2, fill: 'rgba(240,228,206,.38)' }, inlayG);
        svgEl('circle', { cx: this.dotX(f), cy: midY + 20, r: 4.2, fill: 'rgba(240,228,206,.38)' }, inlayG);
      });

      // 琴枕
      svgEl('rect', {
        x: FB.left - 5, y: FB.top - 22, width: 10, height: FB.bottom - FB.top + 44,
        rx: 3, fill: '#e9dcc4'
      }, svg);

      // 六根弦
      const strG = svgEl('g', { class: 'fb-strings' }, svg);
      for (let s = 1; s <= 6; s++) {
        svgEl('line', {
          x1: FB.left - 6, y1: this.stringY(s), x2: FB.right + 6, y2: this.stringY(s),
          stroke: 'rgba(228,216,196,.82)',
          'stroke-width': [1.1, 1.35, 1.7, 2.1, 2.6, 3.2][s - 1],
          'stroke-linecap': 'round'
        }, strG);
      }

      // 左侧弦号
      const labelG = svgEl('g', { class: 'fb-string-labels' }, svg);
      for (let s = 1; s <= 6; s++) {
        const g = svgEl('g', { class: 'fb-string-label', 'data-string': s }, labelG);
        textEl(g, 44, this.stringY(s) + 4, s + ' ' + D.STRING_NOTE[s], {
          'text-anchor': 'end', class: 'fb-string-text'
        });
        const n = D.noteAt(s, 0);
        textEl(g, 44, this.stringY(s) + 17, n.name + n.octave, {
          'text-anchor': 'end', class: 'fb-string-sub'
        });
        if (o.interactive) {
          svgEl('rect', {
            x: 6, y: this.stringY(s) - 17, width: 72, height: 34, rx: 6,
            fill: 'transparent', class: 'fb-hit'
          }, g).addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            self.trigger(s, 0);
          });
        }
      }

      // 品号
      const numG = svgEl('g', { class: 'fb-fret-numbers' }, svg);
      [3, 5, 7, 9, 12, 15].filter((f) => f <= o.frets).forEach((f) => {
        textEl(numG, this.dotX(f), FB.H - 12, String(f), {
          'text-anchor': 'middle', class: 'fb-fret-num' + (f === 12 ? ' is-twelve' : '')
        });
      });

      // 音名层
      this.labelLayer = svgEl('g', { class: 'fb-notes' }, svg);
      this.renderLabels();

      // 高亮层
      this.hlLayer = svgEl('g', { class: 'fb-highlights', 'pointer-events': 'none' }, svg);

      // 点击热区
      if (o.interactive) {
        const hitG = svgEl('g', { class: 'fb-hits' }, svg);
        const step = (FB.right - FB.left) / o.frets;
        for (let s = 1; s <= 6; s++) {
          for (let f = 1; f <= o.frets; f++) {
            const r = svgEl('rect', {
              x: FB.left + (f - 1) * step, y: this.stringY(s) - 15,
              width: step, height: 30, fill: 'transparent', class: 'fb-hit',
              'data-s': s, 'data-f': f
            }, hitG);
            r.addEventListener('pointerdown', (ev) => {
              ev.preventDefault();
              self.trigger(s, f);
            });
          }
        }
      }

      this.svg = svg;
      this.mount.appendChild(svg);
    }

    renderLabels() {
      const mode = this.o.mode;
      const layer = this.labelLayer;
      layer.innerHTML = '';
      if (mode === 'none') return;
      for (let s = 1; s <= 6; s++) {
        for (let f = 0; f <= this.o.frets; f++) {
          const info = D.noteAt(s, f);
          const inScale = D.C_MAJOR.indexOf(info.pc) !== -1;
          if (mode === 'scale' && !inScale) continue;
          if (mode === 'scale' && f === 0) continue; // 空弦音已写在左侧
          const isRoot = info.pc === 0;
          const isChordTone = info.pc === 4 || info.pc === 7;
          const r = mode === 'all' ? 9.8 : 12.6;
          const x = this.dotX(f);
          const y = this.stringY(s);
          const g = svgEl('g', { class: 'fb-note' + (isRoot ? ' is-root' : '') }, layer);
          if (isRoot) {
            svgEl('circle', { cx: x, cy: y, r: r, fill: '#eeb96f' }, g);
          } else if (isChordTone) {
            svgEl('circle', { cx: x, cy: y, r: r, fill: '#a9633c' }, g);
          } else {
            svgEl('circle', { cx: x, cy: y, r: r, fill: 'rgba(20,16,13,.35)', stroke: 'rgba(243,235,224,.28)' }, g);
          }
          textEl(g, x, y + (mode === 'all' ? 3.4 : 4), info.name, {
            'text-anchor': 'middle',
            class: 'fb-note-text' + (isRoot || isChordTone ? ' on-dark' : '')
          });
        }
      }
    }

    setMode(mode) {
      this.o.mode = mode;
      this.renderLabels();
    }

    trigger(s, f) {
      window.GuitarAudio.playString(s, f, { gain: 0.72 });
      this.flash(s, f, 'pluck');
      if (this.o.onNote) this.o.onNote(s, f);
    }

    flash(s, f, kind) {
      const x = this.dotX(f);
      const y = this.stringY(s);
      const tone = kind === 'ok' ? '143,191,159' : kind === 'bad' ? '224,122,106' : '238,185,111';
      const g = svgEl('g', { class: 'fb-flash ' + (kind || ''), 'pointer-events': 'none' }, this.hlLayer);
      svgEl('circle', { cx: x, cy: y, r: 12, fill: 'rgba(' + tone + ',.9)', filter: 'url(#' + this.uid + '-glow)' }, g);
      svgEl('circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: 'rgba(' + tone + ',.7)', 'stroke-width': 1.5, class: 'fb-ripple' }, g);
      setTimeout(() => { if (g.parentNode) g.parentNode.removeChild(g); }, 900);
    }

    setHighlight(notes) {
      this.highlights = notes || [];
      const layer = this.hlLayer;
      Array.prototype.slice.call(layer.querySelectorAll('.fb-playing')).forEach((n) => n.remove());
      this.highlights.forEach((nt) => {
        const x = this.dotX(nt.f);
        const y = this.stringY(nt.s);
        const g = svgEl('g', { class: 'fb-playing' }, layer);
        svgEl('circle', { cx: x, cy: y, r: 20, fill: 'rgba(238,185,111,.16)', class: 'fb-glow-ring' }, g);
        svgEl('circle', { cx: x, cy: y, r: 13.5, fill: '#f4c47e', filter: 'url(#' + this.uid + '-glow)' }, g);
        const info = D.noteAt(nt.s, nt.f);
        textEl(g, x, y + 4.2, info.name, { 'text-anchor': 'middle', class: 'fb-play-text' });
      });
    }

    clearHighlight() { this.setHighlight([]); }
  }

  /* ============================================================
     和弦图
     ============================================================ */
  function chordBaseFret(chord) {
    if (chord.frets.indexOf(0) !== -1) return 1;
    const fs = chord.frets.filter((f) => f > 0);
    if (!fs.length) return 1;
    const min = Math.min.apply(null, fs);
    return min > 1 ? min : 1;
  }

  function chordSVG(chord, opts) {
    opts = opts || {};
    const W = 180, H = 214;
    const uid = 'ch' + (++uidCounter);
    const svg = svgEl('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      class: 'chord-svg',
      role: 'img',
      'aria-label': L.t('chordAria', chord.name + ' 和弦指法图', { name: chord.name })
    });
    const defs = svgEl('defs', null, svg);
    const grad = svgEl('linearGradient', { id: uid + '-dot', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#f6cb8a' }, grad);
    svgEl('stop', { offset: '1', 'stop-color': '#d8984d' }, grad);

    const x0 = 34, gapX = 24, yTop = 46, rowH = 27.5, strings = 6, frets = 5;
    const yBottom = yTop + rowH * frets;
    const base = chordBaseFret(chord);
    const sx = (i) => x0 + i * gapX;
    const fy = (f) => yTop + (f - base + 0.5) * rowH;

    // 弦
    for (let i = 0; i < strings; i++) {
      svgEl('line', { x1: sx(i), y1: yTop, x2: sx(i), y2: yBottom, stroke: 'rgba(232,220,200,.6)', 'stroke-width': 1 }, svg);
    }
    // 品
    for (let r = 0; r <= frets; r++) {
      const y = yTop + r * rowH;
      svgEl('line', {
        x1: sx(0), y1: y, x2: sx(5), y2: y,
        stroke: 'rgba(232,220,200,.55)',
        'stroke-width': r === 0 ? (base === 1 ? 5 : 1.2) : 1.1
      }, svg);
    }
    if (base > 1) {
      textEl(svg, 20, yTop + 12, base + 'fr', { 'text-anchor': 'middle', class: 'chord-base' });
    }

    // 空弦 / 不弹
    for (let i = 0; i < strings; i++) {
      const f = chord.frets[i];
      const x = sx(i);
      if (f === -1) {
        const g = svgEl('g', { stroke: 'rgba(232,220,200,.45)', 'stroke-width': 1.4 }, svg);
        svgEl('line', { x1: x - 4.5, y1: yTop - 14, x2: x + 4.5, y2: yTop - 5 }, g);
        svgEl('line', { x1: x - 4.5, y1: yTop - 5, x2: x + 4.5, y2: yTop - 14 }, g);
      } else if (f === 0) {
        svgEl('circle', { cx: x, cy: yTop - 9.5, r: 4.6, fill: 'none', stroke: 'rgba(232,220,200,.7)', 'stroke-width': 1.3 }, svg);
      }
    }

    // 横按
    if (chord.barre) {
      const b = chord.barre;
      if (b.fret >= base && b.fret < base + frets) {
        const y = fy(b.fret);
        svgEl('rect', {
          x: sx(b.from) - 12, y: y - 8.5, width: sx(b.to) - sx(b.from) + 24, height: 17, rx: 8.5,
          fill: 'url(#' + uid + '-dot)', opacity: 0.95
        }, svg);
        textEl(svg, (sx(b.from) + sx(b.to)) / 2, y + 4, '1', { 'text-anchor': 'middle', class: 'chord-finger' });
      }
    }

    // 指法点
    for (let i = 0; i < strings; i++) {
      const f = chord.frets[i];
      if (f <= 0) continue;
      if (f < base || f >= base + frets) continue;
      if (chord.barre && f === chord.barre.fret && i >= chord.barre.from && i <= chord.barre.to) continue;
      const x = sx(i);
      const y = fy(f);
      svgEl('circle', { cx: x, cy: y, r: 10.2, fill: 'url(#' + uid + '-dot)', stroke: 'rgba(60,38,18,.5)' }, svg);
      const finger = chord.fingers[i];
      if (opts.showFingers !== false && finger > 0) {
        textEl(svg, x, y + 3.8, String(finger), { 'text-anchor': 'middle', class: 'chord-finger' });
      }
    }

    // 弦名
    ['E', 'A', 'D', 'G', 'B', 'e'].forEach((nm, i) => {
      textEl(svg, sx(i), H - 8, nm, { 'text-anchor': 'middle', class: 'chord-string-name' });
    });

    return svg;
  }

  /* ============================================================
     六线谱
     ============================================================ */
  function buildTab(steps, opts) {
    opts = opts || {};
    const bpb = opts.beatsPerBar || 4;
    const bw = opts.beatWidth || 44;
    const labelW = 38;
    const top = 26;
    const lineGap = 20;
    const height = top + lineGap * 5 + 30;
    let totalBeats = 0;
    const cols = [];
    steps.forEach((st, i) => {
      const w = Math.max(10, st.beats * bw);
      cols.push({ i, x: labelW + totalBeats * bw, w, beat: totalBeats, step: st });
      totalBeats += st.beats;
    });
    const width = Math.max(320, labelW + totalBeats * bw + 28);

    const svg = svgEl('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      width: width, height: height,
      class: 'tab-svg', role: 'img', 'aria-label': L.t('tabAria', '六线谱')
    });
    const yFor = (s) => top + (s - 1) * lineGap;

    // 弦线
    for (let s = 1; s <= 6; s++) {
      svgEl('line', {
        x1: labelW, y1: yFor(s), x2: width - 16, y2: yFor(s),
        stroke: 'rgba(232,220,200,.28)', 'stroke-width': 1
      }, svg);
    }
    // 左侧弦号
    for (let s = 1; s <= 6; s++) {
      textEl(svg, labelW - 12, yFor(s) + 4, String(s), { 'text-anchor': 'middle', class: 'tab-string-num' });
    }
    // 小节线
    const bars = Math.floor(totalBeats / bpb);
    for (let k = 1; k <= bars; k++) {
      const x = labelW + k * bpb * bw;
      svgEl('line', { x1: x, y1: top - 8, x2: x, y2: top + lineGap * 5 + 8, stroke: 'rgba(232,220,200,.38)', 'stroke-width': 1.2 }, svg);
    }
    for (let k = 0; k < bars; k++) {
      textEl(svg, labelW + k * bpb * bw + 5, 12, String(k + 1), { class: 'tab-bar-num' });
    }

    // 高亮 / 播放头
    const activeRect = svgEl('rect', {
      x: 0, y: top - 10, width: 0, height: lineGap * 5 + 20, rx: 7,
      fill: 'rgba(238,185,111,.12)', class: 'tab-active-rect'
    }, svg);
    // 音符
    cols.forEach((col) => {
      const x = col.x + Math.min(13, col.w * 0.4);
      col.step.notes.forEach((nt) => {
        const info = D.noteAt(nt.s, nt.f);
        textEl(svg, x, yFor(nt.s) + 4.2, String(nt.f), {
          'text-anchor': 'middle', class: 'tab-fret' + (col.w < 20 ? ' is-dense' : '')
        });
        if (opts.showNames) {
          textEl(svg, x, yFor(nt.s) - 8, info.name, { 'text-anchor': 'middle', class: 'tab-name' });
        }
      });
    });
    const playLine = svgEl('line', {
      x1: 0, y1: top - 12, x2: 0, y2: top + lineGap * 5 + 12,
      stroke: '#f4c47e', 'stroke-width': 2, opacity: 0, class: 'tab-play-line'
    }, svg);

    // 点击区
    const hitLayer = svgEl('g', null, svg);
    cols.forEach((col) => {
      svgEl('rect', {
        x: col.x, y: top - 12, width: col.w, height: lineGap * 5 + 26,
        fill: 'transparent', class: 'tab-hit', 'data-step': col.i
      }, hitLayer);
    });
    if (opts.onPick) {
      svg.addEventListener('click', (ev) => {
        const hit = ev.target.closest ? ev.target.closest('[data-step]') : null;
        if (hit) opts.onPick(parseInt(hit.getAttribute('data-step'), 10));
      });
    }

    function setActive(i, progress) {
      if (i == null || i < 0 || i >= cols.length) {
        activeRect.setAttribute('width', 0);
        playLine.setAttribute('opacity', 0);
        return;
      }
      const col = cols[i];
      activeRect.setAttribute('x', col.x);
      activeRect.setAttribute('width', col.w);
      const px = col.x + Math.max(0, Math.min(1, progress || 0)) * col.w;
      playLine.setAttribute('x1', px);
      playLine.setAttribute('x2', px);
      playLine.setAttribute('opacity', 0.9);
    }
    function clear() { setActive(-1, 0); }

    return { svg, setActive, clear, cols, width };
  }

  /* ============================================================
     吉他构造图
     ============================================================ */
  const PARTS = [
    { id: 'head', n: 1, name: '琴头', en: 'Headstock', desc: '弦钮都装在这里。调音时拧的就是它两边的小旋钮。' },
    { id: 'peg', n: 2, name: '弦钮', en: 'Tuning pegs', desc: '转动改变弦的张力。松弦降温、紧弦升高，每次只拧一点点。' },
    { id: 'nut', n: 3, name: '琴枕', en: 'Nut', desc: '上弦枕。六根弦从这里的凹槽出来，它决定了弦距和音准的起点。' },
    { id: 'fret', n: 4, name: '品丝', en: 'Frets', desc: '金属条。按弦要按在品丝左侧（靠近琴头）1–2mm，不是按在金属条上。' },
    { id: 'inlay', n: 5, name: '品记', en: 'Inlays', desc: '3、5、7、9、12 品的圆点。找位置时先看 12 品，它有两个点。' },
    { id: 'neck', n: 6, name: '琴颈', en: 'Neck', desc: '左手握住的地方。拇指放在琴颈背面中线，不要整只手扣住。' },
    { id: 'body', n: 7, name: '琴身', en: 'Body', desc: '共鸣箱。弦的振动在这里被放大，所以抱琴时别把面板压住。' },
    { id: 'hole', n: 8, name: '音孔', en: 'Sound hole', desc: '声音的出口，也是右手拨弦的参照位置。右手通常停在音孔附近。' },
    { id: 'bridge', n: 9, name: '琴桥', en: 'Bridge', desc: '固定弦的另一端。换弦时弦从固弦锥穿进去。' },
    { id: 'string', n: 10, name: '六根弦', en: 'Strings', desc: '从粗到细 E A D G B E。最粗的是 6 弦，最细的是 1 弦。' },
    { id: 'guard', n: 11, name: '护板', en: 'Pickguard', desc: '防止拨片刮伤面板。扫弦时拨片扫到它也没关系。' }
  ];

  function renderAnatomy(svgMount, listMount) {
    const uid = 'an' + (++uidCounter);
    const svg = svgEl('svg', { viewBox: '0 0 460 780', class: 'anatomy-svg', role: 'img', 'aria-label': L.t('anatomyAria', '民谣吉他构造图') });
    const defs = svgEl('defs', null, svg);
    const bodyGrad = svgEl('radialGradient', { id: uid + '-body', cx: '0.5', cy: '0.58', r: '0.72' }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#7a4e2a' }, bodyGrad);
    svgEl('stop', { offset: '0.6', 'stop-color': '#5d3a20' }, bodyGrad);
    svgEl('stop', { offset: '1', 'stop-color': '#3d2614' }, bodyGrad);
    const neckGrad = svgEl('linearGradient', { id: uid + '-neck', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#4a3120' }, neckGrad);
    svgEl('stop', { offset: '0.5', 'stop-color': '#3a2618' }, neckGrad);
    svgEl('stop', { offset: '1', 'stop-color': '#2a1a10' }, neckGrad);
    const holeGrad = svgEl('radialGradient', { id: uid + '-hole' }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#080604' }, holeGrad);
    svgEl('stop', { offset: '0.75', 'stop-color': '#120c08' }, holeGrad);
    svgEl('stop', { offset: '1', 'stop-color': '#2a1a10' }, holeGrad);
    const metal = svgEl('linearGradient', { id: uid + '-metal', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#8d8170' }, metal);
    svgEl('stop', { offset: '0.5', 'stop-color': '#efe6d4' }, metal);
    svgEl('stop', { offset: '1', 'stop-color': '#8d8170' }, metal);

    const body = svgEl('g', { class: 'part', 'data-part': 'body' }, svg);
    svgEl('path', {
      d: 'M210 326 C165 326 118 355 112 405 C106 450 140 490 152 530 C160 558 128 580 118 625 C108 675 140 742 210 746 C280 742 312 675 302 625 C292 580 260 558 268 530 C280 490 314 450 308 405 C302 355 255 326 210 326 Z',
      fill: 'url(#' + uid + '-body)', stroke: '#8a5c34', 'stroke-width': 1.6
    }, body);
    // 木纹
    const grain = svgEl('g', { opacity: 0.18, stroke: '#2a170c', fill: 'none' }, body);
    ['M150 400 C160 480 148 540 136 610', 'M270 400 C260 480 272 540 284 610', 'M180 690 C200 700 220 700 240 690', 'M128 450 C150 470 190 474 210 474'].forEach((d) => {
      svgEl('path', { d, 'stroke-width': 1 }, grain);
    });
    // 音孔
    const hole = svgEl('g', { class: 'part', 'data-part': 'hole' }, svg);
    svgEl('circle', { cx: 210, cy: 470, r: 48, fill: 'url(#' + uid + '-hole)' }, hole);
    svgEl('circle', { cx: 210, cy: 470, r: 60, fill: 'none', stroke: '#c9955c', 'stroke-width': 3, opacity: 0.75 }, hole);
    svgEl('circle', { cx: 210, cy: 470, r: 67, fill: 'none', stroke: '#8a5c34', 'stroke-width': 1.4 }, hole);

    // 护板
    svgEl('path', {
      d: 'M252 512 C274 522 282 548 276 572 C270 596 250 596 242 576 C234 554 238 526 252 512 Z',
      fill: '#3a2517', stroke: '#6b4326', 'stroke-width': 1, opacity: 0.9,
      class: 'part', 'data-part': 'guard'
    }, svg);

    // 琴桥
    const bridge = svgEl('g', { class: 'part', 'data-part': 'bridge' }, svg);
    svgEl('rect', { x: 166, y: 632, width: 88, height: 17, rx: 4, fill: '#2e1d12', stroke: '#6b4326' }, bridge);
    svgEl('rect', { x: 174, y: 637, width: 72, height: 3.5, rx: 1.5, fill: '#e6d9c0', opacity: 0.8 }, bridge);

    // 琴颈 + 指板
    svgEl('rect', { x: 183, y: 140, width: 54, height: 290, fill: 'url(#' + uid + '-neck)', class: 'part', 'data-part': 'neck' }, svg);
    const fb = svgEl('g', { class: 'part', 'data-part': 'fret' }, svg);
    svgEl('rect', { x: 186, y: 152, width: 48, height: 270, fill: '#241811' }, fb);
    for (let i = 0; i < 13; i++) {
      const y = 158 + i * 20;
      svgEl('line', { x1: 186, y1: y, x2: 234, y2: y, stroke: 'rgba(232,220,200,.55)', 'stroke-width': 1.15 }, fb);
    }
    // 品记
    const inlay = svgEl('g', { class: 'part', 'data-part': 'inlay' }, svg);
    [3, 5, 7, 9, 15].forEach((f) => {
      svgEl('circle', { cx: 210, cy: 158 + (f - 0.5) * 20, r: 3, fill: 'rgba(232,220,200,.55)' }, inlay);
    });
    svgEl('circle', { cx: 210, cy: 158 + 11.5 * 20, r: 3, fill: 'rgba(232,220,200,.55)' }, inlay);
    svgEl('circle', { cx: 210, cy: 158 + 12.5 * 20, r: 3, fill: 'rgba(232,220,200,.55)' }, inlay);

    // 琴枕
    svgEl('rect', { x: 184, y: 150, width: 52, height: 6, rx: 2, fill: '#e9dcc4', class: 'part', 'data-part': 'nut' }, svg);

    // 琴头
    const head = svgEl('g', { class: 'part', 'data-part': 'head' }, svg);
    svgEl('path', {
      d: 'M180 46 Q210 36 240 46 L245 136 Q245 150 231 150 L189 150 Q175 150 175 136 Z',
      fill: '#2c1c12', stroke: '#6b4326', 'stroke-width': 1.4
    }, head);
    svgEl('circle', { cx: 210, cy: 62, r: 9, fill: 'none', stroke: '#7a5330', 'stroke-width': 1 }, head);

    // 弦钮
    const pegs = svgEl('g', { class: 'part', 'data-part': 'peg' }, svg);
    [72, 100, 128].forEach((y) => {
      [[168, -1], [252, 1]].forEach((p) => {
        svgEl('circle', { cx: p[0], cy: y, r: 6.2, fill: 'url(#' + uid + '-metal)', stroke: '#5f5344' }, pegs);
        svgEl('rect', {
          x: p[0] + p[1] * -2 + (p[1] === 1 ? 4 : -10), y: y - 1.6, width: 8, height: 3.2,
          fill: '#b9a488', opacity: 0.8
        }, pegs);
      });
    });

    // 弦
    const stringsG = svgEl('g', { class: 'part', 'data-part': 'string' }, svg);
    const xs = [190, 198, 206, 214, 222, 230];
    const widths = [2.8, 2.4, 2, 1.7, 1.3, 1.05];
    const pegsY = [72, 100, 128];
    for (let i = 0; i < 6; i++) {
      const left = i < 3;
      const px = left ? 172 : 248;
      const py = pegsY[i % 3];
      svgEl('line', {
        x1: px, y1: py, x2: xs[i], y2: 150,
        stroke: 'url(#' + uid + '-metal)', 'stroke-width': 1.1, opacity: 0.8
      }, stringsG);
      svgEl('line', {
        x1: xs[i], y1: 150, x2: xs[i] - (i - 2.5) * 1.6, y2: 637,
        stroke: 'url(#' + uid + '-metal)', 'stroke-width': widths[i],
        'stroke-linecap': 'round', opacity: 0.95
      }, stringsG);
    }

    // 编号标记
    const markers = [
      [1, 252, 52, 'head'], [2, 262, 112, 'peg'], [3, 244, 146, 'nut'],
      [4, 246, 236, 'fret'], [5, 246, 386, 'inlay'], [6, 176, 300, 'neck'],
      [7, 262, 690, 'body'], [8, 210, 470, 'hole'], [9, 210, 648, 'bridge'],
      [10, 172, 344, 'string'], [11, 268, 556, 'guard']
    ];
    markers.forEach((m) => {
      const g = svgEl('g', { class: 'an-marker', 'data-part': m[3], 'data-n': m[0] }, svg);
      svgEl('circle', { cx: m[1], cy: m[2], r: 11, class: 'an-marker-bg' }, g);
      textEl(g, m[1], m[2] + 4, String(m[0]), { 'text-anchor': 'middle', class: 'an-marker-text' });
    });

    if (svgMount) {
      svgMount.innerHTML = '';
      svgMount.appendChild(svg);
    }

    if (listMount) {
      listMount.innerHTML = '';
      PARTS.forEach((p) => {
        const item = document.createElement('button');
        const lp = L.part(p);
        item.type = 'button';
        item.className = 'an-item';
        item.setAttribute('data-part', p.id);
        item.innerHTML = '<span class="an-num">' + p.n + '</span><span class="an-body"><strong>' + lp.name +
          '<em>' + (L.isEN ? '' : p.en) + '</em></strong><span>' + lp.desc + '</span></span>';
        item.addEventListener('mouseenter', () => setHot(p.id, true));
        item.addEventListener('mouseleave', () => setHot(p.id, false));
        item.addEventListener('click', () => {
          setHot(p.id, true);
          setTimeout(() => setHot(p.id, false), 1600);
          item.classList.add('is-active');
          setTimeout(() => item.classList.remove('is-active'), 900);
        });
        listMount.appendChild(item);
      });
    }

    function setHot(id, on) {
      Array.prototype.slice.call(svg.querySelectorAll('[data-part="' + id + '"]')).forEach((el) => {
        if (el.classList.contains('an-marker')) el.classList.toggle('is-hot', on);
        else el.classList.toggle('is-hot', on);
      });
    }
    if (svgMount) {
      svgMount.addEventListener('click', (ev) => {
        const m = ev.target.closest ? ev.target.closest('.an-marker') : null;
        if (!m) return;
        const part = m.getAttribute('data-part');
        setHot(part, true);
        setTimeout(() => setHot(part, false), 1400);
      });
    }
  }

  /* ============================================================
     左手按弦示意
     ============================================================ */
  function handSVG() {
    const W = 760, H = 268;
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'hand-svg', role: 'img', 'aria-label': L.t('handAria', '左手按弦位置示意图') });
    const panels = [
      { x: 0, good: true },
      { x: 380, good: false }
    ];
    panels.forEach((p) => {
      const g = svgEl('g', { transform: 'translate(' + p.x + ',0)' }, svg);
      // 指板侧视
      svgEl('rect', { x: 30, y: 150, width: 320, height: 26, rx: 3, fill: '#2a1d14', stroke: 'rgba(232,220,200,.18)' }, g);
      [110, 180, 250, 320].forEach((x) => {
        svgEl('line', { x1: x, y1: 142, x2: x, y2: 184, stroke: 'rgba(232,220,200,.55)', 'stroke-width': 1.4 }, g);
      });
      // 弦
      if (p.good) {
        svgEl('polyline', {
          points: '30,146 100,153 110,146 350,146', fill: 'none',
          stroke: 'rgba(245,235,218,.9)', 'stroke-width': 2
        }, g);
        // 手指
        const finger = svgEl('g', null, g);
        svgEl('path', {
          d: 'M132 44 C142 84 128 112 106 138', fill: 'none',
          stroke: '#d9b28c', 'stroke-width': 27, 'stroke-linecap': 'round'
        }, finger);
        svgEl('circle', { cx: 102, cy: 145, r: 14, fill: '#e3c3a2', stroke: '#b98d63', 'stroke-width': 1 }, finger);
        svgEl('path', { d: 'M104 128 L101 143', stroke: '#b98d63', 'stroke-width': 1, fill: 'none' }, finger);
        // 压力箭头
        svgEl('path', { d: 'M102 112 L102 132 M96 124 L102 132 L108 124', stroke: '#eeb96f', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
        textEl(g, 190, 214, L.t('handGood', '按在品丝左侧 1–2mm'), { 'text-anchor': 'middle', class: 'hand-good' });
        textEl(g, 190, 234, L.t('handGoodSub', '指尖立起来 · 靠近品丝'), { 'text-anchor': 'middle', class: 'hand-sub' });
      } else {
        svgEl('polyline', {
          points: '30,146 180,152 190,146 350,146', fill: 'none',
          stroke: 'rgba(245,235,218,.9)', 'stroke-width': 2
        }, g);
        // 压扁的弦
        svgEl('path', { d: 'M176 158 q8 8 16 0 q8 8 16 0 q8 8 16 0', fill: 'none', stroke: 'rgba(224,122,106,.9)', 'stroke-width': 2 }, g);
        const finger = svgEl('g', null, g);
        svgEl('path', {
          d: 'M210 44 C220 84 206 112 184 138', fill: 'none',
          stroke: '#d9b28c', 'stroke-width': 27, 'stroke-linecap': 'round'
        }, finger);
        svgEl('circle', { cx: 180, cy: 148, r: 14, fill: '#e3c3a2', stroke: '#b98d63', 'stroke-width': 1 }, finger);
        svgEl('path', { d: 'M172 130 L180 148 M188 130 L180 148', stroke: '#e07a6a', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g);
        textEl(g, 190, 214, L.t('handBad', '压在品丝上：声音发闷'), { 'text-anchor': 'middle', class: 'hand-bad' });
        textEl(g, 190, 234, L.t('handBadSub', '弦没有有效振动 · 延音消失'), { 'text-anchor': 'middle', class: 'hand-sub' });
      }
    });
    return svg;
  }

  function pickSVG() {
    const svg = svgEl('svg', { viewBox: '0 0 320 230', class: 'pick-svg', role: 'img', 'aria-label': L.t('pickAria', '拨片持法示意图') });
    // 弦
    svgEl('line', { x1: 28, y1: 168, x2: 292, y2: 168, stroke: 'rgba(232,220,200,.5)', 'stroke-width': 2 }, svg);
    // 拇指
    svgEl('path', {
      d: 'M92 34 C120 44 132 70 128 96 C124 120 108 132 94 124 C78 116 74 92 80 70 Z',
      fill: '#e0bb95', stroke: '#b98d63', 'stroke-width': 1.4
    }, svg);
    // 食指
    svgEl('path', {
      d: 'M196 52 C176 66 168 92 176 112 C184 130 202 134 214 122 C226 110 226 86 218 70 Z',
      fill: '#d9b28c', stroke: '#b98d63', 'stroke-width': 1.4
    }, svg);
    // 拨片
    svgEl('path', {
      d: 'M120 96 L176 116 L146 158 Q140 166 132 158 Z',
      fill: '#eeb96f', stroke: '#a86a2e', 'stroke-width': 1.6, 'stroke-linejoin': 'round'
    }, svg);
    // 角度弧线
    svgEl('path', { d: 'M126 174 A52 52 0 0 1 176 150', fill: 'none', stroke: '#eeb96f', 'stroke-width': 1.6, 'stroke-dasharray': '3 4', opacity: 0.8 }, svg);
    textEl(svg, 196, 178, '30–45°', { class: 'pick-label' });
    // 箭头
    svgEl('path', { d: 'M252 96 C262 116 262 136 252 152', fill: 'none', stroke: '#eeb96f', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    svgEl('path', { d: 'M244 144 L252 154 L260 144', fill: 'none', stroke: '#eeb96f', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    textEl(svg, 268, 128, L.t('pickWrist', '手腕'), { class: 'pick-label', 'text-anchor': 'start' });
    textEl(svg, 118, 210, L.t('pickSub', '拇指 + 食指捏住，露出 2–3mm'), { 'text-anchor': 'middle', class: 'pick-sub' });
    return svg;
  }

  /* ============================================================
     弦表
     ============================================================ */
  function renderStringTable(mount) {
    if (!mount) return;
    mount.innerHTML = '';
    D.STRINGS.forEach((st) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'string-row';
      row.innerHTML =
        '<span class="sr-num">' + st.s + '</span>' +
        '<span class="sr-line"><i style="width:' + (14 - st.s * 1.6) + 'px;height:' + (1 + (6 - st.s) * 0.5) + 'px"></i></span>' +
        '<span class="sr-note">' + st.note + '<em>' + st.octave + '</em></span>' +
        '<span class="sr-freq">' + st.freq.toFixed(2) + ' Hz</span>' +
        '<span class="sr-play">' + L.t('tablePlay', '听') + '</span>';
      row.addEventListener('click', () => {
        window.GuitarAudio.playString(st.s, 0, { gain: 0.8 });
        row.classList.add('is-playing');
        setTimeout(() => row.classList.remove('is-playing'), 500);
      });
      mount.appendChild(row);
    });
  }

  return {
    svgEl, textEl, Fretboard, chordSVG, buildTab, chordBaseFret,
    renderAnatomy, PARTS, handSVG, pickSVG, renderStringTable
  };
})();
