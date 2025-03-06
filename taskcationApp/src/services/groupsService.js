// Import Firestore functions from Firebase
import {
    collection,
    doc,
    addDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

// Function to create a new group in Firestore
export async function createGroup(db, groupData) {
    // Validate whether group_name exists or is a non-empty string after trimming
    if (!groupData.group_name || typeof groupData.group_name !== 'string' || !groupData.group_name.trim()) {
        throw new Error('group_name is required (non-empty string)');
    }
    
    // Validate whether created_by exists or is a non-empty string, basically the user's doc ID
    if (!groupData.created_by || typeof groupData.created_by !== 'string') {
        throw new Error('created_by user doc ID is required (string)');
    }

    // Ensure that group_type is either Categories or Subjects
    const groupTypes = ['Categories', 'Subjects'];
    if (!groupData.group_type || !groupTypes.includes(groupData.group_type)) {
        throw new Error(`Invalid group_type. Must be one of: ${groupTypes.join(', ')}`);
    }

    // Create a new document in the Groups collection with the validated data
    const docRef = await addDoc(collection(db, 'Groups'), {
        group_name: groupData.group_name.trim(),
        created_by: groupData.created_by,
        group_type: groupData.group_type,
        grade_id:   groupData.grade_id  ?? 'NA',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });

    // Return the newly created document's ID
    return docRef.id;
}

// Function to retrieve a group based on its ID
export async function getGroupByID(db, groupID) {
    // Retrieve the specific group document from Firestore based on the group ID provided
    const docSnap = await getDoc(doc(db, 'Groups', groupID));

    // If the document exists, return the group or else return null
    return docSnap.exists() ? docSnap.data() : null;
}

// Function to update an existing group in Firestore
export async function updateGroup(db, groupID, updatedData) {
    // Reference the group based on the group ID provided
    const docRef = doc(db, 'Groups', groupID);

    // Update the referenced document with the new data
    await updateDoc(docRef, {
        ...updatedData,
        updated_at: serverTimestamp()
    });
}

// Function to delete a group based on its ID
export async function deleteGroup(db, groupID) {
    // Delete the document from Firestore based on the group's ID
    await deleteDoc(doc(db, 'Groups', groupID));
}


// Function to retrieve all groups linked to a user (creator)
export async function getGroupsByCreator(db, userID) {
    // Create a Firestore query to filter groups by created_by
    const q = query(collection(db, 'Groups'), where('created_by', '==', userID)); 

    // Execute the query and get the corresponding groups
    const snap = await getDocs(q);

    // Map over the document snapshots and return an array of groups based on created_by or an empty array
    return snap.empty ? [] : snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}
