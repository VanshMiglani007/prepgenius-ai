import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowLeft, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../services/api';
import './Auth.css';
import MascotCharacters from '../components/MascotCharacters';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mascotPosition, setMascotPosition] = useState('right');

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // email | otp | reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  // ─── Google Sign-In Init ───
  const handleGoogleCredential = useCallback(async (response) => {
    setError('');
    setIsLoading(true);
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const res = await api.post('/auth/google', {
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
      });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        setIsSuccess(true);
        setTimeout(() => { window.location.href = '/dashboard'; }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });
      }
    };
    initGoogle();
    const timer = setTimeout(initGoogle, 2000);
    return () => clearTimeout(timer);
  }, [handleGoogleCredential]);

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In not configured. Add VITE_GOOGLE_CLIENT_ID to client/.env');
      return;
    }
    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is loading. Please try again.');
      return;
    }
    window.google.accounts.id.prompt();
  };

  // ─── Toggle Login/Signup ───
  const handleToggle = (e) => {
    e.preventDefault();
    if (isLogin) {
      setMascotPosition('top');
      setTimeout(() => setMascotPosition('left'), 750);
    } else {
      setMascotPosition('top');
      setTimeout(() => setMascotPosition('right'), 750);
    }
    setIsLogin(!isLogin);
    setError('');
  };

  // ─── Login ───
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

  // ─── Signup ───
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

  // ─── Forgot Password Flow ───
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError(''); setForgotMsg('');
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg('OTP sent to your email. Check your inbox.');
      setForgotStep('otp');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError(''); setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: forgotEmail, otp: otpCode });
      if (res.data.success) {
        setForgotMsg('OTP verified! Set your new password.');
        setForgotStep('reset');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError(''); setForgotMsg('');
    if (newPassword !== confirmPassword) { setForgotError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, otp: otpCode, newPassword });
      setForgotMsg('Password reset! You can now login with your new password.');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep('email');
        setForgotEmail(''); setOtpCode(''); setNewPassword(''); setConfirmPassword('');
        setForgotMsg(''); setForgotError('');
      }, 2500);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep('email');
    setForgotEmail(''); setOtpCode(''); setNewPassword(''); setConfirmPassword('');
    setForgotMsg(''); setForgotError('');
  };

  // Google button component
  const GoogleButton = () => (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-2 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-[13px] text-white/60 font-medium transition-colors duration-150 mt-3"
    >
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Sign in with Google
    </button>
  );

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-5 text-white font-sans overflow-hidden" style={{ backgroundColor: 'rgb(var(--color-bg))' }}>
      
      <div className="relative w-full max-w-[800px]">
        {/* Mascot Characters */}
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
                <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              </div>

              {error && isLogin && <div className="error-message slide-element">{error}</div>}
              {isLogin && !error && <div className="error-message slide-element"></div>}

              <div className="slide-element" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[12px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <div className="field-wrapper slide-element">
                <button className="submit-button" type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              <div className="slide-element">
                <GoogleButton />
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
                <UserIcon className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                <Mail className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
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
                <Lock className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              </div>

              {error && !isLogin && <div className="error-message slide-element">{error}</div>}
              {!isLogin && !error && <div className="error-message slide-element"></div>}

              <div className="field-wrapper slide-element">
                <button className="submit-button" type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Register'}
                </button>
              </div>

              <div className="slide-element">
                <GoogleButton />
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

      {/* ─── FORGOT PASSWORD MODAL ─── */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeForgot}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111118] border border-white/[0.08] rounded-xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  {forgotStep !== 'email' && (
                    <button
                      onClick={() => setForgotStep(forgotStep === 'reset' ? 'otp' : 'email')}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <h3 className="text-sm font-semibold text-white/80">
                    {forgotStep === 'email' && 'Forgot Password'}
                    {forgotStep === 'otp' && 'Verify OTP'}
                    {forgotStep === 'reset' && 'New Password'}
                  </h3>
                </div>
                <button onClick={closeForgot} className="text-white/25 hover:text-white/50 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                {/* Step 1: Email */}
                {forgotStep === 'email' && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <p className="text-xs text-white/30 leading-relaxed">Enter your email and we'll send you a 6-digit verification code.</p>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/[0.15] transition-colors"
                    />
                    {forgotError && <p className="text-xs text-red-400">{forgotError}</p>}
                    {forgotMsg && <p className="text-xs text-green-400">{forgotMsg}</p>}
                    <button type="submit" disabled={forgotLoading} className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg text-sm font-semibold text-white/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {forgotLoading && <Loader2 size={14} className="animate-spin" />}
                      Send OTP
                    </button>
                  </form>
                )}

                {/* Step 2: OTP */}
                {forgotStep === 'otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-xs text-white/30">Enter the 6-digit code sent to <span className="text-white/50">{forgotEmail}</span></p>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-3 text-center text-xl font-mono tracking-[0.4em] text-white placeholder-white/15 outline-none focus:border-white/[0.15] transition-colors"
                    />
                    {forgotError && <p className="text-xs text-red-400">{forgotError}</p>}
                    {forgotMsg && <p className="text-xs text-green-400">{forgotMsg}</p>}
                    <button type="submit" disabled={forgotLoading} className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg text-sm font-semibold text-white/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {forgotLoading && <Loader2 size={14} className="animate-spin" />}
                      Verify Code
                    </button>
                  </form>
                )}

                {/* Step 3: New Password */}
                {forgotStep === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-xs text-white/30">Create a new password for your account.</p>
                    <input
                      type="password"
                      required
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/[0.15] transition-colors"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/[0.15] transition-colors"
                    />
                    {forgotError && <p className="text-xs text-red-400">{forgotError}</p>}
                    {forgotMsg && <p className="text-xs text-green-400">{forgotMsg}</p>}
                    <button type="submit" disabled={forgotLoading} className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg text-sm font-semibold text-white/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {forgotLoading && <Loader2 size={14} className="animate-spin" />}
                      Reset Password
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
