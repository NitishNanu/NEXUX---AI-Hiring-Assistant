import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { registerUser } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import NexusOrb from '../components/ui/NexusOrb';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setAuth(res.user, res.access_token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type: string,
    placeholder: string,
    Icon: React.ElementType,
    autocomplete: string
  ) => (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <Icon size={15} className="auth-icon" aria-hidden />
        <input
          id={id}
          type={type === 'password' ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          autoComplete={autocomplete}
          value={form[id]}
          onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        />
        {type === 'password' && id === 'password' && (
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );

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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-desc">
          Your resume and results will be saved and restored every time you sign in.
        </p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {field('name',     'Full name',        'text',     'Jane Smith',           User, 'name')}
          {field('email',    'Email',            'email',    'you@example.com',      Mail, 'email')}
          {field('password', 'Password',         'password', 'At least 6 characters',Lock, 'new-password')}
          {field('confirm',  'Confirm password', 'password', 'Repeat password',      Lock, 'new-password')}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <Loader2 size={18} className="auth-spinner" aria-label="Creating account" />
              : <><span>Create account</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}