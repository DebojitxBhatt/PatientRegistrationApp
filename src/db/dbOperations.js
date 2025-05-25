import { dbInitPromise } from './config';

export const addPatient = async (patientData) => {
  const db = await dbInitPromise();

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
    const result = await db.query(
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

















