'use client';
import React, { useEffect } from 'react';
import 'styles/globals.scss';
import 'styles/variables.scss';
import { ThemeProvider } from '@/context/ThemeContext.js';
import { I18nProvider } from '@/components/i18nProvider';
import OfflineIndicator from '@/components/OfflineIndicator';
import logger from '@/utils/logger';
import Head from './head.js';
import i18n from '../i18n';

function RootLayout({ children }) {
  useEffect(() => {
    logger.info('Application is starting...');

    setTimeout(() => {
      logger.info('Application is fully initialized');
    }, 1000);
  }, []);

  return (
    <html lang="fr">
      <body>
        <Head />
        <ThemeProvider>
          <I18nProvider i18n={i18n}>
            {children}
            <OfflineIndicator />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
