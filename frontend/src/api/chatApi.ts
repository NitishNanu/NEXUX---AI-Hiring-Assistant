import { nexusClient, API_BASE } from './nexusClient';

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

export interface StreamToken {
  token?: string;
  done?: boolean;
  error?: string;
}

export async function sendChat(payload: ChatPayload): Promise<ChatResponse> {
  const { data } = await nexusClient.post<ChatResponse>('/chat', payload);
  return data;
}

/**
 * streamChat — streams tokens from POST /api/chat/stream via fetch + ReadableStream.
 * @returns AbortController so the caller can cancel mid-stream.
 */
export function streamChat(
  payload: ChatPayload,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): AbortController {
  const controller = new AbortController();
  const authToken = localStorage.getItem('nexus_token');

  void (async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr) as StreamToken;
            if (parsed.error) { onError(parsed.error); return; }
            if (parsed.done)  { onDone(); return; }
            if (parsed.token) { onToken(parsed.token); }
          } catch { /* skip malformed */ }
        }
      }
      onDone();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      onError((err as Error).message ?? 'Stream failed');
    }
  })();

  return controller;
}

export async function getInterviewQuestions(resumeText: string): Promise<{ questions: string[] }> {
  const { data } = await nexusClient.post<{ questions: string[] }>('/interview_questions', {
    resume_text: resumeText,
  });
  return {
    questions: Array.isArray(data.questions)
      ? data.questions
      : typeof data.questions === 'string'
      ? data.questions.split('\n').map((l) => l.trim()).filter(Boolean)
      : [],
  };
}
