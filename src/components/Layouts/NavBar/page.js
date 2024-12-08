import React, { useState } from 'react';
import style from './page.module.scss';

const NavBar = ({ darkMode, toggleDarkMode }) => {
  const [language, setLanguage] = useState('FR');

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value.toUpperCase());
  };

  return (
    <div className={`${style.nav_bar} ${darkMode ? style.dark : style.light}`}>
      {/* App title */}
      <h1 className={style.title_app}>Des Heures #{language}</h1>

      {/* Search Bar */}
      <div className={style.search}>
        <input
          className={style.search_input}
          type="text"
          placeholder="Rechercher..."
        />
      </div>

      <div className={style.nav_bar_button_wrapper}>
        {/* Toggle for Language change */}
        <div className={style.language_selector}>
          <select
            className={style.select_language}
            onChange={handleLanguageChange}
          >
            <option value="FR">FR</option>
            <option value="EN">EN</option>
            <option value="PT">PT</option>
          </select>
        </div>

        {/* Toggle for Dark and Light mode */}
        <label className={style.switch}>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className={style.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default NavBar;
