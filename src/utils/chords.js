import {
  isChordToken,
  stripOctaveMark,
  splitOctaveMark,
  reattachOctaveDigit,
  isBareMajorRoot,
  chordSymbolForParse,
  CHORD_CANDIDATE_REGEX,
  chordFromMatch,
} from './chordSymbol.js';

export {
  isChordToken,
  stripOctaveMark,
  chordSymbolForParse,
  CHORD_CANDIDATE_REGEX,
  isBareMajorRoot,
};

/** @deprecated השתמש ב-CHORD_CANDIDATE_REGEX */
export const STANDALONE_CHORD_REGEX = CHORD_CANDIDATE_REGEX;

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_MAP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
const SHARP_MAP = { 'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#' };

const HEBREW_RE = /[\u0590-\u05FF]/;

export function normalizeRoot(root) {
  if (!root) return root;
  const letter = root.charAt(0).toUpperCase();
  const accidental = root.length > 1 ? root.slice(1).toLowerCase() : '';
  const combined = letter + accidental;
  return FLAT_MAP[combined] || SHARP_MAP[combined] || combined;
}

/**
 * שורת אקורדים בלבד (בלי מילים) — מאפשרת טרנספוז של שורשים בודדים כמו A / E.
 */
function isChordOnlyLine(line) {
  const trimmed = line.trim();
  if (!trimmed || HEBREW_RE.test(trimmed)) return false;

  let leftover = trimmed.replace(/\[([^\]]+)\]/g, (match, chord) =>
    isChordToken(chord.trim(), { allowLowercase: true }) ? ' ' : match
  );

  const re = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
  leftover = leftover.replace(re, (match, chord) =>
    isChordToken(chord) ? ' ' : match
  );

  leftover = leftover.replace(/[|/\-–—:\s()[\]{}]/g, '');
  return leftover.length === 0 && /[A-Ga-g]/.test(trimmed);
}

export function transposeChord(chord, semitones) {
  const trimmed = chord.trim();

  const slashIdx = trimmed.indexOf('/');
  if (slashIdx > 0) {
    const mainPart = trimmed.slice(0, slashIdx);
    const bassPart = trimmed.slice(slashIdx + 1);
    const mainSplit = splitOctaveMark(mainPart);
    const bassSplit = splitOctaveMark(bassPart);
    const main = reattachOctaveDigit(
      transposeChord(mainSplit.base, semitones),
      mainSplit.digit
    );
    const bass = reattachOctaveDigit(
      transposeChord(bassSplit.base, semitones),
      bassSplit.digit
    );
    return `${main}/${bass}`;
  }

  const { base, digit } = splitOctaveMark(trimmed);
  const match = base.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!match) return chord;

  const root = normalizeRoot(match[1] + (match[2] || ''));
  const suffix = match[3] || '';
  const idx = NOTES.indexOf(root);
  if (idx === -1) return chord;

  const newIdx = (idx + semitones + 12) % 12;
  return reattachOctaveDigit(NOTES[newIdx] + suffix, digit);
}

