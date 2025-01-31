// First, create a new hook to manage the audio context
import { useEffect, useRef } from 'react';

export const useAudioContext = (audioRef) => {
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const initializeAudioContext = async () => {
      if (!audioRef.current || isConnectedRef.current) return;

      try {
        if (!audioContextRef.current) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContext();
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
        }

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    initializeAudioContext();

    // Cleanup only on complete unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyzerRef.current = null;
        sourceNodeRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [audioRef]);

  return analyzerRef.current;
};
