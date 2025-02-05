import React, { createContext, useContext, useState, useEffect } from 'react';
import logger from '@/utils/logger'; // Importation du logger

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setLoader] = useState(true);
  const [sectionName, setSectionName] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState(false);
  const [filterDuration, setFilterDuration] = useState('all');
  const [filterArtist, setFilterArtist] = useState('all');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    logger.info(`Theme initialized: ${darkMode ? 'Dark Mode' : 'Light Mode'}`);
    logger.info(`Loader initialized: ${isLoading ? 'Active' : 'Inactive'}`);
    logger.info(`Section initialized: ${sectionName}`);
    logger.info(`Selected ID initialized: ${selectedId}`);
    logger.info(`Selected Music ID initialized: ${selectedMusicId}`);
    logger.info(`Is Expanded: ${isExpanded}`);
    logger.info(`Language is: ${language}`);
    logger.info(`Filter duration: ${filterDuration}`);
    logger.info(`Filter Artist: ${filterArtist}`);
    logger.info(`Filter Categorie: ${filterCategorie}`);
    logger.info(`Filter Search: ${filterSearch}`);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;

      logger.info(`Dark mode toggled to: ${newMode ? 'Enabled' : 'Disabled'}`);
      return newMode;
    });
  };

  const setLoaderWithLog = (state) => {
    logger.info(`Loader state changed to: ${state ? 'Active' : 'Inactive'}`);
    setLoader(state);
  };

  const setSectionNameWithLog = (name) => {
    logger.info(`Section name changed to: ${name}`);
    setSectionName(name);
  };

  const setSelectedIdWithLog = (id) => {
    logger.info(`Selected ID changed to: ${id}`);
    setSelectedId(id);
  };

  const setSelectedMusicIdWithLog = (id) => {
    logger.info(`Selected Music ID changed to: ${id}`);
    setSelectedMusicId(id);
  };

  const setIsExpandedLog = (bool) => {
    logger.info(`Is Expanded changed to: ${bool}`);
    setIsExpanded(bool);
  };

  const setLanguageLog = (name) => {
    logger.info(`Language changed to: ${name}`);
    setLanguage(name);
  };

  const setFilterDurationLog = (name) => {
    logger.info(`Filter Duration changed to: ${name}`);
    setFilterDuration(name);
  };

  const setFilterArtistLog = (name) => {
    logger.info(`Filter Artist changed to: ${name}`);
    setFilterArtist(name);
  };

  const setFilterCategorieLog = (name) => {
    logger.info(`Filter Categorie changed to: ${name}`);
    setFilterCategorie(name);
  };

  const setFilterSearchLog = (name) => {
    logger.info(`Filter Search changed to: ${name}`);
    setFilterSearch(name);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        isLoading,
        setLoader: setLoaderWithLog,
        sectionName,
        setSectionName: setSectionNameWithLog,
        selectedId,
        setSelectedId: setSelectedIdWithLog,
        selectedMusicId,
        setSelectedMusicId: setSelectedMusicIdWithLog,
        isExpanded,
        setIsExpanded: setIsExpandedLog,
        language,
        setLanguage: setLanguageLog,
        filterDuration,
        setFilterDuration: setFilterDurationLog,
        filterArtist,
        setFilterArtist: setFilterArtistLog,
        filterCategorie,
        setFilterCategorie: setFilterCategorieLog,
        filterSearch,
        setFilterSearch: setFilterSearchLog,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
