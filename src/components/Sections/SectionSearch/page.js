import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';
import {
  getTracksByDuration,
  getTracksByGenre,
  getTracksByArtist,
  getAlbumsByArtist,
  getAlbumsByGenre,
  getArtistsByGenre,
} from '@/services/api/filter.api';
import { getArtistById } from '@/services/api/artist.api';
import logger from '@/utils/logger';

const SectionSearch = () => {
  const {
    darkMode,
    setSectionName,
    setSelectedId,
    setSelectedMusicId,
    filterArtist,
    filterCategorie,
    filterDuration,
    setFilterDuration,
    setFilterArtist,
    setFilterCategorie,
    setFilterSearch,
  } = useTheme();

  const [topAlbums, setTopAlbums] = useState([]);
  const [topArtist, setTopArtist] = useState([]);
  const [topTrack, setTopTrack] = useState([]);

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

  const fetchArtists = async () => {
    const promises = [];
    const seenIds = new Set();
    const uniqueArtist = [];

    if (filterCategorie !== '') {
      const genreArtist = await getArtistsByGenre(filterCategorie);
      promises.push(genreArtist);
    }

    if (filterArtist !== '') {
      const artistArtist = await getArtistById(filterArtist);
      promises.push(artistArtist);
    }

    const results = await Promise.all(promises);
    const allArtist = results.flat();

    allArtist.forEach((artist) => {
      if (!seenIds.has(artist._id)) {
        seenIds.add(artist._id);
        uniqueArtist.push(artist);
      }
    });

    return uniqueArtist;
  };

  const fetchAlbums = async () => {
    const promises = [];
    const seenIds = new Set();
    const uniqueAlbums = [];

    if (filterCategorie !== '') {
      const genreAlbums = await getAlbumsByGenre(filterCategorie);
      promises.push(genreAlbums);
    }

    if (filterArtist !== '') {
      const artistAlbums = await getAlbumsByArtist(filterArtist);
      promises.push(artistAlbums);
    }

    const results = await Promise.all(promises);
    const allAlbums = results.flat();

    allAlbums.forEach((album) => {
      if (!seenIds.has(album._id)) {
        seenIds.add(album._id);
        uniqueAlbums.push(album);
      }
    });

    return uniqueAlbums;
  };

  const fetchTrack = async () => {
    const promises = [];
    const seenIds = new Set();
    const uniqueTrack = [];

    if (filterCategorie !== '') {
      const genreTrack = await getTracksByGenre(filterCategorie);
      promises.push(genreTrack);
    }

    if (filterArtist !== '') {
      const artistTrack = await getTracksByArtist(filterArtist);
      promises.push(artistTrack);
    }

    if (filterDuration !== '') {
      const trackTrack = await getTracksByDuration(filterDuration);
      promises.push(trackTrack);
    }

    const results = await Promise.all(promises);
    const allTracks = results.flat();

    allTracks.forEach((track) => {
      if (!seenIds.has(track._id)) {
        seenIds.add(track._id);
        uniqueTrack.push(track);
      }
    });

    return uniqueTrack;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          filterArtist == '' &&
          filterDuration == '' &&
          filterCategorie == ''
        ) {
          setSectionName('');
          setSelectedId('');
          setFilterDuration('');
          setFilterArtist('');
          setFilterCategorie('');
          setFilterSearch('');

          document.getElementById('search_input').value = '';
          document.getElementById('select_duration').value = '';
          document.getElementById('select_artist').value = '';
          document.getElementById('select_genre').value = '';
        }

        const albums = await fetchAlbums();
        if (albums?.length) {
          const normalizedAlbums = albums.map((album) =>
            normalizeItem(album, 'Album')
          );
          setTopAlbums(normalizedAlbums);
        } else {
          setTopAlbums([]);
        }

        const artists = await fetchArtists();
        if (artists?.length) {
          const normalizedArtist = artists.map((artist) =>
            normalizeItem(artist, 'Artiste')
          );
          setTopArtist(normalizedArtist);
        } else {
          setTopArtist([]);
        }

        // const albumMap = albums.reduce((acc, album) => {
        //   acc[album._id] = normalizeItem(album, 'Album');
        //   return acc;
        // }, {});

        const tracks = await fetchTrack();
        if (tracks?.length) {
          // const normalizedTrack = tracks.map((track) => {
          //   normalizeItem(track, 'Titre');
          //   if (!track.imageUrl && track.album) {
          //     normalizedTrack.imageUrl = '/images/default-placeholder.png';
          //     // normalizedTrack.imageUrl =
          //     //   albumMap[track.album]?.imageUrl ||
          //     //   '/images/default-placeholder.png';
          //   }
          // });
          const normalizedTrack = tracks.map((track) =>
            normalizeItem(track, 'Titre')
          );

          setTopTrack(normalizedTrack);
        } else {
          setTopTrack([]);
        }
      } catch (error) {
        logger.error('Error fetching data:', error);
        setTopAlbums([]);
        setTopArtist([]);
        setTopTrack([]);
      }
    };

    fetchData();
  }, [filterCategorie, filterArtist, filterDuration]);

  const handleItemClick = (type, id) => {
    if (type === 'Titre') {
      setSelectedMusicId(id);
    } else {
      setSectionName(type);
      setSelectedId(id);
    }
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
      {renderSection('Albums associés à la recherche', topAlbums, 'Album')}
      {renderSection('Artiste associés à la recherche', topArtist, 'Artiste')}
      {renderSection('Titre associés à la recherche', topTrack, 'Titre')}
    </div>
  );
};

export default SectionSearch;
