import {
  isChordToken,
  stripOctaveMark,
  chordSymbolForParse,
  CHORD_CANDIDATE_REGEX,
  chordFromMatch,
} from './chordSymbol';

export { isChordToken, stripOctaveMark, chordSymbolForParse, CHORD_CANDIDATE_REGEX };

/** @deprecated השתמש ב-CHORD_CANDIDATE_REGEX */
export const STANDALONE_CHORD_REGEX = CHORD_CANDIDATE_REGEX;

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_MAP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
const SHARP_MAP = { 'C#': 'C#', 'D#': 'D#', 'F#': 'F#', 'G#': 'G#', 'A#': 'A#' };

export function normalizeRoot(root) {
  if (!root) return root;
  const letter = root.charAt(0).toUpperCase();
  const accidental = root.length > 1 ? root.slice(1).toLowerCase() : '';
  const combined = letter + accidental;
  return FLAT_MAP[combined] || SHARP_MAP[combined] || combined;
}

export function transposeChord(chord, semitones) {
  const trimmed = chord.trim();

  const slashIdx = trimmed.indexOf('/');
  if (slashIdx > 0) {
    const main = transposeChord(trimmed.slice(0, slashIdx), semitones);
    const bass = transposeChord(trimmed.slice(slashIdx + 1), semitones);
    return `${main}/${bass}`;
  }

  const octaveMatch = trimmed.match(/^(.+?)([#b][0-46-8])$/i);
  if (octaveMatch) {
    const transposed = transposeChord(octaveMatch[1], semitones);
    return transposed + octaveMatch[2].slice(-2);
  }

  const match = trimmed.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!match) return chord;

  const root = normalizeRoot(match[1] + (match[2] || ''));
  const suffix = match[3] || '';
  const idx = NOTES.indexOf(root);
  if (idx === -1) return chord;

  const newIdx = (idx + semitones + 12) % 12;
  return NOTES[newIdx] + suffix;
}

export function simplifyChord(chord) {
  let s = chord.trim();

  let bass = '';
  const slashIdx = s.indexOf('/');
  if (slashIdx > 0) {
    bass = s.slice(slashIdx);
    s = s.slice(0, slashIdx);
  }

  const octaveSuffix = s.match(/([#b][0-46-8])$/i);
  const octave = octaveSuffix ? octaveSuffix[0] : '';
  if (octave) s = s.slice(0, -octave.length);

  const hadDim = /dim/i.test(s);

  s = s.replace(/maj7/gi, '');
  s = s.replace(/min7|m7/gi, 'm');
  s = s.replace(/maj/gi, '');
  s = s.replace(/min/gi, 'm');
  s = s.replace(/dim7?|aug|sus4|sus2|add9?|[#b]?11|[#b]?13|[#b]?6|[#b]?5/gi, '');
  s = s.replace(/[#b]?9/g, '');
  s = s.replace(/7/g, '');

  let result = (s || chord) + octave;
  if (hadDim && /^[A-G][#b]?$/i.test(result)) {
    result += 'm';
  }
  return result + bass;
}

/** מעבד אקורדים בסוגריים [Am] ובמילים עצמאיות (שורת אקורדים מעל מילים) */
export function transformAllChords(content, transformFn) {
  if (!content) return content;

  let result = content.replace(/\[([^\]]+)\]/g, (match, chord) => {
    const trimmed = chord.trim();
    if (!isChordToken(trimmed)) return match;
    return `[${transformFn(trimmed)}]`;
  });

  const re = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
  result = result.replace(re, (match, chord) => {
    if (!isChordToken(chord)) return match;
    return transformFn(chord);
  });

  return result;
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
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let html = escaped.replace(/\[([^\]]+)\]/g, (match, chord) => {
    const trimmed = chord.trim();
    if (!isChordToken(trimmed)) return match;
    const color = getChordColor(trimmed, theme);
    return `<span dir="ltr" class="chord" style="unicode-bidi:isolate;color:${color};font-weight:700">${trimmed}</span>`;
  });

  const re = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
  html = html.replace(re, (match, chord) => {
    if (!isChordToken(chord)) return match;
    const color = getChordColor(chord, theme);
    return `<span dir="ltr" class="chord" style="unicode-bidi:isolate;color:${color};font-weight:700">${chord}</span>`;
  });

  return html;
}

export function extractUniqueChords(content) {
  const chords = new Set();
  const bracketRegex = /\[([^\]]+)\]/g;
  let m;
  while ((m = bracketRegex.exec(content)) !== null) {
    if (isChordToken(m[1])) chords.add(m[1].trim());
  }
  const standaloneRegex = new RegExp(CHORD_CANDIDATE_REGEX.source, 'gi');
  while ((m = standaloneRegex.exec(content)) !== null) {
    const chord = chordFromMatch(m);
    if (isChordToken(chord)) chords.add(chord.trim());
  }
  return [...chords];
}

export function detectSections(content) {
  const sections = [];
  const regex =
    /\[(Intro|Verse|Chorus|Bridge|Outro|Pre-Chorus|סולו|פזמון|בית|גשר|מעבר|פתיחה)[^\]]*\]/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    sections.push(m[1]);
  }
  return sections;
}
