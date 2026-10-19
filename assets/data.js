/* ============================================================
   吉他自习室 · 数据层
   六根弦、和弦指法、曲谱、节奏型、练习
   ============================================================ */
window.GuitarData = (function () {
  'use strict';

  const OPEN_MIDI = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };
  const STRING_NOTE = { 6: 'E', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'E' };
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SOLFEGE = { 0: 'do', 2: 're', 4: 'mi', 5: 'fa', 7: 'sol', 9: 'la', 11: 'si' };
  const DEGREE = { 0: 1, 2: 2, 4: 3, 5: 4, 7: 5, 9: 6, 11: 7 };
  const C_MAJOR = [0, 2, 4, 5, 7, 9, 11];

  const midiOf = (s, f) => OPEN_MIDI[s] + f;
  const freqOf = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const octaveOf = (m) => Math.floor(m / 12) - 1;

  function noteAt(s, f) {
    const midi = midiOf(s, f);
    const pc = ((midi % 12) + 12) % 12;
    return {
      string: s, fret: f, midi, pc,
      name: NOTE_NAMES[pc], octave: octaveOf(midi),
      label: NOTE_NAMES[pc] + octaveOf(midi),
      freq: freqOf(midi),
      degree: DEGREE[pc] || null,
      solfege: SOLFEGE[pc] || ''
    };
  }

  /* ---------------- 六根弦 ---------------- */
  const STRINGS = [6, 5, 4, 3, 2, 1].map((s) => {
    const n = noteAt(s, 0);
    return {
      s, note: n.name, octave: n.octave, label: n.label, freq: n.freq,
      gauge: ['最粗 · 最低', '粗', '中粗', '中', '细', '最细 · 最高'][6 - s],
      nickname: ['低音 E', 'A 弦', 'D 弦', 'G 弦', 'B 弦', '高音 e'][6 - s]
    };
  });

  /* ---------------- 和弦 ---------------- */
  /* frets: 索引 0 = 6 弦 ... 索引 5 = 1 弦；-1 = 不弹 */
  const CHORDS = [
    {
      id: 'C', name: 'C', full: 'C 大三和弦', level: 1, mood: '明亮、稳定，像「回家」',
      frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
      notes: 'C · E · G · C · E',
      steps: ['食指按 2 弦 1 品', '中指按 4 弦 2 品', '无名指按 5 弦 3 品', '6 弦不弹，其余五根都要响'],
      tip: '无名指按 5 弦 3 品时指尖立起来，别让它躺下去碰到 4 弦。',
      trap: '1 弦不响，通常是食指躺平压住了它。把食指的第一个关节拱起来。'
    },
    {
      id: 'G', name: 'G', full: 'G 大三和弦', level: 1, mood: '开阔、明亮，副歌常用',
      frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
      notes: 'G · B · D · G · B · G',
      steps: ['中指按 6 弦 3 品', '食指按 5 弦 2 品', '无名指按 1 弦 3 品', '六根弦都可以扫'],
      tip: '低音在 6 弦，扫弦从 6 弦开始，声音才厚。',
      trap: '1 弦 3 品要尽量靠近品丝，否则会「噗」的一声闷掉。'
    },
    {
      id: 'D', name: 'D', full: 'D 大三和弦', level: 1, mood: '干净、有点甜',
      frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2],
      notes: 'D · A · D · F#',
      steps: ['食指按 3 弦 2 品', '无名指按 2 弦 3 品', '中指按 1 弦 2 品', '只弹 4、3、2、1 弦'],
      tip: '只弹四根弦，右手别扫到 5、6 弦。',
      trap: '三根手指挤在很小的区域，一定要立起来，别互相压到。'
    },
    {
      id: 'A', name: 'A', full: 'A 大三和弦', level: 1, mood: '明亮、直接',
      frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0],
      notes: 'A · E · A · C# · E',
      steps: ['食指按 4 弦 2 品', '中指按 3 弦 2 品', '无名指按 2 弦 2 品', '5 弦空弦，6 弦不弹'],
      tip: '三根手指并排在同一品，可以稍微向琴头方向倾斜，让指尖更集中。',
      trap: '1 弦容易不响，因为无名指会碰到它。检查 1 弦是否还有声音。'
    },
    {
      id: 'E', name: 'E', full: 'E 大三和弦', level: 1, mood: '厚、有力，摇滚的底盘',
      frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0],
      notes: 'E · B · E · G# · B · E',
      steps: ['食指按 3 弦 1 品', '中指按 5 弦 2 品', '无名指按 4 弦 2 品', '六根弦都响'],
      tip: '六根弦全响，是最好检查手型的和弦。',
      trap: '3 弦 1 品要用食指指尖，别让指肚压到 2 弦。'
    },
    {
      id: 'Am', name: 'Am', full: 'A 小三和弦', level: 1, mood: '柔和、忧郁',
      frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
      notes: 'A · E · A · C · E',
      steps: ['食指按 2 弦 1 品', '中指按 4 弦 2 品', '无名指按 3 弦 2 品', '5 弦空弦，6 弦不弹'],
      tip: '和 C 和弦只差一个手指，C ↔ Am 是最好练的转换。',
      trap: '中指、无名指容易碰到 1 弦，扫完听一下 1 弦还在不在。'
    },
    {
      id: 'Em', name: 'Em', full: 'E 小三和弦', level: 1, mood: '空、暗，民谣里到处都是',
      frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0],
      notes: 'E · B · E · G · B · E',
      steps: ['中指按 5 弦 2 品', '无名指按 4 弦 2 品', '其余四根弦空弦'],
      tip: '只用两根手指，是最容易按响的和弦，先拿它建立信心。',
      trap: '中指、无名指如果躺平，会压到 3 弦，3 弦空弦就没了。'
    },
    {
      id: 'Dm', name: 'Dm', full: 'D 小三和弦', level: 1, mood: '温柔、略带伤感',
      frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1],
      notes: 'D · A · D · F',
      steps: ['食指按 1 弦 1 品', '中指按 3 弦 2 品', '无名指按 2 弦 3 品', '只弹 4、3、2、1 弦'],
      tip: '和 D 和弦只差一个音：把 1 弦从 2 品挪到 1 品就是 Dm。',
      trap: '1 弦 1 品要靠近琴枕，太靠右会闷。'
    },
    {
      id: 'Fmaj7', name: 'Fmaj7', full: 'F 大七和弦（简易 F）', level: 2, mood: '柔软、悬浮，比 F 好按太多',
      frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0],
      notes: 'F · A · C · E',
      steps: ['食指按 2 弦 1 品', '中指按 3 弦 2 品', '无名指按 4 弦 3 品', '1 弦空弦，5、6 弦不弹'],
      tip: '按不住大横按 F 的时候，先用它代替，歌照样能弹。',
      trap: '4 弦 3 品和 3 弦 2 品靠近，手指要立起来。'
    },
    {
      id: 'G7', name: 'G7', full: 'G 属七和弦', level: 2, mood: '有推动力，想要解决到 C',
      frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1],
      notes: 'G · B · D · G · B · F',
      steps: ['无名指按 6 弦 3 品', '中指按 5 弦 2 品', '食指按 1 弦 1 品', '六根弦都响'],
      tip: '在 C 大调里，G7 → C 是最自然的「回家」。',
      trap: '食指按 1 弦 1 品时，别把 2 弦也压住。'
    },
    {
      id: 'Cmaj7', name: 'Cmaj7', full: 'C 大七和弦', level: 2, mood: '通透、松弛，很适合分解和弦',
      frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0],
      notes: 'C · E · G · B · E',
      steps: ['中指按 4 弦 2 品', '无名指按 5 弦 3 品', '2、1 弦空弦，6 弦不弹'],
      tip: '比 C 少一根手指，声音却更「高级」。',
      trap: '1 弦要留空，别被无名指碰到。'
    },
    {
      id: 'F', name: 'F', full: 'F 大三和弦（大横按）', level: 2, mood: '亮、硬，是第一个坎',
      frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1],
      barre: { fret: 1, from: 0, to: 5 },
      notes: 'F · C · F · A · C · F',
      steps: ['食指侧面横压 1 品六根弦', '中指按 3 弦 2 品', '无名指按 5 弦 3 品', '小指按 4 弦 3 品'],
      tip: '食指用「侧面」而不是指肚，靠近品丝，拇指在琴颈后面正对食指发力。',
      trap: '先别管六根弦，把 1、2 弦弹响，再一根根加进来。'
    },
    {
      id: 'Bm', name: 'Bm', full: 'B 小三和弦（横按）', level: 2, mood: '暗、紧，很多歌的必经之路',
      frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1],
      barre: { fret: 2, from: 1, to: 5 },
      notes: 'B · F# · B · D · F#',
      steps: ['食指横压 2 品 5 根弦', '中指按 2 弦 3 品', '无名指按 4 弦 4 品', '小指按 3 弦 4 品'],
      tip: '和大横按 F 是同一个手型，只是整体往右挪一品。',
      trap: '5 弦必须响，它是 Bm 的根音。'
    }
  ];
  const CHORD_MAP = {};
  CHORDS.forEach((c) => { CHORD_MAP[c.id] = c; });

  /* ---------------- 曲谱 / 练习 ---------------- */
  const n = (s, f, beats) => ({ notes: [{ s, f }], beats: beats == null ? 1 : beats });

  const twinkle = [
    n(2, 1), n(2, 1), n(1, 3), n(1, 3), n(1, 5), n(1, 5), n(1, 3, 2),
    n(1, 1), n(1, 1), n(1, 0), n(1, 0), n(2, 3), n(2, 3), n(2, 1, 2)
  ].concat([
    n(2, 1), n(2, 1), n(1, 3), n(1, 3), n(1, 5), n(1, 5), n(1, 3, 2),
    n(1, 1), n(1, 1), n(1, 0), n(1, 0), n(2, 3), n(2, 3), n(2, 1, 2)
  ]);

  const ode = [
    n(1, 0), n(1, 0), n(1, 1), n(1, 3),
    n(1, 3), n(1, 1), n(1, 0), n(2, 3),
    n(2, 1), n(2, 1), n(2, 3), n(1, 0),
    n(1, 0, 1.5), n(2, 3, 0.5), n(2, 3, 2),
    n(1, 0), n(1, 0), n(1, 1), n(1, 3),
    n(1, 3), n(1, 1), n(1, 0), n(2, 3),
    n(2, 1), n(2, 1), n(2, 3), n(1, 0),
    n(2, 3, 1.5), n(2, 1, 0.5), n(2, 1, 2)
  ];

  const birthday = [
    n(5, 0, 1), n(5, 0, 0.5), n(5, 2, 0.5), n(5, 0, 1),
    n(2, 1, 1), n(2, 0, 2),
    n(5, 0, 1), n(5, 0, 0.5), n(5, 2, 0.5), n(5, 0, 1),
    n(2, 3, 1), n(2, 1, 2),
    n(5, 0, 1), n(5, 0, 0.5), n(1, 3, 0.5), n(1, 0, 1),
    n(2, 1, 1), n(2, 0, 1), n(5, 2, 1),
    n(1, 1, 1), n(1, 1, 0.5), n(1, 0, 0.5), n(2, 1, 1),
    n(2, 3, 1), n(2, 1, 2)
  ];

  const farewell = [
    n(1, 3, 1), n(1, 0, 1), n(1, 3, 1), n(1, 8, 1),
    n(1, 7, 1), n(1, 5, 1), n(1, 3, 2),
    n(1, 3, 1), n(2, 1, 1), n(2, 3, 1), n(1, 0, 1),
    n(2, 3, 1), n(2, 1, 1), n(2, 3, 2),
    n(1, 3, 1), n(1, 0, 1), n(1, 3, 1), n(1, 8, 1),
    n(1, 7, 1), n(1, 5, 1), n(1, 3, 2),
    n(1, 3, 1), n(2, 3, 1), n(1, 0, 1), n(1, 1, 1),
    n(2, 0, 0.75), n(2, 1, 3.25)
  ];

  const SONGS = [
    {
      id: 'twinkle', title: '小星星', subtitle: 'Twinkle Twinkle Little Star',
      level: '入门', key: 'C 大调', bpm: 96, beatsPerBar: 4,
      desc: '只用 1、2 弦，是练右手拨弦和数拍子的第一首。',
      tips: ['先不按左手，用空弦把节奏数熟。', '每个音都要「弹清楚再换下一个」，不要抢。', '第二遍开始试着不看右手。'],
      steps: twinkle
    },
    {
      id: 'ode', title: '欢乐颂', subtitle: 'Ode to Joy',
      level: '入门', key: 'C 大调', bpm: 100, beatsPerBar: 4,
      desc: '旋律在 1、2 弦之间来回，练换弦时不碰到旁边的弦。',
      tips: ['第 3 小节开始往低音走，右手要提前找到 2 弦。', '每句结尾的长音要让它自然响完。'],
      steps: ode
    },
    {
      id: 'birthday', title: '生日快乐', subtitle: 'Happy Birthday',
      level: '入门', key: 'C 大调', bpm: 92, beatsPerBar: 3,
      desc: '3/4 拍，每小节三拍。先把「123、223」数顺。',
      tips: ['数拍：1 2 3 | 1 2 3，重音在第一拍。', '第 5 小节会跳到 1 弦 3 品，左手提前准备。', '会唱就会弹，跟着嘴里的歌走。'],
      steps: birthday
    },
    {
      id: 'farewell', title: '送别', subtitle: '长亭外，古道边',
      level: '进阶', key: 'C 大调', bpm: 72, beatsPerBar: 4,
      desc: '长音多、句子长，练右手稳定和左手伸展。',
      tips: ['第 1 小节最后一个音在 1 弦 8 品，左手要提前滑过去。', '慢速练，每个长音都数满四拍。', '先练前四小节，循环十遍，再往后。'],
      steps: farewell
    }
  ];

  const spider = [];
  for (let s = 6; s >= 1; s--) for (let f = 1; f <= 4; f++) spider.push(n(s, f));

  const cscale = [
    n(2, 1), n(2, 3), n(1, 0), n(1, 1), n(1, 3), n(1, 5), n(1, 7), n(1, 8),
    n(1, 8), n(1, 7), n(1, 5), n(1, 3), n(1, 1), n(1, 0), n(2, 3), n(2, 1)
  ];

  const openAlt = [6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 5].map((s) => n(s, 0));

  const EXERCISES = [
    {
      id: 'spider', title: '爬格子 · 1-2-3-4', bpm: 70, beatsPerBar: 4,
      desc: '每根弦都用 1、2、3、4 指依次按 1–4 品。练左手独立性和准确度。',
      tip: '手指尽量不离开弦面，按下去的位置靠近品丝。慢到每个音都干净。',
      steps: spider
    },
    {
      id: 'cscale', title: 'C 大调音阶 · 上下行', bpm: 80, beatsPerBar: 4,
      desc: '从 2 弦 1 品的 C 开始，上行到 1 弦 8 品的 C，再原路下行。',
      tip: '上行时右手下拨，下行时上拨；也可以全部用食指、中指交替。',
      steps: cscale
    },
    {
      id: 'open', title: '空弦交替 · 右手稳定', bpm: 60, beatsPerBar: 4,
      desc: '从 6 弦到 1 弦再回来，只拨空弦，听每个音的音量是否一样。',
      tip: '手腕放松，拨片不要捏死。目标：十二个音，音量像一条直线。',
      steps: openAlt
    }
  ];

  /* ---------------- 节奏 ---------------- */
  const STRUM_PATTERNS = [
    {
      id: 'basic', name: '四下 · 四分音符', meter: 4, slots: 8,
      hits: [{ slot: 0, dir: 'D' }, { slot: 2, dir: 'D' }, { slot: 4, dir: 'D' }, { slot: 6, dir: 'D' }],
      desc: '每个正拍下扫一次。先把它弹到「像心跳一样稳」，再学别的。'
    },
    {
      id: 'folk', name: '民谣万能型', meter: 4, slots: 8,
      hits: [{ slot: 0, dir: 'D' }, { slot: 2, dir: 'D' }, { slot: 3, dir: 'U' }, { slot: 5, dir: 'U' }, { slot: 6, dir: 'D' }, { slot: 7, dir: 'U' }],
      desc: '「下 下上 · 上下上」。手不要停，空拍也保持上下摆动的惯性。'
    },
    {
      id: 'drive', name: '八分音符 · 上下交替', meter: 4, slots: 8,
      hits: [{ slot: 0, dir: 'D' }, { slot: 1, dir: 'U' }, { slot: 2, dir: 'D' }, { slot: 3, dir: 'U' }, { slot: 4, dir: 'D' }, { slot: 5, dir: 'U' }, { slot: 6, dir: 'D' }, { slot: 7, dir: 'U' }],
      desc: '手腕像节拍器一样均匀摆动，速度先压在 60。'
    },
    {
      id: 'waltz', name: '3/4 拍 · 三拍子', meter: 3, slots: 6,
      hits: [{ slot: 0, dir: 'D' }, { slot: 2, dir: 'D' }, { slot: 4, dir: 'D' }],
      desc: '每小节三拍，第一拍重一点。适合《生日快乐》这类歌。'
    }
  ];

  const PROGRESSIONS = [
    { id: 'p1645', name: '1645 万能进行', chords: ['C', 'G', 'Am', 'F'] },
    { id: 'pcanon', name: '卡农进行', chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G'] },
    { id: 'p50s', name: '50 年代进行', chords: ['C', 'Am', 'F', 'G'] },
    { id: 'pfolk', name: '民谣进行', chords: ['G', 'D', 'Em', 'C'] }
  ];

  /* ---------------- 测验 ---------------- */
  const QUIZ_NOTES = [
    { name: 'C', solfege: 'do' }, { name: 'D', solfege: 're' }, { name: 'E', solfege: 'mi' },
    { name: 'F', solfege: 'fa' }, { name: 'G', solfege: 'sol' }, { name: 'A', solfege: 'la' },
    { name: 'B', solfege: 'si' }
  ];

  const EAR_NOTES = [
    { name: 'C', solfege: 'do', s: 2, f: 1 }, { name: 'D', solfege: 're', s: 2, f: 3 },
    { name: 'E', solfege: 'mi', s: 1, f: 0 }, { name: 'F', solfege: 'fa', s: 1, f: 1 },
    { name: 'G', solfege: 'sol', s: 1, f: 3 }, { name: 'A', solfege: 'la', s: 1, f: 5 },
    { name: 'B', solfege: 'si', s: 1, f: 7 }
  ];

  const EAR_CHORDS = ['C', 'Am', 'F', 'G'];

  return {
    OPEN_MIDI, STRING_NOTE, NOTE_NAMES, SOLFEGE, DEGREE, C_MAJOR,
    midiOf, freqOf, octaveOf, noteAt,
    STRINGS, CHORDS, CHORD_MAP: CHORD_MAP,
    SONGS, EXERCISES, STRUM_PATTERNS, PROGRESSIONS,
    QUIZ_NOTES, EAR_NOTES, EAR_CHORDS
  };
})();
