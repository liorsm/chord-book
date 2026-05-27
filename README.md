# ChordBook

אפליקציית אקורדים לשירים — React 19, Vite, MUI 7, Firebase.

## הרצה

```bash
npm install
npm run dev
```

פתח [http://localhost:5173](http://localhost:5173)

## בנייה

```bash
npm run build
npm run preview
```

## פרסום ל-GitHub Pages

האתר מתפרסם אוטומטית ל-[liorsm.github.io/chord-book](https://liorsm.github.io/chord-book/) בכל push ל-`main`.

**הגדרה חד-פעמית (חובה):** [Settings → Pages](https://github.com/liorsm/chord-book/settings/pages) → Build and deployment → Source: **GitHub Actions** (לא `Deploy from a branch` / `main`).

אם ה-Source נשאר על `main`, האתר יציג את קוד המקור (`/src/main.jsx`) ולא את האפליקציה הבנויה — דף ריק או ישן.

**גיבוי (ענף gh-pages):** אם מעדיפים "Deploy from a branch" — ב-Settings → Actions → General אפשר **Read and write permissions**, הרץ ידנית את workflow `Deploy to gh-pages branch`, ואז ב-Pages בחר ענף **gh-pages**.

**Firebase:** ב-Authentication → Authorized domains הוסף `liorsm.github.io`.

אופציונלי — חיפוש YouTube בפרודקשן: הגדר secret `VITE_YOUTUBE_API_KEY` ב-Repository → Settings → Secrets and variables → Actions.

## גיבוי

הגרסה הישנה (HTML יחיד) נשמרה ב-`index.legacy.html`.

## Firebase

- פרויקט: `chord-book-543fa`
- Auth: התחברות אנונימית
- Firestore: `songs`, `playlists`

ודא ש-Firebase Authentication (Anonymous) ו-Firestore Rules מאפשרים קריאה/כתיבה למשתמשים מחוברים.
