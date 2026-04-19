import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Instagram, Github, Linkedin, Heart, Mail, X, CheckSquare, Shield, Zap, Target, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  return (
    <footer className="w-full border-t border-white/[0.04] py-5 px-6 md:px-10 mt-auto relative z-40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand */}
        <div className="flex flex-col gap-1.5 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/[0.05] rounded flex items-center justify-center text-white/30">
              <Brain size={11} />
            </div>
            <span className="text-[11px] font-semibold text-white/50">PrepGenius</span>
          </div>
          <p className="text-white/20 text-[10px] leading-snug">
            Your personal study planner — organize subjects, track progress, and ace every exam.
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <SocialIcon href="https://www.instagram.com/vansh__miglani__007_/" icon={<Instagram size={11} />} />
            <SocialIcon href="https://github.com/VanshMiglani007" icon={<Github size={11} />} />
            <SocialIcon href="https://www.linkedin.com/in/vansh-miglani-82123a334/" icon={<Linkedin size={11} />} />
            <SocialIcon href="mailto:vanshmiglani29107@gmail.com" icon={<Mail size={11} />} />
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-5 justify-center text-[11px] font-medium">
          <button onClick={() => setIsFeaturesOpen(true)} className="text-white/25 hover:text-white/50 transition-colors">Features</button>
          <button onClick={() => navigate('/assistant')} className="text-white/25 hover:text-white/50 transition-colors">Help</button>
          <button onClick={() => setIsTermsOpen(true)} className="text-white/25 hover:text-white/50 transition-colors">Terms</button>
        </div>
      </div>

      <div className="w-full h-px bg-white/[0.03] my-3 max-w-6xl mx-auto" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1 text-[10px] text-white/15">
        <p>© {new Date().getFullYear()} PrepGenius. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Built by <span className="text-white/30 font-medium">Vansh</span>
        </p>
      </div>

      {/* Terms Modal */}
      <AnimatePresence>
        {isTermsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsTermsOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131f] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[75vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/[0.06] flex justify-between items-center">
                <h2 className="text-sm font-bold flex items-center gap-2 text-white/80">
                  <Shield size={16} className="text-white/30" /> Terms & Privacy
                </h2>
                <button onClick={() => setIsTermsOpen(false)} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-white/50 transition-colors"><X size={14} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-5 text-[13px] text-white/40 leading-relaxed">
                {[
                  { title: '1. Acceptance of Terms', body: 'By accessing PrepGenius, you agree to be bound by these Terms and Conditions.' },
                  { title: '2. Study Data', body: 'Study plans generated are for organizational purposes only. We do not guarantee academic performance.' },
                  { title: '3. Data Privacy', body: 'Your subjects, topics, and study patterns are encrypted and never sold to third parties.' },
                  { title: '4. Acceptable Use', body: 'Users must not use the platform to generate plagiarized content or disrupt server infrastructure.' },
                  { title: '5. Liability', body: 'PrepGenius shall not be liable for any indirect, incidental, or consequential damages.' },
                ].map((s, i) => (
                  <div key={i}>
                    <h3 className="text-white/60 font-semibold mb-1">{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/[0.05] text-right">
                <button onClick={() => setIsTermsOpen(false)} className="btn-outline text-xs px-4 py-2">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Modal */}
      <AnimatePresence>
        {isFeaturesOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsFeaturesOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131f] border border-white/[0.08] rounded-2xl w-full max-w-3xl max-h-[75vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-white/[0.06] flex justify-between items-center">
                <h2 className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Zap size={16} className="text-primary" /> Platform Features
                </h2>
                <button onClick={() => setIsFeaturesOpen(false)} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/25 hover:text-white/50 transition-colors"><X size={14} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: 'AI Study Planning', desc: 'Generate optimized schedules based on difficulty and deadlines.', icon: <Brain size={18} />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                    { title: 'Focus Timer', desc: 'Integrated Pomodoro timer linked to your study tasks.', icon: <Target size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { title: 'Performance Analytics', desc: 'Track daily productivity, heatmaps, and course progress.', icon: <CheckSquare size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { title: 'AI Assistant', desc: 'Context-aware chat to plan subjects and answer questions.', icon: <Sparkles size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { title: 'Subject Management', desc: 'Organize courses with exam dates, colors, and difficulty levels.', icon: <BookOpen size={18} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                    { title: 'Smart Themes', desc: 'Multiple premium color themes to personalize your workspace.', icon: <Zap size={18} />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
                  ].map((feat, idx) => (
                    <div key={idx} className="glass-card p-4 flex items-start gap-3">
                      <div className={`w-9 h-9 ${feat.bg} ${feat.color} flex items-center justify-center rounded-xl flex-shrink-0`}>
                        {feat.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-0.5 text-white/80">{feat.title}</h3>
                        <p className="text-xs text-white/30">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

const SocialIcon = ({ icon, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-6 h-6 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/20 hover:text-white/40 hover:bg-white/[0.06] transition-all duration-150"
  >
    {icon}
  </a>
);

export default Footer;
