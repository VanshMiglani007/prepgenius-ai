import React from 'react';
import { LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center py-5 px-10 border-b-2 border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)] bg-dark-bg z-10 w-full mb-10">
      <h1 className="text-[24px] font-bold text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>PrepGenius AI</h1>
      <div className="flex items-center gap-5">
        <button 
          onClick={() => navigate('/assistant')}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary hover:bg-primary hover:text-dark-bg transition-all"
        >
           <MessageSquare size={14} /> AI Assistant
        </button>
        <span className="text-[14px] text-white/90 font-medium hidden sm:block">{user?.name || 'Student'}</span>
        <button 
          className="bg-transparent border-2 border-primary text-primary px-5 py-2 rounded-full text-[14px] font-semibold transition-all duration-300 hover:bg-primary hover:text-dark-bg" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
