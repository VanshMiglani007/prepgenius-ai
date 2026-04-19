import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Clock, Calendar, CheckSquare, MessageSquare, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

/* ── Simple markdown-ish renderer ── */
const renderMessage = (text) => {
  if (!text) return null;
  
  return text.split('\n').map((line, i) => {
    // Bold
    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Inline code
    processed = processed.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-primary">$1</code>');
    // Bullet points
    if (processed.startsWith('- ') || processed.startsWith('• ')) {
      processed = `<span class="text-primary/60 mr-1.5">•</span>${processed.slice(2)}`;
      return <p key={i} className="flex items-start gap-0 ml-2 my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />;
    }
    // Numbered lists
    const numMatch = processed.match(/^(\d+)\.\s/);
    if (numMatch) {
      processed = `<span class="text-primary/50 font-mono text-xs mr-2">${numMatch[1]}.</span>${processed.slice(numMatch[0].length)}`;
      return <p key={i} className="flex items-start gap-0 ml-2 my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />;
    }
    // Empty line
    if (!processed.trim()) return <div key={i} className="h-2" />;
    // Normal line
    return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />;
  });
};

/* ── Typing dots animation ── */
const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-white/40" />
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Copy button ── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/[0.06] text-white/20 hover:text-white/50">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStarters, setShowStarters] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const starterPrompts = [
    { icon: <Clock size={16} />, text: "How is my study progress today?", color: "text-blue-400" },
    { icon: <Calendar size={16} />, text: "What should I study next?", color: "text-violet-400" },
    { icon: <CheckSquare size={16} />, text: "Analyze my weak subjects", color: "text-amber-400" },
    { icon: <MessageSquare size={16} />, text: "Create a study strategy for me", color: "text-emerald-400" },
  ];

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowStarters(false);
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: text });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: res.data.data.response,
        sender: 'bot',
        timestamp: new Date(),
        context: res.data.data.context
      }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="page-container">
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 flex flex-col pb-6 pt-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="page-title text-2xl">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="text-primary" size={20} />
              </div>
              AI Study Assistant
            </h1>
            <p className="page-description">Personalized advice based on your subjects and progress.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-white/30 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="flex-1 glass-card !rounded-2xl overflow-hidden flex flex-col min-h-0">
          
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Welcome + Starters */}
            {showStarters && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Sparkles size={28} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold mb-1">How can I help you study?</h2>
                <p className="text-sm text-white/30 mb-8 max-w-sm">
                  I have context about your subjects, topics, and deadlines. Ask me anything about your study plan.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {starterPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      onClick={() => sendMessage(prompt.text)}
                      className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left text-sm text-white/50 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group"
                    >
                      <span className={`${prompt.color} group-hover:scale-110 transition-transform`}>{prompt.icon}</span>
                      <span className="text-xs">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message Bubbles */}
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      m.sender === 'user' 
                        ? 'bg-primary/15 border border-primary/20' 
                        : 'bg-white/[0.04] border border-white/[0.08]'
                    }`}>
                      {m.sender === 'user' 
                        ? <User size={14} className="text-primary" /> 
                        : <Bot size={14} className="text-white/50" />
                      }
                    </div>
                    
                    {/* Bubble */}
                    <div className="flex flex-col gap-1">
                      <div className={`px-4 py-3 text-sm leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-primary text-[rgb(var(--color-bg))] rounded-2xl rounded-tr-md font-medium'
                          : 'bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-md text-white/80'
                      }`}>
                        {m.sender === 'bot' ? renderMessage(m.text) : m.text}
                      </div>
                      <div className={`flex items-center gap-2 px-1 ${m.sender === 'user' ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-white/20">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {m.sender === 'bot' && <CopyButton text={m.text} />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {loading && <TypingIndicator />}
          </div>

          {/* Suggestion chips (show after first message) */}
          {!showStarters && messages.length > 0 && !loading && (
            <div className="px-4 py-2 border-t border-white/[0.04] flex gap-2 overflow-x-auto">
              {starterPrompts.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[11px] text-white/40 hover:text-white/60 hover:border-white/[0.1] transition-all whitespace-nowrap flex-shrink-0"
                >
                  {chip.icon} {chip.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-white/[0.06]">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your study plan, deadlines, strategies..."
                className="flex-1 input-field !rounded-xl !py-3 !text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl btn-primary flex-shrink-0 disabled:opacity-30 disabled:shadow-none"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
