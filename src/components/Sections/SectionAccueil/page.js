import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';

import {
  getAudiosSortedByPopularity,
  getAlbumsSortedByPopularity,
  getArtistsSortedByPopularity,
} from '@/services/api/sort.api';

const SectionAccueil = () => {
  const { darkMode, setSectionName, setSelectedId, setSelectedMusicId } =
    useTheme();
  const [topAlbums, setTopAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const normalizeItem = (item, type) => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    const getFullImageUrl = (url) => {
      if (!url) return '/images/default-placeholder.png';
      return url.startsWith('http') ? url : `${baseUrl}/${url}`;
    };

    switch (type) {
      case 'Album':
        return {
          id: item._id,
          title: item.title,
          imageUrl: getFullImageUrl(item.coverUrl),
        };
      case 'Titre':
        return {
          id: item._id,
          title: item.title,
          imageUrl: getFullImageUrl(item.imageUrl || item.albumCoverUrl),
          albumId: item.albumId,
        };
      case 'Artiste':
        return {
          id: item._id,
          title: item.name,
          imageUrl: getFullImageUrl(item.imageUrl),
        };
      default:
        return item;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const albums = await getAlbumsSortedByPopularity('desc');
        const tracks = await getAudiosSortedByPopularity('desc');
        const artists = await getArtistsSortedByPopularity('desc');

        const albumMap = albums.reduce((acc, album) => {
          acc[album._id] = normalizeItem(album, 'Album');
          return acc;
        }, {});

        setTopAlbums(
          albums.slice(0, 10).map((album) => normalizeItem(album, 'Album'))
        );

        setTopTracks(
          tracks.slice(0, 10).map((track) => {
            const normalizedTrack = normalizeItem(track, 'Titre');
            // Ajouter l'image de l'album si elle n'existe pas
            if (!track.imageUrl && track.album) {
              normalizedTrack.imageUrl =
                albumMap[track.album]?.imageUrl ||
                '/images/default-placeholder.png';
            }
            return normalizedTrack;
          })
        );

        setTopArtists(
          artists.slice(0, 10).map((artist) => normalizeItem(artist, 'Artiste'))
        );
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchData();
  }, []);

  const handleItemClick = (type, id) => {
    setSectionName(type);
    if (type === 'Titre') {
      setSelectedMusicId(id);
    } else {
      setSelectedId(id);
    }
  };

  const renderSection = (title, data, type) => {
    return (
      <div
        className={`${style.section} ${darkMode ? style.dark : style.light}`}
      >
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
  };

  return (
    <div className={style.container}>
      {renderSection('Top 10 Albums', topAlbums, 'Album')}
      {renderSection('Top 10 Titres', topTracks, 'Titre')}
      {renderSection('Top 10 Artistes', topArtists, 'Artiste')}
    </div>
  );
};

export default SectionAccueil;
