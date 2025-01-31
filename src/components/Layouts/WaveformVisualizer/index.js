import React, { useEffect, useRef, useState } from 'react';

const WaveformVisualizer = ({ audioRef, darkMode }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation du contexte audio
  const initializeAudioContext = async () => {
    if (!audioRef?.current || !canvasRef?.current || isInitialized) return;

    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaElementSource(
        audioRef.current
      );

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      analyserRef.current.fftSize = 2048;
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  // Effet pour l'initialisation
  useEffect(() => {
    if (audioRef?.current && !isInitialized) {
      initializeAudioContext();
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsInitialized(false);
    };
  }, [audioRef, isInitialized]);

  // Effet pour le rendu de la waveform
  useEffect(() => {
    if (!isInitialized || !canvasRef.current || !analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!ctx || !analyserRef.current) return;

      const width = canvas.width;
      const height = canvas.height;

      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = darkMode ? '#1a1a1a' : '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = darkMode ? '#00ff00' : '#000000';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [darkMode, isInitialized]);

  return (
    <div className="w-full h-24">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        width={800}
        height={100}
      />
    </div>
  );
};

export default WaveformVisualizer;
