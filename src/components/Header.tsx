import React from 'react';
import { 
  Pill, 
  LayoutDashboard, 
  Boxes, 
  AlertTriangle, 
  ScanLine, 
  Truck, 
  History, 
  FileText, 
  Plus, 
  Calendar,
  Download
} from 'lucide-react';
import { exportMedicinesToCSV } from '../utils/inventoryUtils';
import { Medicine } from '../types/inventory';
import { AdminUser } from '../types/auth';
import { Lock, UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAddModal: () => void;
  onOpenReportModal: () => void;
  expiredAndCriticalCount: number;
  lowStockCount: number;
  medicines: Medicine[];
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  currentUser: AdminUser | null;
  onOpenAuthModal: () => void;
  onOpenAdminDirectory: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenAddModal,
  onOpenReportModal,
  expiredAndCriticalCount,
  lowStockCount,
  medicines,
  simulatedDate,
  setSimulatedDate,
  currentUser,
  onOpenAuthModal,
  onOpenAdminDirectory,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { 
      id: 'alerts', 
      label: 'Expiry Alerts', 
      icon: AlertTriangle, 
      badge: expiredAndCriticalCount > 0 ? expiredAndCriticalCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'dispense', label: 'Dispense & Scan', icon: ScanLine },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'report', label: 'Microproject Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                PharmaTrack
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">
                Inventory & Expiry Control
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'report') {
                      onOpenReportModal();
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative ${
                    isActive
                      ? 'text-teal-900 bg-teal-50/80 border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${item.badgeColor} ml-0.5`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Date Indicator */}
          <div className="flex items-center gap-2.5">
            {/* Quick Date Simulator for testing expiry detection */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-400">Date:</span>
              <input
                type="date"
                value={simulatedDate}
                onChange={(e) => setSimulatedDate(e.target.value)}
                className="bg-transparent text-slate-800 font-mono text-xs focus:outline-hidden font-medium cursor-pointer"
                title="Simulate current system date to test expiry monitoring"
              />
            </div>

            <button
              onClick={() => exportMedicinesToCSV(medicines, new Date(simulatedDate + 'T00:00:00'))}
              title="Export complete inventory to CSV"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>

            {/* Admin Session Pill / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAdminDirectory}
                  title={`Logged in as ${currentUser.name} (${currentUser.role}). Click for Admin Registry.`}
                  className="flex items-center gap-2 p-1 pl-2 sm:px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-lg transition-colors text-slate-800 text-xs shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="font-bold text-[11px] truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-teal-800 font-semibold tracking-wide mt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign out of administrative session"
                  className="px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'report') {
                    onOpenReportModal();
                  } else {
                    setCurrentView(item.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-teal-900 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1 text-[9px] font-bold rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
