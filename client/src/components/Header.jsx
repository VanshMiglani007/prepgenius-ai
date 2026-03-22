import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Palette, Brain, ChevronDown, User, Settings, Bell } from 'lucide-react';
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
        className="fixed top-0 left-0 right-0 h-14 z-50 transition-shadow duration-300"
        style={{
          backgroundColor: 'rgba(var(--color-bg), 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-5 flex items-center justify-between">
          {/* ── LEFT: Logo + Nav links ── */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => navigate(user ? '/dashboard' : '/')}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: `rgb(${themes.find(t => t.id === theme)?.primary || '0 212 255'})` }}>
                <Brain size={18} />
              </div>
              <span className="text-base font-bold text-white tracking-tight">PrepGenius</span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks
                .filter(l => !l.auth || user) // hide auth-only links when logged out
                .map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${isActive(link.path)
                        ? 'text-white bg-white/10'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                      }`}
                  >
                    {link.label}
                  </button>
                ))}
            </nav>
          </div>

          {/* ── RIGHT: Notifications, Theme, Avatar ── */}
          <div className="flex items-center gap-2">
            {/* Notifications (only when logged in) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); setThemeOpen(false); }}
                  title="Notifications"
                  className="relative w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Bell size={16} />
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-64 rounded-lg border border-white/10 overflow-hidden py-2"
                      style={{ backgroundColor: 'rgba(18,18,30,0.96)', backdropFilter: 'blur(16px)' }}
                    >
                      <div className="px-4 pb-2 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                      </div>
                      <div className="px-4 py-6 text-center">
                        <p className="text-[13px] text-white/50">No new notifications</p>
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
                className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Palette size={16} />
              </button>
              <AnimatePresence>
                {themeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 overflow-hidden py-1"
                    style={{ backgroundColor: 'rgba(18,18,30,0.96)', backdropFilter: 'blur(16px)' }}
                  >
                    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 py-1">Theme</p>
                    {themes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors text-left ${theme === t.id
                            ? 'text-white bg-white/[0.07]'
                            : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                          }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: `rgb(${t.primary})` }}
                        />
                        {t.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-white/8 mx-0.5" />

            {/* Auth section */}
            {loading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/15 border-t-white/60 animate-spin" />
              </div>
            ) : !user ? (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold rounded-md transition-colors text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/10"
              >
                <LogIn size={14} />
                Sign In
              </button>
            ) : (
              /* User avatar + dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setThemeOpen(false); }}
                  className="flex items-center gap-1.5 py-1 px-1.5 pr-2.5 rounded-md hover:bg-white/[0.06] transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `rgb(${themes.find(t => t.id === theme)?.primary || '0 212 255'})` }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-[13px] font-medium text-white/70 max-w-[80px] truncate hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown size={12} className={`text-white/30 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 overflow-hidden"
                      style={{ backgroundColor: 'rgba(18,18,30,0.96)', backdropFilter: 'blur(16px)' }}
                    >
                      {/* User info */}
                      <div className="px-3.5 pt-3 pb-2 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-white/35 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <DropdownItem
                          icon={<User size={14} />}
                          label="Profile"
                          onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}
                        />
                        <DropdownItem
                          icon={<Settings size={14} />}
                          label="Account Settings"
                          onClick={() => { setSettingsOpen(true); setProfileOpen(false); }}
                        />
                      </div>

                      <div className="border-t border-white/[0.06] py-1">
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
    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors text-left ${danger
        ? 'text-red-400 hover:text-red-300 hover:bg-red-400/[0.06]'
        : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
      }`}
  >
    {icon}
    {label}
  </button>
);

export default Header;
