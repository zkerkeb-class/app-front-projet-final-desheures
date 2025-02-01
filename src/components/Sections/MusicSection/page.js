/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { getAudioById } from '@/services/api/audio.api';
import logger from '@/utils/logger';
import WaveformVisualizer from '../../Layouts/WaveformVisualizer';
import Backaground_Img from 'images/background/shadow_lion.png';
import styles from './page.module.scss';
import { useAudioContext } from '@/hooks/useAudioContext';

const KEYBOARD_SHORTCUTS = {
  SPACE: ' ',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  M: 'm',
  R: 'r',
  F: 'f',
  ESCAPE: 'Escape',
};

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const MusicSection = () => {
  const { darkMode, isExpanded, setIsExpanded, selectedMusicId } = useTheme();

  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visualizerError, setVisualizerError] = useState(null);
  const [volume, setVolume] = useState(() => {
    return localStorage.getItem('audioVolume')
      ? parseInt(localStorage.getItem('audioVolume'))
      : 50;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayRemaining, setDisplayRemaining] = useState(false);

  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState(() => {
    return localStorage.getItem('playbackMode') || 'normal';
  });

  const audioRef = useRef(null);
  const previousVolume = useRef(volume);

  useEffect(() => {
    localStorage.setItem('audioVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('playbackMode', playbackMode);
  }, [playbackMode]);

  useEffect(() => {
    if (!selectedMusicId) return;

    const loadAudio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const data = await getAudioById(selectedMusicId);
        setAudio(data);
        setPlaylist((prev) => {
          if (!prev.find((track) => track.id === data.id)) {
            return [...prev, data];
          }
          return prev;
        });
        setProgress(0);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
          }
        }, 0);
      } catch (error) {
        setError("Erreur lors du chargement de l'audio");
        logger.error("Erreur lors de la récupération de l'audio:", error);
        setAudio(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [selectedMusicId]);

  // Handle audio events
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;

      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    };

    const handleError = (e) => {
      setError("Erreur lors de la lecture de l'audio");
      logger.error('Erreur de lecture audio:', e);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      audioRef.current.volume = volume / 100;
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('error', handleError);
    audioRef.current.addEventListener('loadstart', handleLoadStart);
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('ended', handleEnded);

    // Set initial volume
    audioRef.current.volume = volume / 100;

    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, [audio, volume]);

  useEffect(() => {
    if (!audioRef.current || !audio) return;

    const playAudio = async () => {
      try {
        if (isPlaying) {
          await audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      } catch (error) {
        logger.error('Error controlling audio playback:', error);
        setIsPlaying(false);
      }
    };

    playAudio();
  }, [isPlaying, audio]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === KEYBOARD_SHORTCUTS.ESCAPE && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
        return;
      }

      if (e.target.tagName === 'INPUT') return;

      let newVolume;

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.SPACE:
          e.preventDefault();
          if (audio) {
            togglePlayPause();
          }
          break;
        case KEYBOARD_SHORTCUTS.ARROW_LEFT:
          e.preventDefault();
          if (audioRef.current) {
            const newTime = Math.max(0, audioRef.current.currentTime - 5);
            audioRef.current.currentTime = newTime;
            setProgress((newTime / audioRef.current.duration) * 100);
          }
          break;
        case KEYBOARD_SHORTCUTS.ARROW_RIGHT:
          e.preventDefault();
          if (audioRef.current) {
            const newTime = Math.min(
              audioRef.current.duration,
              audioRef.current.currentTime + 5
            );
            audioRef.current.currentTime = newTime;
            setProgress((newTime / audioRef.current.duration) * 100);
          }
          break;
        case KEYBOARD_SHORTCUTS.ARROW_UP:
          e.preventDefault();
          newVolume = Math.min(volume + 5, 100);
          handleVolumeChange({ target: { value: newVolume } });
          break;
        case KEYBOARD_SHORTCUTS.ARROW_DOWN:
          e.preventDefault();
          newVolume = Math.max(volume - 5, 0);
          handleVolumeChange({ target: { value: newVolume } });
          break;
        case KEYBOARD_SHORTCUTS.M:
          e.preventDefault();
          toggleMute();
          break;
        case KEYBOARD_SHORTCUTS.R:
          e.preventDefault();
          if (audio) {
            restartTrack();
          }
          break;
        case KEYBOARD_SHORTCUTS.F:
          e.preventDefault();
          setIsExpanded((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [volume, audio, isExpanded, setIsExpanded]);

  const handlePlaybackModeChange = () => {
    const modes = ['normal', 'repeat-one', 'repeat-all', 'shuffle'];
    const currentIndex = modes.indexOf(playbackMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlaybackMode(modes[nextIndex]);
  };

  const restartTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };
  const togglePlayPause = () => {
    if (!audio) return;
    setIsPlaying((prev) => !prev);
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
    if (!audioRef.current || !audioRef.current.duration) return;

    const newValue = parseFloat(e.target.value);
    const newTime = (newValue / 100) * audioRef.current.duration;

    if (!isNaN(newTime) && isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setProgress(newValue);
    }
  };

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return;

    const newVolume = parseInt(e.target.value);
    if (!isNaN(newVolume) && isFinite(newVolume)) {
      audioRef.current.volume = newVolume / 100;
      setVolume(newVolume);
      if (newVolume > 0) setIsMuted(false);
    }
  };

  const playNextTrack = () => {
    return null;
  };

  const playPreviousTrack = () => {
    return null;
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00';
    return new Date(timeInSeconds * 1000).toISOString().slice(14, 19);
  };

  const toggleTimeDisplay = () => {
    setDisplayRemaining(!displayRemaining);
  };

  const getTimeDisplay = () => {
    if (!audioRef.current?.duration) return '00:00';

    const currentTime = audioRef.current.currentTime;
    const duration = audioRef.current.duration;

    if (displayRemaining) {
      return '-' + formatTime(duration - currentTime);
    }
    return formatTime(currentTime);
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
  const analyzer = useAudioContext(audioRef);
  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}>
      <div
        className={`${styles.music_section} ${darkMode ? styles.dark : styles.light}`}
      >
        <button onClick={toggleExpand} className={styles.expandButton}>
          {isExpanded ? 'Réduire' : 'Agrandir'}
        </button>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {isExpanded && analyzer && (
          <div className={styles.waveformContainer}>
            <WaveformVisualizer
              analyzer={analyzer}
              isPlaying={isPlaying}
              darkMode={darkMode}
            />
          </div>
        )}

        <div
          className={`${styles.music_CD} ${isPlaying && !isLoading ? styles.spinning : ''}`}
        >
          {isLoading && <div className={styles.loader}>Chargement...</div>}
          <Image
            src={
              audio?.album?.coverUrl
                ? `${baseUrl}/${audio.album.coverUrl}`
                : Backaground_Img
            }
            alt={audio?.title || 'Album cover'}
            width={isExpanded ? 400 : 240}
            height={isExpanded ? 400 : 240}
            className={styles.image_CD}
            priority
            formats={['webp', 'jpeg', 'avif']}
          />
        </div>

        <div className={styles.trackDetails}>
          <p className={styles.trackTitle}>
            {audio?.title || 'Titre de la musique'}
          </p>
          <p className={styles.artist}>
            {audio?.artist?.name || "Nom de l'artiste"}
          </p>
          {isExpanded && audio?.album && (
            <p className={styles.album}>{audio.album.name}</p>
          )}
        </div>

        <audio ref={audioRef} crossOrigin="anonymous">
          {audio && (
            <>
              <source src={`${baseUrl}/${audio.audioUrl}`} type="audio/wav" />
              <source src={`${baseUrl}/${audio.audioUrl}`} type="audio/x-m4a" />
            </>
          )}
        </audio>

        <div className={styles.controls}>
          <button onClick={playPreviousTrack} disabled={isLoading}>
            &lt;&lt;
          </button>
          <button onClick={togglePlayPause} disabled={isLoading || !audio}>
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button onClick={playNextTrack} disabled={isLoading}>
            &gt;&gt;
          </button>
          <button onClick={handlePlaybackModeChange} disabled={isLoading}>
            {getPlaybackModeIcon()}
          </button>
        </div>

        <div className={styles.progress}>
          <button onClick={toggleTimeDisplay} className={styles.timeDisplay}>
            {getTimeDisplay()}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(progress) ? 0 : progress}
            onChange={handleProgressChange}
            className={styles.progressBar}
            disabled={isLoading}
          />
          <span>{formatTime(audioRef.current?.duration || 0)}</span>
        </div>

        <div className={styles.sound}>
          <button onClick={toggleMute}>
            {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeBar}
          />
          <span>{volume}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicSection;
