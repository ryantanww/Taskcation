// Import Firestore functions from Firebase
import {
    collection,
    doc,
    addDoc,
    query,
    where,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';


// Function to create a new subtask in Firestore
export async function createSubtask(db, subtaskData) {
    // Validate whether subtask_name exists or is a non-empty string after trimming
    if (!subtaskData.subtask_name || typeof subtaskData.subtask_name !== 'string' || !subtaskData.subtask_name.trim()) {
        throw new Error('subtask_name is required (non-empty string).');
    }

    // Validate whether task_id exists or is a non-empty string
    if (!subtaskData.task_id || typeof subtaskData.task_id !== 'string') {
        throw new Error('task_id is required (string).');
    }

    // Validate whether created_by exists or is a non-empty string, basically the user's doc ID
    if (!subtaskData.created_by || typeof subtaskData.created_by !== 'string') {
        throw new Error('created_by user doc ID is required (string).');
    }

    // Validate whether start_date exists
    if (!subtaskData.start_date) {
        throw new Error('start_date is required (timestamp).');
    }
    // Validate whether end_date exists
    if (!subtaskData.end_date) {
        throw new Error('end_date is required (timestamp).');
    }
    // Validate whether duration exists or is an integer
    if (subtaskData.duration === undefined || !Number.isInteger(subtaskData.duration)) {
        throw new Error('duration is required (integer).');
    }

    // Validate whether status exists or is boolean
    if (subtaskData.status === undefined || typeof subtaskData.status !== 'boolean') {
        throw new Error('status is required (boolean).');
    }

    // Create the subtask data to store in Firestore
    const docData = {
        subtask_name: subtaskData.subtask_name.trim(),
        task_id: subtaskData.task_id,
        task_name: subtaskData.task_name,
        created_by: subtaskData.created_by,
        start_date: subtaskData.start_date,
        end_date: subtaskData.end_date,
        duration: subtaskData.duration,
        subtask_notes: subtaskData.subtask_notes,
        priority_id: subtaskData.priority_id,
        status: subtaskData.status,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    // Add the subtask document to the Subtasks collection in Firestore
    const docRef = await addDoc(collection(db, 'Subtasks'), docData);

    // Return the newly created document's ID
    return docRef.id;
}

// Function to retrieve a subtask based on its ID
export async function getSubtaskByID(db, subtaskID) {
    // Retrieve the specific subtask document from Firestore based on the subtask ID provided
    const snap = await getDoc(doc(db, 'Subtasks', subtaskID));

    // If the document exists, return the subtask or else return null
    return snap.exists() ? snap.data() : null;
}

// Function to update an existing subtask in Firestore
export async function updateSubtask(db, subtaskID, updatedData) {
    // Validate whether subtask_name is a non-empty string after trimming if provided
    if (updatedData.subtask_name !== undefined) {
        if (typeof updatedData.subtask_name !== 'string' || !updatedData.subtask_name.trim()) {
            throw new Error('subtask_name must be a non-empty string if provided.');
        }
    }

    // Prevent updating created_by field
    if (updatedData.created_by !== undefined) {
        throw new Error('Cannot change created_by once set.');
    }

    // Validate whether start_date is provided
    if (updatedData.start_date !== undefined && !updatedData.start_date) {
        throw new Error('start_date cannot be null if provided.');
    }

    // Validate whether end_date is provided
    if (updatedData.end_date !== undefined && !updatedData.end_date) {
        throw new Error('end_date cannot be null if provided.');
    }

    // Validate whether duration is an integer if provided
    if (updatedData.duration !== undefined && !Number.isInteger(updatedData.duration)) {
        throw new Error('duration must be an integer if provided.');
    }
   // Validate whether priority_id is a non-empty string if provided
    if (updatedData.priority_id !== undefined && typeof updatedData.priority_id !== 'string') {
        throw new Error('priority_id must be a non-empty string if provided.');
    }

    // Validate whether status is boolean if provided
    if (updatedData.status !== undefined && typeof updatedData.status !== 'boolean') {
        throw new Error('status must be a boolean if provided.');
    }

    // Reference the subtask based on the subtask ID provided
    const docRef = doc(db, 'Subtasks', subtaskID);

    // Update the referenced document with the new data
    await updateDoc(docRef, {
        ...updatedData,
        updated_at: serverTimestamp(),
    });
}

// Function to delete a subtask and all its related data such as attachments and time records
export async function deleteSubtask(db, subtaskID) {
    try {
        // Create a Firestore query to filter attachments by subtask_id
        const attachmentQuery = query(collection(db, 'Attachments'), where('subtask_id', '==', subtaskID));
        // Execute the query and get the corresponding attachments
        const attachmentSnapshots = await getDocs(attachmentQuery);

        // Map over the document snapshots and return an array of attachments to be deleted
        const attachmentDeletions = attachmentSnapshots.docs.map(attachmentDoc => 
            deleteDoc(doc(db, 'Attachments', attachmentDoc.id))
        );
        // Delete all attachments linked to the subtask
        await Promise.all(attachmentDeletions);

        // Create a Firestore query to filter time records by subtask_id
        const timeQuery = query(collection(db, 'TimeTracking'), where('subtask_id', '==', subtaskID));
        // Execute the query and get the corresponding time records
        const timeSnapshots = await getDocs(timeQuery);
        
        // Map over the document snapshots and return an array of time records to be deleted
        const timeDeletions = timeSnapshots.docs.map(timeDoc => 
            deleteDoc(doc(db, 'TimeTracking', timeDoc.id))
        );
        // Delete all time records linked to the subtask
        await Promise.all(timeDeletions);

        // Finally delete the subtask document based on subtask_id
        await deleteDoc(doc(db, 'Subtasks', subtaskID));

    } catch (error) {
        // Log any errors when deleting subtask and its related data
        console.error('Error deleting subtask and its related data:', error);
        // Throw an error if deleting subtask and its related data fails
        throw new Error('Failed to delete subtask and its related data.');
    }
    
}

// Function to mark all subtasks as complete for a certain task based on task ID
export const markAllSubtasksComplete = async (db, taskID, status = true) => {
    // Create a Firestore query to filter subtasks by task_id
    const q = query(collection(db, 'Subtasks'), where('task_id', '==', taskID));
    // Execute the query and get the corresponding subtasks
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of subtasks based on task_id to mark as complete
    const batchUpdates = snap.docs.map(async (docSnap) => {
        await updateDoc(docSnap.ref, { status });
    });

    // Update the statuses of all subtasks in that task to true
    await Promise.all(batchUpdates);
};

// Function to retrieve all subtasks for a certain task based on task ID
export async function getSubtasksByTaskID(db, taskID) {
    // Create a Firestore query to filter subtasks by task_id
    const q = query(collection(db, 'Subtasks'), where('task_id', '==', taskID));
    // Execute the query and get the corresponding subtasks
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of subtasks based on task_id or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

// Function to retrieve all subtasks linked to a user (creator)
export async function getSubtasksByCreator(db, userID) {
    // Create a Firestore query to filter subtasks by created_by
    const q = query(collection(db, 'Subtasks'), where('created_by', '==', userID));
    // Execute the query and get the corresponding tasks
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of subtasks based on task_id or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

