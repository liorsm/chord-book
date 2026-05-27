import { get } from '@tonaljs/chord';
import { get as getNote } from '@tonaljs/note';

const EXTENSIONS =
  'maj7|maj|m7|min7|min|dim7|dim|aug|sus4|sus2|add9|add|m|7|9|11|13|6|5|2|b5|#5|b9|#9|#11|b13';

/**
 * מועמדים לסמל אקורד בטקסט.
 * לא משתמשים ב-\\b כי # אינו תו-מילה ב-JS ולכן A#, F# לא נתפסים עם \\b.
 */
export const CHORD_CANDIDATE_REGEX = new RegExp(
  `(?<![A-Za-z0-9])([A-G](?:[#b]?(?:(?:${EXTENSIONS})*|\\d{1,2})?)(?:\\/[A-G][#b]?\\d{0,2})?)(?=[\\s\\])}<.,;:!?|]|$)`,
  'gi'
);

/** מחזיר את שם האקורד מהתאמת regex (קבוצה 1) */
export function chordFromMatch(m) {
  return m[1] ?? m[0];
}

const HEBREW_RE = /[\u0590-\u05FF]/;

/** מסיר ספרת אוקטבה/מיקום (A#4 → A#, Bb3 → Bb) */
export function stripOctaveMark(symbol) {
  const trimmed = String(symbol).trim();
  const slashIdx = trimmed.indexOf('/');
  const main = slashIdx > 0 ? trimmed.slice(0, slashIdx) : trimmed;
  const bass = slashIdx > 0 ? trimmed.slice(slashIdx + 1) : null;

  const stripDigit = (part) => part.replace(/([#b])([0-46-8])$/i, '$1');

  const mainClean = stripDigit(main);
  if (!bass) return mainClean;
  return `${mainClean}/${stripDigit(bass)}`;
}

export function chordSymbolForParse(symbol) {
  return stripOctaveMark(String(symbol).trim());
}

function isValidTonalChord(symbol) {
  const info = get(symbol);
  return !info.empty && Boolean(info.tonic);
}

function isNoteWithOctave(s) {
  const note = getNote(s);
  return !note.empty && /^[A-G][#b]\d$/i.test(s);
}

/**
 * האם המחרוזת היא סמל אקורד תקף (מבוסס @tonaljs/chord).
 * תומך גם בסימון ישראלי נפוץ: A#4, Bb3 (= אקורד + ספרה, לא תו בודד).
 */
export function isChordToken(str) {
  const s = String(str).trim();
  if (!s || s.length > 32 || HEBREW_RE.test(s)) return false;

  if (isNoteWithOctave(s)) {
    return isValidTonalChord(s.replace(/\d+$/, ''));
  }

  const parsed = chordSymbolForParse(s);
  if (isValidTonalChord(parsed)) return true;

  if (s.includes('/')) {
    const slash = s.indexOf('/');
    const main = chordSymbolForParse(s.slice(0, slash));
    const bassPart = s.slice(slash + 1).trim();
    if (!isValidTonalChord(main)) return false;
    const bassParsed = chordSymbolForParse(bassPart);
    if (/^[A-G][#b]?$/i.test(bassParsed)) return true;
    return isValidTonalChord(bassParsed);
  }

  return false;
}

/** מוצא את כל האקורדים המאומתים בטקסט */
export function findChordsInText(text) {
  const found = [];
  const re = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
  let m;
  while ((m = re.exec(text)) !== null) {
    const chord = chordFromMatch(m);
    if (isChordToken(chord)) {
      found.push({ chord, index: m.index, length: chord.length });
    }
  }
  return found;
}
