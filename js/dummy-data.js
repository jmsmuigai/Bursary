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
  
  // Create 10 records - ALL PENDING (none awarded) - ready for review and award
  // Statuses: Mix of Pending Ward Review, Pending Committee Review, and Pending Submission
  // This demonstrates the system is ready for the first applicant
  const statuses = [
    'Pending Ward Review', 
    'Pending Ward Review', 
    'Pending Ward Review', 
    'Pending Committee Review', 
    'Pending Committee Review', 
    'Pending Committee Review', 
    'Pending Submission', 
    'Pending Submission', 
    'Pending Ward Review', 
    'Pending Committee Review'
  ];
  
  // Distribute across all sub-counties and their wards
  const allSubCounties = Object.keys(GARISSA_WARDS);
  const subCountyWardPairs = [];
  
  // Create pairs of (subCounty, ward) for distribution
  allSubCounties.forEach(subCounty => {
    const wards = GARISSA_WARDS[subCounty];
    wards.forEach(ward => {
      subCountyWardPairs.push({ subCounty, ward });
    });
  });
  
  // Ensure we have exactly 10 records, distributed across sub-counties and wards
  for (let i = 0; i < 10; i++) {
    const name = DUMMY_NAMES[i];
    // Distribute evenly across sub-counties and wards
    const locationPair = subCountyWardPairs[i % subCountyWardPairs.length];
    const subCounty = locationPair.subCounty;
    const ward = locationPair.ward;
    
    // Ensure subCounty and ward are set at root level for filtering
    const institution = INSTITUTIONS[i % INSTITUTIONS.length];
    const status = statuses[i];
    const amountRequested = 150000 + Math.floor(Math.random() * 100000);
    const feeBalance = amountRequested + Math.floor(Math.random() * 20000);
    const monthlyIncome = Math.floor(Math.random() * 15000) + 5000;
    
    // Create application object
    const app = {
      appID: `GSA/${now.getFullYear()}/${String(1000 + i).padStart(4, '0')}`,
      applicantEmail: `${name.first.toLowerCase()}.${name.last.toLowerCase()}${i}@example.com`,
      applicantName: `${name.first} ${name.middle} ${name.last}`,
      status: status,
      dateSubmitted: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      subCounty: subCounty, // CRITICAL: Set at root level for filtering
      ward: ward, // CRITICAL: Set at root level for filtering
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
    
    // NO AWARD DETAILS - All records are pending review
    // Awards will be created when admin reviews and approves applications
    // NO REJECTION DETAILS - All records are pending, ready for review
    
    applications.push(app);
  }
  
  return applications;
}

/**
 * Initialize dummy data (only if no applications exist)
 */
function initializeDummyData() {
  try {
    console.log('🔄 Checking for existing applications...');
    const existingApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    console.log('Found', existingApps.length, 'existing applications');
    
    if (existingApps.length === 0) {
      console.log('🔄 Initializing dummy data (10 records with various statuses)...');
      const dummyApps = generateDummyApplications();
      console.log('Generated', dummyApps.length, 'dummy applications');
      
      // CRITICAL: Verify data structure before saving
      if (!dummyApps || dummyApps.length === 0) {
        console.error('❌ CRITICAL: No dummy applications generated!');
        return false;
      }
      
      // Save to localStorage
      localStorage.setItem('mbms_applications', JSON.stringify(dummyApps));
      console.log('✅ Saved', dummyApps.length, 'applications to localStorage');
      
      // Update application counter
      localStorage.setItem('mbms_application_counter', '10');
      localStorage.setItem('mbms_last_serial', '10');
      
      // Initialize budget
      if (typeof initializeBudget !== 'undefined') {
        initializeBudget();
      }
      if (typeof syncBudgetWithAwards !== 'undefined') {
        syncBudgetWithAwards();
      }
      
      // CRITICAL VERIFICATION: Re-read from localStorage to confirm save
      const verify = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      console.log('✅ Verification: Re-read', verify.length, 'applications from localStorage');
      
      if (verify.length === 0) {
        console.error('❌ CRITICAL ERROR: Applications not saved to localStorage!');
        alert('⚠️ Error: Dummy data could not be saved. Please refresh the page.');
        return false;
      }
      
      const awardedCount = verify.filter(a => a.status === 'Awarded').length;
      const pendingCount = verify.filter(a => a.status?.includes('Pending')).length;
      const rejectedCount = verify.filter(a => a.status === 'Rejected').length;
      const totalAwarded = verify.filter(a => a.status === 'Awarded' && a.awardDetails)
        .reduce((sum, a) => sum + (a.awardDetails?.committee_amount_kes || 0), 0);
      
      console.log('✅ Dummy data initialized:', verify.length, 'applications');
      console.log(`   - ALL PENDING: ${verify.length} (Ready for review and award)`);
      console.log(`   - Awarded: ${awardedCount} (Total: KSH ${totalAwarded.toLocaleString()})`);
      console.log(`   - Pending: ${pendingCount}`);
      console.log(`   - Rejected: ${rejectedCount}`);
      console.log(`   - Budget: KSH 50,000,000 (Baseline - ready for first award)`);
      console.log('Sample applications:', verify.slice(0, 3).map(a => ({ 
        id: a.appID, 
        name: a.applicantName, 
        status: a.status,
        subCounty: a.subCounty || a.personalDetails?.subCounty,
        ward: a.ward || a.personalDetails?.ward
      })));
      
      // Force a storage event to trigger updates
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'mbms_applications',
          newValue: localStorage.getItem('mbms_applications'),
          oldValue: null,
          storageArea: localStorage
        }));
        console.log('✅ Storage event dispatched');
      } catch (e) {
        console.log('Storage event dispatch error:', e);
      }
      
      // Also dispatch custom event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'loaded', count: verify.length }
      }));
      console.log('✅ Custom event dispatched');
      
      return true;
    } else {
      console.log('✅ Applications already exist:', existingApps.length);
      // Still return true to allow refresh
      return true;
    }
  } catch (error) {
    console.error('❌ Error initializing dummy data:', error);
    alert('Error loading dummy data: ' + error.message);
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

// Force load dummy data function (for testing)
window.forceLoadDummyData = function() {
  console.log('🔄 Force loading dummy data...');
  
  // Clear existing data
  localStorage.removeItem('mbms_applications');
  localStorage.removeItem('mbms_application_counter');
  localStorage.removeItem('mbms_last_serial');
  
  // Generate and save
  if (initializeDummyData()) {
    // Force refresh
    if (typeof refreshApplications === 'function') {
      refreshApplications();
    }
    
    // Show success message
    alert('✅ Dummy data loaded successfully!\n\n10 records created:\n- ALL PENDING REVIEW (ready for award)\n- Distributed across all Garissa sub-counties\n- From different schools and institutions\n- NONE AWARDED - ready for first review\n\nData is now visible in the scrollable table!\n\n📊 Visualizations will show data automatically.');
    
    // Reload page to ensure display
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    alert('❌ Error loading dummy data. Please check console for details.');
  }
};

// Export functions
window.generateDummyApplications = generateDummyApplications;
window.initializeDummyData = initializeDummyData;
window.clearDummyData = clearDummyData;

