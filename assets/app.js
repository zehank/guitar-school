/* ============================================================
   吉他自习室 · 应用逻辑
   ============================================================ */
(function () {
  'use strict';

  const D = window.GuitarData;
  const A = window.GuitarAudio;
  const V = window.GuitarVisuals;
  const I18N = window.I18N || { isEN: false, t: function (k, z, v) { return z; }, chord: function (c) { return c; }, song: function (s) { return s; }, ex: function (e) { return e; }, pattern: function (p) { return p; }, progression: function (p) { return p; } };
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  /* ============================================================
     本地进度
     ============================================================ */
  const STORE_KEY = 'guitar-school-v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { state = {}; }
  state.lessons = state.lessons || {};
  state.checks = state.checks || {};
  state.plan = state.plan || {};
  state.quiz = state.quiz || { findBest: 0, earBest: 0, chordBest: 0 };
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* 忽略隐私模式 */ }
  }

  const todayKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };

  /* ============================================================
     全局停止
     ============================================================ */
  const players = [];
  const stoppers = [];
  let routed = false;

  function stopEverything() {
    players.forEach((p) => p.pause());
    stoppers.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    A.stopAll();
  }

  /* ============================================================
     路由
     ============================================================ */
  const sections = $$('.section');
  const navLinks = $$('[data-nav]');
  const sectionIndexEl = $('[data-section-index]');
  const sectionTitleEl = $('[data-section-title]');

  function showSection(id, scroll) {
    let target = document.getElementById(id || 'start');
    if (!target || !target.classList.contains('section')) target = document.getElementById('start');
    sections.forEach((s) => s.classList.toggle('is-active', s === target));
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('data-nav') === target.id));
    const activeNav = navLinks.find((a) => a.getAttribute('data-nav') === target.id);
    if (activeNav && window.innerWidth <= 1040) {
      const nav = activeNav.parentElement;
      requestAnimationFrame(() => {
        const r = activeNav.getBoundingClientRect();
        const nr = nav.getBoundingClientRect();
        if (r.left < nr.left || r.right > nr.right) {
          nav.scrollLeft += (r.left + r.width / 2) - (nr.left + nr.width / 2);
        }
      });
    }
    if (sectionIndexEl) sectionIndexEl.textContent = (target.querySelector('.eyebrow').textContent.split('/')[0] || '').trim();
    if (sectionTitleEl) sectionTitleEl.textContent = target.getAttribute('data-title') || '';
    const brand = I18N.t('brand', '吉他自习室');
    document.title = (target.getAttribute('data-title') || brand) + ' · ' + brand;
    if (scroll !== false) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
    if (routed) stopEverything();
    routed = true;
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const hashId = () => location.hash.replace('#', '');

  $$('[data-lang-target]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = hashId() || 'start';
      const base = a.getAttribute('data-lang-target');
      location.href = base + (id === 'start' ? '' : '#' + id);
    });
  });

  document.addEventListener('click', (ev) => {
    const a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target || !target.classList.contains('section')) return;
    ev.preventDefault();
    if (id !== hashId()) history.pushState(null, '', '#' + id);
    showSection(id, true);
    window.scrollTo(0, 0);
  });
  window.addEventListener('popstate', () => showSection(hashId() || 'start', true));
  window.addEventListener('hashchange', () => showSection(hashId() || 'start', true));

  /* ============================================================
     进度与完成按钮
     ============================================================ */
  function lessonCount() {
    return Object.keys(state.lessons).filter((k) => state.lessons[k]).length;
  }
  function updateProgress() {
    const total = sections.length;
    const count = lessonCount();
    const text = $('[data-progress-text]');
    const bar = $('[data-progress-bar]');
    if (text) text.textContent = count + ' / ' + total;
    if (bar) bar.style.width = (count / total * 100) + '%';
    navLinks.forEach((a) => {
      a.classList.toggle('is-done', !!state.lessons[a.getAttribute('data-nav')]);
    });
    $$('[data-complete]').forEach((btn) => {
      const id = btn.getAttribute('data-complete');
      const done = !!state.lessons[id];
      btn.classList.toggle('is-done', done);
      const label = btn.querySelector('span');
      if (label) label.textContent = done ? I18N.t('markDone', '已学会 · 点此取消') : I18N.t('markLearn', '标记本节已学');
    });
  }
  $$('[data-complete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-complete');
      if (state.lessons[id]) delete state.lessons[id];
      else state.lessons[id] = true;
      save();
      updateProgress();
    });
  });

  /* ============================================================
     声音开关
     ============================================================ */
  const soundBtn = $('[data-sound-toggle]');
  const soundLabel = $('[data-sound-label]');
  function setSoundUI() {
    if (!soundBtn) return;
    const muted = A.muted;
    soundBtn.classList.toggle('is-muted', muted);
    soundBtn.setAttribute('aria-pressed', String(!muted));
    if (soundLabel) soundLabel.textContent = muted ? I18N.t('soundOff', '已静音') : I18N.t('soundOn', '声音开');
  }
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      A.ensure();
      A.setMuted(!A.muted);
      setSoundUI();
    });
  }

  /* ============================================================
     基础图示
     ============================================================ */
  V.renderAnatomy($('#anatomyMount'), $('#anatomyList'));
  V.renderStringTable($('#stringTable'));
  const handMount = $('#handDiagram');
  if (handMount) handMount.appendChild(V.handSVG());
  const pickMount = $('#pickDiagram');
  if (pickMount) pickMount.appendChild(V.pickSVG());

  /* ============================================================
     姿势自检
     ============================================================ */
  const CHECKS = I18N.checks ? (I18N.checks() || [
    '琴身凹槽放在右腿，面板略朝上',
    '琴头大致与肩同高，不低头盯指板',
    '左手拇指在琴颈背面中线',
    '按弦用指尖，手指立起来',
    '按在品丝左侧 1–2mm，不压品丝',
    '右手手腕放松，拨片露出 2–3mm'
  ]) : [];
  const checkMount = $('#postureChecks');
  if (checkMount) {
    CHECKS.forEach((text, i) => {
      const id = 'pc' + i;
      const label = document.createElement('label');
      label.className = 'check';
      label.innerHTML = '<input type="checkbox" ' + (state.checks[id] ? 'checked' : '') +
        '><span class="box"></span><span>' + text + '</span>';
      label.querySelector('input').addEventListener('change', (ev) => {
        state.checks[id] = ev.target.checked;
        save();
      });
      checkMount.appendChild(label);
    });
  }

  /* ============================================================
     音阶与指板
     ============================================================ */
  const scaleNow = $('#scaleNow');
  let scaleBoard = null;
  const scaleMount = $('#scaleBoard');
  if (scaleMount) {
    scaleBoard = new V.Fretboard(scaleMount, {
      mode: 'scale',
      onNote: (s, f) => {
        const n = D.noteAt(s, f);
        if (scaleNow) scaleNow.innerHTML = '<b>' + I18N.t('stringFret', '{s} 弦 {f} 品', { s: s, f: f }) + '</b> · ' + n.label +
          (n.solfege ? ' (' + n.solfege + ')' : '') + (n.degree ? ' · ' + I18N.t('degree', '第 {d} 级', { d: n.degree }) : '');
      }
    });
  }
  const scaleModes = $('#scaleModes');
  if (scaleModes) {
    scaleModes.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-mode]');
      if (!btn) return;
      $$('button', scaleModes).forEach((b) => b.classList.toggle('is-on', b === btn));
      if (scaleBoard) scaleBoard.setMode(btn.getAttribute('data-mode'));
      if (scaleNow) scaleNow.textContent = I18N.t('clickBoard', '点一下指板上的任意位置');
    });
  }
  const intervalRow = $('#intervalRow');
  if (intervalRow) {
    const seq = [['C', '全'], ['D', '全'], ['E', '半'], ['F', '全'], ['G', '全'], ['A', '全'], ['B', '半'], ['C', '']];
    seq.forEach(([note, gap]) => {
      const n = document.createElement('span');
      n.className = 'iv-note';
      n.textContent = note;
      intervalRow.appendChild(n);
      if (gap) {
        const g = document.createElement('span');
        g.className = 'iv-gap' + (gap === '半' ? ' is-half' : '');
        g.textContent = I18N.isEN ? (gap === '半' ? 'H' : 'W') : gap;
        intervalRow.appendChild(g);
      }
    });
  }

  /* ============================================================
     节拍时钟
     ============================================================ */
  class BeatClock {
    constructor(opts) {
      this.bpm = opts.bpm || 80;
      this.beatsPerBar = opts.beatsPerBar || 4;
      this.subdivision = opts.subdivision || 1;
      this.onTick = opts.onTick || function () {};
      this.onVisual = opts.onVisual || function () {};
      this.running = false;
      this.queue = [];
    }
    start() {
      if (this.running) this.stop();
      A.ensure();
      this.running = true;
      this.tickIndex = 0;
      this.queue = [];
      this.nextTime = A.getContext().currentTime + 0.12;
      this.timer = setInterval(() => this.schedule(), 25);
      this._frame = this.frame.bind(this);
      this.raf = requestAnimationFrame(this._frame);
      this.schedule();
    }
    schedule() {
      if (!this.running) return;
      const ctx = A.getContext();
      const ahead = ctx.currentTime + 0.14;
      let guard = 0;
      while (this.nextTime < ahead && guard < 48) {
        const idx = this.tickIndex;
        const sub = idx % this.subdivision;
        const beatIndex = Math.floor(idx / this.subdivision);
        const bar = Math.floor(beatIndex / this.beatsPerBar);
        const beat = beatIndex % this.beatsPerBar;
        const info = { time: this.nextTime, beat, bar, sub, accent: beat === 0 && sub === 0 };
        this.onTick(info);
        this.queue.push(info);
        this.nextTime += 60 / this.bpm / this.subdivision;
        this.tickIndex++;
        guard++;
      }
    }
    frame() {
      if (!this.running) return;
      const now = A.getContext().currentTime;
      let info = null;
      while (this.queue.length && this.queue[0].time <= now) info = this.queue.shift();
      if (info) this.onVisual(info);
      this.raf = requestAnimationFrame(this._frame);
    }
    stop() {
      this.running = false;
      clearInterval(this.timer);
      if (this.raf) cancelAnimationFrame(this.raf);
      this.queue = [];
    }
  }

  /* ============================================================
     曲谱播放器
     ============================================================ */
  function stopAllPlayers(except) {
    players.forEach((p) => { if (p !== except) p.pause(); });
  }

  class TabPlayer {
    constructor(host, cfg) {
      this.host = host;
      this.cfg = cfg;
      this.steps = cfg.steps;
      this.bpm = cfg.bpm || 80;
      this.beatsPerBar = cfg.beatsPerBar || 4;
      this.playing = false;
      this.idx = 0;
      this.sources = [];
      this.loop = false;
      this.metronome = false;
      this.finished = false;
      this.build();
      players.push(this);
      this.setStep(0, false, true);
      this.nowEl.textContent = I18N.t('playerIdle', '点击「播放」开始 · 也可以直接点谱子上的音');
    }

    build() {
      const c = this.cfg;
      this.host.innerHTML =
        '<div class="player">' +
          '<div class="player-head">' +
            '<div class="player-title"><h4>' + c.title + '</h4><p>' + (c.desc || '') + '</p></div>' +
            '<div class="player-controls">' +
              '<button type="button" class="btn small" data-play><span class="tr-icon">▶</span><span data-play-label>' + I18N.t('play', '播放') + '</span></button>' +
              '<button type="button" class="icon-btn" data-reset title="' + I18N.t('resetTitle', '回到开头') + '">↺</button>' +
              '<div class="bpm-control"><input type="range" min="40" max="140" step="2" value="' + this.bpm + '" data-bpm><div class="bpm-read"><b data-bpm-val>' + this.bpm + '</b><small>BPM</small></div></div>' +
              '<label class="switch"><input type="checkbox" data-loop> ' + I18N.t('loop', '循环') + '</label>' +
              '<label class="switch"><input type="checkbox" data-metro> ' + I18N.t('clickTrack', '节拍') + '</label>' +
            '</div>' +
          '</div>' +
          '<div class="player-now" data-now></div>' +
          '<div class="board-scroll player-board"><div data-board></div></div>' +
          '<div class="tab-scroll" data-tab></div>' +
          (c.tip ? '<p class="player-tip">' + c.tip + '</p>' : '') +
        '</div>';

      const boardMount = $('[data-board]', this.host);
      this.fb = new V.Fretboard(boardMount, { mode: 'none', interactive: true, onNote: (s, f) => {
        const n = D.noteAt(s, f);
        this.nowEl.innerHTML = '<span class="now-dot"></span><b>' + I18N.t('stringFret', '{s} 弦 {f} 品', { s: s, f: f }) + '</b> · ' + n.label +
          (n.solfege ? (I18N.isEN ? ' (' : '（') + n.solfege + (I18N.isEN ? ')' : '）') : '');
      } });
      this.boardScroll = $('.player-board', this.host);
      this.tabScroll = $('[data-tab]', this.host);
      this.tabApi = V.buildTab(this.steps, {
        beatsPerBar: this.beatsPerBar,
        beatWidth: c.compact ? 38 : 44,
        onPick: (i) => this.pick(i)
      });
      this.tabScroll.appendChild(this.tabApi.svg);
      this.nowEl = $('[data-now]', this.host);
      this.playBtn = $('[data-play]', this.host);
      this.playLabel = $('[data-play-label]', this.host);
      this.bpmInput = $('[data-bpm]', this.host);
      this.bpmVal = $('[data-bpm-val]', this.host);

      this.playBtn.addEventListener('click', () => this.play());
      $('[data-reset]', this.host).addEventListener('click', () => this.pause(true));
      this.bpmInput.addEventListener('input', () => {
        const v = parseInt(this.bpmInput.value, 10);
        this.bpmVal.textContent = v;
        this.bpm = v;
        if (this.playing) {
          const keep = this.idx;
          this.pause();
          this.idx = keep;
          this.play(true);
        }
      });
      $('[data-loop]', this.host).addEventListener('change', (e) => { this.loop = e.target.checked; });
      $('[data-metro]', this.host).addEventListener('change', (e) => { this.metronome = e.target.checked; });
    }

    updatePlayBtn() {
      if (!this.playBtn) return;
      this.playBtn.classList.toggle('is-playing', this.playing);
      if (this.playLabel) this.playLabel.textContent = this.playing ? I18N.t('pause', '暂停') : I18N.t('play', '播放');
      const icon = this.playBtn.querySelector('.tr-icon');
      if (icon) icon.textContent = this.playing ? '❚❚' : '▶';
    }

    play(skipCountIn) {
      if (this.playing) { this.pause(); return; }
      if (this.finished) { this.idx = 0; this.finished = false; }
      if (this.idx == null || this.idx < 0) this.idx = 0;
      stopAllPlayers(this);
      const ctx = A.ensure();
      this.playing = true;
      this.sources = [];
      const beat = 60 / this.bpm;
      const countIn = skipCountIn ? 0 : this.beatsPerBar;
      this.countInBeats = countIn;
      const t0 = ctx.currentTime + 0.14 + countIn * beat;
      for (let i = 0; i < countIn; i++) A.click(t0 - countIn * beat + i * beat, i === 0, 0.15);
      let cursor = 0;
      this.timeline = [];
      const from = this.idx;
      for (let i = from; i < this.steps.length; i++) {
        const st = this.steps[i];
        const when = t0 + cursor * beat;
        st.notes.forEach((nt) => {
          const src = A.playString(nt.s, nt.f, { when, gain: 0.62 });
          if (src) this.sources.push(src);
        });
        if (this.metronome) {
          for (let b = 0; b < st.beats - 1e-6; b++) {
            A.click(when + b * beat, Math.round(cursor + b) % this.beatsPerBar === 0, 0.12);
          }
        }
        this.timeline.push({ i, when, end: when + st.beats * beat });
        cursor += st.beats;
      }
      this.t0 = t0;
      this.endTime = t0 + cursor * beat;
      this.updatePlayBtn();
      this._frame = this.frame.bind(this);
      this.raf = requestAnimationFrame(this._frame);
    }

    frame() {
      if (!this.playing) return;
      const now = A.now();
      const beat = 60 / this.bpm;
      if (now < this.t0) {
        if (this.countInBeats) {
          const left = Math.max(1, Math.ceil((this.t0 - now) / beat));
          this.nowEl.textContent = I18N.t('countIn', '预备') + ' · ' + Math.min(left, this.countInBeats) + ' / ' + this.countInBeats;
        }
        this.raf = requestAnimationFrame(this._frame);
        return;
      }
      let item = null;
      for (let k = 0; k < this.timeline.length; k++) {
        const it = this.timeline[k];
        if (now >= it.when && now < it.end) { item = it; break; }
        if (now < it.when) break;
      }
      if (!item) item = this.timeline[this.timeline.length - 1];
      if (item) {
        if (item.i !== this.idx) this.setStep(item.i, false);
        const p = Math.max(0, Math.min(1, (now - item.when) / (item.end - item.when)));
        this.tabApi.setActive(item.i, p);
      }
      if (now >= this.endTime - 0.005) { this.finish(); return; }
      this.raf = requestAnimationFrame(this._frame);
    }

    setStep(i, sound, silentNow) {
      if (i == null || i < 0 || i >= this.steps.length) return;
      this.idx = i;
      const st = this.steps[i];
      this.fb.setHighlight(st.notes);
      this.tabApi.setActive(i, 0);
      if (this.boardScroll && this.fb && this.fb.svg && st.notes.length) {
        const scale = this.fb.svg.getBoundingClientRect().width / 1200;
        const x = this.fb.dotX(st.notes[0].f) * scale;
        const box = this.boardScroll;
        if (x < box.scrollLeft + 24 || x > box.scrollLeft + box.clientWidth - 32) {
          box.scrollTo({ left: Math.max(0, x - box.clientWidth * 0.4), behavior: 'smooth' });
        }
      }
      if (!silentNow) {
        this.nowEl.innerHTML = st.notes.map((nt) => {
          const n = D.noteAt(nt.s, nt.f);
          return '<span class="now-note"><b>' + I18N.t('stringFret', '{s} 弦 {f} 品', { s: nt.s, f: nt.f }) + '</b>' + n.label +
            (n.solfege ? '<em>' + n.solfege + '</em>' : '') + '</span>';
        }).join('');
      }
      if (this.tabScroll) {
        const col = this.tabApi.cols[i];
        if (col) {
          const left = this.tabScroll.scrollLeft;
          const view = this.tabScroll.clientWidth;
          if (col.x < left || col.x + col.w > left + view - 30) {
            this.tabScroll.scrollTo({ left: Math.max(0, col.x - 40), behavior: 'smooth' });
          }
        }
      }
      if (sound) st.notes.forEach((nt) => A.playString(nt.s, nt.f, { gain: 0.7 }));
    }

    pick(i) {
      if (this.playing) this.pause();
      this.setStep(i, true);
    }

    pause(reset) {
      this.playing = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.sources.forEach((src) => { try { src.stop(); } catch (e) { /* ignore */ } });
      this.sources = [];
      this.updatePlayBtn();
      if (reset) {
        this.idx = 0;
        this.finished = false;
        this.fb.clearHighlight();
        this.tabApi.clear();
        this.tabScroll.scrollLeft = 0;
        this.nowEl.textContent = I18N.t('playerIdle', '点击「播放」开始 · 也可以直接点谱子上的音');
      }
    }

    finish() {
      this.playing = false;
      this.finished = true;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.updatePlayBtn();
      if (this.tabApi) this.tabApi.setActive(this.idx, 1);
      this.nowEl.textContent = I18N.t('playerDone', '弹完了 · 再来一遍，或只练刚才不顺的那一小节');
      if (this.cfg.onFinish) this.cfg.onFinish();
      if (this.loop) {
        const self = this;
        setTimeout(() => {
          self.idx = 0;
          self.finished = false;
          self.play(true);
        }, 500);
      }
    }
  }

  /* ============================================================
     练习曲
     ============================================================ */
  const exerciseMount = $('#exerciseList');
  if (exerciseMount) {
    D.EXERCISES.forEach((ex) => {
      const card = document.createElement('div');
      const exx = I18N.ex(ex);
      card.className = 'card exercise-card';
      exerciseMount.appendChild(card);
      new TabPlayer(card, {
        title: exx.title,
        desc: exx.desc,
        tip: exx.tip,
        steps: ex.steps,
        bpm: ex.bpm,
        beatsPerBar: ex.beatsPerBar,
        compact: true
      });
    });
  }

  /* ============================================================
     和弦
     ============================================================ */
  const chordGrid = $('#chordGrid');
  const chordDetail = $('#chordDetail');
  let selectedChord = 'C';
  let chordFilter = 'all';

  function renderChordGrid() {
    if (!chordGrid) return;
    chordGrid.innerHTML = '';
    D.CHORDS.filter((c) => chordFilter === 'all' || String(c.level) === chordFilter).forEach((base) => {
      const c = I18N.chord(base);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chord-card' + (c.id === selectedChord ? ' is-on' : '');
      btn.setAttribute('data-chord', c.id);
      const top = document.createElement('span');
      top.className = 'chord-card-top';
      top.innerHTML = '<b>' + c.name + '</b><em>' + (c.level === 1 ? I18N.t('beginner', '入门') : I18N.t('advanced', '进阶')) + '</em>';
      btn.appendChild(top);
      const fig = document.createElement('span');
      fig.className = 'chord-card-fig';
      fig.appendChild(V.chordSVG(c));
      btn.appendChild(fig);
      const sub = document.createElement('span');
      sub.className = 'chord-card-sub';
      sub.textContent = c.full.replace(/\s*[（(].*?[）)]/, '');
      btn.appendChild(sub);
      btn.addEventListener('click', () => selectChord(c.id));
      chordGrid.appendChild(btn);
    });
  }

  function selectChord(id) {
    selectedChord = id;
    const c = D.CHORD_MAP[id];
    if (!c) return;
    $$('.chord-card', chordGrid).forEach((el) => el.classList.toggle('is-on', el.getAttribute('data-chord') === id));
    renderChordDetail(c);
  }

  function renderChordDetail(raw) {
    if (!chordDetail) return;
    const c = I18N.chord(raw);
    chordDetail.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card chord-detail-card';
    const fig = document.createElement('div');
    fig.className = 'chord-detail-fig';
    fig.appendChild(V.chordSVG(c));
    const info = document.createElement('div');
    info.className = 'chord-detail-info';
    info.innerHTML =
      '<div class="chord-detail-title"><h3>' + c.name + '</h3><span>' + c.full + '</span></div>' +
      '<p class="chord-mood">' + c.mood + '</p>' +
      '<p class="chord-notes"><span>' + I18N.t('chordNotes', '组成音') + '</span>' + c.notes + '</p>' +
      '<ol class="steps-list small">' + c.steps.map((s) => '<li>' + s + '</li>').join('') + '</ol>' +
      '<p class="tip">' + c.tip + '</p>' +
      '<p class="trap"><b>' + I18N.t('chordTrap', '容易踩的坑') + '</b>' + c.trap + '</p>' +
      '<div class="chord-actions">' +
        '<button type="button" class="btn small" data-arpeggio>' + I18N.t('hearArp', '听分解') + '</button>' +
        '<button type="button" class="btn small" data-strum>' + I18N.t('hearStrum', '听扫弦') + '</button>' +
      '</div>';
    card.appendChild(fig);
    card.appendChild(info);
    chordDetail.appendChild(card);
    $('[data-arpeggio]', info).addEventListener('click', () => A.arpeggio(c.frets, { gain: 0.55 }));
    $('[data-strum]', info).addEventListener('click', () => A.strum(c.frets, 'down', { gain: 0.55 }));
  }

  const chordFilterEl = $('#chordFilter');
  if (chordFilterEl) {
    chordFilterEl.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-level]');
      if (!btn) return;
      chordFilter = btn.getAttribute('data-level');
      $$('button', chordFilterEl).forEach((b) => b.classList.toggle('is-on', b === btn));
      renderChordGrid();
    });
  }
  const chordGuide = $('#chordGuide');
  if (chordGuide) chordGuide.appendChild(V.chordSVG(D.CHORD_MAP.C));
  renderChordGrid();
  renderChordDetail(D.CHORD_MAP.C);

  /* ---------- 和弦转换训练 ---------- */
  function initTrainer() {
    const host = $('#chordTrainer');
    if (!host) return;
    host.innerHTML =
      '<div class="trainer-head">' +
        '<div><h3>' + I18N.t('trainerTitle', '和弦转换练习') + '</h3><p>' + I18N.t('trainerDesc', '一小节换一个和弦，先跟 60 BPM。听到闷音没关系，先跟上拍子。') + '</p></div>' +
        '<div class="bpm-control"><input type="range" min="50" max="100" step="2" value="60" data-t-bpm><div class="bpm-read"><b data-t-bpmval>60</b><small>BPM</small></div></div>' +
      '</div>' +
      '<div class="trainer-chips" data-t-chips></div>' +
      '<div class="trainer-stage">' +
        '<div class="t-chord" data-t-current></div>' +
        '<div class="t-mid"><div class="t-beats" data-t-beats></div><span data-t-bars>' + I18N.t('trainerBar', '第 {n} 小节 · 已换 {c} 次', { n: 1, c: 0 }) + '</span></div>' +
        '<div class="t-chord is-next" data-t-next></div>' +
      '</div>' +
      '<div class="trainer-foot"><button type="button" class="btn" data-t-start>' + I18N.t('trainerStart', '开始练习') + '</button><span class="hint">' + I18N.t('trainerHint', '当前和弦 → 下一个和弦') + '</span></div>';

    let progIndex = 0;
    let bpm = 60;
    let clock = null;
    let lastBar = -1;
    let running = false;
    const chips = $('[data-t-chips]', host);
    const currentEl = $('[data-t-current]', host);
    const nextEl = $('[data-t-next]', host);
    const barsEl = $('[data-t-bars]', host);
    const beatsEl = $('[data-t-beats]', host);
    const startBtn = $('[data-t-start]', host);
    const bpmInput = $('[data-t-bpm]', host);
    const bpmVal = $('[data-t-bpmval]', host);

    D.PROGRESSIONS.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (i === 0 ? ' is-on' : '');
      b.textContent = I18N.progression(p).name;
      b.addEventListener('click', () => {
        progIndex = i;
        $$('.chip', chips).forEach((x) => x.classList.toggle('is-on', x === b));
        stop();
        drawStage(0);
      });
      chips.appendChild(b);
    });

    function drawChord(el, name) {
      el.innerHTML = '';
      const c = D.CHORD_MAP[name];
      el.appendChild(V.chordSVG(c));
      const label = document.createElement('span');
      label.className = 't-name';
      label.textContent = name;
      el.appendChild(label);
    }

    function drawStage(bar) {
      const prog = D.PROGRESSIONS[progIndex];
      const ci = ((bar % prog.chords.length) + prog.chords.length) % prog.chords.length;
      const cur = prog.chords[ci];
      const nxt = prog.chords[(ci + 1) % prog.chords.length];
      drawChord(currentEl, cur);
      drawChord(nextEl, nxt);
      barsEl.textContent = I18N.t('trainerBar', '第 {n} 小节 · 已换 {c} 次', { n: bar + 1, c: bar });
      beatsEl.innerHTML = '<i></i><i></i><i></i><i></i>';
    }

    function beatDots(beat) {
      $$('i', beatsEl).forEach((d, i) => d.classList.toggle('is-on', i === beat));
    }

    function start() {
      if (running) { stop(); return; }
      A.ensure();
      running = true;
      startBtn.textContent = I18N.t('stop', '停止');
      startBtn.classList.add('is-playing');
      lastBar = -1;
      drawStage(0);
      clock = new BeatClock({
        bpm: bpm,
        beatsPerBar: 4,
        subdivision: 1,
        onTick: (info) => {
          if (info.beat === 0) {
            const prog = D.PROGRESSIONS[progIndex];
            const name = prog.chords[info.bar % prog.chords.length];
            const chord = D.CHORD_MAP[name];
            A.strum(chord.frets, 'down', { when: info.time, gain: 0.42 });
            A.click(info.time, true, 0.14);
          } else {
            A.click(info.time, false, 0.09);
          }
        },
        onVisual: (info) => {
          if (info.bar !== lastBar) {
            lastBar = info.bar;
            drawStage(info.bar);
          }
          beatDots(info.beat);
        }
      });
      clock.start();
    }

    function stop() {
      running = false;
      if (clock) { clock.stop(); clock = null; }
      startBtn.textContent = I18N.t('trainerStart', '开始练习');
      startBtn.classList.remove('is-playing');
      beatDots(-1);
    }

    startBtn.addEventListener('click', start);
    bpmInput.addEventListener('input', () => {
      bpm = parseInt(bpmInput.value, 10);
      bpmVal.textContent = bpm;
      if (running) { stop(); start(); }
    });

    drawStage(0);
    stoppers.push(stop);
  }
  initTrainer();

  /* ============================================================
     调音器
     ============================================================ */
  function initTuner() {
    const host = $('#tunerMount');
    if (!host) return;
    const targetIndex = { 6: 0, 5: 1, 4: 2, 3: 3, 2: 4, 1: 5 };
    let target = 6;
    let stream = null;
    let analyser = null;
    let sourceNode = null;
    let micRaf = null;
    let buf = null;
    let lastTick = 0;
    let smooth = 0;
    let hasSignal = false;
    let micPending = false;

    host.innerHTML =
      '<div class="tuner-top">' +
        '<div class="gauge" data-gauge></div>' +
        '<div class="tuner-read">' +
          '<div class="tuner-note"><b data-t-note>E</b><span data-t-oct>2</span></div>' +
          '<div class="tuner-cents" data-t-cents>0 <small>' + I18N.t('cents', '音分') + '</small></div>' +
          '<div class="tuner-status" data-t-status>' + I18N.t('pickString', '选一根弦，点「听参考音」') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tuner-strings" data-t-strings></div>' +
      '<div class="tuner-actions">' +
        '<button type="button" class="btn small" data-t-ref>' + I18N.t('refTone', '听参考音') + '</button>' +
        '<button type="button" class="btn small ghost" data-t-mic>' + I18N.t('micOn', '打开麦克风') + '</button>' +
        '<span class="hint" data-t-hint>' + I18N.t('tunerHint', '用麦克风时，一次只拨一根弦，让它自然响。') + '</span>' +
      '</div>' +
      '<div class="tuner-note-hint" data-t-file hidden></div>';

    const noteEl = $('[data-t-note]', host);
    const octEl = $('[data-t-oct]', host);
    const centsEl = $('[data-t-cents]', host);
    const statusEl = $('[data-t-status]', host);
    const stringsEl = $('[data-t-strings]', host);
    const micBtn = $('[data-t-mic]', host);
    const refBtn = $('[data-t-ref]', host);
    const fileHint = $('[data-t-file]', host);

    if (location.protocol === 'file:') {
      fileHint.hidden = false;
      fileHint.innerHTML = I18N.t('fileHint', '<b>麦克风在 file:// 下不可用。</b> 想用实时调音，在文件夹里运行 <code>python3 -m http.server 8000</code>，再打开 <code>http://localhost:8000</code>。参考音和其余功能不受影响。');
    }

    // 仪表
    const gs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    gs.setAttribute('viewBox', '0 0 360 240');
    gs.setAttribute('class', 'gauge-svg');
    const cx = 180, cy = 186, r = 132;
    const pol = (deg, rad) => [cx + Math.sin(deg * Math.PI / 180) * rad, cy - Math.cos(deg * Math.PI / 180) * rad];
    function arcPath(from, to, rad) {
      const a = pol(from, rad), b = pol(to, rad);
      const large = Math.abs(to - from) > 180 ? 1 : 0;
      return 'M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + ' A' + rad + ' ' + rad + ' 0 ' + large + ' 1 ' + b[0].toFixed(2) + ' ' + b[1].toFixed(2);
    }
    const NS = 'http://www.w3.org/2000/svg';
    function mk(tag, attrs) {
      const e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
      return e;
    }
    gs.appendChild(mk('path', { d: arcPath(-62, 62, r), fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    gs.appendChild(mk('path', { d: arcPath(-6, 6, r), fill: 'none', stroke: 'rgba(143,191,159,.55)', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    for (let c = -50; c <= 50; c += 10) {
      const deg = c / 50 * 62;
      const p1 = pol(deg, r - 20), p2 = pol(deg, r - 8);
      const major = c % 20 === 0;
      gs.appendChild(mk('line', {
        x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1],
        stroke: c === 0 ? 'rgba(143,191,159,.9)' : 'rgba(243,235,224,.35)',
        'stroke-width': c === 0 ? 2 : 1
      }));
      if (major) {
        const p3 = pol(deg, r - 34);
        const t = mk('text', { x: p3[0], y: p3[1] + 3.5, 'text-anchor': 'middle', class: 'gauge-tick' });
        t.textContent = c > 0 ? '+' + c : String(c);
        gs.appendChild(t);
      }
    }
    const needle = mk('g', { class: 'gauge-needle', transform: 'rotate(0 180 186)' });
    needle.appendChild(mk('line', { x1: 180, y1: 186, x2: 180, y2: 62, stroke: '#eeb96f', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    needle.appendChild(mk('circle', { cx: 180, cy: 186, r: 8, fill: '#eeb96f' }));
    needle.appendChild(mk('circle', { cx: 180, cy: 186, r: 3, fill: '#1a1410' }));
    gs.appendChild(needle);
    const lowT = mk('text', { x: 34, y: 170, class: 'gauge-side' }); lowT.textContent = I18N.t('low', '偏低');
    const highT = mk('text', { x: 326, y: 170, class: 'gauge-side', 'text-anchor': 'end' }); highT.textContent = I18N.t('high', '偏高');
    gs.appendChild(lowT);
    gs.appendChild(highT);
    $('[data-gauge]', host).appendChild(gs);

    // 六根弦按钮
    D.STRINGS.forEach((st) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tuner-string' + (st.s === target ? ' is-on' : '');
      b.setAttribute('data-s', String(st.s));
      b.innerHTML = '<b>' + st.note + '<em>' + st.octave + '</em></b><span>' + I18N.t('stringShort', '{s} 弦', { s: st.s }) + '</span>';
      b.addEventListener('click', () => {
        selectTarget(st.s, true);
      });
      stringsEl.appendChild(b);
    });

    function selectTarget(s, play) {
      target = s;
      const st = D.STRINGS.find((x) => x.s === s);
      $$('.tuner-string', stringsEl).forEach((b) => b.classList.toggle('is-on', b.getAttribute('data-s') === String(s)));
      noteEl.textContent = st.note;
      octEl.textContent = st.octave;
      if (!hasSignal) {
        centsEl.innerHTML = '0 <small>' + I18N.t('cents', '音分') + '</small>';
        statusEl.textContent = I18N.t('target', '目标 {s} 弦 · {f} Hz', { s: st.s, f: st.freq.toFixed(2) });
        setNeedle(0, false);
      }
      if (play) A.playString(s, 0, { gain: 0.85 });
    }

    function setNeedle(cents, live) {
      const deg = Math.max(-62, Math.min(62, cents / 50 * 62));
      needle.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 180 186)');
      needle.style.opacity = live ? '1' : '0.55';
    }

    function updateReadout(freq, clarity) {
      let best = null;
      D.STRINGS.forEach((st) => {
        [1, 2, 0.5].forEach((mult) => {
          const f = freq * mult;
          const cents = 1200 * Math.log2(f / st.freq);
          if (Math.abs(cents) < 120 && (!best || Math.abs(cents) < Math.abs(best.cents))) {
            best = { st: st, cents: cents };
          }
        });
      });
      if (!best) {
        statusEl.textContent = I18N.t('heardOther', '听到了 {f} Hz，但不接近任何一根空弦', { f: freq.toFixed(1) });
        centsEl.textContent = I18N.t('noNote', '—');
        setNeedle(0, false);
        return;
      }
      if (best.st.s !== target) selectTarget(best.st.s, false);
      hasSignal = true;
      smooth = smooth * 0.55 + best.cents * 0.45;
      const shown = Math.round(smooth);
      const st = best.st;
      noteEl.textContent = st.note;
      octEl.textContent = st.octave;
      centsEl.innerHTML = (shown > 0 ? '+' + shown : String(shown)) + ' <small>' + I18N.t('cents', '音分') + '</small>';
      setNeedle(shown, true);
      if (Math.abs(shown) <= 5) {
        statusEl.textContent = I18N.t('inTune', '准了 · 保持 2 秒');
        statusEl.className = 'tuner-status is-good';
      } else if (shown < 0) {
        statusEl.textContent = I18N.t('flat', '偏低 {n} 音分 · 慢慢拧紧弦钮', { n: Math.abs(shown) });
        statusEl.className = 'tuner-status is-low';
      } else {
        statusEl.textContent = I18N.t('sharp', '偏高 {n} 音分 · 慢慢放松弦钮', { n: shown });
        statusEl.className = 'tuner-status is-high';
      }
    }

    refBtn.addEventListener('click', () => A.playString(target, 0, { gain: 0.9 }));

    /* ---------- 麦克风 ---------- */
    function autoCorrelate(array, sampleRate) {
      const SIZE = array.length;
      let rms = 0;
      for (let i = 0; i < SIZE; i++) rms += array[i] * array[i];
      rms = Math.sqrt(rms / SIZE);
      if (rms < 0.005) return null;
      const thres = 0.12;
      let r1 = 0, r2 = SIZE - 1;
      for (let i = 0; i < SIZE / 2; i++) if (Math.abs(array[i]) < thres) { r1 = i; break; }
      for (let i = 1; i < SIZE / 2; i++) if (Math.abs(array[SIZE - i]) < thres) { r2 = SIZE - i; break; }
      const b = array.slice(r1, r2);
      const n = b.length;
      if (n < 700) return null;
      const minLag = Math.floor(sampleRate / 420);
      const maxLag = Math.min(Math.ceil(sampleRate / 65), n - 2);
      const corr = new Float32Array(maxLag + 2);
      let bestLag = -1, bestVal = 0;
      for (let lag = minLag; lag <= maxLag; lag++) {
        let sum = 0, e1 = 0, e2 = 0;
        for (let i = 0; i < n - lag; i++) {
          const a = b[i], c = b[i + lag];
          sum += a * c; e1 += a * a; e2 += c * c;
        }
        const v = sum / (Math.sqrt(e1 * e2) || 1e-9);
        corr[lag] = v;
        if (v > bestVal) { bestVal = v; bestLag = lag; }
      }
      if (bestLag < 0 || bestVal < 0.4) return null;
      const y1 = corr[bestLag - 1] || 0, y2 = corr[bestLag], y3 = corr[bestLag + 1] || 0;
      const denom = y1 - 2 * y2 + y3;
      const shift = denom !== 0 ? 0.5 * (y1 - y3) / denom : 0;
      return { freq: sampleRate / (bestLag + shift), clarity: bestVal, rms: rms };
    }

    function micLoop(ts) {
      micRaf = requestAnimationFrame(micLoop);
      if (ts - lastTick < 55) return;
      lastTick = ts;
      if (!analyser) return;
      analyser.getFloatTimeDomainData(buf);
      const res = autoCorrelate(buf, A.getContext().sampleRate);
      if (res && res.freq > 60 && res.freq < 500) {
        updateReadout(res.freq, res.clarity);
      }
    }

    async function startMic() {
      if (stream) { stopMic(); return; }
      if (micPending) return;
      if (location.protocol === 'file:') {
        statusEl.textContent = I18N.t('fileBlocked', 'file:// 下浏览器禁用麦克风，请用本地服务器打开');
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        statusEl.textContent = I18N.t('micUnsupported', '这个浏览器不支持麦克风输入');
        return;
      }
      micPending = true;
      micBtn.disabled = true;
      micBtn.textContent = I18N.t('micRequesting', '请求麦克风…');
      statusEl.textContent = I18N.t('micRequestingStatus', '正在请求麦克风权限…在弹窗里点「允许」');
      statusEl.className = 'tuner-status';
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
      } catch (err) {
        micPending = false;
        micBtn.disabled = false;
        micBtn.textContent = I18N.t('micOn', '打开麦克风');
        statusEl.textContent = err && err.name === 'NotAllowedError'
          ? I18N.t('micDenied', '麦克风权限被拒绝 · 在地址栏权限里允许后再试')
          : I18N.t('micError', '打不开麦克风 · 检查系统输入设备');
        return;
      }
      micPending = false;
      micBtn.disabled = false;
      const ctx = A.getContext();
      sourceNode = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.2;
      sourceNode.connect(analyser);
      buf = new Float32Array(analyser.fftSize);
      micBtn.textContent = I18N.t('micOff', '关闭麦克风');
      micBtn.classList.add('is-on');
      statusEl.textContent = I18N.t('micListening', '正在听 · 拨一下 {s} 弦', { s: target });
      statusEl.className = 'tuner-status';
      micLoop(0);
    }

    function stopMic() {
      if (micRaf) cancelAnimationFrame(micRaf);
      micRaf = null;
      if (sourceNode) { try { sourceNode.disconnect(); } catch (e) { /* ignore */ } sourceNode = null; }
      if (analyser) { try { analyser.disconnect(); } catch (e) { /* ignore */ } analyser = null; }
      if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
      micBtn.textContent = I18N.t('micOn', '打开麦克风');
      micBtn.classList.remove('is-on');
      hasSignal = false;
      statusEl.textContent = I18N.t('micStopped', '麦克风已关闭');
      statusEl.className = 'tuner-status';
      setNeedle(0, false);
    }

    micBtn.addEventListener('click', startMic);
    stoppers.push(() => { if (stream) stopMic(); });
    selectTarget(6, false);
  }
  initTuner();

  /* ============================================================
     相对调音
     ============================================================ */
  function initRelativeTuning() {
    const host = $('#relativeTuning');
    if (!host) return;
    const rows = [
      { from: [6, 5], to: [5, 0] },
      { from: [5, 5], to: [4, 0] },
      { from: [4, 5], to: [3, 0] },
      { from: [3, 4], to: [2, 0] },
      { from: [2, 5], to: [1, 0] }
    ];
    rows.forEach((r) => {
      const text = I18N.t('relativeRow', '{a} 弦 {af} 品 = {b} 弦空弦', { a: r.from[0], af: r.from[1], b: r.to[0] });
      const row = document.createElement('div');
      row.className = 'relative-row';
      row.innerHTML = '<span>' + text + '</span><button type="button" class="btn tiny ghost">' + I18N.t('hearPair', '听这对') + '</button>';
      const btn = row.querySelector('button');
      btn.addEventListener('click', () => {
        A.ensure();
        A.playString(r.from[0], r.from[1], { gain: 0.8 });
        setTimeout(() => A.playString(r.to[0], r.to[1], { gain: 0.8 }), 900);
        row.classList.add('is-on');
        setTimeout(() => row.classList.remove('is-on'), 1600);
      });
      host.appendChild(row);
    });
  }
  initRelativeTuning();

  /* ============================================================
     节拍器
     ============================================================ */
  function initMetronome() {
    const host = $('#metroMount');
    if (!host) return;
    host.innerHTML =
      '<div class="metro-top">' +
        '<div class="metro-readout">' +
          '<div class="metro-bpm"><b data-m-bpm>80</b><span>BPM</span></div>' +
          '<div class="metro-beats" data-m-beats></div>' +
          '<div class="metro-sub" data-m-sub>' + I18N.t('metroSub', '{m} / {b} · 每拍一下', { m: 4, b: 4 }) + '</div>' +
        '</div>' +
        '<div class="metro-pulse" data-m-pulse><b>1</b><i></i></div>' +
        '<div class="metro-fig" data-m-fig></div>' +
      '</div>' +
      '<div class="metro-controls">' +
        '<button type="button" class="btn" data-m-start><span class="tr-icon">▶</span><span data-m-start-label>' + I18N.t('metroStart', '开始') + '</span></button>' +
        '<button type="button" class="btn ghost" data-m-tap>' + I18N.t('tapTempo', 'Tap 速度') + '</button>' +
        '<label class="field">' + I18N.t('timeSig', '拍号') + ' <select data-m-meter><option value="4">4 / 4</option><option value="3">3 / 4</option><option value="2">2 / 4</option><option value="6">6 / 8</option></select></label>' +
        '<label class="field range">' + I18N.t('tempo', '速度') + '<input type="range" min="40" max="200" step="2" value="80" data-m-range></label>' +
      '</div>';

    const bpmEl = $('[data-m-bpm]', host);
    const beatsEl = $('[data-m-beats]', host);
    const subEl = $('[data-m-sub]', host);
    const startBtn = $('[data-m-start]', host);
    const startLabel = $('[data-m-start-label]', host);
    const range = $('[data-m-range]', host);
    const meterSel = $('[data-m-meter]', host);
    const tapBtn = $('[data-m-tap]', host);
    const fig = $('[data-m-fig]', host);
    const pulse = $('[data-m-pulse]', host);
    const pulseNum = pulse ? pulse.querySelector('b') : null;

    let bpm = 80;
    let meter = 4;
    let clock = null;
    let running = false;
    let swing = 1;

    // 节拍器图形
    const NS = 'http://www.w3.org/2000/svg';
    function mk(tag, attrs) {
      const e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
      return e;
    }
    const svg = mk('svg', { viewBox: '0 0 160 220', class: 'metro-svg' });
    svg.appendChild(mk('path', { d: 'M80 16 L134 202 H26 Z', fill: '#291e16', stroke: 'rgba(238,185,111,.25)' }));
    svg.appendChild(mk('path', { d: 'M80 16 L108 202 H52 Z', fill: '#1b1410', opacity: '.65' }));
    const arm = mk('g', { transform: 'rotate(18 80 180)' });
    arm.appendChild(mk('line', { x1: 80, y1: 180, x2: 80, y2: 46, stroke: '#eeb96f', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
    arm.appendChild(mk('rect', { x: 70, y: 66, width: 20, height: 14, rx: 3, fill: '#eeb96f' }));
    svg.appendChild(arm);
    svg.appendChild(mk('circle', { cx: 80, cy: 180, r: 5, fill: '#eeb96f' }));
    fig.appendChild(svg);

    function renderDots() {
      beatsEl.innerHTML = '';
      for (let i = 0; i < meter; i++) {
        const d = document.createElement('i');
        if (i === 0) d.className = 'is-accent';
        beatsEl.appendChild(d);
      }
      subEl.textContent = meter === 6 ? I18N.t('metroSub6', '6 / 8 · 按 6 拍数') : I18N.t('metroSub', '{m} / {b} · 每拍一下', { m: meter, b: 4 });
    }

    function setBeat(beat) {
      $$('i', beatsEl).forEach((d, i) => d.classList.toggle('is-on', i === beat));
      if (beat >= 0) {
        if (pulseNum) pulseNum.textContent = beat + 1;
        if (pulse) {
          pulse.classList.remove('is-tick');
          void pulse.offsetWidth;
          pulse.classList.add('is-tick');
        }
      }
      swing = swing === 1 ? -1 : 1;
      const deg = swing * 20;
      arm.setAttribute('transform', 'rotate(' + deg + ' 80 180)');
    }

    function stop() {
      if (clock) { clock.stop(); clock = null; }
      running = false;
      startBtn.classList.remove('is-playing');
      startLabel.textContent = I18N.t('metroStart', '开始');
      setBeat(-1);
    }

    function start() {
      if (running) { stop(); return; }
      A.ensure();
      running = true;
      startBtn.classList.add('is-playing');
      startLabel.textContent = I18N.t('metroStop', '停止');
      clock = new BeatClock({
        bpm: bpm,
        beatsPerBar: meter,
        subdivision: 1,
        onTick: (info) => A.click(info.time, info.beat === 0, 0.2),
        onVisual: (info) => setBeat(info.beat)
      });
      clock.start();
    }

    function setBpm(v) {
      bpm = Math.max(40, Math.min(200, v));
      bpmEl.textContent = bpm;
      range.value = bpm;
      if (running) { stop(); start(); }
    }

    startBtn.addEventListener('click', start);
    range.addEventListener('input', () => setBpm(parseInt(range.value, 10)));
    meterSel.addEventListener('change', () => {
      meter = parseInt(meterSel.value, 10);
      renderDots();
      if (running) { stop(); start(); }
    });

    let taps = [];
    tapBtn.addEventListener('click', () => {
      const now = performance.now();
      taps = taps.filter((t) => now - t < 2500);
      taps.push(now);
      if (taps.length >= 3) {
        const gaps = [];
        for (let i = 1; i < taps.length; i++) gaps.push(taps[i] - taps[i - 1]);
        const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        setBpm(Math.round(60000 / avg));
      }
    });

    renderDots();
    stoppers.push(stop);
  }
  initMetronome();

  /* ============================================================
     节奏型
     ============================================================ */
  function initPatterns() {
    const grid = $('#patternMount');
    const board = $('#patternBoard');
    if (!grid || !board) return;
    let current = D.STRUM_PATTERNS[0];
    let clock = null;
    let running = false;

    function patternArrows(p) {
      const slots = [];
      for (let i = 0; i < p.slots; i++) {
        const hit = p.hits.find((h) => h.slot === i);
        slots.push(hit ? hit.dir : '·');
      }
      return slots;
    }

    function renderGrid() {
      grid.innerHTML = '';
      D.STRUM_PATTERNS.forEach((p) => {
        const card = document.createElement('button');
        const pp = I18N.pattern(p);
        card.type = 'button';
        card.className = 'pattern-card' + (p.id === current.id ? ' is-on' : '');
        const arrows = patternArrows(p).map((a) => '<i class="' + (a === 'D' ? 'is-down' : a === 'U' ? 'is-up' : '') + '">' + (a === 'D' ? '↓' : a === 'U' ? '↑' : '·') + '</i>').join('');
        card.innerHTML = '<span class="pc-name">' + pp.name + '</span><span class="pc-arrows">' + arrows + '</span><span class="pc-desc">' + pp.desc + '</span>';
        card.addEventListener('click', () => {
          current = p;
          stop();
          renderGrid();
          renderBoard();
        });
        grid.appendChild(card);
      });
    }

    function renderBoard() {
      const p = current;
      const pp = I18N.pattern(p);
      board.innerHTML =
        '<div class="pb-head"><div><h4>' + pp.name + '</h4><p>' + pp.desc + '</p></div>' +
        '<div class="pb-arrow" data-pb-arrow>↓</div></div>' +
        '<div class="pb-slots" data-pb-slots></div>' +
        '<div class="pb-foot">' +
          '<button type="button" class="btn small" data-pb-start><span class="tr-icon">▶</span><span data-pb-label>' + I18N.t('playPattern', '播放节奏') + '</span></button>' +
          '<label class="field range">' + I18N.t('tempo', '速度') + '<input type="range" min="50" max="140" step="2" value="70" data-pb-bpm><b data-pb-bpmval>70</b></label>' +
          '<span class="hint">' + I18N.t('demoChord', '示范和弦：C · 下扫从 6 弦开始') + '</span>' +
        '</div>';
      const slotsEl = $('[data-pb-slots]', board);
      slotsEl.style.gridTemplateColumns = 'repeat(' + p.slots + ', 1fr)';
      const arrows = patternArrows(p);
      arrows.forEach((a, i) => {
        const cell = document.createElement('span');
        cell.className = 'pb-slot' + (a === 'D' ? ' is-down' : a === 'U' ? ' is-up' : ' is-rest') + (i % 2 === 0 ? ' is-beat' : '');
        cell.setAttribute('data-slot', String(i));
        cell.innerHTML = '<b>' + (a === 'D' ? '↓' : a === 'U' ? '↑' : '·') + '</b><small>' + (i % 2 === 0 ? (i / 2 + 1) : '') + '</small>';
        slotsEl.appendChild(cell);
      });
      const startBtn = $('[data-pb-start]', board);
      const label = $('[data-pb-label]', board);
      const bpmInput = $('[data-pb-bpm]', board);
      const bpmVal = $('[data-pb-bpmval]', board);
      let bpm = 70;

      function highlight(slot) {
        $$('.pb-slot', slotsEl).forEach((cell, i) => cell.classList.toggle('is-on', i === slot));
        const a = arrows[slot];
        if (a && a !== '·') $('[data-pb-arrow]', board).textContent = a === 'D' ? '↓' : '↑';
      }

      function stop() {
        if (clock) { clock.stop(); clock = null; }
        running = false;
        label.textContent = I18N.t('playPattern', '播放节奏');
        startBtn.classList.remove('is-playing');
        highlight(-1);
      }

      function start() {
        if (running) { stop(); return; }
        A.ensure();
        running = true;
        label.textContent = I18N.t('stop', '停止');
        startBtn.classList.add('is-playing');
        highlight(-1);
        clock = new BeatClock({
          bpm: bpm,
          beatsPerBar: p.meter,
          subdivision: 2,
          onTick: (info) => {
            const slot = info.beat * 2 + info.sub;
            const hit = p.hits.find((h) => h.slot === slot);
            if (hit) {
              A.strum(D.CHORD_MAP.C.frets, hit.dir === 'D' ? 'down' : 'up', {
                when: info.time,
                gain: hit.dir === 'D' ? 0.4 : 0.3,
                gap: 0.02
              });
            }
            A.click(info.time, slot === 0, 0.09);
          },
          onVisual: (info) => highlight(info.beat * 2 + info.sub)
        });
        clock.start();
      }

      startBtn.addEventListener('click', start);
      bpmInput.addEventListener('input', () => {
        bpm = parseInt(bpmInput.value, 10);
        bpmVal.textContent = bpm;
        if (running) { stop(); start(); }
      });
      stoppers.push(stop);
    }

    renderGrid();
    renderBoard();
  }
  initPatterns();

  /* ============================================================
     曲目
     ============================================================ */
  function initSongs() {
    const list = $('#songList');
    const mount = $('#playerMount');
    if (!list || !mount) return;
    let songPlayer = null;

    function loadSong(id) {
      const raw = D.SONGS.find((s) => s.id === id) || D.SONGS[0];
      const song = I18N.song(raw);
      $$('.song-chip', list).forEach((b) => b.classList.toggle('is-on', b.getAttribute('data-song') === id));
      if (songPlayer) {
        songPlayer.pause(true);
        const i = players.indexOf(songPlayer);
        if (i >= 0) players.splice(i, 1);
        songPlayer = null;
      }
      mount.innerHTML = '';
      songPlayer = new TabPlayer(mount, {
        title: song.title,
        desc: song.subtitle + ' · ' + song.key + ' · ' + song.level,
        tip: song.tips.join(I18N.isEN ? ' · ' : '  '),
        steps: song.steps,
        bpm: song.bpm,
        beatsPerBar: song.beatsPerBar,
        onFinish: () => {
          state.played = state.played || {};
          state.played[id] = true;
          save();
          updateAchievements();
        }
      });
    }

    D.SONGS.forEach((raw, i) => {
      const song = I18N.song(raw);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'song-chip' + (i === 0 ? ' is-on' : '');
      b.setAttribute('data-song', song.id);
      b.innerHTML = '<b>' + song.title + '</b><span>' + song.level + ' · ' + song.key + '</span>';
      b.addEventListener('click', () => loadSong(song.id));
      list.appendChild(b);
    });
    loadSong(D.SONGS[0].id);
  }
  initSongs();

  /* ============================================================
     练习计划
     ============================================================ */
  const PLAN = (I18N.plan && I18N.plan()) || [
    { id: 'warm', text: '热身 2 分钟 · 爬格子 1-2-3-4' },
    { id: 'tune', text: '调音 1 分钟 · 六根弦过一遍' },
    { id: 'chord', text: '和弦 5 分钟 · C ↔ Am ↔ F ↔ G' },
    { id: 'rhythm', text: '节奏 5 分钟 · 60 BPM 八分扫弦' },
    { id: 'song', text: '曲目 5 分钟 · 小星星 / 生日快乐' },
    { id: 'record', text: '收尾 2 分钟 · 手机录一遍' }
  ];
  function todayLabelText() {
    const d = new Date();
    if (I18N.isEN) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    const wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · ' + wd;
  }
  function initPlan() {
    const host = $('#planList');
    if (!host) return;
    const label = $('#todayLabel');
    if (label) label.textContent = todayLabelText();
    if (state.planDate !== todayKey()) {
      state.planDate = todayKey();
      state.plan = {};
      save();
    }
    host.innerHTML = '';
    PLAN.forEach((p) => {
      const labelEl = document.createElement('label');
      labelEl.className = 'check plan-item';
      labelEl.innerHTML = '<input type="checkbox" ' + (state.plan[p.id] ? 'checked' : '') +
        '><span class="box"></span><span>' + p.text + '</span>';
      labelEl.querySelector('input').addEventListener('change', (ev) => {
        if (state.planDate !== todayKey()) { state.planDate = todayKey(); state.plan = {}; }
        state.plan[p.id] = ev.target.checked;
        save();
        updatePlanBar();
      });
      host.appendChild(labelEl);
    });

    const days = (I18N.days && I18N.days()) || [
      ['Day 1', '认识琴 + 调音 + 空弦拨弦，每根弦拨 20 下'],
      ['Day 2', '爬格子 + C、G 两个和弦'],
      ['Day 3', 'Am、Em + C→Am→Em 转换'],
      ['Day 4', '节奏型「四下」+ 小星星'],
      ['Day 5', 'D、Dm + 生日快乐'],
      ['Day 6', 'Fmaj7 + 送别前四小节'],
      ['Day 7', '复习 + 录一首完整的歌']
    ];
    const table = $('#dayTable');
    if (table) {
      table.innerHTML = days.map((d) => '<div class="day-row"><b>' + d[0] + '</b><span>' + d[1] + '</span></div>').join('');
    }
    updatePlanBar();
  }
  function updatePlanBar() {
    const bar = $('[data-plan-bar]');
    if (!bar) return;
    const done = PLAN.filter((p) => state.plan[p.id]).length;
    bar.style.width = (done / PLAN.length * 100) + '%';
  }
  initPlan();
  (function initAchievements() {
    const host = $('#planList');
    if (!host) return;
    const box = document.createElement('p');
    box.className = 'achievement-line';
    box.setAttribute('data-achievements', '');
    box.textContent = I18N.isEN ? (I18N.t('achievement', '{n} songs played end to end', { n: 0 })) : '已完整弹过 0 首';
    host.appendChild(box);
  })();

  /* ============================================================
     测验
     ============================================================ */
  function initQuiz() {
    const host = $('#quizMount');
    if (!host) return;
    host.innerHTML =
      '<div class="card quiz-card">' +
        '<div class="quiz-tabs" role="tablist">' +
          '<button type="button" class="is-on" data-quiz="find">' + I18N.t('quizFind', '找音') + '</button>' +
          '<button type="button" data-quiz="ear">' + I18N.t('quizEar', '听音') + '</button>' +
          '<button type="button" data-quiz="chord">' + I18N.t('quizChord', '听和弦') + '</button>' +
        '</div>' +
        '<div class="quiz-meta"><span data-quiz-score>' + I18N.t('score', '本轮 {score} 分 · 连对 {streak} · 最高连对 {best}', { score: 0, streak: 0, best: 0 }) + '</span><span data-quiz-best></span></div>' +
        '<div data-quiz-stage></div>' +
      '</div>';

    const stage = $('[data-quiz-stage]', host);
    const scoreEl = $('[data-quiz-score]', host);
    const tabs = $$('[data-quiz]', host);
    let mode = 'find';
    let streak = 0;
    let score = 0;
    let timer = null;

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function updateScore() {
      const bestKey = mode === 'find' ? 'findBest' : mode === 'ear' ? 'earBest' : 'chordBest';
      scoreEl.textContent = I18N.t('score', '本轮 {score} 分 · 连对 {streak} · 最高连对 {best}', { score: score, streak: streak, best: state.quiz[bestKey] });
    }

    function best(key) {
      if (streak > state.quiz[key]) {
        state.quiz[key] = streak;
        save();
      }
    }

    /* ---------- 找音 ---------- */
    let findBoard = null;
    let findTarget = null;
    let findLocked = false;

    function newFindTarget() {
      clearTimer();
      const pool = D.QUIZ_NOTES;
      findTarget = pool[Math.floor(Math.random() * pool.length)];
      const prompt = $('[data-find-prompt]', stage);
      if (prompt) prompt.innerHTML = I18N.t('findPrompt', '在指板上找到 <b>{n}</b><em>{s}</em>', { n: findTarget.name, s: findTarget.solfege });
      findLocked = false;
    }

    function buildFind() {
      clearTimer();
      stage.innerHTML =
        '<div class="quiz-row"><div class="quiz-prompt" data-find-prompt></div><button type="button" class="btn tiny ghost" data-find-skip>' + I18N.t('skip', '换一个') + '</button></div>' +
        '<div class="board-scroll"><div data-find-board></div></div>' +
        '<div class="quiz-feedback" data-find-fb>' + I18N.t('findHelp', '任意八度都算对 · 点指板上的位置作答') + '</div>';
      findBoard = new V.Fretboard($('[data-find-board]', stage), {
        mode: 'none',
        interactive: true,
        onNote: (s, f) => {
          if (findLocked || !findTarget) return;
          const info = D.noteAt(s, f);
          const fb = $('[data-find-fb]', stage);
          if (info.name === findTarget.name) {
            findLocked = true;
            findBoard.flash(s, f, 'ok');
            score++;
            streak++;
            best('findBest');
            updateScore();
            fb.className = 'quiz-feedback is-good';
            fb.textContent = I18N.t('findCorrect', '✓ 对了 · {s} 弦 {f} 品 就是 {n}', { s: s, f: f, n: findTarget.name });
            timer = setTimeout(newFindTarget, 700);
          } else {
            findLocked = true;
            streak = 0;
            updateScore();
            findBoard.flash(s, f, 'bad');
            fb.className = 'quiz-feedback is-bad';
            fb.textContent = I18N.t('findWrong', '✗ 这里是 {n}，正确答案已经标出来了', { n: info.name });
            const answers = [];
            for (let st = 1; st <= 6; st++) {
              for (let fr = 0; fr <= 12; fr++) {
                if (D.noteAt(st, fr).name === findTarget.name) answers.push({ s: st, f: fr });
              }
            }
            findBoard.setHighlight(answers);
            timer = setTimeout(() => {
              findBoard.clearHighlight();
              findLocked = false;
              if (findTarget) newFindTarget();
            }, 1700);
          }
        }
      });
      newFindTarget();
      $('[data-find-skip]', stage).addEventListener('click', () => {
        findBoard.clearHighlight();
        newFindTarget();
      });
    }

    /* ---------- 听音 ---------- */
    let earCurrent = null;
    let earLocked = false;

    function playEar() {
      if (!earCurrent) return;
      A.playString(earCurrent.s, earCurrent.f, { gain: 0.85 });
    }

    function newEar() {
      const pool = D.EAR_NOTES;
      earCurrent = pool[Math.floor(Math.random() * pool.length)];
      earLocked = false;
      const prompt = $('[data-ear-prompt]', stage);
      if (prompt) prompt.textContent = I18N.t('earPrompt', '听一个音，它是什么？');
      const fb = $('[data-ear-fb]', stage);
      if (fb) { fb.className = 'quiz-feedback'; fb.textContent = I18N.t('earHelp', '点「再听一次」可以重播'); }
      $$('[data-ear-answer]', stage).forEach((b) => b.classList.remove('is-good', 'is-bad'));
      setTimeout(playEar, 260);
    }

    function buildEar() {
      clearTimer();
      stage.innerHTML =
        '<div class="quiz-row"><div class="quiz-prompt" data-ear-prompt>' + I18N.t('earPrompt', '听一个音，它是什么？') + '</div><button type="button" class="btn tiny ghost" data-ear-play>' + I18N.t('replay', '再听一次') + '</button></div>' +
        '<div class="ear-grid">' +
          D.QUIZ_NOTES.map((n) => '<button type="button" class="ear-btn" data-ear-answer="' + n.name + '"><b>' + n.name + '</b><span>' + n.solfege + '</span></button>').join('') +
        '</div>' +
        '<div class="quiz-feedback" data-ear-fb>' + I18N.t('earHelp', '点「再听一次」可以重播') + '</div>';

      $$('[data-ear-answer]', stage).forEach((btn) => {
        btn.addEventListener('click', () => {
          if (earLocked || !earCurrent) return;
          const fb = $('[data-ear-fb]', stage);
          if (btn.getAttribute('data-ear-answer') === earCurrent.name) {
            earLocked = true;
            btn.classList.add('is-good');
            score++; streak++; best('earBest'); updateScore();
            fb.className = 'quiz-feedback is-good';
            fb.textContent = I18N.t('earCorrect', '✓ 对了 · {n}（{s}）', { n: earCurrent.name, s: earCurrent.solfege });
            timer = setTimeout(newEar, 800);
          } else {
            btn.classList.add('is-bad');
            streak = 0; updateScore();
            fb.className = 'quiz-feedback is-bad';
            fb.textContent = I18N.t('earWrong', '✗ 不对，正确答案是 {n}（{s}）', { n: earCurrent.name, s: earCurrent.solfege });
            const right = $$('[data-ear-answer]', stage).find((b) => b.getAttribute('data-ear-answer') === earCurrent.name);
            if (right) right.classList.add('is-good');
            earLocked = true;
            timer = setTimeout(newEar, 1400);
          }
        });
      });
      $('[data-ear-play]', stage).addEventListener('click', playEar);
      newEar();
    }

    /* ---------- 听和弦 ---------- */
    let chordCurrent = null;
    let chordLocked = false;

    function newChord() {
      chordCurrent = D.EAR_CHORDS[Math.floor(Math.random() * D.EAR_CHORDS.length)];
      chordLocked = false;
      const fb = $('[data-chord-fb]', stage);
      if (fb) { fb.className = 'quiz-feedback'; fb.textContent = I18N.t('earHelp', '点「再听一次」可以重播'); }
      $$('[data-chord-answer]', stage).forEach((b) => b.classList.remove('is-good', 'is-bad'));
      setTimeout(() => A.strum(D.CHORD_MAP[chordCurrent].frets, 'down', { gain: 0.6 }), 260);
    }

    function buildChord() {
      clearTimer();
      stage.innerHTML =
        '<div class="quiz-row"><div class="quiz-prompt">' + I18N.t('chordPrompt', '听一个和弦，它是哪个？') + '</div><button type="button" class="btn tiny ghost" data-chord-play>' + I18N.t('replay', '再听一次') + '</button></div>' +
        '<div class="chord-ear-grid">' +
          D.EAR_CHORDS.map((id) => '<button type="button" class="ear-btn" data-chord-answer="' + id + '"><b>' + id + '</b><span>' + (id === 'Am' ? I18N.t('minorChord', '小三') : I18N.t('majorChord', '大三')) + '</span></button>').join('') +
        '</div>' +
        '<div class="quiz-feedback" data-chord-fb>' + I18N.t('earHelp', '点「再听一次」可以重播') + '</div>';

      $$('[data-chord-answer]', stage).forEach((btn) => {
        btn.addEventListener('click', () => {
          if (chordLocked || !chordCurrent) return;
          const fb = $('[data-chord-fb]', stage);
          if (btn.getAttribute('data-chord-answer') === chordCurrent) {
            chordLocked = true;
            btn.classList.add('is-good');
            score++; streak++; best('chordBest'); updateScore();
            fb.className = 'quiz-feedback is-good';
            fb.textContent = I18N.t('chordCorrect', '✓ 对了 · 是 {c}', { c: chordCurrent });
            timer = setTimeout(newChord, 900);
          } else {
            btn.classList.add('is-bad');
            streak = 0; updateScore();
            fb.className = 'quiz-feedback is-bad';
            fb.textContent = I18N.t('chordWrong', '✗ 不对，正确答案是 {c}', { c: chordCurrent });
            const right = $$('[data-chord-answer]', stage).find((b) => b.getAttribute('data-chord-answer') === chordCurrent);
            if (right) right.classList.add('is-good');
            chordLocked = true;
            timer = setTimeout(newChord, 1500);
          }
        });
      });
      $('[data-chord-play]', stage).addEventListener('click', () => {
        if (chordCurrent) A.strum(D.CHORD_MAP[chordCurrent].frets, 'down', { gain: 0.6 });
      });
      newChord();
    }

    function switchMode(next) {
      mode = next;
      score = 0;
      streak = 0;
      updateScore();
      tabs.forEach((t) => t.classList.toggle('is-on', t.getAttribute('data-quiz') === next));
      if (next === 'find') buildFind();
      else if (next === 'ear') buildEar();
      else buildChord();
      if (next !== 'find' && findBoard) { findBoard.clearHighlight(); }
    }

    tabs.forEach((t) => t.addEventListener('click', () => switchMode(t.getAttribute('data-quiz'))));
    switchMode('find');
  }
  initQuiz();

  function updateAchievements() {
    const el = $('[data-achievements]');
    if (!el) return;
    const played = state.played || {};
    const count = Object.keys(played).length;
    if (I18N.isEN) {
      el.textContent = count === 1
        ? I18N.t('achievementOne', '已完整弹过 1 首')
        : I18N.t('achievement', '已完整弹过 {n} 首', { n: count });
    } else {
      el.textContent = '已完整弹过 ' + count + ' 首';
    }
  }

  /* ============================================================
     启动
     ============================================================ */
  updateProgress();
  setSoundUI();
  showSection(hashId() || 'start', false);
  requestAnimationFrame(() => window.scrollTo(0, 0));
  setTimeout(() => window.scrollTo(0, 0), 160);
  updateAchievements();

  /* 首次点击时解锁音频 */
  document.addEventListener('pointerdown', function unlock() {
    try { A.ensure(); } catch (e) { /* ignore */ }
    document.removeEventListener('pointerdown', unlock);
  }, { once: true });

  window.GuitarApp = { players, state, showSection };
})();
