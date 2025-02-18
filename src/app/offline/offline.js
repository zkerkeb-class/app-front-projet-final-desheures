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
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>♪</span>
        </div>

        <h1 className={styles.title}>DesHeures</h1>
        <h2 className={styles.title_second}>Hors Ligne</h2>
        <h2 className={styles.title_second}>Oops... Pas de connexion !</h2>

        <p className={styles.message}>
          Impossible de se connecter au service de streaming. Vérifiez votre
          connexion internet.
        </p>

        <button onClick={handleReload} className={styles.button}>
          Reconnection
        </button>
      </div>
    </div>
  );
}
