'use client';
import { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { useTranslation } from 'react-i18next';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`${styles.indicator} ${isOnline ? styles.online : styles.offline}`}
    >
      <div className={styles.content}>
        <p>{isOnline ? t('online') : t('offline')}</p>
        <div className={styles.statusDot}></div>
      </div>
    </div>
  );
}
