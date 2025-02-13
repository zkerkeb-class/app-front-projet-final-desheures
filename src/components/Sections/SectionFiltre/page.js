/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';
import { getAllGenres } from '@/services/api/filter.api';
import { getAllArtists } from '@/services/api/artist.api';
import logger from '@/utils/logger';
import { useTranslation } from 'react-i18next';
const SectionFiltre = () => {
  const {
    darkMode,
    setSectionName,
    setFilterDuration,
    setFilterArtist,
    setFilterCategorie,
  } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  const [duration, setDuration] = useState('');
  const [artist, setArtist] = useState('');
  const [categorie, setCategorie] = useState('');
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);

  const handleItemClick = (type) => {
    setSectionName(type);
    setFilterDuration(duration);
    setFilterArtist(artist);
    setFilterCategorie(categorie);
  };

  useEffect(() => {
    if (showFilters) {
      setFilterDuration('');
      setFilterArtist('');
      setFilterCategorie('');

      document.getElementById('select_duration').value = '';
      document.getElementById('select_artist').value = '';
      document.getElementById('select_genre').value = '';
    }
  }, [showFilters]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsData = await getAllArtists();
        setArtists(artistsData);
      } catch (error) {
        logger.error('Erreur lors de la récupération des artistes:', error);
      }
    };
    fetchArtists();
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getAllGenres();
        setGenres(genresData); // Mettre à jour l'état des genres
      } catch (error) {
        logger.error('Erreur lors de la récupération des genres:', error);
      }
    };
    fetchGenres();
  }, []);

  return (
    <div className={style.container}>
      <div
        className={`${style.section} ${darkMode ? style.dark : style.light}`}
      >
        {/* Bouton pour ouvrir/fermer les filtres */}
        <button
          className={style.filter_button}
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 3H5C3.586 3 2.879 3 2.44 3.412C2.001 3.824 2 4.488 2 5.815V6.505C2 7.542 2 8.061 2.26 8.491C2.52 8.921 2.993 9.189 3.942 9.723L6.855 11.363C7.491 11.721 7.81 11.9 8.038 12.098C8.512 12.509 8.804 12.993 8.936 13.588C9 13.872 9 14.206 9 14.873V17.543C9 18.452 9 18.907 9.252 19.261C9.504 19.616 9.952 19.791 10.846 20.141C12.725 20.875 13.664 21.242 14.332 20.824C15 20.406 15 19.452 15 17.542V14.872C15 14.206 15 13.872 15.064 13.587C15.1896 13.0042 15.5059 12.4798 15.963 12.097C16.19 11.9 16.509 11.721 17.145 11.362L20.058 9.722C21.006 9.189 21.481 8.922 21.74 8.492C22 8.062 22 7.542 22 6.504V5.814C22 4.488 22 3.824 21.56 3.412C21.122 3 20.415 3 19 3Z"
              fill="#F8F8FF"
            />
          </svg>
        </button>
      </div>
      {/* Section des filtres */}
      {showFilters && (
        <div
          className={`${style.filter_section} ${darkMode ? style.dark : style.light}`}
        >
          <h2 className={style.section_title}>{t('Filter')}</h2>
          <div className={style.filter_wrapper}>
            {/* Filtre par durée */}
            <div className={style.filter}>
              <label>{t('durationFilter')}</label>
              <select
                id="select_duration"
                className={style.select_input}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">{t('allDuration')}</option>
                <option value="short">0-3 min</option>
                <option value="medium">3-5 min</option>
                <option value="long">5 min +</option>
              </select>
            </div>

            {/* Filtre par artiste */}
            <div className={style.filter}>
              <label>{t('artistFilter')}</label>
              <select
                id="select_artist"
                className={style.select_input}
                onChange={(e) => setArtist(e.target.value)}
              >
                <option value="">{t('allArtist')}</option>
                {artists &&
                  artists.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className={style.filter}>
              <label>{t('genreFilter')}</label>
              <select
                id="select_genre"
                className={style.select_input}
                onChange={(e) => setCategorie(e.target.value)}
              >
                <option value="">Tous</option>
                {genres &&
                  genres.map((genre, index) => (
                    <option key={index} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
              </select>
            </div>

            <button
              className={style.filter_button}
              onClick={() => handleItemClick('Filter')}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.546 5.11107C21.8272 5.39236 21.9852 5.77382 21.9852 6.17157C21.9852 6.56931 21.8272 6.95077 21.546 7.23207L10.303 18.4751C10.1544 18.6237 9.97805 18.7416 9.7839 18.822C9.58976 18.9024 9.38167 18.9438 9.17153 18.9438C8.96138 18.9438 8.75329 18.9024 8.55915 18.822C8.365 18.7416 8.1886 18.6237 8.04003 18.4751L2.45403 12.8901C2.31076 12.7517 2.19649 12.5862 2.11787 12.4032C2.03926 12.2202 1.99788 12.0233 1.99615 11.8242C1.99442 11.625 2.03237 11.4275 2.10779 11.2431C2.18322 11.0588 2.29459 10.8913 2.43543 10.7505C2.57627 10.6096 2.74375 10.4983 2.92809 10.4228C3.11244 10.3474 3.30996 10.3095 3.50913 10.3112C3.7083 10.3129 3.90513 10.3543 4.08813 10.4329C4.27114 10.5115 4.43666 10.6258 4.57503 10.7691L9.17103 15.3651L19.424 5.11107C19.5633 4.97168 19.7287 4.8611 19.9108 4.78566C20.0928 4.71022 20.288 4.67139 20.485 4.67139C20.6821 4.67139 20.8772 4.71022 21.0593 4.78566C21.2413 4.8611 21.4067 4.97168 21.546 5.11107Z"
                  fill="#F8F8FF"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionFiltre;
