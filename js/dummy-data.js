// Dummy Data Generator for Bursary System Testing
// This script creates 10 realistic dummy records with different statuses

const DUMMY_NAMES = [
  { first: 'Ahmed', middle: 'Hassan', last: 'Mohamed', gender: 'Male' },
  { first: 'Amina', middle: 'Abdi', last: 'Ali', gender: 'Female' },
  { first: 'Omar', middle: 'Ibrahim', last: 'Hussein', gender: 'Male' },
  { first: 'Fatuma', middle: 'Mohamed', last: 'Abdi', gender: 'Female' },
  { first: 'Khalid', middle: 'Ahmed', last: 'Omar', gender: 'Male' },
  { first: 'Halima', middle: 'Hassan', last: 'Ibrahim', gender: 'Female' },
  { first: 'Abdullahi', middle: 'Ali', last: 'Mohamed', gender: 'Male' },
  { first: 'Khadija', middle: 'Omar', last: 'Ahmed', gender: 'Female' },
  { first: 'Mohamed', middle: 'Hassan', last: 'Abdi', gender: 'Male' },
  { first: 'Aisha', middle: 'Ibrahim', last: 'Ali', gender: 'Female' }
];

const SUB_COUNTIES = Object.keys(GARISSA_WARDS);
const INSTITUTIONS = [
  'Garissa University',
  'University of Nairobi',
  'Kenyatta University',
  'Moi University',
  'Technical University of Mombasa',
  'Garissa Technical Training Institute',
  'Wajir Technical College',
  'Mandera Technical College',
  'Garissa High School',
  'Ijara Secondary School'
];

/**
 * Generate dummy applications with different statuses
 */
function generateDummyApplications() {
  const applications = [];
  const now = new Date();
  
  // Award amounts that will total to a reasonable portion of 50M budget
  const awardAmounts = [150000, 200000, 180000, 120000, 250000, 175000, 220000, 190000, 160000, 210000];
  const statuses = ['Awarded', 'Awarded', 'Awarded', 'Awarded', 'Awarded', 'Pending Submission', 'Pending Ward Review', 'Pending Committee Review', 'Rejected', 'Pending Submission'];
  
  // Ensure we have exactly 10 records
  for (let i = 0; i < 10; i++) {
    const name = DUMMY_NAMES[i];
    const subCounty = SUB_COUNTIES[i % SUB_COUNTIES.length];
    const wards = GARISSA_WARDS[subCounty];
    const ward = wards[i % wards.length];
    const institution = INSTITUTIONS[i % INSTITUTIONS.length];
    const status = statuses[i];
    const amountRequested = awardAmounts[i] + Math.floor(Math.random() * 50000);
    const feeBalance = amountRequested + Math.floor(Math.random() * 20000);
    const monthlyIncome = Math.floor(Math.random() * 15000) + 5000;
    
    // Create application object
    const app = {
      appID: `GSA/${now.getFullYear()}/${String(1000 + i).padStart(4, '0')}`,
      applicantEmail: `${name.first.toLowerCase()}.${name.last.toLowerCase()}${i}@example.com`,
      applicantName: `${name.first} ${name.middle} ${name.last}`,
      status: status,
      dateSubmitted: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      subCounty: subCounty,
      ward: ward,
      village: `${ward} Village`,
      personalDetails: {
        firstNames: `${name.first} ${name.middle}`,
        middleName: name.middle,
        lastName: name.last,
        gender: name.gender,
        studentPhone: `07${Math.floor(Math.random() * 90000000) + 10000000}`,
        parentPhone: `07${Math.floor(Math.random() * 90000000) + 10000000}`,
        institution: institution,
        regNumber: `REG${now.getFullYear()}${String(i + 1).padStart(3, '0')}`,
        yearForm: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Form 1', 'Form 2', 'Form 3', 'Form 4'][i % 8],
        courseNature: ['Degree', 'Diploma', 'Certificate', 'Secondary'][i % 4],
        courseDuration: ['4 Years', '3 Years', '2 Years', '4 Years'][i % 4],
        subCounty: subCounty,
        ward: ward
      },
      familyDetails: {
        parentStatus: ['Both alive', 'One dead', 'Both alive', 'One dead'][i % 4],
        hasDisability: i % 3 === 0 ? 'Yes' : 'No',
        disabilityDescription: i % 3 === 0 ? 'Physical disability' : '',
        fatherName: `Father ${name.last}`,
        fatherOccupation: ['Farmer', 'Teacher', 'Businessman', 'Driver'][i % 4],
        motherName: `Mother ${name.last}`,
        motherOccupation: ['Housewife', 'Nurse', 'Teacher', 'Businesswoman'][i % 4],
        guardianName: '',
        guardianOccupation: '',
        totalSiblings: Math.floor(Math.random() * 5) + 2,
        guardianChildren: 0,
        siblingsWorking: Math.floor(Math.random() * 2),
        siblingsSecondary: Math.floor(Math.random() * 3),
        siblingsPostSecondary: Math.floor(Math.random() * 2),
        educationPayer: ['Parent', 'Guardian', 'Parent', 'Self'][i % 4],
        payerOtherSpecify: '',
        previousBenefit: i % 2 === 0 ? 'Yes' : 'No',
        previousAmount: i % 2 === 0 ? Math.floor(Math.random() * 50000) + 10000 : 0,
        previousYear: i % 2 === 0 ? now.getFullYear() - 1 : 0
      },
      institutionDetails: {
        principalName: `Principal ${i + 1}`,
        principalPhone: `07${Math.floor(Math.random() * 90000000) + 10000000}`,
        principalComments: 'Student is disciplined and performs well academically.',
        discipline: ['Excellent', 'Good', 'Very Good', 'Excellent'][i % 4],
        outstandingFees: feeBalance
      },
      financialDetails: {
        monthlyIncome: monthlyIncome,
        totalAnnualFees: amountRequested + Math.floor(Math.random() * 30000),
        feeBalance: feeBalance,
        amountRequested: amountRequested,
        justification: `I am requesting bursary support to continue my education at ${institution}. My family's monthly income is Ksh ${monthlyIncome.toLocaleString()} and we have a fee balance of Ksh ${feeBalance.toLocaleString()}. This support will enable me to complete my studies and contribute to the development of Garissa County.`
      }
    };
    
    // Add award details for awarded applications
    if (status === 'Awarded') {
      const awardedAmount = awardAmounts[i];
      // Use sequential serial numbers starting from 001
      const serialNumber = `GRS/Bursary/${String(i + 1).padStart(3, '0')}`;
      
      app.awardDetails = {
        committee_amount_kes: awardedAmount,
        date_awarded: new Date(now.getTime() - ((i + 1) * 12 * 60 * 60 * 1000)).toISOString(),
        justification: `Application approved based on financial need assessment and academic performance. The committee has allocated Ksh ${awardedAmount.toLocaleString()} to support the student's education.`,
        admin_assigned_uid: 'fundadmin@garissa.go.ke',
        serialNumber: serialNumber,
        amount: awardedAmount
      };
    }
    
    // Add rejection details for rejected applications
    if (status === 'Rejected') {
      app.rejectionDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString();
      app.rejectionReason = 'Application did not meet the minimum requirements for bursary allocation.';
    }
    
    applications.push(app);
  }
  
  return applications;
}

