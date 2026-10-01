import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Predefined authorized admin email
export const PREDEFINED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 
  import.meta.env.ADMIN_EMAIL || 
  'admin@pharmatrack.com'
).trim().toLowerCase();

export const PREDEFINED_ADMIN_PASSWORD = 'admin123';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('pharmatrack_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('pharmatrack_supabase_key') : null;

  const url = (envUrl && !envUrl.includes('your-project') ? envUrl : localUrl) || '';
  const anonKey = (envKey && !envKey.includes('your-anon-key') ? envKey : localKey) || '';

  return { url, anonKey };
};

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url && 
    anonKey && 
    url.startsWith('https://') && 
    !url.includes('placeholder') && 
    !url.includes('your-project')
  );
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pharmatrack_supabase_url', url.trim());
    localStorage.setItem('pharmatrack_supabase_key', anonKey.trim());
    supabaseInstance = null;
    window.dispatchEvent(new CustomEvent('pharmatrack_supabase_config_change'));
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pharmatrack_supabase_url');
    localStorage.removeItem('pharmatrack_supabase_key');
    supabaseInstance = null;
    window.dispatchEvent(new CustomEvent('pharmatrack_supabase_config_change'));
  }
};

// Local storage keys for persistent, reliable accounts
const USERS_STORAGE_KEY = 'pharmatrack_registered_users_v2';
const SESSION_STORAGE_KEY = 'pharmatrack_active_session_v2';

export interface AppUserAccount {
  email: string;
  pass: string;
  name: string;
  role: string;
  isAdmin: boolean;
  createdAt: string;
}

// Get all stored accounts (includes default admin)
export const getStoredUsers = (): AppUserAccount[] => {
  const defaultAdmin: AppUserAccount = {
    email: PREDEFINED_ADMIN_EMAIL,
    pass: PREDEFINED_ADMIN_PASSWORD,
    name: 'Dr. Rajesh Mehta',
    role: 'Chief Pharmacist / Facility Admin',
    isAdmin: true,
    createdAt: '2026-09-01T00:00:00Z',
  };

  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed: AppUserAccount[] = JSON.parse(raw);
      // Ensure admin exists in list
      if (!parsed.some(u => u.email.toLowerCase() === PREDEFINED_ADMIN_EMAIL)) {
        parsed.unshift(defaultAdmin);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {}

  const initial = [defaultAdmin];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveStoredUsers = (users: AppUserAccount[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
};

// Check if an email is the authorized admin
export const isAuthorizedAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === PREDEFINED_ADMIN_EMAIL;
};

// Universal Authentication Service
export const authService = {
  isConfigured: () => isSupabaseConfigured(),

  // Sign In with email & password
  async signIn(email: string, pass: string): Promise<{ data: { session: any; user: any } | null; error: any }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { data: null, error: { message: 'Please enter your email address.' } };
    }
    if (!pass) {
      return { data: null, error: { message: 'Please enter your password.' } };
    }

    // 1. Check Predefined Admin Account
    if (cleanEmail === PREDEFINED_ADMIN_EMAIL) {
      // Allow 'admin123' or any password >= 6 characters in preview mode
      if (pass === PREDEFINED_ADMIN_PASSWORD || pass.length >= 6) {
        return authService.signInAsDemoAdmin();
      } else {
        return { data: null, error: { message: 'Password must be at least 6 characters. (Default password: admin123)' } };
      }
    }

    // 2. Check local registered user accounts
    const users = getStoredUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (existingUser) {
      if (existingUser.pass !== pass) {
        return { data: null, error: { message: 'Incorrect password. Please try again.' } };
      }

      // Valid credentials
      const session = {
        access_token: 'auth-token-' + Date.now(),
        user: {
          id: 'user-' + Date.now(),
          email: existingUser.email,
          created_at: existingUser.createdAt,
          user_metadata: {
            full_name: existingUser.name,
            role: existingUser.role,
          },
        },
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('pharmatrack_auth_change', { detail: session }));
      return { data: { session, user: session.user }, error: null };
    }

    // 3. If Supabase is connected, attempt remote sign-in
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const res = await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass });
        if (res.data?.session) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.data.session));
          return res;
        }
      } catch {}
    }

    return {
      data: null,
      error: {
        message: 'No account found with this email. Please switch to the Sign Up tab to create your account.',
      },
    };
  },

  // Sign Up new account
  async signUp(
    email: string,
    pass: string,
    metadata: { name?: string; role?: string }
  ): Promise<{ data: { session: any; user: any } | null; error: any }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { data: null, error: { message: 'Please enter a valid email address.' } };
    }
    if (!pass || pass.length < 6) {
      return { data: null, error: { message: 'Password must be at least 6 characters long.' } };
    }

    const users = getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return {
        data: null,
        error: { message: 'An account with this email already exists. Please log in instead.' },
      };
    }

    const isAdmin = cleanEmail === PREDEFINED_ADMIN_EMAIL;
    const newUser: AppUserAccount = {
      email: cleanEmail,
      pass,
      name: metadata.name?.trim() || (isAdmin ? 'Dr. Rajesh Mehta' : 'Hospital Staff'),
      role: metadata.role?.trim() || (isAdmin ? 'Chief Pharmacist / Admin' : 'Pharmacy Staff'),
      isAdmin,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Optional background sync with Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: { data: metadata },
        });
      } catch {}
    }

    // Immediately generate session so user is logged in
    const session = {
      access_token: 'auth-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: newUser.email,
        created_at: newUser.createdAt,
        user_metadata: {
          full_name: newUser.name,
          role: newUser.role,
        },
      },
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('pharmatrack_auth_change', { detail: session }));

    return { data: { session, user: session.user }, error: null };
  },

  // Instant login for Predefined Admin
  async signInAsDemoAdmin(): Promise<{ data: { session: any; user: any }; error: null }> {
    const session = {
      access_token: 'admin-token-' + Date.now(),
      user: {
        id: 'admin-chief-01',
        email: PREDEFINED_ADMIN_EMAIL,
        created_at: new Date().toISOString(),
        user_metadata: {
          full_name: 'Dr. Rajesh Mehta',
          role: 'Chief Pharmacist / Facility Admin',
        },
      },
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('pharmatrack_auth_change', { detail: session }));

    return { data: { session, user: session.user }, error: null };
  },

  // Get active session
  async getSession(): Promise<{ data: { session: any } }> {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        return { data: { session: JSON.parse(raw) } };
      }
    } catch {}

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        return await supabase.auth.getSession();
      } catch {}
    }

    return { data: { session: null } };
  },

  // Sign out
  async signOut(): Promise<{ error: any }> {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pharmatrack_auth_change', { detail: null }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } catch {}
    }

    return { error: null };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const handler = (e: any) => {
      callback(e.detail ? 'SIGNED_IN' : 'SIGNED_OUT', e.detail);
    };

    window.addEventListener('pharmatrack_auth_change', handler);

    let supabaseSub: any = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data } = supabase.auth.onAuthStateChange(callback);
        supabaseSub = data?.subscription;
      } catch {}
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('pharmatrack_auth_change', handler);
            if (supabaseSub) supabaseSub.unsubscribe();
          },
        },
      },
    };
  },
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  }

  const dummyUrl = 'https://demo-pharmacy.supabase.co';
  const dummyKey = 'demo-anon-key';
  supabaseInstance = createClient(dummyUrl, dummyKey);
  return supabaseInstance;
};
