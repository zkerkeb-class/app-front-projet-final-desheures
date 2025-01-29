import React, { useEffect, useState, useRef } from 'react';
import style from './page.module.scss';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext.js';
import { getAudioById } from '@/services/api/audio.api';
import logger from '@/utils/logger';

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const MusicSection = () => {
  const { darkMode, isExpanded, setIsExpanded, selectedMusicId } = useTheme();
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!selectedMusicId) return;

    const fetchAudio = async () => {
      try {
        const data = await getAudioById(selectedMusicId);
        setAudio(data);
      } catch (error) {
        logger.error("Erreur lors de la récupération de l'audio:", error);
      }
    };

    fetchAudio();
  }, [selectedMusicId]);

  useEffect(() => {
    if (audio && audioRef.current) {
      audioRef.current.load(); // Recharge l'audio avec la nouvelle source
      setIsPlaying(false); // Remet en pause par défaut
    }
  }, [audio]);

  useEffect(() => {
    if (audio && isPlaying) {
      audioRef.current.play();
    }
  }, [audio]);

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
          audioRef.current.duration
            ? (audioRef.current.currentTime / audioRef.current.duration) * 100
            : 0
        );
      };

      audioRef.current.addEventListener('timeupdate', updateProgress);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateProgress);
        }
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
            {audioRef.current?.duration
              ? new Date((progress / 100) * audioRef.current.duration * 1000)
                  .toISOString()
                  .slice(14, 19)
              : '00:00'}
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(progress) ? 0 : progress}
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
