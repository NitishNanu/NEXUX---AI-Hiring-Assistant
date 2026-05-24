import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, MessageSquare, BarChart3, Target, Sparkles,
  ArrowRight, Zap, Shield, TrendingUp, CheckCircle, ChevronRight,
  Rocket, Cpu, Wand2, ScanSearch, Briefcase, BrainCircuit, ClipboardList
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Resume Parser',
    desc: 'Turn raw resumes into structured candidate intelligence with skills, experience, and summary extraction.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: ScanSearch,
    title: 'ATS Checker',
    desc: 'See how a screening system reads the profile and get the highest-impact improvements.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Target,
    title: 'JD Matching',
    desc: 'Compare the resume against a role description and close the most relevant skill gaps.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: BrainCircuit,
    title: 'Interview Prep',
    desc: 'Generate interview questions, rehearse answers, and pressure-test the story arc.',
    color: 'from-pink-500 to-red-600',
  },
  {
    icon: MessageSquare,
    title: 'HR AI Assistant',
    desc: 'Use a context-aware recruiting copilot for chat, guidance, and decision support.',
    color: 'from-sky-500 to-cyan-600',
  },
];

const stats = [
  { value: '99%', label: 'Accuracy Rate', icon: Target },
  { value: '50+', label: 'Language Support', icon: Zap },
  { value: 'RAG+LoRA', label: 'Tech Stack', icon: Shield },
  { value: 'Instant', label: 'Processing', icon: TrendingUp },
];

export default function Landing() {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white overflow-x-hidden relative selection:bg-cyan-500/30">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl animate-float-smooth" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[45%] rounded-full bg-gradient-to-tl from-pink-500/15 to-transparent blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[20%] h-[30%] rounded-full bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg blur opacity-75 animate-pulse"></div>
              <div className="relative bg-slate-950 px-3 py-2 rounded-lg">
                <Rocket size={24} className="text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                HireAI
              </span>
              <span className="text-xs text-slate-500 -mt-1">Next-Gen Recruitment</span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              href="#features" 
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block"
            >
              Features
            </motion.a>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/hr-assistant')} 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/hr-assistant')} 
              className="btn-modern btn-primary-modern"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <motion.div 
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-cyan-500/30 mb-8 backdrop-blur-xl"
            >
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                AI-Powered Recruitment Platform
              </span>
            </motion.div>
            
            {/* Hero Title */}
            <motion.h1 
              variants={itemVariants} 
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight mb-8"
            >
              <span>Transform Your</span>
              <br />
              <span className="gradient-text">Hiring Process</span>
            </motion.h1>
            
            {/* Hero Subtitle */}
            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl leading-relaxed"
            >
              Analyze resumes with AI precision, score ATS readiness, match candidates to jobs, and coach interviews across dedicated product pages.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-20"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 212, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/hr-assistant')}
                className="btn-modern btn-primary-modern text-lg px-8 py-4 glow-effect"
              >
                <Rocket size={20} />
                Launch HR Assistant
                <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-modern px-8 py-4 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-all"
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <stat.icon size={20} className="text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Five Dedicated Pages
              <br />
              <span className="gradient-text">for the full hiring workflow</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Each feature gets its own focused surface instead of sharing one overloaded workspace.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`group glass-card p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 overflow-hidden relative transition-all bg-gradient-to-br ${feature.color}/5`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed mb-4">{feature.desc}</p>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all"
                    >
                      Learn more <ChevronRight size={18} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Tech Stack Section */}
        <section className="max-w-7xl mx-auto px-6 mt-32 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <Cpu size={28} className="text-purple-400" />
                  Next-Gen Technology Stack
                </h3>
                <p className="text-slate-300">Built with cutting-edge AI and modern web technologies</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'RAG Pipeline', desc: 'Retrieval Augmented Generation for intelligent responses' },
                { name: 'LoRA Fine-tuning', desc: 'Low-Rank Adaptation for specialized model performance' },
                { name: 'FastAPI Backend', desc: 'High-performance async API with real-time streaming' },
              ].map((tech, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <CheckCircle size={20} className="text-emerald-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">{tech.name}</h4>
                  <p className="text-sm text-slate-400">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              Ready to Transform Recruitment?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Start analyzing resumes with AI today. No credit card required.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/hr-assistant')}
              className="btn-modern btn-primary-modern text-lg px-10 py-5 glow-effect inline-flex items-center gap-2"
            >
              <Wand2 size={20} />
              Launch HR Assistant
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20 py-8 px-6 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-slate-400 text-sm">© 2026 HireAI. Powered by advanced AI.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
