import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from '../components/layout/AppShell';
import ChatShell from '../components/chat/ChatShell';
import DropZone from '../components/resume/DropZone';
import ResumePanel from '../components/resume/ResumePanel';
import JdAnalyzer from '../components/jd/JdAnalyzer';
import GlassCard from '../components/ui/GlassCard';
import { useAppContext } from '../context/AppContext';

function ResumeColumn({ state }) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3 p-3">
      <GlassCard className="p-4">
        <DropZone resumeData={state.resumeData} isLoading={state.isLoadingResume} />
      </GlassCard>
      <div className="min-h-0">
        <ResumePanel resumeData={state.resumeData} isLoading={state.isLoadingResume} />
      </div>
    </div>
  );
}

export default function Workspace() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('chat');
  const resumeLoaded = Boolean(state.resumeData.rawText);

  return (
    <AppShell resumeLoaded={resumeLoaded} activeTab={activeTab} onTabChange={setActiveTab}>
      <section style={{ gridArea: 'resume' }} className="hidden min-h-0 md:block">
        <ResumeColumn state={state} />
      </section>
      <section style={{ gridArea: 'jd' }} className="hidden p-3 pt-0 md:block">
        <JdAnalyzer />
      </section>
      <section style={{ gridArea: 'chat' }} className="hidden min-h-0 p-3 pl-0 md:block">
        <ChatShell />
      </section>

      <div className="relative h-full min-h-0 md:hidden">
        {activeTab === 'chat' && (
          <div className="h-full p-3">
            <ChatShell />
          </div>
        )}
        {activeTab === 'analyze' && (
          <div className="h-full overflow-y-auto p-3">
            <JdAnalyzer />
          </div>
        )}
        <AnimatePresence>
          {activeTab === 'upload' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute inset-0 overflow-y-auto bg-surface p-3"
            >
              <ResumeColumn state={state} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
