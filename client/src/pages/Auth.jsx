import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import MascotCharacters from '../components/MascotCharacters';
import CustomCursor from '../components/CustomCursor';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mascotPosition, setMascotPosition] = useState('right');

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  const handleToggle = (e) => {
    e.preventDefault();
    if (isLogin) {
        // Switching to Signup: Right -> Top -> Left
        setMascotPosition('top');
        setTimeout(() => setMascotPosition('left'), 750);
    } else {
        // Switching to Login: Left -> Top -> Right
        setMascotPosition('top');
        setTimeout(() => setMascotPosition('right'), 750);
    }
    setIsLogin(!isLogin);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(loginForm.email, loginForm.password);
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(signupForm.name, signupForm.email, signupForm.password);
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-5 bg-dark-bg text-white font-sans overflow-hidden">
      
      <div className="relative w-full max-w-[800px]">
        {/* Playful Interactive Mascot - NOW OUTSIDE auth-wrapper */}
        <MascotCharacters 
            isFocused={isFocused} 
            isSuccess={isSuccess} 
            positionState={mascotPosition} 
        />

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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
    </div>

    </div>
  );
};

export default Auth;
