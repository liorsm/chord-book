import { findChordsInText } from './chordSymbol';

/** מסיר אקורדים לפני ספירת תווים לזיהוי שפה */
export function stripChordsFromText(text) {
  if (!text) return '';
  let result = text.replace(/\[[^\]]+\]/g, ' ');
  const chords = findChordsInText(result).sort((a, b) => b.index - a.index);
  for (const { index, length } of chords) {
    result = `${result.slice(0, index)}${' '.repeat(length)}${result.slice(index + length)}`;
  }
  return result;
}

export function detectLanguage(text) {
  const cleaned = stripChordsFromText(text);
  const hebrewChars = (cleaned.match(/[\u0590-\u05FF]/g) || []).length;
  const latinChars = (cleaned.match(/[a-zA-Z]/g) || []).length;

  // יש עברית במילים — RTL (גם כשיש הרבה אקורדים באנגלית)
  if (hebrewChars > 0) {
    // שיר עם מילים בעברית — תמיד RTL (גם אם יש הרבה שורות אקורדים באנגלית)
    if (latinChars === 0 || hebrewChars >= latinChars * 0.15) return 'he';
  }

  if (latinChars > hebrewChars) return 'en';
  return 'he';
}

export function getTextDirection(language) {
  return language === 'he' ? 'rtl' : 'ltr';
}

export function getTextAlign(language) {
  return language === 'he' ? 'right' : 'left';
}

/**
 * ב-flex עם dir תואם לשפה, flex-start = תחילת שורת הקריאה (ימין בעברית, שמאל באנגלית).
 * אל תשתמשו ב-flex-end ליישור «ימין» — ב-RTL האתר flex-end הוא שמאל פיזי.
 */
export function getReadingAlignItems() {
  return 'flex-start';
}

/**
 * מיקום אופקי פיזי לרכיב fixed — חייב להיות ב-style (לא sx).
 * stylis-plugin-rtl של MUI הופך left↔right ב-sx, ולכן «שמאל» ב-sx מופיע בפועל מימין.
 */
export function getOppositeHorizontalStyle(language, marginPx) {
  if (language === 'he') {
    return { left: marginPx };
  }
  return { right: marginPx };
}

/** מיקום פאנל צף — קואורדינטות פיזיות מ-left/top של viewport (לשימוש ב-style) */
export function getOppositePanelPosition(language, panelWidth, panelHeight, margin = 24) {
  const top = Math.max(8, (window.innerHeight - panelHeight) / 2);
  const left =
    language === 'he'
      ? margin
      : Math.max(8, window.innerWidth - panelWidth - margin);
  return { left, top };
}
