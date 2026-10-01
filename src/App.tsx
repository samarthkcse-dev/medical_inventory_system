/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MedicineList } from './components/MedicineList';
import { ExpiryAlertCenter } from './components/ExpiryAlertCenter';
import { SuppliersView } from './components/SuppliersView';
import { AuditLogView } from './components/AuditLogView';
import { MedicineModal } from './components/MedicineModal';
import { MedicineDetailModal } from './components/MedicineDetailModal';
import { QuickDispenseModal } from './components/QuickDispenseModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { MicroprojectReportModal } from './components/MicroprojectReportModal';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { AdminDirectoryModal } from './components/AdminDirectoryModal';

import { Medicine, Supplier, StockTransaction } from './types/inventory';
import { AdminUser } from './types/auth';
import { INITIAL_MEDICINES, INITIAL_SUPPLIERS, INITIAL_TRANSACTIONS } from './data/seedData';
import { getDaysUntilExpiry, calculateInventorySummary } from './utils/inventoryUtils';
import { getStoredAdmins } from './utils/authUtils';
import { authService, isAuthorizedAdmin, PREDEFINED_ADMIN_EMAIL, getStoredUsers } from './lib/supabase';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEYS = {
  MEDICINES: 'pharmatrack_medicines_v1',
  SUPPLIERS: 'pharmatrack_suppliers_v1',
  TRANSACTIONS: 'pharmatrack_transactions_v1',
  SIM_DATE: 'pharmatrack_sim_date_v1',
};

type AppScreen = 'landing' | 'auth' | 'access_denied' | 'dashboard';

