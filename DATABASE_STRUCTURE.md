# Garissa County Bursary Management System - Database Structure

## Overview
This system uses **localStorage** for client-side data storage. For production deployment, this can be migrated to a backend database (Firebase, MySQL, PostgreSQL, etc.).

## Data Storage Keys

### 1. User Accounts (`mbms_users`)
**Structure:**
```javascript
{
  email: "user@example.com",
  password: "hashed_password", // In production, use bcrypt or similar
  firstName: "John",
  lastName: "Doe",
  otherName: "Middle",
  phoneNumber: "+254712345678",
  gender: "Male" | "Female",
  dateOfBirth: "2000-01-01",
  yearOfBirth: 2000,
  idType: "National ID" | "Passport" | "Birth Certificate",
  nemisId: "12345678",
  idNumber: "12345678",
  subCounty: "Garissa Township",
  ward: "Waberi",
  village: "Village Name",
  registrationDate: "2025-01-15T10:30:00.000Z"
}
```

### 2. Applications (`mbms_applications`)
**Structure:**
```javascript
{
  appID: "GSA/2025/0001",
  applicantEmail: "user@example.com",
  applicantName: "John Doe",
  dateSubmitted: "2025-01-15T10:30:00.000Z",
  status: "Pending Submission" | "Pending Ward Review" | "Pending Committee Review" | "Awarded" | "Rejected",
  
  // Personal Details
  personalDetails: {
    firstNames: "John",
    lastName: "Doe",
    regNumber: "B100/123/1111",
    institution: "University of Nairobi",
    subCounty: "Garissa Township",
    ward: "Waberi",
    phoneNumber: "+254712345678",
    email: "user@example.com"
  },
  
  // Family Details
  familyDetails: {
    fatherName: "Father Name",
    fatherOccupation: "Farmer",
    fatherPhone: "+254712345678",
    motherName: "Mother Name",
    motherOccupation: "Teacher",
    motherPhone: "+254712345679",
    guardianName: "Guardian Name",
    guardianRelationship: "Uncle",
    guardianPhone: "+254712345680",
    siblingsPrimary: 2,
    siblingsSecondary: 1,
    siblingsPostSecondary: 0,
    educationPayer: "Father" | "Mother" | "Guardian" | "Self" | "Other",
    payerOtherSpecify: "",
    previousBenefit: "Yes" | "No",
    previousAmount: 0,
    previousYear: 0
  },
  
  // Institution Details
  institutionDetails: {
    principalName: "Principal Name",
    principalPhone: "+254712345681",
    principalComments: "Good student",
    discipline: "Science" | "Arts" | "Technical",
    outstandingFees: 50000
  },
  
  // Financial Details
  financialDetails: {
    monthlyIncome: 50000,
    totalAnnualFees: 200000,
    feeBalance: 150000,
    amountRequested: 100000,
    justification: "Need financial support for education"
  },
  
  // Award Details (if awarded)
  awardDetails: {
    committee_amount_kes: 50000,
    date_awarded: "2025-01-20T10:30:00.000Z",
    justification: "Approved based on need",
    admin_assigned_uid: "fundadmin@garissa.go.ke",
    serialNumber: "GRS/Bursary/001",
    amount: 50000
  },
  
  // Rejection Details (if rejected)
  rejectionReason: "Did not meet minimum requirements",
  rejectionDate: "2025-01-20T10:30:00.000Z"
}
```

### 3. Budget (`mbms_budget`)
**Structure:**
```javascript
{
  total: 50000000, // KSH 50,000,000
  allocated: 900000, // KSH 900,000
  lastUpdated: "2025-01-20T10:30:00.000Z"
}
```

### 4. Application Counter (`mbms_application_counter`)
**Type:** String (number as string)
**Value:** "10" (current count of applications)

### 5. Last Serial Number (`mbms_last_serial`)
**Type:** String (number as string)
**Value:** "5" (last serial number used for awards)

### 6. Admin Session (`mbms_admin`)
**Structure:**
```javascript
{
  email: "fundadmin@garissa.go.ke",
  loginTime: "2025-01-20T10:30:00.000Z"
}
```

### 7. Current User Session (`mbms_current_user`)
**Structure:**
```javascript
{
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  loginTime: "2025-01-20T10:30:00.000Z"
}
```

### 8. Draft Applications (`mbms_application_{email}`)
**Structure:** Same as application but with `status: "Draft"`

## Migration to Backend Database

### Recommended Database: Firebase Firestore or MySQL

**Firebase Firestore Collections:**
- `users` - User accounts
- `applications` - All applications
- `budget` - Budget tracking
- `awards` - Award records
- `reports` - Generated reports

**MySQL Tables:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  app_id VARCHAR(50) UNIQUE NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  status ENUM('Pending Submission', 'Pending Ward Review', 'Pending Committee Review', 'Awarded', 'Rejected'),
  date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount_requested DECIMAL(15,2),
  award_amount DECIMAL(15,2),
  serial_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_email) REFERENCES users(email)
);

CREATE TABLE budget (
  id INT PRIMARY KEY AUTO_INCREMENT,
  total_budget DECIMAL(15,2) NOT NULL,
  allocated DECIMAL(15,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Authentication

**Current:** Simple localStorage-based authentication
**Production:** Use Firebase Auth, JWT tokens, or session-based authentication

## Security Notes

1. **Passwords:** Currently stored in plain text (localStorage demo). In production, use bcrypt hashing.
2. **Data Validation:** Add server-side validation for all inputs.
3. **CORS:** Configure CORS properly for API endpoints.
4. **Rate Limiting:** Implement rate limiting for API calls.
5. **Encryption:** Use HTTPS for all data transmission.

## Access Control

- **Admin:** `fundadmin@garissa.go.ke` (default admin)
- **Users:** Registered applicants
- **Permissions:** Admin can view, award, reject. Users can view their own applications.

