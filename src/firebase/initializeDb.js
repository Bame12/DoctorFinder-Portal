// src/firebase/initializeDb.js
import { getDatabase, ref, set } from 'firebase/database';
import { app } from './firebase';

const db = getDatabase(app);

// Initialize the database structure
export const initializeDatabase = async () => {
    try {
        // Create the basic database structure
        const initialData = {
            doctors: {},
            users: {},
            specialties: {},
            reviews: {},
            appointments: {},
        };

        // Write the initial structure
        await set(ref(db, '/'), initialData);

        // Initialize specialties
        await initializeSpecialties();

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Initialize specialties
const initializeSpecialties = async () => {
    const SPECIALTIES = [
        'General Practitioner',
        'Pediatrician',
        'Dermatologist',
        'Cardiologist',
        'Neurologist',
        'Psychiatrist',
        'Orthopedist',
        'Gynecologist',
        'Ophthalmologist',
        'Dentist',
        'Otolaryngologist',
        'Endocrinologist',
        'Gastroenterologist',
        'Urologist',
        'Nephrologist',
        'Oncologist',
        'Neurosurgeon',
        'Plastic Surgeon',
        'Radiologist',
        'Pathologist'
    ];

    for (const specialty of SPECIALTIES) {
        const specialtyRef = ref(db, `specialties/${specialty.replace(/\s/g, '_')}`);
        await set(specialtyRef, {
            name: specialty,
            description: `Medical specialty: ${specialty}`,
            createdAt: Date.now()
        });
    }
};

// Function to add sample doctors (for testing)
export const addSampleDoctors = async () => {
    const sampleDoctors = [
        {
            name: 'Dr. John Smith',
            specialty: 'Cardiologist',
            email: 'john.smith@example.com',
            phone: '+267 1234 5678',
            address: '123 Medical Plaza, Gaborone',
            city: 'Gaborone',
            location: {
                latitude: -24.6282,
                longitude: 25.9231
            },
            acceptsInsurance: true,
            rating: 4.5,
            reviewCount: 0,
            createdAt: Date.now()
        },
        {
            name: 'Dr. Sarah Johnson',
            specialty: 'Dentist',
            email: 'sarah.johnson@example.com',
            phone: '+267 8765 4321',
            address: '456 Dental Center, Gaborone',
            city: 'Gaborone',
            location: {
                latitude: -24.6532,
                longitude: 25.9231
            },
            acceptsInsurance: true,
            rating: 4.8,
            reviewCount: 0,
            createdAt: Date.now()
        }
    ];

    for (const doctor of sampleDoctors) {
        const doctorRef = ref(db, `doctors/${doctor.email.replace(/[.#$[\]]/g, '_')}`);
        await set(doctorRef, doctor);
    }
};