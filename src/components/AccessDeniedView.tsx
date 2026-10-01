import React from 'react';
import { ShieldX, LogOut, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { PREDEFINED_ADMIN_EMAIL } from '../lib/supabase';

interface AccessDeniedViewProps {
  userEmail: string;
  onLogout: () => void;
  onGoToLanding: () => void;
  onSwitchToAdmin?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  userEmail,
  onLogout,
  onGoToLanding,
  onSwitchToAdmin,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Staff Account (Restricted Clearance)
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Access Denied: Full Data Restricted to Admin
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aapne is account se login kiya hai:
          </p>
          <div className="font-mono font-bold text-xs bg-slate-100 text-slate-800 p-2 rounded border border-slate-200 break-all">
            {userEmail}
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Role-Based Security Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hospital safety protocols ke anusar, complete medicines inventory records, expiry alerts aur stock radar sirf <strong>Predefined Facility Administrator</strong> ko visible hain:
          </p>
          <div className="font-mono font-bold text-teal-950 text-xs bg-white p-2 rounded border border-amber-200 flex items-center justify-between">
            <span>Admin Email:</span>
            <span className="text-teal-700">{PREDEFINED_ADMIN_EMAIL}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Switch to Predefined Admin (View Full Data)</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out & Return to Login</span>
          </button>

          <button
            onClick={onGoToLanding}
            className="w-full py-2 px-4 text-slate-500 hover:text-slate-800 text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
