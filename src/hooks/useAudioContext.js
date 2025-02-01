// hooks/useAudioContext.js
import logger from '@/utils/logger';
import { useEffect, useRef, useState } from 'react';

export const useAudioContext = (audioRef) => {
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isConnectedRef = useRef(false);
  const [analyzer, setAnalyzer] = useState(null);

  const initializeAudioContext = async () => {
    if (!audioRef.current || isConnectedRef.current) return;

    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

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
      logger.error('Error initializing audio context:', error);
    }
  };

  useEffect(() => {
    const handlePlay = () => {
      if (!isConnectedRef.current) {
        initializeAudioContext();
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('play', handlePlay);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
      }
    };
  }, [audioRef.current]);

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
