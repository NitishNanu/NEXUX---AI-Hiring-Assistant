import React from 'react';
import { useLocation } from 'react-router-dom';
import BackgroundMesh from '../components/BackgroundMesh';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="relative min-h-screen w-full bg-[#0a0e27] text-slate-100 overflow-hidden font-sans">
      {/* Animated Gradient Background */}
      {!isLanding && (
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/15 to-transparent blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/10 to-transparent blur-3xl rounded-full" />
        </div>
      )}
      
      {/* Main Content Area */}
      <main className="relative z-10 w-full min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
