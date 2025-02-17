// app/offline.js
'use client';
import React from 'react';
import styles from './offline.module.scss';

export default function Offline() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className={styles.offline}>
      <div className={styles.container}>
        <div className={styles.musicIcon}>
          <span>♪</span>
        </div>

        <h1 className={styles.title}>Des Heures est hors ligne</h1>

        <p className={styles.message}>
          Impossible de se connecter au service de streaming. Vérifiez votre
          connexion internet.
        </p>

        <button onClick={handleReload} className={styles.button}>
          Réessayer la connexion
        </button>
      </div>
    </div>
  );
}
