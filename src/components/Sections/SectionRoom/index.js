import React, { useState } from 'react';
import style from './index.module.scss';
import { useTheme } from '@/context/ThemeContext.js';
import MusicSection from '@/components/Sections/MusicSection/page';
import MusicSectionMulti from '@/components/Sections/MultiMusicSection/page';

const Index = () => {
  const { darkMode } = useTheme();

  const [isMusicMulti, setIsMusicMulti] = useState(false);

  const toggleMusicSection = () => {
    setIsMusicMulti((prev) => !prev);
  };

  return (
    <div className={style.container}>
      <div
        className={`${style.section} ${darkMode ? style.dark : style.light}`}
      >
        {/* Bouton pour ouvrir/fermer les filtres */}
        <button
          onClick={toggleMusicSection}
          className={style.filter_button}
          title={isMusicMulti ? 'Mode Solo' : 'Mode Multi'}
        >
          {isMusicMulti ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                fill="#F8F8FF"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V18C1 18.55 1.45 19 2 19H14C14.55 19 15 18.55 15 18V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C15.05 13.06 15.06 13.08 15.07 13.09C16.21 13.92 17 15.03 17 16.5V18C17 18.35 16.93 18.69 16.82 19H22C22.55 19 23 18.55 23 18V16.5C23 14.17 18.33 13 16 13Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
      {isMusicMulti ? <MusicSectionMulti /> : <MusicSection />}
    </div>
  );
};

export default Index;
