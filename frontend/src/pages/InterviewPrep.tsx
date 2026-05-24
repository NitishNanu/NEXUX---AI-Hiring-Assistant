import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain, CheckCircle2, Mic, PanelsTopLeft, TimerReset, Sparkles,
  Zap, Target, TrendingUp, Award, Code2, Users, BookOpen,
} from 'lucide-react';
import NexusChat from '../components/chat/NexusChat';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import { nexusToast } from '../components/ui/NexusToast';
import { useNexusStore } from '../store/nexusStore';
import { useState } from 'react';
import { PremiumCategoryCard } from '../components/interview/PremiumCategoryCard';
import { AnalyticsCard, SkillBars } from '../components/interview/AnalyticsCard';

const prepCategories = [
  {
    icon: Brain,
    title: 'Behavioral',
    description: 'STAR structure, leadership stories, conflict resolution, and ownership mentality.',
    duration: '30 min',
    difficulty: 'Medium',
    style: 'Structured',
    stats: '85% pass rate',
  },
  {
    icon: Code2,
    title: 'Technical Deep Dive',
    description: 'System design, architecture decisions, tradeoffs, and technical problem-solving.',
    duration: '45 min',
    difficulty: 'Hard',
    style: 'Expert',
    stats: '72% pass rate',
  },
  {
    icon: TimerReset,
    title: 'Mock Loop',
    description: 'Full interview simulation with timed prompts, answer coaching, and follow-up probes.',
    duration: '60 min',
    difficulty: 'Hard',
    style: 'Realistic',
    stats: '78% pass rate',
  },
  {
    icon: Zap,
    title: 'Coding Challenges',
    description: 'Algorithmic problems with real-time execution, test cases, and AI optimization feedback.',
    duration: '50 min',
    difficulty: 'Hard',
    style: 'Competitive',
    stats: '65% pass rate',
  },
  {
    icon: BookOpen,
    title: 'CS Fundamentals',
    description: 'DBMS, Operating Systems, Networks, and Data Structures - MCQs with detailed explanations.',
    duration: '40 min',
    difficulty: 'Medium',
    style: 'Academic',
    stats: '80% pass rate',
  },
  {
    icon: Users,
    title: 'HR Round Preparation',
    description: 'Company culture fit, role expectations, negotiation, and career growth discussions.',
    duration: '25 min',
    difficulty: 'Easy',
    style: 'Conversational',
    stats: '92% pass rate',
  },
  {
    icon: PanelsTopLeft,
    title: 'System Design',
    description: 'Design scalable systems, databases, APIs. Think like a senior architect.',
    duration: '50 min',
    difficulty: 'Expert',
    style: 'Architecture',
    stats: '58% pass rate',
  },
  {
    icon: Zap,
    title: 'Rapid Fire',
    description: 'Quick-fire questions across multiple topics. Test your breadth of knowledge.',
    duration: '20 min',
    difficulty: 'Hard',
    style: 'Intense',
    stats: '70% pass rate',
  },
  {
    icon: Award,
    title: 'Resume Deep Dive',
    description: 'Detailed questions about your projects, skills, and experience. Be prepared!',
    duration: '40 min',
    difficulty: 'Medium',
    style: 'Personalized',
    stats: '88% pass rate',
  },
];

export default function InterviewPrep() {
  const navigate = useNavigate();
  const resumeData = useNexusStore((state) => state.resumeData);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleStartPractice = (category) => {
    if (!resumeData?.rawText) {
      nexusToast('Please upload a resume first from Resume Parser.', 'error');
      return;
    }
    setSelectedCategory(category);
    // Trigger practice mode
    window.dispatchEvent(
      new CustomEvent('nexus:generate-interview-questions', {
        detail: { focus: category.title }
      })
    );
    nexusToast(`Starting ${category.title} practice...`, 'success');
  };

  const handleStartMockInterview = () => {
    if (!resumeData?.rawText) {
      nexusToast('Please upload a resume first from Resume Parser.', 'error');
      return;
    }
    navigate('/mock-interview');
  };

  // Mock analytics data
  const analyticsData = [
    { name: 'Communication', score: 78 },
    { name: 'Technical', score: 85 },
    { name: 'Problem Solving', score: 72 },
    { name: 'Leadership', score: 68 },
  ];

  return (
    <motion.div
      className="page-shell interview-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
    >
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <div className="text-center mb-8">
          <Badge tone="gold" className="mb-4 inline-block">
            <Sparkles size={16} className="inline mr-2" />
            Interview Preparation
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Master Your Interview Skills
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            AI-powered interview coaching tailored to your resume. Practice different interview styles, get real-time feedback, and build confidence for the big day.
          </p>
        </div>

        {/* Resume Intelligence Card */}
        {resumeData && (
          <GlassCard glow="cyan" className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Resume Intelligence Enabled</h3>
                <p className="text-slate-400 text-sm">
                  We've analyzed your resume and will personalize all questions based on your skills and experience.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowInsights(!showInsights)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
              >
                View Insights
              </motion.button>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* INSIGHTS SIDEBAR - Hidden by default */}
      {showInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnalyticsCard
            title="Communication"
            value={78}
            color="cyan"
            icon={Users}
            type="percentage"
          />
          <AnalyticsCard
            title="Technical Depth"
            value={85}
            color="purple"
            icon={Code2}
            type="percentage"
          />
          <AnalyticsCard
            title="Problem Solving"
            value={72}
            color="emerald"
            icon={Target}
            type="percentage"
          />
          <AnalyticsCard
            title="Leadership"
            value={68}
            color="amber"
            icon={Award}
            type="percentage"
          />
        </motion.div>
      )}

      {/* PRIMARY CTA - Start Mock Interview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <GlassCard glow="cyan" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className="mb-4">
                <Badge tone="cyan" className="inline-block">
                  <Zap size={16} className="inline mr-2" />
                  Flagship Feature
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Complete Mock Interview
              </h2>
              <p className="text-slate-300 mb-6">
                Experience a full 60-minute interview with dynamic question generation, real-time AI evaluation, integrated coding environment, and instant feedback.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Full-length simulation (60 minutes)
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Resume-personalized questions
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Real-time AI evaluation & feedback
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Multiple role specializations
                </li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleStartMockInterview}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <Sparkles size={18} className="inline mr-2" />
                Start Mock Interview
              </motion.button>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-6xl"
              >
                🎯
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* CATEGORY CARDS GRID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Sparkles size={32} className="text-purple-400" />
          Choose Your Practice Focus
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {prepCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="h-full">
                <PremiumCategoryCard
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                  duration={category.duration}
                  difficulty={category.difficulty}
                  style={category.style}
                  stats={category.stats}
                  isSelected={selectedCategory?.title === category.title}
                  onClick={() => handleStartPractice(category)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CHAT INTERFACE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">AI Interview Coach</h3>
          <p className="text-slate-400">Ask questions about interview prep, your resume, or get real-time coaching</p>
        </div>
        <GlassCard glow="blue">
          <NexusChat />
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
