import { collection, getDocs } from 'firebase/firestore';

export async function getAllGrades(db) {
    const snap = await getDocs(collection(db, 'Grades'));
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
