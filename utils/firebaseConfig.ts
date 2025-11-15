/* eslint-disable @typescript-eslint/no-var-requires */
// Toggle to disable real Firebase and use a local shim with mock data.
// Set to false to enable real Firebase (native Android config required).
const DISABLE_FIREBASE = false;

// Exported placeholders (will be assigned below)
export let appInstance: any = null;
export let db: any = null;
export let auth: any = null;
export let enabled: boolean = false;

// Firestore helper exports (compatibility with code importing named helpers)
export let collection: any;
export let doc: any;
export let getDoc: any;
export let getDocs: any;
export let setDoc: any;
export let updateDoc: any;
export let addDoc: any;
export let deleteDoc: any;
export let onSnapshot: any;
export let serverTimestamp: any;
export let query: any;
export let where: any;
export let orderBy: any;
export let arrayUnion: any;
export let deleteField: any;

let authReadyResolve: ((a: any) => void) | null = null;
const authReady = new Promise<any>((resolve) => {
  authReadyResolve = resolve;
});

export async function getAuthInstance() {
  if (auth) return auth;
  return authReady;
}

if (DISABLE_FIREBASE) {
  // Use the shim
  const shim = require('./firebaseShim');
  appInstance = null;
  db = shim.db;
  auth = shim.auth;
  enabled = false;

  // Named helpers
  collection = shim.collection;
  doc = shim.doc;
  getDoc = shim.getDoc;
  getDocs = shim.getDocs;
  setDoc = shim.setDoc;
  updateDoc = shim.updateDoc;
  addDoc = shim.addDoc;
  deleteDoc = shim.deleteDoc;
  onSnapshot = shim.onSnapshot;
  serverTimestamp = shim.serverTimestamp;
  query = shim.query;
  where = shim.where;
  orderBy = shim.orderBy;
  arrayUnion = shim.arrayUnion;
  deleteField = shim.deleteField;

  (authReadyResolve as any)?.(auth);

} else {
  // Initialize real Firebase lazily
  (async () => {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');

    const firebaseConfig = {
      apiKey: "AIzaSyAcWRxjAp5nEmd_PCkQrSwdKIywS1hxlpw",
      authDomain: "medicareapp-f0dc0.firebaseapp.com",
      projectId: "medicareapp-f0dc0",
      storageBucket: "medicareapp-f0dc0.firebasestorage.app",
      messagingSenderId: "631948568273",
      appId: "1:631948568273:web:7be567104ec9f4593507f0",
      measurementId: "G-XZVM0ZY349"
    };

    const app = initializeApp(firebaseConfig);
    appInstance = app;
    db = getFirestore(app);

    // Init auth
    const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
    try {
      if (isReactNative) {
        try {
          const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
          const ReactNativeAsyncStorage = AsyncStorageModule.default || AsyncStorageModule;
          const authModule: any = await import('firebase/auth');
          const { initializeAuth, getReactNativePersistence } = authModule;
          auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
          });
          (authReadyResolve as any)?.(auth);
        } catch {
          // fallthrough to getAuth
        }
      }

      if (!auth) {
  const authModule: any = await import('firebase/auth');
  const { getAuth } = authModule;
  auth = getAuth(app);
  (authReadyResolve as any)?.(auth);
      }
    } catch {
      // ignore
    }

    // Re-export named firestore helpers from the real SDK for compatibility
  const firestore: any = await import('firebase/firestore');
  collection = firestore.collection;
  doc = firestore.doc;
  getDoc = firestore.getDoc;
  getDocs = firestore.getDocs;
  setDoc = firestore.setDoc;
  updateDoc = firestore.updateDoc;
  addDoc = firestore.addDoc;
  deleteDoc = firestore.deleteDoc;
  onSnapshot = firestore.onSnapshot;
  serverTimestamp = firestore.serverTimestamp;
  query = firestore.query;
  where = firestore.where;
  orderBy = firestore.orderBy;
  arrayUnion = firestore.arrayUnion;
  deleteField = firestore.deleteField;

    enabled = true;
  })();
}
