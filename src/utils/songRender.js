import {
  isChordToken,
  CHORD_CANDIDATE_REGEX,
  chordFromMatch,
} from "./chordSymbol";
import { stripChordsFromText } from "./direction";

const HEBREW_RE = /[\u0590-\u05FF]/;
const SECTION_LABEL_RE =
  /^(פתיחה|בית|פזמון|גשר|מעבר|סולו|Intro|Verse|Chorus|Bridge|Outro|Pre-Chorus)$/i;

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatBoldMarkdown(text) {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function chordSpan(chord) {
  const safe = escapeHtml(chord);
  const attr = chord
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  return `<span class="chord" data-chord="${attr}" role="button" tabindex="0">${safe}</span>`;
}

function wrapChordHtml(chordHtml, inlineLtr) {
  return inlineLtr
    ? `<span dir="ltr" style="unicode-bidi:isolate">${chordHtml}</span>`
    : chordHtml;
}

function formatStandaloneChords(text, inlineLtr) {
  let out = "";
  let last = 0;
  const re = new RegExp(CHORD_CANDIDATE_REGEX.source, "gi");
  let m;
  while ((m = re.exec(text)) !== null) {
    out += escapeHtml(text.slice(last, m.index));
    const candidate = chordFromMatch(m);
    if (isChordToken(candidate)) {
      out += wrapChordHtml(chordSpan(candidate), inlineLtr);
    } else {
      out += escapeHtml(candidate);
    }
    last = m.index + m[0].length;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

/** מדגיש אקורדים בשורה; תגיות [פתיחה] וכו' לא נחשבות אקורד */
export function formatLineWithChords(line, theme, { inlineLtr = false } = {}) {
  const parts = line.split(/(\[[^\]]+\])/g);
  return parts
    .map((part) => {
      const bracket = part.match(/^\[([^\]]+)\]$/);
      if (bracket) {
        const trimmed = bracket[1].trim();
        if (isChordToken(trimmed)) {
          return wrapChordHtml(chordSpan(trimmed), inlineLtr);
        }
        return escapeHtml(part);
      }
      return formatStandaloneChords(part, inlineLtr);
    })
    .join("");
}

function isChordLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (HEBREW_RE.test(trimmed)) return false;

  const withoutPipes = trimmed.replace(/[|\-–—]/g, " ");
  const chordMatches = [];
  const lineRe = new RegExp(CHORD_CANDIDATE_REGEX.source, "gi");
  let chordMatch;
  while ((chordMatch = lineRe.exec(withoutPipes)) !== null) {
    const chord = chordFromMatch(chordMatch);
    if (isChordToken(chord)) chordMatches.push(chord);
  }

  if (chordMatches.length === 0) return false;

  const leftover = stripChordsFromText(trimmed).replace(
    /[|/\-–—:\s()[\]{}]/g,
    "",
  );
  return !HEBREW_RE.test(leftover);
}

function isSectionLine(line) {
  const trimmed = line.trim().replace(/^\*+|\*+$/g, "");
  const inner = trimmed.replace(/^[\[:]+|[\]:]+$/g, "").trim();
  if (!inner || isChordToken(inner)) return false;
  return SECTION_LABEL_RE.test(inner);
}

function normalizeSectionLabel(line) {
  let label = line.trim().replace(/^\*+|\*+$/g, "");
  label = label
    .replace(/^[\[:]+/, "")
    .replace(/[\]:]+$/, "")
    .trim();
  if (label.startsWith(":")) label = label.slice(1).trim();
  return label;
}

export function classifyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return "empty";
  if (/^\*\*[^*]+\*\*$/.test(trimmed)) return "heading";
  if (isSectionLine(trimmed)) return "section";
  if (isChordLine(trimmed)) return "chords";
  if (HEBREW_RE.test(trimmed)) return "lyric";
  if (isChordToken(trimmed)) return "chords";
  return "other";
}

export function formatSongContentToHtml(content, theme, layoutDir = "rtl") {
  if (!content) return "";

  const isRtl = layoutDir === "rtl";
  const align = isRtl ? "right" : "left";

  return content
    .split("\n")
    .map((line) => {
      const type = classifyLine(line);
      const trimmed = line.trim();

      switch (type) {
        case "empty":
          return '<div class="song-line song-empty" aria-hidden="true">&nbsp;</div>';

        case "heading":
          return `<div class="song-line song-heading" dir="${isRtl ? "rtl" : "ltr"}" style="text-align:${align}">${formatBoldMarkdown(trimmed)}</div>`;

        case "section": {
          const label = normalizeSectionLabel(line);
          return `<div class="song-line song-section" dir="rtl" style="text-align:${align}"><span class="section-label">${escapeHtml(label)}</span></div>`;
        }

        case "chords":
          return `<div class="song-line song-chords" dir="ltr" style="text-align:${align}">${formatLineWithChords(line, { inlineLtr: false })}</div>`;

        case "lyric":
          return `<div class="song-line song-lyric" dir="${isRtl ? "rtl" : "ltr"}" style="text-align:${align}">${formatLineWithChords(line, { inlineLtr: isRtl })}</div>`;

        default:
          return `<div class="song-line song-other" dir="${isRtl ? "rtl" : "ltr"}" style="text-align:${align}">${formatLineWithChords(line, { inlineLtr: isRtl })}</div>`;
      }
    })
    .join("");
}
