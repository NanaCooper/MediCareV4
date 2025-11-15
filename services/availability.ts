import { db, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, onSnapshot, serverTimestamp } from '../utils/firebaseConfig';

export interface TimeSlot {
  id?: string;
  startAt: string; // ISO date/time
  endAt?: string;
  isBooked?: boolean;
  [key: string]: any;
}

export async function setAvailability(doctorId: string, dateIso: string, slots: TimeSlot[]) {
  try {
    const ref = doc(db, 'availability', doctorId, 'dates', dateIso);
    await setDoc(ref, {
      slots,
      updatedAt: serverTimestamp(),
    });
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('setAvailability error', err);
    throw err;
  }
}

export async function getAvailability(doctorId: string, dateIso: string) {
  try {
    const ref = doc(db, 'availability', doctorId, 'dates', dateIso);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (err) {
    console.error('getAvailability error', err);
    throw err;
  }
}

export async function updateAvailabilitySlot(doctorId: string, dateIso: string, patch: Partial<TimeSlot> & { id: string }) {
  try {
    const ref = doc(db, 'availability', doctorId, 'dates', dateIso);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('availability not found');
    const data: any = snap.data();
    const slots: TimeSlot[] = data.slots || [];
    const idx = slots.findIndex((s) => s.id === patch.id);
    if (idx === -1) throw new Error('slot not found');
    slots[idx] = { ...slots[idx], ...patch };
    await updateDoc(ref, { slots, updatedAt: serverTimestamp() } as any);
    return (await getDoc(ref)).data();
  } catch (err) {
    console.error('updateAvailabilitySlot error', err);
    throw err;
  }
}

export async function removeAvailability(doctorId: string, dateIso: string) {
  try {
    const ref = doc(db, 'availability', doctorId, 'dates', dateIso);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('removeAvailability error', err);
    throw err;
  }
}

export function subscribeToDoctorAvailability(doctorId: string, cb: (payload: any) => void) {
  const q = query(collection(db, 'availability', doctorId, 'dates'));
  return onSnapshot(q, (snap: any) => {
    const items = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
    cb(items);
  });
}
