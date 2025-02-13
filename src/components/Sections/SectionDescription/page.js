import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';
import Backaground_Img from 'images/background/shadow_lion.png';

import { getAllAudios } from '@/services/api/audio.api';
import logger from '@/utils/logger';
import { useTranslation } from 'react-i18next';
const SectionDescription = () => {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const { setSelectedMusicId } = useTheme();
  const { sectionName } = useTheme();

  const [audios, setAudios] = useState([]);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  useEffect(() => {
    getAllAudios()
      .then((data) => setAudios(data))
      .catch((error) =>
        logger.error('Erreur lors du chargement des audios:', error)
      );
  }, []);

  const handleItemClick = (id) => {
    setSelectedMusicId(id);
  };

  const getFullImageUrl = (url) => {
    if (!url) return '/images/default-placeholder.png';
    return url.startsWith('http') ? url : `${baseUrl}/${url}`;
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
            <h2 className={style.section_title}> {t('generalTitle')}</h2>
            <p>{sectionName}</p>
            <p>Description</p>
            <p>
              Nombre de Titres <span>{audios.length}</span>
            </p>
            <p>Durée</p>
          </div>
        </div>

        <div className={style.items_container}>
          {audios.map((item) => (
            <button
              className={style.item}
              key={item._id}
              onClick={() => handleItemClick(item._id)}
            >
              <div className={style.item_part}>
                <Image
                  src={getFullImageUrl(item.album?.coverUrl)}
                  alt={item.title}
                  width={60}
                  height={60}
                  className={style.item_image}
                />
                <p className={style.item_text}>{item.title}</p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>
                  {item.artist?.name || 'Artiste inconnu'}
                </p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>
                  {item.album?.title || 'Album inconnu'}
                </p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>
                  {Math.floor(item.duration / 60)}:
                  {(item.duration % 60).toFixed(0).padStart(2, '0')}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDescription;
