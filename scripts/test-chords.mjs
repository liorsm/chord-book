/**
 * בדיקות לוגיקת אקורדים — הרצה: node scripts/test-chords.mjs
 */
import {
  isChordToken,
  stripOctaveMark,
  splitOctaveMark,
  isBareMajorRoot,
} from '../src/utils/chordSymbol.js';
import {
  transposeChord,
  simplifyChord,
  transposeContent,
} from '../src/utils/chords.js';
import { getChordSemitones, getChordVoicing } from '../src/utils/pianoChords.js';

let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function assertEq(name, actual, expected) {
  assert(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

console.log('stripOctaveMark / splitOctaveMark');
assertEq('A#4 → A#', stripOctaveMark('A#4'), 'A#');
assertEq('Bb3 → Bb', stripOctaveMark('Bb3'), 'Bb');
assertEq('A#7 נשאר (ספטמה)', stripOctaveMark('A#7'), 'A#7');
assertEq('Bb3m → Bbm', stripOctaveMark('Bb3m'), 'Bbm');
assertEq('split A#4 digit', splitOctaveMark('A#4').digit, '4');
assertEq('split Bb3 base', splitOctaveMark('Bb3').base, 'Bb');

console.log('\nisChordToken');
assert('A#4 תקף', isChordToken('A#4'));
assert('Bb3 תקף', isChordToken('Bb3'));
assert('Am תקף', isChordToken('Am'));
assert('a נדחה (lowercase)', !isChordToken('a'));

console.log('\ntransposeChord — סימון ישראלי');
assertEq('A#4 +1 → B', transposeChord('A#4', 1), 'B');
assertEq('Bb3 +2 → C', transposeChord('Bb3', 2), 'C');
assertEq('A#4 -1 → A', transposeChord('A#4', -1), 'A');
assertEq('F#4 +0 → F#4', transposeChord('F#4', 0), 'F#4');
assertEq('F#4 +2 → G#4', transposeChord('F#4', 2), 'G#4');
assertEq('Am/G +2', transposeChord('Am/G', 2), 'Bm/A');
assertEq('C +1 → C#', transposeChord('C', 1), 'C#');
assertEq('Bb +1 → B', transposeChord('Bb', 1), 'B');

console.log('\nsimplifyChord');
assertEq('Cdim → C (לא Cm)', simplifyChord('Cdim'), 'C');
assertEq('Cdim7 → C', simplifyChord('Cdim7'), 'C');
assertEq('Cm7 → Cm', simplifyChord('Cm7'), 'Cm');
assertEq('Cmaj7 → C', simplifyChord('Cmaj7'), 'C');
assertEq('A#4m7 → A#4m', simplifyChord('A#4m7'), 'A#4m');

console.log('\ntransposeContent — אקורדים חופשיים רק בשורת אקורדים');
{
  const src = 'A  C  G\nI need A moment\nFor you and I Am is me\nAm\nHello [Am] world';
  const out = transposeContent(src, 2);
  assert('שורת אקורדים מועברת', out.includes('B  D  A'));
  assert('A במילים לא מועבר', out.includes('I need A moment'));
  assert('Am במילים לא מועבר', out.includes('I Am is me'));
  assert('שורת Am בלבד מועברת', out.split('\n').includes('Bm'));
  assert('[Am] במילים מועבר', out.includes('Hello [Bm] world'));
}

console.log('\nisBareMajorRoot');
assert('A bare', isBareMajorRoot('A'));
assert('Am לא bare', !isBareMajorRoot('Am'));
assert('A#4 bare אחרי strip', isBareMajorRoot('A#4'));

console.log('\npiano getChordSemitones / voicing');
{
  const am = getChordSemitones('Am').sort((a, b) => a - b);
  assertEq('Am notes', am.join(','), '0,4,9');
  const cdim = getChordSemitones('Cdim').sort((a, b) => a - b);
  assertEq('Cdim notes', cdim.join(','), '0,3,6');
  const f = getChordSemitones('F');
  assertEq('F pitch classes', [...f].sort((a, b) => a - b).join(','), '0,5,9');
  const fVoice = getChordVoicing(f);
  const N = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  assertEq(
    'F voicing = F A C',
    fVoice.map((s) => N[s % 12]).join(','),
    'F,A,C'
  );
}

console.log('\nclassifyLine / format — מילים vs אקורדים');
{
  const { classifyLine, formatSongContentToHtml } = await import('../src/utils/songRender.js');
  const { extractUniqueChords } = await import('../src/utils/chords.js');

  assertEq('שורת אקורדים', classifyLine('    G       A       D'), 'chords');
  assertEq('A whole new world = lyric', classifyLine('A whole new world'), 'lyric');
  assertEq('I Am is me = lyric', classifyLine('For you and I Am is me'), 'lyric');
  assertEq('Am I dreaming = lyric', classifyLine('Am I dreaming'), 'lyric');
  assertEq('שורש בודד = chords', classifyLine('A'), 'chords');
  assertEq('Am בודד = chords', classifyLine('Am'), 'chords');
  assertEq('D  D/G  D = chords', classifyLine('D  D/G  D'), 'chords');

  const html = formatSongContentToHtml(
    [
      '    C       F',
      'For you and I Am is me',
      '    G       A       D',
      'A whole new world',
      'Hello [Am] there',
      'Am',
    ].join('\n'),
    null,
    'ltr',
  );

  assert('שורת אקורדים עם class', html.includes('song-chords'));
  assert('מילים עם class lyric', html.includes('song-lyric'));

  const lyricBlocks = [...html.matchAll(/class="song-line song-lyric"[^>]*>([\s\S]*?)<\/div>/g)].map(
    (m) => m[1],
  );
  const amInWords = lyricBlocks.find((b) => b.includes('I Am is me'));
  const aWhole = lyricBlocks.find((b) => b.includes('whole new world'));
  const bracketAm = lyricBlocks.find((b) => b.includes('there'));

  assert('שורה עם I Am קיימת', Boolean(amInWords));
  assert('Am במילים לא עטוף כ-chord', amInWords && !/data-chord="Am"/.test(amInWords));
  assert('A במילים לא עטוף כ-chord', aWhole && !/data-chord="A"/.test(aWhole));
  assert('טקסט I Am נשאר', /I Am is me/.test(amInWords));
  assert('A whole נשאר כטקסט', /A whole new world/.test(aWhole));
  assert('[Am] במילים כן עטוף', bracketAm && /data-chord="Am"/.test(bracketAm));

  const chordBlocks = [...html.matchAll(/class="song-line song-chords"[^>]*>([\s\S]*?)<\/div>/g)].map(
    (m) => m[1],
  );
  const chordHtml = chordBlocks.join('\n');
  assert('C בשורת אקורדים עטוף', /data-chord="C"/.test(chordHtml));
  assert('Am בשורת אקורדים עטוף', /data-chord="Am"/.test(chordHtml));

  const unique = extractUniqueChords(
    'Am\nFor you and I Am is me\nA  C\nA whole new world\nHello [Dm] x',
  );
  assert('extract: Am משורת אקורדים', unique.includes('Am'));
  assert('extract: A משורת אקורדים', unique.includes('A'));
  assert('extract: C משורת אקורדים', unique.includes('C'));
  assert('extract: [Dm] ממילים', unique.includes('Dm'));
  assert(
    'extract: לא מושך Am כפול ממילים (רק פעם אחת משורה)',
    unique.filter((c) => c === 'Am').length === 1,
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll passed');
