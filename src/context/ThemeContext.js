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

  useEffect(() => {
    logger.info(`Theme initialized: ${darkMode ? 'Dark Mode' : 'Light Mode'}`);
    logger.info(`Loader initialized: ${isLoading ? 'Active' : 'Inactive'}`);
    logger.info(`Section initialized: ${sectionName}`);
    logger.info(`Selected ID initialized: ${selectedId}`);
    logger.info(`Selected Music ID initialized: ${selectedMusicId}`);
    logger.info(`Is Expanded: ${isExpanded}`);
    logger.info(`Language is: ${language}`);
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
        setLanguage : setLanguageLog,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
