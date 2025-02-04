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


export async function createAttachment(db, attachmentData) {
    if (!attachmentData.task_id || typeof attachmentData.task_id !== 'string') {
        throw new Error('task_id is required (non-empty string).');
    }
    if (!attachmentData.file_name || typeof attachmentData.file_name !== 'string') {
        throw new Error('file_name is required (non-empty string).');
    }
    if (!attachmentData.file_type || typeof attachmentData.file_type !== 'string') {
        throw new Error('file_type is required (non-empty string).');
    }
    if (!attachmentData.uri || typeof attachmentData.uri !== 'string') {
        throw new Error('uri is required (non-empty string).');
    }
    if (attachmentData.size !== undefined && !Number.isInteger(attachmentData.size)) {
        throw new Error('size must be an integer if provided.');
    }
    
    const attachmentPayload = {
        task_id:      attachmentData.task_id      ?? '',
        subtask_id:  attachmentData.subtask_id  ?? '',
        file_name:    attachmentData.file_name    ?? '',
        file_type:    attachmentData.file_type    ?? '',
        uri:          attachmentData.uri          ?? '',
        size:         Number.isInteger(attachmentData.size) ? attachmentData.size : 0,
        uploaded_at:  serverTimestamp(),
    };

    // Include `duration` only if it's provided (e.g., for audio files)
    if (attachmentData.durationMillis) {
        attachmentPayload.durationMillis = attachmentData.durationMillis;
    }

    const docRef = await addDoc(collection(db, 'Attachments'), attachmentPayload);
    return docRef.id;
}


export async function getAttachmentByID(db, attachmentID) {
    const DocSnap = await getDoc(doc(db, 'Attachments', attachmentID));
    return docSnap.exists() ? docSnap.data() : null;
}


export async function deleteAttachment(db, attachmentID) {
    await deleteDoc(doc(db, 'Attachments', attachmentID));
}

export async function getAttachmentsByTaskID(db, taskID) {
    const q = query(collection(db, 'Attachments'), where('task_id', '==', taskID));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

export async function getAttachmentsBySubtaskID(db, subtaskID) {
    const q = query(collection(db, 'Attachments'), where('subtask_id', '==', subtaskID));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}