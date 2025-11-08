import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword } from 'firebase/auth'; // Added createUserWithEmailAndPassword
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Added setDoc
import { db } from '../utils/firebaseConfig';

interface AuthContextType {
  signIn: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email?: string, password?: string, role?: 'patient' | 'doctor') => Promise<void>; // Added signUp
  session?: User | null;
  isLoading: boolean;
  userType?: string | null;
  setUserType: (type: 'patient' | 'doctor') => Promise<void>; // setUserType now returns a Promise
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
                    router.replace('/(patient)/');
                } else if (userType === 'doctor') {
                    router.replace('/(doctor)/');
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
  const auth = getAuth();

  const signIn = async (email?: string, password?: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required for sign in.");
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
    return () => unsubscribe();
  }, [auth]);

  useProtectedRoute(session, isLoading, userType);

  const value = {
    signIn,
    signOut,
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
