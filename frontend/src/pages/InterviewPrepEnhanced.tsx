import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  CheckCircle2,
  Mic,
  PanelsTopLeft,
  TimerReset,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Award,
  Code2,
  Users,
  BookOpen,
  BarChart3,
  Loader,
} from 'lucide-react';
import { InterviewHeroSection } from '../components/interview/InterviewHeroSection';
import { PremiumInterviewCard } from '../components/interview/PremiumInterviewCard';
import { EnhancedQuestionCard } from '../components/interview/EnhancedQuestionCard';
import { InterviewAnalyticsDashboard } from '../components/interview/InterviewAnalyticsDashboard';
import GlassCard from '../components/ui/GlassCard';
import { nexusToast } from '../components/ui/NexusToast';
import { useNexusStore } from '../store/nexusStore';

const prepCategories = [
  {
    id: 'behavioral',
    icon: Brain,
    title: 'Behavioral',
    description: 'STAR structure, leadership stories, conflict resolution, and ownership mentality.',
    duration: '30 min',
    difficulty: 'Medium',
    style: 'Structured',
    aiConfidence: 85,
    passRate: '85%',
  },
  {
    id: 'technical',
    icon: Code2,
    title: 'Technical Deep Dive',
    description: 'System design, architecture decisions, tradeoffs, and technical problem-solving.',
    duration: '45 min',
    difficulty: 'Hard',
    style: 'Expert',
    aiConfidence: 72,
    passRate: '72%',
  },
  {
    id: 'mock_loop',
    icon: TimerReset,
    title: 'Mock Loop',
    description: 'Full interview simulation with timed prompts, answer coaching, and follow-up probes.',
    duration: '60 min',
    difficulty: 'Hard',
    style: 'Realistic',
    aiConfidence: 78,
    passRate: '78%',
  },
  {
    id: 'coding',
    icon: Zap,
    title: 'Coding Challenges',
    description: 'Algorithmic problems with real-time execution, test cases, and AI optimization feedback.',
    duration: '50 min',
    difficulty: 'Hard',
    style: 'Competitive',
    aiConfidence: 65,
    passRate: '65%',
  },
  {
    id: 'cs_fundamentals',
    icon: BookOpen,
    title: 'CS Fundamentals',
    description: 'DBMS, Operating Systems, Networks, and Data Structures - MCQs with detailed explanations.',
    duration: '40 min',
    difficulty: 'Medium',
    style: 'Academic',
    aiConfidence: 80,
    passRate: '80%',
  },
  {
    id: 'hr',
    icon: Users,
    title: 'HR Round Preparation',
    description: 'Company culture fit, role expectations, negotiation, and career growth discussions.',
    duration: '25 min',
    difficulty: 'Easy',
    style: 'Conversational',
    aiConfidence: 92,
    passRate: '92%',
  },
  {
    id: 'system_design',
    icon: PanelsTopLeft,
    title: 'System Design',
    description: 'Design scalable systems, databases, APIs. Think like a senior architect.',
    duration: '50 min',
    difficulty: 'Expert',
    style: 'Architecture',
    aiConfidence: 58,
    passRate: '58%',
  },
  {
    id: 'rapid_fire',
    icon: Zap,
    title: 'Rapid Fire',
    description: 'Quick-fire questions across multiple topics. Test your breadth of knowledge.',
    duration: '20 min',
    difficulty: 'Hard',
    style: 'Intense',
    aiConfidence: 70,
    passRate: '70%',
  },
  {
    id: 'resume_deep_dive',
    icon: Award,
    title: 'Resume Deep Dive',
    description: 'Detailed questions about your projects, skills, and experience. Be prepared!',
    duration: '40 min',
    difficulty: 'Medium',
    style: 'Personalized',
    aiConfidence: 88,
    passRate: '88%',
  },
];

