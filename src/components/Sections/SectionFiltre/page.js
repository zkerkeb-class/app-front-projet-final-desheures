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
          {showFilters ? 'Fermer les filtres' : 'Ouvrir les filtres'}
        </button>
      </div>
      {/* Section des filtres */}
      {showFilters && (
        <div
          className={`${style.filter_section} ${darkMode ? style.dark : style.light}`}
        >
          <h2>Filtres</h2>

          {/* Filtre par durée */}
          <div className={style.filter}>
            <label>Durée :</label>
            <select>
              <option value="all">Toutes</option>
              <option value="short">Moins de 5 min</option>
              <option value="medium">5-10 min</option>
              <option value="long">Plus de 10 min</option>
            </select>
          </div>

          {/* Filtre par artiste */}
          <div className={style.filter}>
            <label>Artiste :</label>
            <input type="text" placeholder="Rechercher un artiste..." />
          </div>

          {/* Filtre par genre */}
          <div className={style.filter}>
            <label>Genre musical :</label>
            <select>
              <option value="all">Tous</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="jazz">Jazz</option>
              <option value="rap">Rap</option>
              <option value="electro">Electro</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionFiltre;
