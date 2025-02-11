import {
    collection,
    doc,
    addDoc,
    getDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export async function createTimeRecord(db, timeData) {
    if (timeData.duration === undefined || !Number.isInteger(timeData.duration)) {
        throw new Error('duration is required (integer)');
    }

    const docRef = await addDoc(collection(db, 'TimeTracking'), {
        task_id:     timeData.task_id     ?? '',
        subtask_id: timeData.subtask_id ?? '',
        duration:    timeData.duration ?? 0,
        created_at:  serverTimestamp(),
    });
    return docRef.id;
}

export async function getTimeRecordByID(db, timeID) {
    const docSnap = await getDoc(doc(db, 'TimeTracking', timeID));
    return docSnap.exists() ? docSnap.data() : null;
}

export async function deleteTimeRecord(db, timeID) {
    await deleteDoc(doc(db, 'TimeTracking', timeID));
}

export async function getTimeRecordsByTask(db, taskID) {
    const q = query(collection(db, 'TimeTracking'), where('task_id', '==', taskID));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

export async function getTimeRecordsBySubtask(db, subtaskID) {
    const q = query(collection(db, 'TimeTracking'), where('subtask_id', '==', subtaskID));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
