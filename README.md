# Patient Registration App

A frontend-only patient registration application built with React and PGlite for data storage. This application allows for patient registration, SQL querying, and maintains data persistence across page refreshes and multiple tabs.

## Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with IndexedDB support
- npm or yarn package manager

### Installation

1. **Clone the repository**:

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```



### Dependencies
- React 18.2.0
- PGlite 0.3.2
- Tailwind CSS
- Vite

### Browser Support
- Modern browsers with IndexedDB support
- BroadcastChannel API support for cross-tab functionality
- Fallback mechanisms for unsupported features

## Features

### 1. Patient Registration
- **Form Fields**:
  - Personal Information:
    - First Name
    - Last Name
    - Age (0-150 years)
    - Gender (Male/Female/Other)
    - Mobile Number (10 digits only)
    - Address
    - Medical History (optional)
  - Emergency Contact:
    - First Name
    - Last Name
    - Relationship
    - Phone Number (10 digits only)

- **Validation**:
  - All fields are required except Medical History
  - Age must be between 0-150 years
  - Phone numbers must be exactly 10 digits
  - Real-time validation feedback
  - Form-level validation before submission

- **User Interface**:
  - Dark/Light mode support
  - Responsive design
  - Success/Error notifications
  - Loading states during submission

### 2. SQL Query Tool
- **Features**:
  - Execute raw SQL queries
  - View query results in a tabulated format
  - Example queries provided
  - Real-time updates when data changes

- **Example Queries**:
  ```sql
  -- Get all patients
  SELECT * FROM patients ORDER BY created_at DESC;

  -- Get patients by age range
  SELECT * FROM patients WHERE age BETWEEN 20 AND 40;

  -- Count patients by gender
  SELECT gender, COUNT(*) as count FROM patients GROUP BY gender;

  -- Recent registrations
  SELECT firstName, lastName, age, gender, created_at 
  FROM patients 
  WHERE created_at >= NOW() - INTERVAL '24 hours';
  ```

### 3. Data Persistence
- **Storage**:
  - Uses PGlite for client-side SQL database
  - Data persists across page refreshes
  - IndexedDB-based storage
  - Automatic table creation and schema management

- **Database Schema**:
  ```sql
  CREATE TABLE patients (
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
  ```

### 4. Cross-Tab Synchronization
- **Features**:
  - Real-time data synchronization across browser tabs
  - Automatic query result updates
  - Write operations broadcasted to all tabs
  - Fallback handling for unsupported browsers

## Technical Details

### Database Configuration
- **Configuration** (`db/config.js`):
  ```javascript
  const db = new PGlite({
    name: 'patient_db',
    persistent: true,
  });
  ```

- **Cross-Tab Communication**:
  ```javascript
  const dbChannel = new BroadcastChannel('pglite-db-ops');
  ```

### State Management
- Uses React's useState and useEffect hooks
- Centralized database initialization
- Error boundary implementation
- Form state management with validation

## Best Practices

### 1. Data Entry
- Always validate phone numbers (must be 10 digits)
- Use proper date formats
- Keep medical history concise and relevant
- Verify emergency contact information

### 2. SQL Queries
- Use parameterized queries when possible
- Avoid complex joins that might impact performance
- Include WHERE clauses to limit result sets
- Regular data cleanup for optimal performance

### 3. Performance
- Limit large result sets
- Use appropriate indexes
- Clean up resources when components unmount
- Monitor browser storage usage

## Troubleshooting Guide

### Common Issues and Solutions

1. **Database Not Initializing**
   - Solution:
     1. Clear browser cache and cookies
     2. Check IndexedDB permissions in browser settings
     3. Verify browser compatibility
     4. Restart the application

2. **Cross-Tab Sync Issues**
   - Solution:
     1. Ensure all tabs are from the same origin
     2. Check browser console for specific errors
     3. Verify BroadcastChannel support
     4. Try closing and reopening tabs

3. **Form Validation Errors**
   - Solution:
     1. Phone numbers: Must be exactly 10 digits
     2. Age: Must be between 0-150
     3. Required fields: Cannot be empty
     4. Check for proper data formats

### Error Messages Explained
- "Failed to initialize database": Browser compatibility or permission issue
- "Must be exactly 10 digits": Phone number format error
- "Invalid age": Age must be between 0-150
- "Database operation failed": Check console for detailed error message



### Problems i have faced while making this project

*First time using PGlite, I have used Postgresql pgadmin, MongoDB, there was a learning curve to connect the database https://pglite.dev/docs/ was not enough and even on internet there are very few content on how to use PGlite, I had diffuclty connecting with patientRegform

*lot of errors in Tailwind css UI was not even working, I had to switch to material ui but these video saved me
link: https://www.youtube.com/watch?v=227LunUUt-E

*I had tough time deciding  what fields to keep or not to like: blood group ? does it matter? I don't know, to build Patient schema.






