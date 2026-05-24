import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModernHeader from '../components/ModernHeader';
import ChatCore from '../components/chat/ChatCore';
import ResumeContextPanel from '../components/panels/ResumeContextPanel';
import { uploadResume } from '../services/api';

const AiWorkspace = () => {
  // Global Workspace State
  const [resumeData, setResumeData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    try {
      const data = await uploadResume(file);
      setResumeData({
        score: data.ats?.ats_score || 0,
        skills: data.parsed?.skills || [],
        summary: data.parsed?.summary || "No summary extracted.",
        experience_years: data.parsed?.experience_years || 0,
        rawText: data.raw_text || ""
      });
    } catch (err) {
      console.error("Upload failed", err);
      const message = err?.response?.data?.detail || err?.message || "Failed to analyze resume. Make sure backend is running.";
      alert(`Failed to analyze resume: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0e27] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl rounded-full -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/15 to-transparent blur-3xl rounded-full -z-10" />
      </div>

      {/* Header */}
      <ModernHeader />

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-8 px-6 h-screen overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex gap-6"
        >
          {/* Chat Panel - Dynamic Width */}
          <div 
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] h-full ${
              resumeData ? 'w-[65%]' : 'w-full lg:w-[70%]'
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ChatCore 
                onFileUpload={handleFileUpload} 
                isProcessingUpload={isProcessing}
                resumeContext={resumeData?.rawText || ""}
              />
            </motion.div>
          </div>

          {/* Resume Panel - Animated Appearance */}
          {resumeData && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-[35%] h-full relative z-20"
            >
              <ResumeContextPanel data={resumeData} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AiWorkspace;
