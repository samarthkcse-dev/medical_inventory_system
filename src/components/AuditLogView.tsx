import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import { StockTransaction, TransactionType } from '../types/inventory';

interface AuditLogViewProps {
  transactions: StockTransaction[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.medicineName.toLowerCase().includes(q) ||
        tx.batchNumber.toLowerCase().includes(q) ||
        tx.performedBy.toLowerCase().includes(q) ||
        tx.reason.toLowerCase().includes(q) ||
        (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Action Type',
      'Medicine Name',
      'Batch Number',
      'Quantity Delta',
      'New Balance',
      'Performed By',
      'Reference Number',
      'Reason',
    ];

    const rows = filtered.map((tx) => [
      `"${tx.timestamp}"`,
      `"${tx.type}"`,
      `"${tx.medicineName.replace(/"/g, '""')}"`,
      `"${tx.batchNumber}"`,
      tx.quantityDelta,
      tx.newQuantity,
      `"${tx.performedBy.replace(/"/g, '""')}"`,
      `"${tx.referenceNumber || ''}"`,
      `"${tx.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharmatrack_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              Inventory Movement & Compliance Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all stock receipts, dispensing transactions, quarantine isolations, and safe destruction protocols.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medicine, batch, pharmacist, or prescription reference..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Action:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden"
          >
            <option value="all">All Movements ({transactions.length})</option>
            <option value="DISPENSED">Dispensed / Stock Out</option>
            <option value="STOCK_IN">Stock In / GRN</option>
            <option value="EXPIRED_QUARANTINE">Quarantined Expired</option>
            <option value="DISPOSAL_WRITEOFF">Destruction Write-off</option>
            <option value="AUDIT_ADJUSTMENT">Physical Count Adjustment</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Medicine & Batch</th>
                <th className="p-3 text-right">Adjustment</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3">Authorized Staff</th>
                <th className="p-3">Reference & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {tx.timestamp}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'STOCK_IN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.type === 'DISPENSED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : tx.type === 'EXPIRED_QUARANTINE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tx.type}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{tx.medicineName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Batch: {tx.batchNumber}
                        </div>
                      </td>

                      <td className="p-3 text-right font-mono font-bold">
                        <span className={
                          tx.quantityDelta > 0 
                            ? 'text-emerald-600' 
                            : tx.quantityDelta < 0 
                            ? 'text-rose-600' 
                            : 'text-slate-600'
                        }>
                          {tx.quantityDelta > 0 ? `+${tx.quantityDelta}` : tx.quantityDelta}
                        </span>
                      </td>

                      <td className="p-3 text-right font-mono text-slate-900 font-semibold tabular-nums">
                        {tx.newQuantity}
                      </td>

                      <td className="p-3 text-slate-700 font-medium">
                        {tx.performedBy}
                      </td>

                      <td className="p-3 text-slate-600 max-w-[280px]">
                        <div>{tx.reason}</div>
                        {tx.referenceNumber && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Ref: {tx.referenceNumber}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
