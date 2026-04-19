import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, BookOpen, ArrowRight, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Subjects = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
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

  useEffect(() => { fetchSubjects(); }, []);

  const handleCreateOrUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, formData);
        showNotification('Subject updated successfully!', 'success');
      } else {
        await api.post('/subjects', formData);
        showNotification('Subject created!', 'success');
      }
      closeModal();
      fetchSubjects();
    } catch (err) {
      console.error("Failed to save subject:", err);
      showNotification('Failed to save subject. Please try again.', 'error');
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
      showNotification('Subject deleted.', 'success');
    } catch (err) {
      console.error("Failed to delete subject:", err);
      showNotification('Failed to delete subject.', 'error');
    }
  };

  const getDaysUntilExam = (examDate) => {
    if (!examDate) return null;
    const diff = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

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
                <BookOpen className="text-primary" size={20} />
              </div>
              My Subjects
            </h1>
            <p className="page-description">Manage your course load and prepare for upcoming exams.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            <Plus size={16} /> Add Subject
          </button>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-shimmer h-44 rounded-2xl" />)}
          </div>
        ) : subjects.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 glass-card relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Journey Starts Here</h3>
              <p className="text-white/40 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                Add your first subject to begin. Our AI will help you break it into topics, set realistic dates, and build your study plan.
              </p>
              <div className="flex items-center justify-center gap-6 mb-8 text-xs font-semibold text-white/20">
                <div className="flex flex-col items-center gap-1.5"><Plus size={16} />Add Subject</div>
                <ArrowRight size={14} className="text-white/10" />
                <div className="flex flex-col items-center gap-1.5"><Target size={16} />Set Exam Date</div>
                <ArrowRight size={14} className="text-white/10" />
                <div className="flex flex-col items-center gap-1.5"><BookOpen size={16} />Master Topics</div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-primary px-6 py-3 text-sm"
              >
                <Plus size={16} /> Create First Subject
              </button>
            </div>
          </motion.div>
        ) : (
          /* Subject Cards */
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {subjects.map((sub) => {
                const daysLeft = getDaysUntilExam(sub.examDate);
                return (
                  <motion.div
                    key={sub._id}
                    variants={fadeUp}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-5 relative group"
                    style={{ borderLeft: `3px solid ${sub.color || 'rgb(var(--color-primary))'}` }}
                  >
                    {/* Actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                      <button onClick={() => openEditModal(sub)} className="p-1.5 text-white/30 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => confirmDelete(sub._id)} className="p-1.5 text-white/30 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 truncate pr-16">{sub.name}</h3>
                    <span className={`badge ${
                      sub.difficulty === 'hard' ? 'badge-danger' : 
                      sub.difficulty === 'medium' ? 'badge-warning' : 
                      'badge-success'
                    }`}>
                      {sub.difficulty}
                    </span>
                    
                    <div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-between items-end">
                      <div>
                        <p className="label-text">Exam Date</p>
                        <p className="text-sm font-medium text-white/70">
                          {sub.examDate 
                            ? new Date(sub.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                            : 'Not set'}
                        </p>
                        {daysLeft !== null && daysLeft > 0 && (
                          <p className={`text-[10px] mt-1 font-semibold ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-white/25'}`}>
                            {daysLeft} days left
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => navigate(`/topics?subject=${sub._id}`)} 
                        className="btn-ghost text-xs text-primary"
                      >
                        Topics <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
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
                  <h2 className="text-lg font-bold">{editingId ? 'Edit Subject' : 'Add New Subject'}</h2>
                  <button onClick={closeModal} className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
                </div>
                <form onSubmit={handleCreateOrUpdateSubject} className="space-y-4">
                  <div>
                    <label className="label-text">Subject Name</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g. Advanced Calculus" />
                  </div>
                  <div>
                    <label className="label-text">Exam Date</label>
                    <input type="date" value={formData.examDate} onChange={(e) => setFormData({...formData, examDate: e.target.value})} className="input-field [color-scheme:dark]" />
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
                      <label className="label-text">Color Label</label>
                      <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full h-[46px] bg-transparent border-none rounded-xl cursor-pointer p-0" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button type="button" onClick={closeModal} className="btn-outline flex-1 justify-center py-2.5">Cancel</button>
                    <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">{editingId ? 'Update' : 'Save Subject'}</button>
                  </div>
                </form>
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
              <h2 className="text-lg font-bold mb-1.5">Delete Subject?</h2>
              <p className="text-white/40 mb-6 text-sm">This will permanently remove the subject and all related topic progress.</p>
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

export default Subjects;
