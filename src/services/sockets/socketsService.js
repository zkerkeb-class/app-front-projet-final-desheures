// services/socketService.js
import logger from '@/utils/logger';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const socketService = {
  socket: null,

  getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  },

  connect() {
    if (!this.socket) {
      const sessionId = this.getSessionId();
      this.socket = io(SOCKET_URL, {
        query: { sessionId },
      });

      this.socket.on('connect', () => {
        logger.info('Socket connecté avec sessionId:', sessionId);
      });

      this.socket.on('connect_error', (error) => {
        logger.error('Erreur de connexion socket:', error);
      });
    }
    return this.socket;
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  },

  onRecentlyPlayedTracks(callback) {
    if (this.socket) {
      this.socket.on('recentlyPlayedTracks', callback);
    }
  },

  onMostPlayedTracks(callback) {
    if (this.socket) {
      this.socket.on('mostPlayedTracks', callback);
    }
  },
};

export default socketService;
