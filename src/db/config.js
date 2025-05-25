import { PGlite } from '@electric-sql/pglite';

// Create a singleton promise that will be reused
let dbInstance = null;
let initializationPromise = null;

export const dbInitPromise = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  // If there's already an initialization in progress, return that promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // Create a new initialization promise
  initializationPromise = (async () => {
    try {
      const db = new PGlite();
      
      // Create patients table new fields
      await db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          mobileNumber TEXT NOT NULL,
          address TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL,
          medicalHistory TEXT,
          emergency_firstName TEXT NOT NULL,
          emergency_lastName TEXT NOT NULL,
          emergency_relationship TEXT NOT NULL,
          emergency_phoneNumber TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      dbInstance = db;
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Reset the initialization promise so it can be retried
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

// Initialize the database
dbInitPromise().catch(console.error); 