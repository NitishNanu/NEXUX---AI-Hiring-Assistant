import { motion } from 'framer-motion';
import NexusOrb from '../ui/NexusOrb';

export function scoreTone(score: number) {
  if (score >= 75) return { label: 'STRONG', tone: 'emerald' as const, color: '#00FF88' };
  if (score >= 50) return { label: 'MODERATE', tone: 'gold' as const, color: '#F59E0B' };
  return { label: 'WEAK', tone: 'coral' as const, color: '#FF4D6D' };
}

export default function AtsScoreSphere({ score, size = 180 }: { score: number; size?: number }) {
  const tone = scoreTone(score);
  return (
    <div className="score-sphere" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-valuetext={`${score} ${tone.label}`}>
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <NexusOrb size={size} color={tone.color} glowColor={tone.color} speed={0.28 + score / 260} />
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: `conic-gradient(${tone.color} ${score * 3.6}deg, rgba(240,244,255,0.08) 0deg)`,
            mixBlendMode: 'screen',
            opacity: 0.3
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        />
      </div>
    </div>
  );
}
