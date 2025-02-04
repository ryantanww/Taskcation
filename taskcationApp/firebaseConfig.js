// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBCv1zZPGskqSJAf953ZFNxJ1J7K4BOChQ',
    authDomain: 'taskcation.firebaseapp.com',
    projectId: 'taskcation',
    storageBucket: 'taskcation.firebasestorage.app',
    messagingSenderId: '618559707477',
    appId: '1:618559707477:web:940a6dde9366d3339077dc',
    measurementId: 'G-3CKM89VYPZ'
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Initialise Firestore
const db = getFirestore(app);

export { app, db };