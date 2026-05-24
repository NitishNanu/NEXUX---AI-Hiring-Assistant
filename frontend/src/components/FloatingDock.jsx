import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, LayoutDashboard, Settings, FileText, Briefcase, LogOut, ScanSearch } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingDock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dockVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const navItems = [
    { id: 'parser', icon: <FileText size={22} />, label: 'Parser', path: '/resume-parser' },
    { id: 'ats', icon: <ScanSearch size={22} />, label: 'ATS', path: '/ats-checker' },
    { id: 'match', icon: <Briefcase size={22} />, label: 'Match', path: '/jd-matching' },
    { id: 'assistant', icon: <MessageSquare size={22} />, label: 'Assistant', path: '/hr-assistant' },
    { id: 'settings', icon: <Settings size={22} />, label: 'Settings', path: '/settings' },
    { id: 'logout', icon: <LogOut size={22} />, label: 'Log Out', path: '/' }
  ];

  return (
    <motion.div 
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center p-2 rounded-full glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10"
      variants={dockVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex gap-2 items-center">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path) && item.path !== '/';
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative group p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-white/10 text-primary glow-effect' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.icon}
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap backdrop-blur-md border border-white/10">
                {item.label}
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="dock-indicator"
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FloatingDock;
