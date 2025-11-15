import { db, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from '../utils/firebaseConfig';
import type { Appointment } from '../types/appointment';

const appointmentsCol = collection(db, 'appointments');

export async function createAppointment(appointment: Appointment) {
  try {
    const payload = {
      ...appointment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as any;
    const ref = await addDoc(appointmentsCol, payload);
    const snap = await getDoc(ref);
    return { id: snap.id, ...(snap.data() as any) } as Appointment;
  } catch (err) {
    console.error('createAppointment error', err);
    throw err;
  }
}

export async function getAppointment(appointmentId: string) {
  try {
    const ref = doc(db, 'appointments', appointmentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Appointment;
  } catch (err) {
    console.error('getAppointment error', err);
    throw err;
  }
}

export async function updateAppointment(appointmentId: string, patch: Partial<Appointment>) {
  try {
    const ref = doc(db, 'appointments', appointmentId);
    await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() } as any);
    return await getAppointment(appointmentId);
  } catch (err) {
    console.error('updateAppointment error', err);
    throw err;
  }
}

export async function deleteAppointment(appointmentId: string) {
  try {
    const ref = doc(db, 'appointments', appointmentId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('deleteAppointment error', err);
    throw err;
  }
}

export async function listAppointmentsByUser(userId: string, role: 'patient' | 'doctor') {
  try {
    const field = role === 'patient' ? 'patientId' : 'doctorId';
    const q = query(appointmentsCol, where(field, '==', userId), orderBy('startAt', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Appointment));
  } catch (err) {
    console.error('listAppointmentsByUser error', err);
    throw err;
  }
}

export function subscribeToAppointments(userId: string, role: 'patient' | 'doctor', cb: (appointments: Appointment[]) => void) {
  const field = role === 'patient' ? 'patientId' : 'doctorId';
  const q = query(appointmentsCol, where(field, '==', userId), orderBy('startAt', 'desc'));
  return onSnapshot(q, (snapshot: any) => {
    const items = snapshot.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) } as Appointment));
    cb(items);
  });
}
