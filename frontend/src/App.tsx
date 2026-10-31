import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import NexusBackground from './components/background/NexusBackground';
import NexusShell from './components/layout/NexusShell';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AppProvider } from './context/AppContext';

// Eager imports for critical auth pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy-load all protected pages to keep the initial bundle small
const Dashboard          = lazy(() => import('./pages/Dashboard'));
const AtsCheckerPage     = lazy(() => import('./pages/AtsCheckerPage'));
const InterviewPrepPage  = lazy(() => import('./pages/InterviewPrepEnhanced'));
const MockInterview      = lazy(() => import('./pages/MockInterviewEnhanced'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const JobAnalyzerPage    = lazy(() => import('./pages/JobAnalyzerPage'));
const ResumeLab          = lazy(() => import('./pages/ResumeLab'));
const Settings           = lazy(() => import('./pages/Settings'));
const Workspace          = lazy(() => import('./pages/Workspace'));  // .tsx version

import { useAuthStore } from './store/authStore';
import { useNexusStore } from './store/nexusStore';
import './index.css';

// ---------------------------------------------------------------------------
// Route loading fallback
// ---------------------------------------------------------------------------

function PageLoader() {
  return (
    <div className="grid h-full min-h-screen place-items-center font-mono text-cyan-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        <span className="text-sm text-white/40">Initializing NEXUS…</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner protected routes
// ---------------------------------------------------------------------------

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"               element={<Dashboard />} />
        <Route path="/resume-parser"  element={<ResumeLab />} />
        <Route path="/ats-checker"    element={<AtsCheckerPage />} />
        <Route path="/jd-matching"    element={<JobAnalyzerPage />} />
        <Route path="/interview-prep" element={<InterviewPrepPage />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/analytics"      element={<AnalyticsDashboard />} />
        <Route path="/hr-assistant"   element={<Workspace />} />
        <Route path="/settings"       element={<Settings />} />

        {/* Legacy redirects */}
        <Route path="/workspace"  element={<Navigate to="/hr-assistant" replace />} />
        <Route path="/resume-lab" element={<Navigate to="/resume-parser" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Root — handles auth events + public vs protected routing
// ---------------------------------------------------------------------------

function Root() {
  const location = useLocation();
  const { logout } = useAuthStore();
  const { setResumeData } = useNexusStore();

  // Clear auth on any 401 from the API layer
  useEffect(() => {
    const handler = () => {
      logout();
      setResumeData(null);
    };
    window.addEventListener('nexus:unauthorized', handler);
    return () => window.removeEventListener('nexus:unauthorized', handler);
  }, [logout, setResumeData]);

  // NOTE: Removed outer AnimatePresence — the inner one inside AppRoutes handles
  // page transitions. Nesting two AnimatePresence mode="wait" caused double
  // exit/enter animations and extra re-renders on every navigation.
  return (
    <Routes location={location} key={location.pathname}>
      {/* Public */}
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected — everything else */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppProvider>
              <NexusShell>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <AppRoutes />
                  </Suspense>
                </ErrorBoundary>
              </NexusShell>
            </AppProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark min-h-screen bg-void text-glacier">
        <NexusBackground />
        <SplashScreen />
        <Root />
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}