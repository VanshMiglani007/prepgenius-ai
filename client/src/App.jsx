import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Landing from './pages/Landing'; // Newly created landing demo
import Subjects from './pages/Subjects'; // New Subjects View
import Topics from './pages/Topics'; // New Topics View
import StudyPlan from './pages/StudyPlan'; // New StudyPlan View
import Analytics from './pages/Analytics'; // New Analytics View
import FocusTimer from './pages/FocusTimer'; // Pomodoro Focus Timer

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="p-10 text-red-500 bg-black h-screen flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-4">React App Crashed</h1>
        <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto w-full max-w-2xl">{this.state.error.message}</pre>
        <button onClick={() => window.location.href='/dashboard'} className="mt-6 px-4 py-2 bg-primary text-black font-bold rounded">Return to Dashboard</button>
      </div>
    );
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-dark-bg">        
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/timer" element={<FocusTimer />} />
            <Route path="/analytics" element={<Analytics />} />

          </Routes>
        </div>
      </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
