import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, LogIn, Settings, Palette, Brain, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SettingsModal from './SettingsModal';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      className="fixed top-0 left-0 right-0 h-20 px-6 md:px-10 flex items-center justify-between z-50 bg-dark-bg/50 backdrop-blur-md border-b border-white/5"
    >
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark-bg transition-colors duration-300">
          <Brain size={24} />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          PrepGenius AI
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {location.pathname !== '/' && (
           <NavIconButton icon={<ArrowLeft size={18} />} label="Back" onClick={() => window.history.back()} />
        )}
        <NavIconButton icon={<Home size={18} />} label="Home" onClick={() => navigate('/dashboard')} />
        <NavIconButton icon={<Settings size={18} />} label="Settings" onClick={() => setIsSettingsOpen(true)} />
        
        {/* Theme Dropdown */}
        <div className="relative">
          <NavIconButton 
             icon={<Palette size={18} />} 
             label="Theme" 
             onClick={() => {
                setIsThemeDropdownOpen(!isThemeDropdownOpen);
                if (isDropdownOpen) setIsDropdownOpen(false);
             }} 
          />
          <AnimatePresence>
            {isThemeDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-48 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden py-2"
              >
                 <div className="flex flex-col gap-1 px-2">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest px-3 pb-1 pt-1">Select Theme</p>
                    {themes.map(t => (
                       <button 
                         key={t.id}
                         onClick={() => {
                            setTheme(t.id);
                            setIsThemeDropdownOpen(false);
                         }}
                         className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors text-left ${
                            theme === t.id 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                         }`}
                       >
                         {t.name}
                         {theme === t.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
                       </button>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

        {!user ? (
            <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-dark-bg font-semibold rounded-full transition-all duration-300 border border-primary/20 hover:border-transparent cursor-pointer relative interactive"
            >
                <LogIn size={18} />
                <span>Sign In</span>
            </button>
        ) : (
              <div className="relative">
                <button 
                  onClick={() => {
                     setIsDropdownOpen(!isDropdownOpen);
                     if (isThemeDropdownOpen) setIsThemeDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-2 py-1.5 pr-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors interactive"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className={`text-white/50 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-48 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
                    >
                       <div className="p-2 flex flex-col gap-1">
                          <button 
                            onClick={() => { setIsSettingsOpen(true); setIsDropdownOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left"
                          >
                            <Settings size={16} /> Account Settings
                          </button>
                          <div className="h-[1px] w-full bg-white/5 my-1"></div>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors text-left"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
        )}
      </div>

      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />}
    </motion.header>
  );
};

const NavIconButton = ({ icon, label, onClick }) => {
    return (
        <button 
            onClick={onClick}
            title={label}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-primary hover:bg-primary/10 transition-colors duration-300 relative group interactive"
        >
            {icon}
            <span className="absolute -bottom-8 px-2 py-1 bg-dark-bg border border-white/10 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
            </span>
        </button>
    )
}

export default Header;
