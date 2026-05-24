import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Loader2, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../../services/api';

const ChatCore = ({ onFileUpload, isProcessingUpload, resumeContext }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'ai', 
      content: "🚀 Welcome to your AI Command Center. I'm ready to analyze resumes, compare them against job descriptions, and extract insights. Upload a document or ask anything to begin.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const endOfMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessingChat) return;

    const newMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsProcessingChat(true);
    
    try {
      const historyPayload = messages
        .filter(m => m.id !== 1)
        .map(m => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(input, historyPayload, resumeContext, "");
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: res.answer,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: "⚠️ Error: Could not reach backend. Please ensure the server is running.",
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="flex flex-col h-full w-full glass-card overflow-hidden rounded-2xl border border-cyan-500/20 shadow-2xl">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-5 border-b border-cyan-500/20 flex items-center justify-between bg-gradient-to-r from-cyan-500/5 via-transparent to-pink-500/5"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 glow-effect"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              AI Assistant
            </h2>
            <span className="text-xs text-slate-400">Powered by Advanced RAG</span>
          </div>
        </div>
        <Sparkles size={18} className="text-cyan-400 animate-pulse" />
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth hide-scrollbar flex flex-col gap-5">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`max-w-xs lg:max-w-md px-5 py-4 font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'chat-bubble-user text-right rounded-2xl rounded-tr-sm shadow-xl' 
                    : 'chat-bubble-ai text-left rounded-2xl rounded-tl-sm'
                }`}
              >
                <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 overflow-hidden text-sm">
                  {msg.content}
                </div>
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-cyan-900/60' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            </motion.div>
          ))}
          
          {(isProcessingChat || isProcessingUpload) && (
            <motion.div
              key="loading"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex w-full justify-start"
            >
              <div className="chat-bubble-ai px-5 py-4 flex items-center gap-3 rounded-2xl rounded-tl-sm">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Loader2 size={18} className="text-cyan-400" />
                </motion.div>
                <span className="text-sm font-medium text-slate-300">
                  {isProcessingUpload ? "📄 Processing document..." : "🤔 Analyzing..."}
                </span>
              </div>
            </motion.div>
          )}
          <div ref={endOfMessagesRef} className="h-1 lg:h-4 w-full" />
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent border-t border-cyan-500/20 backdrop-blur-xl"
      >
        <form onSubmit={handleSend} className="relative flex items-center gap-3">
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
            title="Upload Document"
          >
            <Paperclip size={20} />
          </motion.button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about resumes, careers, or JDs..."
            className="flex-1 glass-input px-5 py-3 text-sm rounded-xl focus:ring-2 focus:ring-cyan-500/30 transition-all"
          />
          
          <motion.button
            type="submit"
            whileHover={input.trim() ? { scale: 1.1 } : {}}
            whileTap={input.trim() ? { scale: 0.9 } : {}}
            className={`p-3 rounded-xl ml-2 font-semibold transition-all duration-300 ${
              input.trim()
                ? 'btn-primary-modern glow-effect hover:shadow-lg' 
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
            disabled={!input.trim()}
          >
            <Send size={20} />
          </motion.button>

        </form>
      </motion.div>
    </div>
  );
};

export default ChatCore;
