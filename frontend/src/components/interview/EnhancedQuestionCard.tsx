import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookmarkPlus, Mic, RotateCcw, Zap, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface EnhancedQuestionCardProps {
  questionId: string;
  category: string;
  difficulty: string;
  questionText: string;
  whyAsked: string;
  expectedTraits: string[];
  followUpQuestions: string[];
  aiHints: string[];
  idealAnswer: string;
  onAnswer: () => void;
  onMarkPracticed: () => void;
  onRegenerateSimilar: () => void;
  onVoiceAnswer: () => void;
  isExpanded?: boolean;
  index?: number;
}

export function EnhancedQuestionCard({
  questionId,
  category,
  difficulty,
  questionText,
  whyAsked,
  expectedTraits,
  followUpQuestions,
  aiHints,
  idealAnswer,
  onAnswer,
  onMarkPracticed,
  onRegenerateSimilar,
  onVoiceAnswer,
  isExpanded = false,
  index = 0,
}: EnhancedQuestionCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [showHints, setShowHints] = useState(false);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [marked, setMarked] = useState(false);

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
  };

  const expandVariants = {
    collapsed: { height: 'auto' },
    expanded: { height: 'auto' },
  };

  const getDifficultyBadgeColor = (diff: string) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-300 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      hard: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      expert: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    };
    return colors[diff.toLowerCase()] || colors.medium;
  };

  const getCategoryColor = (cat: string) => {
    const colors = {
      behavioral: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      technical: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      coding: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
      system_design: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
      mcq: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
      hr: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      default: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    };
    return colors[cat.toLowerCase()] || colors.default;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="group relative w-full"
    >
      {/* Background effects */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/[2%] backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all" />
        <motion.div
          animate={{
            opacity: [0, 0.05, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10"
        />
      </div>

      {/* Main card content */}
      <div className="relative z-10">
        {/* Question Header */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-6 flex items-start gap-4 group/header"
        >
          {/* Category badge */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <span
              className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(
                category,
              )}`}
            >
              {category.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyBadgeColor(difficulty)}`}>
              {difficulty.toUpperCase()}
            </span>
          </div>

          {/* Question text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-2 leading-relaxed group-hover/header:text-purple-200 transition-colors">
              {questionText}
            </h3>
            <p className="text-sm text-white/60 line-clamp-2">
              <span className="font-semibold text-white/80">Why asked:</span> {whyAsked}
            </p>
          </div>

          {/* Expand icon */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-6 h-6 text-white/40 group-hover/header:text-white/70 transition-colors" />
          </motion.div>
        </motion.button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                {/* Expected traits */}
                {expectedTraits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">Expected Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {expectedTraits.map((trait, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-xs font-semibold text-purple-200 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {trait}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints section */}
                <motion.div className="pt-2">
                  <motion.button
                    onClick={() => setShowHints(!showHints)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 text-sm font-semibold text-yellow-200 transition-all group/hint"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>AI Hints</span>
                    <ChevronDown className="w-4 h-4 ml-auto group-hover/hint:text-yellow-100 transition-colors" />
                  </motion.button>

                  <AnimatePresence>
                    {showHints && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        {aiHints.map((hint, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
                          >
                            <span className="text-xs font-bold text-yellow-300 flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-yellow-100">{hint}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Ideal answer section */}
                <motion.div>
                  <motion.button
                    onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-sm font-semibold text-emerald-200 transition-all group/ideal"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Ideal Answer</span>
                    <ChevronDown className="w-4 h-4 ml-auto group-hover/ideal:text-emerald-100 transition-colors" />
                  </motion.button>

                  <AnimatePresence>
                    {showIdealAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-sm text-emerald-50 leading-relaxed">
                          {idealAnswer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Follow-up questions */}
                {followUpQuestions.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-white mb-3">Potential Follow-ups</h4>
                    <ul className="space-y-2">
                      {followUpQuestions.map((followUp, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3 text-xs text-white/70 p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <span className="flex-shrink-0 font-bold text-purple-400 mt-0.5">•</span>
                          <span>{followUp}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                  <motion.button
                    onClick={onAnswer}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    Answer Question
                  </motion.button>

                  <motion.button
                    onClick={onVoiceAnswer}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Voice
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setMarked(!marked);
                      onMarkPracticed();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-3 rounded-lg font-bold text-sm border transition-all flex items-center gap-2 ${
                      marked
                        ? 'bg-green-500/20 border-green-500/30 text-green-200'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    {marked ? 'Practiced' : 'Mark'}
                  </motion.button>

                  <motion.button
                    onClick={onRegenerateSimilar}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default EnhancedQuestionCard;
