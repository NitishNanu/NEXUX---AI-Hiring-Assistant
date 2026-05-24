import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Copy, RefreshCw, X } from 'lucide-react';

/**
 * AnswerInputModal - Text/voice input for interview answers
 */
export const AnswerInputModal = ({
  question,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // TODO: Send audio to backend for transcription
        console.log('Audio recorded:', audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordedTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Your Answer</h3>
              <p className="text-sm text-slate-400">Take your time. We'll evaluate it for you.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Question reference */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Question:</p>
              <p className="text-white font-medium">{question?.question_text}</p>
            </div>

            {/* Text input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Write Your Answer
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Take your time to structure your thoughts."
                className="w-full h-48 p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-2">
                {answer.length} characters | Recommended: 200-500 characters
              </p>
            </div>

            {/* Voice input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                Or Record Your Answer
              </label>
              <div className="flex gap-3">
                {isRecording ? (
                  <motion.button
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    onClick={handleStopRecording}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                  >
                    <MicOff size={18} />
                    Stop Recording {formatTime(recordedTime)}
                  </motion.button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                  >
                    <Mic size={18} />
                    Start Recording
                  </button>
                )}
              </div>
            </div>

            {/* Helpful hints */}
            {question?.ai_hints && question.ai_hints.length > 0 && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-semibold text-blue-300 mb-2">💡 Tips:</p>
                <ul className="space-y-1 text-sm text-slate-300">
                  {question.ai_hints.map((hint, i) => (
                    <li key={i}>• {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 bg-slate-800/50 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!answer.trim() || isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Answer
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnswerInputModal;
