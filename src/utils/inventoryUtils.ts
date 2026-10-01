import { Medicine, ExpiryStatus, StockStatus, ExpirySummary } from '../types/inventory';

// Default baseline date (aligned with 2026-09-24)
export const getEffectiveDate = (customDate?: string): Date => {
  if (customDate) {
    return new Date(customDate);
  }
  return new Date('2026-09-24T11:00:00');
};

/**
 * Calculates days remaining until expiry relative to referenceDate.
 * Negative number = already expired.
 */
export const getDaysUntilExpiry = (expiryDateStr: string, referenceDate: Date = getEffectiveDate()): number => {
  const expiry = new Date(expiryDateStr + 'T23:59:59');
  const diffTime = expiry.getTime() - referenceDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatusInfo = (expiryDateStr: string, referenceDate: Date = getEffectiveDate()) => {
  const days = getDaysUntilExpiry(expiryDateStr, referenceDate);

  if (days < 0) {
    return {
      status: 'expired' as ExpiryStatus,
      daysRemaining: days,
      label: `Expired (${Math.abs(days)}d ago)`,
      badgeText: 'EXPIRED',
      severity: 'critical',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    };
  }

  if (days <= 30) {
    return {
      status: 'critical' as ExpiryStatus,
      daysRemaining: days,
      label: `Expires in ${days} days`,
      badgeText: days === 0 ? 'EXPIRES TODAY' : `${days}D REMAINING`,
      severity: 'high',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    };
  }

  if (days <= 60) {
    return {
      status: 'warning' as ExpiryStatus,
      daysRemaining: days,
      label: `Expires in ${days} days`,
      badgeText: `${days}D REMAINING`,
      severity: 'medium',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50/60',
      borderColor: 'border-amber-200/60',
    };
  }

  if (days <= 90) {
    return {
      status: 'notice' as ExpiryStatus,
      daysRemaining: days,
      label: `Expires in ${days} days`,
      badgeText: `${days}D REMAINING`,
      severity: 'low',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    };
  }

  return {
    status: 'safe' as ExpiryStatus,
    daysRemaining: days,
    label: `Safe (${days} days)`,
    badgeText: 'VALID',
    severity: 'none',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  };
};

export const getStockStatusInfo = (quantity: number, minReorderLevel: number) => {
  if (quantity <= 0) {
    return {
      status: 'out_of_stock' as StockStatus,
      label: 'Out of Stock',
      badgeText: 'STOCKOUT',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    };
  }

  if (quantity <= minReorderLevel) {
    return {
      status: 'low_stock' as StockStatus,
      label: `Low Stock (${quantity}/${minReorderLevel})`,
      badgeText: 'REORDER NEEDED',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    };
  }

  return {
    status: 'adequate' as StockStatus,
    label: `Adequate (${quantity})`,
    badgeText: 'IN STOCK',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  };
};

export const calculateInventorySummary = (medicines: Medicine[], referenceDate: Date = getEffectiveDate()): ExpirySummary => {
  let totalQuantity = 0;
  let totalValuation = 0;
  let expiredCount = 0;
  let expiredQuantity = 0;
  let expiredValuation = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let noticeCount = 0;
  let safeCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  medicines.forEach((med) => {
    const qty = med.quantity;
    totalQuantity += qty;
    totalValuation += qty * med.unitPrice;

    // Expiry check
    const days = getDaysUntilExpiry(med.expiryDate, referenceDate);
    if (days < 0 || med.isQuarantined) {
      expiredCount++;
      expiredQuantity += qty;
      expiredValuation += qty * med.unitPrice;
    } else if (days <= 30) {
      criticalCount++;
    } else if (days <= 60) {
      warningCount++;
    } else if (days <= 90) {
      noticeCount++;
    } else {
      safeCount++;
    }

    // Stock check
    if (qty === 0) {
      outOfStockCount++;
    } else if (qty <= med.minReorderLevel) {
      lowStockCount++;
    }
  });

  return {
    totalMedicines: medicines.length,
    totalQuantity,
    totalValuation,
    expiredCount,
    expiredQuantity,
    expiredValuation,
    criticalCount,
    warningCount,
    noticeCount,
    safeCount,
    lowStockCount,
    outOfStockCount,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const exportMedicinesToCSV = (medicines: Medicine[], referenceDate: Date = getEffectiveDate()) => {
  const headers = [
    'Medicine Name',
    'Generic Name',
    'Category',
    'Form',
    'Strength',
    'Batch No',
    'Quantity',
    'Min Reorder Level',
    'Supplier',
    'Mfg Date',
    'Expiry Date',
    'Days Until Expiry',
    'Expiry Status',
    'Stock Status',
    'Shelf Location',
    'Unit Cost ($)',
    'Total Value ($)',
    'Barcode',
  ];

  const rows = medicines.map((m) => {
    const days = getDaysUntilExpiry(m.expiryDate, referenceDate);
    const exp = getExpiryStatusInfo(m.expiryDate, referenceDate);
    const stock = getStockStatusInfo(m.quantity, m.minReorderLevel);
    return [
      `"${m.brandName.replace(/"/g, '""')}"`,
      `"${m.genericName.replace(/"/g, '""')}"`,
      `"${m.category}"`,
      `"${m.dosageForm}"`,
      `"${m.strength}"`,
      `"${m.batchNumber}"`,
      m.quantity,
      m.minReorderLevel,
      `"${m.supplierName.replace(/"/g, '""')}"`,
      m.manufacturingDate,
      m.expiryDate,
      days,
      exp.status.toUpperCase(),
      stock.status.toUpperCase(),
      `"${m.shelfLocation}"`,
      m.unitPrice.toFixed(2),
      (m.quantity * m.unitPrice).toFixed(2),
      `"${m.barcode}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `pharmatrack_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
