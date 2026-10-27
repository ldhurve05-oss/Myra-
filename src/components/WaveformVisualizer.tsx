import React, { useEffect, useRef } from 'react';
import { AssistantStatus, SentimentAnalysis } from '../types/assistant';

interface WaveformVisualizerProps {
  status: AssistantStatus;
  sentiment?: SentimentAnalysis;
  isGfMode?: boolean;
  pauseAnimations?: boolean;
  size?: number; // Canvas size in px (default 270)
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  status,
  sentiment,
  isGfMode = false,
  pauseAnimations = false,
  size = 270,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active sentiment defaults
  const activePattern = sentiment?.pattern || (isGfMode ? 'pink_pulse' : 'blue_ripple');
  const score = sentiment?.score ?? (isGfMode ? 0.94 : 0.6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Retina display scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.32; // Sits just outside the center orb (approx 86px radius)

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      if (pauseAnimations) {
        // Draw single static decorative ring if animations paused
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + 12, 0, Math.PI * 2);
        ctx.strokeStyle = activePattern === 'pink_pulse' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      // Determine animation intensity based on assistant status & sentiment score
      const isSpeaking = status === 'speaking';
      const isListening = status === 'listening';
      const isThinking = status === 'thinking';

      // Speed of time evolution
      let speed = 0.035;
      if (isSpeaking) speed = 0.07 * (0.8 + score * 0.6);
      else if (isThinking) speed = 0.055;
      else if (isListening) speed = 0.045;
      else speed = 0.025;

      time += speed;

      // Status-dependent amplitude multiplier
      let amplitudeMultiplier = 1.0;
      if (isSpeaking) amplitudeMultiplier = 1.8 + score * 1.4;
      else if (isListening) amplitudeMultiplier = 1.2;
      else if (isThinking) amplitudeMultiplier = 0.9;
      else amplitudeMultiplier = 0.5 + score * 0.4;

      // Render based on sentiment pattern
      switch (activePattern) {
        case 'pink_pulse': {
          // JOYFUL / LOVING: Rhythmic heartbeat pulse with blooming radiant crests and floating sparkles
          const pulse = Math.sin(time * 2.2) * 0.5 + Math.sin(time * 4.4) * 0.25; // Heartbeat cadence
          const dynamicRadius = baseRadius + (pulse > 0 ? pulse * 14 * amplitudeMultiplier : 0);

          // 1. Dual expanding heartbeat echo rings
          for (let r = 0; r < 2; r++) {
            const rippleProgress = (time * 0.7 + r * 0.5) % 1;
            const rippleR = baseRadius + rippleProgress * 42;
            const alpha = Math.max(0, (1 - rippleProgress) * 0.35 * (score > 0.8 ? 1.2 : 0.8));

            ctx.beginPath();
            ctx.arc(centerX, centerY, rippleR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // 2. Harmonic waveform contour with dancing petals
          const points = 48;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            // 4-petal heart-like harmonic wave
            const harmonic =
              Math.sin(angle * 6 + time * 3) * 5 * amplitudeMultiplier +
              Math.cos(angle * 3 - time * 2) * 4 * amplitudeMultiplier;
            const r = dynamicRadius + harmonic;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const pinkGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, size / 2);
          pinkGrad.addColorStop(0, 'rgba(236, 72, 153, 0.05)');
          pinkGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.25)');
          pinkGrad.addColorStop(1, 'rgba(217, 70, 239, 0)');
          ctx.fillStyle = pinkGrad;
          ctx.fill();

          ctx.strokeStyle = `rgba(244, 63, 94, ${0.7 + score * 0.25})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 3. Floating Joyful Sparkle Particles along perimeter
          const particleCount = 8;
          for (let p = 0; p < particleCount; p++) {
            const pAngle = (p / particleCount) * Math.PI * 2 + time * 0.6;
            const pDist = dynamicRadius + 8 + Math.sin(time * 3 + p) * 6;
            const px = centerX + Math.cos(pAngle) * pDist;
            const py = centerY + Math.sin(pAngle) * pDist;

            ctx.beginPath();
            ctx.arc(px, py, 2 + Math.sin(time * 4 + p) * 1, 0, Math.PI * 2);
            ctx.fillStyle = p % 2 === 0 ? '#fbcfe8' : '#fda4af';
            ctx.fill();
          }
          break;
        }

        case 'blue_ripple': {
          // CALM / TRANQUIL: Gentle undulating oceanic ripples with smooth sinusoidal rings
          // 1. Concentric water ripples propagating outward smoothly
          const ringCount = 3;
          for (let i = 0; i < ringCount; i++) {
            const phase = (time * 0.35 + i / ringCount) % 1;
            const r = baseRadius + phase * 40;
            const alpha = Math.max(0, (1 - phase) * 0.45);

            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 2 - phase;
            ctx.stroke();
          }

          // 2. Liquid sinusoidal undulating wave perimeter
          const points = 64;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wave =
              Math.sin(angle * 4 + time * 1.5) * 4 * amplitudeMultiplier +
              Math.sin(angle * 8 - time * 2) * 2.5 * amplitudeMultiplier;
            const r = baseRadius + 6 + wave;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const blueGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, size / 2);
          blueGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
          blueGrad.addColorStop(0.75, 'rgba(59, 130, 246, 0.22)');
          blueGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = blueGrad;
          ctx.fill();

          ctx.strokeStyle = `rgba(56, 189, 248, ${0.75 + score * 0.2})`;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;
          break;
        }

        case 'amber_energy': {
          // ENTHUSIASTIC / ENERGETIC: High-frequency electrical spikes, fiery bursts & oscillating crests
          const points = 54;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            // High frequency jagged spike oscillation
            const spikeIndex = i % 2 === 0 ? 1 : -0.6;
            const freq =
              Math.sin(angle * 12 + time * 5) * 7 * amplitudeMultiplier * spikeIndex +
              Math.cos(angle * 6 - time * 3) * 5 * amplitudeMultiplier;
            const r = baseRadius + 8 + freq;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const amberGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, size / 2);
          amberGrad.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
          amberGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.25)');
          amberGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
          ctx.fillStyle = amberGrad;
          ctx.fill();

          ctx.strokeStyle = `rgba(245, 158, 11, ${0.85 + score * 0.15})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Electric orbital dashes
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius + 18, 0, Math.PI * 2);
          ctx.setLineDash([8, 12]);
          ctx.lineDashOffset = -time * 28;
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.5)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'violet_glow': {
          // EMPATHETIC / TENDER: Ethereal multi-lobed breathing ribbon with deep celestial harmony
          const points = 72;
          // Dual overlapping ribbons with phase delay
          for (let layer = 0; layer < 2; layer++) {
            ctx.beginPath();
            const phaseShift = layer * 1.5;
            for (let i = 0; i <= points; i++) {
              const angle = (i / points) * Math.PI * 2;
              // 5-lobed breathing flower waveform
              const harmonic =
                Math.sin(angle * 5 + time * 2 + phaseShift) * 6 * amplitudeMultiplier +
                Math.cos(angle * 2 - time * 1.2) * 3 * amplitudeMultiplier;
              const r = baseRadius + (layer === 0 ? 6 : 14) + harmonic;
              const x = centerX + Math.cos(angle) * r;
              const y = centerY + Math.sin(angle) * r;

              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();

            ctx.strokeStyle =
              layer === 0
                ? `rgba(168, 85, 247, ${0.75 + score * 0.2})`
                : `rgba(192, 132, 252, ${0.45 + score * 0.2})`;
            ctx.lineWidth = layer === 0 ? 2.4 : 1.5;
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          break;
        }

        case 'emerald_wave':
        default: {
          // BALANCED / HARMONIOUS: Crisp flowing equalizer waves and dual balanced orbital rings
          const points = 60;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wave =
              Math.sin(angle * 8 + time * 3) * 5 * amplitudeMultiplier +
              Math.cos(angle * 4 - time * 2) * 3 * amplitudeMultiplier;
            const r = baseRadius + 8 + wave;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          const emeraldGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, size / 2);
          emeraldGrad.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
          emeraldGrad.addColorStop(0.7, 'rgba(20, 184, 166, 0.22)');
          emeraldGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
          ctx.fillStyle = emeraldGrad;
          ctx.fill();

          ctx.strokeStyle = `rgba(16, 185, 129, ${0.8 + score * 0.2})`;
          ctx.lineWidth = 2.4;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Outer secondary harmonic wave ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius + 18 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          break;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status, activePattern, score, pauseAnimations, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="absolute inset-0 pointer-events-none transition-opacity duration-500"
      aria-hidden="true"
    />
  );
};