/**
 * Initialize dummy data (only if no applications exist)
 */
function initializeDummyData() {
  const existingApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  
  if (existingApps.length === 0) {
    console.log('Initializing dummy data...');
    const dummyApps = generateDummyApplications();
    localStorage.setItem('mbms_applications', JSON.stringify(dummyApps));
    
    // Update application counter
    localStorage.setItem('mbms_application_counter', '10');
    
    // Set serial number counter to 10 (since we created 10 records with serials 001-010)
    localStorage.setItem('mbms_last_serial', '10');
    
    // Initialize budget if not already done
    if (typeof initializeBudget !== 'undefined') {
      initializeBudget();
    }
    
    // Sync budget with awarded applications
    if (typeof syncBudgetWithAwards !== 'undefined') {
      syncBudgetWithAwards();
    }
    
    console.log('✅ Dummy data initialized:', dummyApps.length, 'applications');
    console.log('Sample application:', dummyApps[0]);
    
    // Verify data was saved
    const verifyData = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    console.log('Verified saved data:', verifyData.length, 'applications');
    
    // Return true - the calling function will handle display refresh
    return true;
  } else {
    const confirmLoad = confirm('Applications already exist. Do you want to replace them with demo data?\n\n⚠️ This will delete all existing applications!');
    if (confirmLoad) {
      const dummyApps = generateDummyApplications();
      localStorage.setItem('mbms_applications', JSON.stringify(dummyApps));
      localStorage.setItem('mbms_application_counter', '10');
      localStorage.setItem('mbms_last_serial', '10');
      
      if (typeof initializeBudget !== 'undefined') {
        initializeBudget();
      }
      if (typeof syncBudgetWithAwards !== 'undefined') {
        syncBudgetWithAwards();
      }
      
      // Return true - the calling function will handle display refresh
      return true;
    }
    return false;
  }
}

/**
 * Clear all dummy data (for testing)
 */
function clearDummyData() {
  if (confirm('Are you sure you want to clear all applications? This cannot be undone.')) {
    localStorage.removeItem('mbms_applications');
    localStorage.removeItem('mbms_application_counter');
    localStorage.removeItem('mbms_last_serial');
    localStorage.setItem('mbms_budget_allocated', '0');
    alert('✅ All data cleared. Refresh the page to see changes.');
    return true;
  }
  return false;
}

// Export functions
window.generateDummyApplications = generateDummyApplications;
window.initializeDummyData = initializeDummyData;
window.clearDummyData = clearDummyData;

