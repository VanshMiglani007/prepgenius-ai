import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Palette, Brain, ChevronDown, Settings, Bell, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SettingsModal from './SettingsModal';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const themeRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(user ? '/dashboard' : '/');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard', auth: true },
    { label: 'Planner', path: '/study-plan', auth: true },
    { label: 'Focus', path: '/focus', auth: true },
    { label: 'Analytics', path: '/analytics', auth: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 border-b border-white/[0.04] ${scrolled ? 'bg-dark-bg/80 backdrop-blur-xl shadow-xl' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto h-full px-5 flex items-center justify-between">
          {/* ── LEFT: Logo + Nav links ── */}
          <div className="flex items-center gap-8">
            
            <div className="flex items-center gap-3">
              {/* Back Button */}
              {location.pathname !== '/' && location.pathname !== '/dashboard' && (
                <button
                  onClick={handleBack}
                  title="Go Back"
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                >
                  <ArrowLeft size={16} />
                </button>
              )}

              {/* Logo */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none group"
                onClick={() => navigate(user ? '/dashboard' : '/')}
              >
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-[rgb(var(--color-bg))] group-hover:scale-105 transition-transform duration-200 shadow-[0_0_15px_rgba(var(--color-primary),0.2)]">
                  <Brain size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[17px] font-bold text-white tracking-tight group-hover:text-primary/90 transition-colors">PrepGenius</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks
                .filter(l => !l.auth || user)
                .map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`relative px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${isActive(link.path)
                        ? 'text-white'
                        : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                      }`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-white/[0.06] pointer-events-none"
                      />
                    )}
                  </button>
                ))}
            </nav>
          </div>

          {/* ── RIGHT: Notifications, Theme, Avatar ── */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); setThemeOpen(false); }}
                  title="Notifications"
                  className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${notificationsOpen ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
                >
                  <Bell size={16} />
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/[0.08] shadow-2xl glass-card !bg-[#13131f]/95 overflow-hidden py-2"
                    >
                      <div className="px-4 pb-2 border-b border-white/[0.06] pt-2">
                        <p className="text-sm font-bold text-white">Notifications</p>
                      </div>
                      <div className="px-5 py-8 text-center flex flex-col items-center">
                        <Bell size={24} className="text-white/10 mb-2" />
                        <p className="text-[13px] font-medium text-white/40 mb-1">All caught up</p>
                        <p className="text-[11px] text-white/25">You have no new notifications.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme switcher */}
            <div className="relative" ref={themeRef}>
              <button
                title="Theme"
                onClick={() => { setThemeOpen(!themeOpen); setProfileOpen(false); }}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${themeOpen ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
              >
                <Palette size={16} />
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/[0.08] shadow-2xl glass-card !bg-[#13131f]/95 overflow-hidden py-2"
                  >
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 py-1.5 pt-2">Interface Theme</p>
                    <div className="px-2">
                      {themes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors text-left ${theme === t.id
                              ? 'text-white bg-white/[0.06]'
                              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                            }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0 shadow-inner"
                            style={{ background: `rgb(${t.primary})` }}
                          />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-5 bg-white/10 mx-1.5" />

            {/* Auth section */}
            {loading ? (
              <div className="w-9 h-9 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/15 border-t-white/60 animate-spin" />
              </div>
            ) : !user ? (
              <button
                onClick={() => navigate('/login')}
                className="btn-outline px-4 py-1.5"
              >
                <LogIn size={14} />
                Sign In
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setThemeOpen(false); }}
                  className={`flex items-center gap-2 py-1 px-1.5 pr-3 rounded-xl transition-colors ${profileOpen ? 'bg-white/[0.08]' : 'hover:bg-white/[0.06]'}`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgb(var(--color-bg))] text-xs font-bold leading-none shadow-sm bg-primary border-[1.5px] border-dark-bg">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-[13px] font-semibold text-white/80 max-w-[90px] truncate hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown size={12} className={`text-white/30 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/[0.08] shadow-2xl glass-card !bg-[#13131f]/95 overflow-hidden"
                    >
                      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                      </div>

                      <div className="p-2 space-y-0.5">
                        <DropdownItem
                          icon={<Settings size={14} />}
                          label="Account Settings"
                          onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}
                        />
                      </div>

                      <div className="border-t border-white/[0.06] p-2">
                        <DropdownItem
                          icon={<LogOut size={14} />}
                          label="Sign Out"
                          danger
                          onClick={handleLogout}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {settingsOpen && <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />}
    </>
  );
};

const DropdownItem = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors text-left ${danger
        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
      }`}
  >
    {icon}
    {label}
  </button>
);

export default Header;
