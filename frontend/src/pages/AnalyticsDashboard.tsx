import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Award, Zap, Brain, Code2, Users, BarChart3, Calendar, Clock } from 'lucide-react';
import { nexusClient } from '../api/nexusClient';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { AnalyticsCard, SkillBars } from '../components/interview/AnalyticsCard';
import { ProgressGauge } from '../components/interview/InterviewTimeline';

/**
 * AnalyticsDashboard - Comprehensive interview analytics
 */
export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // all, week, month
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch analytics data
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await nexusClient.get('/mock-interview/user-analytics');
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap size={48} className="mx-auto mb-4 text-cyan-400 animate-pulse" />
          <p className="text-white text-xl">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const communicationTrend = [
    { date: 'Jun 1', score: 65 },
    { date: 'Jun 5', score: 70 },
    { date: 'Jun 10', score: 75 },
    { date: 'Jun 15', score: 78 },
    { date: 'Jun 20', score: 82 },
    { date: 'Jun 25', score: 85 },
  ];

  const skillsRadarData = [
    { skill: 'Communication', score: 85 },
    { skill: 'Technical', score: 78 },
    { skill: 'Problem Solving', score: 72 },
    { skill: 'Leadership', score: 68 },
    { skill: 'System Design', score: 65 },
    { skill: 'Coding', score: 88 },
  ];

  const weakTopics = [
    { topic: 'System Design', weakness: 35 },
    { topic: 'OS Concepts', weakness: 40 },
    { topic: 'Database Design', weakness: 28 },
    { topic: 'Distributed Systems', weakness: 32 },
    { topic: 'Networking', weakness: 25 },
  ];

  const sessionHistory = [
    { date: 'Jun 25', role: 'SDE', score: 87, duration: 60 },
    { date: 'Jun 23', role: 'Frontend', score: 82, duration: 45 },
    { date: 'Jun 20', role: 'Backend', score: 79, duration: 60 },
    { date: 'Jun 18', role: 'SDE', score: 75, duration: 60 },
  ];

  const mockSkills = [
    { name: 'Communication', score: 85 },
    { name: 'Technical Depth', score: 78 },
    { name: 'Problem Solving', score: 72 },
    { name: 'System Design', score: 65 },
  ];

  const mockInsights = [
    {
      icon: TrendingUp,
      title: 'Improvement Trend',
      description: 'You\'ve improved by 20 points over the last month. Keep it up!',
      color: 'emerald',
    },
    {
      icon: Target,
      title: 'Weak Areas',
      description: 'Focus on System Design and OS Concepts this week.',
      color: 'amber',
    },
    {
      icon: Code2,
      title: 'Coding Strength',
      description: 'Your coding accuracy is excellent at 88%. Maintain this!',
      color: 'cyan',
    },
    {
      icon: Brain,
      title: 'Behavioral Tips',
      description: 'Work on providing more structured answers using STAR method.',
      color: 'purple',
    },
  ];

  return (
    <motion.div
      className="page-shell"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <Badge tone="cyan" className="mb-4 inline-block">
          <BarChart3 size={16} className="inline mr-2" />
          Interview Analytics
        </Badge>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Your Interview Performance
        </h1>
        <p className="text-xl text-slate-400">
          Track your progress, identify weaknesses, and improve your interview skills
        </p>
      </motion.div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <AnalyticsCard
            title="Total Interviews"
            value={analyticsData?.total_interviews || 0}
            color="cyan"
            icon={Calendar}
            type="count"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <AnalyticsCard
            title="Average Score"
            value={Math.round(analyticsData?.average_score || 0)}
            color="emerald"
            icon={Award}
            type="percentage"
            trend={+12}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AnalyticsCard
            title="Current Streak"
            value={5}
            color="purple"
            icon={Zap}
            type="count"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <AnalyticsCard
            title="Readiness Score"
            value={78}
            color="amber"
            icon={Target}
            type="percentage"
            trend={+8}
          />
        </motion.div>
      </div>

      {/* AI Insights Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      >
        {mockInsights.map((insight, i) => {
          const Icon = insight.icon;
          const colorMap = {
            cyan: 'from-cyan-600/20 border-cyan-500/30',
            emerald: 'from-emerald-600/20 border-emerald-500/30',
            amber: 'from-amber-600/20 border-amber-500/30',
            purple: 'from-purple-600/20 border-purple-500/30',
          };

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <GlassCard className={`bg-gradient-to-br ${colorMap[insight.color]}`}>
                <div className="flex items-start gap-4 p-6">
                  <Icon size={24} className="text-cyan-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                    <p className="text-slate-300 text-sm">{insight.description}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Communication Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard glow="cyan">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-cyan-400" />
                Communication Improvement
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={communicationTrend}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(148,163,184,0.5)" />
                  <YAxis stroke="rgba(148,163,184,0.5)" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(100,116,139,0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#06B6D4"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Skills Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <GlassCard glow="purple">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-purple-400" />
                Skills Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillsRadarData}>
                  <PolarGrid stroke="rgba(148,163,184,0.2)" />
                  <PolarAngleAxis dataKey="skill" stroke="rgba(148,163,184,0.6)" />
                  <PolarRadiusAxis stroke="rgba(148,163,184,0.4)" domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#06B6D4"
                    fill="#06B6D4"
                    fillOpacity={0.2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(100,116,139,0.3)',
                      borderRadius: '8px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Weak Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard glow="amber">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-amber-400" />
                Topics to Focus On
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weakTopics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis type="number" stroke="rgba(148,163,184,0.5)" domain={[0, 50]} />
                  <YAxis dataKey="topic" type="category" stroke="rgba(148,163,184,0.5)" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(100,116,139,0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="weakness" fill="#F59E0B" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Skills Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <GlassCard glow="emerald">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Brain size={20} className="text-emerald-400" />
                Skill Breakdown
              </h3>
              <div className="space-y-6">
                <SkillBars skills={mockSkills} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Session History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard glow="blue">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-400" />
              Recent Interview Sessions
            </h3>
            <div className="space-y-4">
              {sessionHistory.map((session, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{session.role} Interview</p>
                    <p className="text-sm text-slate-400">{session.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-400">{session.score}</p>
                      <p className="text-xs text-slate-400">/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-300">{session.duration}m</p>
                      <p className="text-xs text-slate-400">duration</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
