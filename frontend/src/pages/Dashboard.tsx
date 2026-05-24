import { motion } from 'framer-motion';
import { ArrowUpRight, Briefcase, ChevronRight, FileText, MessageCircle, ScanSearch, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import NexusOrb from '../components/ui/NexusOrb';

const metrics = [
  { label: 'Career Signal', value: '92%', tone: 'emerald', icon: TrendingUp },
  { label: 'Resume Depth', value: '18', tone: 'cyan', icon: FileText },
  { label: 'Interview Sets', value: '6', tone: 'gold', icon: MessageCircle },
  { label: 'Role Fit Index', value: 'A-', tone: 'violet', icon: Target }
] as const;

const modules = [
  {
    title: 'Resume Parser',
    text: 'Upload once and extract structured experience, projects, skills, and signal.',
    to: '/resume-parser',
    icon: FileText,
    tone: 'cyan'
  },
  {
    title: 'ATS Checker',
    text: 'Score your resume against the ATS lens and see the fastest improvements.',
    to: '/ats-checker',
    icon: ScanSearch,
    tone: 'emerald'
  },
  {
    title: 'JD Matching',
    text: 'Compare a role description to your profile and close the highest-value gaps.',
    to: '/jd-matching',
    icon: Briefcase,
    tone: 'violet'
  },
  {
    title: 'Interview Prep',
    text: 'Generate targeted questions, rehearse answers, and tighten your story.',
    to: '/interview-prep',
    icon: MessageCircle,
    tone: 'gold'
  },
  {
    title: 'HR AI Assistant',
    text: 'Work with a context-aware recruiting copilot for analysis, chat, and decisions.',
    to: '/hr-assistant',
    icon: Sparkles,
    tone: 'violet'
  }
] as const;

const flowSteps = [
  { title: 'Parse', text: 'Extract clean resume structure and skill signals.', accent: 'cyan' },
  { title: 'Score', text: 'Check ATS readiness and formatting risk.', accent: 'emerald' },
  { title: 'Match', text: 'Compare the profile against a target job.', accent: 'violet' },
  { title: 'Coach', text: 'Prep targeted interview questions and responses.', accent: 'gold' },
  { title: 'Assist', text: 'Use the HR AI copilot for deeper decisions.', accent: 'coral' }
] as const;

export default function Dashboard() {
  const resumeData = useNexusStore((state) => state.resumeData);

  return (
    <motion.div className="page-shell" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
      <section className="dashboard-hero">
        <div>
          <Badge tone="violet">Command Center</Badge>
          <h1>NEXUS turns hiring into a multi-module operating system.</h1>
          <p>
            Move through parsing, ATS scoring, JD matching, interview prep, and AI assistance from dedicated product-grade workspaces.
          </p>
          <div className="hero-actions">
            <Link to="/hr-assistant" className="primary-link">Open HR Assistant <ArrowUpRight size={17} /></Link>
            <Link to="/resume-parser" className="secondary-link">Start Resume Parser</Link>
          </div>
          <div className="hero-signal-row">
            {flowSteps.map((step, index) => (
              <div key={step.title} className={`hero-signal hero-signal-${step.accent}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-orb-card">
          <NexusOrb size={220} speed={0.38} />
          <div className="orb-stat">
            <span>Current ATS</span>
            <strong>{resumeData?.ats.score ?? '--'}</strong>
          </div>
          <div className="hero-stack-panel">
            <span>Suite Snapshot</span>
            <div>
              <strong>{resumeData ? 'Live context loaded' : 'Waiting on resume'}</strong>
              <p>One dataset flows through all five surfaces.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <GlassCard key={metric.label} className="metric-card" glow={metric.tone}>
              <Icon size={20} />
              <span>{metric.label}</span>
              <strong>{metric.label === 'Resume Depth' ? resumeData?.parsed.skills?.length ?? 0 : metric.value}</strong>
            </GlassCard>
          );
        })}
      </section>

      <section className="module-grid">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link to={module.to} key={module.title} className={`module-card accent-${module.tone}`}>
              <div className="module-card-top">
                <Icon size={22} />
                <ChevronRight size={18} />
              </div>
              <h2>{module.title}</h2>
              <p>{module.text}</p>
              <span>Launch <ArrowUpRight size={14} /></span>
            </Link>
          );
        })}
      </section>

      <section className="suite-band">
        <div>
          <Badge tone="cyan">Workflow Rail</Badge>
          <h2>Every page has a distinct job.</h2>
          <p>Instead of one crowded workspace, the product now stages each hiring task across a focused surface.</p>
        </div>
        <div className="suite-band-grid">
          {[
            { title: 'Resume Parser', detail: 'Structured extraction' },
            { title: 'ATS Checker', detail: 'Readiness scoring' },
            { title: 'JD Matching', detail: 'Role fit analysis' },
            { title: 'Interview Prep', detail: 'Question generation' },
            { title: 'HR AI Assistant', detail: 'Contextual chat' }
          ].map((item) => (
            <div key={item.title} className="suite-band-chip">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
