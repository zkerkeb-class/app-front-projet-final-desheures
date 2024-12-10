import React, { createContext, useContext, useState, useEffect } from 'react';
import logger from '@/utils/logger'; // Importation du logger

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setLoader] = useState(true);

  // Log l'état initial du thème et du loader lors du montage
  useEffect(() => {
    logger.info(`Theme initialized: ${darkMode ? 'Dark Mode' : 'Light Mode'}`);
    logger.info(`Loader initialized: ${isLoading ? 'Active' : 'Inactive'}`);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;

      // Log chaque changement de mode
      logger.info(`Dark mode toggled to: ${newMode ? 'Enabled' : 'Disabled'}`);
      return newMode;
    });
  };

  // Log les changements d'état du loader
  const setLoaderWithLog = (state) => {
    logger.info(`Loader state changed to: ${state ? 'Active' : 'Inactive'}`);
    setLoader(state);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        isLoading,
        setLoader: setLoaderWithLog,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
