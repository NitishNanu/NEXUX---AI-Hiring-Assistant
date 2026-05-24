import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, SkipForward } from 'lucide-react';

/**
 * InterviewTimeline - Shows question progress
 */
export const InterviewTimeline = ({
  questions,
  currentIndex = 0,
  answers = {},
  skipped = {},
  onSelectQuestion,
}) => {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
      {questions.map((question, index) => {
        const isAnswered = answers[index];
        const isSkipped = skipped[index];
        const isCurrent = index === currentIndex;

        return (
          <motion.button
            key={index}
            whileHover={{ x: 4 }}
            onClick={() => onSelectQuestion(index)}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              isCurrent
                ? 'bg-cyan-600/20 border border-cyan-500/50 ring-1 ring-cyan-400'
                : isAnswered
                ? 'bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-900/30'
                : isSkipped
                ? 'bg-amber-900/20 border border-amber-500/30 hover:bg-amber-900/30'
                : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Status icon */}
              <div>
                {isAnswered ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : isSkipped ? (
                  <SkipForward size={20} className="text-amber-400" />
                ) : isCurrent ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Circle size={20} className="text-cyan-400 fill-cyan-400" />
                  </motion.div>
                ) : (
                  <Circle size={20} className="text-slate-500" />
                )}
              </div>

              {/* Question number and text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Q{index + 1}</p>
                <p className="text-sm text-slate-200 truncate">{question.question_text}</p>
              </div>

              {/* Category badge */}
              <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                question.category === 'behavioral'
                  ? 'bg-blue-900/30 text-blue-300'
                  : question.category === 'coding'
                  ? 'bg-purple-900/30 text-purple-300'
                  : question.category === 'technical'
                  ? 'bg-cyan-900/30 text-cyan-300'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {question.category.split('_').pop()}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

/**
 * ProgressGauge - Circular progress indicator
 */
export const ProgressGauge = ({
  value = 0,
  max = 100,
  label = 'Progress',
  size = 'md', // sm, md, lg
  color = 'cyan',
  showPercentage = true,
}) => {
  const sizeMap = {
    sm: { circle: 60, text: 'text-lg' },
    md: { circle: 100, text: 'text-2xl' },
    lg: { circle: 140, text: 'text-3xl' },
  };

  const colorMap = {
    cyan: { gradient: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-500' },
    emerald: { gradient: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500' },
    purple: { gradient: 'from-purple-500 to-pink-600', ring: 'ring-purple-500' },
    amber: { gradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-500' },
  };

  const percentage = (value / max) * 100;
  const { circle, text } = sizeMap[size];
  const { gradient, ring } = colorMap[color];

  const circumference = 2 * Math.PI * (circle / 2 - 8);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: circle, height: circle }}>
        <svg width={circle} height={circle} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={circle / 2}
            cy={circle / 2}
            r={circle / 2 - 8}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-800"
          />
          {/* Progress circle */}
          <motion.circle
            cx={circle / 2}
            cy={circle / 2}
            r={circle / 2 - 8}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" className={`text-${color}-500`} />
              <stop offset="100%" stopColor="currentColor" className={`text-${color}-600`} />
            </linearGradient>
          </defs>
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={Math.floor(value)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`${text} font-bold text-white`}
          >
            {Math.round(percentage)}%
          </motion.div>
          <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * ScoreDisplay - Large score display for quiz results
 */
export const ScoreDisplay = ({ score, maxScore = 100, feedback }) => {
  const scorePercentage = (score / maxScore) * 100;
  const getColor = (percentage) => {
    if (percentage >= 80) return { bg: 'from-emerald-600 to-teal-600', text: 'text-emerald-400' };
    if (percentage >= 60) return { bg: 'from-cyan-600 to-blue-600', text: 'text-cyan-400' };
    if (percentage >= 40) return { bg: 'from-amber-600 to-orange-600', text: 'text-amber-400' };
    return { bg: 'from-red-600 to-pink-600', text: 'text-red-400' };
  };

  const { bg, text } = getColor(scorePercentage);

  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="text-center"
    >
      <div className={`relative w-48 h-48 mx-auto mb-6 bg-gradient-to-br ${bg} rounded-full p-1`}>
        <div className="absolute inset-1 bg-slate-900 rounded-full flex flex-col items-center justify-center">
          <motion.div
            key={score}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-bold ${text}`}
          >
            {score}
          </motion.div>
          <p className="text-sm text-slate-400">/{ maxScore}</p>
        </div>
      </div>
      {feedback && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-slate-200 mb-4"
        >
          {feedback}
        </motion.p>
      )}
    </motion.div>
  );
};

export default InterviewTimeline;
