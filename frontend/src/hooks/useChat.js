import toast from 'react-hot-toast';
import { getInterviewQuestions, sendChat } from '../api/chat';
import { useAppContext } from '../context/AppContext';

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function toHistory(messages) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'ai')
    .slice(-8)
    .map((message) => ({ role: message.role, content: message.content }));
}

function handleApiToast(error) {
  if (error.message?.startsWith('Network error')) {
    toast.error('Network error - is the backend running?');
  } else if (error.status >= 500) {
    toast.error('Server error - try again');
  } else {
    toast.error(error.message || 'Request failed');
  }
}

function normalizeQuestions(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((line) => line.trim()).filter(Boolean);
  return [];
}

export default function useChat() {
  const { state, dispatch } = useAppContext();

  async function submitMessage(messageText) {
    const content = messageText.trim();
    if (!content || state.isLoadingChat) return;

    const userMessage = { id: uid(), role: 'user', content, timestamp: new Date() };
    const thinkingMessage = { id: uid(), role: 'ai', content: 'thinking', timestamp: new Date(), isThinking: true };
    const nextMessages = [...state.messages, userMessage, thinkingMessage];

    dispatch({ type: 'SET_MESSAGES', payload: nextMessages });
    dispatch({ type: 'SET_LOADING_CHAT', payload: true });

    try {
      const data = await sendChat({
        message: content,
        history: toHistory(state.messages),
        resume_context: state.resumeData?.rawText || null,
      });
      dispatch({
        type: 'SET_MESSAGES',
        payload: nextMessages.map((message) =>
          message.id === thinkingMessage.id
            ? {
                id: thinkingMessage.id,
                role: 'ai',
                content: data.answer || '',
                timestamp: new Date(),
                sources: data.sources || [],
                contextUsed: data.context_used,
                type: data.type,
              }
            : message,
        ),
      });
    } catch (error) {
      handleApiToast(error);
      dispatch({ type: 'SET_MESSAGES', payload: state.messages });
    } finally {
      dispatch({ type: 'SET_LOADING_CHAT', payload: false });
    }
  }

  async function generateInterviewQuestions() {
    if (!state.resumeData.rawText) {
      toast.error('Upload a resume first');
      return;
    }
    const thinkingMessage = { id: uid(), role: 'ai', content: 'thinking', timestamp: new Date(), isThinking: true };
    const nextMessages = [...state.messages, thinkingMessage];
    dispatch({ type: 'SET_MESSAGES', payload: nextMessages });
    dispatch({ type: 'SET_LOADING_CHAT', payload: true });

    try {
      const data = await getInterviewQuestions(state.resumeData.rawText);
      const questions = normalizeQuestions(data.questions);
      dispatch({
        type: 'SET_MESSAGES',
        payload: nextMessages.map((message) =>
          message.id === thinkingMessage.id
            ? {
                id: thinkingMessage.id,
                role: 'ai',
                content: questions.map((question, index) => `${index + 1}. ${question}`).join('\n'),
                timestamp: new Date(),
                sources: [],
                type: 'interview_questions',
              }
            : message,
        ),
      });
    } catch (error) {
      handleApiToast(error);
      dispatch({ type: 'SET_MESSAGES', payload: state.messages });
    } finally {
      dispatch({ type: 'SET_LOADING_CHAT', payload: false });
    }
  }

  return { submitMessage, generateInterviewQuestions };
}
