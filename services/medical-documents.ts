import { db, collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, orderBy, serverTimestamp } from '../utils/firebaseConfig';

export interface MedicalDocument {
  id?: string;
  patientId: string;
  doctorId: string;
  title: string;
  type: 'lab_result' | 'prescription' | 'imaging' | 'note';
  url: string;          // URL to the document in your chosen storage service
  contentType: string;  // MIME type (e.g., 'application/pdf', 'image/jpeg')
  createdAt?: any;     // Firestore timestamp
  metadata?: {
    size?: number;
    originalName?: string;
    [key: string]: any;
  };
}

const documentsCol = collection(db, 'medicalDocuments');

export async function addMedicalDocument(document: MedicalDocument) {
  try {
    // Note: URL should be obtained from your chosen storage service
    // before calling this function
    const docRef = doc(documentsCol);
    await setDoc(docRef, {
      ...document,
      id: docRef.id,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...document };
  } catch (err) {
    console.error('Error adding medical document:', err);
    throw err;
  }
}

export async function getPatientDocuments(patientId: string) {
  try {
    const q = query(
      documentsCol,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem: any) => ({ id: docItem.id, ...docItem.data() }));
  } catch (err) {
    console.error('Error getting patient documents:', err);
    throw err;
  }
}

export async function getDoctorDocuments(doctorId: string) {
  try {
    const q = query(
      documentsCol,
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem: any) => ({ id: docItem.id, ...docItem.data() }));
  } catch (err) {
    console.error('Error getting doctor documents:', err);
    throw err;
  }
}

export async function updateDocumentMetadata(
  documentId: string,
  metadata: Partial<MedicalDocument>
) {
  try {
    const docRef = doc(documentsCol, documentId);
    await updateDoc(docRef, {
      ...metadata,
      updatedAt: serverTimestamp(),
    });
    return await getDoc(docRef);
  } catch (err) {
    console.error('Error updating document metadata:', err);
    throw err;
  }
}