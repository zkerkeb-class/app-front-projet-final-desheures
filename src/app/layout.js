// RootLayout.js
'use client';
import React, { useEffect } from 'react';
import 'styles/globals.scss';
import 'styles/variables.scss';

import { ThemeProvider } from '@/context/ThemeContext.js';
import logger from '@/utils/logger';
import Head from './head.js';

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
