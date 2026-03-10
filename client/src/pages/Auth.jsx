import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Auth = () => {
  const [mode, setMode] = useState('login'); // login | signup | forgot | otp | reset
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ─── Login ───
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Signup ───
  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      await register(signupForm.name, signupForm.email, signupForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-In ───
  const handleGoogleCredential = useCallback(async (response) => {
    clearMessages();
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
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });
      }
    };
    // Try immediately, then retry after script loads
    initGoogle();
    const timer = setTimeout(initGoogle, 1500);
    return () => clearTimeout(timer);
  }, [handleGoogleCredential]);

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is loading. Please try again.');
      return;
    }
    window.google.accounts.id.prompt();
  };

  // ─── Forgot Password ───
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setSuccess('If this email is registered, you will receive an OTP.');
      setMode('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify OTP ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: forgotEmail, otp: otpCode });
      if (res.data.success) {
        setSuccess('OTP verified! Set your new password.');
        setMode('reset');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Reset Password ───
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email: forgotEmail, otp: otpCode, newPassword });
      setSuccess('Password reset successfully! You can now login.');
      setTimeout(() => { setMode('login'); clearMessages(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-5">
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-8">
          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <h2 className="text-xl font-bold mb-1 text-center">Welcome back</h2>
              <p className="text-sm text-white/30 mb-6 text-center">Sign in to your account</p>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-white/70 font-medium transition-colors duration-150 mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-white/20 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                  type="email" label="Email" icon={<Mail size={16} />}
                  value={loginForm.email}
                  onChange={(v) => setLoginForm({ ...loginForm, email: v })}
                />
                <InputField
                  type="password" label="Password" icon={<Lock size={16} />}
                  value={loginForm.password}
                  onChange={(v) => setLoginForm({ ...loginForm, password: v })}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <SubmitButton loading={isLoading} label="Sign In" />
              </form>

              <div className="mt-4 flex justify-between text-xs">
                <button onClick={() => { setMode('forgot'); clearMessages(); }} className="text-white/30 hover:text-white/60 transition-colors">Forgot password?</button>
                <button onClick={() => { setMode('signup'); clearMessages(); }} className="text-white/30 hover:text-white/60 transition-colors">Create account</button>
              </div>
            </>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && (
            <>
              <h2 className="text-xl font-bold mb-1 text-center">Create account</h2>
              <p className="text-sm text-white/30 mb-6 text-center">Start organizing your studies</p>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-white/70 font-medium transition-colors duration-150 mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-white/20 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <InputField type="text" label="Full Name" icon={<UserIcon size={16} />} value={signupForm.name} onChange={(v) => setSignupForm({ ...signupForm, name: v })} />
                <InputField type="email" label="Email" icon={<Mail size={16} />} value={signupForm.email} onChange={(v) => setSignupForm({ ...signupForm, email: v })} />
                <InputField type="password" label="Password" icon={<Lock size={16} />} value={signupForm.password} onChange={(v) => setSignupForm({ ...signupForm, password: v })} />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <SubmitButton loading={isLoading} label="Create Account" />
              </form>

              <p className="mt-4 text-xs text-center text-white/30">
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); clearMessages(); }} className="text-white/60 hover:text-white transition-colors">Sign in</button>
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <>
              <button onClick={() => { setMode('login'); clearMessages(); }} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors mb-4">
                <ArrowLeft size={14} /> Back to login
              </button>
              <h2 className="text-xl font-bold mb-1">Forgot password?</h2>
              <p className="text-sm text-white/30 mb-6">Enter your email and we'll send you a verification code.</p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <InputField type="email" label="Email address" icon={<Mail size={16} />} value={forgotEmail} onChange={setForgotEmail} />
                {error && <p className="text-xs text-red-400">{error}</p>}
                {success && <p className="text-xs text-green-400">{success}</p>}
                <SubmitButton loading={isLoading} label="Send OTP" />
              </form>
            </>
          )}

          {/* ── VERIFY OTP ── */}
          {mode === 'otp' && (
            <>
              <button onClick={() => { setMode('forgot'); clearMessages(); }} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors mb-4">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="text-xl font-bold mb-1">Enter verification code</h2>
              <p className="text-sm text-white/30 mb-6">We sent a 6-digit code to <span className="text-white/50">{forgotEmail}</span></p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-white/15 outline-none focus:border-white/[0.15] transition-colors"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                {success && <p className="text-xs text-green-400">{success}</p>}
                <SubmitButton loading={isLoading} label="Verify Code" />
              </form>
            </>
          )}

          {/* ── RESET PASSWORD ── */}
          {mode === 'reset' && (
            <>
              <h2 className="text-xl font-bold mb-1">Set new password</h2>
              <p className="text-sm text-white/30 mb-6">Create a strong password for your account.</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <InputField type="password" label="New password" icon={<Lock size={16} />} value={newPassword} onChange={setNewPassword} />
                <InputField type="password" label="Confirm password" icon={<Lock size={16} />} value={confirmPassword} onChange={setConfirmPassword} />
                {error && <p className="text-xs text-red-400">{error}</p>}
                {success && <p className="text-xs text-green-400">{success}</p>}
                <SubmitButton loading={isLoading} label="Reset Password" />
              </form>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

// ─── Reusable Input ───
const InputField = ({ type, label, icon, value, onChange }) => (
  <div className="relative">
    <input
      type={type}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/[0.15] transition-colors duration-150"
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">{icon}</span>
  </div>
);

// ─── Reusable Button ───
const SubmitButton = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg text-sm font-semibold text-white/80 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
  >
    {loading && <Loader2 size={14} className="animate-spin" />}
    {label}
  </button>
);

export default Auth;
