import {
    collection,
    doc,
    addDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';


export async function createSubTask(db, subtaskData) {

    if (!subtaskData.subtask_name || typeof subtaskData.subtask_name !== 'string' || !subtaskData.subtask_name.trim()) {
        throw new Error('subtask_name is required (non-empty string).');
    }

    if (!subtaskData.task_id || typeof subtaskData.task_id !== 'string') {
        throw new Error('task_id is required (string).');
    }

    if (!subtaskData.created_by || typeof subtaskData.created_by !== 'string') {
        throw new Error('created_by user doc ID is required (string).');
    }

    if (!subtaskData.start_date) {
        throw new Error('start_date is required (timestamp).');
    }
    if (!subtaskData.end_date) {
        throw new Error('end_date is required (timestamp).');
    }
    if (subtaskData.duration === undefined || !Number.isInteger(subtaskData.duration)) {
        throw new Error('duration is required (integer).');
    }
    if (subtaskData.priority_id === undefined || typeof subtaskData.priority_id !== 'string') {
        throw new Error('priority_id is required (string).');
    }
    if (subtaskData.status === undefined || typeof subtaskData.status !== 'boolean') {
        throw new Error('status is required (boolean).');
    }

    if (subtaskData.time_ids !== undefined && !Array.isArray(subtaskData.time_ids)) {
        throw new Error('time_ids must be an array of strings if provided');
    }

    if (subtaskData.attachments !== undefined && !Array.isArray(subtaskData.attachments)) {
        throw new Error('attachments must be an array of strings if provided.');
    }

    const docData = {
        subtask_name: subtaskData.subtask_name.trim(),
        task_id: subtaskData.task_id,
        created_by: subtaskData.created_by,
        start_date: subtaskData.start_date,
        end_date: subtaskData.end_date,
        duration: subtaskData.duration,
        task_notes: subtaskData.task_notes,
        priority_id: subtaskData.priority_id,
        status: subtaskData.status,
        time_ids: Array.isArray(subtaskData.time_ids) ? subtaskData.time_ids : [],
        attachments: Array.isArray(subtaskData.attachments) ? subtaskData.attachments : [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'SubTasks'), docData);
    return docRef.id;
}

export async function getSubTaskById(db, subTaskID) {
    const snap = await getDoc(doc(db, 'SubTasks', subTaskID));
    return snap.exists() ? snap.data() : null;
}

export async function updateSubTask(db, subTaskID, updatedData) {

    if (updatedData.subtask_name !== undefined) {
        if (
            typeof updatedData.subtask_name !== 'string' ||
            !updatedData.subtask_name.trim()
        ) {
        throw new Error('subtask_name must be a non-empty string if provided.');
        }
    }

    if (updatedData.created_by !== undefined) {
        throw new Error('Cannot change created_by once set.');
    }

    if (updatedData.start_date !== undefined && !updatedData.start_date) {
        throw new Error('start_date cannot be null if provided.');
    }
    if (updatedData.end_date !== undefined && !updatedData.end_date) {
        throw new Error('end_date cannot be null if provided.');
    }
    if (updatedData.duration !== undefined) {
        if (!Number.isInteger(updatedData.duration)) {
        throw new Error('duration must be an integer if provided.');
        }
    }
    if (updatedData.priority_id !== undefined) {
        if (typeof updatedData.priority_id !== 'string') {
        throw new Error('priority_id must be a string if provided.');
        }
    }
    if (updatedData.status !== undefined && typeof updatedData.status !== 'boolean') {
        throw new Error('status must be boolean if provided.');
    }

    if (updatedData.time_ids !== undefined && !Array.isArray(updatedData.time_ids)) {
        throw new Error('time_ids must be an array of strings if provided');
    }

    if (updatedData.attachments !== undefined && !Array.isArray(updatedData.attachments)) {
        throw new Error('attachments must be an array of strings if provided.');
    }

    await updateDoc(doc(db, 'SubTasks', subTaskID), {
        ...updatedData,
        updated_at: serverTimestamp(),
    });
}

export async function deleteSubTask(db, subTaskID) {
    await deleteDoc(doc(db, 'SubTasks', subTaskID));
}