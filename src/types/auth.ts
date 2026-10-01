export type AdminRole = 
  | 'Super Admin' 
  | 'Chief Pharmacist' 
  | 'Inventory Auditor' 
  | 'Pharmacy Supervisor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  staffId: string; // e.g. "PH-ADM-001"
  role: AdminRole;
  licenseNumber: string; // e.g. "RPH-99201"
  passwordHash: string; // simple encoded password for client-side persistence
  phone?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthSession {
  user: AdminUser | null;
  isAuthenticated: boolean;
}
