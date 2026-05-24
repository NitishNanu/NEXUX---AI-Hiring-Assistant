import { motion } from 'framer-motion';
import { BriefcaseBusiness, ClipboardCheck, Layers3 } from 'lucide-react';
import JdAnalyzer from '../components/jd/JdAnalyzer';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import { useNexusStore } from '../store/nexusStore';

export default function JobAnalyzerPage() {
  const resumeData = useNexusStore((state) => state.resumeData);
  const jdResult = useNexusStore((state) => state.jdResult);
  const matchedSkillCount = Array.isArray(jdResult?.matched_skills) ? jdResult.matched_skills.length : 0;

  return (
    <motion.div className="page-shell analyzer-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
      <div className="page-header">
        <Badge tone="emerald">JD Matching</Badge>
        <h1>Compare your profile against the role before the recruiter does.</h1>
        <p>Paste any job description and NEXUS will extract overlap, gaps, match score, and high-value edits.</p>
      </div>
      <div className="analyzer-grid">
        <GlassCard className="analyzer-main" glow="emerald">
          <JdAnalyzer />
        </GlassCard>
        <aside className="analyzer-sidebar">
          <GlassCard className="context-card" glow={resumeData ? 'emerald' : 'gold'}>
            <BriefcaseBusiness size={22} />
            <h2>Resume Context</h2>
            <p>{resumeData ? `${resumeData.file.name} is loaded and ready for matching.` : 'Upload a resume in Resume Lab before running an analysis.'}</p>
          </GlassCard>
          <GlassCard className="context-card" glow="cyan">
            <ClipboardCheck size={22} />
            <h2>Latest Match</h2>
            <p>{jdResult ? `${jdResult.score || 0}/100 with ${matchedSkillCount} matched skills.` : 'Your latest JD result will appear here after analysis.'}</p>
          </GlassCard>
          <GlassCard className="context-card" glow="violet">
            <Layers3 size={22} />
            <h2>Industry Flow</h2>
            <p>Dashboard for overview, Resume Parser for profile quality, ATS Checker for readiness, and HR Assistant for deeper reasoning.</p>
          </GlassCard>
        </aside>
      </div>
    </motion.div>
  );
}
