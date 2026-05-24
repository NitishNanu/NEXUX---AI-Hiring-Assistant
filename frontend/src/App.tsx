import { Suspense, useEffect } from 'react';
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

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import AtsCheckerPage from './pages/AtsCheckerPage';
import InterviewPrep from './pages/InterviewPrep';
import MockInterview from './pages/MockInterviewEnhanced';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import JobAnalyzerPage from './pages/JobAnalyzerPage';
import ResumeLab from './pages/ResumeLab';
import Settings from './pages/Settings';
import Workspace from './pages/Workspace';

import { useAuthStore } from './store/authStore';
import { useNexusStore } from './store/nexusStore';
import './index.css';

// Inner routes — live inside NexusShell, all protected
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                element={<Dashboard />} />
        <Route path="/resume-parser"   element={<ResumeLab />} />
        <Route path="/ats-checker"     element={<AtsCheckerPage />} />
        <Route path="/jd-matching"     element={<JobAnalyzerPage />} />
        <Route path="/interview-prep"  element={<InterviewPrep />} />
        <Route path="/mock-interview"  element={<MockInterview />} />
        <Route path="/analytics"       element={<AnalyticsDashboard />} />
        <Route path="/hr-assistant"    element={<Workspace />} />
        <Route path="/settings"        element={<Settings />} />
        <Route path="/workspace"       element={<Navigate to="/hr-assistant" replace />} />
        <Route path="/resume-lab"      element={<Navigate to="/resume-parser" replace />} />
        <Route path="*"                element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

function Root() {
  const location = useLocation();
  const { logout } = useAuthStore();
  const { setResumeData } = useNexusStore();

  // Listen for 401 responses from any API call
  useEffect(() => {
    const handler = () => {
      logout();
      setResumeData(null);
    };
    window.addEventListener('nexus:unauthorized', handler);
    return () => window.removeEventListener('nexus:unauthorized', handler);
  }, [logout, setResumeData]);

  return (
    <AnimatePresence mode="wait">
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
                    <Suspense
                      fallback={
                        <div className="grid h-full place-items-center font-mono text-cyan">
                          Initializing NEXUS…
                        </div>
                      }
                    >
                      <AppRoutes />
                    </Suspense>
                  </ErrorBoundary>
                </NexusShell>
              </AppProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

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