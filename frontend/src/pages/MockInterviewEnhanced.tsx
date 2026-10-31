import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Brain,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  Award,
  MessageSquare,
  Loader,
  Play,
  ChevronRight,
  Send,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PremiumInterviewCard } from '../components/interview/PremiumInterviewCard';
import { InterviewCodingEditor } from '../components/interview/InterviewCodingEditor';
import { InterviewAnalyticsDashboard } from '../components/interview/InterviewAnalyticsDashboard';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { nexusClient } from '../api/nexusClient';
import { codingApi } from '../api/codingApi';
import { nexusToast } from '../components/ui/NexusToast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InterviewRole {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  rounds: number;
  duration: string;
  difficulty: string;
  style: string;
  icon: React.ElementType;
  skills: string[];
}

interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: string;
  questionText: string;
  whyAsked: string;
  expectedTraits: string[];
  followUpQuestions: string[];
  aiHints: string[];
  idealAnswer: string;
  description?: string;
  constraints?: string[];
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  expectedTimeComplexity?: string;
  expectedSpaceComplexity?: string;
}

interface AnswerEvaluation {
  overall_score: number;
  communication: number;
  technical_depth: number;
  confidence: number;
  problem_solving: number;
  leadership: number;
  clarity: number;
  correctness: number;
  star_format_adherence: number;
  strengths: string[];
  weaknesses: string[];
  missing_concepts: string[];
  improvements: string[];
  ideal_answer_full: string;
  rewritten_answer: string;
  follow_up_questions: string[];
  readiness_score: number;
}

interface SessionAnalytics {
  communication: number;
  technical_depth: number;
  confidence: number;
  problem_solving: number;
  leadership: number;
  system_design: number;
  coding: number;
  readiness_score: number;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const TOTAL_QUESTIONS = 5;

const interviewRoles: InterviewRole[] = [
  {
    id: 'sde',
    title: 'SDE',
    subtitle: 'Software Development Engineer',
    description: 'Full stack coding interviews with system design',
    rounds: 4,
    duration: '60 min',
    difficulty: 'Hard',
    style: 'FAANG',
    icon: Code2,
    skills: ['DSA', 'System Design', 'Coding'],
  },
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    subtitle: 'React, Vue, Angular',
    description: 'UI/UX, component design, state management',
    rounds: 3,
    duration: '45 min',
    difficulty: 'Medium',
    style: 'Product',
    icon: Sparkles,
    skills: ['React', 'CSS', 'UX Design'],
  },
  {
    id: 'backend',
    title: 'Backend Engineer',
    subtitle: 'API & Infrastructure',
    description: 'API design, databases, microservices, system architecture',
    rounds: 4,
    duration: '60 min',
    difficulty: 'Hard',
    style: 'Startup',
    icon: TrendingUp,
    skills: ['APIs', 'Databases', 'Scalability'],
  },
  {
    id: 'ml',
    title: 'ML Engineer',
    subtitle: 'Deep Learning & AI',
    description: 'Machine learning, deep learning, NLP — model design and optimization',
    rounds: 4,
    duration: '90 min',
    difficulty: 'Hard',
    style: 'Research',
    icon: Brain,
    skills: ['ML', 'DL', 'Python'],
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    subtitle: 'Infrastructure & CI/CD',
    description: 'Cloud infrastructure, CI/CD, containerisation, monitoring',
    rounds: 3,
    duration: '45 min',
    difficulty: 'Medium',
    style: 'Enterprise',
    icon: Zap,
    skills: ['Kubernetes', 'AWS', 'Docker'],
  },
  {
    id: 'pm',
    title: 'Product Manager',
    subtitle: 'Product Strategy',
    description: 'Product strategy, user research, metrics, case studies',
    rounds: 3,
    duration: '50 min',
    difficulty: 'Medium',
    style: 'Executive',
    icon: Target,
    skills: ['Strategy', 'Analytics', 'Communication'],
  },
  {
    id: 'faang_mode',
    title: 'FAANG Mode',
    subtitle: 'Google, Meta, Amazon, Apple, Netflix',
    description: 'Intense simulation with high bar-raising and deep dives',
    rounds: 5,
    duration: '120 min',
    difficulty: 'Hard',
    style: 'Elite',
    icon: Award,
    skills: ['All Core Skills', 'System Design', 'Leadership'],
  },
  {
    id: 'rapid_fire',
    title: 'Rapid Fire',
    subtitle: 'Quick Assessment',
    description: 'Quick-fire questions across multiple topics to test breadth',
    rounds: 1,
    duration: '20 min',
    difficulty: 'Hard',
    style: 'Intense',
    icon: MessageSquare,
    skills: ['Breadth', 'Quick Thinking', 'Knowledge'],
  },
];

