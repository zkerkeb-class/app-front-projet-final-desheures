import React, { useState } from 'react';
import style from './page.module.scss';
import { useTheme } from '@/context/ThemeContext.js';

const SectionFiltre = () => {
  const { darkMode } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

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
          <h2 className={style.section_title}>Filtres</h2>
          <div className={style.filter_wrapper}>
            {/* Filtre par durée */}
            <div className={style.filter}>
              <label>Durée</label>
              <select className={style.select_input}>
                <option value="all">Toutes</option>
                <option value="short">1-2 min</option>
                <option value="medium">2-3 min</option>
                <option value="long">3 min +</option>
              </select>
            </div>

            {/* Filtre par artiste */}
            <div className={style.filter}>
              <label>Artiste</label>
              <input
                type="text"
                placeholder="Rechercher un artiste..."
                className={style.select_input}
              />
            </div>

            {/* Filtre par genre */}
            <div className={style.filter}>
              <label>Genre musical</label>
              <select className={style.select_input}>
                <option value="all">Tous</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="rap">Rap</option>
                <option value="electro">Electro</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionFiltre;
