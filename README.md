# Guitar Studio · 吉他自习室

An interactive, visual guitar course — in Chinese and English. No build step, no
dependencies, no audio files: every note is synthesised in the browser.

- 中文: https://zehank.github.io/guitar-school/
- English: https://zehank.github.io/guitar-school/en/

## What's inside

- Nine lessons: anatomy, posture, tuning, notes & scales, chords, rhythm, songs, virtual guitar, practice
- Clickable fretboard that plays every note
- A virtual guitar for when you don't have an instrument: chord chips, a strum pad, keyboard controls and a play-along loop
- A first-guitar buying guide (budget, size, action, what to try)
- Live microphone tuner + reference tones + tuning by ear
- 13 chord shapes with fingerings, tips and common mistakes
- 4 play-along songs with per-note highlighting on the tab and fretboard
- 3 exercises, 4 strumming patterns, metronome and chord-change workout
- Note-finding, ear-training and chord quizzes
- Progress saved locally in the browser

## Run locally

The site is fully static. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

The microphone tuner needs `localhost` (or HTTPS): browsers block microphone
access on `file://`. Everything else works from a plain file.

## Structure

```
index.html          Chinese entry
en/index.html       English entry
assets/style.css    All styles
assets/data.js      Strings, chords, songs, exercises, patterns
assets/i18n.js      English UI strings and translated lesson data
assets/audio.js     Karplus–Strong plucked-string synthesis
assets/visuals.js   Fretboard, chord diagrams, tab, guitar anatomy
assets/app.js       Lessons, players, tuner, metronome, quizzes
```

## Adding a language

Static page copy lives in `index.html` / `en/index.html`. Data-driven copy
(chords, songs, exercises, patterns, anatomy, practice plan) lives in
`assets/i18n.js`; add another locale there and in the language switch link.
