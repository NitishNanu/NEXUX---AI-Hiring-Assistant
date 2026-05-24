import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { loginUser, fetchUserResume } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { useNexusStore } from '../store/nexusStore';
import NexusOrb from '../components/ui/NexusOrb';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { setAuth } = useAuthStore();
  const { setResumeData } = useNexusStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      setAuth(res.user, res.access_token);

      // Restore persisted resume from MongoDB
      const { resume } = await fetchUserResume();
      if (resume) {
        setResumeData({
          file: new File([], resume.filename),
          rawText: resume.raw_text,
          parsed: {
            skills: resume.skills,
            experience_years: resume.experience_years,
            summary: resume.summary,
            education: resume.education as any,
            projects: resume.projects as any,
          },
          ats: { score: resume.ats_score, level: resume.ats_level },
          uploadedAt: new Date(resume.uploaded_at),
        });
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-logo">
          <NexusOrb size={56} speed={0.4} />
          <div>
            <div className="auth-brand">NEXUS</div>
            <div className="auth-sub">AI Hiring Intelligence</div>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-desc">Sign in to access your resume and AI tools.</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-icon" aria-hidden />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-icon" aria-hidden />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <Loader2 size={18} className="auth-spinner" aria-label="Signing in" />
              : <><span>Sign in</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}