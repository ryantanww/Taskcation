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


export async function createAttachment(db, attachmentData) {
    const docRef = await addDoc(collection(db, 'Attachments'), {
        task_id:      attachmentData.task_id      ?? '',
        sub_task_id:  attachmentData.sub_task_id  ?? '',
        file_name:    attachmentData.file_name    ?? '',
        file_type:    attachmentData.file_type    ?? '',
        uri:          attachmentData.uri          ?? '',
        size:         Number.isInteger(attachmentData.size) ? attachmentData.size : 0,
        uploaded_at:  serverTimestamp(),
    });
    return docRef.id;
}


export async function getAttachmentById(db, attachmentId) {
    const docSnap = await getDoc(doc(db, 'Attachments', attachmentId));
    return docSnap.exists() ? docSnap.data() : null;
}


export async function deleteAttachment(db, attachmentId) {
    await deleteDoc(doc(db, 'Attachments', attachmentId));
}

export async function getAttachmentsByTaskId(db, taskId) {
    const q = query(collection(db, 'Attachments'), where('task_id', '==', taskId));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

export async function getAttachmentsByTaskId(db, subTaskId) {
    const q = query(collection(db, 'Attachments'), where('subtask_id', '==', subTaskId));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}