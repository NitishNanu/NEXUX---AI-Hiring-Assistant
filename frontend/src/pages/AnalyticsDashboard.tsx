import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  Zap,
  Brain,
  Code2,
  BarChart3,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { nexusClient } from '../api/nexusClient';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { AnalyticsCard, SkillBars } from '../components/interview/AnalyticsCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkillBreakdown {
  name: string;
  score: number;
}

interface SessionHistoryItem {
  date: string;
  role: string;
  score: number;
  duration: number;
}

interface WeakTopic {
  topic: string;
  weakness: number;
}

interface TrendPoint {
  date: string;
  score: number;
}

interface UserAnalytics {
  // Aggregate stats
  total_interviews: number;
  average_score: number;
  readiness_score: number;

  // Skill dimensions (0-100)
  communication: number;
  technical_depth: number;
  confidence: number;
  problem_solving: number;
  leadership: number;
  system_design: number;
  coding: number;

  // Trend arrays
  communication_trend: number[];
  coding_trend: number[];

  // Weakness map { topic: score }
  topic_weaknesses: Record<string, number>;

  // Session history
  session_history: Array<{
    date: string;
    role?: string;
    interview_type?: string;
    score?: number;
    overall_score?: number;
    duration?: number;
    duration_minutes?: number;
  }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTrendData(values: number[], label: string): TrendPoint[] {
  const now = new Date();
  return values.map((score, i) => ({
    date: new Date(now.getTime() - (values.length - 1 - i) * 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score,
  }));
}

function buildSkillRadar(analytics: UserAnalytics) {
  return [
    { skill: 'Communication', score: analytics.communication ?? 0 },
    { skill: 'Technical', score: analytics.technical_depth ?? 0 },
    { skill: 'Problem Solving', score: analytics.problem_solving ?? 0 },
    { skill: 'Leadership', score: analytics.leadership ?? 0 },
    { skill: 'System Design', score: analytics.system_design ?? 0 },
    { skill: 'Coding', score: analytics.coding ?? 0 },
  ];
}

function buildWeakTopics(weaknesses: Record<string, number>): WeakTopic[] {
  return Object.entries(weaknesses)
    .map(([topic, weakness]) => ({ topic, weakness: Math.round(weakness) }))
    .sort((a, b) => b.weakness - a.weakness)
    .slice(0, 6);
}

function buildSkillBars(analytics: UserAnalytics): SkillBreakdown[] {
  return [
    { name: 'Communication', score: analytics.communication ?? 0 },
    { name: 'Technical Depth', score: analytics.technical_depth ?? 0 },
    { name: 'Problem Solving', score: analytics.problem_solving ?? 0 },
    { name: 'Confidence', score: analytics.confidence ?? 0 },
    { name: 'Leadership', score: analytics.leadership ?? 0 },
    { name: 'System Design', score: analytics.system_design ?? 0 },
    { name: 'Coding', score: analytics.coding ?? 0 },
  ];
}

function normaliseHistory(analytics: UserAnalytics): SessionHistoryItem[] {
  return (analytics.session_history ?? []).slice(0, 10).map(s => ({
    date: s.date ?? '',
    role: s.role ?? s.interview_type ?? 'Interview',
    score: s.score ?? s.overall_score ?? 0,
    duration: s.duration ?? s.duration_minutes ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="text-center py-24">
      <BarChart3 size={56} className="mx-auto mb-4 text-white/20" />
      <h3 className="text-xl font-semibold text-white/60 mb-2">No interview data yet</h3>
      <p className="text-white/40 max-w-sm mx-auto">
        Complete your first mock interview to see performance analytics here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await nexusClient.get<UserAnalytics>('/mock-interview/user-analytics');
      setAnalytics(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analytics.';
      setError(msg);
      console.error('AnalyticsDashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap size={48} className="mx-auto mb-4 text-cyan-400 animate-pulse" />
          <p className="text-white text-xl">Loading your analytics…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── No data ──
  if (!analytics || analytics.total_interviews === 0) {
    return (
      <motion.div
        className="page-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
      >
        <div className="mb-10">
          <Badge tone="cyan" className="mb-4 inline-block">
            <BarChart3 size={16} className="inline mr-2" />Interview Analytics
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Your Interview Performance
          </h1>
        </div>
        <EmptyState />
      </motion.div>
    );
  }

  // ── Derived data from REAL API response ──
  const communicationTrend = buildTrendData(analytics.communication_trend ?? [], 'Communication');
  const codingTrend = buildTrendData(analytics.coding_trend ?? [], 'Coding');
  const skillsRadarData = buildSkillRadar(analytics);
  const weakTopics = buildWeakTopics(analytics.topic_weaknesses ?? {});
  const skillBars = buildSkillBars(analytics);
  const sessionHistory = normaliseHistory(analytics);

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(100,116,139,0.3)',
    borderRadius: '8px',
    color: '#e2e8f0',
  };

  return (
    <motion.div
      className="page-shell"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12 flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <Badge tone="cyan" className="mb-4 inline-block">
            <BarChart3 size={16} className="inline mr-2" />
            Interview Analytics
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Your Interview Performance
          </h1>
          <p className="text-xl text-slate-400">
            Track your progress, identify weaknesses, and improve your interview skills.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:bg-white/15 flex items-center gap-2 transition mt-2"
          title="Refresh analytics"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </motion.div>

      {/* ── Top metric cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: 'Total Interviews', value: analytics.total_interviews, color: 'cyan', icon: Calendar, type: 'count', trend: undefined },
          { title: 'Average Score', value: Math.round(analytics.average_score ?? 0), color: 'emerald', icon: Award, type: 'percentage', trend: undefined },
          { title: 'Readiness Score', value: Math.round(analytics.readiness_score ?? 0), color: 'amber', icon: Target, type: 'percentage', trend: undefined },
          { title: 'Coding Score', value: Math.round(analytics.coding ?? 0), color: 'purple', icon: Code2, type: 'percentage', trend: undefined },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <AnalyticsCard
              title={card.title}
              value={card.value}
              color={card.color}
              icon={card.icon}
              type={card.type as 'count' | 'percentage'}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Charts row 1: trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Communication trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard glow="cyan">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-cyan-400" />
                Communication Improvement
              </h3>
              {communicationTrend.length > 1 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={communicationTrend}>
                    <defs>
                      <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(148,163,184,0.5)" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="score" stroke="#06B6D4" fillOpacity={1} fill="url(#commGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-white/30">
                  Not enough data for trend (complete more interviews)
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Skills radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard glow="purple">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-purple-400" />
                Skills Overview
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={skillsRadarData}>
                  <PolarGrid stroke="rgba(148,163,184,0.2)" />
                  <PolarAngleAxis dataKey="skill" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis stroke="rgba(148,163,184,0.4)" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Charts row 2: weaknesses + skill bars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Weak topics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard glow="amber">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-amber-400" />
                Topics to Focus On
              </h3>
              {weakTopics.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weakTopics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis type="number" stroke="rgba(148,163,184,0.5)" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="topic" type="category" stroke="rgba(148,163,184,0.5)" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="weakness" fill="#F59E0B" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-white/30">
                  No weakness data yet — keep practising!
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Skill breakdown bars */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard glow="emerald">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Brain size={20} className="text-emerald-400" />
                Skill Breakdown
              </h3>
              <SkillBars skills={skillBars} />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Coding trend ── */}
      {codingTrend.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-12">
          <GlassCard glow="blue">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Code2 size={20} className="text-blue-400" />
                Coding Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={codingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(148,163,184,0.5)" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Session history ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <GlassCard glow="blue">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-400" />
              Recent Interview Sessions
            </h3>
            {sessionHistory.length > 0 ? (
              <div className="space-y-3">
                {sessionHistory.map((session, i) => {
                  const score = session.score;
                  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{session.role} Interview</p>
                        <p className="text-sm text-slate-400">{session.date}</p>
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${scoreColor}`}>{score}</p>
                          <p className="text-xs text-slate-400">/100</p>
                        </div>
                        {session.duration > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-300">{session.duration}m</p>
                            <p className="text-xs text-slate-400">duration</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/40 text-center py-8">No completed sessions yet.</p>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
