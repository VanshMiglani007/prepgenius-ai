import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Toaster from './components/Toaster';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Subjects from './pages/Subjects';
import Topics from './pages/Topics';
import StudyPlan from './pages/StudyPlan';
import Analytics from './pages/Analytics';
import FocusTimer from './pages/FocusTimer';
import AIAssistant from './pages/AIAssistant';
import AdvancedCursor from './components/AdvancedCursor';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import AIBackground from './components/AIBackground';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';

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

function AppContent() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-dark-bg text-white relative flex flex-col pt-20"> {/* pt-20 to offset fixed Header */}
      <AIBackground />
      <AdvancedCursor />
      <Header />
      <main className="flex-1 w-full flex flex-col relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/subjects" element={<PageTransition><Subjects /></PageTransition>} />
            <Route path="/topics" element={<PageTransition><Topics /></PageTransition>} />
            <Route path="/study-plan" element={<PageTransition><StudyPlan /></PageTransition>} />
            <Route path="/timer" element={<PageTransition><FocusTimer /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="/assistant" element={<PageTransition><AIAssistant /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
