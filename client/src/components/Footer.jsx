import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Instagram, Github, Linkedin, Heart, Mail, X, CheckSquare, Shield, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  return (
    <footer className="w-full border-t border-white/[0.05] py-5 px-6 md:px-10 mt-auto relative z-40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand */}
        <div className="flex flex-col gap-1.5 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/[0.06] rounded flex items-center justify-center text-white/40">
              <Brain size={12} />
            </div>
            <span className="text-xs font-semibold text-white/60">PrepGenius</span>
          </div>
          <p className="text-white/25 text-[10px] leading-snug">
            Your personal study planner — organize subjects, track progress, and stay on top of every exam.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <SocialIcon href="https://www.instagram.com/vansh__miglani__007_/" icon={<Instagram size={12} />} />
            <SocialIcon href="https://github.com/VanshMiglani007" icon={<Github size={12} />} />
            <SocialIcon href="https://www.linkedin.com/in/vansh-miglani-82123a334/" icon={<Linkedin size={12} />} />
            <SocialIcon href="mailto:vanshmiglani29107@gmail.com" icon={<Mail size={12} />} />
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-5 justify-center text-[11px] font-medium">
          <button onClick={() => setIsFeaturesOpen(true)} className="text-white/30 hover:text-white/60 transition-colors duration-150">Features</button>
          <button onClick={() => navigate('/assistant')} className="text-white/30 hover:text-white/60 transition-colors duration-150">Help Center</button>
          <button onClick={() => setIsTermsOpen(true)} className="text-white/30 hover:text-white/60 transition-colors duration-150">Terms</button>
        </div>
      </div>

      <div className="w-full h-px bg-white/[0.04] my-3 max-w-6xl mx-auto" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1 text-[10px] text-white/20">
        <p>© {new Date().getFullYear()} PrepGenius. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Built by <span className="text-white/40 font-medium">Vansh</span>
        </p>
      </div>

      {/* Terms Modal */}
      <AnimatePresence>
        {isTermsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsTermsOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-white/[0.08] rounded-xl w-full max-w-2xl max-h-[75vh] overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/[0.06] flex justify-between items-center">
                <h2 className="text-base font-semibold flex items-center gap-2 text-white/80"><Shield size={16} className="text-white/40" /> Terms & Conditions</h2>
                <button onClick={() => setIsTermsOpen(false)} className="p-1.5 hover:bg-white/5 rounded-md text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-5 text-[13px] text-white/50 leading-relaxed">
                <div><h3 className="text-white/70 font-semibold mb-1.5">1. Acceptance of Terms</h3><p>By accessing PrepGenius, you agree to be bound by these Terms and Conditions.</p></div>
                <div><h3 className="text-white/70 font-semibold mb-1.5">2. Study Data</h3><p>Study plans generated are for organizational purposes only. We do not guarantee academic performance.</p></div>
                <div><h3 className="text-white/70 font-semibold mb-1.5">3. Data Privacy</h3><p>Your subjects, topics, and study patterns are encrypted and never sold to third parties.</p></div>
                <div><h3 className="text-white/70 font-semibold mb-1.5">4. Acceptable Use</h3><p>Users must not use the platform to generate plagiarized content or disrupt server infrastructure.</p></div>
                <div><h3 className="text-white/70 font-semibold mb-1.5">5. Liability</h3><p>PrepGenius shall not be liable for any indirect, incidental, or consequential damages.</p></div>
              </div>
              <div className="p-4 border-t border-white/[0.06] text-right">
                <button onClick={() => setIsTermsOpen(false)} className="px-5 py-2 bg-white/[0.06] hover:bg-white/10 text-white/60 text-sm font-medium rounded-lg transition-colors duration-150">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Modal */}
      <AnimatePresence>
        {isFeaturesOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsFeaturesOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-white/[0.08] rounded-xl w-full max-w-3xl max-h-[75vh] overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/[0.06] flex justify-between items-center">
                <h2 className="text-base font-semibold text-white/80">Platform Features</h2>
                <button onClick={() => setIsFeaturesOpen(false)} className="p-1.5 hover:bg-white/5 rounded-md text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Study Planning', desc: 'Generate optimized schedules based on difficulty and deadlines.', icon: <Brain size={20} /> },
                    { title: 'Focus Timer', desc: 'Integrated Pomodoro timer linked to your tasks.', icon: <Target size={20} /> },
                    { title: 'Analytics', desc: 'Track daily productivity and overall course progress.', icon: <CheckSquare size={20} /> },
                    { title: 'AI Assistant', desc: 'Chat to help structure subjects and answer questions.', icon: <Mail size={20} /> }
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-lg">
                      <div className="w-9 h-9 bg-white/[0.05] text-white/40 flex items-center justify-center rounded-lg mb-3">
                        {feat.icon}
                      </div>
                      <h3 className="text-sm font-semibold mb-1 text-white/80">{feat.title}</h3>
                      <p className="text-xs text-white/35">{feat.desc}</p>
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
    className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.07] transition-colors duration-150 interactive"
  >
    {icon}
  </a>
);

export default Footer;
