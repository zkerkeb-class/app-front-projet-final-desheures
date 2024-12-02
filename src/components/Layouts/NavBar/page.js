import React from 'react';
import Image from 'next/image';
import style from './page.module.scss';
import Logo from 'images/logo/DesHeures_Logo.png';

export default function NavBar({ darkMode, toggleDarkMode }) {
  return (
    <div className={style.navBar}>
      <div className={style.logo}>
        <Image src={Logo.src} alt={`DesHeures`} width={20} height={0} />
        <span>Des Heures</span>
      </div>

      <div className={style.search}>
        <input type="text" placeholder="Rechercher..." />
      </div>

      <button onClick={toggleDarkMode} className={style.darkModeToggle}>
        {darkMode ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
