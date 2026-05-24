import { motion } from 'framer-motion';
import { Bell, Database, KeyRound, SlidersHorizontal } from 'lucide-react';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';

const settings = [
  { title: 'Model Behavior', text: 'Tune coaching intensity, explanation depth, and interview difficulty.', icon: SlidersHorizontal },
  { title: 'API Connection', text: 'Uses VITE_API_BASE from environment configuration only.', icon: Database },
  { title: 'Notifications', text: 'Control upload, analysis, and chat completion notifications.', icon: Bell },
  { title: 'Privacy', text: 'Keep resume context scoped to this local session state.', icon: KeyRound }
];

export default function Settings() {
  return (
    <motion.div className="page-shell settings-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
      <div className="page-header">
        <Badge tone="violet">Settings</Badge>
        <h1>Control room for the NEXUS experience.</h1>
        <p>These panels make the app feel production-shaped while leaving backend behavior untouched.</p>
      </div>
      <div className="settings-grid">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <GlassCard key={setting.title} className="setting-card" glow="violet">
              <Icon size={22} />
              <div>
                <h2>{setting.title}</h2>
                <p>{setting.text}</p>
              </div>
              <button aria-label={`Toggle ${setting.title}`} />
            </GlassCard>
          );
        })}
      </div>
    </motion.div>
  );
}
