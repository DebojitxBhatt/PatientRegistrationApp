import PatientRegistration from './components/PatientRegistration';

function App() {
 
  const handlePatientAdded = () => {
    try {
      channel.postMessage({ type: 'PATIENT_UPDATED' });
    } catch (error) {
      console.warn('Failed to broadcast patient update:', error);
    }
  };
}

export default App;
