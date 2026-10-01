import React, { useState, useEffect } from 'react';
import { 
  X, 
  MinusCircle, 
  PlusCircle, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ScanLine,
  UserCheck,
  Receipt
} from 'lucide-react';
import { Medicine } from '../types/inventory';
import { AdminUser } from '../types/auth';
import { getDaysUntilExpiry, getExpiryStatusInfo, formatCurrency } from '../utils/inventoryUtils';

interface QuickDispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  simulatedDate: string;
  initialMedicine?: Medicine | null;
  currentUser?: AdminUser | null;
  onConfirmTransaction: (
    medicineId: string,
    mode: 'DISPENSE' | 'RECEIVE',
    quantity: number,
    reason: string,
    performedBy: string,
    refNumber: string
  ) => void;
  onOpenScanner?: () => void;
}

export const QuickDispenseModal: React.FC<QuickDispenseModalProps> = ({
  isOpen,
  onClose,
  medicines,
  simulatedDate,
  initialMedicine,
  currentUser,
  onConfirmTransaction,
  onOpenScanner,
}) => {
  const [mode, setMode] = useState<'DISPENSE' | 'RECEIVE'>('DISPENSE');
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState('Outpatient Doctor Prescription');
  const [performedBy, setPerformedBy] = useState(currentUser ? `${currentUser.name} (${currentUser.staffId})` : 'Duty Pharmacist');
  const [refNumber, setRefNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refDate = new Date(simulatedDate + 'T00:00:00');

  useEffect(() => {
    if (initialMedicine) {
      setSelectedMedId(initialMedicine.id);
    } else if (medicines.length > 0 && !selectedMedId) {
      setSelectedMedId(medicines[0].id);
    }
    if (currentUser) {
      setPerformedBy(`${currentUser.name} (${currentUser.staffId})`);
    }
    setRefNumber(`RX-${Math.floor(10000 + Math.random() * 90000)}`);
    setQuantity(1);
    setError(null);
  }, [initialMedicine, isOpen, medicines]);

  if (!isOpen) return null;

  const selectedMed = medicines.find((m) => m.id === selectedMedId);
  const days = selectedMed ? getDaysUntilExpiry(selectedMed.expiryDate, refDate) : 0;
  const isExpired = selectedMed ? (days < 0 || selectedMed.isQuarantined) : false;

  // Filtered medicine search list
  const filteredMeds = medicines.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.batchNumber.toLowerCase().includes(q) ||
      m.barcode.includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMed) {
      setError('Please select a medicine.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (mode === 'DISPENSE') {
      if (isExpired) {
        setError('CRITICAL: Cannot dispense expired or quarantined medicine to a patient!');
        return;
      }
      if (quantity > selectedMed.quantity) {
        setError(`Insufficient stock! Only ${selectedMed.quantity} units available.`);
        return;
      }
    }

    onConfirmTransaction(
      selectedMed.id,
      mode,
      quantity,
      reason.trim(),
      performedBy.trim() || 'Duty Pharmacist',
      refNumber.trim()
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'DISPENSE' ? 'Dispense Medicine (Stock Out)' : 'Receive Stock (Stock In)'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'DISPENSE' 
                ? 'Issue medication to patient prescription or clinical ward.' 
                : 'Log inventory arrival from pharmaceutical distributor.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-5 pb-0">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('DISPENSE');
                setReason('Outpatient Doctor Prescription');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'DISPENSE' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Dispense / Issue</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('RECEIVE');
                setReason('Goods Received Note (GRN) Arrival');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'RECEIVE' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Receive / Restock</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-medium">
              {error}
            </div>
          )}

          {/* Medicine Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Select Medicine Batch</label>
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={onOpenScanner}
                  className="text-teal-600 hover:text-teal-800 text-[11px] font-semibold flex items-center gap-1"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Scan Barcode</span>
                </button>
              )}
            </div>

            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white text-xs"
            >
              {medicines.map((m) => {
                const d = getDaysUntilExpiry(m.expiryDate, refDate);
                return (
                  <option key={m.id} value={m.id}>
                    {m.brandName} {m.strength} [{m.batchNumber}] - {m.quantity} in stock ({d < 0 ? 'EXPIRED' : `${d}d left`})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Medicine Info Card */}
          {selectedMed && (
            <div className={`p-3 rounded-lg border text-xs ${
              isExpired
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : days <= 30
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold block">{selectedMed.brandName} ({selectedMed.strength})</span>
                  <span className="text-[11px] text-slate-600">{selectedMed.genericName}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold block">{selectedMed.quantity} available</span>
                  <span className="text-[10px] block font-mono">Location: {selectedMed.shelfLocation}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-200/60 text-[11px]">
                <span className="font-mono">Batch: {selectedMed.batchNumber}</span>
                <span>·</span>
                <span className="font-mono">Exp: {selectedMed.expiryDate}</span>
                <span>·</span>
                <span className="font-bold">
                  {isExpired ? 'SAFETY BLOCK: EXPIRED' : `${days} days left`}
                </span>
              </div>
            </div>
          )}

          {/* Quantity & Unit calculation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Total Price Estimate</label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono text-slate-900 text-xs font-bold flex items-center justify-between">
                <span>Total:</span>
                <span>{selectedMed ? formatCurrency(quantity * (mode === 'DISPENSE' ? selectedMed.mrp : selectedMed.unitPrice)) : '$0.00'}</span>
              </div>
            </div>
          </div>

          {/* Reference & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                {mode === 'DISPENSE' ? 'Prescription / Ref #' : 'Invoice / PO #'}
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. RX-99412 or PO-8812"
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Duty Pharmacist</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Department / Dispensing Clinical Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fever Clinic Outpatient or Emergency Ward"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mode === 'DISPENSE' && isExpired}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-md transition-colors shadow-2xs ${
                mode === 'DISPENSE'
                  ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {mode === 'DISPENSE' ? 'Confirm Dispensing' : 'Log Stock Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
