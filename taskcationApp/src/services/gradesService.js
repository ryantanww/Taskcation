// Import Firestore functions from Firebase
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Function to retrieve all grades
export async function getAllGrades(db) {
    // Fetch all documents from the Grades collection
    const snap = await getDocs(collection(db, 'Grades'));

    // Map over the document snapshots and return an array of grades
    return snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
}

// Function to retrieve a grade based on its ID
export async function getGradeByID(db, gradeID) {
    // Retrieve the specific grade document from Firestore based on the grade ID provided
    const docSnap = await getDoc(doc(db, 'Grades', gradeID));

    // If the document exists, return the grade or else return null
    return docSnap.exists() ? docSnap.data() : null;
}
