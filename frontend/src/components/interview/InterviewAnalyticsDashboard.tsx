import { motion } from 'framer-motion';
import {
  RadarChart,
  Radar,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { TrendingUp, Award, Activity, Target } from 'lucide-react';

interface AnalyticsDashboardProps {
  communication: number;
  technicalDepth: number;
  confidence: number;
  problemSolving: number;
  leadership: number;
  systemDesign: number;
  coding: number;
  communicationTrend: number[];
  codingTrend: number[];
  topicWeaknesses: Record<string, number>;
  readinessScore: number;
  sessionHistory: any[];
}

export function InterviewAnalyticsDashboard({
  communication,
  technicalDepth,
  confidence,
  problemSolving,
  leadership,
  systemDesign,
  coding,
  communicationTrend,
  codingTrend,
  topicWeaknesses,
  readinessScore,
  sessionHistory,
}: AnalyticsDashboardProps) {
  // Prepare data for radar chart
  const radarData = [
    { subject: 'Communication', value: communication, fullMark: 100 },
    { subject: 'Technical Depth', value: technicalDepth, fullMark: 100 },
    { subject: 'Confidence', value: confidence, fullMark: 100 },
    { subject: 'Problem Solving', value: problemSolving, fullMark: 100 },
    { subject: 'Leadership', value: leadership, fullMark: 100 },
    { subject: 'System Design', value: systemDesign, fullMark: 100 },
    { subject: 'Coding', value: coding, fullMark: 100 },
  ];

  // Prepare trend data
  const trendData = communicationTrend.map((comm, idx) => ({
    session: idx + 1,
    communication: comm,
    coding: codingTrend[idx] || 0,
  }));

  // Prepare weakness data
  const weaknessData = Object.entries(topicWeaknesses)
    .slice(0, 8)
    .map(([topic, score]) => ({
      topic: topic.replace('_', ' '),
      score,
    }));

  // Question distribution
  const questionDistribution = [
    { name: 'Behavioral', value: 25, fill: '#3b82f6' },
    { name: 'Technical', value: 35, fill: '#8b5cf6' },
    { name: 'Coding', value: 20, fill: '#ec4899' },
    { name: 'System Design', value: 15, fill: '#f59e0b' },
    { name: 'HR', value: 5, fill: '#10b981' },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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

  const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {value}%
          </p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon className="w-6 h-6 text-white/80" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-8 py-12"
    >
      {/* Header */}
      <motion.div variants={item} className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-2">Interview Analytics</h2>
        <p className="text-white/60">Track your progress and identify areas for improvement</p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4"
      >
        <StatCard
          label="Communication"
          value={communication}
          icon={TrendingUp}
          color="from-blue-400 to-cyan-400"
          trend={communication - (communicationTrend[communicationTrend.length - 2] || communication)}
        />
        <StatCard
          label="Technical Depth"
          value={technicalDepth}
          icon={Award}
          color="from-purple-400 to-pink-400"
        />
        <StatCard
          label="Confidence"
          value={confidence}
          icon={Activity}
          color="from-green-400 to-emerald-400"
        />
        <StatCard
          label="Overall Readiness"
          value={readinessScore}
          icon={Target}
          color="from-orange-400 to-red-400"
        />
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Skills Radar Chart */}
        <motion.div
          variants={item}
          className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Skills Profile</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trend Line */}
        {trendData.length > 0 && (
          <motion.div
            variants={item}
            className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="session" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="communication"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="Communication"
                />
                <Line
                  type="monotone"
                  dataKey="coding"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                  name="Coding"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Weak topics bar chart */}
        {weaknessData.length > 0 && (
          <motion.div
            variants={item}
            className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Topics to Improve</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weaknessData}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="topic" stroke="rgba(255,255,255,0.5)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Question distribution pie */}
        <motion.div
          variants={item}
          className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Question Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={questionDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {questionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Insights section */}
        <motion.div
          variants={item}
          className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">AI Insights</h3>
          <div className="space-y-3">
            {communication < 70 && (
              <div className="flex gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-blue-400 text-2xl flex-shrink-0">💡</span>
                <p className="text-sm text-blue-100">
                  Your communication skills are developing. Focus on using the STAR method and being more specific with examples.
                </p>
              </div>
            )}
            {coding < 65 && (
              <div className="flex gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="text-orange-400 text-2xl flex-shrink-0">🎯</span>
                <p className="text-sm text-orange-100">
                  Practice coding problems on topics like {weaknessData[0]?.topic || 'algorithms'}. Focus on optimization after correctness.
                </p>
              </div>
            )}
            {confidence < 70 && (
              <div className="flex gap-3 p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <span className="text-pink-400 text-2xl flex-shrink-0">⚡</span>
                <p className="text-sm text-pink-100">
                  Build confidence by reviewing your weak areas and practicing mock interviews. Your scores are improving!
                </p>
              </div>
            )}
            <div className="flex gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="text-green-400 text-2xl flex-shrink-0">✨</span>
              <p className="text-sm text-green-100">
                Your interview readiness is at {readinessScore}%. Continue practicing and you'll be interview-ready soon!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default InterviewAnalyticsDashboard;
