import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, CheckSquare, Edit2, BookOpen, ArrowRight, X, Clock } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Topics = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', subjectId: initialSubject, estimatedHours: 2, difficulty: 'medium', priority: 'Medium'
  });
  const [filterSubject, setFilterSubject] = useState(initialSubject);

  const fetchData = async () => {
    try {
      const [topicsRes, subjectsRes] = await Promise.all([
        api.get('/topics'),
        api.get('/subjects')
      ]);
      if (topicsRes.data.success) setTopics(topicsRes.data.data.topics || []);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.data.subjects || []);
      if (!formData.subjectId && subjectsRes.data.data.subjects?.length > 0) {
        setFormData(prev => ({ ...prev, subjectId: subjectsRes.data.data.subjects[0]._id }));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [initialSubject]);

  const handleCreateOrUpdateTopic = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/topics/${editingId}`, formData);
        showNotification('Topic updated!', 'success');
      } else {
        await api.post('/topics', formData);
        showNotification('Topic added!', 'success');
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error("Failed to save topic:", err);
      showNotification('Failed to save topic. Try again.', 'error');
    }
  };

  const openEditModal = (t) => {
    setFormData({
      name: t.name,
      subjectId: t.subjectId._id || t.subjectId,
      estimatedHours: t.estimatedHours,
      difficulty: t.difficulty,
      priority: t.priority || 'Medium'
    });
    setEditingId(t._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', subjectId: subjects.length > 0 ? subjects[0]._id : '', estimatedHours: 2, difficulty: 'medium', priority: 'Medium' });
  };

  const confirmDelete = (id) => { setTopicToDelete(id); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    try {
      await api.delete(`/topics/${topicToDelete}`);
      setTopics(topics.filter(t => t._id !== topicToDelete));
      setIsDeleteModalOpen(false);
      setTopicToDelete(null);
      showNotification('Topic deleted.', 'success');
    } catch (err) {
      console.error("Failed to delete topic:", err);
      showNotification('Failed to delete topic.', 'error');
    }
  };

  const toggleCompletion = async (id, currentStatus) => {
    const updatedStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    setTopics(topics.map(t => t._id === id ? { ...t, completionStatus: updatedStatus } : t));
    try {
      await api.put(`/topics/${id}`, { completionStatus: updatedStatus });
      if (updatedStatus === 'completed') showNotification('✅ Topic marked as complete!', 'success');
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchData();
    }
  };

  const filteredTopics = filterSubject 
    ? topics.filter(t => t.subjectId === filterSubject || (t.subjectId && t.subjectId._id === filterSubject))
    : topics;

  const topicsBySubject = filteredTopics.reduce((acc, topic) => {
    const subjectName = topic.subjectId?.name || 'Unassigned';
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(topic);
    return acc;
  }, {});

  const completedCount = filteredTopics.filter(t => t.completionStatus === 'completed').length;

  return (
    <div className="page-container">
      <main className="page-content !max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="page-title">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckSquare className="text-primary" size={20} />
              </div>
              Study Topics
            </h1>
            <p className="page-description">
              Break down your subjects into masterable chunks.
              {filteredTopics.length > 0 && (
                <span className="ml-2 text-primary/60">{completedCount}/{filteredTopics.length} completed</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="input-field !rounded-xl !py-2.5 flex-1 md:flex-none md:w-48"
            >
              <option className="bg-[#13131f]" value="">All Subjects</option>
              {subjects.map(s => (
                <option className="bg-[#13131f]" key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap">
              <Plus size={16} /> Add Topic
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-shimmer h-20 rounded-xl" />)}
          </div>
        ) : filteredTopics.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 glass-card relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                <CheckSquare size={32} />
              </div>
              {subjects.length === 0 ? (
                <>
                  <h3 className="text-2xl font-bold mb-2">No Subjects Found</h3>
                  <p className="text-white/40 max-w-sm mx-auto mb-6 text-sm">You need at least one subject before adding topics.</p>
                  <button onClick={() => navigate('/subjects')} className="btn-outline"><BookOpen size={14} /> Go to Subjects</button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-2">Master Your Material</h3>
                  <p className="text-white/40 max-w-sm mx-auto mb-6 text-sm">Break down "{subjects.find(s => s._id === filterSubject)?.name || 'subjects'}" into focused study chunks.</p>
                  <button onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 text-sm">
                    <Plus size={16} /> Add First Topic
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* Topics grouped by subject */
          <div className="space-y-8">
            {Object.keys(topicsBySubject).map(subjectName => (
              <motion.div key={subjectName} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/[0.06]">
                  <h2 className="text-base font-bold text-primary">{subjectName}</h2>
                  <span className="badge badge-info">{topicsBySubject[subjectName].length}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {topicsBySubject[subjectName].map((topic, idx) => {
                      const pct = Math.min(100, ((topic.completedHours || 0) / (topic.estimatedHours || 1)) * 100);
                      const isComplete = topic.completionStatus === 'completed';
                      return (
                        <motion.div
                          key={topic._id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className={`glass-card p-4 flex items-center justify-between group ${isComplete ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button 
                              onClick={() => toggleCompletion(topic._id, topic.completionStatus)} 
                              className={`transition-all flex-shrink-0 ${isComplete ? 'text-emerald-400 scale-110' : 'text-white/20 hover:text-primary hover:scale-110'}`}
                            >
                              {isComplete ? <CheckCircle size={22} /> : <Circle size={22} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-semibold text-sm truncate ${isComplete ? 'line-through text-white/40' : ''}`}>
                                  {topic.name}
                                </h4>
                                {topic.priority === 'High' && <span className="badge badge-danger !text-[8px]">High</span>}
                              </div>
                              <div className="flex gap-3 text-[11px] mt-1 text-white/30">
                                <span className="flex items-center gap-1"><Clock size={10} /> {topic.estimatedHours}h est.</span>
                                <span className={`font-medium uppercase ${
                                  topic.difficulty === 'hard' ? 'text-red-400/70' : 
                                  topic.difficulty === 'medium' ? 'text-amber-400/70' : 'text-emerald-400/70'
                                }`}>{topic.difficulty}</span>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-primary/60 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                              </div>
                              <p className="text-[9px] text-white/20 mt-1 font-mono tabular-nums">
                                {Math.round((topic.completedHours || 0)*10)/10} / {topic.estimatedHours}h
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                            <button onClick={() => openEditModal(topic)} className="p-1.5 text-white/30 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => confirmDelete(topic._id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131f] border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary to-violet-500" />
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">{editingId ? 'Edit Topic' : 'Add New Topic'}</h2>
                  <button onClick={closeModal} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
                </div>
                {subjects.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-red-400 mb-4 text-sm">You need to create a Subject first.</p>
                    <button onClick={() => navigate('/subjects')} className="btn-outline w-full justify-center"><BookOpen size={14} /> Go to Subjects</button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateOrUpdateTopic} className="space-y-4">
                    <div>
                      <label className="label-text">Topic Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g. Limits and Continuity" />
                    </div>
                    <div>
                      <label className="label-text">Subject</label>
                      <select required value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} className="input-field">
                        {subjects.map(s => <option className="bg-[#13131f]" key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-text">Priority</label>
                      <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="input-field">
                        <option className="bg-[#13131f]" value="Low">Low Priority</option>
                        <option className="bg-[#13131f]" value="Medium">Medium Priority</option>
                        <option className="bg-[#13131f]" value="High">High Priority</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-text">Difficulty</label>
                        <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} className="input-field">
                          <option className="bg-[#13131f]" value="easy">Low</option>
                          <option className="bg-[#13131f]" value="medium">Medium</option>
                          <option className="bg-[#13131f]" value="hard">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="label-text">Est. Hours</label>
                        <input type="number" min="0.5" step="0.5" value={formData.estimatedHours} onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})} className="input-field" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                      <button type="button" onClick={closeModal} className="btn-outline flex-1 justify-center py-2.5">Cancel</button>
                      <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">{editingId ? 'Update' : 'Save Topic'}</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131f] border border-red-500/20 rounded-2xl w-full max-w-sm text-center p-6 shadow-2xl"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 text-red-400">
                <Trash2 size={24} />
              </div>
              <h2 className="text-lg font-bold mb-1.5">Delete Topic?</h2>
              <p className="text-white/40 mb-6 text-sm">This will erase all tracking progress for this topic.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="btn-outline flex-1 justify-center py-2.5">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors text-sm">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Topics;
