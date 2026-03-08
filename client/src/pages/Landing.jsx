import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Target, ArrowRight, Layers, Calendar, CheckSquare, BarChart3 } from 'lucide-react';
import AIBackground from '../components/AIBackground';
import AICore from '../components/AICore';
import BorderAnimation from '../components/BorderAnimation';

const Landing = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans overflow-hidden flex flex-col relative active-selection-none select-none">
      {/* Distant Parallax Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Global Header handles navigation now */}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-5 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 max-w-7xl mx-auto w-full py-10">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-left max-w-2xl px-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Sparkles size={16} />
              <span className="text-sm font-semibold tracking-wide uppercase tracking-widest text-[10px]">Neural Study Architecture</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AI-Driven <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Exam Evolution</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed">
              Experience the future of productivity. Our orbiting AI engine connects your subjects, topics, and sessions into a high-performance study network.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-dark-bg font-bold rounded-full overflow-hidden text-lg transition-transform shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              Activate Planner
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 flex justify-center items-center"
          >
            <AICore isActivating={false} />
          </motion.div>
        </div>

          {/* Features Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-24 max-w-7xl px-5 w-full text-left relative"
        >
          <FeatureCard 
            icon={<Target size={24} />} 
            title="Smart Organization" 
            desc="Break down complex subjects into manageable topics and track your completion progress visually."
          />
          <FeatureCard 
            icon={<Brain size={24} />} 
            title="Algorithm Scheduling" 
            desc="Our AI considers your exam dates and difficulty levels to build the optimal daily revision plan."
          />
          <FeatureCard 
            icon={<Sparkles size={24} />} 
            title="Productivity Analytics" 
            desc="Measure your focus hours and calculate your live Productivity Score to stay motivated."
          />
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => {
  const [rotate, setRotate] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setRotate({ x: -x * 10, y: y * 10 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <BorderAnimation>
      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ 
            rotateX: rotate.x, 
            rotateY: rotate.y,
            y: [0, -5, 0]
        }}
        transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="p-8 rounded-2xl h-full flex flex-col cursor-none interactive bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md"
      >
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 shadow-[0_0_20px_rgba(0,212,255,0.1)]">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-white/60 leading-relaxed">{desc}</p>
        
        {/* Subtle inner glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-primary rounded-2xl pointer-events-none" />
      </motion.div>
    </BorderAnimation>
  );
};

export default Landing;

