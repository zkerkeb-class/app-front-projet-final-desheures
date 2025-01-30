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
  const [roomId, setRoomId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [username, setUsername] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState('');

  // Initialisation du socket
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

  // Gestion des événements de room
  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', ({ roomId: createdRoomId }) => {
      setRoomId(createdRoomId);
      setParticipants([{ id: socket.id, name: username }]);
    });

    socket.on('roomJoined', ({ participants: roomParticipants }) => {
      setParticipants(roomParticipants);
    });

    socket.on('userJoined', (newParticipant) => {
      setParticipants((prev) => [...prev, newParticipant]);
      // Si je suis l'hôte, j'envoie l'état actuel
      if (isHost && currentTrack) {
        syncCurrentTrack(newParticipant.id);
      }
    });

    socket.on('userLeft', ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== userId));
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('error');
    };
  }, [socket, isHost, currentTrack, username]);

  // Gestion de la synchronisation audio
  useEffect(() => {
    if (!socket) return;

    socket.on(
      'playbackUpdate',
      ({ currentTime, isPlaying: newIsPlaying, audioId }) => {
        if (!isHost && audioRef.current) {
          if (audioId !== currentTrack?.id) return;

          audioRef.current.currentTime = currentTime;
          if (newIsPlaying && audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
          } else if (!newIsPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }
      }
    );

    socket.on('trackChange', ({ audioData }) => {
      if (!isHost && onTrackChange) {
        setCurrentTrack(audioData);
        onTrackChange(audioData.id);
      }
    });

    return () => {
      socket.off('playbackUpdate');
      socket.off('trackChange');
    };
  }, [socket, isHost, audioRef, currentTrack, setIsPlaying, onTrackChange]);

  // Mise à jour du state local quand l'audio change
  useEffect(() => {
    if (audio) {
      setCurrentTrack(audio);
      if (isHost && socket && roomId) {
        syncCurrentTrack();
      }
    }
  }, [audio, isHost, socket, roomId]);

  const syncCurrentTrack = (targetUserId = null) => {
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

  const createRoom = () => {
    if (!username) {
      setError("Veuillez entrer un nom d'utilisateur");
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
    if (!roomId) {
      setError('Veuillez entrer un ID de room');
      return;
    }
    socket.emit('joinRoom', { roomId, username });
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

  // Synchro de la lecture pour l'hôte
  useEffect(() => {
    if (!isHost || !audioRef.current) return;

    const handlePlay = () => syncPlayback();
    const handlePause = () => syncPlayback();
    const handleSeek = () => syncPlayback();

    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);
    audioRef.current.addEventListener('seeked', handleSeek);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('seeked', handleSeek);
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
                onChange={(e) => setRoomId(e.target.value)}
                className={style.input}
              />
              <button
                onClick={joinRoom}
                disabled={!roomId || !audio || !username}
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
                Copier lID
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
