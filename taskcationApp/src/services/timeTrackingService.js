import {
    collection,
    doc,
    addDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export async function createTimeRecord(db, data) {
    const docRef = await addDoc(collection(db, 'TimeTracking'), {
        task_id:     data.task_id     ?? '',
        sub_task_id: data.sub_task_id ?? '',
        start_time:  data.start_time  ?? null,
        end_time:    data.end_time    ?? null,
        duration:    Number.isInteger(data.duration) ? data.duration : 0,
        created_at:  serverTimestamp(),
    });
    return docRef.id;
}

export async function getTimeRecordById(db, timeId) {
    const docSnap = await getDoc(doc(db, 'TimeTracking', timeId));
    return docSnap.exists() ? docSnap.data() : null;
}

export async function deleteTimeRecord(db, timeId) {
    await deleteDoc(doc(db, 'TimeTracking', timeId));
}

export async function getTimeRecordsByTask(db, taskId) {
    const q = query(collection(db, 'TimeTracking'), where('task_id', '==', taskId));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
