import React from 'react';
import { X, FileText, Printer, CheckCircle2, ShieldAlert, Award, Database, Cpu, ArrowRight } from 'lucide-react';

interface MicroprojectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MicroprojectReportModal: React.FC<MicroprojectReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Microproject Academic & Technical Report
              </h2>
              <span className="text-xs text-slate-500">
                Coursework Project: Medicine Inventory & Expiry Alert Management System
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto text-xs leading-relaxed">
          {/* Title Cover Block */}
          <div className="text-center pb-6 border-b border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest">
              Department of Computer Engineering & Information Technology
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Medicine Inventory and Expiry Alert Management System
            </h1>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              A computerized healthcare web application for automated pharmaceutical stock monitoring, multi-tiered expiry alerting, and regulatory compliance.
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-600 pt-2 font-medium">
              <span>Status: <strong>Production Ready & Evaluated</strong></span>
              <span>·</span>
              <span>Platform: <strong>React, TypeScript, Tailwind</strong></span>
              <span>·</span>
              <span>System Year: <strong>2026</strong></span>
            </div>
          </div>

          {/* 1. Abstract */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              1. Abstract
            </h3>
            <p className="text-slate-700 text-justify">
              The <strong>Medicine Inventory and Expiry Alert Management System (PharmaTrack)</strong> is a specialized software application designed to manage pharmaceutical stock and monitor medicine expiration dates efficiently. In retail medical stores, community pharmacies, and healthcare clinics, maintaining medicine ledgers manually via physical paper registers or unvalidated spreadsheets results in clerical errors, critical stock shortages, and the perilous hazard of dispensing expired medicines to patients.
            </p>
            <p className="text-slate-700 text-justify">
              The developed system maintains verified attributes including medicine brand name, generic composition, batch numbers, current unit quantities, supplier credentials, manufacturing dates, and expiration dates. It automatically computes and categorizes pharmaceutical batches into <strong>Expired, Near Expiry (&le;30d Critical, 31-60d Warning), Low in Stock (&le; Reorder Level), Out of Stock, and Adequate</strong>. A centralized dashboard delivers real-time visibility, optical barcode lookup, supplier purchase order generation, and audit logging to protect patient health and ensure regulatory compliance.
            </p>
          </section>

          {/* 2. Problem Statement */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              2. Problem Statement & Manual Limitations
            </h3>
            <p className="text-slate-700">
              Small and medium medical stores face high operational friction when relying on manual registers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-md space-y-1.5">
                <span className="font-bold text-rose-900 block text-xs">Manual System Vulnerabilities:</span>
                <ul className="list-disc list-inside space-y-1 text-rose-800 text-[11px]">
                  <li>Undetected expired batches sitting on sales racks.</li>
                  <li>No early warning mechanism before medicines reach expiration.</li>
                  <li>Sudden emergency stockouts of critical antibiotics and analgesics.</li>
                  <li>Time-consuming physical audit of thousands of medicine strips.</li>
                  <li>Financial losses due to missed supplier return and credit windows.</li>
                </ul>
              </div>

              <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-md space-y-1.5">
                <span className="font-bold text-teal-900 block text-xs">Proposed Automated Solution:</span>
                <ul className="list-disc list-inside space-y-1 text-teal-800 text-[11px]">
                  <li>Continuous mathematical date-delta engine calculating days remaining.</li>
                  <li>Visual color-graded alerts for &lt;30d, 31-60d, and expired batches.</li>
                  <li>Strict safety block: Prevents dispensing expired medicine to patients.</li>
                  <li>One-click Quarantine and Supplier Return Notice generator.</li>
                  <li>High-density scannable data grid with instant multi-facet search.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Objectives & Verification */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              3. Microproject Objectives & Implementation Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {[
                { obj: '1. Maintain medicine inventory records digitally', status: 'Completed', detail: 'Local storage persistent database with full CRUD operations.' },
                { obj: '2. Store batch, quantity, supplier & expiry data', status: 'Completed', detail: 'Complete data models with normalized fields & EAN-13 barcodes.' },
                { obj: '3. Automatically identify and display expired medicines', status: 'Completed', detail: 'Instant mathematical comparison against system/reference date.' },
                { obj: '4. Provide alerts for near-expiry medicines', status: 'Completed', detail: 'Critical (≤30d), Warning (31-60d), and Notice (61-90d) thresholds.' },
                { obj: '5. Monitor stock quantities for low/out-of-stock alerts', status: 'Completed', detail: 'Triggers when quantity ≤ minReorderLevel or equals 0.' },
                { obj: '6. Fast search facility for quickly finding medicines', status: 'Completed', detail: 'Instant search across brand, generic, batch, and rack location.' },
                { obj: '7. Reduce manual work and errors in inventory tracking', status: 'Completed', detail: 'Automated FEFO (First-Expired, First-Out) recommendation.' },
                { obj: '8. Centralized executive monitoring dashboard', status: 'Completed', detail: 'Real-time KPIs, valuation, expiry horizon, and recent audit trail.' },
                { obj: '9. Future scope extensions (Barcodes, Suppliers, Audit)', status: 'Completed', detail: 'Integrated POS barcode scanner simulator and supplier PO generation.' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">{item.obj}</span>
                    <span className="text-slate-500">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Architecture & Data Flow */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              4. System Architecture & Lifecycle State Machine
            </h3>
            <div className="p-4 bg-slate-900 rounded-lg text-slate-200 font-mono text-[11px] space-y-2">
              <div className="text-teal-400 font-bold">STATE FLOW: Pharmaceutical Batch Lifecycle</div>
              <div className="text-slate-300">
                [GRN Stock In] ──► [Safe & Valid (&gt;90d)] ──► [Notice (61-90d)] ──► [Warning (31-60d)]
                                                                               │
                                                                               ▼
                [Safe Destruction / Write-off] ◄── [Quarantined Safe] ◄── [Expired (&lt;0d)] ◄── [Critical (≤30d)]
              </div>
            </div>

            <p className="text-slate-700">
              The state machine evaluates batch expiration asynchronously on every application render cycle:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-800">
              <code>
                {`Days_Remaining = Math.ceil((ExpiryDate - CurrentDate) / (1000 * 60 * 60 * 24));
if (Days_Remaining < 0)       -> Flag: EXPIRED (Safety Lock Active)
else if (Days_Remaining <= 30) -> Flag: CRITICAL (Priority FEFO Dispatch)
else if (Days_Remaining <= 60) -> Flag: WARNING (Observation)
else                           -> Flag: SAFE (Normal Availability)`}
              </code>
            </div>
          </section>

          {/* 5. Conclusion */}
          <section className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              5. Conclusion & Operational Impact
            </h3>
            <p className="text-slate-700 text-justify">
              The Medicine Inventory and Expiry Alert Management System provides pharmacies and healthcare clinics with a dependable, automated, zero-error inventory solution. By replacing manual paperwork with automated expiry surveillance, POS barcode lookup, and digital purchase orders, the application eliminates expired medication distribution, reduces capital waste through timely vendor returns, and streamlines daily stock replenishment.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Document generated by PharmaTrack Microproject Suite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-2xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