export default function InterviewPrep() {
  const navigate = useNavigate();
  const { resumeData } = useNexusStore();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeIntelligence, setResumeIntelligence] = useState<any>(null);

  // Mock hero data
  const [heroData, setHeroData] = useState({
    atsScore: 78,
    resumeStrength: 82,
    interviewReadiness: 65,
    missingSkills: ['System Design', 'Communication', 'Leadership', 'DSA Advanced'],
    aiConfidence: 72,
    recommendedRole: 'Senior Software Engineer',
  });

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    communication: 76,
    technicalDepth: 82,
    confidence: 68,
    problemSolving: 80,
    leadership: 62,
    systemDesign: 58,
    coding: 85,
    communicationTrend: [60, 65, 70, 76],
    codingTrend: [75, 78, 80, 85],
    topicWeaknesses: {
      system_design: 45,
      communication: 55,
      leadership: 62,
      oops: 70,
      databases: 65,
      networking: 60,
      microservices: 50,
      distributed_systems: 48,
    },
    readinessScore: 71,
    sessionHistory: [],
  });

  // Load data on mount
  useEffect(() => {
    const loadResumeIntelligence = async () => {
      if (!resumeData) {
        nexusToast.info('Please upload a resume first');
        return;
      }

      setLoading(true);
      try {
        // Call backend for resume intelligence
        // const res = await fetch('/api/mock-interview/resume-intelligence', {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // const data = await res.json();
        // setResumeIntelligence(data);

        // Mock response for now
        setResumeIntelligence({
          ats_match_score: heroData.atsScore,
          resume_strength: heroData.resumeStrength,
          interview_readiness: heroData.interviewReadiness,
          missing_skills: heroData.missingSkills,
          ai_confidence: heroData.aiConfidence,
          recommended_role: heroData.recommendedRole,
        });
      } catch (error) {
        console.error('Error loading resume intelligence:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResumeIntelligence();
  }, [resumeData]);

  const handleCategorySelect = async (categoryId: string) => {
    const category = prepCategories.find((c) => c.id === categoryId);
    if (!category) return;

    setSelectedCategory(categoryId);
    setLoading(true);

    try {
      // Simulate fetching questions
      setTimeout(() => {
        const mockQuestions = Array.from({ length: 3 }).map((_, idx) => ({
          id: `q_${categoryId}_${idx}`,
          category: category.title,
          difficulty: category.difficulty,
          questionText: `Sample ${category.title} question ${idx + 1}?`,
          whyAsked: `This tests your ${category.title.toLowerCase()} skills and ability to think critically.`,
          expectedTraits: ['Communication', 'Problem Solving', 'Technical Knowledge'],
          followUpQuestions: [
            'Can you explain your approach?',
            'How would you optimize this?',
            'What challenges did you face?',
          ],
          aiHints: [
            'Think about the core concepts',
            'Consider edge cases',
            'Structure your answer clearly',
          ],
          idealAnswer: `A strong answer would demonstrate: 1) Clear understanding of the topic, 2) Structured thinking, 3) Relevant examples, 4) Problem-solving approach.`,
        }));

        setQuestions(mockQuestions);
        setShowQuestions(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black">
      {/* Hero section */}
      {!showAnalytics && (
        <InterviewHeroSection
          atsScore={heroData.atsScore}
          resumeStrength={heroData.resumeStrength}
          interviewReadiness={heroData.interviewReadiness}
          missingSkills={heroData.missingSkills}
          aiConfidence={heroData.aiConfidence}
          recommendedRole={heroData.recommendedRole}
        />
      )}

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Navigation buttons */}
        <motion.div variants={itemVariants} className="flex gap-3 mb-12">
          <button
            onClick={() => {
              setShowAnalytics(false);
              setShowQuestions(false);
            }}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              !showAnalytics && !showQuestions
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
            }`}
          >
            Prepare
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              showAnalytics
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => navigate('/mock-interview')}
            className="ml-auto px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white transition-all flex items-center gap-2 hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Start Full Interview
          </button>
        </motion.div>

        {/* Analytics view */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InterviewAnalyticsDashboard
                communication={analyticsData.communication}
                technicalDepth={analyticsData.technicalDepth}
                confidence={analyticsData.confidence}
                problemSolving={analyticsData.problemSolving}
                leadership={analyticsData.leadership}
                systemDesign={analyticsData.systemDesign}
                coding={analyticsData.coding}
                communicationTrend={analyticsData.communicationTrend}
                codingTrend={analyticsData.codingTrend}
                topicWeaknesses={analyticsData.topicWeaknesses}
                readinessScore={analyticsData.readinessScore}
                sessionHistory={analyticsData.sessionHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions view */}
        <AnimatePresence>
          {showQuestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <button
                onClick={() => {
                  setShowQuestions(false);
                  setSelectedCategory(null);
                }}
                className="px-6 py-2 rounded-lg text-purple-300 hover:text-purple-200 font-semibold transition-colors"
              >
                ← Back to Categories
              </button>

              <h2 className="text-3xl font-bold text-white mb-8">
                {prepCategories.find((c) => c.id === selectedCategory)?.title} Questions
              </h2>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  questions.map((question: any, idx) => (
                    <EnhancedQuestionCard
                      key={question.id}
                      questionId={question.id}
                      category={question.category}
                      difficulty={question.difficulty}
                      questionText={question.questionText}
                      whyAsked={question.whyAsked}
                      expectedTraits={question.expectedTraits}
                      followUpQuestions={question.followUpQuestions}
                      aiHints={question.aiHints}
                      idealAnswer={question.idealAnswer}
                      onAnswer={() => nexusToast.info('Answer mode launched')}
                      onMarkPracticed={() => nexusToast.success('Marked as practiced')}
                      onRegenerateSimilar={() => nexusToast.info('Generating similar question...')}
                      onVoiceAnswer={() => nexusToast.info('Voice recording started')}
                      index={idx}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories grid (default view) */}
        {!showQuestions && !showAnalytics && (
          <>
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-white mb-2"
            >
              Interview Preparation Categories
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-white/70 mb-12 max-w-2xl"
            >
              Choose a category to practice interview questions tailored to your profile and target role.
            </motion.p>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {prepCategories.map((category, idx) => {
                const IconComponent = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    onClick={() => handleCategorySelect(category.id)}
                    className="h-full"
                  >
                    <PremiumInterviewCard
                      icon={<IconComponent className="w-full h-full" />}
                      title={category.title}
                      description={category.description}
                      duration={category.duration}
                      difficulty={category.difficulty}
                      style={category.style}
                      aiConfidence={category.aiConfidence}
                      passRate={category.passRate}
                      onClick={() => handleCategorySelect(category.id)}
                      isSelected={selectedCategory === category.id}
                      index={idx}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
