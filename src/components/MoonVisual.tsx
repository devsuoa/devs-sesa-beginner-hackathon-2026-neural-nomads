import { motion } from 'framer-motion';
import { getMoonPhase } from '../utils/astronomy';

export default function MoonVisual({ size = 120 }: { size?: number }) {
  const { moonLon, illumination, phaseName } = getMoonPhase(new Date());

  // moonLon: 0=new, 90=first quarter, 180=full, 270=last quarter
  const isWaxing = moonLon < 180;
  // Shadow ellipse: at 0° and 180° the rx is maximal (covers half), at 90°/270° it's 0
  const rx = Math.abs(Math.cos(moonLon * Math.PI / 180)) * (size / 2 - 2);
  const r = size / 2 - 2;

  // The lit side is on the right when waxing, left when waning
  const litSide = isWaxing ? 1 : -1;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="flex flex-col items-center gap-3"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <clipPath id={`mc-${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} />
          </clipPath>
          <radialGradient id={`mg-${size}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={illumination > 5 ? '#d4cfa8' : '#1a1f36'} />
            <stop offset="100%" stopColor={illumination > 5 ? '#9e9870' : '#0d1020'} />
          </radialGradient>
          <filter id="moonGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Glow when bright */}
        {illumination > 25 && (
          <circle cx={size/2} cy={size/2} r={r + 6} fill="none"
            stroke="rgba(220,210,160,0.12)" strokeWidth={12} filter="url(#moonGlow)" />
        )}

        {/* Moon base */}
        <circle cx={size/2} cy={size/2} r={r} fill={`url(#mg-${size})`} />

        {/* Phase shadow */}
        <g clipPath={`url(#mc-${size})`}>
          {/* Dark half */}
          <rect
            x={litSide === 1 ? 0 : size / 2}
            y={0} width={size / 2} height={size}
            fill="#050a18"
          />
          {/* Ellipse transitions between full dark and full lit */}
          <ellipse
            cx={size / 2} cy={size / 2}
            rx={rx} ry={r}
            fill={isWaxing ? '#d4cfa8' : '#050a18'}
          />
        </g>

        {/* Craters on lit portion */}
        {illumination > 8 && (
          <g clipPath={`url(#mc-${size})`} opacity="0.35">
            <circle cx={size * 0.55} cy={size * 0.36} r={size * 0.045} fill="#0a0f1e" />
            <circle cx={size * 0.39} cy={size * 0.56} r={size * 0.058} fill="#0a0f1e" />
            <circle cx={size * 0.62} cy={size * 0.64} r={size * 0.032} fill="#0a0f1e" />
            <circle cx={size * 0.44} cy={size * 0.30} r={size * 0.025} fill="#0a0f1e" />
          </g>
        )}
      </svg>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-200">{phaseName}</p>
        <p className="text-xs text-slate-500">{illumination}% illuminated</p>
      </div>
    </motion.div>
  );
}
