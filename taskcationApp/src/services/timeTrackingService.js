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

// Function to create a new time record in Firestore
export async function createTimeRecord(db, timeData) {
    // Validate whether duration exists or is an integer
    if (timeData.duration === undefined || !Number.isInteger(timeData.duration)) {
        throw new Error('duration is required (integer)');
    }

    // Create a new document in the TimeTracking collection with the validated data
    const docRef = await addDoc(collection(db, 'TimeTracking'), {
        task_id:     timeData.task_id     ?? '',
        subtask_id: timeData.subtask_id ?? '',
        duration:    timeData.duration ?? 0,
        created_at:  serverTimestamp(),
    });

    // Return the newly created document's ID
    return docRef.id;
}

// Function to delete a time record based on its ID
export async function deleteTimeRecord(db, timeID) {
    // Delete the document from Firestore based on the time record's ID
    await deleteDoc(doc(db, 'TimeTracking', timeID));
}

// Function to retrieve all time record for a certain task based on task ID
export async function getTimeRecordsByTask(db, taskID) {
    // Create a Firestore query to filter time record by task_id
    const q = query(collection(db, 'TimeTracking'), where('task_id', '==', taskID));
    // Execute the query and get the corresponding subtasks
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of time record based on task_id or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

// Function to retrieve all time record for a certain subtask based on subtask ID
export async function getTimeRecordsBySubtask(db, subtaskID) {
    // Create a Firestore query to filter time record by subtask_id
    const q = query(collection(db, 'TimeTracking'), where('subtask_id', '==', subtaskID));
    // Execute the query and get the corresponding time record
    const snap = await getDocs(q);
    
    // Map over the document snapshots and return an array of time record based on subtask_id or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
