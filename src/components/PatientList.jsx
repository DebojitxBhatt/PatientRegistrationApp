import React, { useState, useEffect } from 'react';

import { getPatients } from '../db/dbOperations';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const patientList = await getPatients();
      setPatients(patientList);
      setError(null);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load patients on mount and set up BroadcastChannel for updates
  useEffect(() => {
    loadPatients();

    // Create a BroadcastChannel for cross-tab communication
    let channel;
    try {
      channel = new BroadcastChannel('patient-updates');
      
      // Listen for updates from other tabs
      channel.onmessage = (event) => {
        if (event.data.type === 'PATIENT_UPDATED') {
          loadPatients();
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported in this browser. Cross-tab sync will be disabled.');
    }

    return () => {
      if (channel) {
        try {
          channel.close();
        } catch (error) {
          console.warn('Error closing BroadcastChannel:', error);
        }
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Paper>
    );
  }

  if (patients.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography align="center" color="text.secondary">
          No patients registered yet. Use the form above to add your first patient.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Registered Patients
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Medical History</TableCell>
              <TableCell>Registration Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.medical_history}</TableCell>
                <TableCell>
                  {new Date(patient.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PatientList; 