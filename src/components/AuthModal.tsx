import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  UserCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Building, 
  BadgeCheck, 
  Sparkles, 
  KeyRound, 
  UserPlus, 
  LogIn 
} from 'lucide-react';
import { AdminUser, AdminRole } from '../types/auth';
import { verifyAdminCredentials, registerAdminUser, INITIAL_ADMINS } from '../utils/authUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  initialMode?: 'login' | 'register';
  messagePrompt?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  messagePrompt,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login Form state
  const [loginIdentifier, setLoginIdentifier] = useState('admin@pharmatrack.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form state
  const [regName, setRegName] = useState('');
  const [regStaffId, setRegStaffId] = useState(`PH-ADM-00${Math.floor(5 + Math.random() * 9)}`);
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<AdminRole>('Chief Pharmacist');
  const [regLicense, setRegLicense] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const res = verifyAdminCredentials(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setLoginError(res.error || 'Failed to authenticate administrator.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Full Name is required.');
      return;
    }
    if (!regStaffId.trim()) {
      setRegError('Staff ID is required.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email address is required.');
      return;
    }
    if (!regLicense.trim()) {
      setRegError('Pharmacy State License number is required for administrative accreditation.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    const res = registerAdminUser({
      name: regName.trim(),
      email: regEmail.trim(),
      staffId: regStaffId.trim(),
      role: regRole,
      licenseNumber: regLicense.trim(),
      phone: regPhone.trim(),
      password: regPassword,
    });

    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setRegError(res.error || 'Registration failed.');
    }
  };

  const handleQuickDemoFill = (admin: AdminUser) => {
    setLoginIdentifier(admin.email);
    setLoginPassword('admin123');
    setLoginError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 shadow-2xl my-6 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'login' ? 'Administrator Login' : 'Admin Registration'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Hospital Pharmacy Management & Expiry Authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message prompt if triggered by a protected action */}
        {messagePrompt && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{messagePrompt}</span>
          </div>
        )}

        {/* Tabs: Login vs Register */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Admin</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email Address or Staff ID</label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. admin@pharmatrack.com or PH-ADM-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Administrator Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Autofill */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span>Quick Demo Accounts:</span>
                <span className="text-[10px] text-teal-700 font-mono">Password: admin123</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {INITIAL_ADMINS.slice(0, 2).map((adm) => (
                  <button
                    key={adm.id}
                    type="button"
                    onClick={() => handleQuickDemoFill(adm)}
                    className="p-1.5 bg-white border border-slate-200 rounded text-left hover:bg-slate-100/70 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">{adm.name}</span>
                      <span className="text-[10px] text-slate-500">{adm.role} · {adm.staffId}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                      Use
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Authenticate as Administrator</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-medium">
                {regError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Amanda Ross"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Staff ID *</label>
                <input
                  type="text"
                  required
                  value={regStaffId}
                  onChange={(e) => setRegStaffId(e.target.value)}
                  placeholder="PH-ADM-005"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Hospital / Official Email *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="amanda.ross@hospitalpharma.org"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Administrative Role *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as AdminRole)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
                >
                  <option value="Chief Pharmacist">Chief Pharmacist</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Inventory Auditor">Inventory Auditor</option>
                  <option value="Pharmacy Supervisor">Pharmacy Supervisor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pharmacy License # *</label>
                <input
                  type="text"
                  required
                  value={regLicense}
                  onChange={(e) => setRegLicense(e.target.value)}
                  placeholder="RPH-55201-STATE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Contact Phone (Optional)</label>
              <input
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+1 (555) 789-0123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Password (min 6) *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono focus:bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-md text-teal-900 text-[11px]">
              Registering creates an accredited administrative user profile with full authority over pharmaceutical cataloging, expiry quarantine, and inventory audits.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Complete Admin Registration</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
