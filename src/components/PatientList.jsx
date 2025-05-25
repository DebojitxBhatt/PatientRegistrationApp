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
      console.error('error loading Patients:', error);
      setError('failed to load Patients.Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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