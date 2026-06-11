/** פרסור User-Agent לשדות נקיים — עובד בדפדפן וב-Node */
export function parseUserAgent(userAgent = '') {
  const ua = String(userAgent);

  const isMobile =
    /Mobi|Android.*Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    /iPad/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/CriOS/i.test(ua)) browser = 'Chrome';
  else if (/FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/MSIE|Trident/i.test(ua)) browser = 'Internet Explorer';

  let os = 'Unknown';
  if (/Windows NT 11/i.test(ua)) os = 'Windows 11';
  else if (/Windows NT 10/i.test(ua)) os = 'Windows 10';
  else if (/Windows NT 6\.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6\.[12]/i.test(ua)) os = 'Windows 7';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, os, browser };
}

const GEO_TIMEOUT_MS = 5000;

/** עיר בישראל לפי IP — ipwho.is (חינמי, ללא מפתח) */
export async function fetchCityFromIp(ip) {
  if (!ip || typeof ip !== 'string') return null;

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip.trim())}`, {
      signal: AbortSignal.timeout(GEO_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success || data.country_code !== 'IL') return null;
    return typeof data.city === 'string' && data.city.trim() ? data.city.trim() : null;
  } catch {
    return null;
  }
}

/** IP + עיר למכשיר הנוכחי — קריאה אחת */
export async function fetchCurrentIpAndCity() {
  try {
    const res = await fetch('https://ipwho.is/', {
      signal: AbortSignal.timeout(GEO_TIMEOUT_MS),
    });
    if (!res.ok) return { ip: null, city: null };
    const data = await res.json();
    if (!data?.success) return { ip: null, city: null };
    const ip = typeof data.ip === 'string' ? data.ip : null;
    const city =
      data.country_code === 'IL' && typeof data.city === 'string' && data.city.trim()
        ? data.city.trim()
        : null;
    return { ip, city };
  } catch {
    return { ip: null, city: null };
  }
}
