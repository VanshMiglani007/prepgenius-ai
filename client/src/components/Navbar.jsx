import React from 'react';
import { LogOut } from 'lucide-react';

const Navbar = ({ userName }) => {
  return (
    <nav className="flex justify-between items-center py-5 px-10 border-b-2 border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)] bg-dark-bg z-10 relative">
      <h1 className="text-2xl font-bold text-primary">PrepGenius AI</h1>
      <div className="flex items-center gap-5">
        <span className="text-sm text-white/90 font-medium">{userName || 'Student'}</span>
        <button className="btn-outline">
          Logout <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
