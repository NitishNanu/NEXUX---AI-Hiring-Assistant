import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { PremiumInterviewCard } from '../components/interview/PremiumInterviewCard';
import { InterviewCodingEditor } from '../components/interview/InterviewCodingEditor';
import { InterviewAnalyticsDashboard } from '../components/interview/InterviewAnalyticsDashboard';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { nexusClient } from '../api/nexusClient';
import { codingApi } from '../api/codingApi';
import { nexusToast } from '../components/ui/NexusToast';

const interviewRoles = [
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
    description: 'Machine learning, deep learning, NLP, CV - Model design and optimization',
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
    description: 'Cloud infrastructure, CI/CD, containerization, monitoring',
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
    description: 'Intense interview simulation with high bar raising and deep dives',
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

export default function MockInterview() {
  const navigate = useNavigate();

  // Step states
  const [step, setStep] = useState<'selection' | 'onboarding' | 'interview' | 'results'>('selection');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const totalInterviewQuestions = 5;
  const interviewLength = sessionId ? totalInterviewQuestions : questions.length;
  const currentQuestion = questions[currentQuestionIndex] ?? null;

  // Onboarding animation
  const [onboardingProgress, setOnboardingProgress] = useState(0);

  const onboardingStages = [
    { label: 'Scanning Resume', icon: '📄', duration: 2 },
    { label: 'Extracting Skills', icon: '🎯', duration: 2 },
    { label: 'Generating Questions', icon: '🤖', duration: 2 },
    { label: 'Building Interview', icon: '🏗️', duration: 1 },
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

  const fetchNextQuestion = async (session_id: string) => {
    setQuestionLoading(true);
    try {
      const response = await nexusClient.get(`/mock-interview/question/${session_id}`);
      const question = response.data;
      setQuestions((prevQuestions) => [...prevQuestions, question]);
      return question;
    } catch (error) {
      console.error('Unable to fetch next question', error);
      nexusToast('Unable to fetch the next question.', 'error');
      return null;
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleGetHints = async () => {
    if (!sessionId || !questions[currentQuestionIndex]?.id) {
      nexusToast('No active question for hints.', 'error');
      return;
    }

    try {
      const response = await nexusClient.get(
        `/mock-interview/hints/${sessionId}/${questions[currentQuestionIndex].id}`
      );
      setHints(response.data.hints || []);
      nexusToast.success('Hints loaded');
    } catch (error) {
      console.error('Error loading hints', error);
      nexusToast('Unable to load hints', 'error');
    }
  };

  const handleCodingRun = async (code: string, language: string) => {
    if (!sessionId || !questions[currentQuestionIndex]?.id) {
      const message = 'Cannot run code without an active interview session.';
      nexusToast(message, 'error');
      return {
        success: false,
        passed: 0,
        total: 0,
        test_results: [],
        execution_time_ms: 0,
        errors: [message],
      };
    }

    return await codingApi.runCode({
      interview_session_id: sessionId,
      question_id: questions[currentQuestionIndex].id,
      code,
      language,
      duration_seconds: 0,
    });
  };

  const handleCodingSubmit = async (code: string, language: string) => {
    if (!sessionId || !questions[currentQuestionIndex]?.id) {
      nexusToast('No active interview session available.', 'error');
      return;
    }

    setLoading(true);
    try {
      const evaluation = await codingApi.submitSolution({
        interview_session_id: sessionId,
        question_id: questions[currentQuestionIndex].id,
        code,
        language,
        duration_seconds: 0,
      });
      setCurrentEvaluation(evaluation);
      nexusToast.success(
        `Submitted! ${evaluation.passed_tests}/${evaluation.total_tests} tests passed.`
      );

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        const nextQuestion = await fetchNextQuestion(sessionId);
        if (nextQuestion) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          setStep('results');
        }
      }
    } catch (error) {
      console.error('Submit failed', error);
      nexusToast('Failed to submit coding solution.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: any) => {
    setSelectedRole(role);
    setStep('onboarding');

    // Simulate onboarding stages
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setOnboardingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          startInterview(role);
        }, 500);
      }
    }, 2000);
  };

  const startInterview = async (role: any) => {
    setLoading(true);
    setSessionData(null);
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setHints([]);
    setCurrentEvaluation(null);

    try {
      const interviewType = interviewTypeMap[role.id] || 'technical';
      const response = await nexusClient.post('/mock-interview/start', {
        interview_type: interviewType,
        selected_role: role.title,
      });

      const session_id = response.data.session_id;
      setSessionId(session_id);
      setSessionData({
        sessionId: session_id,
        role,
        startTime: new Date(),
      });

      const question = await fetchNextQuestion(session_id);
      if (!question) {
        throw new Error('No interview question available');
      }

      setStep('interview');
      nexusToast.success(`Starting ${role.title} interview!`);
    } catch (error) {
      console.error('Error starting interview:', error);
      nexusToast('Unable to start the enhanced interview. Falling back to a quick local demo.', 'error');

      const mockQuestions = Array.from({ length: 5 }).map((_, idx) => ({
        id: `q_${idx}`,
        category: idx % 2 === 0 ? 'behavioral' : 'technical',
        difficulty: 'Medium',
        questionText: `Sample interview question ${idx + 1}?`,
        whyAsked: 'Tests your problem-solving skills',
        expectedTraits: ['Communication', 'Problem Solving'],
        followUpQuestions: ['Can you elaborate?'],
        aiHints: ['Think step by step'],
        idealAnswer: 'Expected answer structure...',
      }));

      setSessionData({
        sessionId: 'demo_session',
        role,
        startTime: new Date(),
      });
      setQuestions(mockQuestions);
      setStep('interview');
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black">
      <AnimatePresence mode="wait">
        {/* STEP 1: Role Selection */}
        {step === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col"
          >
            {/* Hero section */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="flex-1 flex flex-col items-center justify-center px-4 py-20 max-w-6xl mx-auto"
            >
              <motion.div variants={item} className="text-center mb-12 max-w-3xl">
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
                  Get instant feedback and improve with every question.
                </p>
              </motion.div>

              {/* Roles grid */}
              <motion.div
                variants={container}
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {interviewRoles.map((role, idx) => {
                  const IconComponent = role.icon;
                  return (
                    <motion.div
                      key={role.id}
                      variants={item}
                      onClick={() => handleRoleSelect(role)}
                      className="h-full"
                    >
                      <PremiumInterviewCard
                        icon={<IconComponent className="w-full h-full" />}
                        title={role.title}
                        description={role.description}
                        duration={role.duration}
                        difficulty={role.difficulty}
                        style={role.style}
                        aiConfidence={75 + Math.random() * 20}
                        passRate={`${60 + Math.random() * 30}%`}
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

        {/* STEP 2: Onboarding Animation */}
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
                  Customizing the {selectedRole?.title} interview for your profile...
                </p>
              </div>

              {/* Progress stages */}
              <div className="space-y-6">
                {onboardingStages.map((stage, idx) => {
                  const isActive = onboardingProgress > idx * 25;
                  const isCompleted = onboardingProgress >= (idx + 1) * 25;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.3 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-purple-500/20 border-purple-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="text-3xl flex-shrink-0">{stage.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{stage.label}</p>
                      </div>
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                        >
                          <span className="text-white font-bold">✓</span>
                        </motion.div>
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

              {/* Overall progress */}
              <motion.div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    animate={{ width: `${onboardingProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
                <p className="text-xs text-white/60 text-center">{onboardingProgress}% Complete</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* STEP 3: Interview */}
        {step === 'interview' && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-12"
          >
            <div className="max-w-7xl mx-auto px-4">
              {/* Header with progress */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRole?.title} Interview
                  </h2>
                  <p className="text-white/60">
                    Question {currentQuestionIndex + 1} of {interviewLength}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setStep('results')}
                    className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                  >
                    End Interview
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{
                    width: `${((currentQuestionIndex + 1) / Math.max(interviewLength, 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                />
              </div>

              {/* Question area - using coding editor if needed */}
              {currentQuestion?.category === 'coding' ? (
                <InterviewCodingEditor
                  problem={{
                    id: currentQuestion?.id,
                    title: currentQuestion?.questionText || 'Coding Challenge',
                    description:
                      currentQuestion?.description || currentQuestion?.whyAsked ||
                      'Solve this coding problem',
                    constraints: currentQuestion?.constraints || ['Time: O(n)', 'Space: O(1)'],
                    examples: currentQuestion?.examples || [],
                    expectedTimeComplexity: currentQuestion?.expectedTimeComplexity || 'O(n)',
                    expectedSpaceComplexity: currentQuestion?.expectedSpaceComplexity || 'O(1)',
                  }}
                  hints={hints}
                  onRun={handleCodingRun}
                  onSubmit={handleCodingSubmit}
                  onGetHints={handleGetHints}
                  isLoading={loading || questionLoading}
                />
              ) : (
                // Text answer area
                <div className="space-y-6">
                  {/* Question card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {questions[currentQuestionIndex]?.questionText}
                    </h3>
                    <p className="text-white/70 mb-6">
                      {questions[currentQuestionIndex]?.whyAsked}
                    </p>

                    {/* Answer input */}
                    <textarea
                      placeholder="Type your answer here..."
                      className="w-full h-32 rounded-lg bg-black/50 border border-white/20 text-white p-4 placeholder-white/40 focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </motion.div>

                  {/* Action buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (currentQuestionIndex < questions.length - 1) {
                          setCurrentQuestionIndex(currentQuestionIndex + 1);
                        } else {
                          setStep('results');
                        }
                      }}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition-all"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                      <ChevronRight className="w-4 h-4 inline ml-2" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
                    >
                      Skip
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Results */}
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
                  Check your detailed analytics and feedback below.
                </p>
              </motion.div>

              {/* Analytics summary */}
              <InterviewAnalyticsDashboard
                communication={78}
                technicalDepth={82}
                confidence={75}
                problemSolving={80}
                leadership={68}
                systemDesign={72}
                coding={85}
                communicationTrend={[65, 70, 78]}
                codingTrend={[75, 82, 85]}
                topicWeaknesses={{
                  system_design: 45,
                  communication: 55,
                }}
                readinessScore={76}
                sessionHistory={[]}
              />

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 20 }}
                className="mt-12 flex gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('selection')}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition-all"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Start New Interview
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
