import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, DollarSign, Layers, MapPin, Building, Barcode } from 'lucide-react';
import { Medicine, Category, DosageForm, Supplier } from '../types/inventory';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Partial<Medicine>) => void;
  editingMedicine?: Medicine | null;
  suppliers: Supplier[];
}

const CATEGORIES: Category[] = [
  'Antibiotics',
  'Analgesics & Antipyretics',
  'Cardiovascular',
  'Antidiabetic',
  'Gastrointestinal',
  'Respiratory',
  'Dermatological',
  'Vitamins & Minerals',
  'Antihistamines',
  'Emergency & Critical Care',
];

const DOSAGE_FORMS: DosageForm[] = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Injection',
  'Ointment',
  'Eye/Ear Drops',
  'Inhaler',
  'IV Infusion',
];

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMedicine,
  suppliers,
}) => {
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<Category>('Antibiotics');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [strength, setStrength] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [minReorderLevel, setMinReorderLevel] = useState<number>(20);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [manufacturingDate, setManufacturingDate] = useState('2026-01-01');
  const [expiryDate, setExpiryDate] = useState('2028-01-01');
  const [shelfLocation, setShelfLocation] = useState('Rack A-01');
  const [unitPrice, setUnitPrice] = useState<number>(2.50);
  const [mrp, setMrp] = useState<number>(4.00);
  const [barcode, setBarcode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMedicine) {
      setBrandName(editingMedicine.brandName);
      setGenericName(editingMedicine.genericName);
      setCategory(editingMedicine.category);
      setDosageForm(editingMedicine.dosageForm);
      setStrength(editingMedicine.strength);
      setBatchNumber(editingMedicine.batchNumber);
      setQuantity(editingMedicine.quantity);
      setMinReorderLevel(editingMedicine.minReorderLevel);
      setSupplierId(editingMedicine.supplierId);
      setManufacturingDate(editingMedicine.manufacturingDate);
      setExpiryDate(editingMedicine.expiryDate);
      setShelfLocation(editingMedicine.shelfLocation);
      setUnitPrice(editingMedicine.unitPrice);
      setMrp(editingMedicine.mrp);
      setBarcode(editingMedicine.barcode);
      setNotes(editingMedicine.notes || '');
    } else {
      // Reset defaults
      setBrandName('');
      setGenericName('');
      setCategory('Antibiotics');
      setDosageForm('Tablet');
      setStrength('');
      setBatchNumber(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
      setQuantity(50);
      setMinReorderLevel(20);
      setSupplierId(suppliers[0]?.id || '');
      setManufacturingDate(new Date().toISOString().slice(0, 10));
      // Default expiry 2 years ahead
      const nextDate = new Date();
      nextDate.setFullYear(nextDate.getFullYear() + 2);
      setExpiryDate(nextDate.toISOString().slice(0, 10));
      setShelfLocation('Rack A-01');
      setUnitPrice(2.50);
      setMrp(4.50);
      setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setNotes('');
    }
    setError(null);
  }, [editingMedicine, isOpen, suppliers]);

  if (!isOpen) return null;

  const handleGenerateBatch = () => {
    const prefix = brandName.slice(0, 3).toUpperCase() || 'MED';
    const rand = Math.floor(100 + Math.random() * 900);
    setBatchNumber(`${prefix}-26-${rand}`);
  };

  const handleGenerateBarcode = () => {
    setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  };

  const handleAddShelfLife = (months: number) => {
    try {
      const base = new Date(manufacturingDate || new Date());
      base.setMonth(base.getMonth() + months);
      setExpiryDate(base.toISOString().slice(0, 10));
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setError('Medicine Brand Name is required.');
      return;
    }
    if (!genericName.trim()) {
      setError('Generic Composition is required.');
      return;
    }
    if (!batchNumber.trim()) {
      setError('Batch Number is required.');
      return;
    }
    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      setError('Expiry Date must be after the Manufacturing Date.');
      return;
    }
    if (quantity < 0) {
      setError('Quantity cannot be negative.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);

    onSave({
      id: editingMedicine ? editingMedicine.id : undefined,
      brandName: brandName.trim(),
      genericName: genericName.trim(),
      category,
      dosageForm,
      strength: strength.trim() || 'Standard',
      batchNumber: batchNumber.trim(),
      quantity: Number(quantity),
      minReorderLevel: Number(minReorderLevel),
      supplierId,
      supplierName: selectedSupplier ? selectedSupplier.name : 'Direct Pharma',
      manufacturingDate,
      expiryDate,
      shelfLocation: shelfLocation.trim() || 'General Shelf',
      unitPrice: Number(unitPrice),
      mrp: Number(mrp),
      barcode: barcode.trim() || `890${Date.now()}`,
      notes: notes.trim(),
      lastUpdated: new Date().toISOString().slice(0, 10),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingMedicine ? 'Edit Medicine Record' : 'Register New Medicine Batch'}
            </h3>
            <p className="text-xs text-slate-500">
              Enter pharmaceutical details, batch expiration dates, and shelf placement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Brand & Generic Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Brand / Commercial Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Moxikind-CV, Dolo 650, Lipitor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Generic Formula / Salt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Amoxicillin + Clavulanic Acid"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Row 2: Category, Dosage Form, Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Therapeutic Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Dosage Form</label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden"
              >
                {DOSAGE_FORMS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Strength / Volume</label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 500 mg, 100 ml"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 3: Batch Number & Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">
                  Batch Number <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBatch}
                  className="text-[10px] text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. AMX-24-018"
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden uppercase"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Barcode / EAN-13</label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[10px] text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="8901234567890"
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 4: Manufacturing Date & Expiry Date */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Shelf Life & Expiration Dates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-600">Manufacturing Date</label>
                <input
                  type="date"
                  required
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600 font-semibold text-rose-900">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleAddShelfLife(12)}
                      className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                    >
                      +1 Yr
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddShelfLife(24)}
                      className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                    >
                      +2 Yrs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddShelfLife(36)}
                      className="px-1.5 py-0.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-600"
                    >
                      +3 Yrs
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-slate-800 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Quantity, Min Reorder Level, Shelf Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Initial Stock Units</label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Min Reorder Level</label>
              <input
                type="number"
                min="1"
                required
                value={minReorderLevel}
                onChange={(e) => setMinReorderLevel(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Storage / Shelf Location</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Rack A-02, Cold CS-1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 6: Supplier & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Distributor / Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit Purchase Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Selling Price / MRP ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={mrp}
                onChange={(e) => setMrp(Number(e.target.value))}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 7: Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Clinical / Storage Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Store below 25°C, Protect from moisture, Schedule H drug"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors shadow-xs"
            >
              {editingMedicine ? 'Save Updates' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
