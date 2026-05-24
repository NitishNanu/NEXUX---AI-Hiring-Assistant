import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Sparkles, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ResumeContextPanel = ({ data }) => {
  if (!data) return null;

  const scoreData = [
    { name: 'Score', value: data.score },
    { name: 'Remaining', value: 100 - data.score }
  ];
  
  const COLORS = ['#00d4ff', 'rgba(0, 212, 255, 0.1)'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
  };

  const skillsData = data.skills?.slice(0, 6).map((skill) => ({
    name: skill.name || skill,
    level: skill.level || Math.floor(Math.random() * 40 + 60)
  })) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full w-full glass-card flex flex-col overflow-hidden rounded-2xl border border-cyan-500/20 shadow-2xl relative"
    >
      
      {/* Gradient Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-pink-500/5 blur-3xl -z-10 rounded-full" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-cyan-500/20 px-6 py-5 bg-gradient-to-r from-cyan-500/5 via-transparent to-pink-500/5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/10">
            <Award size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Analysis Results
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">AI-powered insights</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-5 p-6"
      >
        {/* ATS Score Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-2xl rounded-full -z-10" />
          
          <div className="flex justify-between items-start mb-5">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-cyan-400" />
                ATS Score
              </h4>
              <p className="text-xs text-slate-500">Applicant Tracking Score</p>
            </div>
            {data.score >= 75 && <Sparkles size={20} className="text-yellow-400 animate-pulse" />}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width={128} height={128}>
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,212,255,0.4)]">
                  {data.score}
                </span>
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-300">Overall Match</span>
                    <span className="text-xs text-cyan-400 font-semibold">{Math.round(data.score / 20)}/5</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {data.score >= 80 ? '✨ Excellent match' : data.score >= 60 ? '👍 Good potential' : '🎯 Needs improvement'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-2xl p-5 border border-purple-500/20"
        >
          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span>
            Summary
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
            {data.summary}
          </p>
        </motion.div>

        {/* Skills Cloud */}
        {skillsData.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-5 border border-emerald-500/20"
          >
            <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Top Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillsData.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 text-emerald-300 hover:border-emerald-500/60 transition-all"
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Experience Card */}
        {data.experience_years && (
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-2xl p-5 border border-orange-500/20"
          >
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span className="text-lg">⏱️</span>
              Experience
            </h4>
            <p className="text-2xl font-bold text-orange-400">
              {data.experience_years}
              <span className="text-sm text-slate-400 font-normal ml-1">years</span>
            </p>
          </motion.div>
        )}

      </motion.div>
    </motion.div>
  );
};

export default ResumeContextPanel;