export function simplifyChord(chord) {
  let s = chord.trim();

  let bass = '';
  const slashIdx = s.indexOf('/');
  if (slashIdx > 0) {
    bass = s.slice(slashIdx);
    s = s.slice(0, slashIdx);
  }

  const { base, digit } = splitOctaveMark(s);
  s = base;

  s = s.replace(/maj7/gi, '');
  s = s.replace(/min7|m7/gi, 'm');
  s = s.replace(/maj/gi, '');
  s = s.replace(/min/gi, 'm');
  s = s.replace(/dim7?|aug|sus4|sus2|add9?|[#b]?11|[#b]?13|[#b]?6|[#b]?5/gi, '');
  s = s.replace(/[#b]?9/g, '');
  s = s.replace(/7/g, '');

  const rootMatch = s.match(/^([A-Ga-g][#b]?)/i);
  const root = rootMatch ? rootMatch[1] : s;
  const quality = s.slice(root.length);
  // נשאר רק m (או ריק) אחרי פישוט — לא להוסיף m ל-dim
  const simplified = root + (/^m$/i.test(quality) ? 'm' : '');

  return reattachOctaveDigit(simplified || chord, digit) + bass;
}

/**
 * טרנספוז/פישוט בשורה.
 * אקורדים חופשיים רק בשורת אקורדים בלבד; במילים — רק [סוגריים].
 * מונע שינוי של "I Am", "A whole new world" וכו'.
 */
function transformChordsInLine(line, transformFn) {
  const chordOnly = isChordOnlyLine(line);

  let result = line.replace(/\[([^\]]+)\]/g, (match, chord) => {
    const trimmed = chord.trim();
    if (!isChordToken(trimmed, { allowLowercase: true })) return match;
    return `[${transformFn(trimmed)}]`;
  });

  if (!chordOnly) return result;

  const re = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
  result = result.replace(re, (match, chord) => {
    if (!isChordToken(chord)) return match;
    return transformFn(chord);
  });

  return result;
}

/** מעבד אקורדים בסוגריים [Am] ובמילים עצמאיות (שורת אקורדים מעל מילים) */
export function transformAllChords(content, transformFn) {
  if (!content) return content;
  return content
    .split('\n')
    .map((line) => transformChordsInLine(line, transformFn))
    .join('\n');
}

export function transposeContent(content, semitones) {
  if (!semitones) return content;
  return transformAllChords(content, (chord) => transposeChord(chord, semitones));
}

export function simplifyChords(content) {
  return transformAllChords(content, simplifyChord);
}

export function getChordType(chord) {
  const base = stripOctaveMark(chord).replace(/[^a-zA-Z#0-9/]/g, '');
  if (/dim|aug|°|\+/.test(base)) return 'other';
  if (/7|maj7|m7|9|11|13/.test(base)) return 'seventh';
  if (/m(?!aj)|min/i.test(base)) return 'minor';
  return 'major';
}

export function getChordColor(chord, theme) {
  const colors = theme?.chordColors || {
    major: '#60a5fa',
    minor: '#f87171',
    seventh: '#fbbf24',
    other: '#a78bfa',
  };
  return colors[getChordType(chord)] || colors.major;
}

export function formatChordsToHtml(content, theme) {
  if (!content) return '';

  return content
    .split('\n')
    .map((line) => {
      const chordOnly = isChordOnlyLine(line);
      let escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      escaped = escaped.replace(/\[([^\]]+)\]/g, (match, chord) => {
        const trimmed = chord.trim();
        if (!isChordToken(trimmed, { allowLowercase: true })) return match;
        const color = getChordColor(trimmed, theme);
        return `<span dir="ltr" class="chord" style="unicode-bidi:isolate;color:${color};font-weight:700">${trimmed}</span>`;
      });

      if (!chordOnly) return escaped;

      const re = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
      return escaped.replace(re, (match, chord) => {
        if (!isChordToken(chord)) return match;
        const color = getChordColor(chord, theme);
        return `<span dir="ltr" class="chord" style="unicode-bidi:isolate;color:${color};font-weight:700">${chord}</span>`;
      });
    })
    .join('\n');
}

export function extractUniqueChords(content) {
  const chords = new Set();
  if (!content) return [];

  for (const line of content.split('\n')) {
    const chordOnly = isChordOnlyLine(line);

    const bracketRegex = /\[([^\]]+)\]/g;
    let m;
    while ((m = bracketRegex.exec(line)) !== null) {
      if (isChordToken(m[1], { allowLowercase: true })) chords.add(m[1].trim());
    }

    if (!chordOnly) continue;

    const standaloneRegex = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
    while ((m = standaloneRegex.exec(line)) !== null) {
      const chord = chordFromMatch(m);
      if (isChordToken(chord)) chords.add(chord.trim());
    }
  }

  return [...chords];
}
