import React, { useState } from 'react';
import style from './page.module.scss';
import { useTheme } from '@/app/ThemeContext.js';
// import { useRouter } from 'next/router';

const NavBar = () => {
  // const router = useRouter();

  const [language, setLanguage] = useState('FR');

  const { darkMode, toggleDarkMode } = useTheme();

  // useEffect(() => {
  //   const { pathname, asPath, query } = router;
  //   router.push({ pathname, query }, asPath, { locale: language });
  // }, [language]);

  return (
    <div className={`${style.nav_bar} ${darkMode ? style.dark : style.light}`}>
      {/* App title */}
      <h1 className={style.title_app}>Des Heures</h1>

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
        <select
          className={style.select_language}
          onChange={(e) => setLanguage(e.target.value.toUpperCase())}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="pt">PT</option>
          <option value="ar">AR</option>
        </select>

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
