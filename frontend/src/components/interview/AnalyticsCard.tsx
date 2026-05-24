import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

/**
 * AnalyticsCard - Shows interview performance metrics
 */
export const AnalyticsCard = ({
  title,
  value,
  target = 100,
  trend = 0,
  type = 'score', // score, percentage, count, trend
  color = 'cyan',
  icon: Icon = Target,
  breakdown,
}) => {
  const colorMap = {
    cyan: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-500 to-pink-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-pink-600',
  };

  const percentage = (value / target) * 100;
  const isPositiveTrend = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorMap[color]} rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-500`} />
      
      <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-lg p-6 border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <motion.span 
                key={value}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-white"
              >
                {value}
              </motion.span>
              {type === 'percentage' && <span className="text-lg text-slate-400">/100</span>}
              {type === 'score' && <span className="text-sm text-slate-400">pts</span>}
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`p-3 bg-gradient-to-br ${colorMap[color]} rounded-lg`}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Trend indicator */}
        {trend !== 0 && (
          <div className={`flex items-center gap-1 mb-4 text-sm font-semibold ${isPositiveTrend ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUp size={16} className={isPositiveTrend ? '' : 'rotate-180'} />
            {Math.abs(trend)}% {isPositiveTrend ? 'up' : 'down'}
          </div>
        )}

        {/* Progress bar */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${colorMap[color]}`}
          />
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="text-xs text-slate-400 space-y-1">
            {breakdown.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.label}</span>
                <span className="text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * SkillRadarChart - Shows skills distribution (using simple bars)
 */
export const SkillBars = ({ skills }) => {
  return (
    <div className="space-y-4">
      {skills.map((skill, i) => (
        <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-300">{skill.name}</span>
            <span className="text-xs text-slate-400">{skill.score}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.score}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`h-full rounded-full ${
                skill.score >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : skill.score >= 60
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : skill.score >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * PerformancePieChart - Shows question distribution
 */
export const PerformancePieChart = ({ data }) => {
  const COLORS = ['#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} questions`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsCard;
