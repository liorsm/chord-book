/** מסיר אקורדים לפני ספירת תווים לזיהוי שפה */
export function stripChordsFromText(text) {
  if (!text) return '';
  return text
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(
      /\b[A-G][#b]?(?:maj7|maj|m7|min7|min|dim7|dim|aug|sus4|sus2|add9|add|m|7|9|11|13|6|5|2|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?\b/gi,
      ' '
    );
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
