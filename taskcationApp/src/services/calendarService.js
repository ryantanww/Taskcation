import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

export async function createCalendarEntry(db, dateID, data) {
    const docRef = doc(db, 'Calendar', dateID);
    await setDoc(docRef, {
        date: data.date ?? null,
        tasks: data.tasks ?? [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });
}

export async function getCalendarEntryByDateId(db, dateID) {
    const docSnap = await getDoc(doc(db, 'Calendar', dateID));
    return docSnap.exists() ? docSnap.data() : null;
    }

export async function updateCalendarEntry(db, dateID, updatedData) {
    const docRef = doc(db, 'Calendar', dateID);
    await updateDoc(docRef, {
        ...updatedData,
        updated_at: serverTimestamp()
    });
}

export async function deleteCalendarEntry(db, dateID) {
    await deleteDoc(doc(db, 'Calendar', dateID));
}

/**
 * Example: Add a Task to the tasks[] array
 */
export async function addTaskToCalendar(db, dateID, task) {
    const docRef = doc(db, 'Calendar', dateID);
    await updateDoc(docRef, {
        tasks: arrayUnion(task),
        updated_at: serverTimestamp()
    });
}