const interviewTypeMap: Record<string, string> = {
  sde: 'coding',
  backend: 'coding',
  ml: 'coding',
  faang_mode: 'coding',
  frontend: 'technical',
  devops: 'technical',
  pm: 'behavioral',
  rapid_fire: 'technical',
};

const onboardingStages = [
  { label: 'Scanning Resume', icon: '📄', duration: 2 },
  { label: 'Extracting Skills', icon: '🎯', duration: 2 },
  { label: 'Generating Questions', icon: '🤖', duration: 2 },
  { label: 'Building Interview', icon: '🏗️', duration: 1 },
];

const motionContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const motionItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MockInterview() {
  const navigate = useNavigate();

  // ── Step flow ───────────────────────────────────────────────────────
  const [step, setStep] = useState<'selection' | 'onboarding' | 'interview' | 'results'>('selection');
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null);
  const [onboardingProgress, setOnboardingProgress] = useState(0);

  // ── Session ─────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ── Answer capture ──────────────────────────────────────────────────
  // FIX P0-06: answerText is now bound to the textarea
  const [answerText, setAnswerText] = useState('');
  const answerStartTimeRef = useRef<number>(Date.now());

  // ── Evaluation state ────────────────────────────────────────────────
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null);

  // ── UI state ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const totalQuestions = sessionId ? TOTAL_QUESTIONS : questions.length;
  const progressPercent = totalQuestions > 0
    ? ((currentQuestionIndex + 1) / totalQuestions) * 100
    : 0;

  // Reset answer when question changes
  useEffect(() => {
    setAnswerText('');
    setHints([]);
    setShowHints(false);
    setShowEvaluation(false);
    setCurrentEvaluation(null);
    answerStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  // ---------------------------------------------------------------------------
  // API helpers
  // ---------------------------------------------------------------------------

  const fetchNextQuestion = useCallback(async (sid: string): Promise<InterviewQuestion | null> => {
    setQuestionLoading(true);
    try {
      const { data } = await nexusClient.get<InterviewQuestion>(`/mock-interview/question/${sid}`);
      setQuestions(prev => [...prev, data]);
      return data;
    } catch (err: unknown) {
      console.error('fetchNextQuestion failed:', err);
      nexusToast('Unable to fetch the next question.', 'error');
      return null;
    } finally {
      setQuestionLoading(false);
    }
  }, []);

  const handleGetHints = useCallback(async () => {
    if (!sessionId || !currentQuestion?.id) {
      nexusToast('No active question for hints.', 'error');
      return;
    }
    try {
      const { data } = await nexusClient.get<{ hints: string[] }>(
        `/mock-interview/hints/${sessionId}/${currentQuestion.id}`
      );
      setHints(data.hints || []);
      setShowHints(true);
    } catch {
      nexusToast('Unable to load hints.', 'error');
    }
  }, [sessionId, currentQuestion]);

  // ---------------------------------------------------------------------------
  // Submit text / behavioral answer  (FIX P0-06)
  // ---------------------------------------------------------------------------

  const handleSubmitTextAnswer = useCallback(async () => {
    if (!answerText.trim()) {
      nexusToast('Please type your answer before submitting.', 'error');
      return;
    }
    if (!sessionId || !currentQuestion?.id) {
      nexusToast('No active interview session.', 'error');
      return;
    }

    const durationSeconds = Math.round((Date.now() - answerStartTimeRef.current) / 1000);
    setSubmittingAnswer(true);

    try {
      const { data } = await nexusClient.post<AnswerEvaluation>('/mock-interview/submit-answer', {
        interview_session_id: sessionId,
        question_id: currentQuestion.id,
        answer_text: answerText.trim(),
        duration_seconds: durationSeconds,
      });

      setCurrentEvaluation(data);
      setShowEvaluation(true);
      nexusToast.success(`Evaluated! Score: ${data.overall_score}/100`);
    } catch (err: unknown) {
      console.error('handleSubmitTextAnswer failed:', err);
      nexusToast('Failed to evaluate your answer. Please try again.', 'error');
    } finally {
      setSubmittingAnswer(false);
    }
  }, [answerText, sessionId, currentQuestion]);

  // ---------------------------------------------------------------------------
  // Advance to next question or finish
  // ---------------------------------------------------------------------------

  const handleNextQuestion = useCallback(async () => {
    if (!sessionId) {
      // Demo mode
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        setStep('results');
      }
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      const next = await fetchNextQuestion(sessionId);
      if (next) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        await handleEndInterview();
      }
    } else {
      await handleEndInterview();
    }
  }, [sessionId, currentQuestionIndex, questions.length, fetchNextQuestion]);

  // ---------------------------------------------------------------------------
  // Coding challenge handlers
  // ---------------------------------------------------------------------------

  const handleCodingRun = useCallback(async (code: string, language: string) => {
    if (!sessionId || !currentQuestion?.id) {
      const message = 'Cannot run code without an active interview session.';
      nexusToast(message, 'error');
      return { success: false, passed: 0, total: 0, test_results: [], execution_time_ms: 0, errors: [message] };
    }
    return codingApi.runCode({
      interview_session_id: sessionId,
      question_id: currentQuestion.id,
      code,
      language: language as any,
      duration_seconds: 0,
    });
  }, [sessionId, currentQuestion]);

  const handleCodingSubmit = useCallback(async (code: string, language: string) => {
    if (!sessionId || !currentQuestion?.id) {
      nexusToast('No active interview session available.', 'error');
      return;
    }
    setLoading(true);
    try {
      const evaluation = await codingApi.submitSolution({
        interview_session_id: sessionId,
        question_id: currentQuestion.id,
        code,
        language: language as any,
        duration_seconds: Math.round((Date.now() - answerStartTimeRef.current) / 1000),
      });
      nexusToast.success(`Submitted! ${evaluation.passed_tests}/${evaluation.total_tests} tests passed.`);
      await handleNextQuestion();
    } catch (err) {
      console.error('handleCodingSubmit failed:', err);
      nexusToast('Failed to submit coding solution.', 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentQuestion, handleNextQuestion]);

  // ---------------------------------------------------------------------------
  // Session lifecycle
  // ---------------------------------------------------------------------------

  const handleRoleSelect = useCallback((role: InterviewRole) => {
    setSelectedRole(role);
    setOnboardingProgress(0);
    setStep('onboarding');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setOnboardingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => startInterview(role), 500);
      }
    }, 2000);
  }, []);

  const startInterview = async (role: InterviewRole) => {
    setLoading(true);
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setHints([]);
    setCurrentEvaluation(null);
    setSessionAnalytics(null);

    try {
      const interviewType = interviewTypeMap[role.id] || 'technical';
      const { data: session } = await nexusClient.post('/mock-interview/start', {
        interview_type: interviewType,
        selected_role: role.title,
      });

      const sid: string = session.session_id;
      setSessionId(sid);

      const question = await fetchNextQuestion(sid);
      if (!question) throw new Error('No question returned from server');

      setStep('interview');
      nexusToast.success(`${role.title} interview started!`);
    } catch (err: unknown) {
      console.error('startInterview failed:', err);
      nexusToast('Could not connect to the interview server — running demo mode.', 'error');

      // Demo mode fallback
      const mockQuestions: InterviewQuestion[] = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
        id: `demo_q_${i}`,
        category: i % 2 === 0 ? 'behavioral' : 'technical',
        difficulty: 'medium',
        questionText: i === 0
          ? 'Tell me about a time you had to overcome a significant technical challenge.'
          : `Sample interview question ${i + 1}: describe your approach to ${['system design', 'debugging', 'code reviews', 'performance optimization'][i % 4]}.`,
        whyAsked: 'Tests problem-solving and communication skills.',
        expectedTraits: ['Communication', 'Problem Solving', 'Initiative'],
        followUpQuestions: ['What would you do differently?', 'What did you learn?'],
        aiHints: ['Use the STAR format', 'Quantify your impact', 'Be specific'],
        idealAnswer: 'Use STAR: Situation → Task → Action → Result with measurable outcomes.',
      }));

      setQuestions(mockQuestions);
      setStep('interview');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // End interview + fetch REAL analytics  (FIX P1-01)
  // ---------------------------------------------------------------------------

  const handleEndInterview = useCallback(async () => {
    if (sessionId) {
      try {
        await nexusClient.post(`/mock-interview/end/${sessionId}`, {});
        const { data: analytics } = await nexusClient.get<SessionAnalytics>(
          `/mock-interview/analytics/${sessionId}`
        );
        setSessionAnalytics(analytics);
      } catch (err) {
        console.error('handleEndInterview analytics fetch failed:', err);
        // Analytics load failure should not block showing results
      }
    }
    setStep('results');
  }, [sessionId]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderEvaluationPanel = () => {
    if (!currentEvaluation) return null;
    const score = currentEvaluation.overall_score;
    const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-lg">AI Evaluation</h4>
          <span className={`text-3xl font-bold ${color}`}>{score}<span className="text-white/40 text-base">/100</span></span>
        </div>

        {currentEvaluation.strengths.length > 0 && (
          <div>
            <p className="text-emerald-400 font-semibold text-sm mb-1">Strengths</p>
            <ul className="space-y-1">
              {currentEvaluation.strengths.map((s, i) => (
                <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentEvaluation.improvements.length > 0 && (
          <div>
            <p className="text-amber-400 font-semibold text-sm mb-1">Improvements</p>
            <ul className="space-y-1">
              {currentEvaluation.improvements.map((imp, i) => (
                <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentEvaluation.ideal_answer_full && (
          <div>
            <p className="text-cyan-400 font-semibold text-sm mb-1">Model Answer</p>
            <p className="text-white/70 text-sm leading-relaxed">{currentEvaluation.ideal_answer_full}</p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNextQuestion}
          disabled={loading || questionLoading}
          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading || questionLoading
            ? <Loader className="w-4 h-4 animate-spin" />
            : <>Next Question <ChevronRight className="w-4 h-4" /></>
          }
        </motion.button>
      </motion.div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black">
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Role Selection ──────────────────────────────────── */}
        {step === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            <motion.div
              variants={motionContainer}
              initial="hidden"
              animate="visible"
              className="flex-1 flex flex-col items-center justify-center px-4 py-20 max-w-6xl mx-auto"
            >
              <motion.div variants={motionItem} className="text-center mb-12 max-w-3xl">
                <motion.div className="inline-block mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="p-3 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
                  >
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </motion.div>
                </motion.div>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  <span className="text-white">The Ultimate</span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Interview Experience
                  </span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed">
                  Select a role and experience an AI interviewer that adapts to your performance in real-time.
                </p>
              </motion.div>

              <motion.div
                variants={motionContainer}
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {interviewRoles.map((role, idx) => {
                  const IconComponent = role.icon;
                  return (
                    <motion.div key={role.id} variants={motionItem} className="h-full">
                      <PremiumInterviewCard
                        icon={<IconComponent className="w-full h-full" />}
                        title={role.title}
                        description={role.description}
                        duration={role.duration}
                        difficulty={role.difficulty}
                        style={role.style}
                        aiConfidence={75 + Math.random() * 20}
                        passRate={`${60 + Math.floor(Math.random() * 30)}%`}
                        onClick={() => handleRoleSelect(role)}
                        index={idx}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ── STEP 2: Onboarding ─────────────────────────────────────── */}
        {step === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-md w-full space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Preparing Your Interview</h2>
                <p className="text-white/60">
                  Customizing the {selectedRole?.title} interview for your profile…
                </p>
              </div>

              <div className="space-y-4">
                {onboardingStages.map((stage, idx) => {
                  const threshold = (idx + 1) * 25;
                  const isActive = onboardingProgress >= idx * 25;
                  const isComplete = onboardingProgress >= threshold;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isActive ? 'bg-purple-500/20 border-purple-500/30' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="text-3xl flex-shrink-0">{stage.icon}</div>
                      <p className="flex-1 font-semibold text-white">{stage.label}</p>
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 rounded-full border-2 border-purple-400 border-t-purple-600 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    animate={{ width: `${onboardingProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
                <p className="text-xs text-white/60 text-center">{onboardingProgress}% Complete</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── STEP 3: Interview ──────────────────────────────────────── */}
        {step === 'interview' && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-12"
          >
            <div className="max-w-7xl mx-auto px-4">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRole?.title} Interview</h2>
                  <p className="text-white/60">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </p>
                </div>
                <button
                  onClick={handleEndInterview}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors disabled:opacity-50"
                >
                  End Interview
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-8 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>

              {questionLoading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                  <span className="ml-3 text-white/60">Loading next question…</span>
                </div>
              ) : currentQuestion?.category === 'coding' ? (
                <InterviewCodingEditor
                  problem={{
                    id: currentQuestion.id,
                    title: currentQuestion.questionText || 'Coding Challenge',
                    description: currentQuestion.description || currentQuestion.whyAsked || 'Solve this problem.',
                    constraints: currentQuestion.constraints || [],
                    examples: currentQuestion.examples || [],
                    expectedTimeComplexity: currentQuestion.expectedTimeComplexity || 'O(n)',
                    expectedSpaceComplexity: currentQuestion.expectedSpaceComplexity || 'O(1)',
                  }}
                  hints={hints}
                  onRun={handleCodingRun}
                  onSubmit={handleCodingSubmit}
                  onGetHints={handleGetHints}
                  isLoading={loading}
                />
              ) : (
                /* Text / behavioral / technical answer UI */
                <div className="space-y-6">
                  {/* Question card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8"
                  >
                    {currentQuestion && (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge tone={currentQuestion.category === 'behavioral' ? 'violet' : 'cyan'}>
                            {currentQuestion.category}
                          </Badge>
                          <Badge tone="gold">{currentQuestion.difficulty}</Badge>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3">
                          {currentQuestion.questionText}
                        </h3>

                        {currentQuestion.whyAsked && (
                          <p className="text-white/60 text-sm mb-6 italic">
                            Why asked: {currentQuestion.whyAsked}
                          </p>
                        )}

                        {/* Expected traits */}
                        {currentQuestion.expectedTraits.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {currentQuestion.expectedTraits.map((t, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* ── Answer textarea (FIX P0-06) ── */}
                        <textarea
                          id="answer-textarea"
                          value={answerText}
                          onChange={e => setAnswerText(e.target.value)}
                          placeholder="Type your answer here… Use the STAR format for behavioral questions: Situation → Task → Action → Result"
                          className="w-full h-40 rounded-lg bg-black/50 border border-white/20 text-white p-4 placeholder-white/30 focus:border-purple-500 focus:outline-none resize-y transition-colors"
                          disabled={submittingAnswer || showEvaluation}
                        />

                        {/* Char counter */}
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs ${answerText.length < 50 ? 'text-amber-400' : 'text-white/40'}`}>
                            {answerText.length < 50 ? `Add at least ${50 - answerText.length} more characters` : `${answerText.length} characters`}
                          </span>
                        </div>

                        {/* Hints panel */}
                        {showHints && hints.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4"
                          >
                            <p className="text-yellow-400 font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" /> Hints
                            </p>
                            <ol className="space-y-1">
                              {hints.map((h, i) => (
                                <li key={i} className="text-white/70 text-sm">{i + 1}. {h}</li>
                              ))}
                            </ol>
                          </motion.div>
                        )}

                        {/* Evaluation panel */}
                        {showEvaluation && renderEvaluationPanel()}
                      </>
                    )}
                  </motion.div>

                  {/* Action row — only show when not yet evaluated */}
                  {!showEvaluation && (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmitTextAnswer}
                        disabled={submittingAnswer || answerText.trim().length < 10}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                      >
                        {submittingAnswer
                          ? <><Loader className="w-4 h-4 animate-spin" /> Evaluating…</>
                          : <><Send className="w-4 h-4" /> Submit Answer</>
                        }
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={showHints ? () => setShowHints(false) : handleGetHints}
                        className="px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                        title="Get hints"
                      >
                        <Lightbulb className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextQuestion}
                        disabled={loading || questionLoading}
                        className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white/60 hover:bg-white/15 transition-all"
                        title="Skip question"
                      >
                        Skip
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Results — uses REAL analytics (FIX P1-01) ──────── */}
        {step === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-12"
          >
            <div className="max-w-6xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-white mb-4">Interview Complete! 🎉</h2>
                <p className="text-xl text-white/70">
                  {sessionAnalytics
                    ? 'Here is your detailed performance breakdown.'
                    : 'Great effort! Your analytics are being compiled.'}
                </p>
              </motion.div>

              {/* Real analytics from API */}
              <InterviewAnalyticsDashboard
                communication={sessionAnalytics?.communication ?? 0}
                technicalDepth={sessionAnalytics?.technical_depth ?? 0}
                confidence={sessionAnalytics?.confidence ?? 0}
                problemSolving={sessionAnalytics?.problem_solving ?? 0}
                leadership={sessionAnalytics?.leadership ?? 0}
                systemDesign={sessionAnalytics?.system_design ?? 0}
                coding={sessionAnalytics?.coding ?? 0}
                communicationTrend={[]}
                codingTrend={[]}
                topicWeaknesses={{}}
                readinessScore={sessionAnalytics?.readiness_score ?? 0}
                sessionHistory={[]}
              />

              {/* Action buttons — FIX P2-03: y should be 0 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex gap-4 justify-center flex-wrap"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStep('selection');
                    setSessionId(null);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setSessionAnalytics(null);
                  }}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition-all"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Start New Interview
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/analytics')}
                  className="px-8 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  View Full Analytics
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/interview-prep')}
                  className="px-8 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
                >
                  Back to Prep
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
