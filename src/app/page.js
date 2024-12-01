'use client';
import { useState } from 'react';

// import Image from 'next/image';
import style from 'styles/page.module.scss';

// import MusicFooter from 'components/Layouts/MusicFooter/page.js';
// import Img_Background from 'images/background/shadow_lion.png';
import NavBar from 'components/Layouts/NavBar/page';

const Home = () => {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div
      className={`${style.global_container} ${darkMode ? style.dark : style.light}`}
    >
      {/* NavBar */}
      <NavBar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      {/* Contenu principal */}
      {/* <main className={style.main}>
        <section>
          <h2>Dernières sorties</h2>
          <div className={style.scrollableRow}>
            {[...Array(10)].map((_, index) => (
              <div key={index} className={style.item}>
                <Image
                  // src={`/images/cover${index + 1}.jpg`}
                  src={Img_Background.src}
                  alt={`Cover ${index + 1}`}
                  width={100}
                  height={100}
                />
                <p>Titre {index + 1}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Artistes populaires</h2>
          <div className={style.scrollableRow}>
            {[...Array(10)].map((_, index) => (
              <div key={index} className={style.item}>
                <img
                  src={`/images/artist${index + 1}.jpg`}
                  alt={`Artiste ${index + 1}`}
                />
                <p>Artiste {index + 1}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Albums récents</h2>
          <div className={style.scrollableRow}>
            {[...Array(10)].map((_, index) => (
              <div key={index} className={style.item}>
                <img
                  src={`/images/album${index + 1}.jpg`}
                  alt={`Album ${index + 1}`}
                />
                <p>Album {index + 1}</p>
              </div>
            ))}
          </div>
        </section>
      </main> */}

      {/* Footer musique */}
      {/* <MusicFooter /> */}
    </div>
  );
};

export default Home;
