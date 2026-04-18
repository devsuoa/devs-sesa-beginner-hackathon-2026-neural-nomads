import { motion } from 'framer-motion';
import { getMoonPhase } from '../utils/astronomy';

interface Props {
  size?: number;
  animate?: boolean;
}

export default function MoonVisual({ size = 120, animate = true }: Props) {
  const moon = getMoonPhase(new Date());
  const { phase, illumination, phaseName } = moon;

  // Draw the moon shadow based on phase using SVG clipPath technique
  // phase 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
  const isWaxing = phase < 0.5;

  // The shadow ellipse x-radius: 0 at new/full, size/2 at quarters
  const shadowRx = Math.abs(Math.cos(phase * Math.PI * 2)) * size / 2;
  const shadowFill = isWaxing ? '#0a0f1e' : '#c8c8c8';
  const shadowFlip = isWaxing ? 1 : -1;

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : {}}
      animate={animate ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative inline-flex flex-col items-center gap-3"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <clipPath id="moon-clip">
            <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} />
          </clipPath>
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={illumination > 20 ? '#e8e8c0' : '#1a1a3e'} />
            <stop offset="100%" stopColor={illumination > 20 ? '#b0b090' : '#0d0d20'} />
          </radialGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow ring */}
        {illumination > 30 && (
          <circle
            cx={size / 2} cy={size / 2} r={size / 2 + 4}
            fill="none"
            stroke="rgba(232, 232, 192, 0.15)"
            strokeWidth="8"
            filter="url(#glow)"
          />
        )}

        {/* Moon base */}
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 2}
          fill="url(#moon-glow)"
        />

        {/* Shadow overlay to create phase */}
        <g clipPath="url(#moon-clip)">
          {/* Dark half */}
          <rect
            x={shadowFlip === 1 ? size / 2 : 0}
            y={0}
            width={size / 2}
            height={size}
            fill="#0a0f1e"
          />
          {/* Shadow ellipse */}
          <ellipse
            cx={size / 2}
            cy={size / 2}
            rx={shadowRx}
            ry={size / 2 - 2}
            fill={shadowFill}
          />
        </g>

        {/* Craters (visible when illuminated) */}
        {illumination > 10 && (
          <>
            <circle cx={size * 0.55} cy={size * 0.35} r={size * 0.04} fill="rgba(0,0,0,0.12)" clipPath="url(#moon-clip)" />
            <circle cx={size * 0.38} cy={size * 0.55} r={size * 0.06} fill="rgba(0,0,0,0.10)" clipPath="url(#moon-clip)" />
            <circle cx={size * 0.62} cy={size * 0.65} r={size * 0.03} fill="rgba(0,0,0,0.08)" clipPath="url(#moon-clip)" />
            <circle cx={size * 0.42} cy={size * 0.32} r={size * 0.02} fill="rgba(0,0,0,0.09)" clipPath="url(#moon-clip)" />
          </>
        )}
      </svg>

      <div className="text-center">
        <div className="text-sm font-bold text-light-text">{phaseName}</div>
        <div className="text-xs text-muted-text">{illumination}% illuminated</div>
      </div>
    </motion.div>
  );
}
