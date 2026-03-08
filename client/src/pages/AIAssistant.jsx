import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Clock, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your PrepGenius AI Study Assistant. I can help you analyze your study plan, suggest focus topics, or answer questions about your subjects. How can I help you today?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', { message: input });
      
      const botMessage = {
        id: Date.now() + 1,
        text: res.data.data.response,
        sender: 'bot',
        timestamp: new Date(),
        context: res.data.data.context
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 flex flex-col pb-10 pt-24">
        <div className="mb-8 flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                 <Sparkles className="text-primary" size={30} />
                 AI Study Assistant
              </h1>
              <p className="text-white/50 text-sm mt-1">Context-aware advice based on your current subjects and deadlines.</p>
           </div>
           <div className="hidden md:flex gap-3">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs flex items-center gap-2">
                 <Clock size={14} className="text-primary" /> Analysis Active
              </div>
           </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-dark-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
           {/* Messages Area */}
           <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
           >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                         m.sender === 'user' ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'bg-dark-bg border-white/10'
                       }`}>
                          {m.sender === 'user' ? <User size={20} className="text-primary" /> : <Bot size={20} className="text-white/70" />}
                       </div>
                       <div className={`p-4 rounded-2xl ${
                         m.sender === 'user' 
                          ? 'bg-primary text-dark-bg font-medium rounded-tr-none' 
                          : 'bg-dark-bg border border-white/10 rounded-tl-none text-white/90'
                       }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          <span className={`text-[10px] mt-2 block ${m.sender === 'user' ? 'text-dark-bg/60' : 'text-white/30'}`}>
                             {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="flex justify-start"
                >
                   <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-dark-bg border border-white/10 flex items-center justify-center">
                         <Bot size={20} className="text-white/30" />
                      </div>
                      <div className="flex gap-1">
                         <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                         <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                         <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                   </div>
                </motion.div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-dark-bg/50 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                 <input 
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Ask about your study schedule, topic difficulty..."
                   className="flex-1 bg-dark-surface border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all text-sm pr-16"
                 />
                 <button 
                   type="submit"
                   disabled={!input.trim() || loading}
                   className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-primary text-dark-bg flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                 >
                    <Send size={20} />
                 </button>
              </form>
           </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-6 flex flex-wrap gap-3">
           <p className="text-xs text-white/30 w-full mb-1 flex items-center gap-2 uppercase tracking-widest font-bold">Suggested Topics</p>
           {[
             { icon: <Clock size={14}/>, text: "How is my progress today?" },
             { icon: <Calendar size={14}/>, text: "What should I study next?" },
             { icon: <CheckSquare size={14}/>, text: "Analyze my weak subjects" },
             { icon: <MessageSquare size={14}/>, text: "Motivate me to study" }
           ].map((chip, idx) => (
             <button 
               key={idx}
               onClick={() => setInput(chip.text)}
               className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 hover:border-primary/50 hover:text-white transition-all hover:bg-primary/5"
             >
               {chip.icon} {chip.text}
             </button>
           ))}
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
