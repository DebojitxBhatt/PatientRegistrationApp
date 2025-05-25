

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const PatientRegistration = ({ onPatientAdded}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    address: '',
    age: '',
    gender: '',
    medicalHistory: '',
    emergencyContact: {
      firstName: '',
      lastName: '',
      relationship: '',
      phoneNumber: ''
    }
  });
};
export default PatientRegistration; 