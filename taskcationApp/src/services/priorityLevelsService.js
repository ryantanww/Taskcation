import { collection, getDocs, doc, getDoc } from 'firebase/firestore';


export async function getAllPriorities(db) {
    const snap = await getDocs(collection(db, 'PriorityLevels'));
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

export async function getPriorityByID(db, priorityID) {
    const docSnap = await getDoc(doc(db, 'PriorityLevels', priorityID));
    return docSnap.exists() ? docSnap.data() : null;
}
