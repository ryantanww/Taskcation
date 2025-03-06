// Import Firestore functions from Firebase
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
    serverTimestamp,
} from 'firebase/firestore';

// Function to create a new task in Firestore
export async function createTask(db, taskData) {
    // Validate whether task_name exists or is a non-empty string after trimming
    if (!taskData.task_name || typeof taskData.task_name !== 'string' || !taskData.task_name.trim()) {
        throw new Error('task_name is required (non-empty string)');
    }

    // Validate whether created_by exists or is a non-empty string, basically the user's doc ID
    if (!taskData.created_by || typeof taskData.created_by !== 'string') {
        throw new Error('created_by user doc ID is required (non-empty string)');
    }

    // Validate whether start_date exists
    if (!taskData.start_date) {
        throw new Error('start_date is required (timestamp)');
    }

    // Validate whether end_date exists
    if (!taskData.end_date) {
        throw new Error('end_date is required (timestamp)');
    }

    // Validate whether duration exists or is an integer
    if (taskData.duration === undefined || !Number.isInteger(taskData.duration)) {
        throw new Error('duration is required (integer)');
    }

    // Validate whether group_id exists or is a non-empty string
    if (taskData.group_id === undefined || typeof taskData.group_id !== 'string') {
        throw new Error('group_id is required (non-empty string)');
    }

    // Validate whether status exists or is boolean
    if (taskData.status === undefined || typeof taskData.status !== 'boolean') {
        throw new Error('status is required (boolean)');
    }

    // Create the task data to store in Firestore
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
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    // Add the task document to the Tasks collection in Firestore
    const docRef = await addDoc(collection(db, 'Tasks'), docData);

    // Return the newly created document's ID
    return docRef.id;
}

// Function to retrieve a task based on its ID
export async function getTaskByID(db, taskID) {
    // Retrieve the specific task document from Firestore based on the task ID provided
    const snap = await getDoc(doc(db, 'Tasks', taskID));

    // If the document exists, return the task or else return null
    return snap.exists() ? snap.data() : null;
}

// Function to update an existing task in Firestore
export async function updateTask(db, taskID, updatedData) {
    // Validate whether task_name is a non-empty string after trimming if provided
    if (updatedData.task_name !== undefined) {
        if (typeof updatedData.task_name !== 'string' || !updatedData.task_name.trim()) {
            throw new Error('task_name must be a non-empty string if provided.');
        }
    }

    // Prevent updating created_by field
    if (updatedData.created_by !== undefined) {
        throw new Error('Cannot change created_by once set.');
    }

    // Validate whether start_date is provided
    if (updatedData.start_date !== undefined && !updatedData.start_date) {
        throw new Error('start_date cannot be null if provided (or must be a valid timestamp).');
    }

    // Validate whether end_date is provided
    if (updatedData.end_date !== undefined && !updatedData.end_date) {
        throw new Error('end_date cannot be null if provided (or must be a valid timestamp).');
    }

    // Validate whether duration is an integer if provided
    if (updatedData.duration !== undefined && !Number.isInteger(updatedData.duration)) {
        throw new Error('duration must be an integer if provided.');
    }

    // Validate whether group_id is a non-empty string if provided
    if (updatedData.group_id !== undefined && typeof updatedData.group_id !== 'string') {
        throw new Error('group_id must be a non-empty string if provided.');
    }

    // Validate whether priority_id is a non-empty string if provided
    if (updatedData.priority_id !== undefined && typeof updatedData.priority_id !== 'string') {
        throw new Error('priority_id must be a non-empty string if provided.');
    }

    // Validate whether status is boolean if provided
    if (updatedData.status !== undefined && typeof updatedData.status !== 'boolean') {
        throw new Error('status must be a boolean if provided.');
    }

    // Reference the task based on the task ID provided
    const docRef = doc(db, 'Tasks', taskID);

    // Update the referenced document with the new data
    await updateDoc(docRef, {
        ...updatedData,
        updated_at: serverTimestamp(),
    });
}

// Function to delete a task and all its related data such as subtasks and attachments
export async function deleteTask(db, taskID) {
    try {
        // Create a Firestore query to filter subtasks by task_id
        const subtaskQuery = query(collection(db, 'Subtasks'), where('task_id', '==', taskID));
        // Execute the query and get the corresponding subtasks
        const subtaskSnapshots = await getDocs(subtaskQuery);

        // Map over the document snapshots and return an array of subtasks to be deleted
        const subtaskDeletions = subtaskSnapshots.docs.map(subtaskDoc => 
            deleteDoc(doc(db, 'Subtasks', subtaskDoc.id))
        );
        // Delete all subtasks linked to the task
        await Promise.all(subtaskDeletions);

        // Create a Firestore query to filter attachments by task_id
        const attachmentQuery = query(collection(db, 'Attachments'), where('task_id', '==', taskID));
        // Execute the query and get the corresponding attachments
        const attachmentSnapshots = await getDocs(attachmentQuery);

        // Map over the document snapshots and return an array of attachments to be deleted
        const attachmentDeletions = attachmentSnapshots.docs.map(attachmentDoc => 
            deleteDoc(doc(db, 'Attachments', attachmentDoc.id))
        );
        // Delete all attachments linked to the task
        await Promise.all(attachmentDeletions);

        // Finally delete the task document based on task_id
        await deleteDoc(doc(db, 'Tasks', taskID));

    } catch (error) {
        // Log any errors when deleting task and its related data
        console.error('Error deleting task and its related data:', error);
        // Throw an error if deleting task and its related data fails
        throw new Error('Failed to delete task and its related data.');
    }
}

// Function to retrieve all tasks linked to a user (creator)
export async function getTasksByCreator(db, userID) {
    // Create a Firestore query to filter tasks by created_by
    const q = query(collection(db, 'Tasks'), where('created_by', '==', userID));
    // Execute the query and get the corresponding tasks
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of tasks based on created_by or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

// Function to retrieve all tasks linked to a group
export async function getTasksByGroup(db, groupID) {
    // Create a Firestore query to filter tasks by group_id
    const q = query(collection(db, 'Tasks'), where('group_id', '==', groupID));
    // Execute the query and get the corresponding tasks
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of tasks based on created_by or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
