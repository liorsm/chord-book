import { get as getChord } from '@tonaljs/chord';
import { chroma } from '@tonaljs/note';
import { chordSymbolForParse } from './chordSymbol.js';
import { normalizeRoot } from './chords.js';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function rootToSemitone(root) {
  const n = normalizeRoot(root);
  return NOTES.indexOf(n);
}

function parseMainChordFallback(main) {
  const match = main.trim().match(/^([A-G])([#b]?)(.*)$/i);
  if (!match) return null;

  const root = normalizeRoot(match[1] + (match[2] || ''));
  const rootSemi = rootToSemitone(root);
  if (rootSemi === -1) return null;

  const suffix = (match[3] || '').toLowerCase();
  let intervals;

  if (/dim7/.test(suffix)) intervals = [0, 3, 6, 9];
  else if (/dim/.test(suffix)) intervals = [0, 3, 6];
  else if (/aug/.test(suffix)) intervals = [0, 4, 8];
  else if (/m\(maj7\)|mmaj7|minmaj7/.test(suffix))
    intervals = [0, 3, 7, 11];
  else if (/maj7|ma7/.test(suffix)) intervals = [0, 4, 7, 11];
  else if (/m7|min7/.test(suffix)) intervals = [0, 3, 7, 10];
  else if (/m6|min6/.test(suffix)) intervals = [0, 3, 7, 9];
  else if (/add9/.test(suffix)) intervals = [0, 4, 7, 2];
  else if (/sus4/.test(suffix)) intervals = [0, 5, 7];
  else if (/sus2/.test(suffix)) intervals = [0, 2, 7];
  else if (/7/.test(suffix)) intervals = [0, 4, 7, 10];
  else if (/6/.test(suffix)) intervals = [0, 4, 7, 9];
  else if (/m(?!aj)|min/.test(suffix)) intervals = [0, 3, 7];
  else intervals = [0, 4, 7];

  const semitones = intervals.map((i) => (rootSemi + i) % 12);
  return [...new Set(semitones)];
}

function noteToChroma(note) {
  const c = chroma(note);
  return c === undefined ? undefined : c;
}

/** מחזיר סמיטונים (0–11) של תווי האקורד */
export function getChordSemitones(chord) {
  if (!chord?.trim()) return [];

  const symbol = chordSymbolForParse(chord.trim());
  const slashIdx = symbol.indexOf('/');
  const main = slashIdx > 0 ? symbol.slice(0, slashIdx) : symbol;
  const bass = slashIdx > 0 ? symbol.slice(slashIdx + 1) : null;

  const info = getChord(main);
  let semitones = [];

  if (!info.empty && info.notes?.length) {
    semitones = info.notes
      .map((n) => noteToChroma(n))
      .filter((s) => s !== undefined);
  } else {
    semitones = parseMainChordFallback(main) || [];
  }

  if (bass) {
    const bassChroma = noteToChroma(bass);
    if (bassChroma !== undefined && !semitones.includes(bassChroma)) {
      semitones.unshift(bassChroma);
    }
  }

  return [...new Set(semitones)];
}

/**
 * Voicing סגור במצב יסודי: שורש למטה, שאר התווים מעליו בתוך אוקטבה.
 */
export function getChordVoicing(pitchClasses, baseOctave = 4) {
  if (!pitchClasses?.length) return [];

  const rootPc = pitchClasses[0] % 12;
  const base = baseOctave * 12 + rootPc;
  const rest = pitchClasses
    .slice(1)
    .map((pc) => {
      let n = baseOctave * 12 + (pc % 12);
      if (n <= base) n += 12;
      return n;
    })
    .sort((a, b) => a - b);

  return [base, ...rest];
}

/**
 * תמיד 15 קלידים לבנים: Do → Do → Do (שתי אוקטבות).
 * ה-voicing נשאר במצב יסודי בתוך הטווח.
 */
export function getKeyboardRangeForVoicing(voicing, baseOctave = 4) {
  const octaveSpan = 25; // C .. C .. C  → 15 white keys
  let start = baseOctave * 12;

  if (voicing?.length) {
    const max = Math.max(...voicing);
    // אם האקורד בולט מעל הטווח — הזז אוקטבה למעלה
    while (max >= start + octaveSpan) start += 12;
    // אם האקורד מתחת לטווח — הזז אוקטבה למטה
    const min = Math.min(...voicing);
    while (min < start) start -= 12;
  }

  return { start, end: start + octaveSpan };
}

/** @deprecated העדף getKeyboardRangeForVoicing + getChordVoicing */
export function getKeyboardRange(semitones) {
  if (!semitones.length) {
    return { start: 48, end: 72 };
  }

  const absolute = semitones.map((s) => s + 48);
  const min = Math.min(...absolute);
  const max = Math.max(...absolute);
  let start = Math.floor(min / 12) * 12;
  let end = start + 24;
  if (max >= end) end = start + 36;
  return { start, end };
}

const WHITE_PITCHES = [0, 2, 4, 5, 7, 9, 11];

export function buildKeyboardKeys(start, end) {
  const keys = [];
  for (let semi = start; semi < end; semi += 1) {
    const pitch = semi % 12;
    const isBlack = !WHITE_PITCHES.includes(pitch);
    keys.push({ semi, pitch, isBlack, octave: Math.floor(semi / 12) });
  }
  return keys;
}

export function getWhiteKeyIndex(semi, start) {
  let index = 0;
  for (let s = start; s < semi; s += 1) {
    if (![1, 3, 6, 8, 10].includes(s % 12)) index += 1;
  }
  return index;
}

export function countWhiteKeys(start, end) {
  let count = 0;
  for (let s = start; s < end; s += 1) {
    if (![1, 3, 6, 8, 10].includes(s % 12)) count += 1;
  }
  return count;
}
