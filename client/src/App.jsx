import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Landing from './pages/Landing'; // Newly created landing demo
import Subjects from './pages/Subjects'; // New Subjects View

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-dark-bg">        
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Work-in-progress routes tied to Dashboard clicks */}
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/topics" element={<div className="flex h-screen items-center justify-center font-bold text-2xl text-primary">Topics Page Coming Soon</div>} />
          <Route path="/study-plan" element={<div className="flex h-screen items-center justify-center font-bold text-2xl text-primary">Study Planner Coming Soon</div>} />
          <Route path="/analytics" element={<div className="flex h-screen items-center justify-center font-bold text-2xl text-primary">Analytics Coming Soon</div>} />

        </Routes>
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
