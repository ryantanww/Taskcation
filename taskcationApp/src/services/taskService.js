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
        task_notes: taskData.task_notes || '',
        group_id: taskData.group_id,
        priority_id: taskData.priority_id || 'NA',
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

export async function getTaskByID(db, taskID) {
    const snap = await getDoc(doc(db, 'Tasks', taskID));
    return snap.exists() ? snap.data() : null;
}

export async function updateTask(db, taskID, updatedData) {

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

    await updateDoc(doc(db, 'Tasks', taskID), {
        ...updatedData,
        updated_at: serverTimestamp(),
    });
}

export async function deleteTask(db, taskID) {
    try {
        // 1️⃣ Delete subtasks related to the task
        const subtaskQuery = query(collection(db, 'Subtasks'), where('task_id', '==', taskID));
        const subtaskSnapshots = await getDocs(subtaskQuery);

        const subtaskDeletions = subtaskSnapshots.docs.map(subtaskDoc => 
            deleteDoc(doc(db, 'Subtasks', subtaskDoc.id))
        );
        await Promise.all(subtaskDeletions);
        console.log(`Deleted ${subtaskSnapshots.size} subtasks`);

        // 2️⃣ Delete attachments related to the task
        const attachmentQuery = query(collection(db, 'Attachments'), where('task_id', '==', taskID));
        const attachmentSnapshots = await getDocs(attachmentQuery);

        const attachmentDeletions = attachmentSnapshots.docs.map(attachmentDoc => 
            deleteDoc(doc(db, 'Attachments', attachmentDoc.id))
        );
        await Promise.all(attachmentDeletions);
        console.log(`Deleted ${attachmentSnapshots.size} attachments`);

        // 3️⃣ Delete the task itself
        await deleteDoc(doc(db, 'Tasks', taskID));
        console.log(`Task ${taskID} deleted successfully`);

    } catch (error) {
        console.error('Error deleting task and its dependencies:', error);
        throw new Error('Failed to delete task and its related data.');
    }
}

export async function getTasksByCreator(db, userID) {
    try {
        // Create a query to get tasks created by the user
        const q = query(collection(db, 'Tasks'), where('created_by', '==', userID));
        const snap = await getDocs(q);

        // If no documents exist, return null
        if (snap.empty) {
            return null;
        }

        // Map documents to task objects
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching tasks by creator:', error);
        throw error; // Optionally re-throw the error for higher-level handling
    }
}

export async function getTasksByGroup(db, groupID) {
    try {
        // Create a query to get tasks created by the user
        const q = query(collection(db, 'Tasks'), where('group_id', '==', groupID));
        const snap = await getDocs(q);

        // If no documents exist, return null
        if (snap.empty) {
            return null;
        }

        // Map documents to task objects
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching tasks by group:', error);
        throw error; // Optionally re-throw the error for higher-level handling
    }
}