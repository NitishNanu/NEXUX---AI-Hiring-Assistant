import { motion } from 'framer-motion';
import { ChevronRight, Clock, Zap, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

interface PremiumCategoryCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  style: string;
  aiConfidence?: number;
  passRate?: string;
  onClick: () => void;
  isActive?: boolean;
  isSelected?: boolean;
  index?: number;
}

export function PremiumInterviewCard({
  icon,
  title,
  description,
  duration,
  difficulty,
  style,
  aiConfidence = 75,
  passRate = '78%',
  onClick,
  isActive = false,
  isSelected = false,
  index = 0,
}: PremiumCategoryCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  const glowVariants = {
    initial: { opacity: 0.5 },
    hover: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'from-green-400/30 to-emerald-400/30 border-green-500/30 text-green-300';
      case 'medium':
        return 'from-yellow-400/30 to-orange-400/30 border-yellow-500/30 text-yellow-300';
      case 'hard':
        return 'from-red-400/30 to-orange-400/30 border-red-500/30 text-red-300';
      case 'expert':
        return 'from-purple-600/30 to-pink-600/30 border-purple-500/30 text-purple-300';
      default:
        return 'from-blue-400/30 to-cyan-400/30 border-blue-500/30 text-blue-300';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`group relative h-full w-full text-left transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-purple-500 scale-105'
          : ''
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 group-hover:border-white/40 transition-all`}
        />

        {/* Animated glow on hover */}
        <motion.div
          variants={glowVariants}
          initial="initial"
          whileHover="hover"
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getDifficultyColor(difficulty).split(' ')[0]} opacity-0 group-hover:opacity-20 blur-xl transition-opacity`}
        />

        {/* Border glow effect */}
        {isSelected && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-10"
          />
        )}
      </div>

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all"
          >
            <div className="w-6 h-6 text-purple-400/80 group-hover:text-purple-300 transition-colors">
              {icon}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
          </motion.div>
        </div>

        {/* Title and description */}
        <div className="flex-1 mb-4">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors line-clamp-2">
            {description}
          </p>
        </div>

        {/* Footer stats */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          {/* Meta info row 1 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
            <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getDifficultyColor(difficulty)} border transition-all group-hover:shadow-lg`}>
              <span className="text-xs font-semibold uppercase tracking-wider">
                {difficulty}
              </span>
            </div>
          </div>

          {/* Meta info row 2 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>{style}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-white/70">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>{passRate}</span>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white/60">AI Confidence</span>
              <span className="text-xs font-bold text-purple-300">{aiConfidence}%</span>
            </div>
            <motion.div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${aiConfidence}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
              />
            </motion.div>
          </div>
        </div>

        {/* Active state indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
            animate={{
              boxShadow: [
                '0 0 10px rgba(74, 222, 128, 0.5)',
                '0 0 20px rgba(74, 222, 128, 0.8)',
                '0 0 10px rgba(74, 222, 128, 0.5)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </div>

      {/* Hover gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none z-0"
      />
    </motion.button>
  );
}

export default PremiumInterviewCard;
