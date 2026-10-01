import React from 'react';
import { 
  Pill, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  ScanLine, 
  History, 
  Building2, 
  Lock, 
  FileText,
  AlertTriangle,
  Award
} from 'lucide-react';
import { PREDEFINED_ADMIN_EMAIL } from '../lib/supabase';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenReportModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenReportModal }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                PharmaTrack
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Hospital Pharmacy System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Microproject Report</span>
              </button>
            )}

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 bg-linear-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
              <span>Automated Pharmaceutical Stock & Expiry Surveillance</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 text-balance leading-tight">
              Medicine Inventory and Expiry Alert Management System
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Eliminate expired medication risk, prevent critical drug shortages, and maintain regulatory compliance. A computerized inventory platform designed for pharmacies, medical stores, and healthcare clinics.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Get Started — Admin Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>View Project Specifications</span>
                </button>
              )}
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Secured with Supabase Authentication · Restricted to Authorized Admin</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Core Features Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Engineered for Patient Safety & Stock Efficiency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Replacing error-prone manual paper registers with an automated mathematical expiry engine and real-time inventory ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Automated Expiry Horizon Detection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically calculates days remaining for every pharmaceutical batch. Flags expired medicines (&lt;0d) and triggers color-coded alerts for Critical (&le;30d) and Warning (31-60d) horizons.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Stockout Prevention & Deficit Radar
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitors minimum reorder thresholds. Instantly highlights low-stock items and zero-inventory stockouts before critical patient procedures are impacted.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Safety Quarantine & Dispense Locks
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict software safeguard prevents expired batches from ever being dispensed to patients. Supports one-click containment and biomedical destruction logging.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Optical Barcode / QR Identification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrated barcode scanner simulator matches EAN-13 and code-128 labels instantly for fast-track prescription dispensing and inventory lookup.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Supplier Reorders & Credit Notices
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-generates itemized Purchase Orders (PO) for depleted stock and drafts vendor return credit requisitions for batches nearing shelf-life expiration.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Immutable Regulatory Audit Trail
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tracks every stock-in, prescription dispense, quarantine isolation, and destruction with staff timestamps, reference notes, and CSV export.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Access Architecture Banner */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wide">
                <Lock className="w-4 h-4 text-teal-600" />
                <span>Supabase Protected Application Architecture</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Authorized Hospital Administration Clearance
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Demo inventory records, clinical data, and expiry dashboards are locked behind Supabase Authentication. Only the authorized administrator account ({PREDEFINED_ADMIN_EMAIL}) can unlock and manage active stock.
              </p>
            </div>

            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shadow-xs"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PharmaTrack · Medicine Inventory and Expiry Alert Management System</span>
          <span>Powered by Supabase Authentication · React & TypeScript</span>
        </div>
      </footer>
    </div>
  );
};
