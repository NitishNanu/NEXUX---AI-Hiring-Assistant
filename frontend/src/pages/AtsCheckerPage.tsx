import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, ScanSearch, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import { useNexusStore } from '../store/nexusStore';

const suggestions = [
  'Keep the resume format clean, single-column, and parser-friendly.',
  'Mirror the strongest role keywords in experience bullets and skills.',
  'Use quantified impact so the score reflects outcomes, not just responsibilities.'
];

export default function AtsCheckerPage() {
  const resumeData = useNexusStore((state) => state.resumeData);

  const score = resumeData?.ats.score ?? 0;
  const level = resumeData?.ats.level ?? 'Pending upload';
  const skillCount = resumeData?.parsed.skills?.length ?? 0;

  return (
    <motion.div className="page-shell ats-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
      <div className="page-header">
        <Badge tone="emerald">ATS Checker</Badge>
        <h1>See how a screening system will read your resume.</h1>
        <p>
          This view translates the parsed resume into a practical ATS readiness snapshot, then points you to the next best fix.
        </p>
      </div>

      <section className="metric-grid">
        <GlassCard className="metric-card" glow="emerald">
          <ScanSearch size={20} />
          <span>ATS Score</span>
          <strong>{resumeData ? `${score}%` : '--'}</strong>
        </GlassCard>
        <GlassCard className="metric-card" glow="cyan">
          <ShieldCheck size={20} />
          <span>Readiness</span>
          <strong>{level}</strong>
        </GlassCard>
        <GlassCard className="metric-card" glow="gold">
          <Sparkles size={20} />
          <span>Parsed Skills</span>
          <strong>{skillCount}</strong>
        </GlassCard>
        <GlassCard className="metric-card" glow="violet">
          <WandSparkles size={20} />
          <span>Next Step</span>
          <strong>{resumeData ? 'Optimize' : 'Upload'}</strong>
        </GlassCard>
      </section>

      <div className="analyzer-grid" style={{ marginTop: 18 }}>
        <GlassCard className="analyzer-main" glow="emerald">
          <div className="page-header compact" style={{ marginBottom: 0 }}>
            <h2 style={{ marginTop: 0 }}>ATS optimization playbook</h2>
            <p>{resumeData ? 'Use the current parse to harden the profile before job matching.' : 'Upload a resume in Resume Parser to unlock score details and recommendations.'}</p>
          </div>
          <div className="module-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginTop: 18 }}>
            {suggestions.map((suggestion, index) => (
              <GlassCard key={suggestion} className="context-card" glow={index === 1 ? 'cyan' : 'emerald'}>
                <CheckCircle2 size={20} />
                <h2>Step {index + 1}</h2>
                <p>{suggestion}</p>
              </GlassCard>
            ))}
          </div>
        </GlassCard>

        <aside className="analyzer-sidebar">
          <GlassCard className="context-card" glow="emerald">
            <ScanSearch size={22} />
            <h2>Score source</h2>
            <p>{resumeData ? `NEXUS has already scored ${resumeData.file.name} against the ATS model.` : 'No resume is loaded yet, so the checker is waiting on a parse.'}</p>
          </GlassCard>
          <GlassCard className="context-card" glow="violet">
            <ArrowUpRight size={22} />
            <h2>Chain of use</h2>
            <p>Resume Parser feeds ATS Checker, JD Matching, Interview Prep, and the HR AI Assistant.</p>
          </GlassCard>
          <GlassCard className="context-card" glow="gold">
            <Link to="/resume-parser" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              Open Resume Parser <ArrowUpRight size={16} />
            </Link>
          </GlassCard>
        </aside>
      </div>
    </motion.div>
  );
}