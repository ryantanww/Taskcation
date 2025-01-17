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

export async function createCalendarEntry(db, dateId, data) {
    const docRef = doc(db, 'Calendar', dateId);
    await setDoc(docRef, {
        date: data.date ?? null,
        tasks: data.tasks ?? [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
    });
}

export async function getCalendarEntryByDateId(db, dateId) {
    const docSnap = await getDoc(doc(db, 'Calendar', dateId));
    return docSnap.exists() ? docSnap.data() : null;
    }

export async function updateCalendarEntry(db, dateId, updatedData) {
    const docRef = doc(db, 'Calendar', dateId);
    await updateDoc(docRef, {
        ...updatedData,
        updated_at: serverTimestamp()
    });
}

export async function deleteCalendarEntry(db, dateId) {
    await deleteDoc(doc(db, 'Calendar', dateId));
}

/**
 * Example: Add a Task to the tasks[] array
 */
export async function addTaskToCalendar(db, dateId, task) {
    const docRef = doc(db, 'Calendar', dateId);
    await updateDoc(docRef, {
        tasks: arrayUnion(task),
        updated_at: serverTimestamp()
    });
}
