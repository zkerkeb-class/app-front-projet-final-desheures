'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext.js';
import style from './index.module.scss';
import Image from 'next/image';
import { getAlbumsByArtist } from '@/services/api/filter.api';
import { getArtistById } from '@/services/api/artist.api';
import logger from '@/utils/logger';

const SectionArtist = () => {
  const { darkMode, selectedId, setSectionName, setSelectedId } = useTheme();
  const [albums, setAlbums] = useState([]);
  const [artist, setArtist] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    if (selectedId) {
      getAlbumsByArtist(selectedId).then(setAlbums).catch(logger.error);
      getArtistById(selectedId).then(setArtist).catch(logger.error);
    }
  }, [selectedId]);

  const handleAlbumClick = (albumId) => {
    setSelectedId(albumId);
    setSectionName('Album');
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
        {artist && (
          <div className={style.head_wrapper}>
            <Image
              src={getFullImageUrl(artist.imageUrl)}
              alt={artist.name}
              width={140}
              height={140}
              className={style.head_image}
            />
            <div className={style.head_presentation}>
              <h2 className={style.section_title}>{artist.name}</h2>
              <p>{artist.genres.join(', ')}</p>
              <p>{artist.bio}</p>
            </div>
          </div>
        )}

        <div className={style.items_container}>
          {albums.map((album) => (
            <button
              key={album._id}
              className={style.item}
              onClick={() => handleAlbumClick(album._id)}
            >
              <div className={style.item_part}>
                <Image
                  src={getFullImageUrl(album.coverUrl)}
                  alt={album.title}
                  width={60}
                  height={60}
                  className={style.item_image}
                />
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>{album.title}</p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>
                  {artist?.name || 'Artiste inconnu'}
                </p>
              </div>
              <div className={style.item_part}>
                <p className={style.item_text}>{album.tracks.length} Titres</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionArtist;
