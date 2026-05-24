import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CheckCircle2, LogOut, UserRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useNexusStore } from '../../store/nexusStore';
import { useAuthStore } from '../../store/authStore';
import NexusOrb from '../ui/NexusOrb';

const tabs = [
  { label: 'Dashboard',     to: '/' },
  { label: 'Resume Parser', to: '/resume-parser' },
  { label: 'ATS Checker',   to: '/ats-checker' },
  { label: 'JD Matching',   to: '/jd-matching' },
  { label: 'Interview Prep',to: '/interview-prep' },
];

export default function NexusShell({ children }: { children: ReactNode }) {
  const { resumeData } = useNexusStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    useNexusStore.getState().setResumeData(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="nexus-shell">
      <header className="nexus-nav">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" aria-label="NEXUS home">
          <NexusOrb size={58} speed={0.45} className="shrink-0" />
          <div className="hidden text-left sm:block">
            <div className="font-display text-lg font-semibold tracking-[0.32em] text-glacier">NEXUS</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan">AI Hiring Intelligence</div>
          </div>
        </Link>

        {/* Nav pills */}
        <nav className="nav-pills" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="active-pill" className="active-pill" />}
                  <span className="relative z-10">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status + user */}
        <div className="nav-status">
          <span className="status-orb" aria-label="Backend connected" />
          <span className="hidden items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs text-emerald md:inline-flex">
            <Activity size={13} /> Connected
          </span>

          <AnimatePresence>
            {resumeData && (
              <motion.span
                className="resume-chip"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
              >
                <CheckCircle2 size={14} /> Resume Loaded
              </motion.span>
            )}
          </AnimatePresence>

          {/* User avatar + dropdown */}
          <div className="user-menu-wrap">
            <button
              className="avatar"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open user menu"
              aria-expanded={menuOpen}
            >
              <UserRound size={18} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Click-away overlay */}
                  <div
                    className="fixed inset-0 z-[150]"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="user-dropdown-info">
                      <span className="user-dropdown-name">{user?.name ?? 'User'}</span>
                      <span className="user-dropdown-email">{user?.email}</span>
                    </div>
                    <hr className="user-dropdown-divider" />
                    <button
                      className="user-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="nexus-main">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="bottom-tabs" aria-label="Mobile navigation">
        {[
          { label: 'Home',      to: '/' },
          { label: 'Parser',    to: '/resume-parser' },
          { label: 'ATS',       to: '/ats-checker' },
          { label: 'Match',     to: '/jd-matching' },
          { label: 'Assistant', to: '/hr-assistant' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}