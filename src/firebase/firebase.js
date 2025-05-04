// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDjn6D2MIelGDwnleVX3kXausuz5slswKY",
    authDomain: "doctor-finder-b94c2.firebaseapp.com",
    databaseURL: "https://doctor-finder-b94c2-default-rtdb.firebaseio.com", // Fixed: removed trailing slash
    projectId: "doctor-finder-b94c2",
    storageBucket: "doctor-finder-b94c2.appspot.com", // Fixed: correct storage bucket format
    messagingSenderId: "489321981801",
    appId: "1:489321981801:web:42934440d9f31c2b213ff8",
    measurementId: "G-X8K4NHY9YR"
};

// Initialize Firebase with error handling
let app, database, auth, storage;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    // Debug log
    console.log('Firebase initialized successfully:', {
        app: !!app,
        database: !!database,
        auth: !!auth,
        storage: !!storage
    });
} catch (error) {
    console.error('Error initializing Firebase:', error);
    // You might want to show a notification to the user or handle the error in a different way
}

export { database, auth, app, storage };
