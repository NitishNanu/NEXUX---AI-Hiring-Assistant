import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, AlertTriangle, Briefcase, Zap, Plus, FileText } from 'lucide-react';

// Circular progress for ATS Score
const ATSGauge = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let colorClass = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r={radius} className="stroke-current text-slate-700" strokeWidth="8" fill="transparent" />
        <motion.circle 
          cx="64" cy="64" r={radius} 
          className={`stroke-current ${colorClass}`} 
          strokeWidth="8" fill="transparent" strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
};

export default function SmartInsights({ data, isLoading }) {
  if (isLoading) {
    return (
      <aside className="hidden xl:flex w-80 glass-panel border-l border-white/5 flex-col p-6 space-y-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
            <div className="w-32 h-32 mx-auto bg-slate-700 rounded-full mt-8"></div>
          </div>
        </div>
      </aside>
    );
  }

  if (!data?.parsed && !data?.ats) {
    return (
      <aside className="hidden xl:flex w-80 glass-panel border-l border-white/5 flex-col p-6 items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <FileText className="text-slate-500" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-300">No Data Available</h3>
        <p className="text-sm text-slate-500 mt-2">Upload a resume to see intelligent insights here.</p>
      </aside>
    );
  }

  const { parsed, ats } = data;
  const atsScore = ats?.ats_score || ats?.ats || 0;
  const missingSkills = ats?.missing_skills || [];
  const suggestions = ats?.feedback || ats?.suggestions || [];

  return (
    <aside className="hidden xl:flex w-96 glass-panel border-l border-white/5 flex-col overflow-y-auto hide-scrollbar">
      <div className="p-6 pb-2 sticky top-0 bg-[#1e293b]/90 backdrop-blur-md z-10 border-b border-white/5">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SparklesIcon />
          <span>Smart Insights</span>
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* ATS Score Section */}
        <section>
          <ATSGauge score={atsScore} />
        </section>

        {/* Profile Stats */}
        <section className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Zap size={14} /> <span className="text-xs uppercase font-medium">Skills</span>
            </div>
            <span className="text-2xl font-bold gradient-text">{parsed?.skills?.length || 0}</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Briefcase size={14} /> <span className="text-xs uppercase font-medium">Experience</span>
            </div>
            <span className="text-2xl font-bold text-white">{parsed?.experience_years || 0}y</span>
          </div>
        </section>

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Target size={14} /> Critical Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <Plus size={10} /> {skill}
                </span>
              ))}
              {missingSkills.length > 6 && (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-400">
                  +{missingSkills.length - 6} more
                </span>
              )}
            </div>
          </section>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> AI Suggestions
            </h3>
            <ul className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <motion.li 
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  key={idx} className="text-sm text-slate-300 flex items-start gap-2 bg-white/5 rounded-lg p-3"
                >
                  <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="leading-snug">{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
