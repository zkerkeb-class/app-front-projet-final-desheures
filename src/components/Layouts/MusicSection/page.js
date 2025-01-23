import React, { useEffect } from 'react';
import style from './page.module.scss';
import Image from 'next/image';

import { useTheme } from '@/app/ThemeContext.js';
import Backaground_Img from 'images/background/shadow_lion.png';

const MusicSection = () => {
  const { selectedMusicId } = useTheme();
  const { darkMode } = useTheme();

  useEffect(() => {
    return () => {};
  }, [selectedMusicId]);

  return (
    <div className={style.container}>
      <div
        className={`${style.music_section} ${darkMode ? style.dark : style.light}`}
      >
        <div className={style.music_CD}>
          <Image
            src={Backaground_Img}
            alt={'CD'}
            width={120}
            height={120}
            className={style.image_CD}
          />
        </div>
        <div className={style.trackDetails}>
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

        <div className={style.sound}>
          <Image
            src={Backaground_Img}
            alt={'CD'}
            width={40}
            height={40}
            className={style.item_image}
          />
          <input type="range" min="0" max="100" />
        </div>
      </div>
    </div>
  );
};

export default MusicSection;
