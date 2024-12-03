import React from 'react';
// import Image from 'next/image';
import style from './page.module.scss';
// import Logo from 'images/logo/DesHeures_Logo.png';

const NavBar = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className={style.navBar}>
      {/* <div className={style.logo}>
        <span>Des Heures</span>
      </div>

      <div className={style.search}>
        <input type="text" placeholder="Rechercher..." />
      </div> */}

      <button onClick={toggleDarkMode} className={style.darkModeToggle}>
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default NavBar;
