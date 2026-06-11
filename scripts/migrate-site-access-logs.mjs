/**
 * מיגרציה חד-פעמית: siteAccessLogs → סכמה נקייה
 *
 * דרישות:
 *   npm install (firebase-admin ב-devDependencies)
 *   קובץ Service Account מ-Firebase Console → Project Settings → Service accounts
 *
 * הרצה:
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccount.json
 *   npm run migrate:access-logs
 *
 * אופציות:
 *   --dry-run   — הדפסה בלבד, ללא עדכון DB
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';
import { parseUserAgent, fetchCityFromIp } from '../src/utils/siteAccessLogParse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const API_DELAY_MS = 300;

const OLD_FIELDS = [
  'userAgent',
  'platform',
  'language',
  'languages',
  'screen',
  'viewport',
  'timeZone',
  'referrer',
  'path',
  'connectionType',
];

function initFirebase() {
  if (admin.apps.length) return;

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && existsSync(credPath)) {
    const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }

  const localKey = resolve(__dirname, 'serviceAccountKey.json');
  if (existsSync(localKey)) {
    const serviceAccount = JSON.parse(readFileSync(localKey, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }

  console.error(
    'Missing credentials. Set GOOGLE_APPLICATION_CREDENTIALS or place scripts/serviceAccountKey.json'
  );
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function migrate() {
  initFirebase();
  const db = admin.firestore();
  const FieldValue = admin.firestore.FieldValue;

  const snap = await db.collection('siteAccessLogs').get();
  console.log(`Found ${snap.size} log records`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;

    const alreadyClean =
      data.deviceType &&
      data.os &&
      data.browser &&
      !data.userAgent &&
      !data.screen &&
      !data.viewport;

    if (alreadyClean && data.city !== undefined) {
      skipped += 1;
      continue;
    }

    const { deviceType, os, browser } = parseUserAgent(data.userAgent || '');
    const ip = typeof data.ip === 'string' ? data.ip : null;

    let city = typeof data.city === 'string' ? data.city : null;
    if (!city && ip) {
      city = await fetchCityFromIp(ip);
      await sleep(API_DELAY_MS);
    }

    const update = {
      deviceType: data.deviceType || deviceType,
      os: data.os || os,
      browser: data.browser || browser,
      city: city || null,
      ip: ip || null,
    };

    for (const field of OLD_FIELDS) {
      if (field in data) {
        update[field] = FieldValue.delete();
      }
    }

    console.log(
      `[${DRY_RUN ? 'dry-run' : 'update'}] ${id}: ${update.deviceType}, ${update.os}, ${update.browser}, ${update.city || '—'}, ${update.ip || '—'}`
    );

    if (!DRY_RUN) {
      try {
        await doc.ref.update(update);
        updated += 1;
      } catch (err) {
        console.error(`Failed ${id}:`, err.message);
        failed += 1;
      }
    } else {
      updated += 1;
    }
  }

  console.log(`Done. updated=${updated}, skipped=${skipped}, failed=${failed}`);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
