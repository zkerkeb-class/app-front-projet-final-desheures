import React from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/app/ThemeContext.js';

import Backaground_Img from 'images/background/shadow_lion.png';

const SectionAccueil = () => {
  const { darkMode } = useTheme();
  const { setSectionName } = useTheme();
  const { setSelectedId } = useTheme();

  // Données statiques pour l'exemple
  const topAlbums = [
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 1',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 2',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 3',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 4',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 5',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 6',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 7',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 8',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 9',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Album 10',
      imageUrl: Backaground_Img,
    },
  ];

  const topTracks = [
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Track 1',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Track 2',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Track 3',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Track 4',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Track 5',
      imageUrl: Backaground_Img,
    },
  ];

  const topArtists = [
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Artist 1',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Artist 2',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Artist 3',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Artist 4',
      imageUrl: Backaground_Img,
    },
    {
      id: 'abcdefghijklmnopqrstuvwxyz',
      title: 'Artist 5',
      imageUrl: Backaground_Img,
    },
  ];

  const handleItemClick = (type, id) => {
    setSectionName(type);
    setSelectedId(id);
  };

  const renderSection = (title, data, type) => (
    <div className={`${style.section} ${darkMode ? style.dark : style.light}`}>
      <h2 className={style.section_title}>{title}</h2>
      <div className={style.items_container}>
        {data.map((item, index) => (
          <button
            className={style.item}
            key={index}
            onClick={() => handleItemClick(type, item.id)}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={140}
              height={140}
              className={style.item_image}
            />
            <p className={style.item_title}>{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={style.container}>
      {renderSection('Top 10 Albums', topAlbums, 'Album')}
      {renderSection('Top 10 Titres', topTracks, 'Titre')}
      {renderSection('Top 10 Artistes', topArtists, 'Artiste')}
    </div>
  );
};

export default SectionAccueil;
