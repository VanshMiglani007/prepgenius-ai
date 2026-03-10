import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, BookOpen, ArrowRight, ArrowBigUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [formData, setFormData] = useState({ name: '', examDate: '', difficulty: 'medium', color: '#00d4ff' });

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data.success) {
        setSubjects(res.data.data.subjects || []);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateOrUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      closeModal();
      fetchSubjects();
    } catch (err) {
      console.error("Failed to save subject:", err);
    }
  };

  const openEditModal = (sub) => {
    setFormData({
       name: sub.name,
       examDate: sub.examDate ? new Date(sub.examDate).toISOString().split('T')[0] : '',
       difficulty: sub.difficulty,
       color: sub.color
    });
    setEditingId(sub._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', examDate: '', difficulty: 'medium', color: '#00d4ff' });
  };

  const confirmDelete = (id) => {
    setSubjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    try {
      await api.delete(`/subjects/${subjectToDelete}`);
      setSubjects(subjects.filter(sub => sub._id !== subjectToDelete));
      setIsDeleteModalOpen(false);
      setSubjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-white">
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full relative pt-24">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="text-primary" size={32} />
              My Subjects
            </h1>
            <p className="text-white/60">Manage your course load and prepare for upcoming exams.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-dark-bg px-6 py-3 rounded-full font-semibold transition-all border border-primary/50"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 bg-dark-surface/50 border border-white/10 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_20px_rgba(0,212,255,0.1)]">
                <BookOpen size={40} />
              </div>
              <h3 className="text-3xl font-bold mb-3">Your Journey Starts Here</h3>
              <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
                Add your first subject to begin. Our AI will help you break it into topics, set realistic exam dates, and calculate your optimal study load.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10 text-sm font-medium">
                <div className="flex items-center gap-2 text-white/40"><Plus size={16} /> Add Subject</div>
                <ArrowRight size={16} className="text-white/20 hidden md:block" />
                <div className="flex items-center gap-2 text-white/40"><Target size={16} /> Set Exam Date</div>
                <ArrowRight size={16} className="text-white/20 hidden md:block" />
                <div className="flex items-center gap-2 text-white/40"><ArrowBigUp size={16} /> Master Topics</div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)} 
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-dark-bg font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,212,255,0.3)]"
              >
                <Plus size={20} />
                Create First Subject
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {subjects.map((sub, idx) => (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="bg-dark-surface border-l-4 rounded-xl p-6 relative group transform transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderLeftColor: sub.color || '#00d4ff' }}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => openEditModal(sub)} className="p-2 text-white/50 hover:text-white bg-dark-bg rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => confirmDelete(sub._id)} className="p-2 text-white/50 hover:text-red-400 bg-dark-bg rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-1 truncate pr-16">{sub.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${sub.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : 
                          sub.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-green-500/20 text-green-400'}`}>
                        {sub.difficulty}
                     </span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Exam Date</p>
                        <p className="text-sm font-medium">
                          {sub.examDate ? new Date(sub.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                        </p>
                    </div>
                    <button onClick={() => navigate(`/topics?subject=${sub._id}`)} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                      View Topics <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* Create Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a2e] border-2 border-primary shadow-[0_0_25px_rgba(0,212,255,0.2)] rounded-2xl w-full max-w-md overflow-hidden relative"
          >
            <div className="h-2 w-full bg-gradient-to-r from-primary to-indigo-500"></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-white">{editingId ? 'Edit Subject' : 'Add New Subject'}</h2>
              <form onSubmit={handleCreateOrUpdateSubject} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Subject Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Advanced Calculus"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Exam Date</label>
                  <input 
                    type="date" 
                    value={formData.examDate}
                    onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors [color-scheme:dark]"
                  />
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
                    <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Color Label</label>
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-[50px] bg-transparent border-none rounded-lg cursor-pointer p-0"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 px-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-primary text-dark-bg font-bold hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
                    {editingId ? 'Update Subject' : 'Save Subject'}
                  </button>
                </div>
              </form>
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
             <h2 className="text-2xl font-bold mb-2 text-white">Delete Subject?</h2>
             <p className="text-white/60 mb-8 text-sm">This action cannot be undone. All topic progress tied to this subject will be permanently lost.</p>
             
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

export default Subjects;
