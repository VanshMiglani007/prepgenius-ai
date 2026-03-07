import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  const handleToggle = (e) => {
    e.preventDefault();
    setIsLogin(!isLogin);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Temporary simulated login (API connection comes next)
      console.log('Logging in with:', loginForm);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Temporary simulated signup (API connection comes next)
      console.log('Signing up with:', signupForm);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-5 bg-dark-bg text-white font-sans overflow-hidden">
      
      <div className={`auth-wrapper ${!isLogin ? 'toggled' : ''}`}>
        <div className="background-shape"></div>
        <div className="secondary-shape"></div>
        
        {/* SIGN IN PANEL */}
        <div className="credentials-panel signin">
          <h2 className="slide-element">Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="field-wrapper slide-element">
              <input 
                type="email" 
                required 
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
              />
              <label>Email</label>
              <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-colors peer-focus:text-primary" size={18} />
            </div>

            <div className="field-wrapper slide-element">
              <input 
                type="password" 
                required 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
              <label>Password</label>
              <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-colors peer-focus:text-primary" size={18} />
            </div>

            {error && isLogin && <div className="error-message slide-element">{error}</div>}
            {!isLogin && !error && <div className="error-message slide-element"></div>}
            {isLogin && !error && <div className="error-message slide-element"></div>}

            <div className="field-wrapper slide-element">
              <button className="submit-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="switch-link slide-element">
              <p>Don't have an account? <br /> <a href="#" onClick={handleToggle}>Sign Up</a></p>
            </div>
          </form>
        </div>

        <div className="welcome-section signin">
          <h2 className="slide-element">WELCOME BACK!</h2>
        </div>

        {/* SIGN UP PANEL */}
        <div className="credentials-panel signup">
          <h2 className="slide-element">Register</h2>
          <form onSubmit={handleSignupSubmit}>
            <div className="field-wrapper slide-element">
              <input 
                type="text" 
                required 
                value={signupForm.name}
                onChange={e => setSignupForm({...signupForm, name: e.target.value})}
              />
              <label>Name</label>
              <UserIcon className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-colors peer-focus:text-primary" size={18} />
            </div>

            <div className="field-wrapper slide-element">
              <input 
                type="email" 
                required 
                value={signupForm.email}
                onChange={e => setSignupForm({...signupForm, email: e.target.value})}
              />
              <label>Email</label>
              <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-colors peer-focus:text-primary" size={18} />
            </div>

            <div className="field-wrapper slide-element">
              <input 
                type="password" 
                required 
                minLength="6"
                value={signupForm.password}
                onChange={e => setSignupForm({...signupForm, password: e.target.value})}
              />
              <label>Password</label>
              <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-colors peer-focus:text-primary" size={18} />
            </div>

            {error && !isLogin && <div className="error-message slide-element">{error}</div>}
            {isLogin && !error && <div className="error-message slide-element"></div>}
            {!isLogin && !error && <div className="error-message slide-element"></div>}

            <div className="field-wrapper slide-element">
              <button className="submit-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Register'}
              </button>
            </div>

            <div className="switch-link slide-element">
              <p>Already have an account? <br /> <a href="#" onClick={handleToggle}>Sign In</a></p>
            </div>
          </form>
        </div>

        <div className="welcome-section signup">
          <h2 className="slide-element">WELCOME!</h2>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-white/80">
        <p>PrepGenius AI — Intelligent Exam Preparation</p>
      </div>

    </div>
  );
};

export default Auth;
