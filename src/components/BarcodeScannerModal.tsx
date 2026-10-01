import React, { useState } from 'react';
import { 
  X, 
  ScanLine, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Camera
} from 'lucide-react';
import { Medicine } from '../types/inventory';
import { getDaysUntilExpiry, getExpiryStatusInfo, formatCurrency } from '../utils/inventoryUtils';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  simulatedDate: string;
  onSelectScannedMedicine: (medicine: Medicine) => void;
  onQuickDispense: (medicine: Medicine) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  medicines,
  simulatedDate,
  onSelectScannedMedicine,
  onQuickDispense,
}) => {
  const [scannedInput, setScannedInput] = useState('');
  const [matchedMedicine, setMatchedMedicine] = useState<Medicine | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'not_found'>('idle');

  if (!isOpen) return null;

  const refDate = new Date(simulatedDate + 'T00:00:00');

  const handleLookup = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setScanStatus('scanning');
    setTimeout(() => {
      const match = medicines.find(
        (m) => m.barcode === cleanCode || m.batchNumber.toLowerCase() === cleanCode.toLowerCase()
      );

      if (match) {
        setMatchedMedicine(match);
        setScanStatus('success');
      } else {
        setMatchedMedicine(null);
        setScanStatus('not_found');
      }
    }, 250);
  };

  const handleTestScan = (med: Medicine) => {
    setScannedInput(med.barcode);
    handleLookup(med.barcode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Optical Barcode & Batch Scanner
              </h3>
              <p className="text-xs text-slate-500">
                Simulated POS barcode reader for rapid medicine identification.
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

        {/* Scanner Simulation Viewport */}
        <div className="p-5 space-y-4 text-xs">
          <div className="relative bg-slate-900 rounded-lg p-6 text-center text-white overflow-hidden border border-slate-800">
            {/* Visual Laser Guide Line */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center justify-center py-4">
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">
                Optical Laser Aim Active
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Align barcode within scanner boundary or select a quick batch below
              </span>
            </div>
          </div>

          {/* Barcode Search / Scanner Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Scan Input / Barcode / Batch Number</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup(scannedInput)}
                  placeholder="Enter or scan barcode (e.g. 8901234000181)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs focus:bg-white focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => handleLookup(scannedInput)}
                className="px-4 py-2 bg-teal-600 text-white rounded-md font-semibold text-xs hover:bg-teal-700"
              >
                Scan
              </button>
            </div>
          </div>

          {/* Quick Test Barcode Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Simulate Handheld Scanner with Sample Batches:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {medicines.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleTestScan(m)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-700 font-mono transition-colors"
                >
                  {m.brandName}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          {scanStatus === 'success' && matchedMedicine && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-teal-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Match Identified: {matchedMedicine.brandName} ({matchedMedicine.strength})</span>
                </div>
                <span className="font-mono text-xs text-teal-700 font-bold">
                  {matchedMedicine.quantity} units
                </span>
              </div>

              <div className="text-xs text-slate-600">
                Generic: {matchedMedicine.genericName} · Shelf: {matchedMedicine.shelfLocation}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-teal-200/60">
                <span className="font-mono">Batch: {matchedMedicine.batchNumber}</span>
                <span className="font-mono">Exp: {matchedMedicine.expiryDate}</span>
                <span className="font-bold text-slate-800">{formatCurrency(matchedMedicine.mrp)}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onSelectScannedMedicine(matchedMedicine);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-teal-300 text-teal-900 hover:bg-teal-100 rounded-md"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onQuickDispense(matchedMedicine);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs"
                >
                  Proceed to Dispense
                </button>
              </div>
            </div>
          )}

          {scanStatus === 'not_found' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>No medicine in database matched code "{scannedInput}".</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
