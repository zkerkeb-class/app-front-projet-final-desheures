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

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        const barSpacing = 1;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);

          if (darkMode) {
            gradient.addColorStop(0, 'rgba(0, 191, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(210, 25, 155, 0.4)');
          } else {
            gradient.addColorStop(0, 'rgba(0, 0, 139, 0.4)');
            gradient.addColorStop(1, 'rgba(128, 0, 128, 0.4)');
          }

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

  return <canvas ref={canvasRef} />;
};

export default WaveformVisualizer;
