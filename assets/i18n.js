/* ============================================================
   Guitar Studio · English layer
   English copy for UI strings and data-driven content.
   Chinese stays inline as the fallback in the code.
   ============================================================ */
window.I18N = (function () {
  'use strict';

  const isEN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;

  const UI = {
    soundOn: 'Sound on',
    soundOff: 'Muted',
    markLearn: 'Mark as learned',
    markDone: 'Learned · click to undo',
    stringFret: 'String {s}, fret {f}',
    degree: 'degree {d}',
    clickBoard: 'Click anywhere on the fretboard',
    clickFret: 'Click a fret',
    cents: 'cents',
    target: 'Target: string {s} · {f} Hz',
    pickString: 'Pick a string, then press Reference tone.',
    refTone: 'Reference tone',
    micOn: 'Use microphone',
    micOff: 'Stop microphone',
    micRequesting: 'Requesting mic…',
    micRequestingStatus: 'Requesting microphone permission… choose Allow.',
    micListening: 'Listening… pluck string {s}',
    micStopped: 'Microphone off',
    micDenied: 'Microphone permission denied. Allow it in the address bar and try again.',
    micError: "Couldn't open the microphone. Check your input device.",
    micUnsupported: "This browser doesn't support microphone input.",
    fileBlocked: 'Browsers block the microphone on file://. Open the site from a local server.',
    inTune: 'In tune · hold it for two seconds',
    flat: '{n} cents flat · tighten the peg slowly',
    sharp: '{n} cents sharp · loosen the peg slowly',
    heardOther: 'Heard {f} Hz — not close to any open string',
    tunerHint: 'With the mic on, pluck one string at a time and let it ring.',
    fileHint: 'The microphone is blocked on file://. To use the live tuner, run <code>python3 -m http.server 8000</code> in this folder and open <code>http://localhost:8000</code>. Everything else works without it.',
    stringShort: 'String {s}',
    relativeRow: 'String {a}, fret {af} = open string {b}',
    hearPair: 'Hear the pair',
    beginner: 'Beginner',
    advanced: 'Advanced',
    chordNotes: 'Notes',
    chordTrap: 'Easy to get wrong',
    hearArp: 'Arpeggio',
    hearStrum: 'Strum',
    trainerTitle: 'Chord change workout',
    trainerDesc: 'One chord per bar. Start at 60 BPM. Muted notes are fine — stay with the beat.',
    trainerBar: 'Bar {n} · {c} changes',
    trainerStart: 'Start workout',
    trainerStop: 'Stop',
    trainerHint: 'Current chord → next chord',
    metroStart: 'Start',
    metroStop: 'Stop',
    tapTempo: 'Tap tempo',
    timeSig: 'Time signature',
    tempo: 'Tempo',
    metroSub: '{m} / {b} · one click per beat',
    metroSub6: '6 / 8 · counted in six',
    playPattern: 'Play pattern',
    stop: 'Stop',
    demoChord: 'Demo chord: C · downstrokes start on the 6th string',
    countIn: 'Count-in',
    playerIdle: 'Press Play, or click any note in the tab',
    playerDone: 'Done. Play it again, or loop the bar that tripped you up.',
    play: 'Play',
    pause: 'Pause',
    resetTitle: 'Back to start',
    loop: 'Loop',
    clickTrack: 'Click',
    nowNote: 'String {s}, fret {f}',
    quizFind: 'Find a note',
    quizEar: 'Ear training',
    quizChord: 'Chords',
    findPrompt: 'Find <b>{n}</b><em>{s}</em> on the fretboard',
    findHelp: 'Any octave counts · tap a position',
    skip: 'Skip',
    findCorrect: '✓ Yes — string {s}, fret {f} is {n}',
    findWrong: "✗ That's {n}. The right notes are highlighted.",
    earPrompt: 'Which note do you hear?',
    replay: 'Hear it again',
    earHelp: "Use 'Hear it again' to replay",
    earCorrect: '✓ Yes — {n} ({s})',
    earWrong: '✗ Not quite. It was {n} ({s}).',
    chordPrompt: 'Which chord do you hear?',
    chordCorrect: "✓ Yes — it's {c}",
    chordWrong: '✗ Not quite. It was {c}.',
    major: 'major',
    minor: 'minor',
    majorChord: 'major',
    minorChord: 'minor',
    score: 'Round {score} · streak {streak} · best {best}',
    achievement: '{n} songs played end to end',
    achievementOne: '1 song played end to end',
    brand: 'Guitar Studio',
    low: 'Flat',
    high: 'Sharp',
    noNote: '—',
    nowPlaying: 'Now playing',
    openChord: 'Open',
    openChordFull: 'Open strings · no fingers',
    virtualDown: 'Strum ↓',
    virtualUp: 'Strum ↑',
    virtualLoop: 'Play along',
    virtualLoopStop: 'Stop',
    virtualPattern: 'Pattern',
    virtualHint: 'Click a string for a single note · drag to pick across strings · Space strums down · Shift+Space up · 1–6 plucks one string',
    virtualPad: 'Virtual guitar strings',
    fretTarget: 'Target chord',
    fretCheck: 'Check',
    fretListen: 'Hear it',
    fretNext: 'Next',
    fretClear: 'Clear',
    fretStart: 'Tap the cells to build the chord, then press Check.',
    fretCorrect: '✓ Yes — that shape rings',
    fretWrong: '✗ Not yet: {list}',
    fretMismatch: 'String {s}: {v}',
    fretMute: 'muted',
    fretScore: 'Streak {s} · best {b}',
    customTab: 'Custom',
    importEmpty: 'Paste the JSON first.',
    importParse: 'JSON parse error: {msg}',
    importInvalid: 'Validation failed — see the errors below.',
    importPreview: '✓ Valid — preview loaded in the player above (not saved yet)',
    importSaved: '✓ Saved to your tabs',
    importLimit: 'Up to 30 imported tabs; delete a few first.',
    importLoad: 'File loaded — press Validate & preview.',
    importTooLarge: 'File is too large (200 KB limit).',
    importRead: 'Could not read the file.',
    importCopied: 'Prompt copied.',
    importCopyFail: 'Copy failed — select the spec manually.',
    myTabs: 'My tabs',
    noTabs: 'No imported tabs yet.',
    deleteTab: 'Delete',
    rest: 'Rest',
    errObject: 'Imported data must be a single JSON object.',
    errFormat: 'format must be "guitar-tab/v1".',
    errTitle: 'title is required (max 80 characters).',
    errBpm: 'bpm must be between 30 and 240.',
    errMeter: 'beatsPerBar must be an integer from 2 to 8.',
    errTuning: 'Only standard tuning (EADGBE) is supported.',
    errSteps: 'steps must be a non-empty array.',
    errTooMany: 'steps cannot contain more than 2000 items.',
    errStep: 'Step {n} is malformed.',
    errBeats: 'Step {n}: beats must be 0.25–8 and a multiple of 0.25.',
    errNotes: 'Step {n}: notes must be an array.',
    errNotesMax: 'Step {n}: at most six notes.',
    errString: 'Step {n}: string must be 1–6.',
    errFret: 'Step {n}: fret must be an integer 0–15.',
    errDup: 'Step {n}: only one note per string.',
    errTotal: 'Total beats {t} is not a multiple of beatsPerBar ({b}).',
    tablePlay: 'Play',
    fretboardAria: 'Guitar fretboard. Click any fret to hear it.',
    tabAria: 'Tablature',
    anatomyAria: 'Acoustic guitar anatomy',
    handAria: 'Left-hand fretting position',
    pickAria: 'How to hold a pick',
    chordAria: '{name} chord diagram',
    handGood: '1–2 mm to the left of the fret',
    handGoodSub: 'Fingertip arched · close to the fret',
    handBad: 'Pressing on the fret: dead sound',
    handBadSub: "String can't vibrate · no sustain",
    pickWrist: 'Wrist',
    pickSub: 'Thumb + index · 2–3 mm showing'
  };

  const CHORDS = {
    C: {
      full: 'C major', mood: 'Bright and stable — the feeling of home',
      steps: ['Index finger: 2nd string, 1st fret', 'Middle finger: 4th string, 2nd fret', 'Ring finger: 5th string, 3rd fret', 'Mute the 6th string; the other five should ring'],
      tip: 'Keep the ring finger on the 5th string upright so it does not touch the 4th string.',
      trap: 'If the 1st string is dead, your index finger is lying flat on it. Arch the first knuckle.'
    },
    G: {
      full: 'G major', mood: 'Open and bright — a chorus favourite',
      steps: ['Middle finger: 6th string, 3rd fret', 'Index finger: 5th string, 2nd fret', 'Ring finger: 1st string, 3rd fret', 'All six strings can ring'],
      tip: 'The root is on the 6th string. Start your strum there for a fuller sound.',
      trap: 'Get the 1st string at the 3rd fret close to the fret wire, or it will thud.'
    },
    D: {
      full: 'D major', mood: 'Clean, with a little sweetness',
      steps: ['Index: 3rd string, 2nd fret', 'Ring: 2nd string, 3rd fret', 'Middle: 1st string, 2nd fret', 'Strum only the top four strings'],
      tip: 'Only four strings — keep the right hand away from the 5th and 6th.',
      trap: 'Three fingers in a tight space. Keep them upright so they do not mute each other.'
    },
    A: {
      full: 'A major', mood: 'Bright and direct',
      steps: ['Index: 4th string, 2nd fret', 'Middle: 3rd string, 2nd fret', 'Ring: 2nd string, 2nd fret', 'Open 5th string; mute the 6th'],
      tip: 'Three fingers in a row on the same fret. Angle them slightly toward the headstock to fit.',
      trap: 'The 1st string often dies because the ring finger touches it. Check that it still rings.'
    },
    E: {
      full: 'E major', mood: 'Thick and powerful — the rock foundation',
      steps: ['Index: 3rd string, 1st fret', 'Middle: 5th string, 2nd fret', 'Ring: 4th string, 2nd fret', 'All six strings ring'],
      tip: 'All six strings ring — the easiest chord for checking your hand shape.',
      trap: 'Use your fingertip on the 3rd string; do not let the pad mute the 2nd.'
    },
    Am: {
      full: 'A minor', mood: 'Soft and melancholy',
      steps: ['Index: 2nd string, 1st fret', 'Middle: 4th string, 2nd fret', 'Ring: 3rd string, 2nd fret', 'Open 5th; mute the 6th'],
      tip: 'Only one finger away from C. C ↔ Am is the easiest change to practise.',
      trap: 'Middle and ring fingers tend to touch the 1st string. Listen for it after each strum.'
    },
    Em: {
      full: 'E minor', mood: 'Open and dark — everywhere in folk music',
      steps: ['Middle: 5th string, 2nd fret', 'Ring: 4th string, 2nd fret', 'The other four strings are open'],
      tip: 'Two fingers only. The easiest chord to make ring — start here for confidence.',
      trap: 'If middle and ring lie flat, they mute the open 3rd string.'
    },
    Dm: {
      full: 'D minor', mood: 'Gentle, a little sad',
      steps: ['Index: 1st string, 1st fret', 'Middle: 3rd string, 2nd fret', 'Ring: 2nd string, 3rd fret', 'Strum only the top four strings'],
      tip: 'D and Dm differ by one note: move the 1st string from fret 2 to fret 1.',
      trap: 'The 1st fret is close to the nut. Too far right and it mutes.'
    },
    Fmaj7: {
      full: 'F major 7 (easy F)', mood: 'Soft and floating — far easier than F',
      steps: ['Index: 2nd string, 1st fret', 'Middle: 3rd string, 2nd fret', 'Ring: 4th string, 3rd fret', 'Open 1st string; mute the 5th and 6th'],
      tip: 'When the full F barre will not ring, use this instead — songs still work.',
      trap: 'The 4th string 3rd fret and 3rd string 2nd fret are close. Keep fingers upright.'
    },
    G7: {
      full: 'G dominant 7', mood: 'Pulls forward, wants to resolve to C',
      steps: ['Ring: 6th string, 3rd fret', 'Middle: 5th string, 2nd fret', 'Index: 1st string, 1st fret', 'All six strings ring'],
      tip: 'In C major, G7 → C is the most natural way to come home.',
      trap: 'The index on the 1st string can easily mute the 2nd. Check both.'
    },
    Cmaj7: {
      full: 'C major 7', mood: 'Open and relaxed — lovely for arpeggios',
      steps: ['Middle: 4th string, 2nd fret', 'Ring: 5th string, 3rd fret', 'Open 2nd and 1st; mute the 6th'],
      tip: 'One finger fewer than C, but it sounds more sophisticated.',
      trap: 'Leave the 1st string open; do not let the ring finger touch it.'
    },
    F: {
      full: 'F major (barre)', mood: 'Bright and hard — the first real hurdle',
      steps: ['Barre all six strings at fret 1 with the side of your index', 'Middle: 3rd string, 2nd fret', 'Ring: 5th string, 3rd fret', 'Pinky: 4th string, 3rd fret'],
      tip: 'Use the side of the index, close to the fret, and put your thumb behind the neck opposite it.',
      trap: 'Do not worry about all six at first. Make strings 1 and 2 ring, then add the rest.'
    },
    Bm: {
      full: 'B minor (barre)', mood: 'Dark and tight — a common rite of passage',
      steps: ['Barre five strings at fret 2 with your index', 'Middle: 2nd string, 3rd fret', 'Ring: 4th string, 4th fret', 'Pinky: 3rd string, 4th fret'],
      tip: 'Same shape as the F barre, just moved up one fret.',
      trap: 'The 5th string must ring — it is the root of Bm.'
    }
  };

  const SONGS = {
    twinkle: {
      title: 'Twinkle, Twinkle, Little Star', subtitle: 'Traditional',
      level: 'Beginner', key: 'C major',
      desc: 'Only the top two strings — your first tune for picking and counting.',
      tips: ['Start without the left hand; count the rhythm on open strings.', 'Each note must ring clearly before you move on. Do not rush.', 'On the second pass, try not to look at your right hand.']
    },
    ode: {
      title: 'Ode to Joy', subtitle: 'Beethoven',
      level: 'Beginner', key: 'C major',
      desc: 'The melody moves between the top two strings — practise crossing strings without hitting neighbours.',
      tips: ['From bar 3 the melody drops; find the 2nd string early.', 'Let the long notes at the end of each phrase ring out.']
    },
    birthday: {
      title: 'Happy Birthday', subtitle: 'Traditional',
      level: 'Beginner', key: 'C major',
      desc: '3/4 time — three beats per bar. Count “1 2 3” before you play.',
      tips: ['Count 1 2 3 | 1 2 3, with the accent on beat one.', 'Bar 5 jumps to the 1st string, 3rd fret. Prepare the left hand early.', 'If you can sing it, you can play it — follow your voice.']
    },
    farewell: {
      title: 'Farewell', subtitle: 'Chang Ting Wai · Chinese classic',
      level: 'Intermediate', key: 'C major',
      desc: 'Long phrases and long notes — work on right-hand steadiness and left-hand reach.',
      tips: ['The last note of bar 1 is the 1st string, 8th fret. Move early.', 'Play slowly and hold every long note for its full count.', 'Loop the first four bars ten times before moving on.']
    }
  };

  const EXERCISES = {
    spider: {
      title: 'Spider Walk · 1-2-3-4',
      desc: 'On each string, use fingers 1, 2, 3, 4 on frets 1–4. Builds left-hand independence and accuracy.',
      tip: 'Keep your fingers close to the strings and press near the fret wire. Slow enough that every note is clean.'
    },
    cscale: {
      title: 'C Major Scale · Up and Down',
      desc: 'Start on C at the 2nd string, 1st fret; go up to C at the 1st string, 8th fret, then back down.',
      tip: 'Downstrokes going up, upstrokes coming down — or alternate index and middle fingers.'
    },
    open: {
      title: 'Open Strings · Right-Hand Steady',
      desc: 'From the 6th string to the 1st and back, open strings only. Listen for even volume.',
      tip: 'Relax the wrist and do not grip the pick. Goal: twelve notes that sound like one straight line.'
    }
  };

  const PATTERNS = {
    basic: { name: 'Four downstrokes · quarter notes', desc: 'One downstroke on every beat. Make it steady as a heartbeat before adding anything.' },
    folk: { name: 'Folk all-rounder', desc: 'Down, down-up, up-down-up. Keep the hand moving even when you miss the strings.' },
    drive: { name: 'Eighth notes · alternate picking', desc: 'Swing the wrist like a metronome. Keep the tempo at 60 first.' },
    waltz: { name: '3/4 · waltz feel', desc: 'Three beats per bar, accent the first. Works for “Happy Birthday”.' }
  };

  const PROGRESSIONS = {
    p1645: { name: '1645 · the all-purpose' },
    pcanon: { name: 'Canon progression' },
    p50s: { name: '50s progression' },
    pfolk: { name: 'Folk progression' }
  };

  const PARTS = {
    head: { name: 'Headstock', desc: 'All six tuning pegs live here. The small knobs on either side are what you turn to tune.' },
    peg: { name: 'Tuning pegs', desc: 'Turning a peg changes string tension. Loosen to lower, tighten to raise — a little at a time.' },
    nut: { name: 'Nut', desc: 'The strings leave their slots here. It sets the string spacing and the starting point of pitch.' },
    fret: { name: 'Frets', desc: 'Metal bars. Press 1–2 mm to the left (headstock side) of the wire, never on it.' },
    inlay: { name: 'Inlays', desc: 'Dots at frets 3, 5, 7, 9 and 12. The 12th fret has two — use it as your landmark.' },
    neck: { name: 'Neck', desc: 'Where the left hand sits. Thumb on the centre of the back — do not wrap the whole hand around.' },
    body: { name: 'Body', desc: 'The soundbox. String vibration is amplified here, so do not press the soundboard flat.' },
    hole: { name: 'Sound hole', desc: 'The sound exit, and a reference for the right hand. Strum near it.' },
    bridge: { name: 'Bridge', desc: 'Anchors the other end of the strings. Strings thread through the bridge pins.' },
    string: { name: 'Six strings', desc: 'Thick to thin: E A D G B E. The thickest is the 6th, the thinnest the 1st.' },
    guard: { name: 'Pickguard', desc: 'Protects the top from your pick. It is fine if the pick brushes it.' }
  };

  const CHECKS = [
    'Guitar waist on the right thigh, soundboard angled slightly up',
    'Headstock around shoulder height — do not stare down at the neck',
    'Left thumb on the centre of the back of the neck',
    'Fingertips, fingers arched',
    '1–2 mm to the left of the fret wire',
    'Right wrist relaxed, 2–3 mm of pick showing'
  ];

  const PLAN = [
    { id: 'warm', text: '2 min warm-up · spider walk 1-2-3-4' },
    { id: 'tune', text: '1 min tuning · all six strings' },
    { id: 'chord', text: '5 min chords · C ↔ Am ↔ F ↔ G' },
    { id: 'rhythm', text: '5 min rhythm · eighth-note strumming at 60 BPM' },
    { id: 'song', text: '5 min song · Twinkle / Happy Birthday' },
    { id: 'record', text: '2 min finish · record yourself once' }
  ];

  const DAYS = [
    ['Day 1', 'Meet the guitar + tune + open strings, 20 plucks each'],
    ['Day 2', 'Spider walk + C and G'],
    ['Day 3', 'Am, Em + C→Am→Em changes'],
    ['Day 4', 'Four-downstroke pattern + Twinkle'],
    ['Day 5', 'D, Dm + Happy Birthday'],
    ['Day 6', 'Fmaj7 + first four bars of Farewell'],
    ['Day 7', 'Review + record one full song']
  ];

  function fill(str, vars) {
    if (!vars) return str;
    return Object.keys(vars).reduce(function (s, k) {
      return s.split('{' + k + '}').join(String(vars[k]));
    }, str);
  }

  function t(key, zh, vars) {
    if (!isEN) return fill(zh, vars);
    return fill(UI[key] != null ? UI[key] : zh, vars);
  }

  function merge(base, extra) {
    if (!isEN || !extra) return base;
    return Object.assign({}, base, extra);
  }

  return {
    isEN: isEN,
    t: t,
    chord: function (c) { return merge(c, CHORDS[c.id]); },
    song: function (s) { return merge(s, SONGS[s.id]); },
    ex: function (e) { return merge(e, EXERCISES[e.id]); },
    pattern: function (p) { return merge(p, PATTERNS[p.id]); },
    progression: function (p) { return merge(p, PROGRESSIONS[p.id]); },
    part: function (p) { return merge(p, PARTS[p.id]); },
    checks: function () { return isEN ? CHECKS.slice() : null; },
    plan: function () { return isEN ? PLAN.slice() : null; },
    days: function () { return isEN ? DAYS.slice() : null; }
  };
})();
