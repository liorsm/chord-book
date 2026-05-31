import { classifyLine } from './songRender';

const SECTION_BOUNDARY_RE =
  /^(פתיחה|בית|פזמון|גשר|מעבר|סולו|Intro|Verse|Chorus|Bridge|Outro|Pre-Chorus)(\s*\d*)?$/i;

function normalizeSectionCandidate(line) {
  let label = line.trim().replace(/^\*+|\*+$/g, '');
  label = label.replace(/^[\[:]+/, '').replace(/[\]:]+$/, '').trim();
  if (label.startsWith(':')) label = label.slice(1).trim();
  return label;
}

/** Section header or "בית 2" style label — used only for column split boundaries */
export function isColumnBlockStart(line) {
  if (classifyLine(line) === 'section') return true;
  const inner = normalizeSectionCandidate(line);
  return SECTION_BOUNDARY_RE.test(inner);
}

function groupLinesIntoBlocks(lines) {
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (isColumnBlockStart(line) && current.length > 0) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

function isValidLineSplit(lines, index) {
  if (index <= 0 || index >= lines.length) return false;
  const prev = classifyLine(lines[index - 1]);
  const next = classifyLine(lines[index]);
  if (prev === 'chords' && next === 'lyric') return false;
  if (prev === 'lyric' && next === 'chords') return false;
  return true;
}

function splitLinesNearMiddle(lines) {
  const total = lines.length;
  if (total <= 1) {
    return { first: lines.join('\n'), second: '' };
  }

  const target = Math.ceil(total / 2);
  const candidates = [];

  for (let i = 1; i < total; i++) {
    if (!isValidLineSplit(lines, i)) continue;
    if (lines[i].trim() === '' || isColumnBlockStart(lines[i])) {
      candidates.push(i);
    }
  }

  if (candidates.length === 0) {
    for (let i = 1; i < total; i++) {
      if (isValidLineSplit(lines, i)) candidates.push(i);
    }
  }

  const index =
    candidates.length > 0
      ? candidates.reduce((best, i) =>
          Math.abs(i - target) < Math.abs(best - target) ? i : best
        )
      : target;

  return {
    first: lines.slice(0, index).join('\n'),
    second: lines.slice(index).join('\n'),
  };
}

function splitBlocksNearMiddle(blocks) {
  const sizes = blocks.map((b) => b.length);
  const total = sizes.reduce((sum, n) => sum + n, 0);
  if (total === 0) return { first: '', second: '' };

  if (blocks.length === 1) {
    return splitLinesNearMiddle(blocks[0]);
  }

  const target = total / 2;
  let bestSplit = 1;
  let bestDiff = Infinity;
  let cumulative = 0;

  for (let i = 0; i < blocks.length - 1; i++) {
    cumulative += sizes[i];
    const diff = Math.abs(cumulative - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSplit = i + 1;
    }
  }

  const firstLines = blocks.slice(0, bestSplit).flat();
  const secondLines = blocks.slice(bestSplit).flat();

  return {
    first: firstLines.join('\n'),
    second: secondLines.join('\n'),
  };
}

/**
 * Split song text into two halves for desktop "book" columns.
 * Prefers breaks between sections (בית / פזמון / …), never mid block.
 */
export function splitSongContentForColumns(content) {
  if (!content?.trim()) {
    return { first: '', second: '' };
  }

  const lines = content.split('\n');
  const blocks = groupLinesIntoBlocks(lines);
  const { first, second } = splitBlocksNearMiddle(blocks);

  if (!second.trim()) {
    return { first: content, second: '' };
  }

  return { first, second };
}
