import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, UploadCloud, ScanSearch, Briefcase, Brain, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';

const DISMISS_KEY = 'nexus-onboarding-dismissed';

const steps = [
  {
    id: 1, icon: UploadCloud, title: 'Upload Your Resume',
    desc: 'Parse skills, experience and AI insights in seconds.',
    to: '/resume-parser', color: '#00FFD1',
  },
  {
    id: 2, icon: ScanSearch, title: 'Check ATS Score',
    desc: 'See how a recruiter system reads your profile.',
    to: '/ats-checker', color: '#00FF88',
  },
  {
    id: 3, icon: Briefcase, title: 'Match a Job Description',
    desc: 'Compare your skills against any role and close the gaps.',
    to: '/jd-matching', color: '#F59E0B',
  },
  {
    id: 4, icon: Brain, title: 'Start a Mock Interview',
    desc: 'Practice with AI and get real-time scored feedback.',
    to: '/mock-interview', color: '#7C3AED',
  },
];

export default function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  );
  const { resumeData, jdResult } = useNexusStore();

  const isComplete = (id: number) => {
    if (id === 1) return !!resumeData;
    if (id === 2) return !!resumeData && (resumeData.ats?.score ?? 0) > 0;
    if (id === 3) return !!jdResult;
    return false;
  };

  const completedCount = steps.filter(s => isComplete(s.id)).length;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  if (dismissed || completedCount === steps.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16, height: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          marginBottom: 20,
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20,
          padding: '20px 22px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,255,209,0.04))',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: '"Clash Display",sans-serif', fontSize: 17, fontWeight: 700, color: '#f0f4ff' }}>
                Getting Started
              </span>
              <motion.span
                key={completedCount}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                style={{
                  fontSize: 11, fontFamily: 'monospace',
                  color: '#7c3aed', fontWeight: 700,
                  border: '1px solid rgba(124,58,237,0.4)',
                  borderRadius: 999, padding: '2px 10px',
                }}
              >
                {completedCount}/{steps.length} done
              </motion.span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(240,244,255,0.5)' }}>
              Complete the workflow to unlock the full NEXUS intelligence suite
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss onboarding"
            style={{
              background: 'none', border: 'none',
              color: 'rgba(240,244,255,0.35)', cursor: 'pointer',
              padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(240,244,255,0.06)', borderRadius: 999, marginBottom: 16 }}>
          <motion.div
            style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#7c3aed,#00ffd1)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / steps.length) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {steps.map((step, i) => {
            const done = isComplete(step.id);
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={step.to}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 10,
                    padding: '14px 16px', borderRadius: 16, textDecoration: 'none',
                    border: done
                      ? '1px solid rgba(0,255,136,0.3)'
                      : '1px solid rgba(240,244,255,0.09)',
                    background: done
                      ? 'rgba(0,255,136,0.05)'
                      : 'rgba(240,244,255,0.03)',
                    color: 'inherit',
                    transition: 'all 200ms ease',
                    opacity: done ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: done ? 'rgba(0,255,136,0.12)' : `${step.color}15`,
                      border: `1px solid ${done ? 'rgba(0,255,136,0.4)' : step.color + '44'}`,
                    }}>
                      <Icon size={17} style={{ color: done ? '#00ff88' : step.color }} />
                    </div>
                    {done
                      ? <CheckCircle2 size={17} style={{ color: '#00ff88' }} />
                      : <ArrowRight size={15} style={{ color: 'rgba(240,244,255,0.28)' }} />
                    }
                  </div>
                  <div>
                    <p style={{
                      margin: 0, fontSize: 13, fontWeight: 700,
                      color: done ? 'rgba(240,244,255,0.5)' : '#f0f4ff',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {step.title}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(240,244,255,0.42)', lineHeight: 1.45 }}>
                      {step.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
