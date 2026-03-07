import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Decorative Modern Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<div className="flex h-screen items-center justify-center font-bold text-2xl text-primary-600 z-10 relative">Login Page Build-In-Progress</div>} />
          
          <Route path="/dashboard" element={<div className="flex h-screen items-center justify-center font-bold text-2xl text-primary-600 z-10 relative">Dashboard Build-In-Progress</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
