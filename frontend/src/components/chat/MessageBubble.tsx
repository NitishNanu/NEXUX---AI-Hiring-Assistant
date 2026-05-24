import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { NexusMessage } from '../../store/nexusStore';
import NexusOrb from '../ui/NexusOrb';

export default function MessageBubble({ message }: { message: NexusMessage }) {
  const isUser = message.role === 'user';
  const contentStr = typeof message.content === 'string'
    ? message.content
    : Array.isArray(message.content)
      ? message.content.map((c) => String(c)).join('\n')
      : String(message.content ?? '');

  // If the AI message is short and single-line, keep the animated per-word treatment.
  const words = contentStr.split(/\s+/).filter(Boolean);
  const useWordAnimation = !isUser && !contentStr.includes('\n') && words.length > 0 && words.length < 60;

  return (
    <motion.article
      className={`message-row ${isUser ? 'user' : 'ai'}`}
      initial={{ opacity: 0, x: isUser ? 32 : -12, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20 }}
    >
      {!isUser && <NexusOrb size={36} speed={message.isStreaming ? 1.4 : 0.36} className="ai-avatar" />}
      <div className="message-stack">
        <div className="message-bubble">
          {isUser ? (
            contentStr
          ) : (
            useWordAnimation ? (
              words.map((word, index) => (
                <motion.span key={`${word}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.008 }}>
                  {word}{' '}
                </motion.span>
              ))
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>{contentStr}</div>
            )
          )}
          <time>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
        </div>
        {!!message.sources?.length && (
          <div className="citation-row">
            {message.sources.map((source, index) => (
              <motion.a key={`${source}-${index}`} href={source} target="_blank" rel="noreferrer" className="citation-chip" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>
                <ExternalLink size={12} /> {source}
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
