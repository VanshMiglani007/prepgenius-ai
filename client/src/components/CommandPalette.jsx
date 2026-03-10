import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, CheckSquare, Calendar, Clock, BarChart3,
  Sparkles, Settings, LogOut, Sun, Home, Plus, Play, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setTheme, themes } = useTheme();

  // Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const commands = useMemo(() => {
    const base = [
      { id: 'home', label: 'Go to Dashboard', icon: <Home size={16} />, section: 'Navigation', action: () => navigate('/dashboard') },
      { id: 'subjects', label: 'Open Subjects', icon: <BookOpen size={16} />, section: 'Navigation', action: () => navigate('/subjects') },
      { id: 'topics', label: 'Open Topics', icon: <CheckSquare size={16} />, section: 'Navigation', action: () => navigate('/topics') },
      { id: 'planner', label: 'Open Study Planner', icon: <Calendar size={16} />, section: 'Navigation', action: () => navigate('/study-plan') },
      { id: 'timer', label: 'Start Focus Timer', icon: <Clock size={16} />, section: 'Navigation', action: () => navigate('/timer') },
      { id: 'focus', label: 'Enter Focus Mode', icon: <Play size={16} />, section: 'Navigation', action: () => navigate('/focus') },
      { id: 'analytics', label: 'View Analytics', icon: <BarChart3 size={16} />, section: 'Navigation', action: () => navigate('/analytics') },
      { id: 'assistant', label: 'Open AI Assistant', icon: <Sparkles size={16} />, section: 'Navigation', action: () => navigate('/assistant') },
      { id: 'add-subject', label: 'Add Subject', icon: <Plus size={16} />, section: 'Actions', action: () => navigate('/subjects') },
      { id: 'create-topic', label: 'Create Topic', icon: <Plus size={16} />, section: 'Actions', action: () => navigate('/topics') },
      { id: 'export', label: 'Export Study Plan', icon: <FileText size={16} />, section: 'Actions', action: () => navigate('/study-plan') },
    ];

    // Add theme commands
    themes.forEach(t => {
      base.push({
        id: `theme-${t.id}`,
        label: `Switch to ${t.name}`,
        icon: <Sun size={16} />,
        section: 'Themes',
        action: () => setTheme(t.id),
      });
    });

    if (user) {
      base.push({
        id: 'logout',
        label: 'Sign Out',
        icon: <LogOut size={16} />,
        section: 'Account',
        action: () => { logout(); navigate('/login'); },
      });
    }

    return base;
  }, [navigate, user, logout, setTheme, themes]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q)
    );
  }, [query, commands]);

  // Reset selection when query changes
  useEffect(() => setSelectedIndex(0), [query]);

  const runCommand = (cmd) => {
    setIsOpen(false);
    setQuery('');
    cmd.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      runCommand(filtered[selectedIndex]);
    }
  };

  // Group by section
  const sections = useMemo(() => {
    const map = {};
    filtered.forEach(cmd => {
      if (!map[cmd.section]) map[cmd.section] = [];
      map[cmd.section].push(cmd);
    });
    return map;
  }, [filtered]);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#111118] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <Search size={16} className="text-white/25 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
              />
              <kbd className="text-[10px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-white/25 py-8">No results found</p>
              ) : (
                Object.entries(sections).map(([section, cmds]) => (
                  <div key={section}>
                    <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider px-4 pt-2 pb-1">{section}</p>
                    {cmds.map((cmd) => {
                      const idx = flatIndex++;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => runCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-100 ${
                            selectedIndex === idx
                              ? 'bg-white/[0.06] text-white'
                              : 'text-white/50 hover:text-white/70'
                          }`}
                        >
                          <span className="text-white/30">{cmd.icon}</span>
                          <span className="text-[13px] font-medium">{cmd.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-4 text-[10px] text-white/20">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
