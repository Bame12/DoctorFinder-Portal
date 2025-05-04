import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDjn6D2MIelGDwnleVX3kXausuz5slswKY",

    authDomain: "doctor-finder-b94c2.firebaseapp.com",

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


export { database, auth, app };