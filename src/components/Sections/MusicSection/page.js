import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { useAudioContext } from '@/hooks/useAudioContext';
import WaveformVisualizer from '@/components/Layouts/WaveformVisualizer';
import Backaground_Img from 'images/background/shadow_lion.png';
import styles from './page.module.scss';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const MusicSection = () => {
  const {
    darkMode,
    isExpanded,
    setIsExpanded,
    selectedMusicId,
    setSelectedMusicId,
  } = useTheme();

  const handleTrackChange = (newTrackId) => {
    setSelectedMusicId(newTrackId);
  };

  const {
    audio,
    isPlaying,
    progress,
    volume,
    isMuted,
    error,
    isLoading,
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
  } = useMusicPlayer(
    selectedMusicId,
    isExpanded,
    setIsExpanded,
    handleTrackChange
  );

  const analyzer = useAudioContext(audioRef);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

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
          <button
            onClick={playPreviousTrack}
            disabled={isLoading || playlist.length <= 1}
            title="Piste précédente"
          >
            ⏮️
          </button>
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !audio}
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button
            onClick={playNextTrack}
            disabled={isLoading || playlist.length <= 1}
            title="Piste suivante"
          >
            ⏭️
          </button>
          <button
            onClick={handlePlaybackModeChange}
            disabled={isLoading || playlist.length <= 1}
            title={`Mode de lecture: ${playbackMode}`}
          >
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
