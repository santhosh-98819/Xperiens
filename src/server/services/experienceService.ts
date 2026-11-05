import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Experience } from '../../types';

const COLLECTION = 'experiences';

export async function fetchAllExperiences(): Promise<Experience[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience));
}

export async function addExperience(exp: Experience): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), exp);
  return docRef.id;
}

export async function deleteExperience(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
