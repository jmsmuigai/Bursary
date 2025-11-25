# 📊 Database Information - Garissa Bursary Management System

## Current Database: **localStorage (Browser Storage)**

The system currently uses **localStorage** as the database. This is a browser-based storage solution that:
- ✅ Works offline
- ✅ No server required
- ✅ Fast and reliable
- ✅ Data persists across browser sessions
- ✅ Same database for registration and admin portal

## Database Structure

### 1. User Registration Data
**Storage Key:** `mbms_users`  
**Location:** `localStorage.getItem('mbms_users')`  
**Used By:**
- Registration form (`register.html`)
- Login system (`js/auth.js`)
- Admin portal (`js/admin.js`)
- Application form (`js/application.js`)

**Data Format:**
```javascript
[
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phoneNumber: "0720123456",
    gender: "Male",
    dateOfBirth: "2000-01-01",
    idNumber: "12345678",
    nemisId: "12345678",
    subCounty: "Garissa Township",
    ward: "Waberi",
    village: "Village Name",
    role: "applicant",
    password: "hashed_password",
    createdAt: "2025-01-15T10:30:00.000Z"
  }
]
```

### 2. Application Data
**Storage Key:** `mbms_applications`  
**Location:** `localStorage.getItem('mbms_applications')`  
**Used By:**
- Application form (`js/application.js`)
- Admin portal (`js/admin.js`)
- Applicant dashboard (`applicant_dashboard.html`)

**Data Format:**
```javascript
[
  {
    appID: "GSA/2025/0001",
    applicantEmail: "john@example.com",
    applicantName: "John Doe",
    dateSubmitted: "2025-01-15T10:30:00.000Z",
    status: "Pending Ward Review",
    subCounty: "Garissa Township",
    ward: "Waberi",
    personalDetails: { ... },
    familyDetails: { ... },
    institutionDetails: { ... },
    financialDetails: { ... },
    isFinalSubmission: true
  }
]
```

### 3. Draft Applications (Auto-saved)
**Storage Key:** `mbms_application_{email}`  
**Location:** `localStorage.getItem('mbms_application_john@example.com')`  
**Used By:**
- Application form auto-save (`js/application.js`)

**Data Format:**
```javascript
{
  firstNames: "John",
  lastName: "Doe",
  // ... all form fields
  lastSaved: "2025-01-15T10:30:00.000Z",
  step: 2,
  status: "Draft"
}
```

### 4. Budget Data
**Storage Key:** `mbms_budget_total`, `mbms_budget_allocated`  
**Location:** `localStorage.getItem('mbms_budget_total')`  
**Used By:**
- Budget management (`js/budget.js`)
- Admin portal (`js/admin.js`)

### 5. Application Counter
**Storage Key:** `mbms_application_counter`  
**Location:** `localStorage.getItem('mbms_application_counter')`  
**Used By:**
- Application ID generation (`js/application.js`)

### 6. Serial Number Counter
**Storage Key:** `mbms_last_serial`  
**Location:** `localStorage.getItem('mbms_last_serial')`  
**Used By:**
- Award letter serial number generation (`js/pdf-generator.js`)

## Database Consistency

✅ **All components read from the same database:**
- Registration → saves to `mbms_users` (localStorage)
- Admin Portal → reads from `mbms_users` and `mbms_applications` (localStorage)
- Application Form → saves to `mbms_application_{email}` and `mbms_applications` (localStorage)
- Login → reads from `mbms_users` (localStorage)

✅ **Data Flow:**
1. User registers → Saved to `mbms_users` (localStorage)
2. User logs in → Reads from `mbms_users` (localStorage)
3. User fills application → Auto-saves to `mbms_application_{email}` (localStorage)
4. User submits application → Saved to `mbms_applications` (localStorage)
5. Admin views applications → Reads from `mbms_applications` (localStorage)
6. Admin awards application → Updates `mbms_applications` (localStorage)

## Future: Firebase Migration

The system is designed to easily migrate to Firebase:
- ✅ Database structure is ready
- ✅ Firebase config file exists (`firebase_config.js`)
- ✅ Code is modular and can be updated
- ⏳ Migration pending (currently using localStorage)

## Database Access

**Current:** Browser localStorage (client-side only)  
**Future:** Firebase Firestore (cloud database)

**Note:** localStorage data is stored in the user's browser. For production, consider migrating to Firebase for:
- Centralized data storage
- Multi-device access
- Data backup and recovery
- Real-time synchronization

## Verification

To verify database consistency:
1. Open browser console (F12)
2. Run: `localStorage.getItem('mbms_users')` - Should show registered users
3. Run: `localStorage.getItem('mbms_applications')` - Should show submitted applications
4. Both admin portal and registration use the same localStorage keys

