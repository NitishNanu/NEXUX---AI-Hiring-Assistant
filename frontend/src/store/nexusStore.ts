import { create } from 'zustand';
import type { ParsedResume } from '../api/resumeApi';

export interface NexusMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: string[];
  isStreaming?: boolean;
  contextUsed?: boolean;
  type?: string;
}

export interface ResumeData {
  file: File;
  rawText: string;
  parsed: ParsedResume;
  ats: { score: number; level: string };
  uploadedAt: Date;
}

export interface AtsResult {
  score?: number;
  ats_score?: number;
  level?: string;
  match_level?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  suggestions?: string[];
}

interface NexusState {
  resumeData: ResumeData | null;
  messages: NexusMessage[];
  isLoadingChat: boolean;
  isLoadingResume: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  jdResult: AtsResult | null;
  activeTab: 'Workspace' | 'Resume Lab' | 'Interview Prep';

  setResumeData: (resumeData: ResumeData | null) => void;
  addMessage: (message: NexusMessage) => void;
  setMessages: (messages: NexusMessage[]) => void;
  appendToMessage: (id: string, token: string) => void;
  setLoadingChat: (value: boolean) => void;
  setLoadingResume: (value: boolean) => void;
  setStreaming: (value: boolean) => void;
  setStreamingMessageId: (id: string | null) => void;
  setJdResult: (result: AtsResult | null) => void;
  setActiveTab: (tab: NexusState['activeTab']) => void;
  resetChat: () => void;
}

const WELCOME_MESSAGE: NexusMessage = {
  id: 'welcome',
  role: 'ai',
  content: 'Welcome to NEXUS. Upload a resume, paste a job description, or ask me to pressure-test your career story.',
  timestamp: new Date(),
  sources: [],
};

export const useNexusStore = create<NexusState>((set) => ({
  resumeData: null,
  messages: [WELCOME_MESSAGE],
  isLoadingChat: false,
  isLoadingResume: false,
  isStreaming: false,
  streamingMessageId: null,
  jdResult: null,
  activeTab: 'Workspace',

  setResumeData: (resumeData) => set({ resumeData }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  appendToMessage: (id, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m
      ),
    })),
  setLoadingChat: (isLoadingChat) => set({ isLoadingChat }),
  setLoadingResume: (isLoadingResume) => set({ isLoadingResume }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingMessageId: (streamingMessageId) => set({ streamingMessageId }),
  setJdResult: (jdResult) => set({ jdResult }),
  setActiveTab: (activeTab) => set({ activeTab }),
  resetChat: () => set({ messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }] }),
}));
