'use client';
import React, { useEffect, useState } from 'react';
import 'styles/globals.scss';
import 'styles/variables.scss';
import { ThemeProvider } from '@/context/ThemeContext.js';
import { I18nProvider } from '@/components/i18nProvider';
import OfflineIndicator from '@/components/OfflineIndicator';
import OfflinePage from '@/app/offline/offline.js';
import logger from '@/utils/logger';
import Head from './head.js';
import i18n from '../i18n';

function RootLayout({ children }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    logger.info('Application is starting...');

    setTimeout(() => {
      logger.info('Application is fully initialized');
    }, 1000);

    // Vérification de l'état du réseau
    const handleOnlineStatus = () => {
      const status = navigator.onLine;
      setIsOnline(status);
      logger.warn(status ? 'Reconnexion au réseau' : 'Perte de connexion');
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return (
    <html lang="fr">
      <body>
        <Head />
        <ThemeProvider>
          <I18nProvider i18n={i18n}>
            {!isOnline ? <OfflinePage /> : children}
            <OfflineIndicator />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
