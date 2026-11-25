// BAPS Gunagrahan App - Admin Authorization & Configuration
// Kshetra 21 (Raipur & Shahpur)

export const BHAVIK_ADMIN_INFO = {
  id: '1ccb1238-4241-4dbc-a933-b8db3696ca6b',
  name: 'ભાવિક યોગેશભાઈ રાઠોડ',
  karyakar_number: '13317',
  role: 'સંચાલક',
  sabha: 'શિવશક્તિ',
  wing: 'bal',
  is_admin: true,
  admin_title: 'મુખ્ય સંચાલક અને એડમિન (Super Admin)',
};

// Master Admin PINs for emergency / manual authentication gate
export const MASTER_ADMIN_PINS = [
  '13317', // Bhavik's Official Karyakar Number
  '7007',  // Standard Admin Security PIN
  '2026',  // Ramotsav 2026 PIN
];

/**
 * Checks whether a given user object has Administrator rights.
 * Only Bhavik ("ભાવિક યોગેશભાઈ રાઠોડ", ID 13317) is designated as Super Admin.
 */
export function isAdmin(user) {
  if (!user) return false;

  return (
    user.id === BHAVIK_ADMIN_INFO.id &&
    String(user.karyakar_number || '').trim() === BHAVIK_ADMIN_INFO.karyakar_number
  );
}

/**
 * Verifies whether an entered PIN matches any master admin credential.
 */
export function verifyAdminPin(enteredPin) {
  if (!enteredPin) return false;
  const cleanPin = String(enteredPin).trim();
  
  if (MASTER_ADMIN_PINS.includes(cleanPin)) {
    return true;
  }

  const envAdminPin = process.env.NEXT_PUBLIC_ADMIN_PIN;
  if (envAdminPin && cleanPin === String(envAdminPin).trim()) {
    return true;
  }

  return false;
}

// Session-level Admin storage helpers for browser client
const ADMIN_SESSION_KEY = 'gunagrahan_admin_unlocked_v1';

export function isSessionAdmin() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true' || 
           sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function unlockAdminSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } catch (e) {}
}

export function lockAdminSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {}
}
