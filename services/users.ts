import { db, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from '../utils/firebaseConfig';
import type { AppUser } from '../types/user';

export async function createUserProfile(user: AppUser) {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
    });
    return await getUserProfile(user.id);
  } catch (err) {
    console.error('createUserProfile error', err);
    throw err;
  }
}

export async function getUserProfile(userId: string): Promise<AppUser | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as AppUser;
  } catch (err) {
    console.error('getUserProfile error', err);
    throw err;
  }
}

export async function updateUserProfile(userId: string, patch: Partial<AppUser>) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...patch,
      updatedAt: serverTimestamp(),
    } as any);
    return await getUserProfile(userId);
  } catch (err) {
    console.error('updateUserProfile error', err);
    throw err;
  }
}

// Real-time online status indicator
export function subscribeToUserStatus(userId: string, cb: (status: { online: boolean, lastActive?: string }) => void) {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snap: any) => {
    if (!snap.exists()) return cb({ online: false });
    const data = snap.data();
    cb({ online: data.status === 'online', lastActive: data.lastActive });
  });
}

export async function setUserOnlineStatus(userId: string, online: boolean) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    status: online ? 'online' : 'offline',
    lastActive: serverTimestamp(),
  });
}
