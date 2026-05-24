import { motion } from 'framer-motion';
import { MessageSquareText, Sparkles, UserRoundPen } from 'lucide-react';
import NexusChat from '../components/chat/NexusChat';
import JdAnalyzer from '../components/jd/JdAnalyzer';
import QuantumDropZone from '../components/resume/QuantumDropZone';
import ResumeIntelPanel from '../components/resume/ResumeIntelPanel';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import { useNexusStore } from '../store/nexusStore';

export default function Workspace() {
  const resumeData = useNexusStore((state) => state.resumeData);
  const jdResult = useNexusStore((state) => state.jdResult);

  return (
    <motion.div className="workspace-page" initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}>
      <div className="workspace-title-row">
        <div>
          <Badge tone="violet">HR AI Assistant</Badge>
          <h1>Context-aware recruiting assistance, all in one cockpit.</h1>
        </div>
        <p>Use this page when you want resume intelligence, chat, and JD analysis visible at the same time.</p>
      </div>
      <section className="metric-grid" aria-label="assistant status">
        <GlassCard className="metric-card" glow="violet">
          <UserRoundPen size={20} />
          <span>Resume Context</span>
          <strong>{resumeData ? 'Loaded' : 'Ready'}</strong>
        </GlassCard>
        <GlassCard className="metric-card" glow="cyan">
          <MessageSquareText size={20} />
          <span>Assistant Mode</span>
          <strong>Active</strong>
        </GlassCard>
        <GlassCard className="metric-card" glow="emerald">
          <Sparkles size={20} />
          <span>Latest Match</span>
          <strong>{jdResult ? `${jdResult.score}/100` : '--'}</strong>
        </GlassCard>
      </section>
      <div className="workspace-grid">
        <div className="resume-area">
          <QuantumDropZone />
          <ResumeIntelPanel />
        </div>
        <GlassCard className="jd-area" glow="cyan">
          <JdAnalyzer />
        </GlassCard>
        <div className="chat-area">
          <NexusChat />
        </div>
      </div>
    </motion.div>
  );
}
