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

    if (!groupData.group_name || typeof groupData.group_name !== 'string' || !groupData.group_name.trim()) {
        throw new Error('group_name is required (non-empty string)');
    }
    if (!groupData.created_by || typeof groupData.created_by !== 'string') {
        throw new Error('created_by user doc ID is required (string)');
    }

    const groupTypes = ['Categories', 'Subjects'];
    if (!groupData.group_type || !groupTypes.includes(groupData.group_type)) {
        throw new Error(`Invalid group_type. Must be one of: ${groupTypes.join(', ')}`);
    }

    const docRef = await addDoc(collection(db, 'Groups'), {
        group_name: groupData.group_name.trim(),
        created_by: groupData.created_by,
        group_type: groupData.group_type,
        grade_id:   groupData.grade_id   ?? 'N/A',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });
    return docRef.id;
}


export async function getGroupByID(db, groupID) {
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


export async function getGroupsByCreator(db, userId) {
    const groupsCollection = collection(db, 'Groups');
    const querySnapshot = await getDocs(groupsCollection);

    // Filter groups where created_by matches the user ID
    return querySnapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(group => group.created_by === userId);
}
