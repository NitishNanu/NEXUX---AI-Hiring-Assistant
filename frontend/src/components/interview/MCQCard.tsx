import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

/**
 * MCQCard - Multiple choice question component
 */
export const MCQCard = ({
  question,
  options,
  correctOptionIndex,
  explanation,
  onSelectOption,
  selectedOption = null,
  isSubmitted = false,
  showExplanation = false,
  onShowExplanation,
}) => {
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === correctOptionIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Glow border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500" />

      {/* Card */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-lg p-6 border border-slate-700/50">
        {/* Question */}
        <h3 className="text-lg font-semibold text-white mb-6">{question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = index === correctOptionIndex;
            const showCorrect = isSubmitted && isCorrectOption;
            const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

            return (
              <motion.button
                key={index}
                whileHover={{ x: 4 }}
                onClick={() => {
                  if (!isSubmitted) {
                    onSelectOption(index);
                  }
                }}
                disabled={isSubmitted}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showCorrect
                    ? 'bg-emerald-900/20 border-emerald-500 ring-1 ring-emerald-400'
                    : showIncorrect
                    ? 'bg-red-900/20 border-red-500 ring-1 ring-red-400'
                    : isSelected
                    ? 'bg-cyan-900/20 border-cyan-500 ring-1 ring-cyan-400'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Option indicator */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm ${
                      showCorrect
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : showIncorrect
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'border-slate-600 text-slate-400'
                    }`}
                  >
                    {showCorrect ? (
                      <CheckCircle2 size={16} />
                    ) : showIncorrect ? (
                      <XCircle size={16} />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>

                  {/* Option text */}
                  <span className={`flex-1 ${isSelected || showCorrect || showIncorrect ? 'text-white font-semibold' : 'text-slate-300'}`}>
                    {option}
                  </span>

                  {/* Status icon */}
                  {isSubmitted && (
                    showCorrect ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : showIncorrect ? (
                      <XCircle size={20} className="text-red-400" />
                    ) : null
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation toggle */}
        {isSubmitted && explanation && (
          <motion.button
            onClick={onShowExplanation}
            className="w-full flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-900/30 transition"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${showExplanation ? 'rotate-180' : ''}`}
            />
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </motion.button>
        )}

        {/* Explanation content */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-lg"
            >
              <p className="text-sm text-blue-100">{explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/**
 * MCQSection - Multiple MCQ questions in a row
 */
export const MCQSection = ({
  questions,
  onAnswerQuestion,
  answers = {},
  submittedAnswers = {},
}) => {
  const [expandedExplanation, setExpandedExplanation] = useState(null);

  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <MCQCard
          key={q.id}
          question={q.question_text}
          options={q.options}
          correctOptionIndex={q.correct_option_index}
          explanation={q.explanation}
          selectedOption={answers[q.id]}
          isSubmitted={q.id in submittedAnswers}
          showExplanation={expandedExplanation === q.id}
          onShowExplanation={() => setExpandedExplanation(expandedExplanation === q.id ? null : q.id)}
          onSelectOption={(optionIndex) => onAnswerQuestion(q.id, optionIndex)}
        />
      ))}
    </div>
  );
};

export default MCQCard;
