'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext.js';
import style from './index.module.scss';
import Image from 'next/image';
import { getAlbumById } from '@/services/api/album.api';
import Backaground_Img from 'images/background/shadow_lion.png';
import socketService from '@/services/sockets/socketsService';
import logger from '@/utils/logger';
import { useTranslation } from 'react-i18next';
const SectionAlbum = () => {
  const { t } = useTranslation();
  const { darkMode, selectedId, setSelectedMusicId } = useTheme();
  const [album, setAlbum] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {});

    socket.on('connect_error', (error) => {
      logger.error('Erreur de connexion socket dans SectionAlbum:', error);
    });

    if (selectedId) {
      getAlbumById(selectedId)
        .then((album) => setAlbum(album))
        .catch(logger.error);
    }

    // Événements pour les playlists
    socket.on('recentlyPlayedUpdated', () => {
      socket.emit('getRecentlyPlayed');
    });

    socket.on('mostPlayedUpdated', () => {
      socket.emit('getMostPlayed');
    });

    return () => {
      socketService.disconnect();
    };
  }, [selectedId]);

  const handleItemClick = (id) => {
    setSelectedMusicId(id);
    socketService.emit('playTrack', id);
  };
  const getFullImageUrl = (url) => {
    if (!url) return '/images/default-placeholder.png';
    return url.startsWith('http') ? url : `${baseUrl}/${url}`;
  };

  const totalDuration =
    album?.tracks?.reduce((acc, track) => acc + track.duration, 0) || 0;
  const formattedDuration = `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toFixed(0).padStart(2, '0')}`;

  return (
    <div className={style.container}>
      <div
        className={`${style.section} ${darkMode ? style.dark : style.light}`}
      >
        <div className={style.head_wrapper}>
          <Image
            src={getFullImageUrl(album?.coverUrl) || Backaground_Img}
            alt={album?.title || t('generalTitle')}
            width={140}
            height={140}
            className={style.head_image}
          />
          <div className={style.head_presentation}>
            <h2 className={style.section_title}>
              {album?.title || t('generalTitle')}
            </h2>
            <p>{album?.artist?.name || t('unkwownArtist')}</p>
            <p>
              {t('titleLenght')} <span>{album?.tracks?.length || 0}</span>
            </p>
            <p>
              {t('durationFilter')} : {formattedDuration}
            </p>
          </div>
        </div>

        <div className={style.items_container}>
          {album?.tracks?.map((item) => (
            <button
              className={style.item}
              key={item._id}
              onClick={() => handleItemClick(item._id)}
            >
              <div className={style.item_part}>
                <Image
                  src={getFullImageUrl(album?.coverUrl)}
                  alt={item.title}
                  width={60}
                  height={60}
                  className={style.item_image}
                />
                <p className={style.item_text}>{item.title}</p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>
                  {album?.artist?.name || t('unkwownArtist')}
                </p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>
                  {album?.title || t('unkwownAlbum')}
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

export default SectionAlbum;
