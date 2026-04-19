import React, { useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, Play, AlertCircle, Sparkles, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarView from '../components/CalendarView';

const StudyPlan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ hoursPerDay: 4, startDate: new Date().toISOString().split('T')[0] });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const generatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/study-plan/generate', formData);
      if (res.data.success) {
        setPlan(res.data.data);
      } else {
        setError(res.data.message || 'Failed to generate plan.');
      }
    } catch (err) {
      console.error(err);
      setError('Error communicating with the planner. Ensure you have active Subjects and Topics first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <main className="page-content !max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-20">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="page-title text-2xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="text-primary" size={20} />
                </div>
                Study Planner
              </h1>
              <p className="page-description mt-1.5">AI analyzes your exam urgency and topic difficulty to build the optimal schedule.</p>
            </motion.div>

            {/* Generator Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5 border-primary/20 glow-primary"
            >
              <form onSubmit={generatePlan} className="space-y-5">
                <div>
                  <label className="label-text">Hours Per Day</label>
                  <div className="flex items-center gap-3">
                    <Clock className="text-primary/50 flex-shrink-0" size={18} />
                    <input 
                      type="number" min="1" max="16" step="0.5"
                      value={formData.hoursPerDay}
                      onChange={(e) => setFormData({...formData, hoursPerDay: Number(e.target.value)})}
                      className="input-field !text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Start Date</label>
                  <input 
                    type="date" value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input-field [color-scheme:dark]"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles size={16} /> Generate Plan</>
                  )}
                </button>
              </form>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-xl flex gap-2 text-xs text-red-300">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </motion.div>
            
            {/* Quick Stats */}
            {plan && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 text-center">
                  <p className="label-text text-primary">Total Days</p>
                  <h3 className="text-2xl font-bold tabular-nums">{plan.totalDays}</h3>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="label-text text-primary">Total Hours</p>
                  <h3 className="text-2xl font-bold tabular-nums">{plan.totalHours}</h3>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {/* View Toggle */}
            {plan && !loading && (
              <div className="flex justify-end mb-5">
                <div className="bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] flex gap-1">
                  {[
                    { id: 'list', label: 'List', icon: <LayoutList size={14} /> },
                    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={14} /> },
                  ].map(v => (
                    <button 
                      key={v.id}
                      onClick={() => setViewMode(v.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === v.id ? 'btn-primary !py-2 !text-xs' : 'text-white/35 hover:text-white/60'
                      }`}
                    >
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!plan && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 glass-card border-dashed !border-white/[0.08]">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary">
                  <CalendarDays size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Active Plan</h2>
                <p className="max-w-sm text-white/35 text-sm leading-relaxed mb-8">
                  Set your daily availability and start date. Our AI engine will crunch your topic priorities to build the perfect study roadmap.
                </p>
                <div className="flex gap-8 text-[10px] font-semibold uppercase tracking-wider text-white/15">
                  <div className="flex flex-col items-center gap-2"><Clock size={18} /><span>Set Hours</span></div>
                  <div className="flex flex-col items-center gap-2"><Sparkles size={18} /><span>AI Analysis</span></div>
                  <div className="flex flex-col items-center gap-2"><LayoutList size={18} /><span>Roadmap</span></div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm font-semibold text-primary animate-pulse">AI is optimizing your schedule...</p>
                </div>
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton-shimmer h-20 rounded-xl" />)}
              </div>
            )}

            {/* Plan Display */}
            {!loading && plan && plan.schedule && (
              <>
                {plan.schedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 glass-card text-center">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
                      <Sparkles size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">You're All Caught Up!</h3>
                    <p className="text-white/40 max-w-sm text-sm">No remaining topics to schedule. Great work!</p>
                  </div>
                ) : viewMode === 'list' ? (
                  <motion.div 
                    initial="hidden" animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                    className="space-y-6"
                  >
                    {plan.schedule.map((day, dIdx) => {
                      const dateObj = new Date(day.date);
                      const isToday = day.date === new Date().toISOString().split('T')[0];
                      
                      return (
                        <motion.div 
                          key={dIdx} 
                          variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
                          className="relative pl-0 md:pl-28"
                        >
                          {/* Timeline connector */}
                          {dIdx < plan.schedule.length - 1 && (
                            <div className="absolute left-[11px] md:left-[119px] top-10 bottom-[-24px] w-px bg-white/[0.06] hidden md:block" />
                          )}
                          
                          {/* Date label (desktop) */}
                          <div className="absolute left-0 top-2 w-24 hidden md:block text-right">
                            <p className="text-[10px] uppercase tracking-wider text-white/30">
                              {dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                            </p>
                            <h3 className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-white/70'}`}>
                              {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </h3>
                            {isToday && <span className="badge badge-info !text-[8px] mt-1 inline-block">Today</span>}
                          </div>

                          {/* Mobile date header */}
                          <div className="md:hidden flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                            <h3 className="text-base font-bold text-primary">
                              {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h3>
                            <span className="text-xs text-white/30">{day.totalHours}h</span>
                          </div>

                          {/* Tasks */}
                          <div className="space-y-2">
                            {day.items.map((task, tIdx) => (
                              <div key={tIdx} className="glass-card p-4 flex justify-between items-center group">
                                <div>
                                  <p className="text-[10px] text-primary/70 uppercase tracking-wider font-semibold mb-0.5">
                                    {task.subjectName || 'Unassigned'}
                                  </p>
                                  <h4 className="text-sm font-bold">{task.topicName}</h4>
                                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                                    <span className={`badge ${task.difficulty === 'High' ? 'badge-danger' : task.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'} !text-[9px]`}>
                                      {task.difficulty}
                                    </span>
                                    <span className="text-white/30 flex items-center gap-1">
                                      <Clock size={10} /> {task.duration}h
                                    </span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => navigate(`/timer?topic=${task.topicId}`)}
                                  className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-white/20 hover:bg-primary hover:text-[rgb(var(--color-bg))] transition-all group-hover:scale-105"
                                >
                                  <Play size={14} className="ml-0.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CalendarView schedule={plan.schedule} />
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyPlan;
