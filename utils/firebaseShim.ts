/**
 * Lightweight Firebase shim to disable real Firebase during local/mobile development.
 * Set DISABLE_FIREBASE = true in `utils/firebaseConfig.ts` to use this shim.
 *
 * This file provides minimal mock implementations for auth and Firestore
 * used by the app during development with mock data. Write operations throw
 * to prevent accidental remote writes.
 */

// -- Mock dataset (adjust as needed) --
const MOCK_USERS: Record<string, any> = {
  'mock-user-patient': { role: 'patient', email: 'patient@example.com', name: 'Mock Patient' },
  'mock-user-doctor': { role: 'doctor', email: 'doctor@example.com', name: 'Mock Doctor' },
  'mock-user-admin': { role: 'admin', email: 'admin@example.com', name: 'Mock Admin' },
};

const MOCK_PATIENTS: Record<string, any> = {
  'mock-user-patient': { id: 'mock-user-patient', name: 'Mock Patient', doctorIds: ['mock-user-doctor'] },
};

const MOCK_DOCTORS: Record<string, any> = {
  'mock-user-doctor': { id: 'mock-user-doctor', name: 'Mock Doctor', patientIds: ['mock-user-patient'] },
};

const MOCK_APPOINTMENTS: Record<string, any> = {
  'apt-1': { id: 'apt-1', patientId: 'mock-user-patient', doctorId: 'mock-user-doctor', startTime: Date.now() + 3600000 },
};

const MOCK_MEDICAL_RECORDS: Record<string, any> = {
  'rec-1': { id: 'rec-1', patientId: 'mock-user-patient', doctorId: 'mock-user-doctor', createdAt: Date.now(), notes: 'Mock record' },
};

function makeDoc(id: string, data: any) {
  return {
    id,
    exists: () => true,  // Make exists() a method for Firebase API compatibility
    data: () => data,
  };
}

function pathToParts(path: string) {
  const p = String(path).replace(/^\/+/, '').split('/');
  return p.filter(Boolean);
}

function readCollectionByName(name: string) {
  if (name === 'users') return Object.keys(MOCK_USERS).map(k => makeDoc(k, MOCK_USERS[k]));
  if (name === 'patients') return Object.keys(MOCK_PATIENTS).map(k => makeDoc(k, MOCK_PATIENTS[k]));
  if (name === 'doctors') return Object.keys(MOCK_DOCTORS).map(k => makeDoc(k, MOCK_DOCTORS[k]));
  if (name === 'appointments') return Object.keys(MOCK_APPOINTMENTS).map(k => makeDoc(k, MOCK_APPOINTMENTS[k]));
  if (name === 'medicalRecords') return Object.keys(MOCK_MEDICAL_RECORDS).map(k => makeDoc(k, MOCK_MEDICAL_RECORDS[k]));
  return [];
}

function readDocByPath(pathParts: string[]) {
  if (pathParts.length < 2) return { exists: () => false, data: () => null };
  const [col, id] = pathParts;
  if (col === 'users' && MOCK_USERS[id]) return { exists: () => true, data: () => MOCK_USERS[id], id };
  if (col === 'patients' && MOCK_PATIENTS[id]) return { exists: () => true, data: () => MOCK_PATIENTS[id], id };
  if (col === 'doctors' && MOCK_DOCTORS[id]) return { exists: () => true, data: () => MOCK_DOCTORS[id], id };
  if (col === 'appointments' && MOCK_APPOINTMENTS[id]) return { exists: () => true, data: () => MOCK_APPOINTMENTS[id], id };
  if (col === 'medicalRecords' && MOCK_MEDICAL_RECORDS[id]) return { exists: () => true, data: () => MOCK_MEDICAL_RECORDS[id], id };
  return { exists: () => false, data: () => null };
}

// -- Mock Firestore-like API --
export async function getDocs(colRef: any) {
  const path = typeof colRef === 'string' ? colRef : (colRef && colRef.path) || '';
  const parts = pathToParts(path);
  const colName = parts[0];
  const docs = readCollectionByName(colName);
  return { docs, size: docs.length };
}

// Minimal onSnapshot implementation: call the callback immediately with current docs
export function onSnapshot(colRef: any, cb: (snap: any) => void) {
  // emulate a Firestore snapshot object with docs array
  getDocs(colRef).then((res) => {
    const snap = { docs: res.docs };
    try {
      cb(snap);
    } catch (e) {
      // swallow
    }
  });
  // return unsubscribe function (no-op for shim)
  return () => {};
}

export async function getDoc(docRef: any) {
  const path = typeof docRef === 'string' ? docRef : (docRef && docRef.path) || '';
  const parts = pathToParts(path);
  return readDocByPath(parts);
}

export function collection(_db: any, path: string) {
  const p = typeof _db === 'string' ? _db : path;
  return { path: String(p) };
}

export function doc(_db: any, path: string, maybeId?: string) {
  if (arguments.length === 3) {
    return { path: `${path}/${maybeId}` };
  }
  const p = typeof _db === 'string' ? _db : path;
  return { path: String(p) };
}

