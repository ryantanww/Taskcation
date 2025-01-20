import {
    collection,
    doc,
    getDoc,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';

/**
 * CREATE a user (temporary or real)
 * If you want username uniqueness, you can check it here.
 */
export async function createUser(db, userData) {
    // e.g., userData = { username: 'temp_12345', is_temporary: true }
    if (!db) throw new Error("Firestore instance is not defined");
    // Check if you want to ensure 'username' unique across Users
    if (!userData.username) {
        throw new Error('username is required');
    }
    console.log('Firestore instance:', db);
    // Optionally check if username is taken:
    const q = query(collection(db, 'Users'), where('username', '==', userData.username));
    const snap = await getDocs(q);
    if (!snap.empty) {
        throw new Error(`Username "${userData.username}" already in use`);
    }

    // Create doc in 'Users' with random ID
    const docRef = await addDoc(collection(db, 'Users'), {
        username: userData.username,
        is_temporary: userData.is_temporary ?? false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });

    return docRef.id; // This is the user's doc ID
}

/**
 * GET user by doc ID
 */
export async function getUserById(db, userID) {
    const snap = await getDoc(doc(db, 'Users', userID));
    return snap.exists() ? snap.data() : null;
}


