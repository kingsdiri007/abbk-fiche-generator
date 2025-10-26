
/*
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { storage, db } from '../firebase/config';
import { getPDFBlob } from './PdfGenerator';


export async function saveFicheToFirebase(formData) {
  try {
    // Generate PDF blob
    const pdfBlob = getPDFBlob(formData);

    // Upload PDF to Firebase Storage
    const timestamp = Date.now();
    const filename = `fiches/${timestamp}_${formData.software || 'fiche'}.pdf`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, pdfBlob);
    const pdfUrl = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, 'fiches'), {
      formData,
      pdfUrl,
      createdAt: new Date().toISOString(),
      software: formData.software,
      type: formData.type || formData.subType,
      certification: formData.certification,
      clientName: formData.clientName
    });

    return {
      id: docRef.id,
      url: pdfUrl,
      success: true
    };
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
}

/**
 * Get all saved fiches from Firestore
 */
export async function getAllFiches() {
  try {
    const q = query(collection(db, 'fiches'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching fiches:', error);
    throw error;
  }
}

/**
 * Delete a fiche from Firestore
 */
export async function deleteFiche(ficheId) {
  try {
    await deleteDoc(doc(db, 'fiches', ficheId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting fiche:', error);
    throw error;
  }
}

