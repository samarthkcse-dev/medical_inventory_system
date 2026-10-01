import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Pill,
  ArrowRight,
  Shield,
  KeyRound,
  Check
} from 'lucide-react';
import {
  authService,
  PREDEFINED_ADMIN_EMAIL,
  PREDEFINED_ADMIN_PASSWORD,
} from '../lib/supabase';

interface AuthViewProps {
  onAuthSuccess: (email: string) => void;
  initialMode?: 'login' | 'register';
  defaultMode?: 'login' | 'register';
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  initialMode,
  defaultMode,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode || initialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const { data, error } = await authService.signIn(email.trim(), password);

      if (error) {
        setErrorMessage(error.message || 'Login failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      if (data?.user?.email) {
        onAuthSuccess(data.user.email);
      } else {
        setErrorMessage('Authentication succeeded but user email was not found.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up (New user register kar sake)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authService.signUp(
        email.trim(),
        password,
        {
          name: name.trim() || 'Hospital Staff',
          role: 'Pharmacy Staff',
        }
      );

      if (error) {
        setErrorMessage(error.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (data?.user?.email) {
        onAuthSuccess(data.user.email);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill predefined admin credentials
  const handleQuickFillAdmin = () => {
    setMode('login');
    setEmail(PREDEFINED_ADMIN_EMAIL);
    setPassword(PREDEFINED_ADMIN_PASSWORD);
    setErrorMessage(null);
    setSuccessNotice('Admin credentials filled! Click LOGIN to view full dummy hospital data.');
  };

  // 1-Click Fast Admin Sign In
  const handleOneClickAdminLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data } = await authService.signInAsDemoAdmin();
      if (data?.user?.email) {
        onAuthSuccess(data.user.email);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in as admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#6247ec] via-[#7e47ec] to-[#aa47ec] flex items-center justify-center p-4 sm:p-6 text-slate-800">
      {/* Centered Modern Card matching uploaded reference design */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/20">
        
        {/* Left Side: Gradient with decorative angled pill shapes */}
        <div className="relative bg-gradient-to-br from-[#4d2ed8] via-[#7536df] to-[#cb459c] p-8 sm:p-12 text-white flex flex-col justify-between overflow-hidden min-h-[360px] md:min-h-[520px]">
          {/* Decorative diagonal pill elements matching reference image */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Glowing circle in upper corner */}
            <div className="absolute top-16 right-4 w-44 h-44 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-pink-400/20 blur-2xl" />

            {/* Angled glowing capsules */}
            <div className="absolute bottom-2 left-[-20px] w-48 h-10 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 opacity-90 transform -rotate-45 shadow-lg" />
            <div className="absolute bottom-12 left-6 w-56 h-11 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 opacity-80 transform -rotate-45 shadow-xl" />
            <div className="absolute bottom-20 left-24 w-52 h-10 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 opacity-85 transform -rotate-45 shadow-lg" />
            <div className="absolute bottom-28 left-40 w-44 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 opacity-75 transform -rotate-45 shadow-md" />
            <div className="absolute bottom-36 left-56 w-36 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-300 opacity-60 transform -rotate-45" />
          </div>

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold tracking-wide">
              <Pill className="w-3.5 h-3.5 text-pink-200" />
              <span>PharmaTrack Enterprise</span>
            </div>
          </div>

          {/* Center Main Welcome Text */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Welcome to website
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-sm">
              Smart hospital pharmacy management & real-time expiry monitoring. Track medicine batches, manage stocks, and prevent clinical expirations.
            </p>
          </div>

          {/* Bottom subtle note */}
          <div className="relative z-10 text-[11px] text-white/60">
            Secure Healthcare Pharmacy Authentication
          </div>
        </div>

        {/* Right Side: Clean White Login / Register Form */}
        <div className="bg-white p-8 sm:p-12 flex flex-col justify-center">
          {/* Header Title */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-extrabold tracking-widest text-[#703cdb] uppercase">
              {mode === 'login' ? 'USER LOGIN' : 'CREATE ACCOUNT'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Enter your credentials to continue'
                : 'Sign up for a new pharmacy user account'}
            </p>
          </div>

          {/* Error / Success Notices */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-center text-xs font-medium">
              {errorMessage}
            </div>
          )}
          {successNotice && (
            <div className="mb-4 p-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-center text-xs font-medium">
              {successNotice}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={mode === 'login' ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {/* If Register Mode: Full Name */}
            {mode === 'register' && (
              <div className="relative flex items-center bg-[#f1effc] rounded-full px-4 py-3 border border-transparent focus-within:border-[#7b46ec] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7b46ec]/20 transition-all">
                <User className="w-4 h-4 text-[#8a5eed] mr-3 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            )}

            {/* Email Address */}
            <div className="relative flex items-center bg-[#f1effc] rounded-full px-4 py-3 border border-transparent focus-within:border-[#7b46ec] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7b46ec]/20 transition-all">
              <User className="w-4 h-4 text-[#8a5eed] mr-3 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            {/* Password */}
            <div className="relative flex items-center bg-[#f1effc] rounded-full px-4 py-3 border border-transparent focus-within:border-[#7b46ec] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7b46ec]/20 transition-all">
              <Lock className="w-4 h-4 text-[#8a5eed] mr-3 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-hidden ml-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* If Register Mode: Confirm Password */}
            {mode === 'register' && (
              <div className="relative flex items-center bg-[#f1effc] rounded-full px-4 py-3 border border-transparent focus-within:border-[#7b46ec] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7b46ec]/20 transition-all">
                <KeyRound className="w-4 h-4 text-[#8a5eed] mr-3 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            )}

            {/* Remember Me & Quick Admin Fill (matching reference image) */}
            <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#7536df] rounded cursor-pointer"
                />
                <span className="text-[11px] text-slate-500">Remember</span>
              </label>

              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="text-[11px] text-[#703cdb] font-medium hover:underline"
              >
                Admin Credentials
              </button>
            </div>

            {/* Centered Pill Button matching reference image */}
            <div className="flex justify-center pt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#9853e6] via-[#754ce8] to-[#533be6] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider py-3 px-10 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 min-w-[140px]"
              >
                {loading ? 'Please wait...' : (mode === 'login' ? 'LOGIN' : 'REGISTER')}
              </button>
            </div>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessNotice(null);
                  }}
                  className="text-[#703cdb] font-bold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessNotice(null);
                  }}
                  className="text-[#703cdb] font-bold hover:underline"
                >
                  Login here
                </button>
              </p>
            )}
          </div>

          {/* Predefined Admin 1-Click Fast Access */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Admin with dummy data:</span>
            <button
              type="button"
              onClick={handleOneClickAdminLogin}
              disabled={loading}
              className="text-[#703cdb] font-semibold hover:underline flex items-center gap-1"
            >
              <span>1-Click Admin Login →</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
