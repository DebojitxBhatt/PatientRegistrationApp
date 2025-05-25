import React, { useState, useEffect } from 'react';
import { addPatient } from '../db/dbOperations';
import { dbInitPromise } from '../db/config';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const PatientRegistration = ({ onPatientAdded, darkMode }) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});

  // Function to validate phone number
  const isValidPhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };

  useEffect(() => {
    const initDb = async () => {
      try {
        await dbInitPromise();
        setDbReady(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        showNotification('Failed to initialize database. Please refresh the page.', 'error');
      }
    };

    initDb();
  }, []);

  // Function to show notification and auto-hide after 2 seconds
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 2000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Required';
    } else if (!isValidPhoneNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Must be exactly 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Required';
    if (!formData.age) newErrors.age = 'Required';
    if (formData.age && (formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Invalid age';
    }
    if (!formData.gender) newErrors.gender = 'Required';
    if (!formData.emergencyContact.firstName.trim()) newErrors['emergencyContact.firstName'] = 'Required';
    if (!formData.emergencyContact.lastName.trim()) newErrors['emergencyContact.lastName'] = 'Required';
    if (!formData.emergencyContact.relationship.trim()) newErrors['emergencyContact.relationship'] = 'Required';
    if (!formData.emergencyContact.phoneNumber) {
      newErrors['emergencyContact.phoneNumber'] = 'Required';
    } else if (!isValidPhoneNumber(formData.emergencyContact.phoneNumber)) {
      newErrors['emergencyContact.phoneNumber'] = 'Must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number inputs
    if (name === 'mobileNumber' || name === 'emergency.phoneNumber') {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      
      if (name === 'emergency.phoneNumber') {
        setFormData(prev => ({
          ...prev,
          emergencyContact: {
            ...prev.emergencyContact,
            phoneNumber: numericValue
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    } else if (name.startsWith('emergency.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear errors when field is being edited
    if (name.includes('.')) {
      const field = name.split('.')[1];
      setErrors(prev => ({
        ...prev,
        [`emergencyContact.${field}`]: undefined
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const newPatient = await addPatient({
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`
      });
      showNotification('Patient registered successfully!');
      setFormData({
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
      if (onPatientAdded) onPatientAdded(newPatient);
    } catch (error) {
      showNotification('Error registering patient: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!dbReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-twitter-blue border-t-transparent"></div>
      </div>
    );
  }

  const inputClass = `w-full px-2 py-1.5 rounded-lg border text-sm transition-all duration-200 ${
    darkMode 
      ? 'bg-gray-800 border-gray-700 focus:border-twitter-blue' 
      : 'bg-white border-gray-200 focus:border-twitter-blue'
  } focus:outline-none focus:ring-1 focus:ring-twitter-blue`;

  return (
    <>
      {/* Centered Notification */}
      {notification.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          } transform transition-all duration-300 ease-in-out`}>
            {notification.message}
          </div>
        </div>
      )}

      <div className={`max-w-6xl mx-auto rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg h-screen overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Patient Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 h-[calc(100vh-80px)] overflow-y-auto">
          {/* Personal Information Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-twitter-blue rounded-full"></div>
              <h3 className="text-lg font-medium">Personal Information</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${inputClass} ${errors.firstName ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-0.5 text-xs text-red-500">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                max="150"
                className={`${inputClass} ${errors.age ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="25"
              />
              {errors.age && <p className="mt-0.5 text-xs text-red-500">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Prevent typing non-numeric characters
                  if (!/[0-9]/.test(e.key) && 
                      e.key !== 'Backspace' && 
                      e.key !== 'Delete' && 
                      e.key !== 'ArrowLeft' && 
                      e.key !== 'ArrowRight' && 
                      e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                className={`${inputClass} ${errors.mobileNumber ? '!border-red-500 !ring-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                placeholder="10 digit number"
                min="0"
                max="9999999999"
              />
              {errors.mobileNumber && <p className="mt-0.5 text-xs text-red-500">{errors.mobileNumber}</p>}
              {!errors.mobileNumber && formData.mobileNumber && formData.mobileNumber.length < 10 && (
                <p className="mt-0.5 text-xs text-yellow-500">{`Enter ${10 - formData.mobileNumber.length} more digits`}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className={`${inputClass} ${errors.address ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Enter address"
              />
              {errors.address && <p className="mt-0.5 text-xs text-red-500">{errors.address}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`${inputClass} ${errors.lastName ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-0.5 text-xs text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`${inputClass} ${errors.gender ? '!border-red-500 !ring-red-500' : ''}`}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.gender && <p className="mt-0.5 text-xs text-red-500">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows="2"
                className={inputClass}
                placeholder="Enter medical history (optional)"
              />
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="md:col-span-2 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-twitter-blue rounded-full"></div>
              <h3 className="text-lg font-medium">Emergency Contact</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="emergency.firstName"
                value={formData.emergencyContact.firstName}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.firstName'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Emergency contact first name"
              />
              {errors['emergencyContact.firstName'] && (
                <p className="mt-0.5 text-xs text-red-500">{errors['emergencyContact.firstName']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <input
                type="text"
                name="emergency.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.relationship'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Relationship to patient"
              />
              {errors['emergencyContact.relationship'] && (
                <p className="mt-0.5 text-xs text-red-500">{errors['emergencyContact.relationship']}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="emergency.lastName"
                value={formData.emergencyContact.lastName}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.lastName'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Emergency contact last name"
              />
              {errors['emergencyContact.lastName'] && (
                <p className="mt-0.5 text-xs text-red-500">{errors['emergencyContact.lastName']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="number"
                name="emergency.phoneNumber"
                value={formData.emergencyContact.phoneNumber}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Prevent typing non-numeric characters
                  if (!/[0-9]/.test(e.key) && 
                      e.key !== 'Backspace' && 
                      e.key !== 'Delete' && 
                      e.key !== 'ArrowLeft' && 
                      e.key !== 'ArrowRight' && 
                      e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                className={`${inputClass} ${errors['emergencyContact.phoneNumber'] ? '!border-red-500 !ring-red-500' : ''} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                placeholder="10 digit number"
                min="0"
                max="9999999999"
              />
              {errors['emergencyContact.phoneNumber'] && (
                <p className="mt-0.5 text-xs text-red-500">{errors['emergencyContact.phoneNumber']}</p>
              )}
              {!errors['emergencyContact.phoneNumber'] && 
                formData.emergencyContact.phoneNumber && 
                formData.emergencyContact.phoneNumber.length < 10 && (
                <p className="mt-0.5 text-xs text-yellow-500">{`Enter ${10 - formData.emergencyContact.phoneNumber.length} more digits`}</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 bg-twitter-blue text-white rounded-lg font-medium 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'} 
                transition-colors duration-200`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Registering...
                </span>
              ) : (
                'Register Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PatientRegistration; 