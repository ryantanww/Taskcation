// Import Firestore functions from Firebase
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';

// Function to create a new user in Firestore
export async function createUser(db, userData) {
    // Create a Firestore query to check if the username already exists
    const q = query(collection(db, 'Users'), where('username', '==', userData.username));

    // Execute the query
    const snap = await getDocs(q);
    // If a user with the same username exists, throw an error
    if (!snap.empty) {
        throw new Error(`Username '${userData.username}' already in use`);
    }

    // Create a new document in the Users collection with the user data
    const docRef = await addDoc(collection(db, 'Users'), {
        username: userData.username,
        is_temporary: userData.is_temporary ?? false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });

    // Return the newly created document's ID
    return docRef.id;
}
