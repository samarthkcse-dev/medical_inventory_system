import { AdminUser, AdminRole } from '../types/auth';

const STORAGE_KEYS = {
  ADMINS: 'pharmatrack_admins_v1',
  CURRENT_USER: 'pharmatrack_current_user_v1',
};

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'adm-01',
    name: 'Dr. Rajesh Mehta',
    email: 'admin@pharmatrack.com',
    staffId: 'PH-ADM-001',
    role: 'Chief Pharmacist',
    licenseNumber: 'RPH-99201-MH',
    passwordHash: btoa('admin123'),
    phone: '+1 (555) 234-8890',
    createdAt: '2026-01-10',
    lastLogin: '2026-09-24 09:30 AM',
  },
  {
    id: 'adm-02',
    name: 'Sarah Jenkins',
    email: 'sarah@pharmatrack.com',
    staffId: 'PH-AUD-004',
    role: 'Inventory Auditor',
    licenseNumber: 'RPH-88412-CA',
    passwordHash: btoa('admin123'),
    phone: '+1 (555) 871-3342',
    createdAt: '2026-03-15',
    lastLogin: '2026-09-23 04:15 PM',
  },
  {
    id: 'adm-03',
    name: 'Dr. Kevin Thorne',
    email: 'kevin@pharmatrack.com',
    staffId: 'PH-SUP-012',
    role: 'Pharmacy Supervisor',
    licenseNumber: 'RPH-77190-NY',
    passwordHash: btoa('admin123'),
    phone: '+1 (555) 441-2098',
    createdAt: '2026-05-20',
    lastLogin: '2026-09-22 11:00 AM',
  },
];

export const getStoredAdmins = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading admins from storage', e);
  }
  return INITIAL_ADMINS;
};

export const saveStoredAdmins = (admins: AdminUser[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  } catch (e) {
    console.error('Error saving admins to storage', e);
  }
};

export const getStoredCurrentUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading current user from storage', e);
  }
  // Default to first admin logged in so the app is instantly usable
  return INITIAL_ADMINS[0];
};

export const saveStoredCurrentUser = (user: AdminUser | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Error saving current user to storage', e);
  }
};

export const verifyAdminCredentials = (
  identifier: string, // email or staff ID
  password: string
): { success: boolean; user?: AdminUser; error?: string } => {
  const admins = getStoredAdmins();
  const cleanId = identifier.trim().toLowerCase();
  const encoded = btoa(password);

  const matched = admins.find(
    (a) => a.email.toLowerCase() === cleanId || a.staffId.toLowerCase() === cleanId
  );

  if (!matched) {
    return { success: false, error: 'No administrator account found with this Email or Staff ID.' };
  }

  if (matched.passwordHash !== encoded) {
    return { success: false, error: 'Incorrect administrator password.' };
  }

  // Update last login
  const updatedUser: AdminUser = {
    ...matched,
    lastLogin: `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  };

  const updatedAdmins = admins.map((a) => (a.id === updatedUser.id ? updatedUser : a));
  saveStoredAdmins(updatedAdmins);
  saveStoredCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
};

export const registerAdminUser = (
  data: Omit<AdminUser, 'id' | 'passwordHash' | 'createdAt' | 'lastLogin'> & { password: string }
): { success: boolean; user?: AdminUser; error?: string } => {
  const admins = getStoredAdmins();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanStaffId = data.staffId.trim().toUpperCase();

  // Check unique email and staffId
  if (admins.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An administrator account with this email already exists.' };
  }
  if (admins.some((a) => a.staffId.toUpperCase() === cleanStaffId)) {
    return { success: false, error: 'This Staff ID is already registered.' };
  }

  const now = new Date();
  const newUser: AdminUser = {
    id: `adm-${Date.now()}`,
    name: data.name.trim(),
    email: cleanEmail,
    staffId: cleanStaffId,
    role: data.role,
    licenseNumber: data.licenseNumber.trim(),
    passwordHash: btoa(data.password),
    phone: data.phone?.trim() || '',
    createdAt: now.toISOString().slice(0, 10),
    lastLogin: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  };

  const updatedAdmins = [...admins, newUser];
  saveStoredAdmins(updatedAdmins);
  saveStoredCurrentUser(newUser);

  return { success: true, user: newUser };
};
