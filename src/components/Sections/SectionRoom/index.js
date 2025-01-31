/* eslint-disable no-unused-vars */
'use client';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Image from 'next/image';
import style from './index.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const SectionRoomMulti = ({
  audio,
  audioRef,
  isPlaying,
  setIsPlaying,
  onTrackChange,
}) => {
  const [socket, setSocket] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomId, setRoomId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [username, setUsername] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState('');
  const [queue, setQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);

  // Socket initialization
  useEffect(() => {
    const newSocket = io(`${baseUrl}`, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      setError('');
    });

    newSocket.on('connect_error', (err) => {
      setConnectionStatus('error');
      setError(`Erreur de connexion: ${err.message}`);
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Room event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on(
      'roomCreated',
      ({
        roomId: createdRoomId,
        participants: initialParticipants,
        queue: initialQueue,
        currentQueueIndex: initialIndex,
      }) => {
        setRoomId(createdRoomId);
        setParticipants(initialParticipants);
        setQueue(initialQueue || []);
        setCurrentQueueIndex(initialIndex || -1);
        setError('');
      }
    );

    socket.on(
      'roomJoined',
      ({
        participants: roomParticipants,
        currentTrack: roomTrack,
        queue: roomQueue,
        currentQueueIndex: roomIndex,
      }) => {
        setParticipants(roomParticipants);
        setQueue(roomQueue || []);
        setCurrentQueueIndex(roomIndex || -1);
        if (roomTrack) {
          setCurrentTrack(roomTrack);
          onTrackChange(roomTrack.id);
        }
        setError('');
      }
    );

    socket.on(
      'queueUpdated',
      ({ queue: newQueue, currentQueueIndex: newIndex }) => {
        setQueue(newQueue);
        setCurrentQueueIndex(newIndex);
      }
    );

    socket.on('userJoined', (newParticipant) => {
      setParticipants((prev) => [...prev, newParticipant]);
      if (isHost && currentTrack) {
        syncCurrentTrack(newParticipant.id);
      }
    });

    socket.on('userLeft', ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== userId));
    });

    socket.on('hostChanged', ({ newHostId }) => {
      setIsHost(newHostId === socket.id);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('queueUpdated');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('hostChanged');
      socket.off('error');
    };
  }, [socket, isHost, currentTrack, onTrackChange]);

  // Playback sync handlers
  useEffect(() => {
    if (!socket) return;

    socket.on(
      'playbackUpdate',
      ({ currentTime, isPlaying: newIsPlaying, audioId }) => {
        if (!isHost && audioRef.current) {
          if (audioId !== currentTrack?.id) return;

          audioRef.current.currentTime = currentTime;
          if (newIsPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
          } else if (!newIsPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }
      }
    );

    socket.on('trackChange', ({ audioData, queueIndex, queue: newQueue }) => {
      if (!isHost) {
        setCurrentTrack(audioData);
        onTrackChange(audioData.id);
      }
      if (newQueue) setQueue(newQueue);
      setCurrentQueueIndex(queueIndex);
    });

    return () => {
      socket.off('playbackUpdate');
      socket.off('trackChange');
    };
  }, [socket, isHost, audioRef, currentTrack, setIsPlaying, onTrackChange]);

  // Track change handler
  useEffect(() => {
    if (audio) {
      setCurrentTrack(audio);
      if (isHost && socket && roomId) {
        syncCurrentTrack();
      }
    }
  }, [audio, isHost, socket, roomId]);

  // Queue management functions
  const addToQueue = (track) => {
    if (!socket || !roomId) return;
    socket.emit('addToQueue', { roomId, track });
  };

  const playNext = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('nextTrack', { roomId });
  };

  const playPrevious = () => {
    if (!socket || !roomId || !isHost) return;
    socket.emit('previousTrack', { roomId });
  };

  // Auto-add current track to queue
  useEffect(() => {
    if (audio && roomId) {
      addToQueue(audio);
    }
  }, [audio, roomId]);

  // Room management functions
  const createRoom = () => {
    if (!username) {
      setError("Veuillez entrer un nom d'utilisateur");
      return;
    }
    if (!audio) {
      setError('Veuillez sélectionner une piste audio');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(7);
    socket.emit('createRoom', { roomId: newRoomId, username });
    setIsHost(true);
  };

  const joinRoom = () => {
    if (!username) {
      setError("Veuillez entrer un nom d'utilisateur");
      return;
    }
    if (!roomIdInput) {
      setError('Veuillez entrer un ID de room');
      return;
    }
    if (!audio) {
      setError('Veuillez sélectionner une piste audio');
      return;
    }
    socket.emit('joinRoom', { roomId: roomIdInput, username });
    setRoomId(roomIdInput);
  };

  const syncCurrentTrack = (targetUserId = null) => {
    if (!audio) return;

    const audioData = {
      id: audio.id,
      title: audio.title,
      artist: audio.artist,
      album: audio.album,
      audioUrl: audio.audioUrl,
    };

    if (targetUserId) {
      socket.emit('trackChange', {
        roomId,
        audioId: audio.id,
        audioData,
        targetUserId,
      });
    } else {
      socket.emit('trackChange', {
        roomId,
        audioId: audio.id,
        audioData,
      });
    }
  };

  const syncPlayback = () => {
    if (isHost && socket && audioRef.current) {
      socket.emit('syncPlayback', {
        roomId,
        currentTime: audioRef.current.currentTime,
        isPlaying: !audioRef.current.paused,
        audioId: audio?.id,
      });
    }
  };

  // Host playback sync listeners
  useEffect(() => {
    if (!isHost || !audioRef.current) return;

    const handlePlay = () => syncPlayback();
    const handlePause = () => syncPlayback();
    const handleSeek = () => syncPlayback();
    const handleEnded = () => {
      socket.emit('trackEnded', { roomId });
    };

    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);
    audioRef.current.addEventListener('seeked', handleSeek);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('seeked', handleSeek);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [audioRef, isHost, roomId, audio]);

  return (
    <div className={style.roomMulti}>
      {error && <div className={style.error}>{error}</div>}

      <div className={style.connectionStatus}>
        Status:{' '}
        {connectionStatus === 'connected' ? '🟢 Connecté' : '🔴 Déconnecté'}
      </div>

      <div className={style.roomControls}>
        {!roomId && (
          <div className={style.joinSection}>
            <input
              type="text"
              placeholder="Votre nom"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={style.input}
            />

            <button
              className={style.createButton}
              onClick={createRoom}
              disabled={!audio || !username}
            >
              Créer une Room
            </button>

            <div className={style.joinForm}>
              <input
                type="text"
                placeholder="ID de la room"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className={style.input}
              />
              <button
                onClick={joinRoom}
                disabled={!roomIdInput || !audio || !username}
              >
                Rejoindre
              </button>
            </div>
          </div>
        )}

        {roomId && (
          <div className={style.roomInfo}>
            <div className={style.roomHeader}>
              <h3>Room: {roomId}</h3>
              <button
                className={style.copyButton}
                onClick={() => navigator.clipboard.writeText(roomId)}
              >
                Copier l'ID
              </button>
            </div>
            {isHost && <span className={style.hostBadge}>Host</span>}
          </div>
        )}
      </div>

      {roomId && audio && (
        <div className={style.currentTrack}>
          <Image
            src={
              audio.album?.coverUrl
                ? `${baseUrl}/${audio.album.coverUrl}`
                : '/images/default-placeholder.png'
            }
            alt={audio.title}
            width={50}
            height={50}
            className={style.miniCover}
          />
          <div className={style.trackInfo}>
            <span className={style.trackTitle}>{audio.title}</span>
            <span className={style.artistName}>{audio.artist?.name}</span>
          </div>
        </div>
      )}

      {roomId && (
        <>
          <div className={style.participants}>
            <h4>Participants ({participants.length})</h4>
            <ul>
              {participants.map((participant) => (
                <li key={participant.id}>
                  {participant.name}
                  {participant.id === socket?.id && ' (Vous)'}
                  {isHost && participant.id === socket?.id && ' (Host)'}
                </li>
              ))}
            </ul>
          </div>

          <div className={style.queueSection}>
            <h4>File d'attente ({queue.length})</h4>
            <ul className={style.queueList}>
              {queue.map((track, index) => (
                <li
                  key={`${track.id}-${index}`}
                  className={`${style.queueItem} ${index === currentQueueIndex ? style.playing : ''}`}
                >
                  <Image
                    src={
                      track.album?.coverUrl
                        ? `${baseUrl}/${track.album.coverUrl}`
                        : '/images/default-placeholder.png'
                    }
                    alt={track.title}
                    width={30}
                    height={30}
                    className={style.queueCover}
                  />
                  <div className={style.queueTrackInfo}>
                    <span className={style.queueTrackTitle}>{track.title}</span>
                    <span className={style.queueArtistName}>
                      {track.artist?.name}
                    </span>
                  </div>
                  {index === currentQueueIndex && (
                    <span className={style.nowPlaying}>▶️</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isHost && (
            <div className={style.controls}>
              <button onClick={playPrevious} disabled={currentQueueIndex <= 0}>
                Précédent
              </button>
              <button
                onClick={playNext}
                disabled={currentQueueIndex >= queue.length - 1}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {roomId && !isHost && (
        <div className={style.syncStatus}>
          {currentTrack?.id === audio?.id
            ? "✅ Synchronisé avec l'hôte"
            : '⏳ Synchronisation...'}
        </div>
      )}
    </div>
  );
};

export default SectionRoomMulti;
