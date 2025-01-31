// hooks/useAudioContext.js
import { useEffect, useRef, useState } from 'react';

export const useAudioContext = (audioRef) => {
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isConnectedRef = useRef(false);
  const [analyzer, setAnalyzer] = useState(null);

  // Fonction d'initialisation qui sera appelée après une interaction utilisateur
  const initializeAudioContext = async () => {
    if (!audioRef.current || isConnectedRef.current) return;

    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      // Vérifie si le contexte est suspendu et le reprend si nécessaire
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!analyzerRef.current) {
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        analyzerRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceNodeRef.current) {
        sourceNodeRef.current =
          audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceNodeRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        isConnectedRef.current = true;
        setAnalyzer(analyzerRef.current);
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  // Initialise le contexte audio lors du premier clic sur play
  useEffect(() => {
    const handlePlay = () => {
      if (!isConnectedRef.current) {
        initializeAudioContext();
      }
    };

    // Écoute les événements de lecture sur l'élément audio
    if (audioRef.current) {
      audioRef.current.addEventListener('play', handlePlay);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
      }
    };
  }, [audioRef.current]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      isConnectedRef.current = false;
    };
  }, []);

  return analyzer;
};
