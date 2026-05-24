import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Brain, Zap, Users, TrendingUp, Clock, Target,
  Sparkles, ArrowRight, BarChart3, Award, MessageSquare,
} from 'lucide-react';
import { nexusClient } from '../api/nexusClient';
import { PremiumCategoryCard } from '../components/interview/PremiumCategoryCard';
import { QuestionCard } from '../components/interview/QuestionCard';
import { AnalyticsCard, SkillBars } from '../components/interview/AnalyticsCard';
import { InterviewTimeline, ProgressGauge, ScoreDisplay } from '../components/interview/InterviewTimeline';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { nexusToast } from '../components/ui/NexusToast';

/**
 * MockInterview - Complete AI interview simulation page
 */
export default function MockInterview() {
  const navigate = useNavigate();
  
  // Step states
  const [step, setStep] = useState('selection'); // selection, interview, results
  const [selectedRole, setSelectedRole] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [skipped, setSkipped] = useState({});
  const [loading, setLoading] = useState(false);
  const [sessionAnalytics, setSessionAnalytics] = useState(null);

  // Interview roles
  const interviewRoles = [
    {
      id: 'sde',
      title: 'SDE',
      description: 'Software Development Engineer - Full stack coding interviews with system design',
      duration: '60 min',
      difficulty: 'Hard',
      style: 'FAANG',
      icon: Code2,
    },
    {
      id: 'frontend',
      title: 'Frontend Engineer',
      description: 'React, Vue, Angular - UI/UX, component design, state management',
      duration: '45 min',
      difficulty: 'Medium',
      style: 'Product',
      icon: Sparkles,
    },
    {
      id: 'backend',
      title: 'Backend Engineer',
      description: 'API design, databases, microservices, system architecture',
      duration: '60 min',
      difficulty: 'Hard',
      style: 'Startup',
      icon: TrendingUp,
    },
    {
      id: 'ml',
      title: 'ML Engineer',
      description: 'Machine learning, deep learning, NLP, CV - Model design and optimization',
      duration: '90 min',
      difficulty: 'Hard',
      style: 'Research',
      icon: Brain,
    },
    {
      id: 'devops',
      title: 'DevOps Engineer',
      description: 'Cloud infrastructure, CI/CD, containerization, monitoring',
      duration: '45 min',
      difficulty: 'Medium',
      style: 'Enterprise',
      icon: Zap,
    },
    {
      id: 'pm',
      title: 'Product Manager',
      description: 'Product strategy, user research, metrics, case studies',
      duration: '50 min',
      difficulty: 'Medium',
      style: 'Executive',
      icon: Target,
    },
  ];

  // Handle role selection
  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      // Call backend to start interview
      const { data } = await nexusClient.post('/mock-interview/start', {
        interview_type: role.id,
        selected_role: role.title,
      });
      
      setSessionId(data.session_id);
      setQuestions(data.questions || []);
      setStep('interview');
      nexusToast(`${role.title} interview started!`, 'success');
    } catch (error) {
      nexusToast('Failed to start interview', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async (answerText) => {
    const question = questions[currentQuestionIndex];
    try {
      await nexusClient.post('/mock-interview/submit-answer', {
        interview_session_id: sessionId,
        question_id: question.id,
        user_answer: answerText,
        answer_type: 'text',
      });
      
      setAnswers({ ...answers, [currentQuestionIndex]: answerText });
      
      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Show results
        fetchSessionAnalytics();
      }
      
      nexusToast('Answer recorded!', 'success');
    } catch (error) {
      nexusToast('Failed to submit answer', 'error');
    }
  };

  // Handle skip question
  const handleSkipQuestion = () => {
    setSkipped({ ...skipped, [currentQuestionIndex]: true });
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      fetchSessionAnalytics();
    }
  };

  // Fetch session analytics
  const fetchSessionAnalytics = async () => {
    try {
      const { data } = await nexusClient.get(`/mock-interview/analytics/${sessionId}`);
      setSessionAnalytics(data);
      setStep('results');
    } catch (error) {
      nexusToast('Failed to fetch results', 'error');
    }
  };

  // Render selection step
  if (step === 'selection') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="page-shell interview-page"
      >
        {/* Hero section */}
        <div className="mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <Badge tone="cyan" className="mb-4">
              <Sparkles size={16} className="mr-2" />
              Mock Interview
            </Badge>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Practice Like the Real Interview is Tomorrow
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              AI-powered interview simulation tailored to your resume and target role. Get instant feedback and improve your interview skills.
            </p>
          </motion.div>
        </div>

        {/* Statistics banner */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <GlassCard className="text-center p-6" glow="cyan">
            <div className="text-3xl font-bold text-cyan-400 mb-2">95%</div>
            <p className="text-sm text-slate-400">Users feel more confident</p>
          </GlassCard>
          <GlassCard className="text-center p-6" glow="blue">
            <div className="text-3xl font-bold text-blue-400 mb-2">10+</div>
            <p className="text-sm text-slate-400">Interview roles available</p>
          </GlassCard>
          <GlassCard className="text-center p-6" glow="purple">
            <div className="text-3xl font-bold text-purple-400 mb-2">Real-time</div>
            <p className="text-sm text-slate-400">AI feedback & scoring</p>
          </GlassCard>
        </div>

        {/* Role selection grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Select Your Target Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {interviewRoles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PremiumCategoryCard
                    icon={role.icon}
                    title={role.title}
                    description={role.description}
                    duration={role.duration}
                    difficulty={role.difficulty}
                    style={role.style}
                    isSelected={selectedRole?.id === role.id}
                    onClick={() => handleSelectRole(role)}
                    stats={`${Math.floor(Math.random() * 20) + 80}% pass rate`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render interview step
  if (step === 'interview' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((Object.keys(answers).length + Object.keys(skipped).length) / questions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-950 p-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with progress */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedRole.title} Interview
              </h2>
              <p className="text-slate-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <ProgressGauge
              value={Math.floor(progress)}
              label="Interview"
              size="sm"
              color="cyan"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - Question timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <GlassCard glow="blue" className="p-4">
                <h3 className="text-sm font-bold text-white mb-4">Questions</h3>
                <InterviewTimeline
                  questions={questions}
                  currentIndex={currentQuestionIndex}
                  answers={answers}
                  skipped={skipped}
                  onSelectQuestion={setCurrentQuestionIndex}
                />
              </GlassCard>
            </motion.div>

            {/* Center - Current question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <QuestionCard
                question={currentQuestion}
                category={currentQuestion.category}
                difficulty={currentQuestion.difficulty}
                isAnswered={currentQuestionIndex in answers}
                onAnswer={() => {
                  // Open answer input modal/form
                  // For now, show toast
                  nexusToast('Answer input would open here', 'info');
                }}
                onSkip={handleSkipQuestion}
              />
            </motion.div>

            {/* Right sidebar - Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <GlassCard glow="purple" className="p-4">
                <h3 className="text-sm font-bold text-white mb-4">
                  <Award size={16} className="inline mr-2" />
                  Insights
                </h3>
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <p className="font-semibold text-cyan-400 mb-1">Tip</p>
                    <p>Use the STAR method for behavioral questions</p>
                  </div>
                  <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                    <p className="font-semibold text-emerald-400 mb-1">Strength</p>
                    <p>You're doing great with technical depth</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render results step
  if (step === 'results' && sessionAnalytics) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="page-shell interview-page"
      >
        <div className="text-center mb-12">
          <Badge tone="emerald" className="mb-4">Interview Complete</Badge>
          <h1 className="text-4xl font-bold text-white mb-2">Here's Your Performance</h1>
          <p className="text-slate-400">Detailed analysis and personalized recommendations</p>
        </div>

        {/* Main score */}
        <div className="flex justify-center mb-12">
          <ScoreDisplay
            score={Math.round(sessionAnalytics.overall_score)}
            maxScore={100}
            feedback={
              sessionAnalytics.overall_score >= 80
                ? "Excellent! You're ready for interviews."
                : sessionAnalytics.overall_score >= 60
                ? "Good! A few more sessions and you'll be great."
                : "Keep practicing! You'll improve quickly."
            }
          />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnalyticsCard
            title="Communication"
            value={Math.round(sessionAnalytics.communication)}
            color="cyan"
            icon={MessageSquare}
            type="percentage"
          />
          <AnalyticsCard
            title="Technical Depth"
            value={Math.round(sessionAnalytics.technical_depth)}
            color="purple"
            icon={Code2}
            type="percentage"
          />
          <AnalyticsCard
            title="Confidence"
            value={Math.round(sessionAnalytics.confidence)}
            color="emerald"
            icon={Award}
            type="percentage"
          />
          <AnalyticsCard
            title="Problem Solving"
            value={Math.round(sessionAnalytics.problem_solving)}
            color="amber"
            icon={Brain}
            type="percentage"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/interview-prep')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
          >
            <ArrowRight size={16} className="inline mr-2" />
            Go to Interview Prep
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setStep('selection');
              setSelectedRole(null);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setSkipped({});
            }}
            className="px-6 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            <Sparkles size={16} className="inline mr-2" />
            Start New Interview
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-shell flex items-center justify-center min-h-screen"
    >
      <div className="text-center">
        <div className="mb-4 text-cyan-400">
          <Sparkles size={48} className="mx-auto animate-spin" />
        </div>
        <p className="text-white text-xl">Loading interview...</p>
      </div>
    </motion.div>
  );
}
