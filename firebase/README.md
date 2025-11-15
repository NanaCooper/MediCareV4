# Firebase Security Rules

This document outlines the security rules implementation for the MediCare healthcare app.

## Overview

The security rules enforce the following access patterns:
- Patients can only access their own medical records and appointments
- Doctors can only access data for their assigned patients
- Appointment data is isolated between participants
- Medical documents have strict upload and access controls

## Firestore Collections Security

### Users Collection
- Users can read/write their own profile
- Doctors can read profiles of their patients (via appointment validation)
- Users cannot change their role after creation
- Admin role has read access to all profiles

### Appointments Collection
- Only participants (doctor/patient) can read their appointments
- Participants cannot modify the doctor/patient IDs after creation
- Updates must preserve the participant relationship

### Medical Records Collection
- Patients can only read their own records
- Doctors can only access records of their patients
- Records cannot be deleted (compliance requirement)
- Only doctors can create/update records

### Messages Collection
- Messages are organized in conversations
- Only conversation participants can read/write
- Messages cannot be modified/deleted after sending

## Storage Security

### Profile Pictures (/users/{userId}/profile/*)
- Users can upload their own profile picture
- 5MB size limit
- Image files only
- Public read access for signed-in users

### Medical Documents (/medical/{patientId}/{recordId}/*)
- 20MB size limit
- Restricted to PDF, images, and DICOM formats
- Patients can only read their own documents
- Only treating doctors can upload/read
- Documents cannot be deleted

### Temporary Uploads (/uploads/{userId}/*)
- Temporary storage for upload processing
- Owner-only access
- Same file type restrictions as medical documents
- Files can be deleted by owner

## Deployment

1. Install Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the project (if not already done):
```bash
firebase init
```

4. Deploy the security rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Testing Rules

You can test these rules using the Firebase Emulator Suite:

1. Install the emulator:
```bash
firebase init emulators
```

2. Start the emulators:
```bash
firebase emulators:start
```

3. Run the security rules tests (if you create them in `tests/rules/`):
```bash
firebase emulators:exec "npm run test:rules"
```

## Important Notes

1. Rule Updates
- Always test rule changes in the emulator first
- Deploy rules before deploying new app versions that depend on them
- Monitor Security Rules usage in Firebase Console

2. Performance
- The rules use several `exists()` and `get()` calls which count as additional reads
- Consider caching doctor-patient relationships in a separate collection for better performance

3. Compliance
- These rules enforce HIPAA-like access controls
- Additional audit logging is recommended for production
- Consider enabling Firebase App Check for additional security