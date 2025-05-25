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

  useEffect(() => {
    const initDb = async () => {
      try {
        await dbInitPromise();
        setDbReady(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setNotification({
          show: true,
          message: 'Failed to initialize database. Please refresh the page.',
          type: 'error'
        });
      }
    };

    initDb();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (formData.age && (formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Please enter a valid age between 0 and 150';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Emergency contact validation
    if (!formData.emergencyContact.firstName.trim()) {
      newErrors['emergencyContact.firstName'] = 'Emergency contact first name is required';
    }
    if (!formData.emergencyContact.lastName.trim()) {
      newErrors['emergencyContact.lastName'] = 'Emergency contact last name is required';
    }
    if (!formData.emergencyContact.relationship.trim()) {
      newErrors['emergencyContact.relationship'] = 'Relationship is required';
    }
    if (!formData.emergencyContact.phoneNumber.trim()) {
      newErrors['emergencyContact.phoneNumber'] = 'Emergency contact phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency.')) {
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
    if (errors[name]) {
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
      setNotification({
        show: true,
        message: 'Patient registered successfully!',
        type: 'success'
      });
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
      setNotification({
        show: true,
        message: 'Error registering patient: ' + error.message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!dbReady) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-twitter-blue border-t-transparent"></div>
      </div>
    );
  }

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
    darkMode 
      ? 'bg-gray-800 border-gray-700 focus:border-twitter-blue' 
      : 'bg-white border-gray-200 focus:border-twitter-blue'
  } focus:outline-none focus:ring-1 focus:ring-twitter-blue`;

  return (
    <div className={`max-w-4xl mx-auto rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Patient Registration</h2>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Enter patient details and emergency contact information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-twitter-blue rounded-full"></div>
            <h3 className="text-lg font-medium">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${inputClass} ${errors.firstName ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="John"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`${inputClass} ${errors.lastName ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Age</label>
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
              {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Gender</label>
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
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`${inputClass} ${errors.mobileNumber ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="+1 (555) 000-0000"
              />
              {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className={`${inputClass} resize-none ${errors.address ? '!border-red-500 !ring-red-500' : ''}`}
              placeholder="Enter full address"
            />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Medical History</label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows="2"
              className={`${inputClass} resize-none`}
              placeholder="Any relevant medical history (optional)"
            />
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-medium">Emergency Contact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name</label>
              <input
                type="text"
                name="emergency.firstName"
                value={formData.emergencyContact.firstName}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.firstName'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Emergency contact's first name"
              />
              {errors['emergencyContact.firstName'] && (
                <p className="mt-1 text-sm text-red-500">{errors['emergencyContact.firstName']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name</label>
              <input
                type="text"
                name="emergency.lastName"
                value={formData.emergencyContact.lastName}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.lastName'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="Emergency contact's last name"
              />
              {errors['emergencyContact.lastName'] && (
                <p className="mt-1 text-sm text-red-500">{errors['emergencyContact.lastName']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Relationship</label>
              <input
                type="text"
                name="emergency.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.relationship'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
              {errors['emergencyContact.relationship'] && (
                <p className="mt-1 text-sm text-red-500">{errors['emergencyContact.relationship']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="emergency.phoneNumber"
                value={formData.emergencyContact.phoneNumber}
                onChange={handleChange}
                className={`${inputClass} ${errors['emergencyContact.phoneNumber'] ? '!border-red-500 !ring-red-500' : ''}`}
                placeholder="+1 (555) 000-0000"
              />
              {errors['emergencyContact.phoneNumber'] && (
                <p className="mt-1 text-sm text-red-500">{errors['emergencyContact.phoneNumber']}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-twitter-blue hover:bg-blue-500 active:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-twitter-blue'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Registering...</span>
              </div>
            ) : (
              'Register Patient'
            )}
          </button>
        </div>
      </form>

      {notification.show && (
        <div
          className={`mx-6 mb-6 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default PatientRegistration; 