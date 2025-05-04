// src/firebase/initializeDb.js
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Initialize the database with sample data if empty
export const initializeDatabase = async () => {
    try {
        console.log('Initializing database...');

        // Check if database already has data
        const doctorsSnapshot = await getDocs(collection(db, 'doctors'));

        if (doctorsSnapshot.empty) {
            console.log('Database is empty, initializing with sample data...');
            await initializeSpecialties();
            await addSampleDoctors();
            console.log('Database initialized successfully');
        } else {
            console.log('Database already has data');
        }
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

    const specialtiesCollection = collection(db, 'specialties');

    try {
        const snapshot = await getDocs(specialtiesCollection);
        if (snapshot.empty) {
            for (const specialty of SPECIALTIES) {
                const specialtyId = specialty.replace(/\s/g, '_');
                const specialtyDoc = doc(specialtiesCollection, specialtyId);
                await setDoc(specialtyDoc, {
                    name: specialty,
                    description: `Medical specialty: ${specialty}`,
                    createdAt: Date.now()
                });
            }
            console.log('Specialties initialized');
        }
    } catch (error) {
        console.error('Error initializing specialties:', error);
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
            experience: 10,
            education: 'MD from University of Botswana',
            about: 'Experienced cardiologist with 10 years of practice.',
            isAvailable: true,
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
            experience: 8,
            education: 'DDS from University of Cape Town',
            about: 'General dentist providing comprehensive dental care.',
            isAvailable: true,
            createdAt: Date.now()
        }
    ];

    const doctorsCollection = collection(db, 'doctors');

    try {
        for (const doctor of sampleDoctors) {
            const doctorId = doctor.email.replace(/[.#$[\]]/g, '_');
            const doctorDoc = doc(doctorsCollection, doctorId);
            await setDoc(doctorDoc, doctor);
        }
        console.log('Sample doctors added');
    } catch (error) {
        console.error('Error adding sample doctors:', error);
    }
};