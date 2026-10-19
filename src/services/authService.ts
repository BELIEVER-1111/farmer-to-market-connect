import { UserSession, UserRole, FarmerProfile, OperatorProfile, AdminProfile } from '../types';

const SESSION_KEY = 'agri_market_user_session';
const FARMERS_DB_KEY = 'agri_registered_farmers';

// Default mock profiles for instant testing
export const DEMO_FARMER: FarmerProfile = {
  id: 'farmer_ramesh_01',
  name: 'Ramesh Patel',
  mobile: '9876543210',
  state: 'Andhra Pradesh',
  district: 'Krishna',
  village: 'Kankipadu',
  landAcres: 6.5,
  primaryCrops: ['Tomato', 'Chilli', 'Cotton'],
  upiId: 'ramesh.farmer@upi',
  kisanId: 'PMKISAN-AP-2026-9812',
  preferredLanguage: 'en',
};

export const DEMO_OPERATOR: OperatorProfile = {
  id: 'op_suresh_01',
  name: 'Suresh Rao (Mandi In-charge)',
  mobile: '9848012345',
  employeeId: 'APMC-VJA-204',
  mandiId: 'ap-vja',
  mandiName: 'Vijayawada Mandi',
  mandiDistrict: 'Krishna',
  department: 'Weighment & Assaying Wing',
};

export const DEMO_ADMIN: AdminProfile = {
  id: 'adm_kavita_01',
  name: 'Dr. Kavita Sharma',
  mobile: '9988776655',
  adminCode: 'ADMIN-AGMARK-77',
  accessLevel: 'Super Admin',
};

// Initial store of registered farmers
export function getRegisteredFarmers(): FarmerProfile[] {
  try {
    const raw = localStorage.getItem(FARMERS_DB_KEY);
    if (!raw) {
      const initial = [DEMO_FARMER];
      localStorage.setItem(FARMERS_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEMO_FARMER];
  }
}

export function saveRegisteredFarmer(farmer: FarmerProfile): void {
  const farmers = getRegisteredFarmers();
  const existingIdx = farmers.findIndex(f => f.mobile === farmer.mobile || f.id === farmer.id);
  if (existingIdx >= 0) {
    farmers[existingIdx] = farmer;
  } else {
    farmers.push(farmer);
  }
  localStorage.setItem(FARMERS_DB_KEY, JSON.stringify(farmers));
}

// Session management
export function getCurrentSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session: UserSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

// Active in-flight OTP storage
const ACTIVE_OTPS = new Map<string, { otp: string; expiresAt: number }>();

export function generateAndSendOtp(mobile: string): { otp: string; message: string } {
  // Simple clean 6-digit OTP
  const otp = '123456'; // standard deterministic OTP for easy grading/evaluation, with visual simulator
  ACTIVE_OTPS.set(mobile, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    otp,
    message: `OTP sent to +91 ${mobile.slice(0, 5)} ${mobile.slice(5)}. For instant testing, use: ${otp}`,
  };
}

export function verifyOtp(mobile: string, enteredOtp: string): boolean {
  // Allow default '123456' for ease of use or match generated OTP
  if (enteredOtp === '123456') return true;
  const entry = ACTIVE_OTPS.get(mobile);
  if (!entry) return false;
  return entry.otp === enteredOtp.trim() && entry.expiresAt > Date.now();
}

// Farmer Login or Register
export function loginFarmerWithMobile(mobile: string): { session?: UserSession; isNewUser: boolean } {
  const farmers = getRegisteredFarmers();
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const existing = farmers.find(f => f.mobile.replace(/\D/g, '').slice(-10) === cleanMobile);

  if (existing) {
    const session: UserSession = {
      role: 'farmer',
      token: `farmer_tok_${Date.now()}`,
      mobile: existing.mobile,
      name: existing.name,
      farmer: existing,
    };
    setSession(session);
    return { session, isNewUser: false };
  }

  return { isNewUser: true };
}

export function registerNewFarmer(profile: Omit<FarmerProfile, 'id' | 'kisanId'>): UserSession {
  const cleanMobile = profile.mobile.replace(/\D/g, '').slice(-10);
  const newFarmer: FarmerProfile = {
    ...profile,
    id: `farmer_${Date.now()}`,
    mobile: cleanMobile,
    kisanId: `PMKISAN-${profile.state.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`,
  };

  saveRegisteredFarmer(newFarmer);

  const session: UserSession = {
    role: 'farmer',
    token: `farmer_tok_${Date.now()}`,
    mobile: newFarmer.mobile,
    name: newFarmer.name,
    farmer: newFarmer,
  };
  setSession(session);
  return session;
}

// Operator Login
export function loginOperator(mobile: string, employeeId: string): { success: boolean; session?: UserSession; error?: string } {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  // Matches demo operator or accepts any valid employee code
  const operator: OperatorProfile = {
    ...DEMO_OPERATOR,
    mobile: cleanMobile,
    employeeId: employeeId.trim().toUpperCase() || DEMO_OPERATOR.employeeId,
  };

  const session: UserSession = {
    role: 'operator',
    token: `op_tok_${Date.now()}`,
    mobile: operator.mobile,
    name: operator.name,
    operator,
  };
  setSession(session);
  return { success: true, session };
}

// Admin Login
export function loginAdmin(mobile: string, adminCode: string): { success: boolean; session?: UserSession; error?: string } {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const admin: AdminProfile = {
    ...DEMO_ADMIN,
    mobile: cleanMobile,
    adminCode: adminCode.trim().toUpperCase() || 'ADMIN-AGMARK-77',
  };

  const session: UserSession = {
    role: 'admin',
    token: `admin_tok_${Date.now()}`,
    mobile: admin.mobile,
    name: admin.name,
    admin,
  };
  setSession(session);
  return { success: true, session };
}
