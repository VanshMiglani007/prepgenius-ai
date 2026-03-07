import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Target, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans overflow-hidden flex flex-col relative">
      {/* Background Shapes similar to Auth page */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-10 relative z-10">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Brain size={28} />
          PrepGenius AI
        </h1>
        <button 
          onClick={() => navigate('/login')}
          className="btn-outline border-primary/50 hover:bg-primary/10 hover:text-primary transition-all rounded-full px-6 py-2"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-5 relative z-10 -mt-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
            <Sparkles size={16} />
            <span className="text-sm font-semibold tracking-wide">AI-Powered Study Planner</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Your Exams with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Intelligent Planning</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing what to study. PrepGenius AI automatically organizes your subjects, manages your topics, and generates an optimized daily study schedule.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-dark-bg font-bold rounded-full overflow-hidden text-lg transition-transform"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            Get Started For Free
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full text-left"
        >
          <div className="bg-dark-surface border border-primary/20 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
            <p className="text-white/60 text-sm leading-relaxed">Break down complex subjects into manageable topics and track your completion progress visually.</p>
          </div>
          <div className="bg-dark-surface border border-primary/20 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Algorithm Scheduling</h3>
            <p className="text-white/60 text-sm leading-relaxed">Our AI considers your exam dates and difficulty levels to build the optimal daily revision plan.</p>
          </div>
          <div className="bg-dark-surface border border-primary/20 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Productivity Analytics</h3>
            <p className="text-white/60 text-sm leading-relaxed">Measure your focus hours and calculate your live Productivity Score to stay motivated.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
