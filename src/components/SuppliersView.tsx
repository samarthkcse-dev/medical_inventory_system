import React, { useState } from 'react';
import { 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  ShoppingCart, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Printer, 
  CheckCircle 
} from 'lucide-react';
import { Supplier, Medicine } from '../types/inventory';
import { formatCurrency, formatDate } from '../utils/inventoryUtils';

interface SuppliersViewProps {
  suppliers: Supplier[];
  medicines: Medicine[];
  simulatedDate: string;
  onAddSupplier: (supplier: Supplier) => void;
  onProcessRestockPO: (supplierName: string, items: { medicineId: string; quantity: number }[]) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  medicines,
  simulatedDate,
  onAddSupplier,
  onProcessRestockPO,
}) => {
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState<Supplier | null>(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  // New Supplier Form State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLeadTime, setNewLeadTime] = useState<number>(3);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    const created: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplierName.trim(),
      contactPerson: newContactPerson.trim() || 'Logistics Desk',
      phone: newPhone.trim() || '+1 (555) 000-0000',
      email: newEmail.trim() || 'orders@pharma.com',
      address: newAddress.trim() || 'Pharma Distribution Zone',
      leadTimeDays: Number(newLeadTime) || 3,
      suppliedCategories: ['Antibiotics', 'Analgesics & Antipyretics'],
      rating: 4.5,
    };

    onAddSupplier(created);
    setIsAddSupplierOpen(false);
    setNewSupplierName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              Pharmaceutical Suppliers & Procurement Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor authorized pharmaceutical vendors, lead times, and automated purchase requisitions.
          </p>
        </div>

        <button
          onClick={() => setIsAddSupplierOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white rounded-md text-xs font-semibold hover:bg-teal-700 transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supplier) => {
          // Medicines supplied by this vendor
          const supplierMeds = medicines.filter(
            (m) => m.supplierId === supplier.id || m.supplierName === supplier.name
          );

          // Deficit medicines (low stock or out of stock)
          const deficitMeds = supplierMeds.filter((m) => m.quantity <= m.minReorderLevel);

          return (
            <div
              key={supplier.id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                {/* Header with Rating */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{supplier.name}</h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      Contact: {supplier.contactPerson}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{supplier.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Standard Lead Time: <strong>{supplier.leadTimeDays} business days</strong></span>
                  </div>
                </div>

                {/* Stock Deficit Warning */}
                {deficitMeds.length > 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold">{deficitMeds.length} items need reorder</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">REORDER</span>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-800 text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>All {supplierMeds.length} catalog items well-stocked</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">
                  {supplierMeds.length} medicines supplied
                </span>
                <button
                  onClick={() => setSelectedSupplierForPO(supplier)}
                  className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 font-semibold rounded-md hover:bg-teal-100 transition-colors flex items-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-teal-700" />
                  <span>Generate PO</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Purchase Order Modal */}
      {selectedSupplierForPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Automated Purchase Order Requisition (PO)
                </h3>
              </div>
              <button
                onClick={() => setSelectedSupplierForPO(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div><strong>Vendor:</strong> {selectedSupplierForPO.name} ({selectedSupplierForPO.email})</div>
                <div><strong>PO Reference:</strong> PO-2026-AUT-{Math.floor(1000 + Math.random() * 9000)}</div>
                <div><strong>Issue Date:</strong> {formatDate(simulatedDate)}</div>
                <div><strong>Expected Delivery:</strong> {supplierExpectedDate(simulatedDate, selectedSupplierForPO.leadTimeDays)}</div>
              </div>

              <div className="text-slate-700">
                Recommended reorder quantities based on current inventory deficit and safety buffer thresholds:
              </div>

              <table className="w-full border border-slate-200 rounded text-left divide-y divide-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-right">In Stock</th>
                    <th className="p-2 text-right">Min Level</th>
                    <th className="p-2 text-right">Order Qty</th>
                    <th className="p-2 text-right">Unit Cost</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines
                    .filter((m) => m.supplierId === selectedSupplierForPO.id || m.supplierName === selectedSupplierForPO.name)
                    .map((m) => {
                      const deficit = Math.max(20, (m.minReorderLevel * 2) - m.quantity);
                      const cost = deficit * m.unitPrice;
                      return (
                        <tr key={m.id} className={m.quantity <= m.minReorderLevel ? 'bg-amber-50/40' : ''}>
                          <td className="p-2 font-medium">{m.brandName} ({m.strength})</td>
                          <td className="p-2 text-right font-mono">{m.quantity}</td>
                          <td className="p-2 text-right font-mono">{m.minReorderLevel}</td>
                          <td className="p-2 text-right font-mono font-bold text-teal-800">+{deficit}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(m.unitPrice)}</td>
                          <td className="p-2 text-right font-mono font-bold">{formatCurrency(cost)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded text-teal-900 flex items-center justify-between font-semibold">
                <span>Total Purchase Order Commitment:</span>
                <span className="text-base font-bold font-mono">
                  {formatCurrency(
                    medicines
                      .filter((m) => m.supplierId === selectedSupplierForPO.id || m.supplierName === selectedSupplierForPO.name)
                      .reduce((acc, m) => acc + (Math.max(20, (m.minReorderLevel * 2) - m.quantity) * m.unitPrice), 0)
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print PO</span>
              </button>
              <button
                onClick={() => {
                  const itemsToRestock = medicines
                    .filter((m) => m.supplierId === selectedSupplierForPO.id || m.supplierName === selectedSupplierForPO.name)
                    .map((m) => ({
                      medicineId: m.id,
                      quantity: Math.max(20, (m.minReorderLevel * 2) - m.quantity),
                    }));
                  onProcessRestockPO(selectedSupplierForPO.name, itemsToRestock);
                  setSelectedSupplierForPO(null);
                }}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-2xs"
              >
                Submit PO & Receive Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Add Pharmaceutical Supplier</h3>
              <button onClick={() => setIsAddSupplierOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="e.g. Novartis Distribution"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contact Person</label>
                <input
                  type="text"
                  value={newContactPerson}
                  onChange={(e) => setNewContactPerson(e.target.value)}
                  placeholder="e.g. James Wilson"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="orders@vendor.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Physical Address / Hub</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 500 Bio-Hub Blvd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function supplierExpectedDate(baseDateStr: string, leadDays: number): string {
  try {
    const d = new Date(baseDateStr + 'T00:00:00');
    d.setDate(d.getDate() + leadDays);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '3 days';
  }
}
