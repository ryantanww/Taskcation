import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function getAllGrades(db) {
    const snap = await getDocs(collection(db, 'Grades'));
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

export async function getGradeByID(db, gradeID) {
    const docSnap = await getDoc(doc(db, 'Grades', gradeID));
    return docSnap.exists() ? docSnap.data() : null;
}
