import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar, CheckCircle2, Clock, BarChart3, Target, Layers, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Floating Study Cards (Hero Visual) ─── */
const floatingItems = [
  { id: 0, label: 'Calculus', sub: '12 topics', icon: <BookOpen size={14} />, x: 12, y: 18, w: 130 },
  { id: 1, label: 'Mon – Wed', sub: '3 sessions', icon: <Calendar size={14} />, x: 68, y: 12, w: 120 },
  { id: 2, label: 'Physics', sub: '8/15 done', icon: <CheckCircle2 size={14} />, x: 78, y: 55, w: 125 },
  { id: 3, label: '2h 30m', sub: 'today', icon: <Clock size={14} />, x: 20, y: 60, w: 100 },
  { id: 4, label: 'Chemistry', sub: '5 topics', icon: <Layers size={14} />, x: 45, y: 75, w: 120 },
  { id: 5, label: '85%', sub: 'on track', icon: <BarChart3 size={14} />, x: 55, y: 25, w: 95 },
  { id: 6, label: 'Biology', sub: '3 exams', icon: <Target size={14} />, x: 30, y: 40, w: 110 },
];

const HeroVisual = () => {
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl h-[380px] mx-auto select-none">
      {/* Soft ambient gradient */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.04] transition-transform duration-[2s]"
          style={{
            left: `${mouse.x * 60}%`,
            top: `${mouse.y * 60}%`,
            background: 'white',
          }}
        />
      </div>

      {/* Floating cards */}
      {floatingItems.map((item, i) => {
        const offsetX = (mouse.x - 0.5) * (12 + i * 3);
        const offsetY = (mouse.y - 0.5) * (10 + i * 2);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.w,
              transform: `translate(${offsetX}px, ${offsetY}px)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <div className="glass-card !bg-white/[0.015] px-3 py-2.5 backdrop-blur-md group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/30 group-hover:text-white/50 transition-colors">{item.icon}</span>
                <span className="text-[12px] font-semibold text-white/70 group-hover:text-white/90 transition-colors">{item.label}</span>
              </div>
              <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors">{item.sub}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Subtle connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
        <line x1="15%" y1="30%" x2="45%" y2="50%" stroke="white" strokeWidth="0.5" />
        <line x1="55%" y1="35%" x2="75%" y2="60%" stroke="white" strokeWidth="0.5" />
        <line x1="30%" y1="50%" x2="55%" y2="30%" stroke="white" strokeWidth="0.5" />
      </svg>

      {/* Floating dots */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/[0.06]"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
            transform: `translate(${(mouse.x - 0.5) * (5 + i * 2)}px, ${(mouse.y - 0.5) * (4 + i)}px)`,
            transition: 'transform 0.8s ease-out',
          }}
        />
      ))}
    </div>
  );
};

/* ─── Feature Card with scroll animation ─── */
const FeatureShowcase = ({ icon, title, desc, preview, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card p-6 border-white/[0.04] hover:bg-white/[0.03] group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-colors flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
          <p className="text-xs text-white/40 leading-relaxed mb-4">{desc}</p>
          {/* Interactive preview */}
          <div className="rounded-xl bg-black/20 border border-white/[0.04] p-4 overflow-hidden">
            {preview}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Mini preview animations for each feature ─── */
const SchedulePreview = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const heights = [60, 85, 45, 70, 55];
  return (
    <div className="flex items-end gap-1.5 h-12">
      {days.map((d, i) => (
        <div key={d} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${heights[i]}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            className="w-full rounded bg-primary/40"
          />
          <span className="text-[8px] text-white/30">{d}</span>
        </div>
      ))}
    </div>
  );
};

const ProgressPreview = () => {
  const items = [
    { label: 'Physics', pct: 72 },
    { label: 'Calculus', pct: 45 },
    { label: 'History', pct: 91 },
  ];
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="text-[9px] text-white/30 w-10 text-right font-medium">{item.label}</span>
          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${item.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-[9px] text-white/40 font-mono w-6">{item.pct}%</span>
        </div>
      ))}
    </div>
  );
};

const TimerPreview = () => (
  <div className="flex items-center justify-center gap-4">
    <div className="relative w-11 h-11">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
        <motion.circle
          cx="18" cy="18" r="15" fill="none" stroke="rgba(var(--color-primary), 0.7)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray="94.2"
          initial={{ strokeDashoffset: 94.2 }}
          whileInView={{ strokeDashoffset: 25 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1.2 }}
        />
      </svg>
    </div>
    <div>
      <p className="text-[12px] font-mono font-bold text-white/80 tracking-wider">25:00</p>
      <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Focus</p>
    </div>
  </div>
);

const InsightsPreview = () => (
  <div className="flex items-center gap-3">
    <div className="flex gap-0.5 items-end h-10 w-full max-w-[100px]">
      {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h * 12}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
          className="flex-1 bg-white/[0.1] rounded-t-sm hover:bg-primary/50 transition-colors"
        />
      ))}
    </div>
    <div>
      <p className="text-[10px] text-emerald-400 font-semibold mb-0.5">+12%</p>
      <p className="text-[9px] text-white/30">this week</p>
    </div>
  </div>
);

/* ─── Landing Page ─── */
const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen text-white overflow-hidden flex flex-col relative page-container">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[8%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] bg-violet-500/20 rounded-full blur-[100px] opacity-10" />
      </div>

      <main className="flex-1 flex flex-col items-center px-6 relative z-10 pt-20">
        {/* ─── HERO ─── */}
        <div className="w-full max-w-5xl py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-semibold text-white/50">PrepGenius AI Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              >
                Organize <span className="text-white/40">everything.</span><br />
                Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">smarter.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-sm md:text-base text-white/40 leading-relaxed mb-8 max-w-md"
              >
                Break your subjects into manageable topics, get a personalized AI schedule, and track your progress — all in one place.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/login')}
                  className="btn-primary px-8 py-3.5 text-sm"
                >
                  {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={16} />
                </button>
                {!user && (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-ghost"
                  >
                    Learn more
                  </button>
                )}
              </motion.div>
            </div>

            {/* Right: Interactive visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>

        {/* ─── FEATURE SHOWCASE ─── */}
        <div className="w-full max-w-5xl py-20 mt-10 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold mb-3">Built for focused studying</h2>
            <p className="text-sm text-white/40">Everything you need to stay organized and ace your exams.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FeatureShowcase
              index={0} icon={<Calendar size={20} />}
              title="Smart Scheduling"
              desc="Auto-generate a daily study plan based on your exam dates and topic difficulty levels."
              preview={<SchedulePreview />}
            />
            <FeatureShowcase
              index={1} icon={<CheckCircle2 size={20} />}
              title="Progress Tracking"
              desc="See how far you've come across every subject with visual progress indicators."
              preview={<ProgressPreview />}
            />
            <FeatureShowcase
              index={2} icon={<Clock size={20} />}
              title="Focus Timer"
              desc="Built-in Pomodoro timer that links directly to your study tasks."
              preview={<TimerPreview />}
            />
            <FeatureShowcase
              index={3} icon={<BarChart3 size={20} />}
              title="Study Insights"
              desc="Track your daily productivity and find patterns in your study habits."
              preview={<InsightsPreview />}
            />
          </div>
        </div>

        {/* ─── BOTTOM CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-2xl text-center py-20"
        >
          <div className="glass-card p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Zap size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{user ? 'Continue where you left off' : 'Ready to get organized?'}</h2>
            {!user && <p className="text-sm text-white/40 mb-8 max-w-sm">Join thousands of students who are taking control of their study habits.</p>}
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="btn-primary px-10 py-3.5 text-sm w-full sm:w-auto"
            >
              {user ? 'Go to Dashboard' : 'Create your free account'} <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
