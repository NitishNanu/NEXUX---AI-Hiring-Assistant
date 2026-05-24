import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

function scoreTone(score) {
  if (score >= 75) return { color: '#10B981', variant: 'green' };
  if (score >= 50) return { color: '#F59E0B', variant: 'amber' };
  return { color: '#EF4444', variant: 'red' };
}

export default function AtsScoreRing({ score = 0, level = 'UNKNOWN', size = 120 }) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const stroke = size >= 100 ? 9 : 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(normalizedScore);

  return (
    <div
      className="flex flex-col items-center gap-3"
      aria-label={`ATS score: ${normalizedScore} out of 100, level: ${level}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tone.color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (normalizedScore / 100) * circumference }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-3xl font-semibold text-white">{normalizedScore}</span>
          <span className="mt-3 font-mono text-xs text-white/45">/100</span>
        </div>
      </div>
      <Badge variant={tone.variant}>{String(level || 'UNKNOWN').toUpperCase()}</Badge>
    </div>
  );
}
