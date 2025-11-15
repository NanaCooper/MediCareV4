import { db, collection, query, where, orderBy, onSnapshot, getDocs } from '../utils/firebaseConfig';
import type { Conversation } from '../types/conversation';

export async function getConversationsForUser(userId: string) {
  try {
    const conversationsCol = collection(db, 'conversations');
    const q = query(conversationsCol, where('participants', 'array-contains', userId), orderBy('lastUpdated', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Conversation));
  } catch (err) {
    console.error('getConversationsForUser error', err);
    throw err;
  }
}

export function subscribeToConversations(userId: string, cb: (conversations: Conversation[]) => void) {
  const conversationsCol = collection(db, 'conversations');
  const q = query(conversationsCol, where('participants', 'array-contains', userId), orderBy('lastUpdated', 'desc'));
  return onSnapshot(q, (snap: any) => {
    const items = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Conversation));
    cb(items);
  });
}
