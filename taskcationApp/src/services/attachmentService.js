// Import Firestore functions from Firebase
import {
    collection,
    doc,
    addDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

// Function to create a new attachment in Firestore
export async function createAttachment(db, attachmentData) {
    // Validate whether file_name exists or is a non-empty string
    if (!attachmentData.file_name || typeof attachmentData.file_name !== 'string') {
        throw new Error('file_name is required (non-empty string).');
    }

    // Validate whether file_type exists or is a non-empty string
    if (!attachmentData.file_type || typeof attachmentData.file_type !== 'string') {
        throw new Error('file_type is required (non-empty string).');
    }

    // Validate whether uri exists or is a non-empty string
    if (!attachmentData.uri || typeof attachmentData.uri !== 'string') {
        throw new Error('uri is required (non-empty string).');
    }
    
    // Validate whether size is an integer if provided
    if (attachmentData.size !== undefined && !Number.isInteger(attachmentData.size)) {
        throw new Error('size must be an integer if provided.');
    }
    
    // Create the attachment data to store in Firestore
    const docData = {
        task_id:      attachmentData.task_id      ?? '',
        subtask_id:   attachmentData.subtask_id  ?? '',
        created_by:   attachmentData.created_by,
        file_name:    attachmentData.file_name    ?? '',
        file_type:    attachmentData.file_type    ?? '',
        uri:          attachmentData.uri          ?? '',
        size:         Number.isInteger(attachmentData.size) ? attachmentData.size : 0,
        uploaded_at:  serverTimestamp(),
    };

    // If the attachment has durationMillis, add it to docData
    if (attachmentData.durationMillis) {
        docData.durationMillis = attachmentData.durationMillis;
    }

    // Add the attachment document to the Attachments collection in Firestore
    const docRef = await addDoc(collection(db, 'Attachments'), docData);

    // Return the newly created document's ID
    return docRef.id;
}

// Function to delete an attachment based on its ID
export async function deleteAttachment(db, attachmentID) {
    // Delete the document from Firestore based on the attachment's ID
    await deleteDoc(doc(db, 'Attachments', attachmentID));
}

// Function to retrieve all attachments linked to a task
export async function getAttachmentsByTaskID(db, taskID) {
    // Create a Firestore query to filter attachments by task_id
    const q = query(collection(db, 'Attachments'), where('task_id', '==', taskID));

    // Execute the query and get the corresponding attachments
    const snap = await getDocs(q);
    
    // Map over the document snapshots and return an array of attachments based on task_id or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

// Function to retrieve all attachments linked to a subtask
export async function getAttachmentsBySubtaskID(db, subtaskID) {
    // Create a Firestore query to filter attachments by subtask_id
    const q = query(collection(db, 'Attachments'), where('subtask_id', '==', subtaskID));

    // Execute the query and get the corresponding attachments
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of attachments based on subtask_id or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}