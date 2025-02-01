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
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.0789 2.25001C7.28487 2.25001 3.34487 5.91301 2.96087 10.583H1.99987C1.85118 10.5829 1.70582 10.6271 1.58227 10.7098C1.45871 10.7925 1.36253 10.9101 1.30595 11.0476C1.24936 11.1851 1.23492 11.3363 1.26446 11.482C1.29401 11.6277 1.3662 11.7614 1.47187 11.866L3.15187 13.532C3.29232 13.6712 3.48209 13.7494 3.67987 13.7494C3.87764 13.7494 4.06741 13.6712 4.20787 13.532L5.88787 11.866C5.99353 11.7614 6.06572 11.6277 6.09527 11.482C6.12481 11.3363 6.11037 11.1851 6.05378 11.0476C5.9972 10.9101 5.90102 10.7925 5.77746 10.7098C5.65391 10.6271 5.50855 10.5829 5.35987 10.583H4.46687C4.84687 6.75201 8.10487 3.75001 12.0789 3.75001C13.3891 3.74748 14.678 4.08107 15.8225 4.71888C16.967 5.35669 17.9288 6.27741 18.6159 7.39301C18.6661 7.47958 18.7332 7.55521 18.8132 7.61544C18.8932 7.67566 18.9844 7.71928 19.0815 7.7437C19.1785 7.76812 19.2795 7.77286 19.3785 7.75764C19.4774 7.74242 19.5723 7.70755 19.6576 7.65507C19.7428 7.6026 19.8167 7.53359 19.8749 7.45211C19.933 7.37063 19.9743 7.27833 19.9962 7.18066C20.0181 7.08298 20.0203 6.98191 20.0025 6.88338C19.9848 6.78486 19.9475 6.69089 19.8929 6.60701C19.0717 5.27342 17.9223 4.17267 16.5544 3.40988C15.1866 2.64709 13.645 2.24775 12.0789 2.25001ZM20.8409 10.467C20.7005 10.3284 20.5111 10.2506 20.3139 10.2506C20.1166 10.2506 19.9272 10.3284 19.7869 10.467L18.0999 12.133C17.9939 12.2375 17.9214 12.3712 17.8917 12.517C17.8619 12.6628 17.8762 12.8141 17.9327 12.9518C17.9892 13.0894 18.0853 13.2072 18.209 13.29C18.3326 13.3729 18.4781 13.4171 18.6269 13.417H19.5259C19.1439 17.247 15.8749 20.25 11.8819 20.25C10.5676 20.2534 9.27425 19.9203 8.1251 19.2824C6.97594 18.6446 6.00918 17.7232 5.31687 16.606C5.26512 16.5222 5.19738 16.4493 5.11749 16.3917C5.0376 16.334 4.94713 16.2926 4.85125 16.2699C4.75538 16.2472 4.65597 16.2436 4.5587 16.2593C4.46143 16.275 4.36821 16.3098 4.28437 16.3615C4.11502 16.466 3.99413 16.6335 3.94828 16.8271C3.90243 17.0208 3.93537 17.2247 4.03987 17.394C4.86662 18.729 6.0213 19.8301 7.39397 20.5926C8.76665 21.3551 10.3116 21.7535 11.8819 21.75C16.6899 21.75 20.6469 18.09 21.0319 13.417H21.9999C22.1487 13.4171 22.2941 13.3729 22.4178 13.29C22.5414 13.2072 22.6376 13.0894 22.6941 12.9518C22.7506 12.8141 22.7648 12.6628 22.7351 12.517C22.7053 12.3712 22.6328 12.2375 22.5269 12.133L20.8409 10.467Z"
              fill="#F8F8FF"
            />
          </svg>
        );
      case 'repeat-one':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.47 2.46983C8.61063 2.32938 8.80125 2.25049 9 2.25049C9.19875 2.25049 9.38937 2.32938 9.53 2.46983L11.53 4.46983C11.6348 4.57471 11.7061 4.70829 11.735 4.85369C11.7638 4.99909 11.749 5.14979 11.6923 5.28675C11.6356 5.42372 11.5395 5.5408 11.4163 5.62322C11.2931 5.70564 11.1482 5.7497 11 5.74983H9C7.3424 5.74983 5.75268 6.40831 4.58058 7.58041C3.40848 8.75251 2.75 10.3422 2.75 11.9998C2.75 13.6574 3.40848 15.2471 4.58058 16.4192C5.75268 17.5913 7.3424 18.2498 9 18.2498H9.5C9.69891 18.2498 9.88968 18.3288 10.0303 18.4695C10.171 18.6101 10.25 18.8009 10.25 18.9998C10.25 19.1987 10.171 19.3895 10.0303 19.5302C9.88968 19.6708 9.69891 19.7498 9.5 19.7498H9C6.94457 19.7498 4.97333 18.9333 3.51992 17.4799C2.06652 16.0265 1.25 14.0553 1.25 11.9998C1.25 9.9444 2.06652 7.97316 3.51992 6.51975C4.97333 5.06634 6.94457 4.24983 9 4.24983H9.19L8.47 3.52983C8.32955 3.3892 8.25066 3.19858 8.25066 2.99983C8.25066 2.80108 8.32955 2.61045 8.47 2.46983ZM13.75 4.99983C13.75 4.80092 13.829 4.61015 13.9697 4.4695C14.1103 4.32885 14.3011 4.24983 14.5 4.24983H15C17.0554 4.24983 19.0267 5.06634 20.4801 6.51975C21.9335 7.97316 22.75 9.9444 22.75 11.9998C22.75 14.0553 21.9335 16.0265 20.4801 17.4799C19.0267 18.9333 17.0554 19.7498 15 19.7498H14.81L15.53 20.4698C15.6037 20.5385 15.6628 20.6213 15.7038 20.7133C15.7448 20.8053 15.7668 20.9046 15.7686 21.0053C15.7704 21.106 15.7518 21.206 15.7141 21.2994C15.6764 21.3928 15.6203 21.4776 15.549 21.5489C15.4778 21.6201 15.393 21.6762 15.2996 21.714C15.2062 21.7517 15.1062 21.7702 15.0055 21.7684C14.9048 21.7666 14.8055 21.7446 14.7135 21.7036C14.6215 21.6626 14.5387 21.6035 14.47 21.5298L12.47 19.5298C12.3652 19.4249 12.2939 19.2914 12.265 19.146C12.2362 19.0006 12.251 18.8499 12.3077 18.7129C12.3644 18.5759 12.4605 18.4589 12.5837 18.3764C12.7069 18.294 12.8518 18.25 13 18.2498H15C16.6576 18.2498 18.2473 17.5913 19.4194 16.4192C20.5915 15.2471 21.25 13.6574 21.25 11.9998C21.25 10.3422 20.5915 8.75251 19.4194 7.58041C18.2473 6.40831 16.6576 5.74983 15 5.74983H14.5C14.3011 5.74983 14.1103 5.67081 13.9697 5.53016C13.829 5.38951 13.75 5.19874 13.75 4.99983Z"
              fill="#F8F8FF"
            />
          </svg>
        );
      case 'repeat-all':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.47 2.46983C8.61063 2.32938 8.80125 2.25049 9 2.25049C9.19875 2.25049 9.38937 2.32938 9.53 2.46983L11.53 4.46983C11.6348 4.57471 11.7061 4.70829 11.735 4.85369C11.7638 4.99909 11.749 5.14979 11.6923 5.28675C11.6356 5.42372 11.5395 5.5408 11.4163 5.62322C11.2931 5.70564 11.1482 5.7497 11 5.74983H9C7.3424 5.74983 5.75268 6.40831 4.58058 7.58041C3.40848 8.75251 2.75 10.3422 2.75 11.9998C2.75 13.6574 3.40848 15.2471 4.58058 16.4192C5.75268 17.5913 7.3424 18.2498 9 18.2498H9.5C9.69891 18.2498 9.88968 18.3288 10.0303 18.4695C10.171 18.6101 10.25 18.8009 10.25 18.9998C10.25 19.1987 10.171 19.3895 10.0303 19.5302C9.88968 19.6708 9.69891 19.7498 9.5 19.7498H9C6.94457 19.7498 4.97333 18.9333 3.51992 17.4799C2.06652 16.0265 1.25 14.0553 1.25 11.9998C1.25 9.9444 2.06652 7.97316 3.51992 6.51975C4.97333 5.06634 6.94457 4.24983 9 4.24983H9.19L8.47 3.52983C8.32955 3.3892 8.25066 3.19858 8.25066 2.99983C8.25066 2.80108 8.32955 2.61045 8.47 2.46983ZM13.75 4.99983C13.75 4.80092 13.829 4.61015 13.9697 4.4695C14.1103 4.32885 14.3011 4.24983 14.5 4.24983H15C17.0554 4.24983 19.0267 5.06634 20.4801 6.51975C21.9335 7.97316 22.75 9.9444 22.75 11.9998C22.75 14.0553 21.9335 16.0265 20.4801 17.4799C19.0267 18.9333 17.0554 19.7498 15 19.7498H14.81L15.53 20.4698C15.6037 20.5385 15.6628 20.6213 15.7038 20.7133C15.7448 20.8053 15.7668 20.9046 15.7686 21.0053C15.7704 21.106 15.7518 21.206 15.7141 21.2994C15.6764 21.3928 15.6203 21.4776 15.549 21.5489C15.4778 21.6201 15.393 21.6762 15.2996 21.714C15.2062 21.7517 15.1062 21.7702 15.0055 21.7684C14.9048 21.7666 14.8055 21.7446 14.7135 21.7036C14.6215 21.6626 14.5387 21.6035 14.47 21.5298L12.47 19.5298C12.3652 19.4249 12.2939 19.2914 12.265 19.146C12.2362 19.0006 12.251 18.8499 12.3077 18.7129C12.3644 18.5759 12.4605 18.4589 12.5837 18.3764C12.7069 18.294 12.8518 18.25 13 18.2498H15C16.6576 18.2498 18.2473 17.5913 19.4194 16.4192C20.5915 15.2471 21.25 13.6574 21.25 11.9998C21.25 10.3422 20.5915 8.75251 19.4194 7.58041C18.2473 6.40831 16.6576 5.74983 15 5.74983H14.5C14.3011 5.74983 14.1103 5.67081 13.9697 5.53016C13.829 5.38951 13.75 5.19874 13.75 4.99983Z"
              fill="#F8F8FF"
            />
          </svg>
        );
      case 'shuffle':
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 16.2502C1.80109 16.2502 1.61032 16.3292 1.46967 16.4698C1.32902 16.6105 1.25 16.8012 1.25 17.0002C1.25 17.1991 1.32902 17.3898 1.46967 17.5305C1.61032 17.6711 1.80109 17.7502 2 17.7502V16.2502ZM22 7.00015L22.53 7.53015C22.6705 7.38953 22.7493 7.1989 22.7493 7.00015C22.7493 6.8014 22.6705 6.61078 22.53 6.47015L22 7.00015ZM19.47 8.47015C19.3375 8.61233 19.2654 8.80037 19.2688 8.99468C19.2723 9.18898 19.351 9.37436 19.4884 9.51178C19.6258 9.64919 19.8112 9.7279 20.0055 9.73133C20.1998 9.73476 20.3878 9.66263 20.53 9.53015L19.47 8.47015ZM20.53 4.47015C20.4613 4.39647 20.3785 4.33736 20.2865 4.29637C20.1945 4.25538 20.0952 4.23334 19.9945 4.23156C19.8938 4.22979 19.7938 4.24831 19.7004 4.28603C19.607 4.32375 19.5222 4.3799 19.451 4.45112C19.3797 4.52233 19.3236 4.60717 19.2859 4.70056C19.2482 4.79394 19.2296 4.89397 19.2314 4.99468C19.2332 5.09538 19.2552 5.19469 19.2962 5.28669C19.3372 5.37869 19.3963 5.46149 19.47 5.53015L20.53 4.47015ZM2 17.7502H5.603V16.2502H2V17.7502ZM11.39 14.4732L13.895 10.2992L12.609 9.52715L10.105 13.7012L11.39 14.4732ZM18.397 7.75015H22V6.25015H18.397V7.75015ZM21.47 6.47015L19.47 8.47015L20.53 9.53015L22.53 7.53015L21.47 6.47015ZM22.53 6.47015L20.53 4.47015L19.47 5.53015L21.47 7.53015L22.53 6.47015ZM13.895 10.2992C14.329 9.57515 14.629 9.07915 14.901 8.71015C15.164 8.35515 15.369 8.16715 15.59 8.04215L14.851 6.73715C14.384 7.00115 14.031 7.36415 13.696 7.81715C13.37 8.25715 13.028 8.82815 12.609 9.52715L13.895 10.2992ZM18.397 6.25015C17.582 6.25015 16.917 6.25015 16.372 6.30215C15.81 6.35715 15.318 6.47215 14.851 6.73715L15.59 8.04215C15.81 7.91715 16.077 7.83815 16.517 7.79515C16.973 7.75115 17.553 7.75015 18.397 7.75015V6.25015ZM5.603 17.7502C6.418 17.7502 7.083 17.7502 7.628 17.6982C8.19 17.6432 8.682 17.5282 9.149 17.2632L8.41 15.9582C8.19 16.0832 7.923 16.1622 7.483 16.2052C7.027 16.2492 6.447 16.2502 5.603 16.2502V17.7502ZM10.105 13.7012C9.67 14.4252 9.371 14.9212 9.099 15.2902C8.836 15.6452 8.631 15.8332 8.41 15.9582L9.149 17.2632C9.615 16.9992 9.969 16.6362 10.304 16.1832C10.63 15.7432 10.971 15.1722 11.39 14.4732L10.105 13.7012ZM2 6.25015C1.80109 6.25015 1.61032 6.32917 1.46967 6.46982C1.32902 6.61048 1.25 6.80124 1.25 7.00015C1.25 7.19907 1.32902 7.38983 1.46967 7.53048C1.61032 7.67114 1.80109 7.75015 2 7.75015V6.25015ZM22 17.0002L22.53 17.5302C22.6705 17.3895 22.7493 17.1989 22.7493 17.0002C22.7493 16.8014 22.6705 16.6108 22.53 16.4702L22 17.0002ZM20.53 14.4702C20.4613 14.3965 20.3785 14.3374 20.2865 14.2964C20.1945 14.2554 20.0952 14.2333 19.9945 14.2316C19.8938 14.2298 19.7938 14.2483 19.7004 14.286C19.607 14.3238 19.5222 14.3799 19.451 14.4511C19.3797 14.5223 19.3236 14.6072 19.2859 14.7006C19.2482 14.7939 19.2296 14.894 19.2314 14.9947C19.2332 15.0954 19.2552 15.1947 19.2962 15.2867C19.3372 15.3787 19.3963 15.4615 19.47 15.5302L20.53 14.4702ZM19.47 18.4702C19.3963 18.5388 19.3372 18.6216 19.2962 18.7136C19.2552 18.8056 19.2332 18.9049 19.2314 19.0056C19.2296 19.1063 19.2482 19.2064 19.2859 19.2998C19.3236 19.3931 19.3797 19.478 19.451 19.5492C19.5222 19.6204 19.607 19.6766 19.7004 19.7143C19.7938 19.752 19.8938 19.7705 19.9945 19.7687C20.0952 19.767 20.1945 19.7449 20.2865 19.7039C20.3785 19.6629 20.4613 19.6038 20.53 19.5302L19.47 18.4702ZM14.443 14.6152C14.3945 14.5267 14.3287 14.4488 14.2494 14.3864C14.1701 14.3239 14.0791 14.2781 13.9817 14.2517C13.8843 14.2253 13.7826 14.2187 13.6826 14.2325C13.5827 14.2463 13.4865 14.2802 13.4 14.332C13.3134 14.3839 13.2381 14.4526 13.1788 14.5342C13.1194 14.6158 13.0771 14.7086 13.0544 14.8069C13.0317 14.9052 13.0291 15.0071 13.0468 15.1065C13.0644 15.2058 13.1019 15.3006 13.157 15.3852L14.443 14.6152ZM9.557 9.38615C9.66039 9.55458 9.82607 9.67539 10.018 9.72233C10.21 9.76927 10.4128 9.73854 10.5822 9.63683C10.7516 9.53511 10.8741 9.37062 10.9229 9.17913C10.9718 8.98763 10.943 8.78459 10.843 8.61415L9.557 9.38615ZM2 7.75015H6.668V6.25015H2V7.75015ZM17.332 17.7502H22V16.2502H17.332V17.7502ZM22.53 16.4702L20.53 14.4702L19.47 15.5302L21.47 17.5302L22.53 16.4702ZM21.47 16.4702L19.47 18.4702L20.53 19.5302L22.53 17.5302L21.47 16.4702ZM17.332 16.2502C16.687 16.2502 16.465 16.2472 16.269 16.2092L15.982 17.6812C16.354 17.7532 16.747 17.7502 17.332 17.7502V16.2502ZM13.157 15.3852C13.457 15.8872 13.657 16.2262 13.911 16.5082L15.026 15.5052C14.892 15.3562 14.776 15.1682 14.443 14.6152L13.157 15.3852ZM16.269 16.2092C15.7892 16.1157 15.3529 15.8686 15.026 15.5052L13.911 16.5082C14.4556 17.1137 15.1826 17.5254 15.982 17.6812L16.269 16.2092ZM6.668 7.75015C7.313 7.75015 7.535 7.75315 7.731 7.79115L8.018 6.31915C7.646 6.24715 7.253 6.25015 6.668 6.25015V7.75015ZM10.843 8.61415C10.543 8.11215 10.343 7.77415 10.089 7.49215L8.974 8.49515C9.108 8.64415 9.224 8.83315 9.557 9.38615L10.843 8.61415ZM7.731 7.79115C8.211 7.88515 8.647 8.13115 8.974 8.49515L10.089 7.49215C9.54436 6.88664 8.81739 6.47489 8.018 6.31915L7.731 7.79115Z"
              fill="#F8F8FF"
            />
          </svg>
        );
      default:
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.0789 2.25001C7.28487 2.25001 3.34487 5.91301 2.96087 10.583H1.99987C1.85118 10.5829 1.70582 10.6271 1.58227 10.7098C1.45871 10.7925 1.36253 10.9101 1.30595 11.0476C1.24936 11.1851 1.23492 11.3363 1.26446 11.482C1.29401 11.6277 1.3662 11.7614 1.47187 11.866L3.15187 13.532C3.29232 13.6712 3.48209 13.7494 3.67987 13.7494C3.87764 13.7494 4.06741 13.6712 4.20787 13.532L5.88787 11.866C5.99353 11.7614 6.06572 11.6277 6.09527 11.482C6.12481 11.3363 6.11037 11.1851 6.05378 11.0476C5.9972 10.9101 5.90102 10.7925 5.77746 10.7098C5.65391 10.6271 5.50855 10.5829 5.35987 10.583H4.46687C4.84687 6.75201 8.10487 3.75001 12.0789 3.75001C13.3891 3.74748 14.678 4.08107 15.8225 4.71888C16.967 5.35669 17.9288 6.27741 18.6159 7.39301C18.6661 7.47958 18.7332 7.55521 18.8132 7.61544C18.8932 7.67566 18.9844 7.71928 19.0815 7.7437C19.1785 7.76812 19.2795 7.77286 19.3785 7.75764C19.4774 7.74242 19.5723 7.70755 19.6576 7.65507C19.7428 7.6026 19.8167 7.53359 19.8749 7.45211C19.933 7.37063 19.9743 7.27833 19.9962 7.18066C20.0181 7.08298 20.0203 6.98191 20.0025 6.88338C19.9848 6.78486 19.9475 6.69089 19.8929 6.60701C19.0717 5.27342 17.9223 4.17267 16.5544 3.40988C15.1866 2.64709 13.645 2.24775 12.0789 2.25001ZM20.8409 10.467C20.7005 10.3284 20.5111 10.2506 20.3139 10.2506C20.1166 10.2506 19.9272 10.3284 19.7869 10.467L18.0999 12.133C17.9939 12.2375 17.9214 12.3712 17.8917 12.517C17.8619 12.6628 17.8762 12.8141 17.9327 12.9518C17.9892 13.0894 18.0853 13.2072 18.209 13.29C18.3326 13.3729 18.4781 13.4171 18.6269 13.417H19.5259C19.1439 17.247 15.8749 20.25 11.8819 20.25C10.5676 20.2534 9.27425 19.9203 8.1251 19.2824C6.97594 18.6446 6.00918 17.7232 5.31687 16.606C5.26512 16.5222 5.19738 16.4493 5.11749 16.3917C5.0376 16.334 4.94713 16.2926 4.85125 16.2699C4.75538 16.2472 4.65597 16.2436 4.5587 16.2593C4.46143 16.275 4.36821 16.3098 4.28437 16.3615C4.11502 16.466 3.99413 16.6335 3.94828 16.8271C3.90243 17.0208 3.93537 17.2247 4.03987 17.394C4.86662 18.729 6.0213 19.8301 7.39397 20.5926C8.76665 21.3551 10.3116 21.7535 11.8819 21.75C16.6899 21.75 20.6469 18.09 21.0319 13.417H21.9999C22.1487 13.4171 22.2941 13.3729 22.4178 13.29C22.5414 13.2072 22.6376 13.0894 22.6941 12.9518C22.7506 12.8141 22.7648 12.6628 22.7351 12.517C22.7053 12.3712 22.6328 12.2375 22.5269 12.133L20.8409 10.467Z"
              fill="#F8F8FF"
            />
          </svg>
        );
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
