import React, { useState } from 'react';
import PatientRegistration from './components/PatientRegistration';
import SQLQueryTool from './components/SQLQueryTool';

// Create a BroadcastChannel for cross-tab communication with fallback
let channel;
try {
  channel = new BroadcastChannel('patient-updates');
} catch (error) {
  console.warn('BroadcastChannel not supported in this browser. Cross-tab sync will be disabled.');
  channel = {
    postMessage: () => {},
    close: () => {}
  };
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 for registration, 1 for SQL

  const handlePatientAdded = (newPatient) => {
    try {
      channel.postMessage({
        type: 'PATIENT_UPDATED',
        action: 'add',
        timestamp: new Date().toISOString(),
        data: newPatient
      });
    } catch (error) {
      console.warn('Failed to broadcast patient update:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-twitter-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
      <nav className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Patient Management System</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2 font-medium ${
                activeTab === 0
                  ? 'text-twitter-blue border-b-2 border-twitter-blue'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Patient Registration
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2 font-medium ${
                activeTab === 1
                  ? 'text-twitter-blue border-b-2 border-twitter-blue'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              SQL Query Tool
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 0 ? (
          <PatientRegistration onPatientAdded={handlePatientAdded} darkMode={darkMode} />
        ) : (
          <SQLQueryTool darkMode={darkMode} />
        )}
      </main>
    </div>
  );
}

export default App;
