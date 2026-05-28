# ChordBook

אפליקציית אקורדים לשירים — React 19, Vite, MUI 7, Firebase.

## הרצה

```bash
npm install
cp .env.example .env
# ערוך .env והוסף VITE_ADMIN_UIDS אחרי שלב ההרשאה למטה
npm run dev
```

פתח [http://localhost:5173/chord-book/](http://localhost:5173/chord-book/) (או הנתיב ש-Vite מציג).

**ניהול (מנהל בלבד):** [http://localhost:5173/chord-book/manage](http://localhost:5173/chord-book/manage)

## מודל האתר

| מבקר | מנהל (`/manage` + Google) |
|------|---------------------------|
| צפייה בשירים | הוספה, עריכה, מחיקה |
| חיפוש, טרנספוז, גלילה | פלייליסטים, מועדפים |
| ללא התחברות | התחברות Google בדף הניהול בלבד |

השירים ציבוריים לקריאה. כתיבה ל-Firestore מותרת רק למנהל (לפי UID).

## הגדרת מנהל (פעם אחת)

1. [Authentication → Google](https://console.firebase.google.com/project/chord-book-543fa/authentication/providers) — הפעל **Google**.
2. [Authorized domains](https://console.firebase.google.com/project/chord-book-543fa/authentication/settings) — `localhost`, `liorsm.github.io`.
3. העלה את `firestore.rules` לפרויקט (החלף `REPLACE_WITH_YOUR_FIREBASE_UID` ב-UID שלך):
   - Firebase Console → Firestore → Rules → הדבק מתוך `firestore.rules`
4. גלוש ל-`/manage` → **התחבר עם Google**.
5. אם מוצג "אינו מורשה" — העתק את ה-**UID** מהמסך.
6. הוסף את ה-UID:
   - מקומית: `.env` → `VITE_ADMIN_UIDS=ה-UID-שלך`
   - GitHub Pages: Repository → Settings → Secrets → `VITE_ADMIN_UIDS`
   - `firestore.rules` → החלף את ה-placeholder באותו UID → פרסם שוב ב-Firestore Console
7. רענן `/manage` — אמור להיפתח ממשק הניהול.

ניתן לכבות **Anonymous** ב-Authentication (לא בשימוש יותר).

## בנייה

```bash
npm run build
npm run preview
```

## פרסום ל-GitHub Pages

האתר מתפרסם אוטומטית ל-[liorsm.github.io/chord-book](https://liorsm.github.io/chord-book/) בכל push ל-`main`.

**הגדרה חד-פעמית (חובה):** [Settings → Pages](https://github.com/liorsm/chord-book/settings/pages) → Source: **GitHub Actions**.

**Secrets:** `VITE_ADMIN_UIDS` (חובה למנהל), `VITE_YOUTUBE_API_KEY` (אופציונלי).

## Firebase

- פרויקט: `chord-book-543fa`
- Firestore: `songs` (קריאה ציבורית), `playlists` (מנהל בלבד)

## גיבוי

הגרסה הישנה (HTML יחיד) נשמרה ב-`index.legacy.html`.
