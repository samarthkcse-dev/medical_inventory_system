import React from 'react';
import { X, ShieldCheck, UserPlus, LogOut, Award, Mail, Phone, Calendar, Key, BadgeCheck } from 'lucide-react';
import { AdminUser } from '../types/auth';

interface AdminDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminUser | null;
  allAdmins: AdminUser[];
  onOpenRegisterNew: () => void;
  onLogout: () => void;
}

export const AdminDirectoryModal: React.FC<AdminDirectoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allAdmins,
  onOpenRegisterNew,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-2xl my-6 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hospital Administration & Staff Registry
              </h3>
              <p className="text-slate-500 text-[11px]">
                Accredited administrators authorized for pharmaceutical inventory control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Admin Profile Card */}
          {currentUser ? (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                        ACTIVE SESSION
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-teal-900 block mt-0.5">
                      {currentUser.role}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">
                      Staff ID: {currentUser.staffId} · License: {currentUser.licenseNumber}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-teal-200/60 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email:</span>
                  <span className="font-medium truncate block">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone:</span>
                  <span className="font-mono">{currentUser.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Session:</span>
                  <span className="font-mono text-slate-600">{currentUser.lastLogin}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center justify-between">
              <span>No administrator currently signed in (Read-Only Guest Mode).</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenRegisterNew();
                }}
                className="px-3 py-1 bg-amber-600 text-white rounded font-semibold text-xs"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Registered Administrators List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-teal-600" />
                <span>All Registered Administrators ({allAdmins.length})</span>
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onOpenRegisterNew();
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Admin</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
              {allAdmins.map((adm) => (
                <div key={adm.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{adm.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">[{adm.staffId}]</span>
                      {currentUser?.id === adm.id && (
                        <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {adm.role} · State License: <span className="font-mono text-slate-800">{adm.licenseNumber}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {adm.email} · Last active: {adm.lastLogin}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Accredited
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
