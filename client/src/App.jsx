import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import FocusMode from './pages/FocusMode';
import AIAssistant from './pages/AIAssistant';
import AdvancedCursor from './components/AdvancedCursor';
import PageTransition from './components/PageTransition';
import CommandPalette from './components/CommandPalette';
import { AnimatePresence } from 'framer-motion';
import AIBackground from './components/AIBackground';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthRoute from './components/AuthRoute';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="p-10 text-red-500 bg-black h-screen flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto w-full max-w-2xl">{this.state.error.message}</pre>
        <button onClick={() => window.location.href = '/dashboard'} className="mt-6 px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">Return to Dashboard</button>
      </div>
    );
    return this.props.children;
  }
}

function AppContent() {
  const location = useLocation();
  const isFocusMode = location.pathname === '/focus';

  return (
    <div className="min-h-screen text-white relative flex flex-col" style={{ paddingTop: isFocusMode ? 0 : '56px', backgroundColor: 'rgb(var(--color-bg))' }}>
      <AIBackground />
      <AdvancedCursor />
      <CommandPalette />
      {!isFocusMode && <Header />}
      <main className="flex-1 w-full flex flex-col relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><AuthRoute><Dashboard /></AuthRoute></PageTransition>} />
            <Route path="/subjects" element={<PageTransition><AuthRoute><Subjects /></AuthRoute></PageTransition>} />
            <Route path="/topics" element={<PageTransition><AuthRoute><Topics /></AuthRoute></PageTransition>} />
            <Route path="/study-plan" element={<PageTransition><AuthRoute><StudyPlan /></AuthRoute></PageTransition>} />
            <Route path="/timer" element={<PageTransition><AuthRoute><FocusTimer /></AuthRoute></PageTransition>} />
            <Route path="/focus" element={<AuthRoute><FocusMode /></AuthRoute>} />
            <Route path="/analytics" element={<PageTransition><AuthRoute><Analytics /></AuthRoute></PageTransition>} />
            <Route path="/assistant" element={<PageTransition><AuthRoute><AIAssistant /></AuthRoute></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isFocusMode && <Footer />}
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
