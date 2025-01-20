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


export async function getAttachmentById(db, attachmentID) {
    const DocSnap = await getDoc(doc(db, 'Attachments', attachmentID));
    return docSnap.exists() ? docSnap.data() : null;
}


export async function deleteAttachment(db, attachmentID) {
    await deleteDoc(doc(db, 'Attachments', attachmentID));
}

export async function getAttachmentsByTaskId(db, taskID) {
    const q = query(collection(db, 'Attachments'), where('task_id', '==', taskID));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

export async function getAttachmentsByTaskId(db, subTaskID) {
    const q = query(collection(db, 'Attachments'), where('subtask_id', '==', subTaskID));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}