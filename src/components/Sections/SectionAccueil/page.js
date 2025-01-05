import React from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/app/ThemeContext.js';

import Backaground_Img from 'images/background/shadow_lion.png'

const SectionAccueil = () => {
  const { darkMode } = useTheme();

  // Données statiques pour l'exemple
  const topAlbums = [
    { title: 'Album 1', imageUrl: Backaground_Img },
    { title: 'Album 2', imageUrl: Backaground_Img },
    { title: 'Album 3', imageUrl: Backaground_Img },
    { title: 'Album 4', imageUrl: Backaground_Img },
    { title: 'Album 5', imageUrl: Backaground_Img },
  ];

  const topTracks = [
    { title: 'Track 1', imageUrl: Backaground_Img },
    { title: 'Track 2', imageUrl: Backaground_Img },
    { title: 'Track 3', imageUrl: Backaground_Img },
    { title: 'Track 4', imageUrl: Backaground_Img },
    { title: 'Track 5', imageUrl: Backaground_Img },
  ];

  const topArtists = [
    { title: 'Artist 1', imageUrl: Backaground_Img },
    { title: 'Artist 2', imageUrl: Backaground_Img },
    { title: 'Artist 3', imageUrl: Backaground_Img },
    { title: 'Artist 4', imageUrl: Backaground_Img },
    { title: 'Artist 5', imageUrl: Backaground_Img },
  ];

  const renderSection = (title, data) => (
    <div className={`${style.section} ${darkMode ? style.dark : style.light}`}>
      <h2 className={style.section_title}>{title}</h2>
      <div className={style.items_container}>
        {data.map((item, index) => (
          <div className={style.item} key={index}>
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={140}
              height={140}
              className={style.item_image}
            />
            <p className={style.item_title}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={style.container}>
      {renderSection('Top 10 Albums', topAlbums)}
      {renderSection('Top 10 Titres', topTracks)}
      {renderSection('Top 10 Artistes', topArtists)}
    </div>
  );
};

export default SectionAccueil;
