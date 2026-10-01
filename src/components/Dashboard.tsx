import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Boxes, 
  DollarSign, 
  ArrowRight, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Medicine, StockTransaction } from '../types/inventory';
import { 
  calculateInventorySummary, 
  formatCurrency, 
  getDaysUntilExpiry, 
  getExpiryStatusInfo,
  getStockStatusInfo,
  formatDate
} from '../utils/inventoryUtils';

interface DashboardProps {
  medicines: Medicine[];
  transactions: StockTransaction[];
  simulatedDate: string;
  onNavigate: (view: string, filter?: string) => void;
  onSelectMedicine: (medicine: Medicine) => void;
  onOpenAddModal: () => void;
  onQuarantineAllExpired: () => void;
  onOpenDispenseModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  medicines,
  transactions,
  simulatedDate,
  onNavigate,
  onSelectMedicine,
  onOpenAddModal,
  onQuarantineAllExpired,
  onOpenDispenseModal,
}) => {
  const refDate = new Date(simulatedDate + 'T00:00:00');
  const summary = calculateInventorySummary(medicines, refDate);

  // Expired unquarantined medicines
  const unquarantinedExpired = medicines.filter((m) => {
    const days = getDaysUntilExpiry(m.expiryDate, refDate);
    return days < 0 && !m.isQuarantined && m.quantity > 0;
  });

  // Top near-expiry items (sorted by days remaining asc)
  const priorityExpiryItems = [...medicines]
    .map((m) => ({
      ...m,
      days: getDaysUntilExpiry(m.expiryDate, refDate),
    }))
    .filter((m) => m.quantity > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  // Top low-stock items
  const deficitItems = medicines
    .filter((m) => m.quantity <= m.minReorderLevel)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  // Category distribution
  const categoryCounts = medicines.reduce((acc, med) => {
    acc[med.category] = (acc[med.category] || 0) + med.quantity;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner if expired items are still in circulation */}
      {unquarantinedExpired.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-lg shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-md text-rose-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-950">
                Critical Safety Alert: {unquarantinedExpired.length} Expired Batches Active in Inventory
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Expired medicines must be removed from dispensing racks immediately to avoid patient risk and regulatory non-compliance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={onQuarantineAllExpired}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors shadow-2xs whitespace-nowrap"
            >
              Quarantine All ({unquarantinedExpired.length})
            </button>
            <button
              onClick={() => onNavigate('alerts', 'expired')}
              className="px-3 py-1.5 bg-white text-rose-700 border border-rose-200 text-xs font-semibold rounded-md hover:bg-rose-100/50 transition-colors whitespace-nowrap"
            >
              Review Batches
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Medicines */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Catalog</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {summary.totalMedicines}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {summary.totalQuantity.toLocaleString()} total units
          </div>
        </div>

        {/* Total Valuation */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Stock Value</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(summary.totalValuation)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            At purchase cost
          </div>
        </div>

        {/* Expired Batches */}
        <div 
          onClick={() => onNavigate('alerts', 'expired')}
          className="bg-white p-4 rounded-lg border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">Expired</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
            {summary.expiredCount}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            Loss: {formatCurrency(summary.expiredValuation)}
          </div>
        </div>

        {/* Near Expiry (<= 60 days) */}
        <div 
          onClick={() => onNavigate('alerts', 'near_expiry')}
          className="bg-white p-4 rounded-lg border border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Near Expiry (&le;60d)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
            {summary.criticalCount + summary.warningCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-700">
            {summary.criticalCount} critical (&le;30d)
          </div>
        </div>

        {/* Low Stock */}
        <div 
          onClick={() => onNavigate('inventory', 'low_stock')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-medium">Low Stock</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
            {summary.lowStockCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Below reorder level
          </div>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => onNavigate('inventory', 'out_of_stock')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-medium">Stockouts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 tabular-nums">
            {summary.outOfStockCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            0 units remaining
          </div>
        </div>
      </div>

      {/* Expiry Risk Horizon Breakdown */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Medicine Expiry Horizon & Risk Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Categorized relative to current date ({formatDate(simulatedDate)})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Open Alert Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex">
            {summary.expiredCount > 0 && (
              <div 
                style={{ width: `${(summary.expiredCount / summary.totalMedicines) * 100}%` }}
                className="bg-rose-500 h-full hover:opacity-90 transition-opacity"
                title={`Expired: ${summary.expiredCount} items`}
              />
            )}
            {summary.criticalCount > 0 && (
              <div 
                style={{ width: `${(summary.criticalCount / summary.totalMedicines) * 100}%` }}
                className="bg-amber-500 h-full hover:opacity-90 transition-opacity"
                title={`Critical (0-30d): ${summary.criticalCount} items`}
              />
            )}
            {summary.warningCount > 0 && (
              <div 
                style={{ width: `${(summary.warningCount / summary.totalMedicines) * 100}%` }}
                className="bg-yellow-400 h-full hover:opacity-90 transition-opacity"
                title={`Warning (31-60d): ${summary.warningCount} items`}
              />
            )}
            {summary.noticeCount > 0 && (
              <div 
                style={{ width: `${(summary.noticeCount / summary.totalMedicines) * 100}%` }}
                className="bg-blue-400 h-full hover:opacity-90 transition-opacity"
                title={`Notice (61-90d): ${summary.noticeCount} items`}
              />
            )}
            {summary.safeCount > 0 && (
              <div 
                style={{ width: `${(summary.safeCount / summary.totalMedicines) * 100}%` }}
                className="bg-emerald-500 h-full hover:opacity-90 transition-opacity"
                title={`Safe (>90d): ${summary.safeCount} items`}
              />
            )}
          </div>

          {/* Clean Legend - Zero Pill text */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 shrink-0" />
              <span className="font-medium text-slate-900 tabular-nums">{summary.expiredCount}</span>
              <span className="text-slate-500">Expired</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
              <span className="font-medium text-slate-900 tabular-nums">{summary.criticalCount}</span>
              <span className="text-slate-500">&le; 30 Days (Critical)</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 shrink-0" />
              <span className="font-medium text-slate-900 tabular-nums">{summary.warningCount}</span>
              <span className="text-slate-500">31-60 Days</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-400 shrink-0" />
              <span className="font-medium text-slate-900 tabular-nums">{summary.noticeCount}</span>
              <span className="text-slate-500">61-90 Days</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
              <span className="font-medium text-slate-900 tabular-nums">{summary.safeCount}</span>
              <span className="text-slate-500">&gt; 90 Days (Safe)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Priority Expiry Watchlist & Low Stock Reorder List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Expiry Watchlist */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Priority Expiry Watchlist
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {priorityExpiryItems.map((item) => {
              const exp = getExpiryStatusInfo(item.expiryDate, refDate);
              return (
                <div 
                  key={item.id} 
                  onClick={() => onSelectMedicine(item)}
                  className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.brandName}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {item.strength}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-700">{item.batchNumber}</span>
                      <span>·</span>
                      <span>{item.shelfLocation}</span>
                      <span>·</span>
                      <span className="tabular-nums font-medium text-slate-700">{item.quantity} in stock</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold font-mono block ${exp.textColor}`}>
                      {exp.daysRemaining < 0 
                        ? `EXPIRED (${Math.abs(exp.daysRemaining)}d)` 
                        : `${exp.daysRemaining}d left`}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {item.expiryDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock & Out of Stock Watchlist */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Low Stock & Depleted Supplies
              </h3>
            </div>
            <button
              onClick={() => onNavigate('suppliers')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Manage Suppliers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {deficitItems.map((item) => {
              const stock = getStockStatusInfo(item.quantity, item.minReorderLevel);
              const deficit = Math.max(0, item.minReorderLevel - item.quantity);
              return (
                <div 
                  key={item.id}
                  onClick={() => onSelectMedicine(item)}
                  className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.brandName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.dosageForm}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Supplier: {item.supplierName}</span>
                      <span>·</span>
                      <span>Min: {item.minReorderLevel}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold font-mono block ${stock.textColor}`}>
                      {item.quantity === 0 ? 'STOCKOUT' : `${item.quantity} REMAINING`}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      Deficit: +{deficit} units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions & Recent Inventory Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations panel */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Quick Operations
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={onOpenDispenseModal}
              className="flex items-center justify-between p-3 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-bold text-teal-900 block">Dispense Medicine</span>
                <span className="text-[11px] text-teal-700">Issue to patient or outpatient ward</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-teal-700" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">Receive New Batch</span>
                <span className="text-[11px] text-slate-500">Log GRN from pharmaceutical vendor</span>
              </div>
              <Plus className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={() => onNavigate('dispense')}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block">Barcode / QR Scanner</span>
                <span className="text-[11px] text-slate-500">Lookup medicine by optical scan</span>
              </div>
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-2">Inventory Stock by Top Category</div>
            <div className="space-y-2">
              {sortedCategories.map(([cat, qty]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate max-w-[170px]">{cat}</span>
                  <span className="font-mono font-medium text-slate-900 tabular-nums">{qty} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Stock Activities / Audit Trail */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Recent Inventory Audit Movements
            </h3>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{tx.medicineName}</span>
                    <span className="font-mono text-slate-500">[{tx.batchNumber}]</span>
                  </div>
                  <div className="text-slate-600">
                    {tx.reason}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>By: {tx.performedBy}</span>
                    <span>·</span>
                    <span>Ref: {tx.referenceNumber || 'N/A'}</span>
                    <span>·</span>
                    <span className="font-mono">{tx.timestamp}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold block ${
                    tx.quantityDelta > 0 
                      ? 'text-emerald-600' 
                      : tx.quantityDelta < 0 
                      ? 'text-rose-600' 
                      : 'text-amber-600'
                  }`}>
                    {tx.quantityDelta > 0 ? `+${tx.quantityDelta}` : tx.quantityDelta} units
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Balance: {tx.newQuantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
