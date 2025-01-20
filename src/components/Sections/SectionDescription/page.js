import React from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/app/ThemeContext.js';

import Backaground_Img from 'images/background/shadow_lion.png';

const SectionDescription = () => {
  const { darkMode } = useTheme();
  const { setSelectedMusicId } = useTheme();
  const { sectionName } = useTheme();

  // Données statiques pour l'exemple
  const listeTitres = [
    {
      title: 'Titre 1',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 2',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 3',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 4',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 5',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 6',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 7',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 8',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 9',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 0',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 1',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 2',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 3',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 4',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 5',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 6',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 7',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 8',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 9',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
      title: 'Titre 10',
      imageUrl: Backaground_Img,
      id: 'abcdefghijklmnopqrstuvwxyz',
    },
  ];

  const handleItemClick = (id) => {
    setSelectedMusicId(id);
  };

  return (
    <div className={style.container}>
      <div
        className={`${style.section} ${darkMode ? style.dark : style.light}`}
      >
        <div className={style.head_wrapper}>
          <Image
            src={Backaground_Img}
            alt="Titre"
            width={140}
            height={140}
            className={style.head_image}
          />
          <div className={style.head_presentation}>
            <h2 className={style.section_title}> Titre</h2>
            <p>{sectionName}</p>
            <p>Description</p>
            <p>
              Nombre de Titre <span>0</span>
            </p>
            <p>Durée</p>
          </div>
        </div>
        <div className={style.items_container}>
          {listeTitres.map((item, index) => (
            <button
              className={style.item}
              key={index}
              onClick={() => handleItemClick(item.id)}
            >
              <div className={style.item_head}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={60}
                  height={60}
                  className={style.item_image}
                />
                <p className={style.item_text}>{item.title}</p>
              </div>
              <p className={style.item_text}>Artiste</p>
              <p className={style.item_text}>Album</p>
              <p className={style.item_text}>Durée</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDescription;
