import { get as getChord } from '@tonaljs/chord';
import { chroma } from '@tonaljs/note';
import { chordSymbolForParse } from './chordSymbol';
import { normalizeRoot } from './chords';

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
  else if (/maj7|ma7/.test(suffix)) intervals = [0, 4, 7, 11];
  else if (/m7|min7/.test(suffix)) intervals = [0, 3, 7, 10];
  else if (/7/.test(suffix)) intervals = [0, 4, 7, 10];
  else if (/m(?!aj)|min/.test(suffix)) intervals = [0, 3, 7];
  else if (/sus4/.test(suffix)) intervals = [0, 5, 7];
  else if (/sus2/.test(suffix)) intervals = [0, 2, 7];
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

/** טווח מקלדת (סמיטונים מוחלטים) שמכיל את כל תווי האקורד */
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
