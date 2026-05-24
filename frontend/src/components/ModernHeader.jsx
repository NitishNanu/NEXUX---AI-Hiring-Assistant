import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Zap, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function ModernHeader() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <div className="relative bg-slate-950 px-3 py-2 rounded-lg">
              <Zap size={20} className="text-cyan-400" />
            </div>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              HireAI
            </span>
              <span className="text-xs text-slate-400 -mt-1">Hiring Suite</span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1 px-3 py-2 rounded-full glass-card border border-cyan-500/20">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-cyan-400">API Connected</span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors hover:bg-white/5"
          >
            <LogOut size={16} />
            Dashboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-modern btn-primary-modern hidden sm:inline-flex"
            onClick={() => navigate('/hr-assistant')}
          >
            HR Assistant
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-white/5 glass-panel backdrop-blur-xl"
        >
          <div className="px-6 py-4 flex flex-col gap-3">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              Profile
            </button>
            <button className="w-full btn-modern btn-primary-modern" onClick={() => navigate('/')}>
              Home
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-red-400">
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
