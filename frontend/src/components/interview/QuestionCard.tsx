import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

/**
 * QuestionCard - Premium question display component
 */
export const QuestionCard = ({ 
  question, 
  category, 
  difficulty, 
  onAnswer,
  onMark,
  onSkip,
  isAnswered = false
}) => {
  const difficultyColor = {
    Easy: 'from-emerald-500 to-teal-500',
    Medium: 'from-amber-500 to-orange-500',
    Hard: 'from-red-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Animated glow border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500" />
      
      {/* Card content */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-lg p-6 border border-slate-700/50">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-slate-800 text-xs font-semibold text-cyan-400 rounded-full">
                {category}
              </span>
              <span className={`px-3 py-1 bg-gradient-to-r ${difficultyColor[difficulty]} text-white text-xs font-semibold rounded-full`}>
                {difficulty}
              </span>
            </div>
          </div>
          {isAnswered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-emerald-400"
            >
              <Sparkles size={20} />
            </motion.div>
          )}
        </div>

        {/* Question Text */}
        <h3 className="text-lg font-semibold text-white mb-4 leading-relaxed">
          {question.question_text}
        </h3>

        {/* Why this question */}
        {question.context && (
          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="text-cyan-400 font-semibold">Why:</span> {question.context}
            </p>
          </div>
        )}

        {/* Expected traits */}
        {question.expected_traits && question.expected_traits.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-300 mb-2">Expected Traits:</p>
            <div className="flex flex-wrap gap-2">
              {question.expected_traits.map((trait, i) => (
                <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-500/30">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Hints */}
        {question.ai_hints && question.ai_hints.length > 0 && (
          <details className="mb-4 group/details cursor-pointer">
            <summary className="flex items-center gap-2 text-sm font-semibold text-amber-400 p-2 hover:bg-slate-800/50 rounded">
              <Zap size={16} />
              AI Hints
            </summary>
            <div className="mt-2 space-y-1 ml-4 pl-2 border-l border-amber-500/30">
              {question.ai_hints.map((hint, i) => (
                <p key={i} className="text-sm text-slate-300">• {hint}</p>
              ))}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onAnswer}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105"
          >
            Answer Question
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg transition"
          >
            Skip
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
