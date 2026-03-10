import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, CheckSquare, Search, Edit2, BookOpen, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';

const Topics = () => {
  const navigate = useNavigate();
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
    name: '', 
    subjectId: initialSubject, 
    estimatedHours: 2, 
    difficulty: 'medium',
    priority: 'Medium'
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
      
      // Auto-select first subject if creating a topic and none is selected
      if (!formData.subjectId && subjectsRes.data.data.subjects?.length > 0) {
        setFormData(prev => ({ ...prev, subjectId: subjectsRes.data.data.subjects[0]._id }));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [initialSubject]);

  const handleCreateOrUpdateTopic = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/topics/${editingId}`, formData);
      } else {
        await api.post('/topics', formData);
      }
      closeModal();
      fetchData(); // refresh
    } catch (err) {
      console.error("Failed to save topic:", err);
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

  const confirmDelete = (id) => {
    setTopicToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    try {
      await api.delete(`/topics/${topicToDelete}`);
      setTopics(topics.filter(t => t._id !== topicToDelete));
      setIsDeleteModalOpen(false);
      setTopicToDelete(null);
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  };

  const toggleCompletion = async (id, currentStatus) => {
    try {
      // Toggle string boolean status ('completed' vs 'not_started') 
      // Assumption based on standard completed statuses, adjusting local state instantly
      const updatedStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
      
      // Optimistic UI update
      setTopics(topics.map(t => 
        t._id === id ? { ...t, completionStatus: updatedStatus } : t
      ));
      
      await api.put(`/topics/${id}`, { completionStatus: updatedStatus });
      fetchData(); // Sync backend effects like spaced repetition trigger
    } catch (err) {
       console.error("Failed to update status:", err);
       fetchData(); // Revert on fail
    }
  };

  const filteredTopics = filterSubject 
    ? topics.filter(t => t.subjectId === filterSubject || (t.subjectId && t.subjectId._id === filterSubject))
    : topics;

  // Group topics by subject
  const topicsBySubject = filteredTopics.reduce((acc, topic) => {
    const subjectName = topic.subjectId?.name || 'Unassigned';
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(topic);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full relative pt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <CheckSquare className="text-primary" size={32} />
              Study Topics
            </h1>
            <p className="text-white/60">Break down your subjects into masterable chunks.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Filter Dropdown */}
            <select 
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-dark-surface border border-white/20 rounded-full px-4 py-3 text-sm text-white outline-none focus:border-primary transition-colors hover:cursor-pointer flex-1 md:flex-none"
            >
              <option className="bg-white text-black" value="">All Subjects</option>
              {subjects.map(s => (
                <option className="bg-white text-black" key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-dark-bg px-6 py-3 rounded-full font-semibold transition-all border border-primary/50 whitespace-nowrap"
            >
              <Plus size={20} />
              Add Topic
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <SkeletonLoader type="list-item" count={8} />
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-20 bg-dark-surface/50 border border-white/10 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_20px_rgba(0,212,255,0.1)]">
                <CheckSquare size={40} />
              </div>
              {subjects.length === 0 ? (
                <>
                  <h3 className="text-3xl font-bold mb-3">No Subjects Found</h3>
                  <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
                    You need at least one subject before you can start breaking down your study material into masterable topics.
                  </p>
                  <button onClick={() => navigate('/subjects')} className="btn-outline inline-flex gap-2">
                    <BookOpen size={16} /> Go to Subjects
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-bold mb-3">Master Your Material</h3>
                  <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
                    Break down your "{subjects.find(s => s._id === filterSubject)?.name || 'subjects'}" into masterable chunks. Assign est. hours and track your master level.
                  </p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10 text-sm font-medium">
                    <div className="flex items-center gap-2 text-white/40"><Search size={16} /> Define Topic</div>
                    <ArrowRight size={16} className="text-white/20 hidden md:block" />
                    <div className="flex items-center gap-2 text-white/40"><CheckCircle size={16} /> Track Mastery</div>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-dark-bg font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,212,255,0.3)]">
                    <Plus size={20} />
                    Add First Topic
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(topicsBySubject).map(subjectName => (
               <div key={subjectName}>
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary border-b border-white/10 pb-2">
                   {subjectName} 
                   <span className="text-xs bg-primary/10 px-3 py-1 rounded-full">{topicsBySubject[subjectName].length}</span>
                 </h2>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                   <AnimatePresence>
                     {topicsBySubject[subjectName].map((topic, idx) => (
                       <motion.div
                         key={topic._id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, height: 0 }}
                         transition={{ duration: 0.2, delay: idx * 0.05 }}
                         className={`bg-dark-surface border border-white/10 rounded-xl p-5 flex items-center justify-between group hover:border-primary/50 transition-colors ${topic.completionStatus === 'completed' ? 'opacity-50' : ''}`}
                       >
                         <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleCompletion(topic._id, topic.completionStatus)} 
                              className={`transition-colors ${topic.completionStatus === 'completed' ? 'text-green-400' : 'text-white/30 hover:text-primary'}`}
                            >
                              {topic.completionStatus === 'completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </button>
                            <div className="flex-1 w-full min-w-0">
                               <div className="flex items-center gap-2">
                                 <h4 className={`font-semibold text-lg truncate ${topic.completionStatus === 'completed' ? 'line-through text-white/50' : ''}`}>
                                   {topic.name}
                                 </h4>
                                 {topic.priority === 'High' && <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold whitespace-nowrap">High Priority</span>}
                               </div>
                               <div className="flex gap-3 text-xs mt-1 mb-2">
                                  <span className="text-white/40 flex items-center gap-1"><Search size={12}/> {topic.estimatedHours} hrs est.</span>
                                  <span className={`
                                    ${topic.difficulty === 'hard' ? 'text-red-400' : 
                                      topic.difficulty === 'medium' ? 'text-yellow-400' : 
                                      'text-green-400'} font-medium uppercase
                                  `}>{topic.difficulty}</span>
                               </div>
                               {/* Progress Bar */}
                               <div className="w-full h-1.5 bg-dark-bg rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="h-full bg-primary transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, ((topic.completedHours || 0) / topic.estimatedHours) * 100)}%` }}
                                  ></div>
                               </div>
                               <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-mono">
                                 {Math.round((topic.completedHours || 0)*10)/10} / {topic.estimatedHours} hrs
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(topic)} className="p-2 text-white/50 hover:text-white transition-colors">
                               <Edit2 size={18} />
                            </button>
                            <button onClick={() => confirmDelete(topic._id)} className="p-2 text-white/50 hover:text-red-400 transition-colors">
                               <Trash2 size={18} />
                            </button>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
               </div>
            ))}
          </div>
        )}

      </main>

      {/* Create Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a2e] border-2 border-primary shadow-[0_0_25px_rgba(0,212,255,0.2)] rounded-2xl w-full max-w-md overflow-hidden"
          >
            <div className="h-2 w-full bg-gradient-to-r from-primary to-indigo-500"></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-white">{editingId ? 'Edit Topic' : 'Add New Topic'}</h2>
              {subjects.length === 0 ? (
                <div className="text-center py-6">
                   <p className="text-red-400 mb-4">You need to create a Subject first.</p>
                   <button onClick={() => navigate('/subjects')} className="btn-outline inline-flex w-full justify-center">Go to Subjects</button>
                </div>
              ) : (
                <form onSubmit={handleCreateOrUpdateTopic} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Topic Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                      placeholder="e.g. Limits and Continuity"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Assign to Subject</label>
                    <select 
                      required
                      value={formData.subjectId}
                      onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                      className="w-full bg-[#20203a] border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors hover:cursor-pointer"
                    >
                      {subjects.map(s => <option className="bg-white text-black" key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Priority Level</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-[#20203a] border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors hover:cursor-pointer mb-5"
                    >
                      <option className="bg-white text-black" value="Low">Low Priority</option>
                      <option className="bg-white text-black" value="Medium">Medium Priority</option>
                      <option className="bg-white text-black" value="High">High Priority</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Difficulty</label>
                      <select 
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full bg-[#20203a] border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors hover:cursor-pointer"
                      >
                        <option className="bg-white text-black" value="easy">Low</option>
                        <option className="bg-white text-black" value="medium">Medium</option>
                        <option className="bg-white text-black" value="hard">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Est. Hours</label>
                      <input 
                        type="number" 
                        min="0.5" step="0.5"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-3 px-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-medium">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-primary text-dark-bg font-bold hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
                      {editingId ? 'Update Topic' : 'Save Topic'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a2e] border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.1)] rounded-2xl w-full max-w-sm overflow-hidden text-center p-8 relative"
          >
             <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
               <Trash2 size={32} />
             </div>
             <h2 className="text-2xl font-bold mb-2 text-white">Delete Topic?</h2>
             <p className="text-white/60 mb-8 text-sm">This action cannot be undone and will erase all Pomodoro tracking progress.</p>
             
             <div className="flex gap-4">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-medium">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  Delete
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Topics;
