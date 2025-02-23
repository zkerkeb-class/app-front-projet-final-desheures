/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import Image from 'next/image';
import Backaground_Img from 'images/background/shadow_lion.png';
import styles from './page.module.scss';
import logger from '@/utils/logger';

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const MultiRoomPage = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(true);

  const { t } = useTranslation();
  const {
    darkMode,
    isExpanded,
    setIsExpanded,
    selectedMusicId,
    setSelectedMusicId,
  } = useTheme();

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
  } = useMusicPlayer(selectedMusicId, isExpanded, setIsExpanded);

  const analyzer = useAudioContext(audioRef);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Initialisation du socket
  useEffect(() => {
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Gestion des événements socket
  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', ({ roomId }) => {
      setRoomId(roomId);
      setIsHost(true);
      setShowJoinForm(false);
    });

    socket.on('participantsUpdate', (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    socket.on('hostUpdate', (newHostId) => {
      setIsHost(socket.id === newHostId);
    });

    socket.on('playbackUpdate', ({ currentTrack, isPlaying, timestamp }) => {
      if (!isHost) {
        if (currentTrack !== selectedMusicId) {
          setSelectedMusicId(currentTrack);
        }
        if (audioRef.current) {
          const timeDiff = Math.abs(audioRef.current.currentTime - timestamp);
          if (timeDiff > 1) {
            audioRef.current.currentTime = timestamp;
          }
          if (isPlaying && audioRef.current.paused) {
            audioRef.current
              .play()
              .catch((err) => logger.error('Playback error:', err));
          } else if (!isPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
          }
        }
      }
    });

    socket.on('roomState', ({ currentTrack, isPlaying, timestamp }) => {
      if (currentTrack !== selectedMusicId) {
        setSelectedMusicId(currentTrack);
      }
      if (audioRef.current) {
        audioRef.current.currentTime = timestamp;
        if (isPlaying) {
          audioRef.current
            .play()
            .catch((err) => logger.error('Initial playback error:', err));
        }
      }
    });

    return () => {
      socket.off('roomCreated');
      socket.off('participantsUpdate');
      socket.off('hostUpdate');
      socket.off('playbackUpdate');
      socket.off('roomState');
    };
  }, [socket, isHost, selectedMusicId]);

  // Synchronisation périodique si hôte
  useEffect(() => {
    if (!isHost || !socket || !audioRef.current || !roomId) return;

    const syncInterval = setInterval(() => {
      if (isPlaying) {
        socket.emit('syncPlay', {
          roomId,
          trackId: selectedMusicId,
          timestamp: audioRef.current.currentTime,
        });
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [isHost, isPlaying, socket, selectedMusicId, roomId]);

  // Synchronisation quand la piste change
  useEffect(() => {
    if (isHost && audio && socket && roomId) {
      socket.emit('syncPlay', {
        roomId,
        trackId: selectedMusicId,
        timestamp: 0,
      });
    }
  }, [selectedMusicId, audio]);

  const handleSyncPlayPause = () => {
    if (!isHost) return;

    const newIsPlaying = !isPlaying;
    togglePlayPause();
    socket.emit(newIsPlaying ? 'syncPlay' : 'syncPause', {
      roomId,
      trackId: selectedMusicId,
      timestamp: audioRef.current?.currentTime || 0,
    });
  };

  const handleSyncTrackChange = (direction) => {
    if (!isHost) return;

    if (direction === 'next') {
      playNextTrack();
    } else {
      playPreviousTrack();
    }

    socket.emit('syncPlay', {
      roomId,
      trackId: selectedMusicId,
      timestamp: 0,
    });
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    socket.emit('createRoom', { name: userName });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim()) return;
    socket.emit('joinRoom', { roomId, name: userName });
    setShowJoinForm(false);
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom');
    setRoomId('');
    setIsHost(false);
    setShowJoinForm(true);
    setParticipants([]);
  };

  if (showJoinForm) {
    return (
      <div
        className={`${styles.room_section} ${darkMode ? styles.dark : styles.light}`}
      >
        <h2 className={styles.section_title}>{t('joinRoom')}</h2>
        <form
          onSubmit={(e) => e.preventDefault()}
          className={styles.room_wrapper}
        >
          <div className={styles.room}>
            <label> {t('createRoom')}</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('yourName')}
              className={styles.select_input}
            />
          </div>
          <button onClick={handleCreateRoom} className={styles.room_button}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.546 5.11107C21.8272 5.39236 21.9852 5.77382 21.9852 6.17157C21.9852 6.56931 21.8272 6.95077 21.546 7.23207L10.303 18.4751C10.1544 18.6237 9.97805 18.7416 9.7839 18.822C9.58976 18.9024 9.38167 18.9438 9.17153 18.9438C8.96138 18.9438 8.75329 18.9024 8.55915 18.822C8.365 18.7416 8.1886 18.6237 8.04003 18.4751L2.45403 12.8901C2.31076 12.7517 2.19649 12.5862 2.11787 12.4032C2.03926 12.2202 1.99788 12.0233 1.99615 11.8242C1.99442 11.625 2.03237 11.4275 2.10779 11.2431C2.18322 11.0588 2.29459 10.8913 2.43543 10.7505C2.57627 10.6096 2.74375 10.4983 2.92809 10.4228C3.11244 10.3474 3.30996 10.3095 3.50913 10.3112C3.7083 10.3129 3.90513 10.3543 4.08813 10.4329C4.27114 10.5115 4.43666 10.6258 4.57503 10.7691L9.17103 15.3651L19.424 5.11107C19.5633 4.97168 19.7287 4.8611 19.9108 4.78566C20.0928 4.71022 20.288 4.67139 20.485 4.67139C20.6821 4.67139 20.8772 4.71022 21.0593 4.78566C21.2413 4.8611 21.4067 4.97168 21.546 5.11107Z"
                fill="#F8F8FF"
              />
            </svg>
          </button>

          <div className={styles.room}>
            <label> {t('join')}</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder={t('roomId')}
              className={styles.select_input}
            />
          </div>
          <button onClick={handleJoinRoom} className={styles.room_button}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.546 5.11107C21.8272 5.39236 21.9852 5.77382 21.9852 6.17157C21.9852 6.56931 21.8272 6.95077 21.546 7.23207L10.303 18.4751C10.1544 18.6237 9.97805 18.7416 9.7839 18.822C9.58976 18.9024 9.38167 18.9438 9.17153 18.9438C8.96138 18.9438 8.75329 18.9024 8.55915 18.822C8.365 18.7416 8.1886 18.6237 8.04003 18.4751L2.45403 12.8901C2.31076 12.7517 2.19649 12.5862 2.11787 12.4032C2.03926 12.2202 1.99788 12.0233 1.99615 11.8242C1.99442 11.625 2.03237 11.4275 2.10779 11.2431C2.18322 11.0588 2.29459 10.8913 2.43543 10.7505C2.57627 10.6096 2.74375 10.4983 2.92809 10.4228C3.11244 10.3474 3.30996 10.3095 3.50913 10.3112C3.7083 10.3129 3.90513 10.3543 4.08813 10.4329C4.27114 10.5115 4.43666 10.6258 4.57503 10.7691L9.17103 15.3651L19.424 5.11107C19.5633 4.97168 19.7287 4.8611 19.9108 4.78566C20.0928 4.71022 20.288 4.67139 20.485 4.67139C20.6821 4.67139 20.8772 4.71022 21.0593 4.78566C21.2413 4.8611 21.4067 4.97168 21.546 5.11107Z"
                fill="#F8F8FF"
              />
            </svg>
          </button>
        </form>
      </div>
    );
  }

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

        <div className={styles.roomInfo}>
          <div className={styles.roomDetails}>
            <p>Room: {roomId}</p>
            <p>{isHost ? t('host') : t('guest')}</p>
            <p>
              {t('participants')} ({participants.length}) :
              {participants.map((p) => p.name).join(',')}
            </p>
          </div>
          <div className={styles.roomDetailsButton}>
            <button onClick={handleLeaveRoom} className={styles.room_button}>
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
            </button>
            <p>{t('leave')}</p>
          </div>
        </div>
        <div
          className={`${styles.music_CD} ${isPlaying && !isLoading ? styles.spinning : ''}`}
        >
          {isLoading && <div className={styles.loader}>{t('loading')}.</div>}
          <Image
            src={
              audio?.album?.coverUrl
                ? `${baseUrl}/${audio.album.coverUrl}`
                : Backaground_Img
            }
            alt={audio?.title || t('albumCover')}
            width={isExpanded ? 400 : 240}
            height={isExpanded ? 400 : 240}
            className={styles.image_CD}
            priority
            formats={['webp', 'jpeg', 'avif']}
          />
        </div>

        <div className={styles.trackDetails}>
          <p className={styles.trackTitle}>{audio?.title || t('titleMusic')}</p>
          <p className={styles.artist}>
            {audio?.artist?.name || t('artistName')}
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
            onClick={handlePlaybackModeChange}
            disabled={!isHost || isLoading || playlist.length <= 1}
            title={`${playbackMode}`}
            className={styles.interactTrack}
          >
            {getPlaybackModeIcon()}
          </button>
          <button
            onClick={() => handleSyncTrackChange('prev')}
            className={styles.interactTrack}
            disabled={!isHost || isLoading || playlist.length <= 1}
            title={t('lastTrack')}
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
            onClick={handleSyncPlayPause}
            disabled={!isHost || isLoading || !audio}
            className={styles.interactTrack}
            title={isPlaying ? t('pause') : t('play')}
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
            onClick={() => handleSyncTrackChange('next')}
            disabled={!isHost || isLoading || playlist.length <= 1}
            className={styles.interactTrack}
            title={t('nextTrack')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.3172 10.4422L11.0672 16.6922C10.9798 16.7797 10.8684 16.8393 10.7471 16.8635C10.6258 16.8876 10.5 16.8752 10.3858 16.8279C10.2715 16.7805 10.1738 16.7004 10.1052 16.5975C10.0365 16.4946 9.9999 16.3737 10 16.25V11.5086L4.81719 16.6922C4.72978 16.7797 4.61837 16.8393 4.49707 16.8635C4.37576 16.8876 4.25002 16.8752 4.13576 16.8279C4.02149 16.7805 3.92384 16.7004 3.85517 16.5975C3.78651 16.4946 3.7499 16.3737 3.75 16.25V3.75C3.7499 3.62632 3.78651 3.50539 3.85517 3.40252C3.92384 3.29964 4.02149 3.21946 4.13576 3.17211C4.25002 3.12477 4.37576 3.11239 4.49707 3.13655C.72978 3.22031 4.81719 3.30782L10 8.49141V3.75C9.9999 3.62632 10.0365 3.50539 10.1052 3.40252C10.1738 3.29964 10.2715 3.21946 10.3858 3.17211C10.5 3.12477 10.6258 3.11239 10.7471 3.13655C10.8684 3.1607 10.9798 3.22031 11.0672 3.30782L17.3172 9.55782C17.3753 9.61586 17.4214 9.68479 17.4529 9.76067C17.4843 9.83654 17.5005 9.91787 17.5005 10C17.5005 10.0821 17.4843 10.1635 17.4529 10.2393C17.4214 10.3152 17.3753 10.3841 17.3172 10.4422Z"
                fill="#F8F8FF"
              />
            </svg>
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
                  d="M7.31719 15.8078C7.4047 15.8952 7.4643 16.0066 7.48846 16.1279C7.51261 16.2492 7.50023 16.375 7.45289 16.4892C7.40554 16.6035 7.32536 16.7012 7.22249 16.7698C7.11962 16.8385 6.99869 16.8751 6.875 16.875H3.75C3.58424 16.875 3.42527 16.8092 3.30806 16.6919C3.19085 16.5747 3.125 16.4158 3.125 16.25V13.125C3.1249 13.0013 3.16151 12.8804 3.23017 12.7775C3.29884 12.6746 3.39649 12.5945 3.51076 12.5471C3.62502 12.4998 3.75076 12.4874 3.87207 12.5115C3.99337 12.5357 4.10478 12.5953 4.19219 12.6828L7.31719 15.8078Z"
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
                  d="M11.5625 7.5V3.75C11.5625 3.50136 11.6613 3.2629 11.8371 3.08709C12.0129 2.91127 12.2514 2.8125 12.5 2.8125C12.7486 2.8125 12.9871 2.91127 13.1629 3.08709C13.3387 3.2629 13.4375 3.50136 13.4375 3.75V6.5625H16.25C16.4986 6.5625 16.7371 6.66127 16.9129 6.83709C17.0887 7.0129 17.1875 7.25136 17.1875 7.5C17.1875 7.74864 17.0887 7.9871 16.9129 8.16291C16.7371 8.33873 16.4986 8.4375 16.25 8.4375H12.5C12.2514 8.4375 12.0129 8.33873 11.8371 8.16291C11.6613 7.9871 11.5625 7.74864 11.5625 7.5Z"
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
            disabled={!isHost || isLoading}
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
                    d="M3.82984 6.6665L12.4998 15.3365V16.5048C12.4999 16.6733 12.4535 16.8386 12.3658 16.9825C12.278 17.1263 12.1523 17.2432 12.0025 17.3203C11.8526 17.3974 11.6844 17.4316 11.5164 17.4194C11.3483 17.4071 11.1869 17.3487 11.0498 17.2507L5.5665 13.3332H3.33317C2.89114 13.3332 2.46722 13.1576 2.15466 12.845C1.8421 12.5324 1.6665 12.1085 1.6665 11.6665V8.33317C1.6665 7.89114 1.8421 7.46722 2.15466 7.15466C2.46722 6.84209 2.89114 6.6665 3.33317 6.6665H3.82984Z"
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
                    d="M11.0498 2.75022C11.1803 2.65692 11.3329 2.59947 11.4925 2.5836C11.652 2.56773 11.813 2.594 11.9592 2.65979C12.1055 2.72557 12.2319 2.82857 12.3259 2.9585C12.4199 3.08842 12.4781 3.24074 12.4948 3.40022L12.4998 3.49522V16.5052C12.4999 16.6656 12.4579 16.8232 12.378 16.9622C12.2981 17.1013 12.1831 17.2169 12.0445 17.2976C11.906 17.3783 11.7486 17.4213 11.5883 17.4222C11.4279 17.4231 11.2701 17.3819 11.1307 17.3027L11.0507 17.2511L5.5665 13.3336H3.33317C2.91269 13.3337 2.5077 13.1749 2.19938 12.889C1.89106 12.6031 1.70221 12.2112 1.67067 11.7919L1.6665 11.6669V8.33355C1.66637 7.91307 1.82518 7.50808 2.11108 7.19976C2.39699 6.89145 2.78887 6.70259 3.20817 6.67105L3.33317 6.66689H5.5665L11.0498 2.75022Z"
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
                    d="M11.0498 2.75022C11.1803 2.65692 11.3329 2.59947 11.4925 2.5836C11.652 2.56773 11.813 2.594 11.9592 2.65979C12.1055 2.72557 12.2319 2.82857 12.3259 2.9585C12.4199 3.08842 12.4781 3.24074 12.4948 3.40022L12.4998 3.49522V16.5052C12.4999 16.6656 12.4579 16.8232 12.378 16.9622C12.2981 17.1013 12.1831 17.2169 12.0445 17.2976C11.906 17.3783 11.7486 17.4213 11.5883 17.4222C11.4279 17.4231 11.2701 17.3819 11.1307 17.3027L11.0507 17.2511L5.5665 13.3336H3.33317C2.91269 13.3337 2.5077 13.1749 2.19938 12.889C1.89106 12.6031 1.70221 12.2112 1.67067 11.7919L1.6665 11.6669V8.33355C1.66637 7.91307 1.82518 7.50808 2.11108 7.19976C2.39699 6.89145 2.78887 6.70259 3.20817 6.67105L3.33317 6.66689H5.5665L11.0498 2.75022Z"
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

export default MultiRoomPage;
