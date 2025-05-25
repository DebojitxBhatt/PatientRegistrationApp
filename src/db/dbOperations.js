import { dbInitPromise, executeQuery } from './config';

// Patient Operations
export const addPatient = async (patientData) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    address,
    age,
    gender,
    medicalHistory,
    emergencyContact
  } = patientData;

  try {
    const result = await executeQuery(
      `INSERT INTO patients (
        firstName,
        lastName,
        mobileNumber,
        address,
        age,
        gender,
        medicalHistory,
        emergency_firstName,
        emergency_lastName,
        emergency_relationship,
        emergency_phoneNumber
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        firstName,
        lastName,
        mobileNumber,
        address,
        age,
        gender,
        medicalHistory || '',
        emergencyContact.firstName,
        emergencyContact.lastName,
        emergencyContact.relationship,
        emergencyContact.phoneNumber
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const getPatients = async () => {
  try {
    const result = await executeQuery(
      'SELECT * FROM patients ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

export const getPatientById = async (id) => {
  try {
    const result = await executeQuery(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Patient not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting patient:', error);
    throw error;
  }
};

export const updatePatient = async (id, updates) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    address,
    age,
    gender,
    medicalHistory,
    emergencyContact
  } = updates;

  try {
    const result = await executeQuery(
      `UPDATE patients SET
        firstName = $1,
        lastName = $2,
        mobileNumber = $3,
        address = $4,
        age = $5,
        gender = $6,
        medicalHistory = $7,
        emergency_firstName = $8,
        emergency_lastName = $9,
        emergency_relationship = $10,
        emergency_phoneNumber = $11
      WHERE id = $12
      RETURNING *`,
      [
        firstName,
        lastName,
        mobileNumber,
        address,
        age,
        gender,
        medicalHistory || '',
        emergencyContact.firstName,
        emergencyContact.lastName,
        emergencyContact.relationship,
        emergencyContact.phoneNumber,
        id
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Patient not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Appointment Operations
export const addAppointment = async (patientId, appointmentDate, reason) => {
  const db = await dbInitPromise;
  try {
    const result = db.run(`
      INSERT INTO appointments (patient_id, appointment_date, reason) VALUES (?, ?, ?)
    `, [patientId, appointmentDate, reason]);
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

export const getAppointments = async () => {
  const db = await dbInitPromise;
  try {
    const result = db.exec(`
      SELECT 
        a.*,
        p.name as patient_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY appointment_date ASC
    `);
    if (result.length > 0) {
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const appointment = {};
        columns.forEach((col, i) => {
          appointment[col] = row[i];
        });
        return appointment;
      });
    }
    return [];
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, status) => {
  const db = await dbInitPromise;
  try {
    const result = db.run(`
      UPDATE appointments SET status = ? WHERE id = ?
    `, [status, id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}; 