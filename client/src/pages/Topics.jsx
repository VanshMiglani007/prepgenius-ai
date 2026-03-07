import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, CheckSquare, Search } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Topics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    subjectId: initialSubject, 
    estimatedHours: 2, 
    difficulty: 'medium' 
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

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/topics', formData);
      setIsModalOpen(false);
      setFormData({ ...formData, name: '', difficulty: 'medium' });
      fetchData(); // refresh
    } catch (err) {
      console.error("Failed to create topic:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/topics/${id}`);
      setTopics(topics.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  };

  const toggleCompletion = async (id, currentStatus) => {
    try {
      // Toggle string boolean status ('completed' vs 'pending') 
      // Assumption based on standard completed statuses, adjusting local state instantly
      const updatedStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      
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
      <Navbar />

      <main className="flex-1 p-10 max-w-7xl mx-auto w-full relative">
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
              <option className="bg-[#1a1a2e] text-white" value="">All Subjects</option>
              {subjects.map(s => (
                <option className="bg-[#1a1a2e] text-white" key={s._id} value={s._id}>{s.name}</option>
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-20 bg-dark-surface border border-primary/20 rounded-3xl">
            <Search size={48} className="mx-auto text-primary/40 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No topics found</h3>
            <p className="text-white/50 mb-6">You haven't added any topics for your selected criteria.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-outline inline-flex">
              <Plus size={16} /> Create Topic
            </button>
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
                            <div>
                               <h4 className={`font-semibold text-lg ${topic.completionStatus === 'completed' ? 'line-through text-white/50' : ''}`}>
                                 {topic.name}
                               </h4>
                               <div className="flex gap-3 text-xs mt-1">
                                  <span className="text-white/40 flex items-center gap-1"><Search size={12}/> {topic.estimatedHours} hrs est.</span>
                                  <span className={`
                                    ${topic.difficulty === 'High' ? 'text-red-400' : 
                                      topic.difficulty === 'Medium' ? 'text-yellow-400' : 
                                      'text-green-400'} font-medium
                                  `}>{topic.difficulty}</span>
                               </div>
                            </div>
                         </div>
                         <button onClick={() => handleDelete(topic._id)} className="p-2 text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={18} />
                         </button>
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
              <h2 className="text-2xl font-bold mb-6 text-white">Add New Topic</h2>
              {subjects.length === 0 ? (
                <div className="text-center py-6">
                   <p className="text-red-400 mb-4">You need to create a Subject first.</p>
                   <button onClick={() => navigate('/subjects')} className="btn-outline inline-flex w-full justify-center">Go to Subjects</button>
                </div>
              ) : (
                <form onSubmit={handleCreateTopic} className="space-y-5">
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
                      {subjects.map(s => <option className="bg-[#1a1a2e] text-white" key={s._id} value={s._id}>{s.name}</option>)}
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
                        <option className="bg-[#1a1a2e] text-white" value="easy">Low</option>
                        <option className="bg-[#1a1a2e] text-white" value="medium">Medium</option>
                        <option className="bg-[#1a1a2e] text-white" value="hard">High</option>
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
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-medium">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-primary text-dark-bg font-bold hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
                      Save Topic
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Topics;
