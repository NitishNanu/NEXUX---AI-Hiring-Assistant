import { create } from 'zustand';
import type { ParsedResume } from '../api/resumeApi';
import type { AtsResult } from '../api/atsApi';

export interface NexusMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: string[];
  isStreaming?: boolean;
}

export interface ResumeData {
  file: File;
  rawText: string;
  parsed: ParsedResume;
  ats: { score: number; level: string };
  uploadedAt: Date;
}

interface NexusState {
  resumeData: ResumeData | null;
  messages: NexusMessage[];
  isLoadingChat: boolean;
  isLoadingResume: boolean;
  jdResult: AtsResult | null;
  activeTab: 'Workspace' | 'Resume Lab' | 'Interview Prep';
  setResumeData: (resumeData: ResumeData | null) => void;
  addMessage: (message: NexusMessage) => void;
  setMessages: (messages: NexusMessage[]) => void;
  setLoadingChat: (value: boolean) => void;
  setLoadingResume: (value: boolean) => void;
  setJdResult: (result: AtsResult | null) => void;
  setActiveTab: (tab: NexusState['activeTab']) => void;
}

export const useNexusStore = create<NexusState>((set) => ({
  resumeData: null,
  messages: [
    {
      id: 'welcome',
      role: 'ai',
      content:
        'Welcome to NEXUS. Upload a resume, paste a job description, or ask me to pressure-test your career story.',
      timestamp: new Date(),
      sources: []
    }
  ],
  isLoadingChat: false,
  isLoadingResume: false,
  jdResult: null,
  activeTab: 'Workspace',
  setResumeData: (resumeData) => set({ resumeData }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoadingChat: (isLoadingChat) => set({ isLoadingChat }),
  setLoadingResume: (isLoadingResume) => set({ isLoadingResume }),
  setJdResult: (jdResult) => set({ jdResult }),
  setActiveTab: (activeTab) => set({ activeTab })
}));
