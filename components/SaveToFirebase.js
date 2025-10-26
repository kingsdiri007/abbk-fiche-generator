
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { storage, db } from '../firebase/config';

export async function saveFicheToFirebase(pdfBlob, ficheData, editableFields) {
  const filename = `fiches/${Date.now()}.pdf`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, pdfBlob);
  const url = await getDownloadURL(storageRef);

  const doc = await addDoc(collection(db, 'fiches'), {
    ficheData,
    editableFields,
    pdfUrl: url,
    createdAt: new Date().toISOString()
  });
  return { id: doc.id, url };
}
