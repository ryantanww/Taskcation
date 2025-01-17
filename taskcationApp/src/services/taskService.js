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

export async function createTask(db, taskData) {

    if (!taskData.task_name || typeof taskData.task_name !== 'string' || !taskData.task_name.trim()) {
        throw new Error('task_name is required (non-empty string)');
    }
    if (!taskData.created_by || typeof taskData.created_by !== 'string') {
        throw new Error('created_by user doc ID is required (string)');
    }
    if (!taskData.start_date) {
        throw new Error('start_date is required (timestamp)');
    }
    if (!taskData.end_date) {
        throw new Error('end_date is required (timestamp)');
    }
    if (taskData.duration === undefined || !Number.isInteger(taskData.duration)) {
        throw new Error('duration is required (integer)');
    }
    if (taskData.group_id === undefined || typeof taskData.group_id !== 'string') {
        throw new Error('group_id is required (string)');
    }
    if (taskData.priority_id === undefined || typeof taskData.priority_id !== 'string') {
        throw new Error('priority_id is required (string)');
    }
    if (taskData.status === undefined || typeof taskData.status !== 'boolean') {
        throw new Error('status is required (boolean)');
    }

    if (taskData.time !== undefined && !Array.isArray(taskData.time)) {
        throw new Error('time_ids must be an array of strings if provided');
    }
    if (taskData.attachments !== undefined && !Array.isArray(taskData.attachments)) {
        throw new Error('attachments must be an array of string IDs if provided');
    }
    if (taskData.subtasks !== undefined && !Array.isArray(taskData.subtasks)) {
        throw new Error('sub_tasks must be an array of objects if provided');
    }

    const docData = {
        task_name: taskData.task_name.trim(),
        created_by: taskData.created_by,
        start_date: taskData.start_date,
        end_date: taskData.end_date,
        duration: taskData.duration,
        task_notes: taskData.task_notes || null,
        group_id: taskData.group_id,
        priority_id: taskData.priority_id,
        status: taskData.status,
        time: Array.isArray(taskData.time) ? taskData.time : [],
        attachments: Array.isArray(taskData.attachments) ? taskData.attachments : [],
        subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'Tasks'), docData);
    return docRef.id;
}

export async function getTaskById(db, taskId) {
    const snap = await getDoc(doc(db, 'Tasks', taskId));
    return snap.exists() ? snap.data() : null;
}

export async function updateTask(db, taskId, updatedData) {

    if (updatedData.task_name !== undefined) {
        if (
            typeof updatedData.task_name !== 'string' ||
            !updatedData.task_name.trim()
        ) {
            throw new Error('task_name must be a non-empty string if provided.');
        }
    }

    if (updatedData.created_by !== undefined) {
        throw new Error('Cannot change created_by once set.');
    }

    if (updatedData.start_date !== undefined && !updatedData.start_date) {
        throw new Error('start_date cannot be null if provided (or must be a valid timestamp).');
    }

    if (updatedData.end_date !== undefined && !updatedData.end_date) {
        throw new Error('end_date cannot be null if provided.');
    }

    if (updatedData.duration !== undefined) {
        if (!Number.isInteger(updatedData.duration)) {
            throw new Error('duration must be an integer if provided.');
        }
    }

    if (updatedData.group_id !== undefined) {
        if (typeof updatedData.group_id !== 'string') {
            throw new Error('group_id must be a string if provided.');
        }
    }

    if (updatedData.priority_id !== undefined) {
        if (typeof updatedData.priority_id !== 'string') {
            throw new Error('priority_id must be a string if provided.');
        }
    }

    if (updatedData.status !== undefined) {
        if (typeof updatedData.status !== 'boolean') {
            throw new Error('status must be a boolean if provided.');
        }
    }

    if (updatedData.time !== undefined && !Array.isArray(updatedData.time)) {
        throw new Error('time_ids must be an array of strings if provided');
    }
    if (updatedData.attachments !== undefined && !Array.isArray(updatedData.attachments)) {
        throw new Error('attachments must be an array of string IDs if provided');
    }
    if (updatedData.subtasks !== undefined && !Array.isArray(updatedData.subtasks)) {
        throw new Error('sub_tasks must be an array of objects if provided');
    }

    await updateDoc(doc(db, 'Tasks', taskId), {
        ...updatedData,
        updated_at: serverTimestamp(),
    });
}

export async function deleteTask(db, taskId) {
    await deleteDoc(doc(db, 'Tasks', taskId));
}

export async function getTasksByCreator(db, userId) {
    const q = query(collection(db, 'Tasks'), where('created_by', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
