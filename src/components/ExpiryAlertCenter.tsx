import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  Trash2, 
  CheckCircle, 
  ArrowRight,
  Send,
  Building,
  Printer
} from 'lucide-react';
import { Medicine } from '../types/inventory';
import { 
  getDaysUntilExpiry, 
  getExpiryStatusInfo, 
  formatCurrency, 
  formatDate 
} from '../utils/inventoryUtils';

interface ExpiryAlertCenterProps {
  medicines: Medicine[];
  simulatedDate: string;
  onSelectMedicine: (medicine: Medicine) => void;
  onToggleQuarantine: (medicine: Medicine) => void;
  onQuarantineAllExpired: () => void;
  onDisposeMedicine: (medicine: Medicine, reason: string) => void;
  onDispensePriority: (medicine: Medicine) => void;
}

export const ExpiryAlertCenter: React.FC<ExpiryAlertCenterProps> = ({
  medicines,
  simulatedDate,
  onSelectMedicine,
  onToggleQuarantine,
  onQuarantineAllExpired,
  onDisposeMedicine,
  onDispensePriority,
}) => {
  const refDate = new Date(simulatedDate + 'T00:00:00');

  const [activeTier, setActiveTier] = useState<'all' | 'expired' | 'critical' | 'warning' | 'notice'>('all');
  const [returnNoticeSupplier, setReturnNoticeSupplier] = useState<string | null>(null);
  const [disposalTarget, setDisposalTarget] = useState<Medicine | null>(null);
  const [disposalReason, setDisposalReason] = useState('Incineration per biomedical waste disposal standard');

  // Categorize medicines
  const categorized = medicines
    .map((m) => {
      const days = getDaysUntilExpiry(m.expiryDate, refDate);
      const info = getExpiryStatusInfo(m.expiryDate, refDate);
      return {
        ...m,
        days,
        info,
      };
    })
    .filter((m) => m.quantity > 0);

  const expiredList = categorized.filter((m) => m.days < 0 || m.isQuarantined);
  const criticalList = categorized.filter((m) => m.days >= 0 && m.days <= 30 && !m.isQuarantined);
  const warningList = categorized.filter((m) => m.days > 30 && m.days <= 60 && !m.isQuarantined);
  const noticeList = categorized.filter((m) => m.days > 60 && m.days <= 90 && !m.isQuarantined);

  // Financial Exposure
  const expiredExposure = expiredList.reduce((acc, m) => acc + m.quantity * m.unitPrice, 0);
  const criticalExposure = criticalList.reduce((acc, m) => acc + m.quantity * m.unitPrice, 0);
  const warningExposure = warningList.reduce((acc, m) => acc + m.quantity * m.unitPrice, 0);

  // Filtered by selected tab
  const displayList = (() => {
    switch (activeTier) {
      case 'expired':
        return expiredList;
      case 'critical':
        return criticalList;
      case 'warning':
        return warningList;
      case 'notice':
        return noticeList;
      default:
        return [...expiredList, ...criticalList, ...warningList, ...noticeList].sort((a, b) => a.days - b.days);
    }
  })();

  // Unique suppliers among near-expiry/expired medicines
  const suppliersWithAlerts = Array.from(
    new Set([...expiredList, ...criticalList].map((m) => m.supplierName))
  );

  return (
    <div className="space-y-6">
      {/* Alert Center Header & Financial Risk Summary */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">
                Automated Expiry Alert & Risk Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active surveillance of pharmaceutical batch expiration dates. Thresholds: Critical (&le;30 days), Warning (31-60 days).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {expiredList.some((m) => !m.isQuarantined) && (
              <button
                onClick={onQuarantineAllExpired}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Quarantine All Expired</span>
              </button>
            )}
            {suppliersWithAlerts.length > 0 && (
              <button
                onClick={() => setReturnNoticeSupplier(suppliersWithAlerts[0])}
                className="px-3 py-1.5 bg-white text-slate-800 border border-slate-200 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Supplier Return Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial Exposure Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-rose-50/60 rounded-md border border-rose-100">
            <div className="text-[11px] font-semibold text-rose-700 uppercase">
              Immediate Expired Loss
            </div>
            <div className="text-xl font-bold font-mono text-rose-800 tabular-nums mt-0.5">
              {formatCurrency(expiredExposure)}
            </div>
            <div className="text-[10px] text-rose-600 mt-1">
              {expiredList.length} batches requiring disposal/credit
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-md border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-700 uppercase">
              Critical Risk (&le;30 Days)
            </div>
            <div className="text-xl font-bold font-mono text-amber-800 tabular-nums mt-0.5">
              {formatCurrency(criticalExposure)}
            </div>
            <div className="text-[10px] text-amber-700 mt-1">
              {criticalList.length} batches need fast-track dispense
            </div>
          </div>

          <div className="p-3 bg-yellow-50/60 rounded-md border border-yellow-100">
            <div className="text-[11px] font-semibold text-yellow-800 uppercase">
              Warning Risk (31-60 Days)
            </div>
            <div className="text-xl font-bold font-mono text-yellow-900 tabular-nums mt-0.5">
              {formatCurrency(warningExposure)}
            </div>
            <div className="text-[10px] text-yellow-700 mt-1">
              {warningList.length} batches under observation
            </div>
          </div>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-max">
        {[
          { id: 'all', label: `All Alerts (${displayList.length})` },
          { id: 'expired', label: `Expired (${expiredList.length})` },
          { id: 'critical', label: `Critical ≤30d (${criticalList.length})` },
          { id: 'warning', label: `Warning 31-60d (${warningList.length})` },
          { id: 'notice', label: `Notice 61-90d (${noticeList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTier(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTier === tab.id
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Feed Cards */}
      <div className="grid grid-cols-1 gap-3">
        {displayList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No active alerts in this tier</h3>
            <p className="text-xs text-slate-500 mt-1">
              All inventory batches in this range meet safety and shelf-life requirements.
            </p>
          </div>
        ) : (
          displayList.map((item) => {
            const isExpired = item.days < 0;
            const isCritical = item.days >= 0 && item.days <= 30;
            const itemValue = item.quantity * item.unitPrice;

            return (
              <div 
                key={item.id}
                className={`bg-white p-4 rounded-lg border transition-all shadow-2xs ${
                  item.isQuarantined
                    ? 'border-purple-200 bg-purple-50/20'
                    : isExpired
                    ? 'border-rose-200 bg-rose-50/20'
                    : isCritical
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectMedicine(item)}
                        className="text-sm font-bold text-slate-900 hover:text-teal-700 text-left transition-colors"
                      >
                        {item.brandName}
                      </button>
                      <span className="text-xs text-slate-500 font-medium">
                        {item.strength} ({item.dosageForm})
                      </span>
                      {item.isQuarantined ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                          QUARANTINED
                        </span>
                      ) : isExpired ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {item.days} DAYS LEFT
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600">
                      Generic: <span className="text-slate-800">{item.genericName}</span>
                    </div>

                    {/* Unboxed Metadata with · separator */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                      <span className="font-mono text-slate-800">Batch: {item.batchNumber}</span>
                      <span>·</span>
                      <span>Location: {item.shelfLocation}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-slate-800 font-semibold">{item.quantity} units</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-slate-800 font-semibold">{formatCurrency(itemValue)}</span>
                      <span>·</span>
                      <span>Supplier: {item.supplierName}</span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions for this specific alert */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    {/* If expired or quarantined */}
                    {isExpired || item.isQuarantined ? (
                      <>
                        <button
                          onClick={() => onToggleQuarantine(item)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                            item.isQuarantined
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{item.isQuarantined ? 'Quarantined' : 'Quarantine'}</span>
                        </button>

                        <button
                          onClick={() => setDisposalTarget(item)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Safe Disposal</span>
                        </button>
                      </>
                    ) : (
                      /* If near expiry */
                      <>
                        <button
                          onClick={() => onDispensePriority(item)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>Dispense First (FEFO)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setReturnNoticeSupplier(item.supplierName)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-500" />
                          <span>Supplier Return</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safe Disposal Modal */}
      {disposalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Log Expired Medicine Destruction
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              This will write off <strong>{disposalTarget.quantity} units</strong> of{' '}
              <strong>{disposalTarget.brandName}</strong> (Batch: {disposalTarget.batchNumber}) from inventory and file an audit certificate.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Disposal Method / Protocol Note</label>
              <textarea
                value={disposalReason}
                onChange={(e) => setDisposalReason(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-hidden focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDisposalTarget(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDisposeMedicine(disposalTarget, disposalReason);
                  setDisposalTarget(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-2xs"
              >
                Confirm Destruction & Write-Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Return Notice Modal */}
      {returnNoticeSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Pharmaceutical Supplier Expiry Return Requisition
                </h3>
              </div>
              <button
                onClick={() => setReturnNoticeSupplier(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-md space-y-1">
                <div><strong>To Distributor:</strong> {returnNoticeSupplier}</div>
                <div><strong>From:</strong> Main Pharmacy Hospital Inventory Department</div>
                <div><strong>Date of Notice:</strong> {formatDate(simulatedDate)}</div>
                <div><strong>Subject:</strong> Credit Note Request for Near-Expiry / Expired Inventory Batches</div>
              </div>

              <p>
                In accordance with pharmaceutical distribution terms and Good Pharmacy Practice (GPP), we hereby notify you of batches approaching or exceeding shelf-life validity for credit exchange or return pickup:
              </p>

              <table className="w-full border border-slate-200 rounded text-left divide-y divide-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Medicine</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2">Expiry</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines
                    .filter((m) => m.supplierName === returnNoticeSupplier && getDaysUntilExpiry(m.expiryDate, refDate) <= 60)
                    .map((m) => {
                      const days = getDaysUntilExpiry(m.expiryDate, refDate);
                      return (
                        <tr key={m.id}>
                          <td className="p-2 font-medium">{m.brandName} ({m.strength})</td>
                          <td className="p-2 font-mono">{m.batchNumber}</td>
                          <td className="p-2 font-mono">{m.expiryDate} ({days < 0 ? 'Expired' : `${days}d left`})</td>
                          <td className="p-2 text-right font-mono">{m.quantity}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(m.quantity * m.unitPrice)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900">
                Please arrange pickup of quarantined goods within 5 business days and acknowledge credit balance.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Notice</span>
              </button>
              <button
                onClick={() => {
                  alert(`Return requisition drafted and dispatched to ${returnNoticeSupplier}!`);
                  setReturnNoticeSupplier(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs"
              >
                Dispatch Return Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
