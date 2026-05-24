import { motion } from 'framer-motion';

export default function SkillPill({ skill, variant = 'indigo' }) {
  const palette = variant === 'red'
    ? 'border-status-red/30 bg-status-red/10 text-red-100'
    : variant === 'green'
      ? 'border-status-green/30 bg-status-green/10 text-green-100'
      : 'border-brand-indigo/25 bg-brand-indigo/15 text-white';

  return (
    <motion.span
      whileHover={{ y: -2 }}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${palette}`}
    >
      {skill}
    </motion.span>
  );
}
