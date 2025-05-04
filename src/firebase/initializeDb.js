// src/firebase/initializeDb.js
import { getDatabase, ref, set, get, onValue, update } from 'firebase/database';
import { app } from './firebase';

const db = getDatabase(app);

// DB initialization status for tracking
const DB_STATUS = {
  CHECKING: 'checking',
  INITIALIZING: 'initializing',
  INITIALIZED: 'initialized',
  FAILED: 'failed',
  RECOVERING: 'recovering'
};

let initializationStatus = null;

// Check if the database structure already exists
export const checkDatabaseStructure = async () => {
  try {
    console.log('Checking database structure...');
    const snapshot = await get(ref(db, '/'));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const requiredNodes = ['doctors', 'users', 'specialties', 'reviews', 'appointments'];
      const missingNodes = requiredNodes.filter(node => !data[node]);
      
      if (missingNodes.length === 0) {
        console.log('Database structure is complete');
        return { complete: true, existing: data };
      } else {
        console.log(`Database structure is incomplete. Missing nodes: ${missingNodes.join(', ')}`);
        return { complete: false, existing: data, missingNodes };
      }
    } else {
      console.log('Database structure does not exist');
      return { complete: false, existing: null };
    }
  } catch (error) {
    console.error('Error checking database structure:', error);
    throw new Error(`Failed to check database structure: ${error.message}`);
  }
};

// Recover the database structure by adding missing nodes
export const recoverDatabaseStructure = async (existing, missingNodes = []) => {
  try {
    console.log('Attempting to recover database structure...');
    initializationStatus = DB_STATUS.RECOVERING;
    
    const updates = {};
    
    if (!existing) {
      // If nothing exists, create the entire structure
      updates['/'] = {
        doctors: {},
        users: {},
        specialties: {},
        reviews: {},
        appointments: {},
      };
    } else {
      // Only add missing nodes
      missingNodes.forEach(node => {
        updates[`/${node}`] = {};
      });
    }
    
    await update(ref(db), updates);
    
    // Check if specialties are missing and initialize them if needed
    if (missingNodes.includes('specialties') || !existing) {
      await initializeSpecialties();
    }
    
    console.log('Database structure recovery completed');
    initializationStatus = DB_STATUS.INITIALIZED;
    return true;
  } catch (error) {
    console.error('Error recovering database structure:', error);
    initializationStatus = DB_STATUS.FAILED;
    throw new Error(`Failed to recover database structure: ${error.message}`);
  }
};

// Initialize the database structure
export const initializeDatabase = async () => {
  // Prevent multiple simultaneous initializations
  if (initializationStatus === DB_STATUS.INITIALIZING || 
      initializationStatus === DB_STATUS.RECOVERING) {
    console.log(`Database initialization already in progress: ${initializationStatus}`);
    return;
  }
  
  initializationStatus = DB_STATUS.CHECKING;
  
  try {
    // First check if the database structure already exists
    const { complete, existing, missingNodes } = await checkDatabaseStructure();
    
    if (complete) {
      console.log('Database structure already exists, skipping initialization');
      initializationStatus = DB_STATUS.INITIALIZED;
      return;
    }
    
    initializationStatus = DB_STATUS.INITIALIZING;
    console.log('Starting database initialization...');
    
    // Create the basic database structure if it doesn't exist or is incomplete
    if (!existing) {
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
      console.log('Basic database structure created');
    } else if (missingNodes && missingNodes.length > 0) {
      // Add missing nodes
      await recoverDatabaseStructure(existing, missingNodes);
      console.log('Missing database nodes added');
    }

    // Initialize specialties if they don't exist yet
    if (!existing || missingNodes.includes('specialties')) {
      await initializeSpecialties();
    }

    initializationStatus = DB_STATUS.INITIALIZED;
    console.log('Database initialized successfully');
  } catch (error) {
    initializationStatus = DB_STATUS.FAILED;
    console.error('Error initializing database:', error);
    
    // Attempt recovery if initialization fails
    try {
      const { existing, missingNodes } = await checkDatabaseStructure().catch(() => ({ complete: false, existing: null }));
      await recoverDatabaseStructure(existing, missingNodes);
    } catch (recoveryError) {
      console.error('Database recovery also failed:', recoveryError);
      throw new Error(`Database initialization failed and recovery attempts were unsuccessful: ${error.message}`);
    }
  }
};

// Initialize specialties
const initializeSpecialties = async () => {
    try {
        console.log('Initializing medical specialties...');
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

        // Check existing specialties first to avoid overwriting
        const snapshot = await get(ref(db, 'specialties'));
        const existingSpecialties = snapshot.exists() ? Object.keys(snapshot.val()).map(key => key.replace(/_/g, ' ')) : [];
        
        // Only add specialties that don't already exist
        const specialtiesToAdd = SPECIALTIES.filter(specialty => 
            !existingSpecialties.includes(specialty));
        
        if (specialtiesToAdd.length === 0) {
            console.log('All specialties already exist in database');
            return;
        }

        console.log(`Adding ${specialtiesToAdd.length} specialties to database`);
        
        // Add specialties in batches to improve performance
        const batchSize = 5;
        for (let i = 0; i < specialtiesToAdd.length; i += batchSize) {
            const batch = specialtiesToAdd.slice(i, i + batchSize);
            const updates = {};
            
            for (const specialty of batch) {
                const key = specialty.replace(/\s/g, '_');
                updates[`specialties/${key}`] = {
                    name: specialty,
                    description: `Medical specialty: ${specialty}`,
                    createdAt: Date.now()
                };
            }
            
            await update(ref(db), updates);
        }
        
        console.log('Specialties initialization completed');
    } catch (error) {
        console.error('Error initializing specialties:', error);
        throw new Error(`Failed to initialize specialties: ${error.message}`);
    }
};

// Function to add sample doctors (for testing)
export const addSampleDoctors = async () => {
    try {
        console.log('Adding sample doctors to database...');
        
        // Check if sample doctors already exist
        const doctorsSnapshot = await get(ref(db, 'doctors'));
        const existingDoctors = doctorsSnapshot.exists() ? Object.values(doctorsSnapshot.val()) : [];
        
        // Check if we already have sample data
        if (existingDoctors.length > 0) {
            const sampleEmails = ['john.smith@example.com', 'sarah.johnson@example.com'];
            const hasSamples = existingDoctors.some(doctor => 
                sampleEmails.includes(doctor.email));
            
            if (hasSamples) {
                console.log('Sample doctors already exist in database');
                return;
            }
        }
        
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
        
        // Use batch update for efficiency
        const updates = {};
        for (const doctor of sampleDoctors) {
            const doctorKey = doctor.email.replace(/[.#$[\]]/g, '_');
            updates[`doctors/${doctorKey}`] = doctor;
        }
        
        await update(ref(db), updates);
        console.log(`Added ${sampleDoctors.length} sample doctors to database`);
    } catch (error) {
        console.error('Error adding sample doctors:', error);
        throw new Error(`Failed to add sample doctors: ${error.message}`);
    }
};

// Get database initialization status
export const getDatabaseStatus = () => {
    return initializationStatus;
};

// Function to validate the database is properly initialized
export const validateDatabase = async () => {
    try {
        const { complete } = await checkDatabaseStructure();
        return complete;
    } catch (error) {
        console.error('Database validation failed:', error);
        return false;
    }
};