export default function App() {
  // Authentication & Screen State (Starts directly on clean Login/Register page unless already logged in)
  const [sessionEmail, setSessionEmail] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem('pharmatrack_active_session_v2');
      if (raw) {
        const session = JSON.parse(raw);
        return session?.user?.email || null;
      }
    } catch {}
    return null;
  });

  const [screen, setScreen] = useState<AppScreen>(() => {
    try {
      const raw = localStorage.getItem('pharmatrack_active_session_v2');
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.user?.email) return 'dashboard';
      }
    } catch {}
    return 'auth';
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Simulated date (default: 2026-09-24)
  const [simulatedDate, setSimulatedDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SIM_DATE) || '2026-09-24';
  });

  const isAdmin = isAuthorizedAdmin(sessionEmail);

  // Active Admin / Staff Object for audit and signatures
  const allUsers = getStoredUsers();
  const currentUserRecord = sessionEmail
    ? allUsers.find((u) => u.email.toLowerCase() === sessionEmail.toLowerCase())
    : null;

  const activeAdminUser: AdminUser = {
    id: isAdmin ? 'supabase-admin-01' : (currentUserRecord ? `user-${currentUserRecord.email}` : 'staff-user'),
    name: isAdmin ? 'Dr. Rajesh Mehta' : (currentUserRecord?.name || sessionEmail?.split('@')[0] || 'Hospital Staff'),
    email: sessionEmail || PREDEFINED_ADMIN_EMAIL,
    staffId: isAdmin ? 'PH-ADM-001' : 'PH-STAFF-024',
    role: isAdmin ? 'Chief Pharmacist' : 'Pharmacy Supervisor',
    licenseNumber: isAdmin ? 'RPH-99201-MH' : 'RPH-STAFF-REG',
    passwordHash: '',
    createdAt: currentUserRecord?.createdAt || '2026-01-10',
    lastLogin: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  };

  // Medicines state: Admin gets the full hospital dummy dataset; regular users get their own account dataset
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    if (isAdmin) {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.MEDICINES);
        if (saved) return JSON.parse(saved);
      } catch {}
      return INITIAL_MEDICINES;
    } else if (sessionEmail) {
      try {
        const savedUserMeds = localStorage.getItem(`pharmatrack_meds_${sessionEmail}`);
        if (savedUserMeds) return JSON.parse(savedUserMeds);
      } catch {}
      return [];
    }
    return INITIAL_MEDICINES;
  });

  // Whenever sessionEmail changes, load appropriate dataset
  useEffect(() => {
    if (!sessionEmail) return;
    if (isAuthorizedAdmin(sessionEmail)) {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.MEDICINES);
        setMedicines(saved ? JSON.parse(saved) : INITIAL_MEDICINES);
      } catch {
        setMedicines(INITIAL_MEDICINES);
      }
    } else {
      try {
        const savedUserMeds = localStorage.getItem(`pharmatrack_meds_${sessionEmail}`);
        setMedicines(savedUserMeds ? JSON.parse(savedUserMeds) : []);
      } catch {
        setMedicines([]);
      }
    }
  }, [sessionEmail]);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SUPPLIERS;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  // Active sub-view within dashboard
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [initialInventoryFilter, setInitialInventoryFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [selectedDetailMedicine, setSelectedDetailMedicine] = useState<Medicine | null>(null);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [dispenseInitialMedicine, setDispenseInitialMedicine] = useState<Medicine | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdminDirectoryOpen, setIsAdminDirectoryOpen] = useState(false);

  // Route Synchronization & Session Handling
  useEffect(() => {
    authService.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email;
      if (email) {
        setSessionEmail(email);
        setScreen('dashboard');
      } else {
        setSessionEmail(null);
        setScreen('auth');
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (email) {
        setSessionEmail(email);
        setScreen('dashboard');
      } else {
        setSessionEmail(null);
        setScreen('auth');
      }
    });

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#auth' || hash === '#login') {
        setScreen('auth');
      } else if (hash === '#dashboard' && sessionEmail) {
        setScreen('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sessionEmail]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (e) {
      console.error(e);
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.error(e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIM_DATE, simulatedDate);
    } catch (e) {
      console.error(e);
    }
  }, [simulatedDate]);

  // Derived counts
  const refDate = new Date(simulatedDate + 'T00:00:00');
  const summary = calculateInventorySummary(medicines, refDate);
  const expiredAndCriticalCount = summary.expiredCount + summary.criticalCount;

  // Supabase Auth Handlers
  const handleAuthSuccess = (authenticatedEmail: string) => {
    setSessionEmail(authenticatedEmail);
    setScreen('dashboard');
    window.location.hash = '#dashboard';
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setSessionEmail(null);
      setScreen('auth');
      window.location.hash = '#auth';
    }
  };

  // Medicine CRUD & Inventory Handlers
  const handleSaveMedicine = (medData: Partial<Medicine>) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = simulatedDate;
    const adminSign = activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'Authorized Admin';

    if (medData.id) {
      // Update existing
      setMedicines((prev) =>
        prev.map((m) => (m.id === medData.id ? ({ ...m, ...medData } as Medicine) : m))
      );

      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        timestamp: `${todayStr} ${nowStr}`,
        medicineId: medData.id,
        medicineName: medData.brandName || 'Medicine',
        batchNumber: medData.batchNumber || 'N/A',
        type: 'AUDIT_ADJUSTMENT',
        quantityDelta: 0,
        newQuantity: medData.quantity || 0,
        reason: 'Medicine clinical records and batch data updated',
        performedBy: adminSign,
      };
      setTransactions((prev) => [tx, ...prev]);
    } else {
      // Add new
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        brandName: medData.brandName || 'Unknown Medicine',
        genericName: medData.genericName || 'Formula Salt',
        category: medData.category || 'Antibiotics',
        dosageForm: medData.dosageForm || 'Tablet',
        strength: medData.strength || 'Standard',
        batchNumber: medData.batchNumber || `BAT-${Date.now().toString().slice(-4)}`,
        quantity: medData.quantity ?? 50,
        minReorderLevel: medData.minReorderLevel ?? 20,
        supplierId: medData.supplierId || suppliers[0]?.id || 'sup-1',
        supplierName: medData.supplierName || 'Apex Healthcare Ltd',
        manufacturingDate: medData.manufacturingDate || todayStr,
        expiryDate: medData.expiryDate || todayStr,
        shelfLocation: medData.shelfLocation || 'Rack A-01',
        unitPrice: medData.unitPrice ?? 2.0,
        mrp: medData.mrp ?? 3.5,
        barcode: medData.barcode || `890${Date.now()}`,
        isQuarantined: false,
        notes: medData.notes || '',
        lastUpdated: todayStr,
      };

      setMedicines((prev) => [newMed, ...prev]);

      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        timestamp: `${todayStr} ${nowStr}`,
        medicineId: newMed.id,
        medicineName: newMed.brandName,
        batchNumber: newMed.batchNumber,
        type: 'STOCK_IN',
        quantityDelta: newMed.quantity,
        newQuantity: newMed.quantity,
        reason: `New batch registered from ${newMed.supplierName}`,
        performedBy: adminSign,
        referenceNumber: `GRN-${Date.now().toString().slice(-6)}`,
      };
      setTransactions((prev) => [tx, ...prev]);
    }
  };

  const handleDeleteMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;

    setMedicines((prev) => prev.filter((m) => m.id !== id));
    if (selectedDetailMedicine?.id === id) {
      setSelectedDetailMedicine(null);
    }

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: med.id,
      medicineName: med.brandName,
      batchNumber: med.batchNumber,
      type: 'DISPOSAL_WRITEOFF',
      quantityDelta: -med.quantity,
      newQuantity: 0,
      reason: 'Deleted medicine record removed from pharmacy catalog',
      performedBy: activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'Authorized Admin',
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleQuickAdjustStock = (medicine: Medicine, delta: number) => {
    const newQty = Math.max(0, medicine.quantity + delta);
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicine.id ? { ...m, quantity: newQty } : m))
    );

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: medicine.id,
      medicineName: medicine.brandName,
      batchNumber: medicine.batchNumber,
      type: delta > 0 ? 'STOCK_IN' : 'DISPENSED',
      quantityDelta: delta,
      newQuantity: newQty,
      reason: delta > 0 ? 'Quick stock count top-up' : 'Quick dispense unit',
      performedBy: activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'Duty Pharmacist',
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleToggleQuarantine = (medicine: Medicine) => {
    const updatedStatus = !medicine.isQuarantined;
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicine.id ? { ...m, isQuarantined: updatedStatus } : m))
    );

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: medicine.id,
      medicineName: medicine.brandName,
      batchNumber: medicine.batchNumber,
      type: updatedStatus ? 'EXPIRED_QUARANTINE' : 'AUDIT_ADJUSTMENT',
      quantityDelta: 0,
      newQuantity: medicine.quantity,
      reason: updatedStatus 
        ? 'Batch isolated and moved to Quarantined Safe containment' 
        : 'Batch verified and released from quarantine',
      performedBy: activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'Quality Assurance Auditor',
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleQuarantineAllExpired = () => {
    const expiredToQuarantine = medicines.filter((m) => {
      const days = getDaysUntilExpiry(m.expiryDate, refDate);
      return days < 0 && !m.isQuarantined;
    });

    if (expiredToQuarantine.length === 0) return;

    setMedicines((prev) =>
      prev.map((m) => {
        const days = getDaysUntilExpiry(m.expiryDate, refDate);
        if (days < 0) {
          return { ...m, isQuarantined: true, quarantineReason: 'Bulk automated safety quarantine' };
        }
        return m;
      })
    );

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: 'multi-batch',
      medicineName: `${expiredToQuarantine.length} Expired Batches`,
      batchNumber: 'BULK-QUARANTINE',
      type: 'EXPIRED_QUARANTINE',
      quantityDelta: 0,
      newQuantity: 0,
      reason: `Automated safety lockdown: isolated ${expiredToQuarantine.length} expired batches from dispensing racks`,
      performedBy: activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'System Safety Monitor',
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleDisposeMedicine = (medicine: Medicine, reason: string) => {
    const disposedQty = medicine.quantity;
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicine.id ? { ...m, quantity: 0, isQuarantined: true } : m))
    );

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: medicine.id,
      medicineName: medicine.brandName,
      batchNumber: medicine.batchNumber,
      type: 'DISPOSAL_WRITEOFF',
      quantityDelta: -disposedQty,
      newQuantity: 0,
      reason: `Destruction certificate: ${reason}`,
      performedBy: activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'Authorized Officer',
      referenceNumber: `WASTE-${Date.now().toString().slice(-6)}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleConfirmDispenseOrReceive = (
    medicineId: string,
    mode: 'DISPENSE' | 'RECEIVE',
    quantity: number,
    reason: string,
    performedBy: string,
    refNumber: string
  ) => {
    const target = medicines.find((m) => m.id === medicineId);
    if (!target) return;

    const delta = mode === 'DISPENSE' ? -quantity : quantity;
    const newQty = Math.max(0, target.quantity + delta);

    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, quantity: newQty } : m))
    );

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: target.id,
      medicineName: target.brandName,
      batchNumber: target.batchNumber,
      type: mode === 'DISPENSE' ? 'DISPENSED' : 'STOCK_IN',
      quantityDelta: delta,
      newQuantity: newQty,
      reason: reason || (mode === 'DISPENSE' ? 'Prescription Dispense' : 'Stock In'),
      performedBy: performedBy || (activeAdminUser ? activeAdminUser.name : 'Duty Pharmacist'),
      referenceNumber: refNumber,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleProcessRestockPO = (supplierName: string, items: { medicineId: string; quantity: number }[]) => {
    setMedicines((prev) =>
      prev.map((m) => {
        const itemToRestock = items.find((i) => i.medicineId === m.id);
        if (itemToRestock) {
          return { ...m, quantity: m.quantity + itemToRestock.quantity };
        }
        return m;
      })
    );

    const totalUnitsAdded = items.reduce((acc, i) => acc + i.quantity, 0);
    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${simulatedDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      medicineId: 'supplier-po',
      medicineName: `Purchase Order Restock (${items.length} items)`,
      batchNumber: 'PO-DELIVERY',
      type: 'STOCK_IN',
      quantityDelta: totalUnitsAdded,
      newQuantity: 0,
      reason: `Automated PO restock received from ${supplierName}`,
      performedBy: activeAdminUser ? `${activeAdminUser.name} (${activeAdminUser.staffId})` : 'Procurement Specialist',
      referenceNumber: `PO-${Date.now().toString().slice(-5)}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [...prev, supplier]);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all inventory, suppliers, and audit logs to original demonstration seed data?')) {
      setMedicines(INITIAL_MEDICINES);
      setSuppliers(INITIAL_SUPPLIERS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSimulatedDate('2026-09-24');
      localStorage.removeItem(STORAGE_KEYS.MEDICINES);
      localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.SIM_DATE);
    }
  };

  const handleNavigateWithFilter = (view: string, filter?: string) => {
    setCurrentView(view);
    if (filter) {
      setInitialInventoryFilter(filter);
    }
  };

  // Loading state while checking Supabase session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Verifying session security clearance...</p>
        </div>
      </div>
    );
  }

  // 1. Clean Simple Authentication Screen (Login & Register without extra content)
  if (screen === 'auth' || !sessionEmail) {
    return (
      <AuthView
        defaultMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // 2. Main Protected Screen: Hospital Pharmacy Dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Primary Top Bar */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAddModal={() => {
          setEditingMedicine(null);
          setIsAddModalOpen(true);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        expiredAndCriticalCount={expiredAndCriticalCount}
        lowStockCount={summary.lowStockCount}
        medicines={medicines}
        simulatedDate={simulatedDate}
        setSimulatedDate={setSimulatedDate}
        currentUser={activeAdminUser}
        onOpenAuthModal={() => {
          setScreen('auth');
        }}
        onOpenAdminDirectory={() => setIsAdminDirectoryOpen(true)}
        onLogout={handleLogout}
      />

      {/* For newly registered users: friendly banner allowing them to test or copy demo data */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs px-4 py-2.5 shadow-xs border-b border-purple-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                Staff Account
              </span>
              <span className="font-medium text-purple-100">
                Logged in as <strong>{activeAdminUser.name}</strong> ({activeAdminUser.email}).
                {medicines.length === 0
                  ? ' (The 16-medicine hospital dummy dataset with critical expiry alerts belongs to the Admin account).'
                  : ` (${medicines.length} medicines in your account).`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {medicines.length === 0 && (
                <button
                  type="button"
                  onClick={() => setMedicines(INITIAL_MEDICINES)}
                  className="px-3 py-1 bg-white text-purple-900 hover:bg-purple-50 font-bold text-[11px] rounded shadow-xs transition-colors"
                >
                  Load Demo Data
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  await authService.signInAsDemoAdmin();
                  handleAuthSuccess(PREDEFINED_ADMIN_EMAIL);
                }}
                className="px-3 py-1 bg-purple-950/70 hover:bg-purple-950 text-white font-semibold text-[11px] rounded border border-purple-400/40 transition-colors"
              >
                Switch to Admin Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' && (
          <Dashboard
            medicines={medicines}
            transactions={transactions}
            simulatedDate={simulatedDate}
            onNavigate={handleNavigateWithFilter}
            onSelectMedicine={(med) => setSelectedDetailMedicine(med)}
            onOpenAddModal={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
            onQuarantineAllExpired={handleQuarantineAllExpired}
            onOpenDispenseModal={() => {
              setDispenseInitialMedicine(null);
              setIsDispenseModalOpen(true);
            }}
          />
        )}

        {currentView === 'inventory' && (
          <MedicineList
            medicines={medicines}
            simulatedDate={simulatedDate}
            initialFilter={initialInventoryFilter}
            onSelectMedicine={(med) => setSelectedDetailMedicine(med)}
            onEditMedicine={(med) => {
              setEditingMedicine(med);
              setIsAddModalOpen(true);
            }}
            onDeleteMedicine={handleDeleteMedicine}
            onQuickAdjustStock={handleQuickAdjustStock}
            onToggleQuarantine={handleToggleQuarantine}
            onOpenAddModal={() => {
              setEditingMedicine(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {currentView === 'alerts' && (
          <ExpiryAlertCenter
            medicines={medicines}
            simulatedDate={simulatedDate}
            onSelectMedicine={(med) => setSelectedDetailMedicine(med)}
            onToggleQuarantine={handleToggleQuarantine}
            onQuarantineAllExpired={handleQuarantineAllExpired}
            onDisposeMedicine={handleDisposeMedicine}
            onDispensePriority={(med) => {
              setDispenseInitialMedicine(med);
              setIsDispenseModalOpen(true);
            }}
          />
        )}

        {currentView === 'dispense' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Point-of-Dispense & Optical Barcode Station
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dispense medications with automated expiry validation, safety locks, and real-time stock deductions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsScannerModalOpen(true)}
                  className="px-3.5 py-2 bg-teal-600 text-white rounded-md text-xs font-semibold hover:bg-teal-700 transition-colors shadow-2xs whitespace-nowrap"
                >
                  Launch Barcode Scanner
                </button>
                <button
                  onClick={() => {
                    setDispenseInitialMedicine(null);
                    setIsDispenseModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Manual Dispense Form
                </button>
              </div>
            </div>

            {/* Direct Dispense Table */}
            <MedicineList
              medicines={medicines}
              simulatedDate={simulatedDate}
              initialFilter="all"
              onSelectMedicine={(med) => setSelectedDetailMedicine(med)}
              onEditMedicine={(med) => {
                setEditingMedicine(med);
                setIsAddModalOpen(true);
              }}
              onDeleteMedicine={handleDeleteMedicine}
              onQuickAdjustStock={handleQuickAdjustStock}
              onToggleQuarantine={handleToggleQuarantine}
              onOpenAddModal={() => {
                setEditingMedicine(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        )}

        {currentView === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            medicines={medicines}
            simulatedDate={simulatedDate}
            onAddSupplier={handleAddSupplier}
            onProcessRestockPO={handleProcessRestockPO}
          />
        )}

        {currentView === 'audit' && (
          <AuditLogView transactions={transactions} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">PharmaTrack Facility Control</span>
            <span>·</span>
            <span className="font-mono text-teal-800 font-medium">Logged in: {sessionEmail}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-teal-700 hover:text-teal-900 font-semibold transition-colors"
            >
              Microproject Report
            </button>
            <span>·</span>
            <button
              onClick={handleResetData}
              title="Reset data to default demonstration records"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
            <span>·</span>
            <button
              onClick={handleLogout}
              className="text-rose-600 hover:text-rose-800 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMedicine}
        editingMedicine={editingMedicine}
        suppliers={suppliers}
      />

      <MedicineDetailModal
        medicine={selectedDetailMedicine}
        simulatedDate={simulatedDate}
        onClose={() => setSelectedDetailMedicine(null)}
        onEdit={(med) => {
          setSelectedDetailMedicine(null);
          setEditingMedicine(med);
          setIsAddModalOpen(true);
        }}
        onToggleQuarantine={handleToggleQuarantine}
        onQuickAdjustStock={handleQuickAdjustStock}
        onOpenDispenseForMedicine={(med) => {
          setSelectedDetailMedicine(null);
          setDispenseInitialMedicine(med);
          setIsDispenseModalOpen(true);
        }}
      />

      <QuickDispenseModal
        isOpen={isDispenseModalOpen}
        onClose={() => setIsDispenseModalOpen(false)}
        medicines={medicines}
        simulatedDate={simulatedDate}
        initialMedicine={dispenseInitialMedicine}
        currentUser={activeAdminUser}
        onConfirmTransaction={handleConfirmDispenseOrReceive}
        onOpenScanner={() => {
          setIsDispenseModalOpen(false);
          setIsScannerModalOpen(true);
        }}
      />

      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        medicines={medicines}
        simulatedDate={simulatedDate}
        onSelectScannedMedicine={(med) => setSelectedDetailMedicine(med)}
        onQuickDispense={(med) => {
          setDispenseInitialMedicine(med);
          setIsDispenseModalOpen(true);
        }}
      />

      <MicroprojectReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <AdminDirectoryModal
        isOpen={isAdminDirectoryOpen}
        onClose={() => setIsAdminDirectoryOpen(false)}
        currentUser={activeAdminUser}
        allAdmins={getStoredAdmins()}
        onOpenRegisterNew={() => {
          setIsAdminDirectoryOpen(false);
          setAuthMode('register');
          setScreen('auth');
        }}
        onLogout={handleLogout}
      />
    </div>
  );
}
