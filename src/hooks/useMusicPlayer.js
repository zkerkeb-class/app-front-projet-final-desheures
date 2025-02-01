import { useState, useEffect, useRef } from 'react';
import { getAudioById, getAllAudios } from '@/services/api/audio.api';
import logger from '@/utils/logger';

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

export const useMusicPlayer = (
  selectedMusicId,
  isExpanded,
  setIsExpanded,
  onTrackChange
) => {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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

  // Load initial playlist
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const allAudios = await getAllAudios();
        setPlaylist(allAudios);
      } catch (error) {
        logger.error('Erreur lors du chargement de la playlist:', error);
        setError('Erreur lors du chargement de la playlist');
      }
    };
    loadPlaylist();
  }, []);

  // Persist volume and playback mode
  useEffect(() => {
    localStorage.setItem('audioVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('playbackMode', playbackMode);
  }, [playbackMode]);

  // Load selected audio
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

        const newTrackIndex = playlist.findIndex(
          (track) => track._id === data._id
        );
        if (newTrackIndex !== -1) {
          setCurrentTrackIndex(newTrackIndex);
        }

        setProgress(0);

        // Ensure audio element is properly loaded
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
  }, [selectedMusicId, playlist]);

  // Audio event handlers
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      setProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      );
    };

    const handleError = (e) => {
      setError("Erreur lors de la lecture de l'audio");
      logger.error('Erreur de lecture audio:', e);
      setIsPlaying(false);
    };

    const handleLoadStart = () => setIsLoading(true);

    const handleCanPlay = () => {
      setIsLoading(false);
      audioRef.current.volume = volume / 100;
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      handleTrackEnd();
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('error', handleError);
    audioRef.current.addEventListener('loadstart', handleLoadStart);
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('ended', handleEnded);
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
  }, [volume]);

  // Playback control
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === KEYBOARD_SHORTCUTS.ESCAPE && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
        return;
      }

      let newVolume;
      switch (e.key) {
        case KEYBOARD_SHORTCUTS.SPACE:
          e.preventDefault();
          if (audio) togglePlayPause();
          break;
        case KEYBOARD_SHORTCUTS.ARROW_LEFT:
          e.preventDefault();
          if (audioRef.current) seekBackward();
          break;
        case KEYBOARD_SHORTCUTS.ARROW_RIGHT:
          e.preventDefault();
          if (audioRef.current) seekForward();
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
          if (audio) restartTrack();
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

  const handleTrackEnd = () => {
    switch (playbackMode) {
      case 'repeat-one':
        restartTrack();
        break;
      case 'repeat-all':
        playNextTrack();
        break;
      case 'shuffle':
        playRandomTrack();
        break;
      default:
        if (currentTrackIndex < playlist.length - 1) {
          playNextTrack();
        }
    }
  };

  const playRandomTrack = () => {
    if (playlist.length <= 1) return;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * playlist.length);
    } while (newIndex === currentTrackIndex);

    const nextTrack = playlist[newIndex];
    if (nextTrack) {
      onTrackChange(nextTrack._id);
      setIsPlaying(true);
    }
  };

  const playNextTrack = () => {
    if (playbackMode === 'shuffle') {
      playRandomTrack();
      return;
    }

    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = playbackMode === 'repeat-all' ? 0 : currentTrackIndex;
    }

    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      onTrackChange(nextTrack._id);
      setIsPlaying(true);
    }
  };

  const playPreviousTrack = () => {
    if (playbackMode === 'shuffle') {
      playRandomTrack();
      return;
    }

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playbackMode === 'repeat-all' ? playlist.length - 1 : 0;
    }

    const prevTrack = playlist[prevIndex];
    if (prevTrack) {
      onTrackChange(prevTrack._id);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audio) return;
    setIsPlaying((prev) => !prev);
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

  const seekForward = () => {
    if (!audioRef.current) return;
    const newTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + 5
    );
    audioRef.current.currentTime = newTime;
    setProgress((newTime / audioRef.current.duration) * 100);
  };

  const seekBackward = () => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, audioRef.current.currentTime - 5);
    audioRef.current.currentTime = newTime;
    setProgress((newTime / audioRef.current.duration) * 100);
  };

  const restartTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handlePlaybackModeChange = () => {
    const modes = ['normal', 'repeat-one', 'repeat-all', 'shuffle'];
    const currentIndex = modes.indexOf(playbackMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlaybackMode(modes[nextIndex]);
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

  return {
    audio,
    isPlaying,
    progress,
    volume,
    isMuted,
    error,
    isLoading,
    displayRemaining,
    playbackMode,
    audioRef,
    playlist,
    currentTrackIndex,
    handleProgressChange,
    handleVolumeChange,
    toggleMute,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    handlePlaybackModeChange,
    getTimeDisplay,
    getPlaybackModeIcon,
    toggleTimeDisplay,
    formatTime,
    setError,
  };
};
