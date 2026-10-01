import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Plus, 
  Minus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Download,
  Eye,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { Medicine, Category, DosageForm } from '../types/inventory';
import { 
  getDaysUntilExpiry, 
  getExpiryStatusInfo, 
  getStockStatusInfo, 
  formatCurrency, 
  formatDate,
  exportMedicinesToCSV
} from '../utils/inventoryUtils';

interface MedicineListProps {
  medicines: Medicine[];
  simulatedDate: string;
  initialFilter?: string;
  onSelectMedicine: (medicine: Medicine) => void;
  onEditMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  onQuickAdjustStock: (medicine: Medicine, delta: number) => void;
  onToggleQuarantine: (medicine: Medicine) => void;
  onOpenAddModal: () => void;
}

export const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  simulatedDate,
  initialFilter = 'all',
  onSelectMedicine,
  onEditMedicine,
  onDeleteMedicine,
  onQuickAdjustStock,
  onToggleQuarantine,
  onOpenAddModal,
}) => {
  const refDate = new Date(simulatedDate + 'T00:00:00');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formFilter, setFormFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'quantity' | 'name' | 'value'>('expiry');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-select for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique categories & forms
  const categories: Category[] = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.category))).sort();
  }, [medicines]);

  const dosageForms: DosageForm[] = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.dosageForm))).sort();
  }, [medicines]);

  // Filter and Sort Logic
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = 
            med.brandName.toLowerCase().includes(q) ||
            med.genericName.toLowerCase().includes(q) ||
            med.batchNumber.toLowerCase().includes(q) ||
            med.shelfLocation.toLowerCase().includes(q) ||
            med.supplierName.toLowerCase().includes(q) ||
            med.barcode.includes(q);
          if (!match) return false;
        }

        // Status Filter
        const days = getDaysUntilExpiry(med.expiryDate, refDate);
        if (statusFilter === 'expired') {
          if (days >= 0 && !med.isQuarantined) return false;
        } else if (statusFilter === 'critical') {
          if (days < 0 || days > 30) return false;
        } else if (statusFilter === 'near_expiry') {
          if (days < 0 || days > 60) return false;
        } else if (statusFilter === 'low_stock') {
          if (med.quantity > med.minReorderLevel) return false;
        } else if (statusFilter === 'out_of_stock') {
          if (med.quantity > 0) return false;
        } else if (statusFilter === 'quarantined') {
          if (!med.isQuarantined) return false;
        } else if (statusFilter === 'safe') {
          if (days <= 60 || med.quantity <= med.minReorderLevel || med.isQuarantined) return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && med.category !== categoryFilter) {
          return false;
        }

        // Form filter
        if (formFilter !== 'all' && med.dosageForm !== formFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'expiry') {
          const daysA = getDaysUntilExpiry(a.expiryDate, refDate);
          const daysB = getDaysUntilExpiry(b.expiryDate, refDate);
          comparison = daysA - daysB;
        } else if (sortBy === 'quantity') {
          comparison = a.quantity - b.quantity;
        } else if (sortBy === 'name') {
          comparison = a.brandName.localeCompare(b.brandName);
        } else if (sortBy === 'value') {
          comparison = (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [medicines, searchQuery, statusFilter, categoryFilter, formFilter, sortBy, sortOrder, refDate]);

  // Bulk selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredMedicines.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name, generic formula, batch, rack, barcode..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Filter Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'expired', label: 'Expired' },
              { id: 'critical', label: '< 30d Critical' },
              { id: 'near_expiry', label: '< 60d Warning' },
              { id: 'low_stock', label: 'Low Stock' },
              { id: 'out_of_stock', label: 'Stockouts' },
              { id: 'safe', label: 'Adequate' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters: Category, Form, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Form:</span>
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="all">All Forms</option>
                {dosageForms.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="expiry">Expiry Date (Soonest first)</option>
                <option value="quantity">Stock Quantity (Lowest first)</option>
                <option value="name">Medicine Name (A-Z)</option>
                <option value="value">Stock Valuation (Highest first)</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-slate-100 rounded text-slate-500"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="tabular-nums font-medium text-slate-700">
              Showing {filteredMedicines.length} of {medicines.length} medicines
            </span>
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || formFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setFormFilter('all');
                }}
                className="text-teal-700 hover:text-teal-900 font-semibold text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold tabular-nums">{selectedIds.length}</span>
            <span>medicines selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const selectedMeds = medicines.filter((m) => selectedIds.includes(m.id));
                exportMedicinesToCSV(selectedMeds, refDate);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-white flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected CSV</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 text-slate-300 hover:text-white transition-colors"
            >
              Cancel Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Inventory Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredMedicines.length && filteredMedicines.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Medicine & Generic Details</th>
                <th className="py-3 px-3">Batch & Rack</th>
                <th className="py-3 px-3 text-right">Stock Level</th>
                <th className="py-3 px-3">Expiry Date & Status</th>
                <th className="py-3 px-3 text-right">Pricing (Cost/MRP)</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800">No medicines found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Try clearing search parameters or adjusting active filters.
                    </p>
                    <button
                      onClick={onOpenAddModal}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-md text-xs font-semibold hover:bg-teal-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Medicine</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const days = getDaysUntilExpiry(med.expiryDate, refDate);
                  const exp = getExpiryStatusInfo(med.expiryDate, refDate);
                  const stock = getStockStatusInfo(med.quantity, med.minReorderLevel);
                  const isSelected = selectedIds.includes(med.id);
                  const totalValue = med.quantity * med.unitPrice;

                  return (
                    <tr 
                      key={med.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        med.isQuarantined ? 'bg-rose-50/20' : ''
                      } ${isSelected ? 'bg-teal-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(med.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>

                      {/* Medicine Info */}
                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectMedicine(med)}
                            className="font-bold text-slate-900 hover:text-teal-700 text-left truncate transition-colors text-xs"
                          >
                            {med.brandName}
                          </button>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {med.strength}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {med.genericName}
                        </div>
                        {/* Static metadata with subtle typographic separator per zero-pill rules */}
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>{med.category}</span>
                          <span>·</span>
                          <span>{med.dosageForm}</span>
                          {med.isQuarantined && (
                            <>
                              <span>·</span>
                              <span className="font-bold text-rose-600">QUARANTINED</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Batch & Rack */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800 font-medium text-xs">
                          {med.batchNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>{med.shelfLocation}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {med.barcode}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 tabular-nums text-xs">
                          {med.quantity} units
                        </div>
                        <div className={`text-[10px] font-semibold mt-0.5 ${stock.textColor}`}>
                          {stock.label}
                        </div>
                        <div className="text-[10px] text-slate-400 tabular-nums">
                          Reorder at: {med.minReorderLevel}
                        </div>
                      </td>

                      {/* Expiry Date & Countdown */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-xs text-slate-800">
                          {formatDate(med.expiryDate)}
                        </div>
                        <div className={`text-[11px] font-mono font-bold mt-0.5 ${exp.textColor}`}>
                          {exp.label}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Mfg: {formatDate(med.manufacturingDate)}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-slate-900 tabular-nums text-xs">
                          {formatCurrency(med.unitPrice)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                          MRP: {formatCurrency(med.mrp)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                          Val: {formatCurrency(totalValue)}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium truncate max-w-[130px]">
                          {med.supplierName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Verified Distributor
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Stock Adjustment */}
                          <button
                            onClick={() => onQuickAdjustStock(med, -1)}
                            disabled={med.quantity <= 0}
                            title="Quick dispense 1 unit"
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onQuickAdjustStock(med, 1)}
                            title="Quick add 1 unit"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Detail */}
                          <button
                            onClick={() => onSelectMedicine(med)}
                            title="View full record"
                            className="p-1 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditMedicine(med)}
                            title="Edit medicine"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quarantine Flag */}
                          <button
                            onClick={() => onToggleQuarantine(med)}
                            title={med.isQuarantined ? "Restore from quarantine" : "Quarantine batch"}
                            className={`p-1 rounded ${
                              med.isQuarantined 
                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' 
                                : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                            }`}
                          >
                            {med.isQuarantined ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${med.brandName} (${med.batchNumber}) from inventory?`)) {
                                onDeleteMedicine(med.id);
                              }
                            }}
                            title="Delete medicine record"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
