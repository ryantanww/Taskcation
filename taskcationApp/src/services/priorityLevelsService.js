import { collection, getDocs } from 'firebase/firestore';


export async function getAllPriorities(db) {
    const snap = await getDocs(collection(db, 'PriorityLevels'));
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
