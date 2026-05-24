import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  atsScore: number;
  resumeStrength: number;
  interviewReadiness: number;
  missingSkills: string[];
  aiConfidence: number;
  recommendedRole: string;
}

export function InterviewHeroSection({
  atsScore,
  resumeStrength,
  interviewReadiness,
  missingSkills,
  aiConfidence,
  recommendedRole,
}: HeroSectionProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const floatingParticles = {
    initial: { opacity: 0, y: 100, x: 0 },
    animate: {
      opacity: [0, 1, 0],
      y: -100,
      x: [0, Math.random() * 30 - 15, 0],
      transition: {
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const pulseGlow = {
    animate: {
      boxShadow: [
        '0 0 20px rgba(139, 92, 246, 0.3)',
        '0 0 40px rgba(139, 92, 246, 0.6)',
        '0 0 20px rgba(139, 92, 246, 0.3)',
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const ScoreCard = ({ label, value, icon: Icon, color }: any) => (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 hover:border-white/40 transition-all hover:shadow-lg"
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 mb-2">{label}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {value}
            {label.includes('Score') || label.includes('Confidence') ? '%' : ''}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon className="w-6 h-6 text-white/80" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`h-1 w-12 mt-4 rounded-full bg-gradient-to-r ${color}`} />
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black/50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          variants={floatingParticles}
          initial="initial"
          animate="animate"
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: '100%',
          }}
        />
      ))}

      {/* Content */}
      <motion.div variants={container} initial="hidden" animate="visible" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Main headline */}
        <motion.div variants={item} className="max-w-4xl mx-auto text-center mb-16">
          <motion.div className="inline-block mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block p-3 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
            </motion.div>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-white">Your AI-Powered</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Interview Coach
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Personalized interview preparation tailored to your resume and target companies. Get real-time feedback
            from advanced AI that simulates actual interviewer behavior.
          </p>

          {/* Recommended role badge */}
          {recommendedRole && (
            <motion.div variants={item} className="mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 w-fit mx-auto">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">
                Recommended for: <span className="text-purple-300 font-semibold">{recommendedRole}</span>
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Score cards grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-16">
          <ScoreCard
            label="ATS Match Score"
            value={Math.round(atsScore)}
            icon={TrendingUp}
            color="from-green-400 to-emerald-400"
          />
          <ScoreCard
            label="Resume Strength"
            value={Math.round(resumeStrength)}
            icon={Zap}
            color="from-yellow-400 to-orange-400"
          />
          <ScoreCard
            label="Interview Readiness"
            value={Math.round(interviewReadiness)}
            icon={Brain}
            color="from-purple-400 to-pink-400"
          />
          <ScoreCard
            label="AI Confidence"
            value={Math.round(aiConfidence)}
            icon={Sparkles}
            color="from-blue-400 to-cyan-400"
          />
        </motion.div>

        {/* Missing skills section */}
        {missingSkills.length > 0 && (
          <motion.div variants={item} className="max-w-4xl mx-auto">
            <div className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Skills to Develop</h3>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.slice(0, 5).map((skill, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-sm font-medium text-red-200"
                      >
                        {skill}
                      </motion.span>
                    ))}
                    {missingSkills.length > 5 && (
                      <span className="px-3 py-1 rounded-full bg-red-500/10 text-sm font-medium text-red-200">
                        +{missingSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default InterviewHeroSection;
