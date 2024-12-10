// RootLayout.js
'use client';
import React, { useEffect } from 'react';
import 'styles/globals.scss';
import 'styles/variables.scss';

// import { appWithTranslation } from 'next-i18next';
// import { useRouter } from 'next/router';
import { ThemeProvider } from '@/app/ThemeContext';
import logger from '@/utils/logger';
import Head from './head.js';

export default function RootLayout({ children }) {
  // const { locale } = useRouter();
  // const isRtl = locale === 'ar'; // Vérifie si la langue est arabe

  useEffect(() => {
    logger.info('Application is starting...');

    setTimeout(() => {
      logger.info('Application is fully initialized');
    }, 1000);
  }, []);

  return (
    <html>
      {/* <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}> */}
      <body>
        <Head />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
