import { PGlite } from '@electric-sql/pglite';

// Create a singleton promise that will be reused
let dbInstance = null;
let initializationPromise = null;

// Create a BroadcastChannel for database operations
let dbChannel;
try {
  dbChannel = new BroadcastChannel('pglite-db-ops');
} catch (error) {
  console.warn('BroadcastChannel not supported. Cross-tab sync will be limited.');
  dbChannel = { postMessage: () => {}, close: () => {} };
}

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
      // Initialize PGlite with persistence enabled
      const db = new PGlite({
        name: 'patient_db', // Unique name for the database
        persistent: true,   // Enable persistence across refreshes
      });
      
      // Create patients table with new fields
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

      // Set up broadcast channel listener for database operations
      dbChannel.onmessage = async (event) => {
        if (event.data.type === 'DB_OPERATION') {
          try {
            // Execute the received query
            const result = await db.query(event.data.query, event.data.params || []);
            // Broadcast the success back
            dbChannel.postMessage({
              type: 'DB_OPERATION_COMPLETE',
              id: event.data.id,
              success: true,
              result
            });
          } catch (error) {
            // Broadcast the error back
            dbChannel.postMessage({
              type: 'DB_OPERATION_COMPLETE',
              id: event.data.id,
              success: false,
              error: error.message
            });
          }
        }
      };

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

// Function to execute a query and broadcast it to other tabs
export const executeQuery = async (query, params = []) => {
  const db = await dbInitPromise();
  const result = await db.query(query, params);
  
  // Broadcast the operation to other tabs
  dbChannel.postMessage({
    type: 'DB_OPERATION',
    query,
    params,
    id: Date.now().toString()
  });

  return result;
};

// Initialize the database
dbInitPromise().catch(console.error); 