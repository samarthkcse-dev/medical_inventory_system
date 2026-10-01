import React from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Boxes, 
  DollarSign, 
  Building, 
  ShieldAlert, 
  ShieldCheck, 
  Edit3, 
  Printer, 
  Calendar,
  AlertTriangle,
  Barcode as BarcodeIcon,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { Medicine } from '../types/inventory';
import { 
  getDaysUntilExpiry, 
  getExpiryStatusInfo, 
  getStockStatusInfo, 
  formatCurrency, 
  formatDate 
} from '../utils/inventoryUtils';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  simulatedDate: string;
  onClose: () => void;
  onEdit: (medicine: Medicine) => void;
  onToggleQuarantine: (medicine: Medicine) => void;
  onQuickAdjustStock: (medicine: Medicine, delta: number) => void;
  onOpenDispenseForMedicine: (medicine: Medicine) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  simulatedDate,
  onClose,
  onEdit,
  onToggleQuarantine,
  onQuickAdjustStock,
  onOpenDispenseForMedicine,
}) => {
  if (!medicine) return null;

  const refDate = new Date(simulatedDate + 'T00:00:00');
  const days = getDaysUntilExpiry(medicine.expiryDate, refDate);
  const exp = getExpiryStatusInfo(medicine.expiryDate, refDate);
  const stock = getStockStatusInfo(medicine.quantity, medicine.minReorderLevel);
  const totalValuation = medicine.quantity * medicine.unitPrice;
  const margin = medicine.mrp > 0 ? (((medicine.mrp - medicine.unitPrice) / medicine.mrp) * 100).toFixed(1) : '0';

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl my-6 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{medicine.brandName}</h2>
              <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                {medicine.strength}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{medicine.genericName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Status Alert Banner if expired or low stock */}
          {(exp.status === 'expired' || medicine.isQuarantined) ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Batch Flagged:</strong> {medicine.isQuarantined ? 'Quarantined in storage safe' : 'Expired batch. Immediate quarantine required.'}
                </span>
              </div>
              <button
                onClick={() => onToggleQuarantine(medicine)}
                className="text-xs font-bold underline hover:text-rose-950"
              >
                {medicine.isQuarantined ? 'Release Batch' : 'Quarantine Now'}
              </button>
            </div>
          ) : exp.status === 'critical' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Near-Expiry Warning:</strong> Only {days} days remain before expiration. Priority dispensing (FEFO) recommended.
              </span>
            </div>
          ) : null}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Current Stock</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {medicine.quantity} units
              </span>
              <span className={`text-[10px] font-semibold block mt-0.5 ${stock.textColor}`}>
                {stock.label}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Expiry Status</span>
              <span className={`text-base font-bold font-mono block mt-0.5 ${exp.textColor}`}>
                {days < 0 ? 'EXPIRED' : `${days} Days`}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {medicine.expiryDate}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Batch Valuation</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(totalValuation)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Cost: {formatCurrency(medicine.unitPrice)}/u
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Retail / Margin</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(medicine.mrp)}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                +{margin}% Margin
              </span>
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Clinical and Batch Data */}
            <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Boxes className="w-3.5 h-3.5 text-teal-600" />
                <span>Batch & Clinical Classification</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Therapeutic Category:</span>
                  <span className="font-semibold text-slate-800">{medicine.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dosage Form:</span>
                  <span className="font-semibold text-slate-800">{medicine.dosageForm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Number:</span>
                  <span className="font-mono font-bold text-slate-900">{medicine.batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Manufacturing Date:</span>
                  <span className="font-mono text-slate-800">{formatDate(medicine.manufacturingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expiry Date:</span>
                  <span className="font-mono font-bold text-slate-900">{formatDate(medicine.expiryDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shelf Placement:</span>
                  <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {medicine.shelfLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Supplier & Barcode Preview */}
            <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                <span>Supplier & Barcode Verification</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-semibold text-slate-800">{medicine.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min Reorder Level:</span>
                  <span className="font-mono text-slate-800">{medicine.minReorderLevel} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last System Update:</span>
                  <span className="text-slate-600">{formatDate(medicine.lastUpdated)}</span>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">Optical Barcode Representation:</span>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col items-center">
                    {/* SVG barcode bars */}
                    <div className="h-8 flex items-center gap-[2px] w-48 justify-center">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1].map((w, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${w}px` }}
                          className="h-full bg-slate-900"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-slate-600 tracking-widest mt-1">
                      {medicine.barcode}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {medicine.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-1">Clinical Instructions & Storage Notes:</span>
              <p className="text-slate-600">{medicine.notes}</p>
            </div>
          )}

          {/* Quick Adjustment Controls */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Quick Stock Adjustment:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuickAdjustStock(medicine, -10)}
                disabled={medicine.quantity < 10}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-30"
              >
                -10
              </button>
              <button
                onClick={() => onQuickAdjustStock(medicine, -1)}
                disabled={medicine.quantity < 1}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-30"
              >
                -1
              </button>
              <span className="font-mono font-bold text-slate-900 px-2">{medicine.quantity}</span>
              <button
                onClick={() => onQuickAdjustStock(medicine, 1)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
              >
                +1
              </button>
              <button
                onClick={() => onQuickAdjustStock(medicine, 10)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
              >
                +10
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintLabel}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Shelf Label</span>
              </button>
              <button
                onClick={() => onToggleQuarantine(medicine)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 ${
                  medicine.isQuarantined
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {medicine.isQuarantined ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{medicine.isQuarantined ? 'Release Quarantine' : 'Quarantine Batch'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(medicine);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Record</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenDispenseForMedicine(medicine);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors shadow-2xs"
              >
                Dispense / Prescribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
