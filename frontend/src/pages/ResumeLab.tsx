import { motion } from 'framer-motion';
import { CheckCircle2, FileScan, ShieldCheck, Sparkles } from 'lucide-react';
import QuantumDropZone from '../components/resume/QuantumDropZone';
import ResumeIntelPanel from '../components/resume/ResumeIntelPanel';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import { useNexusStore } from '../store/nexusStore';

export default function ResumeLab() {
  const resumeData = useNexusStore((state) => state.resumeData);

  return (
    <motion.div className="page-shell resume-lab-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
      <div className="page-header">
        <Badge tone="cyan">Resume Parser</Badge>
        <h1>Turn a resume into structured hiring intelligence.</h1>
        <p>Upload once, extract the core signals, and prepare the profile for ATS review, matching, and interview coaching.</p>
      </div>
      <div className="resume-lab-grid">
        <div>
          <QuantumDropZone />
          <GlassCard className="process-card" glow="cyan">
            {[
              { icon: FileScan, title: 'Parse', text: 'Extracts raw text, skills, education, and project context.' },
              { icon: ShieldCheck, title: 'Normalize', text: 'Organizes the profile into a clean ATS-ready data model.' },
              { icon: Sparkles, title: 'Reuse', text: 'Feeds the same context into ATS scoring, matching, and interview prep.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title}>
                  <Icon size={20} />
                  <span><strong>{item.title}</strong>{item.text}</span>
                </div>
              );
            })}
          </GlassCard>
        </div>
        <div>
          <ResumeIntelPanel />
          {resumeData && (
            <GlassCard className="resume-status-card" glow="emerald">
              <CheckCircle2 className="text-emerald" />
              <div>
                <strong>{resumeData.file.name}</strong>
                <span>Uploaded {resumeData.uploadedAt.toLocaleString()}</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
