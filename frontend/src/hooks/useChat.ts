import { useRef } from 'react';
import { useNexusStore } from '../store/nexusStore';
import { streamChat, sendChat, getInterviewQuestions } from '../api/chatApi';
import { nexusToast } from '../components/ui/NexusToast';

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function toHistory(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'ai')
    .slice(-8)
    .map((m) => ({ role: m.role as 'user' | 'ai', content: m.content }));
}

function normalizeQuestions(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((line) => line.trim()).filter(Boolean);
  return [];
}

export default function useChat() {
  const {
    messages,
    resumeData,
    isLoadingChat,
    addMessage,
    appendToMessage,
    setMessages,
    setLoadingChat,
    setStreaming,
    setStreamingMessageId,
  } = useNexusStore();

  const abortRef = useRef<AbortController | null>(null);

  async function submitMessage(messageText: string) {
    const content = messageText.trim();
    if (!content || isLoadingChat) return;

    const userMsgId = uid();
    const aiMsgId = uid();

    const userMessage = { id: userMsgId, role: 'user' as const, content, timestamp: new Date() };
    const aiMessage  = { id: aiMsgId,   role: 'ai'   as const, content: '', timestamp: new Date(), isStreaming: true };

    addMessage(userMessage);
    addMessage(aiMessage);
    setLoadingChat(true);
    setStreaming(true);
    setStreamingMessageId(aiMsgId);

    const history = toHistory(messages);
    const resumeContext = resumeData?.rawText || null;

    let streamSucceeded = false;

    try {
      await new Promise<void>((resolve, reject) => {
        abortRef.current = streamChat(
          { message: content, history, resume_context: resumeContext },
          (token) => {
            streamSucceeded = true;
            appendToMessage(aiMsgId, token);
          },
          () => resolve(),
          (err) => reject(new Error(err))
        );
      });

      // Mark message as no longer streaming
      const store = useNexusStore.getState();
      store.setMessages(
        store.messages.map((m) =>
          m.id === aiMsgId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      if (!streamSucceeded) {
        // Fallback to non-streaming
        try {
          const data = await sendChat({ message: content, history, resume_context: resumeContext });
          const store = useNexusStore.getState();
          store.setMessages(
            store.messages.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: data.answer || '', isStreaming: false, sources: data.sources, type: data.type }
                : m
            )
          );
        } catch (fallbackErr) {
          nexusToast('AI response failed — please try again', 'error');
          // Remove the empty AI message
          const store = useNexusStore.getState();
          store.setMessages(store.messages.filter((m) => m.id !== aiMsgId));
        }
      }
    } finally {
      setLoadingChat(false);
      setStreaming(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  }

  async function generateInterviewQuestions() {
    if (!resumeData?.rawText) {
      nexusToast('Upload a resume first', 'error');
      return;
    }

    const aiMsgId = uid();
    const thinkingMessage = { id: aiMsgId, role: 'ai' as const, content: 'thinking', timestamp: new Date(), isStreaming: true };
    addMessage(thinkingMessage);
    setLoadingChat(true);

    try {
      const data = await getInterviewQuestions(resumeData.rawText);
      const questions = normalizeQuestions(data.questions);
      const store = useNexusStore.getState();
      store.setMessages(
        store.messages.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content: questions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
                isStreaming: false,
                type: 'interview_questions',
              }
            : m
        )
      );
    } catch {
      nexusToast('Failed to generate interview questions', 'error');
      const store = useNexusStore.getState();
      store.setMessages(store.messages.filter((m) => m.id !== aiMsgId));
    } finally {
      setLoadingChat(false);
    }
  }

  function cancelStream() {
    abortRef.current?.abort();
  }

  return { submitMessage, generateInterviewQuestions, cancelStream };
}
