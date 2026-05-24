import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CornerDownLeft } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { getInterviewQuestions, sendChat } from '../../api/chatApi';
import { useNexusStore } from '../../store/nexusStore';
import { nexusToast } from '../ui/NexusToast';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import ThinkingOrbs from './ThinkingOrbs';

const placeholders = ['Ask about your resume...', 'Prepare for your next interview...', 'Discover your career opportunities...'];

export default function NexusChat() {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, setLoadingChat, isLoadingChat, resumeData } = useNexusStore();

  const normalizeQuestions = (value: unknown) => {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (typeof value === 'string') return value.split('\n').map((line) => line.trim()).filter(Boolean);
    return [];
  };

  useEffect(() => {
    const timer = window.setInterval(() => setPlaceholderIndex((index) => (index + 1) % placeholders.length), 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleGenerate = (event: Event) => {
      const customEvent = event as CustomEvent<{ focus?: string }>;
      if (!resumeData?.rawText) {
        nexusToast('Please upload a resume first from Resume Parser.', 'error');
        return;
      }

      const focus = customEvent.detail?.focus?.trim();
      void (async () => {
        addMessage({ id: crypto.randomUUID(), role: 'user', content: focus ? `Generate ${focus.toLowerCase()} interview questions` : 'Generate interview questions', timestamp: new Date() });
        setLoadingChat(true);
        try {
          const response = await getInterviewQuestions(resumeData.rawText);
          const questions = normalizeQuestions(response.questions);
          const header = focus ? `${focus} interview questions` : 'Interview questions';
          addMessage({
            id: crypto.randomUUID(),
            role: 'ai',
            content: `${header}\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
            timestamp: new Date()
          });
        } catch (error) {
          nexusToast(error instanceof Error ? error.message : 'Could not generate questions', 'error');
        } finally {
          setLoadingChat(false);
        }
      })();
    };

    window.addEventListener('nexus:generate-interview-questions', handleGenerate);
    return () => window.removeEventListener('nexus:generate-interview-questions', handleGenerate);
  }, [addMessage, resumeData?.rawText, setLoadingChat]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isLoadingChat]);

  const submit = async (override?: string) => {
    const message = (override || value).trim();
    if (!message || isLoadingChat) return;
    setValue('');
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: message, timestamp: new Date() };
    addMessage(userMessage);
    setLoadingChat(true);
    try {
      const response = await sendChat({
        message,
        history: messages.slice(-8).map((item) => ({ role: item.role, content: item.content })),
        resume_context: resumeData?.rawText || null
      });
      startTransition(() => {
        addMessage({
          id: crypto.randomUUID(),
          role: 'ai',
          content: response.answer,
          timestamp: new Date(),
          sources: response.sources
        });
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Network error';
      nexusToast(text, 'error');
      addMessage({ id: crypto.randomUUID(), role: 'ai', content: `I hit a connection issue: ${text}`, timestamp: new Date() });
    } finally {
      setLoadingChat(false);
    }
  };

  const quickAction = async (label: string) => {
    if (label === 'Generate Interview Questions' && resumeData?.rawText) {
      addMessage({ id: crypto.randomUUID(), role: 'user', content: label, timestamp: new Date() });
      setLoadingChat(true);
      try {
        const response = await getInterviewQuestions(resumeData.rawText);
        const questions = normalizeQuestions(response.questions);
        addMessage({ id: crypto.randomUUID(), role: 'ai', content: `Interview questions\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`, timestamp: new Date() });
      } catch (error) {
        nexusToast(error instanceof Error ? error.message : 'Could not generate questions', 'error');
      } finally {
        setLoadingChat(false);
      }
      return;
    }
    void submit(label);
  };

  return (
    <section className="nexus-chat" id="nexus-chat">
      <div ref={listRef} className="message-list" role="log" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        </AnimatePresence>
        {isLoadingChat && <ThinkingOrbs />}
      </div>
      <div className="chat-composer-wrap">
        <QuickActions onAction={quickAction} />
        <div className="chat-composer">
          <textarea
            value={value}
            rows={1}
            placeholder={placeholders[placeholderIndex]}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void submit();
            }}
            aria-label="Message NEXUS"
          />
          <button className="send-button" disabled={!value.trim() || isLoadingChat} onClick={() => void submit()} aria-label="Send message">
            <ArrowUpRight size={20} />
          </button>
          <motion.span className="send-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CornerDownLeft size={12} /> Ctrl+Enter
          </motion.span>
        </div>
      </div>
    </section>
  );
}
