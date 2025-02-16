import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';
import { getAlbumById } from '@/services/api/album.api';
import { getAllSearch } from '@/services/api/search.api';
import logger from '@/utils/logger';
import { useTranslation } from 'react-i18next';

const SectionSearch = () => {
  const {
    darkMode,
    filterSearch,
    setFilterSearch,
    setSelectedId,
    setSelectedMusicId,
    setSectionName,
  } = useTheme();
  const { t } = useTranslation();
  const [topTracks, setTopTracks] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const normalizeItem = (item, type) => {
    const MAX_TITLE_LENGTH = 30;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    const getFullImageUrl = (url) => {
      if (!url) return '/images/default-placeholder.png';
      return url.startsWith('http') ? url : `${baseUrl}/${url}`;
    };

    switch (type) {
      case 'Album':
        return {
          id: item._id,
          title:
            item.title.length > MAX_TITLE_LENGTH
              ? item.title.slice(0, MAX_TITLE_LENGTH) + '...'
              : item.title,
          imageUrl: getFullImageUrl(item.coverUrl),
        };

      case 'Titre': {
        const imageUrl = getFullImageUrl(
          item.album?.coverUrl || item.artist?.imageUrl || null
        );
        return {
          id: item._id,
          title:
            item.title.length > MAX_TITLE_LENGTH
              ? item.title.slice(0, MAX_TITLE_LENGTH) + '...'
              : item.title,
          imageUrl,
          albumId:
            typeof item.album === 'string' ? item.album : item.album?._id,
        };
      }

      case 'Artiste':
        return {
          id: item._id,
          title:
            item.name.length > MAX_TITLE_LENGTH
              ? item.name.slice(0, MAX_TITLE_LENGTH) + '...'
              : item.name,
          imageUrl: getFullImageUrl(item.imageUrl),
        };

      default:
        return item;
    }
  };

  const fetchSearch = async () => {
    try {
      const { artists, albums, tracks } = await getAllSearch(filterSearch);

      // 📌 1. Récupération des albums pour les tracks
      const albumIds = new Set();
      tracks.forEach((track) => {
        if (track.album) {
          const albumId =
            typeof track.album === 'string' ? track.album : track.album._id;
          albumIds.add(albumId);
        }
      });

      // 📌 2. Fetch des albums manquants
      const albumPromises = Array.from(albumIds).map((albumId) =>
        getAlbumById(albumId)
      );
      const albumsData = await Promise.all(albumPromises);

      // 📌 3. Mapping des albums pour une récupération rapide
      const albumMap = albumsData.reduce((acc, album) => {
        if (album) {
          acc[album._id] = {
            _id: album._id,
            coverUrl: album.coverUrl,
            title: album.title,
          };
        }
        return acc;
      }, {});

      // 📌 4. Normalisation des résultats
      const normalizedTracks = tracks.map((track) => {
        if (track.album) {
          const albumId =
            typeof track.album === 'string' ? track.album : track.album._id;
          if (albumId && albumMap[albumId]) {
            track.album = albumMap[albumId]; // Ajout des infos d'album
          }
        }
        return normalizeItem(track, 'Titre');
      });

      const normalizedAlbums = albums.map((album) =>
        normalizeItem(album, 'Album')
      );
      const normalizedArtists = artists.map((artist) =>
        normalizeItem(artist, 'Artiste')
      );

      return {
        tracks: normalizedTracks,
        albums: normalizedAlbums,
        artists: normalizedArtists,
      };
    } catch (error) {
      logger.error('Error fetching search results:', error);
      return { tracks: [], albums: [], artists: [] };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (filterSearch === '') {
          setSectionName('');
          setSelectedId('');
          setFilterSearch('');
          document.getElementById('search_input').value = '';
        }

        const { tracks, albums, artists } = await fetchSearch();
        setTopTracks(tracks);
        setTopAlbums(albums);
        setTopArtists(artists);
      } catch (error) {
        logger.error('Error fetching data:', error);
        setTopTracks([]);
        setTopAlbums([]);
        setTopArtists([]);
      }
    };

    fetchData();
  }, [filterSearch]);

  const handleItemClick = (type, id) => {
    if (type === 'Titre') {
      setSelectedMusicId(id);
    } else {
      setSectionName(type);
      setSelectedId(id);
    }
  };

  const renderSection = (title, data, type) => {
    return (
      <div
        className={`${style.section} ${darkMode ? style.dark : style.light}`}
      >
        <h2 className={style.section_title}>{title}</h2>
        {data.length > 0 ? (
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
        ) : (
          <p>{t('NoResult')}</p>
        )}
      </div>
    );
  };

  return (
    <div className={style.container}>
      {renderSection(t('filterSearchAlbums'), topAlbums, 'Album')}
      {renderSection(t('filterSearchArtists'), topArtists, 'Artiste')}
      {renderSection(t('filterSearchTracks'), topTracks, 'Titre')}
    </div>
  );
};

export default SectionSearch;
