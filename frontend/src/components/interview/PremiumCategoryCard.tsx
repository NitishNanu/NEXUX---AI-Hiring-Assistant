import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap } from 'lucide-react';

/**
 * PremiumCategoryCard - Interactive interview category selection
 */
export const PremiumCategoryCard = ({
  icon: Icon,
  title,
  description,
  duration,
  difficulty,
  style,
  isSelected = false,
  onClick,
  stats,
}) => {
  const difficultyColor = {
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-red-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group text-left p-6 rounded-xl transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-cyan-400 bg-cyan-900/20' 
          : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Animated glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
      
      {/* Card content */}
      <div className="relative">
        {/* Icon */}
        <motion.div
          animate={{ scale: isSelected ? 1.1 : 1 }}
          className="mb-4 p-3 w-fit bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg"
        >
          <Icon className="w-6 h-6 text-purple-400" />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {duration}
          </div>
          <div className={`font-semibold ${difficultyColor[difficulty]}`}>
            {difficulty}
          </div>
          {stats && (
            <div className="flex items-center gap-1 text-cyan-400">
              <TrendingUp size={14} />
              {stats}
            </div>
          )}
        </div>

        {/* Footer info */}
        {style && (
          <div className="pt-4 border-t border-slate-700 text-xs text-slate-400">
            <span className="text-cyan-400">{style}</span> interview style
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 w-3 h-3 bg-cyan-400 rounded-full"
          />
        )}
      </div>
    </motion.button>
  );
};

export default PremiumCategoryCard;
