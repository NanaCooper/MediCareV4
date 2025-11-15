import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, updateDoc, doc, arrayUnion, deleteField } from '../utils/firebaseConfig';
import type { Message } from '../types/message';

export async function sendMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) {
  try {
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const payload = {
      ...message,
      createdAt: serverTimestamp(),
    } as any;
    const ref = await addDoc(messagesCol, payload);
    return { id: ref.id, ...payload } as Message;
  } catch (err) {
    console.error('sendMessage error', err);
    throw err;
  }
}

export function subscribeToConversation(conversationId: string, cb: (messages: Message[]) => void) {
  const messagesCol = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap: any) => {
    const items = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Message));
    cb(items);
  });
}

export async function getConversationMessages(conversationId: string) {
  try {
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Message));
  } catch (err) {
    console.error('getConversationMessages error', err);
    throw err;
  }
}

// Mark all unread messages in a conversation as read by userId
export async function markConversationRead(conversationId: string, userId: string) {
  try {
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const snap = await getDocs(messagesCol);
    const updates: Promise<void>[] = [];
    snap.docs.forEach((d: any) => {
      const data = d.data() as any;
      const readBy: string[] = data.readBy || [];
      if (!readBy.includes(userId)) {
        const ref = doc(db, 'conversations', conversationId, 'messages', d.id);
        updates.push(updateDoc(ref, { readBy: arrayUnion(userId), readAt: serverTimestamp() }) as unknown as Promise<void>);
      }
    });
    await Promise.all(updates);
  } catch (err) {
    console.error('markConversationRead error', err);
    throw err;
  }
}

// Set or clear typing indicator on the conversation document (typing map: { [userId]: timestamp })
export async function setTyping(conversationId: string, userId: string, isTyping: boolean) {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    if (isTyping) {
      await updateDoc(convRef, { [`typing.${userId}`]: serverTimestamp() });
    } else {
      // remove the field
      await updateDoc(convRef, { [`typing.${userId}`]: deleteField() });
    }
  } catch (err) {
    console.error('setTyping error', err);
    throw err;
  }
}
