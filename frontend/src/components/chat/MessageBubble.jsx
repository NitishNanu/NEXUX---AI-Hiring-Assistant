import { motion } from 'framer-motion';
import CitationChip from './CitationChip';

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
          style={{ animationDelay: `${dot * 120}ms` }}
        />
      ))}
    </span>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-cyan text-[11px] font-semibold text-white">
          AI
        </div>
      )}
      <div className={`relative max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-xl ${
            isUser
              ? 'rounded-br-sm bg-brand-indigo text-white'
              : 'rounded-bl-sm border border-surface-border bg-surface-overlay text-white'
          }`}
        >
          {message.isThinking ? <ThinkingDots /> : message.content}
        </div>
        <span
          className={`pointer-events-none absolute -top-5 text-[10px] text-white/35 opacity-0 transition group-hover:opacity-100 ${
            isUser ? 'right-1' : 'left-1'
          }`}
        >
          {time}
        </span>
        {!isUser && Boolean(message.sources?.length) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((source, index) => (
              <CitationChip key={`${source}-${index}`} source={source} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
