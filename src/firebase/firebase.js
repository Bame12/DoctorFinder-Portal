// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDjn6D2MIelGDwnleVX3kXausuz5slswKY",
    authDomain: "doctor-finder-b94c2.firebaseapp.com",
    databaseURL: "https://doctor-finder-b94c2-default-rtdb.firebaseio.com/", // Added
    projectId: "doctor-finder-b94c2",
    storageBucket: "doctor-finder-b94c2.firebasestorage.app",
    messagingSenderId: "489321981801",
    appId: "1:489321981801:web:42934440d9f31c2b213ff8",
    measurementId: "G-X8K4NHY9YR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Debug log
console.log('Firebase initialized:', {
    app: !!app,
    database: !!database,
    auth: !!auth,
    storage: !!storage
});

export { database, auth, app, storage };