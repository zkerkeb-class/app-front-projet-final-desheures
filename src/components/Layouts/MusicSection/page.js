import React, { useEffect, useState, useRef } from 'react';
import style from './page.module.scss';
import Image from 'next/image';
import { useTheme } from '@/app/ThemeContext.js';
import { getAudioById } from '@/services/api/audio.api';

const baseUrl = 'http://localhost:3030';

const MusicSection = () => {
  const { darkMode } = useTheme();
  const { isExpanded, setIsExpanded } = useTheme();
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const data = await getAudioById('6797869d6b1c1eedf0845384');
        setAudio(data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'audio:", error);
      }
    };

    fetchAudio();
  }, []);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    audioRef.current.volume = newVolume;
    setVolume(e.target.value);
  };

  useEffect(() => {
    if (audioRef.current) {
      const updateProgress = () => {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
      };
      audioRef.current.addEventListener('timeupdate', updateProgress);
      return () => {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, []);

  return (
    <div className={`${style.container} ${isExpanded ? style.expanded : ''}`}>
      <div
        className={`${style.music_section} ${darkMode ? style.dark : style.light}`}
      >
        <button onClick={toggleExpand} className={style.expandButton}>
          {isExpanded ? 'Réduire' : 'Agrandir'}
        </button>

        <div className={`${style.music_CD} ${isPlaying ? style.spinning : ''}`}>
          {audio && (
            <Image
              src={
                audio.album?.coverUrl
                  ? `${baseUrl}/${audio.album.coverUrl}`
                  : '/images/default-placeholder.png'
              }
              alt={audio.title}
              width={120}
              height={120}
              className={style.image_CD}
            />
          )}
        </div>

        <div className={style.trackDetails}>
          <p className={style.trackTitle}>
            {audio ? audio.title : 'Titre de la musique'}
          </p>
          <p className={style.artist}>
            {audio ? audio.artist?.name : "Nom de l'artiste"}
          </p>
        </div>

        <audio ref={audioRef}>
          {audio && (
            <source src={`${baseUrl}/${audio.audioUrl}`} type="audio/wav" />
          )}
        </audio>

        <div className={style.controls}>
          <button>&lt;&lt;</button>
          <button onClick={togglePlayPause}>{isPlaying ? '⏸' : '▶️'}</button>
          <button>&gt;&gt;</button>
        </div>

        <div className={style.progress}>
          <span>
            {new Date(
              (progress / 100) * (audioRef.current?.duration || 0) * 1000
            )
              .toISOString()
              .substr(14, 5)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
          />
          <span>
            {new Date((audioRef.current?.duration || 0) * 1000)
              .toISOString()
              .substr(14, 5)}
          </span>
        </div>

        <div className={style.sound}>
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
          />
          <span>{volume}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicSection;
