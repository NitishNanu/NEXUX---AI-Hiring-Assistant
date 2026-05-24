import { nexusClient } from './nexusClient';

export interface ChatPayload {
  message: string;
  history: Array<{ role: 'user' | 'ai'; content: string }>;
  resume_context: string | null;
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
  context_used?: boolean;
  type?: string;
}

export async function sendChat(payload: ChatPayload): Promise<ChatResponse> {
  const { data } = await nexusClient.post<ChatResponse>('/chat', payload);
  return data;
}

export async function getInterviewQuestions(resumeText: string): Promise<{ questions: string[] }> {
  const { data } = await nexusClient.post<{ questions: string[] }>('/interview_questions', {
    resume_text: resumeText
  });
  return {
    questions: Array.isArray(data.questions) ? data.questions : typeof data.questions === 'string' ? data.questions.split('\n').map((line) => line.trim()).filter(Boolean) : []
  };
}
