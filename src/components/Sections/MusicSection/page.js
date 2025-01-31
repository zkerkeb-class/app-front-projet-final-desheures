import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext.js';
import { getAudioById } from '@/services/api/audio.api';
import logger from '@/utils/logger';
import Backaground_Img from 'images/background/shadow_lion.png';
import style from './page.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const MusicSection = () => {
  const { darkMode, isExpanded, setIsExpanded, selectedMusicId } = useTheme();

  // États audio
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // États playlist
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState('normal'); // 'normal', 'repeat-one', 'repeat-all', 'shuffle'

  // Refs
  const audioRef = useRef(null);
  const previousVolume = useRef(50);

  // Chargement initial de l'audio
  useEffect(() => {
    if (!selectedMusicId) return;

    // Pause la musique actuelle
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const fetchAudio = async () => {
      try {
        const data = await getAudioById(selectedMusicId);
        setAudio(data);
        setPlaylist((prev) => {
          if (!prev.find((track) => track.id === data.id)) {
            return [...prev, data];
          }
          return prev;
        });
        // Démarre la nouvelle musique après chargement
        setIsPlaying(true);
      } catch (error) {
        logger.error("Erreur lors de la récupération de l'audio:", error);
      }
    };

    fetchAudio();
  }, [selectedMusicId]);
  // Gestion de l'audio
  useEffect(() => {
    if (!audio || !audioRef.current) return;

    const handleTimeUpdate = () => {
      setProgress(
        audioRef.current.duration
          ? (audioRef.current.currentTime / audioRef.current.duration) * 100
          : 0
      );
    };

    const handleTrackEnd = () => {
      playNextTrack();
    };

    audioRef.current.load();
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleTrackEnd);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [audio]);

  // Auto-play lors du changement d'état de lecture
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handlers
  const handlePlaybackModeChange = () => {
    const modes = ['normal', 'repeat-one', 'repeat-all', 'shuffle'];
    const currentIndex = modes.indexOf(playbackMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlaybackMode(modes[nextIndex]);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = previousVolume.current / 100;
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      audioRef.current.volume = 0;
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current) return;
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;
    const newVolume = e.target.value / 100;
    audioRef.current.volume = newVolume;
    setVolume(e.target.value);
    if (newVolume > 0) setIsMuted(false);
  };

  // Navigation dans la playlist
  const playNextTrack = () => {
    if (playlist.length === 0) return;

    if (playbackMode === 'repeat-one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setIsPlaying(true);
      }
      return;
    }

    let nextIndex;
    if (playbackMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }

    if (
      nextIndex === 0 &&
      playbackMode !== 'repeat-all' &&
      playbackMode !== 'shuffle'
    ) {
      setIsPlaying(false);
      return;
    }

    setCurrentTrackIndex(nextIndex);
    setAudio(playlist[nextIndex]);
  };

  const playPreviousTrack = () => {
    if (playlist.length === 0) return;

    let prevIndex;
    if (playbackMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex =
        currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    }

    setCurrentTrackIndex(prevIndex);
    setAudio(playlist[prevIndex]);
  };

  const getPlaybackModeIcon = () => {
    switch (playbackMode) {
      case 'normal':
        return '🔄';
      case 'repeat-one':
        return '🔂';
      case 'repeat-all':
        return '🔁';
      case 'shuffle':
        return '🔀';
      default:
        return '🔄';
    }
  };
  console.log(audioRef.current);

  // Rendu du composanta
  return (
    <div className={`${style.container} ${isExpanded ? style.expanded : ''}`}>
      <div
        className={`${style.music_section} ${darkMode ? style.dark : style.light}`}
      >
        <button onClick={toggleExpand} className={style.expandButton}>
          {isExpanded ? 'Réduire' : 'Agrandir'}
        </button>

        {/* CD et Visualisation */}
        <div className={`${style.music_CD} ${isPlaying ? style.spinning : ''}`}>
          <Image
            src={
              audio?.album?.coverUrl
                ? `${baseUrl}/${audio.album.coverUrl}`
                : Backaground_Img
            }
            alt={audio?.title || 'Album cover'}
            width={isExpanded ? 400 : 240}
            height={isExpanded ? 400 : 240}
            className={style.image_CD}
            priority
            formats={['webp', 'jpeg', 'avif']}
          />
        </div>

        {/* Informations de la piste */}
        <div className={style.trackDetails}>
          <p className={style.trackTitle}>
            {audio?.title || 'Titre de la musique'}
          </p>
          <p className={style.artist}>
            {audio?.artist?.name || "Nom de l'artiste"}
          </p>
          {isExpanded && audio?.album && (
            <p className={style.album}>{audio.album.name}</p>
          )}
        </div>

        {/* Élément audio */}
        <audio ref={audioRef}>
          {audio && (
            <>
              <source src={`${baseUrl}/${audio.audioUrl}`} type="audio/wav" />
              <source src={`${baseUrl}/${audio.audioUrl}`} type="audio/x-m4a" />
            </>
          )}
        </audio>

        {/* Contrôles de lecture */}
        <div className={style.controls}>
          <button onClick={playPreviousTrack}>&lt;&lt;</button>
          <button onClick={togglePlayPause}>{isPlaying ? '⏸' : '▶️'}</button>
          <button onClick={playNextTrack}>&gt;&gt;</button>
          <button onClick={handlePlaybackModeChange}>
            {getPlaybackModeIcon()}
          </button>
        </div>

        {/* Barre de progression */}
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
            className={style.progressBar}
          />
          <span>
            {audioRef.current?.duration
              ? new Date(audioRef.current.duration * 1000)
                  .toISOString()
                  .substr(14, 5)
              : '00:00'}
          </span>
        </div>

        {/* Contrôle du volume */}
        <div className={style.sound}>
          <button onClick={toggleMute}>
            {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className={style.volumeBar}
          />
          <span>{volume}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicSection;
