import { BarChart3, Bot, Briefcase, FileText, MessageCircle, ScanSearch, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Dashboard', icon: BarChart3, to: '/' },
  { label: 'Resume Parser', icon: FileText, to: '/resume-parser' },
  { label: 'ATS Checker', icon: ScanSearch, to: '/ats-checker' },
  { label: 'JD Matching', icon: Briefcase, to: '/jd-matching' },
  { label: 'Interview Prep', icon: MessageCircle, to: '/interview-prep' },
  { label: 'HR Assistant', icon: Sparkles, to: '/hr-assistant' },
  { label: 'Settings', icon: Settings, to: '/settings' }
];

export default function Sidebar() {
  return (
    <motion.aside className="nexus-sidebar group" initial={false} whileHover={{ width: 240 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.label} to={item.to} end={index === 0} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} aria-label={item.label}>
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="mt-auto pb-4">
        <NavLink to="/hr-assistant" className="sidebar-item" aria-label="AI systems">
          <Bot size={22} />
          <span>AI Assistant</span>
        </NavLink>
      </div>
    </motion.aside>
  );
}
