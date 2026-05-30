import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage';
import { isSiteAccessGranted } from '../utils/siteAccess';

/** חוסם את האתר עד הזנת סיסמה תקפה (24 שעות ב-localStorage) */
export default function SiteAccessGuard() {
  const [granted, setGranted] = useState(() => isSiteAccessGranted());

  if (!granted) {
    return <WelcomePage onAccessGranted={() => setGranted(true)} />;
  }

  return <Outlet />;
}
