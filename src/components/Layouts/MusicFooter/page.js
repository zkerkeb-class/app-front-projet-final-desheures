import React from 'react';
import style from './page.module.scss';

const MusicFooter = () => {
  return (
    <footer className={style.footer}>
      <div className={style.trackDetails}>
        {/* <img
          src="/images/current-track.jpg"
          alt="Pochette"
          className={style.cover}
        /> */}
        <div>
          <p className={style.trackTitle}>Titre de la musique</p>
          <p className={style.artist}>Nom de l&apos;artiste</p>
        </div>
      </div>

      <div className={style.controls}>
        <button>⏮</button>
        <button>⏯</button>
        <button>⏭</button>
      </div>

      <div className={style.progress}>
        <span>01:08</span>
        <input type="range" min="0" max="100" />
        <span>04:08</span>
      </div>
    </footer>
  );
};

export default MusicFooter;
