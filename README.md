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

**הגדרה חד-פעמית ב-GitHub:** Repository → Settings → Pages → Build and deployment → Source: **GitHub Actions**.

**Firebase:** ב-Authentication → Authorized domains הוסף `liorsm.github.io`.

אופציונלי — חיפוש YouTube בפרודקשן: הגדר secret `VITE_YOUTUBE_API_KEY` ב-Repository → Settings → Secrets and variables → Actions.

## גיבוי

הגרסה הישנה (HTML יחיד) נשמרה ב-`index.legacy.html`.

## Firebase

- פרויקט: `chord-book-543fa`
- Auth: התחברות אנונימית
- Firestore: `songs`, `playlists`

ודא ש-Firebase Authentication (Anonymous) ו-Firestore Rules מאפשרים קריאה/כתיבה למשתמשים מחוברים.
