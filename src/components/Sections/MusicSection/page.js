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
            className={styles.interactTrack}
            disabled={isLoading || playlist.length <= 1}
            title="Piste précédente"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.25 3.75V16.25C16.2501 16.3737 16.2135 16.4946 16.1448 16.5975C16.0762 16.7004 15.9785 16.7805 15.8642 16.8279C15.75 16.8752 15.6242 16.8876 15.5029 16.8635C15.3816 16.8393 15.2702 16.7797 15.1828 16.6922L10 11.5086V16.25C10.0001 16.3737 9.9635 16.4946 9.89483 16.5975C9.82616 16.7004 9.72851 16.7805 9.61425 16.8279C9.49998 16.8752 9.37424 16.8876 9.25294 16.8635C9.13163 16.8393 9.02023 16.7797 8.93282 16.6922L2.68282 10.4422C2.62471 10.3841 2.57861 10.3152 2.54715 10.2393C2.5157 10.1635 2.49951 10.0821 2.49951 10C2.49951 9.91787 2.5157 9.83654 2.54715 9.76067C2.57861 9.68479 2.62471 9.61586 2.68282 9.55782L8.93282 3.30782C9.02023 3.22031 9.13163 3.1607 9.25294 3.13655C9.37424 3.11239 9.49998 3.12477 9.61425 3.17211C9.72851 3.21946 9.82616 3.29964 9.89483 3.40252C9.9635 3.50539 10.0001 3.62632 10 3.75V8.49141L15.1828 3.30782C15.2702 3.22031 15.3816 3.1607 15.5029 3.13655C15.6242 3.11239 15.75 3.12477 15.8642 3.17211C15.9785 3.21946 16.0762 3.29964 16.1448 3.40252C16.2135 3.50539 16.2501 3.62632 16.25 3.75Z"
                fill="#F8F8FF"
              />
            </svg>
          </button>
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !audio}
            className={styles.interactTrack}
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6C2 4.114 2 3.172 2.586 2.586C3.172 2 4.114 2 6 2C7.886 2 8.828 2 9.414 2.586C10 3.172 10 4.114 10 6V18C10 19.886 10 20.828 9.414 21.414C8.828 22 7.886 22 6 22C4.114 22 3.172 22 2.586 21.414C2 20.828 2 19.886 2 18V6ZM14 6C14 4.114 14 3.172 14.586 2.586C15.172 2 16.114 2 18 2C19.886 2 20.828 2 21.414 2.586C22 3.172 22 4.114 22 6V18C22 19.886 22 20.828 21.414 21.414C20.828 22 19.886 22 18 22C16.114 22 15.172 22 14.586 21.414C14 20.828 14 19.886 14 18V6Z"
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
                  d="M21.409 9.35282C21.8893 9.60823 22.291 9.98951 22.5712 10.4558C22.8514 10.9221 22.9994 11.4558 22.9994 11.9998C22.9994 12.5438 22.8514 13.0775 22.5712 13.5438C22.291 14.0101 21.8893 14.3914 21.409 14.6468L8.597 21.6138C6.534 22.7368 4 21.2768 4 18.9678V5.03282C4 2.72282 6.534 1.26382 8.597 2.38482L21.409 9.35282Z"
                  fill="#F8F8FF"
                />
              </svg>
            )}
          </button>
          <button
            onClick={playNextTrack}
            disabled={isLoading || playlist.length <= 1}
            className={styles.interactTrack}
            title="Piste suivante"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.3172 10.4422L11.0672 16.6922C10.9798 16.7797 10.8684 16.8393 10.7471 16.8635C10.6258 16.8876 10.5 16.8752 10.3858 16.8279C10.2715 16.7805 10.1738 16.7004 10.1052 16.5975C10.0365 16.4946 9.9999 16.3737 10 16.25V11.5086L4.81719 16.6922C4.72978 16.7797 4.61837 16.8393 4.49707 16.8635C4.37576 16.8876 4.25002 16.8752 4.13576 16.8279C4.02149 16.7805 3.92384 16.7004 3.85517 16.5975C3.78651 16.4946 3.7499 16.3737 3.75 16.25V3.75C3.7499 3.62632 3.78651 3.50539 3.85517 3.40252C3.92384 3.29964 4.02149 3.21946 4.13576 3.17211C4.25002 3.12477 4.37576 3.11239 4.49707 3.13655C4.61837 3.1607 4.72978 3.22031 4.81719 3.30782L10 8.49141V3.75C9.9999 3.62632 10.0365 3.50539 10.1052 3.40252C10.1738 3.29964 10.2715 3.21946 10.3858 3.17211C10.5 3.12477 10.6258 3.11239 10.7471 3.13655C10.8684 3.1607 10.9798 3.22031 11.0672 3.30782L17.3172 9.55782C17.3753 9.61586 17.4214 9.68479 17.4529 9.76067C17.4843 9.83654 17.5005 9.91787 17.5005 10C17.5005 10.0821 17.4843 10.1635 17.4529 10.2393C17.4214 10.3152 17.3753 10.3841 17.3172 10.4422Z"
                fill="#F8F8FF"
              />
            </svg>
          </button>
          <button
            onClick={handlePlaybackModeChange}
            disabled={isLoading || playlist.length <= 1}
            title={`Mode de lecture: ${playbackMode}`}
            className={styles.interactTrack}
          >
            {getPlaybackModeIcon()}
          </button>
          <button onClick={toggleExpand} className={styles.interactTrack}>
            {isExpanded ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.31719 15.8078C7.4047 15.8952 7.4643 16.0066 7.48846 16.1279C7.51261 16.2492 7.50023 16.375 7.45289 16.4892C7.40554 16.6035 7.32536 16.7012 7.22249 16.7698C7.11962 16.8385 6.99869 16.8751 6.875 16.875H3.75C3.58424 16.875 3.42527 16.8092 3.30806 16.6919C3.19085 16.5747 3.125 16.4158 3.125 16.25V13.125C3.1249 13.0013 3.16151 12.8804 3.23017 12.7775C3.29884 12.6746 3.39649 12.5945 3.51076 12.5471C3.62502 12.4998 3.75076 12.4874 3.87207 12.5115C3.99337 12.5357 4.10478 12.5953 4.19219 12.6828L7.31719 15.8078ZM6.875 3.125H3.75C3.58424 3.125 3.42527 3.19085 3.30806 3.30806C3.19085 3.42527 3.125 3.58424 3.125 3.75V6.875C3.1249 6.99869 3.16151 7.11962 3.23017 7.22249C3.29884 7.32536 3.39649 7.40554 3.51076 7.45289C3.62502 7.50023 3.75076 7.51261 3.87207 7.48846C3.99337 7.4643 4.10478 7.4047 4.19219 7.31719L7.31719 4.19219C7.4047 4.10478 7.4643 3.99337 7.48846 3.87207C7.51261 3.75076 7.50023 3.62502 7.45289 3.51076C7.40554 3.39649 7.32536 3.29884 7.22249 3.23017C7.11962 3.16151 6.99869 3.1249 6.875 3.125ZM16.4891 12.5477C16.3749 12.5003 16.2492 12.4878 16.1279 12.5119C16.0067 12.536 15.8953 12.5954 15.8078 12.6828L12.6828 15.8078C12.5953 15.8952 12.5357 16.0066 12.5115 16.1279C12.4874 16.2492 12.4998 16.375 12.5471 16.4892C12.5945 16.6035 12.6746 16.7012 12.7775 16.7698C12.8804 16.8385 13.0013 16.8751 13.125 16.875H16.25C16.4158 16.875 16.5747 16.8092 16.6919 16.6919C16.8092 16.5747 16.875 16.4158 16.875 16.25V13.125C16.875 13.0014 16.8383 12.8806 16.7696 12.7778C16.7009 12.675 16.6033 12.5949 16.4891 12.5477ZM16.25 3.125H13.125C13.0013 3.1249 12.8804 3.16151 12.7775 3.23017C12.6746 3.29884 12.5945 3.39649 12.5471 3.51076C12.4998 3.62502 12.4874 3.75076 12.5115 3.87207C12.5357 3.99337 12.5953 4.10478 12.6828 4.19219L15.8078 7.31719C15.8952 7.4047 16.0066 7.4643 16.1279 7.48846C16.2492 7.51261 16.375 7.50023 16.4892 7.45289C16.6035 7.40554 16.7012 7.32536 16.7698 7.22249C16.8385 7.11962 16.8751 6.99869 16.875 6.875V3.75C16.875 3.58424 16.8092 3.42527 16.6919 3.30806C16.5747 3.19085 16.4158 3.125 16.25 3.125Z"
                  fill="#F8F8FF"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5625 7.5V3.75C11.5625 3.50136 11.6613 3.2629 11.8371 3.08709C12.0129 2.91127 12.2514 2.8125 12.5 2.8125C12.7486 2.8125 12.9871 2.91127 13.1629 3.08709C13.3387 3.2629 13.4375 3.50136 13.4375 3.75V6.5625H16.25C16.4986 6.5625 16.7371 6.66127 16.9129 6.83709C17.0887 7.0129 17.1875 7.25136 17.1875 7.5C17.1875 7.74864 17.0887 7.9871 16.9129 8.16291C16.7371 8.33873 16.4986 8.4375 16.25 8.4375H12.5C12.2514 8.4375 12.0129 8.33873 11.8371 8.16291C11.6613 7.9871 11.5625 7.74864 11.5625 7.5ZM7.5 11.5625H3.75C3.50136 11.5625 3.2629 11.6613 3.08709 11.8371C2.91127 12.0129 2.8125 12.2514 2.8125 12.5C2.8125 12.7486 2.91127 12.9871 3.08709 13.1629C3.2629 13.3387 3.50136 13.4375 3.75 13.4375H6.5625V16.25C6.5625 16.4986 6.66127 16.7371 6.83709 16.9129C7.0129 17.0887 7.25136 17.1875 7.5 17.1875C7.74864 17.1875 7.9871 17.0887 8.16291 16.9129C8.33873 16.7371 8.4375 16.4986 8.4375 16.25V12.5C8.4375 12.2514 8.33873 12.0129 8.16291 11.8371C7.9871 11.6613 7.74864 11.5625 7.5 11.5625ZM16.25 11.5625H12.5C12.2514 11.5625 12.0129 11.6613 11.8371 11.8371C11.6613 12.0129 11.5625 12.2514 11.5625 12.5V16.25C11.5625 16.4986 11.6613 16.7371 11.8371 16.9129C12.0129 17.0887 12.2514 17.1875 12.5 17.1875C12.7486 17.1875 12.9871 17.0887 13.1629 16.9129C13.3387 16.7371 13.4375 16.4986 13.4375 16.25V13.4375H16.25C16.4986 13.4375 16.7371 13.3387 16.9129 13.1629C17.0887 12.9871 17.1875 12.7486 17.1875 12.5C17.1875 12.2514 17.0887 12.0129 16.9129 11.8371C16.7371 11.6613 16.4986 11.5625 16.25 11.5625ZM7.5 2.8125C7.25136 2.8125 7.0129 2.91127 6.83709 3.08709C6.66127 3.2629 6.5625 3.50136 6.5625 3.75V6.5625H3.75C3.50136 6.5625 3.2629 6.66127 3.08709 6.83709C2.91127 7.0129 2.8125 7.25136 2.8125 7.5C2.8125 7.74864 2.91127 7.9871 3.08709 8.16291C3.2629 8.33873 3.50136 8.4375 3.75 8.4375H7.5C7.74864 8.4375 7.9871 8.33873 8.16291 8.16291C8.33873 7.9871 8.4375 7.74864 8.4375 7.5V3.75C8.4375 3.50136 8.33873 3.2629 8.16291 3.08709C7.9871 2.91127 7.74864 2.8125 7.5 2.8125Z"
                  fill="#F8F8FF"
                />
              </svg>
            )}
          </button>
        </div>

        <div className={styles.progress}>
          <div className={styles.text_container}>
            <button onClick={toggleTimeDisplay} className={styles.timeDisplay}>
              {getTimeDisplay()}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(progress) ? 0 : progress}
            onChange={handleProgressChange}
            className={styles.progressBar}
            disabled={isLoading}
          />
          <div className={styles.text_container}>
            <span>{formatTime(audioRef.current?.duration || 0)}</span>
          </div>
        </div>

        <div className={styles.sound}>
          <div className={styles.text_container}>
            <button onClick={toggleMute} className={styles.interactTrack}>
              {isMuted || volume === 0 ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.82984 6.6665L12.4998 15.3365V16.5048C12.4999 16.6733 12.4535 16.8386 12.3658 16.9825C12.278 17.1263 12.1523 17.2432 12.0025 17.3203C11.8526 17.3974 11.6844 17.4316 11.5164 17.4194C11.3483 17.4071 11.1869 17.3487 11.0498 17.2507L5.5665 13.3332H3.33317C2.89114 13.3332 2.46722 13.1576 2.15466 12.845C1.8421 12.5324 1.6665 12.1085 1.6665 11.6665V8.33317C1.6665 7.89114 1.8421 7.46722 2.15466 7.15466C2.46722 6.84209 2.89114 6.6665 3.33317 6.6665H3.82984ZM12.4998 3.49483V11.3215L13.4273 12.249C13.3498 12.1005 13.3189 11.9321 13.3385 11.7658C13.3581 11.5994 13.4274 11.4429 13.5373 11.3165L13.6107 11.2423C13.9523 10.9357 14.1665 10.4932 14.1665 9.99983C14.1666 9.57325 14.0032 9.16286 13.7098 8.85317L13.6107 8.75733C13.4484 8.60929 13.3511 8.40315 13.34 8.18376C13.3289 7.96436 13.4049 7.74946 13.5514 7.5858C13.6979 7.42213 13.9032 7.32294 14.1224 7.30981C14.3417 7.29668 14.5573 7.37066 14.7223 7.51567C15.0718 7.82831 15.3514 8.21117 15.5428 8.63923C15.7342 9.06729 15.8332 9.53092 15.8332 9.99983C15.8332 10.4687 15.7342 10.9324 15.5428 11.3604C15.3514 11.7885 15.0718 12.1714 14.7223 12.484C14.5961 12.5972 14.4383 12.6692 14.27 12.6903C14.1017 12.7115 13.931 12.6808 13.7807 12.6023L15.0057 13.8273C14.9895 13.6941 15.0057 13.5588 15.053 13.4332C15.1003 13.3075 15.1773 13.1952 15.2773 13.1057C15.7144 12.7148 16.064 12.2362 16.3034 11.701C16.5428 11.1658 16.6665 10.5861 16.6665 9.99983C16.6665 8.7665 16.1315 7.65817 15.2773 6.894C15.1946 6.82133 15.1272 6.733 15.0788 6.63411C15.0304 6.53522 15.0022 6.42772 14.9956 6.31783C14.989 6.20794 15.0042 6.09784 15.0405 5.99388C15.0767 5.88992 15.1331 5.79417 15.2066 5.71215C15.28 5.63014 15.3689 5.56348 15.4683 5.51604C15.5676 5.4686 15.6754 5.4413 15.7853 5.43574C15.8953 5.43018 16.0052 5.44646 16.1088 5.48363C16.2124 5.52081 16.3077 5.57815 16.389 5.65233C17.0006 6.19947 17.4899 6.8695 17.825 7.61864C18.16 8.36779 18.3331 9.17919 18.3332 9.99983C18.3331 10.8205 18.16 11.6319 17.825 12.381C17.4899 13.1302 17.0006 13.8002 16.389 14.3473C16.3006 14.4266 16.1963 14.486 16.083 14.5216C15.9698 14.5573 15.8502 14.5683 15.7323 14.554L17.0707 15.8923C17.2225 16.0495 17.3065 16.26 17.3046 16.4785C17.3027 16.697 17.215 16.906 17.0605 17.0605C16.906 17.215 16.697 17.3027 16.4785 17.3046C16.26 17.3065 16.0495 17.2225 15.8923 17.0707L2.929 4.10817C2.84941 4.03129 2.78593 3.93934 2.74225 3.83767C2.69858 3.736 2.67559 3.62665 2.67463 3.516C2.67367 3.40535 2.69475 3.29562 2.73665 3.1932C2.77855 3.09079 2.84043 2.99775 2.91867 2.9195C2.99692 2.84126 3.08996 2.77938 3.19238 2.73748C3.29479 2.69558 3.40452 2.6745 3.51517 2.67546C3.62582 2.67642 3.73517 2.69941 3.83684 2.74308C3.93851 2.78676 4.03046 2.85024 4.10734 2.92983L6.89567 5.7165L11.0507 2.74817C11.1878 2.65032 11.3492 2.59214 11.5172 2.58001C11.6852 2.56789 11.8533 2.60229 12.003 2.67944C12.1528 2.75659 12.2783 2.8735 12.366 3.01734C12.4536 3.16118 12.4999 3.32639 12.4998 3.49483Z"
                    fill="#F8F8FF"
                  />
                </svg>
              ) : volume < 50 ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.0498 2.75022C11.1803 2.65692 11.3329 2.59947 11.4925 2.5836C11.652 2.56773 11.813 2.594 11.9592 2.65979C12.1055 2.72557 12.2319 2.82857 12.3259 2.9585C12.4199 3.08842 12.4781 3.24074 12.4948 3.40022L12.4998 3.49522V16.5052C12.4999 16.6656 12.4579 16.8232 12.378 16.9622C12.2981 17.1013 12.1831 17.2169 12.0445 17.2976C11.906 17.3783 11.7486 17.4213 11.5883 17.4222C11.4279 17.4231 11.2701 17.3819 11.1307 17.3027L11.0507 17.2511L5.5665 13.3336H3.33317C2.91269 13.3337 2.5077 13.1749 2.19938 12.889C1.89106 12.6031 1.70221 12.2112 1.67067 11.7919L1.6665 11.6669V8.33355C1.66637 7.91307 1.82518 7.50808 2.11108 7.19976C2.39699 6.89145 2.78887 6.70259 3.20817 6.67105L3.33317 6.66689H5.5665L11.0498 2.75022ZM14.7223 7.51605C15.0717 7.82861 15.3512 8.21133 15.5426 8.63924C15.734 9.06715 15.833 9.53062 15.8332 9.99939C15.8333 10.4684 15.7344 10.9322 15.543 11.3604C15.3515 11.7887 15.0719 12.1716 14.7223 12.4844C14.5643 12.6247 14.3588 12.6998 14.1476 12.6944C13.9363 12.6889 13.7349 12.6034 13.5843 12.4551C13.4337 12.3069 13.3451 12.1069 13.3363 11.8957C13.3276 11.6845 13.3995 11.4779 13.5373 11.3177L13.6107 11.2427C13.9523 10.9361 14.1665 10.4936 14.1665 10.0002C14.1666 9.57364 14.0032 9.16325 13.7098 8.85355L13.6107 8.75772C13.528 8.68506 13.4605 8.59672 13.4121 8.49783C13.3638 8.39894 13.3355 8.29144 13.3289 8.18155C13.3223 8.07167 13.3376 7.96156 13.3738 7.8576C13.41 7.75365 13.4665 7.65789 13.5399 7.57588C13.6133 7.49386 13.7023 7.4272 13.8016 7.37976C13.9009 7.33232 14.0087 7.30503 14.1186 7.29946C14.2286 7.2939 14.3385 7.31018 14.4422 7.34735C14.5458 7.38453 14.641 7.44187 14.7223 7.51605Z"
                    fill="#F8F8FF"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.0498 2.75022C11.1803 2.65692 11.3329 2.59947 11.4925 2.5836C11.652 2.56773 11.813 2.594 11.9592 2.65979C12.1055 2.72557 12.2319 2.82857 12.3259 2.9585C12.4199 3.08842 12.4781 3.24074 12.4948 3.40022L12.4998 3.49522V16.5052C12.4999 16.6656 12.4579 16.8232 12.378 16.9622C12.2981 17.1013 12.1831 17.2169 12.0445 17.2976C11.906 17.3783 11.7486 17.4213 11.5883 17.4222C11.4279 17.4231 11.2701 17.3819 11.1307 17.3027L11.0507 17.2511L5.5665 13.3336H3.33317C2.91269 13.3337 2.5077 13.1749 2.19938 12.889C1.89106 12.6031 1.70221 12.2112 1.67067 11.7919L1.6665 11.6669V8.33355C1.66637 7.91307 1.82518 7.50808 2.11108 7.19976C2.39699 6.89145 2.78887 6.70259 3.20817 6.67105L3.33317 6.66689H5.5665L11.0498 2.75022ZM16.389 5.65272C17.0006 6.19985 17.4899 6.86988 17.825 7.61903C18.16 8.36818 18.3331 9.17958 18.3332 10.0002C18.3331 10.8209 18.16 11.6323 17.825 12.3814C17.4899 13.1306 17.0006 13.8006 16.389 14.3477C16.3077 14.4219 16.2124 14.4792 16.1088 14.5164C16.0052 14.5536 15.8953 14.5699 15.7853 14.5643C15.6754 14.5587 15.5676 14.5315 15.4683 14.484C15.3689 14.4366 15.28 14.3699 15.2066 14.2879C15.1331 14.2059 15.0767 14.1101 15.0405 14.0062C15.0042 13.9022 14.989 13.7921 14.9956 13.6822C15.0022 13.5723 15.0304 13.4648 15.0788 13.3659C15.1272 13.2671 15.1946 13.1787 15.2773 13.1061C15.7144 12.7152 16.064 12.2366 16.3034 11.7014C16.5428 11.1662 16.6665 10.5865 16.6665 10.0002C16.6665 8.76689 16.1315 7.65855 15.2773 6.89439C15.1946 6.82172 15.1272 6.73339 15.0788 6.6345C15.0304 6.53561 15.0022 6.42811 14.9956 6.31822C14.989 6.20833 15.0042 6.09823 15.0405 5.99427C15.0767 5.89031 15.1331 5.79456 15.2066 5.71254C15.28 5.63053 15.3689 5.56387 15.4683 5.51643C15.5676 5.46898 15.6754 5.44169 15.7853 5.43613C15.8953 5.43057 16.0052 5.44685 16.1088 5.48402C16.2124 5.5212 16.3077 5.57853 16.389 5.65272ZM14.7223 7.51605C15.0717 7.82861 15.3512 8.21133 15.5426 8.63924C15.734 9.06715 15.833 9.53062 15.8332 9.99939C15.8333 10.4684 15.7344 10.9322 15.543 11.3604C15.3515 11.7887 15.0719 12.1716 14.7223 12.4844C14.5643 12.6247 14.3588 12.6998 14.1476 12.6944C13.9363 12.6889 13.7349 12.6034 13.5843 12.4551C13.4337 12.3069 13.3451 12.1069 13.3363 11.8957C13.3276 11.6845 13.3995 11.4779 13.5373 11.3177L13.6107 11.2427C13.9523 10.9361 14.1665 10.4936 14.1665 10.0002C14.1666 9.57364 14.0032 9.16325 13.7098 8.85355L13.6107 8.75772C13.528 8.68506 13.4605 8.59672 13.4121 8.49783C13.3638 8.39894 13.3355 8.29144 13.3289 8.18155C13.3223 8.07167 13.3376 7.96156 13.3738 7.8576C13.41 7.75365 13.4665 7.65789 13.5399 7.57588C13.6133 7.49386 13.7023 7.4272 13.8016 7.37976C13.9009 7.33232 14.0087 7.30503 14.1186 7.29946C14.2286 7.2939 14.3385 7.31018 14.4422 7.34735C14.5458 7.38453 14.641 7.44187 14.7223 7.51605Z"
                    fill="#F8F8FF"
                  />
                </svg>
              )}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeBar}
          />
          <div className={styles.text_container}>
            <span>{volume}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicSection;
