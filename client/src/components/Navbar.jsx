import React from 'react';
import { LogOut } from 'lucide-react';
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
    <nav className="flex justify-between items-center py-5 px-10 border-b-2 border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)] bg-dark-bg z-10 relative">
      <h1 className="text-2xl font-bold text-primary">PrepGenius AI</h1>
      <div className="flex items-center gap-5">
        <span className="text-sm text-white/90 font-medium">{user?.name || 'Student'}</span>
        <button className="btn-outline" onClick={handleLogout}>
          Logout <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