// Enable in-memory writes to mock collections
export async function addDoc(colRef: any, data: any) {
  // Generate a mock ID and add to collection
  const colName = typeof colRef === 'string' ? colRef : (colRef && colRef.path) || '';
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const parts = pathToParts(colName);
  const collection = parts[0];

  if (collection === 'users') { MOCK_USERS[id] = { ...data, id }; }
  else if (collection === 'patients') { MOCK_PATIENTS[id] = { ...data, id }; }
  else if (collection === 'doctors') { MOCK_DOCTORS[id] = { ...data, id }; }
  else if (collection === 'appointments') { MOCK_APPOINTMENTS[id] = { ...data, id }; }
  else if (collection === 'medicalRecords') { MOCK_MEDICAL_RECORDS[id] = { ...data, id }; }

  return { id, path: `${colName}/${id}` };
}

export async function setDoc(docRef: any, data: any) {
  // Update or create a doc in the mock collections
  const path = typeof docRef === 'string' ? docRef : (docRef && docRef.path) || '';
  const parts = pathToParts(path);
  if (parts.length < 2) return;
  
  const [col, id] = parts;
  const merged = { ...data, id };

  if (col === 'users') { MOCK_USERS[id] = merged; }
  else if (col === 'patients') { MOCK_PATIENTS[id] = merged; }
  else if (col === 'doctors') { MOCK_DOCTORS[id] = merged; }
  else if (col === 'appointments') { MOCK_APPOINTMENTS[id] = merged; }
  else if (col === 'medicalRecords') { MOCK_MEDICAL_RECORDS[id] = merged; }
}

export async function updateDoc(docRef: any, data: any) {
  // Update fields in a mock doc
  const path = typeof docRef === 'string' ? docRef : (docRef && docRef.path) || '';
  const parts = pathToParts(path);
  if (parts.length < 2) return;

  const [col, id] = parts;
  if (col === 'users' && MOCK_USERS[id]) { MOCK_USERS[id] = { ...MOCK_USERS[id], ...data }; }
  else if (col === 'patients' && MOCK_PATIENTS[id]) { MOCK_PATIENTS[id] = { ...MOCK_PATIENTS[id], ...data }; }
  else if (col === 'doctors' && MOCK_DOCTORS[id]) { MOCK_DOCTORS[id] = { ...MOCK_DOCTORS[id], ...data }; }
  else if (col === 'appointments' && MOCK_APPOINTMENTS[id]) { MOCK_APPOINTMENTS[id] = { ...MOCK_APPOINTMENTS[id], ...data }; }
  else if (col === 'medicalRecords' && MOCK_MEDICAL_RECORDS[id]) { MOCK_MEDICAL_RECORDS[id] = { ...MOCK_MEDICAL_RECORDS[id], ...data }; }
}

export async function deleteDoc(docRef: any) {
  // Delete a mock doc
  const path = typeof docRef === 'string' ? docRef : (docRef && docRef.path) || '';
  const parts = pathToParts(path);
  if (parts.length < 2) return;

  const [col, id] = parts;
  if (col === 'users') { delete MOCK_USERS[id]; }
  else if (col === 'patients') { delete MOCK_PATIENTS[id]; }
  else if (col === 'doctors') { delete MOCK_DOCTORS[id]; }
  else if (col === 'appointments') { delete MOCK_APPOINTMENTS[id]; }
  else if (col === 'medicalRecords') { delete MOCK_MEDICAL_RECORDS[id]; }
}

// Export common helpers that mock mode needs
export const query = (colRef: any, ...args: any[]) => colRef; // query is a no-op in mock mode
export const where = (...args: any[]) => null; // where clause ignored
export const orderBy = (...args: any[]) => null; // orderBy ignored
export const arrayUnion = (val: any) => val; // return value as-is
export const deleteField = () => undefined; // sentinel for field deletion
// -- Mock Auth API --
// Auto-sign in the first mock patient user so app doesn't prompt for auth when using mock mode
let _currentUser: any = {
  uid: 'mock-user-patient',
  email: 'patient@example.com',
};

export const auth = {
  get currentUser() { return _currentUser; },
  async signInWithEmailAndPassword(email: string) {
    const uid = Object.keys(MOCK_USERS).find(k => MOCK_USERS[k].email === email);
    if (uid) {
      _currentUser = { uid, email };
      return { user: _currentUser };
    }
    throw new Error('auth/user-not-found');
  },
  async signOut() { _currentUser = null; },
  onAuthStateChanged(cb: (u: any) => void) { cb(_currentUser); return () => {}; },
  async getIdToken() { return null; },
  async createUserWithEmailAndPassword(email: string) {
    const uid = `mock-user-${Object.keys(MOCK_USERS).length + 1}`;
    MOCK_USERS[uid] = { role: 'patient', email };
    MOCK_PATIENTS[uid] = { id: uid, name: 'New Mock Patient', doctorIds: [] };
    _currentUser = { uid, email };
    return { user: _currentUser };
  }
};

export const db = { collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc };
export const enabled = false;

export default { enabled, db, auth };

// Provide a simple serverTimestamp function for compatibility
export function serverTimestamp() {
  return new Date();
}
