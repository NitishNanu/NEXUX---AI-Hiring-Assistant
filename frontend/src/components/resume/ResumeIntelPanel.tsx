import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, GraduationCap, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNexusStore } from '../../store/nexusStore';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import AtsScoreSphere, { scoreTone } from './AtsScoreSphere';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="intel-section">
      <button className="intel-section-head" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>{title}</span>
        <ChevronDown className={open ? 'rotate-180' : ''} size={18} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResumeIntelPanel() {
  const resumeData = useNexusStore((state) => state.resumeData);
  const skills = Array.isArray(resumeData?.parsed?.skills) ? resumeData!.parsed.skills.slice(0, 16) : [];
  const tone = scoreTone(resumeData?.ats?.score || 0);
  const summaryText = typeof resumeData?.parsed?.summary === 'string' ? resumeData!.parsed.summary : 'Upload a resume to unlock AI insights.';
  const summaryWords = useMemo(() => summaryText.split(' '), [summaryText]);

  if (!resumeData) {
    return (
      <GlassCard className="empty-intel">
        <div className="wire-panel" />
        <p>Upload a resume to unlock AI insights</p>
      </GlassCard>
    );
  }

  return (
    <motion.aside className="resume-intel" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="grid place-items-center">
        <AtsScoreSphere score={resumeData.ats.score} />
        <motion.div className="font-display text-5xl font-bold text-glacier" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {resumeData.ats.score}
        </motion.div>
        <Badge tone={tone.tone}>{resumeData.ats.level || tone.label}</Badge>
      </div>
      <Section title="Skills Constellation">
        <div className="skills-constellation">
          {skills.length ? skills.map((skill, index) => (
            <button key={`${String(skill)}-${index}`} className={index < 5 ? 'skill-node primary' : 'skill-node'} title={typeof skill === 'string' ? skill : JSON.stringify(skill)}>
              {typeof skill === 'string' ? skill : (skill && skill.name) || JSON.stringify(skill)}
            </button>
          )) : <p className="text-sm text-glacier/58">NEXUS did not find skills in the parsed response yet.</p>}
        </div>
      </Section>
      <Section title="Summary">
        <p className="leading-7 text-glacier/78">
          {summaryWords.map((word, index) => (
            <motion.span key={`${word}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.015 }}>
              {word}{' '}
            </motion.span>
          ))}
        </p>
      </Section>
      <Section title="Education">
        <div className="space-y-3">
          {(Array.isArray(resumeData.parsed.education) && resumeData.parsed.education.length ? resumeData.parsed.education : [{ institution: 'Education parsed from resume', degree: 'AI extraction pending', year: 'NEXUS' }]).map((item, index) => (
            <div key={`${item.institution || index}-${index}`} className="tilt-card">
              <GraduationCap size={18} className="text-gold" />
              <div><p className="font-semibold">{item.institution}</p><p className="text-sm text-glacier/55">{item.degree} {item.year ? `- ${item.year}` : ''}</p></div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Projects">
        <div className="space-y-3">
          {(Array.isArray(resumeData.parsed.projects) && resumeData.parsed.projects.length ? resumeData.parsed.projects : [{ name: 'Portfolio intelligence', description: 'Project details appear here after parsing.', tech_stack: ['AI'], relevance: 72 }]).map((project, index) => (
            <div key={`${(project && project.name) || index}-${index}`} className="project-card">
              <div className="flex items-center gap-2"><Sparkles size={16} className="text-cyan" /><span className="font-semibold">{project.name}</span></div>
              <p className="mt-2 text-sm text-glacier/60">{project.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">{Array.isArray(project.tech_stack) ? project.tech_stack.map((tech) => <Badge key={tech} tone="cyan">{tech}</Badge>) : (project.tech_stack ? <Badge tone="cyan">{String(project.tech_stack)}</Badge> : null)}</div>
            </div>
          ))}
        </div>
      </Section>
    </motion.aside>
  );
}
