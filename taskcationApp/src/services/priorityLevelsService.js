// Import Firestore functions from Firebase
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';


// Function to retrieve all priorities
export async function getAllPriorities(db) {
    // Fetch all documents from the PriorityLevels collection
    const snap = await getDocs(collection(db, 'PriorityLevels'));

    // Map over the document snapshots and return an array of priorities
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

// Function to retrieve a priority based on its ID
export async function getPriorityByID(db, priorityID) {
    // Retrieve the specific priority document from Firestore based on the priority ID provided
    const docSnap = await getDoc(doc(db, 'PriorityLevels', priorityID));

    // If the document exists, return the priority or else return null
    return docSnap.exists() ? docSnap.data() : null;
}
