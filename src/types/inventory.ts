export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Injection' 
  | 'Ointment' 
  | 'Eye/Ear Drops' 
  | 'Inhaler' 
  | 'IV Infusion';

export type Category = 
  | 'Antibiotics'
  | 'Analgesics & Antipyretics'
  | 'Cardiovascular'
  | 'Antidiabetic'
  | 'Gastrointestinal'
  | 'Respiratory'
  | 'Dermatological'
  | 'Vitamins & Minerals'
  | 'Antihistamines'
  | 'Emergency & Critical Care';

export type ExpiryStatus = 
  | 'expired'          // Expired (< 0 days)
  | 'critical'         // 0 - 30 days
  | 'warning'          // 31 - 60 days
  | 'notice'           // 61 - 90 days
  | 'safe';            // > 90 days

export type StockStatus = 
  | 'out_of_stock'     // quantity == 0
  | 'low_stock'        // 0 < quantity <= minReorderLevel
  | 'adequate';        // quantity > minReorderLevel

export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  category: Category;
  dosageForm: DosageForm;
  strength: string; // e.g. "500 mg", "100 ml"
  batchNumber: string;
  quantity: number;
  minReorderLevel: number;
  supplierId: string;
  supplierName: string;
  manufacturingDate: string; // YYYY-MM-DD
  expiryDate: string;        // YYYY-MM-DD
  shelfLocation: string;     // e.g. "Rack A-02", "Cold Storage CS-1"
  unitPrice: number;         // Purchase price per unit ($ or ₹)
  mrp: number;               // Retail selling price per unit
  barcode: string;           // EAN-13 or Code128 format
  isQuarantined?: boolean;   // If flagged for disposal/quarantine
  quarantineReason?: string;
  notes?: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  leadTimeDays: number;
  suppliedCategories: Category[];
  rating: number; // 1-5
}

export type TransactionType = 
  | 'STOCK_IN'
  | 'DISPENSED'
  | 'EXPIRED_QUARANTINE'
  | 'DISPOSAL_WRITEOFF'
  | 'AUDIT_ADJUSTMENT'
  | 'SUPPLIER_RETURN';

export interface StockTransaction {
  id: string;
  timestamp: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  type: TransactionType;
  quantityDelta: number; // positive or negative
  newQuantity: number;
  reason: string;
  performedBy: string;
  referenceNumber?: string;
}

export interface ExpirySummary {
  totalMedicines: number;
  totalQuantity: number;
  totalValuation: number;
  expiredCount: number;
  expiredQuantity: number;
  expiredValuation: number;
  criticalCount: number;      // 0-30 days
  warningCount: number;       // 31-60 days
  noticeCount: number;        // 61-90 days
  safeCount: number;          // >90 days
  lowStockCount: number;
  outOfStockCount: number;
}
