import React, { useEffect, useRef } from 'react';

const WaveformVisualizer = ({ analyzer, isPlaying, darkMode }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const drawFrequencyBars = () => {
      if (!analyzer || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        analyzer.getByteFrequencyData(dataArray);

        // Clear with transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        const barSpacing = 1;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          // Bleu clair à foncé avec transparence
          gradient.addColorStop(0, 'rgba(33, 150, 243, 0.8)'); // Bleu clair
          gradient.addColorStop(1, 'rgba(25, 118, 210, 0.6)'); // Bleu foncé

          ctx.fillStyle = gradient;
          ctx.fillRect(
            x,
            canvas.height - barHeight,
            barWidth - barSpacing,
            barHeight
          );

          x += barWidth;
        }

        if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(draw);
        }
      };

      draw();
    };

    if (isPlaying && analyzer) {
      drawFrequencyBars();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear canvas with transparency when not playing
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, darkMode, analyzer]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24 mt-4 rounded-lg"
      width={800}
      height={100}
    />
  );
};

export default WaveformVisualizer;
