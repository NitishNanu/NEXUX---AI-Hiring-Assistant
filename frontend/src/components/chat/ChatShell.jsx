import { useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import useChat from '../../hooks/useChat';
import { useAppContext } from '../../context/AppContext';
import GlassCard from '../ui/GlassCard';
import Spinner from '../ui/Spinner';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';

export default function ChatShell() {
  const { state } = useAppContext();
  const { submitMessage, generateInterviewQuestions } = useChat();
  const [value, setValue] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages]);

  function send() {
    const next = value.trim();
    if (!next) return;
    setValue('');
    submitMessage(next);
  }

  function handleKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      send();
    }
  }

  return (
    <GlassCard className="grid h-full grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="border-b border-surface-border px-4 py-3">
        <p className="text-sm font-medium text-white">Recruiting Copilot</p>
        <p className="text-xs text-white/42">Context-aware answers, resume coaching, interview prep.</p>
      </div>

      <div ref={listRef} role="log" aria-live="polite" className="space-y-5 overflow-y-auto px-4 py-5">
        {state.messages.length === 0 && (
          <div className="mx-auto mt-12 max-w-xs text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border border-brand-indigo/35 bg-brand-indigo/15 shadow-[0_0_20px_rgba(99,102,241,0.35)]" />
            <p className="text-sm font-medium text-white">Ready when you are.</p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Upload a resume, then ask about fit, interview prep, missing skills, or role strategy.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t border-surface-border p-3">
        <QuickActions
          disabled={state.isLoadingChat}
          onQuestions={generateInterviewQuestions}
          onPrompt={(prompt) => {
            setValue('');
            submitMessage(prompt);
          }}
        />
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-surface-border bg-white/[0.04] p-2 backdrop-blur">
          <textarea
            aria-label="Chat message input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask anything about your resume, interview prep, roles..."
            className="max-h-28 min-h-10 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35"
          />
          <button
            type="button"
            aria-label="Send message"
            disabled={state.isLoadingChat || !value.trim()}
            onClick={send}
            className="self-end rounded-md bg-brand-indigo p-3 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition hover:-translate-y-0.5 hover:bg-brand-indigo-dim disabled:opacity-45"
          >
            {state.isLoadingChat ? <Spinner className="h-4 w-4" /> : <SendHorizontal className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
