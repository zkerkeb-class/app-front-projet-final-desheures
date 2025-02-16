import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';
import {
  getAudiosSortedByPopularity,
  getAlbumsSortedByPopularity,
  getArtistsSortedByPopularity,
} from '@/services/api/sort.api';
import { getAudioById } from '@/services/api/audio.api';
import socketService from '@/services/sockets/socketsService';
import logger from '@/utils/logger';
import { useTranslation } from 'react-i18next';
const SectionAccueil = () => {
  const { darkMode, setSectionName, setSelectedId, setSelectedMusicId } =
    useTheme();
  const { t } = useTranslation();
  const [topAlbums, setTopAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState([]);
  const [mostPlayedTracks, setMostPlayedTracks] = useState([]);

  const normalizeItem = (item, type) => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    const getFullImageUrl = (url) => {
      if (!url) return '/images/default-placeholder.png';
      return url.startsWith('http') ? url : `${baseUrl}/${url}`;
    };
    const MAX_TITLE_LENGTH = 30;

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
      case 'Titre':
        return {
          id: item._id,
          title:
            item.title.length > MAX_TITLE_LENGTH
              ? item.title.slice(0, MAX_TITLE_LENGTH) + '...'
              : item.title,
          // Priorité à l'image de l'album, puis à l'image de l'artiste, puis placeholder
          imageUrl: getFullImageUrl(
            item.album?.coverUrl ||
              item.artist?.imageUrl ||
              '/images/default-placeholder.png'
          ),
          albumId: item.album?._id,
        };
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

  useEffect(() => {
    const socket = socketService.connect();

    const fetchData = async () => {
      try {
        const [albums, tracks, artists] = await Promise.all([
          getAlbumsSortedByPopularity('desc'),
          getAudiosSortedByPopularity('desc'),
          getArtistsSortedByPopularity('desc'),
        ]);

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
        logger.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchData();

    socket.on('recentlyPlayedUpdated', () => {
      socket.emit('getRecentlyPlayed');
    });
    socket.on('recentlyPlayedTracks', async (tracks) => {
      try {
        if (Array.isArray(tracks)) {
          const tracksData = await Promise.all(
            tracks.map((track) => getAudioById(track._id))
          );
          setRecentlyPlayedTracks(
            tracksData.map((track) => normalizeItem(track, 'Titre'))
          );
        } else {
          setRecentlyPlayedTracks([]);
        }
      } catch (error) {
        logger.error('Erreur récupération dernières écoutes:', error);
        setRecentlyPlayedTracks([]);
      }
    });

    socket.on('mostPlayedUpdated', () => {
      socket.emit('getMostPlayed');
    });

    socket.on('mostPlayedTracks', async (tracks) => {
      try {
        if (Array.isArray(tracks)) {
          const tracksData = await Promise.all(
            tracks.map((track) => getAudioById(track._id))
          );
          setMostPlayedTracks(
            tracksData.map((track) => normalizeItem(track, 'Titre'))
          );
        } else {
          setMostPlayedTracks([]);
        }
      } catch (error) {
        logger.error('Erreur récupération titres plus écoutés:', error);
        setMostPlayedTracks([]);
      }
    });

    socket.emit('getRecentlyPlayed');
    socket.emit('getMostPlayed');

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleItemClick = (type, id) => {
    if (type === 'Titre') {
      setSelectedMusicId(id);
      socketService.emit('playTrack', id);
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
      {renderSection(t('topAlbums'), topAlbums, 'Album')}
      {renderSection(t('topArtists'), topTracks, 'Titre')}
      {renderSection(t('topTracks'), topArtists, 'Artiste')}
      {renderSection(t('lastListened'), recentlyPlayedTracks, 'Titre')}
      {renderSection(t('mostListened'), mostPlayedTracks, 'Titre')}
    </div>
  );
};

export default SectionAccueil;
