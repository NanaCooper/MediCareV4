import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { db, doc, getDoc, setDoc, getAuthInstance } from '../utils/firebaseConfig';

type User = { uid: string; email?: string | null } | null;

interface AuthContextType {
  signIn: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email?: string, password?: string, role?: 'patient' | 'doctor') => Promise<void>;
  session?: User;
  isLoading: boolean;
  userType?: string | null;
  setUserType: (type: 'patient' | 'doctor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function useProtectedRoute(session: User | null | undefined, isLoading: boolean, userType: string | null) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';

        if (isLoading) return;

        // Redirect authenticated users from auth group
        if (session && inAuthGroup) {
            if (userType) {
                if (userType === 'patient') {
                    router.replace('/(patient)');
                } else if (userType === 'doctor') {
                    router.replace('/(doctor)');
                }
            } else {
                // If userType is not set (e.g., new user just signed up), go to user type selection
                router.replace('/user-type-selection');
            }
        } else if (!session && !inAuthGroup) {
            // Redirect unauthenticated users to login
            router.replace('/login');
        }
    }, [session, segments, router, isLoading, userType]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserTypeState] = useState<string | null>(null);
  // We use a lazily-initialized auth instance provided by utils/firebaseConfig.
  // Call getAuthInstance() where needed to ensure the React Native persistence
  // initialization (if available) has completed.

  const signIn = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required for sign in.");
    }
    setIsLoading(true);
    try {
      const authInst = await getAuthInstance();
      // shim auth provides method-style API; real firebase modular SDK uses function import.
      if (authInst && typeof authInst.signInWithEmailAndPassword === 'function') {
        await authInst.signInWithEmailAndPassword(email, password);
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(authInst, email, password);
      }
    } catch (error: any) {
      setIsLoading(false); // Ensure loading state is reset on error
      console.error("Firebase Sign In Error:", error.message);
      throw error;
    }
  };

  const signUp = async (email?: string, password?: string, role?: 'patient' | 'doctor') => {
    if (!email || !password || !role) {
        throw new Error("Email, password, and role are required for sign up.");
    }
    setIsLoading(true);
    try {
      const authInst = await getAuthInstance();
      let userCredential: any = null;
      if (authInst && typeof authInst.createUserWithEmailAndPassword === 'function') {
        userCredential = await authInst.createUserWithEmailAndPassword(email, password);
      } else {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        userCredential = await createUserWithEmailAndPassword(authInst, email, password);
      }
      // Create user document in Firestore immediately after successful registration
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        role: role,
        createdAt: new Date().toISOString(),
      });
      // onAuthStateChanged will handle setting the session and userType
    } catch (error: any) {
        setIsLoading(false);
        console.error("Firebase Sign Up Error:", error.message);
        throw error;
    }
  };

  const signOutUser = async () => {
    setIsLoading(true);
    try {
      const authInst = await getAuthInstance();
      if (authInst && typeof authInst.signOut === 'function') {
        await authInst.signOut();
      } else {
        const { signOut: firebaseSignOut } = await import('firebase/auth');
        await firebaseSignOut(authInst);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Firebase Sign Out Error:", error.message);
      throw error;
    }
  };

  // Function to set user type and store it in Firestore
  const setUserType = async (type: 'patient' | 'doctor') => {
    if (session) {
      try {
        setIsLoading(true);
        await setDoc(doc(db, "users", session.uid), { role: type }, { merge: true });
        setUserTypeState(type);
        setIsLoading(false); // Reset loading after update
      } catch (error) {
        console.error("Error setting user type in Firestore:", error);
        setIsLoading(false); // Reset loading on error
        throw error;
      }
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    (async () => {
      const authInst = await getAuthInstance();
      if (!mounted) return;
      // shim provides onAuthStateChanged as a method; real SDK exposes a function.
      if (authInst && typeof authInst.onAuthStateChanged === 'function') {
        unsubscribe = authInst.onAuthStateChanged(async (user: any) => {
          setSession(user);
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserTypeState(userSnap.data().role || null);
            } else {
              setUserTypeState(null);
            }
          } else {
            setUserTypeState(null);
          }
          setIsLoading(false);
        });
      } else {
        const { onAuthStateChanged } = await import('firebase/auth');
        unsubscribe = onAuthStateChanged(authInst, async (user) => {
          setSession(user);
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserTypeState(userSnap.data().role || null);
            } else {
              setUserTypeState(null);
            }
          } else {
            setUserTypeState(null);
          }
          setIsLoading(false);
        });
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useProtectedRoute(session, isLoading, userType);

  const value = {
    signIn,
    signOut: signOutUser,
    signUp,
    session,
    isLoading,
    userType,
    setUserType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
