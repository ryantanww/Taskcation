import {
    collection,
    doc,
    addDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export async function createGroup(db, groupData) {
    const docRef = await addDoc(collection(db, 'Groups'), {
        group_name: groupData.group_name ?? '',
        group_type: groupData.group_type ?? '',
        grade_id:   groupData.grade_id   ?? '',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });
    return docRef.id;
}


export async function getGroupById(db, groupID) {
    const docSnap = await getDoc(doc(db, 'Groups', groupID));
    return docSnap.exists() ? docSnap.data() : null;
}


export async function updateGroup(db, groupID, updatedData) {
    const docRef = doc(db, 'Groups', groupID);
    await updateDoc(docRef, {
        ...updatedData,
        updated_at: serverTimestamp()
    });
}


export async function deleteGroup(db, groupID) {
    await deleteDoc(doc(db, 'Groups', groupID));
}


export async function getAllGroups(db) {
    const snap = await getDocs(collection(db, 'Groups'));
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
