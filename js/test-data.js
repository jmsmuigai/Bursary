// Test Data Generator - 5 Records (3 Rejected, 2 Pending)
// This will NOT affect budget since no records are awarded

const TEST_NAMES = [
  { first: 'Hassan', last: 'Mohamed', middle: 'Ahmed' },
  { first: 'Amina', last: 'Abdi', middle: 'Hassan' },
  { first: 'Omar', last: 'Ibrahim', middle: 'Hussein' },
  { first: 'Fatuma', last: 'Mohamed', middle: 'Abdi' },
  { first: 'Khalid', last: 'Ahmed', middle: 'Omar' }
];

const TEST_SUB_COUNTIES = [
  'Garissa Township',
  'Lagdera',
  'Dadaab',
  'Fafi',
  'Balambala'
];

const TEST_WARDS = [
  'Waberi',
  'Benane',
  'Labasigale',
  'Fafi',
  'Sankuri'
];

const TEST_INSTITUTIONS = [
  'Garissa University',
  'University of Nairobi',
  'Kenyatta University',
  'Moi University',
  'Technical University of Mombasa'
];

/**
 * Generate 5 test applications (3 Rejected, 2 Pending)
 */
function generateTestApplications() {
  const year = new Date().getFullYear();
  const baseCounter = parseInt(localStorage.getItem('mbms_application_counter') || '0');
  
  const testApps = [];
  
  // 3 Rejected applications
  for (let i = 0; i < 3; i++) {
    const name = TEST_NAMES[i];
    const appID = `GSA/${year}/${(baseCounter + i + 1).toString().padStart(4, '0')}`;
    const amountRequested = [150000, 200000, 180000][i];
    
    testApps.push({
      appID: appID,
      applicantEmail: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@test.com`,
      applicantName: `${name.first} ${name.middle} ${name.last}`,
      dateSubmitted: new Date(Date.now() - (i + 1) * 86400000).toISOString(), // Different dates
      status: 'Rejected',
      rejectionDate: new Date(Date.now() - i * 86400000).toISOString(),
      rejectionReason: [
        'Application did not meet minimum academic requirements',
        'Incomplete documentation provided',
        'Family income exceeds eligibility threshold'
      ][i],
      subCounty: TEST_SUB_COUNTIES[i],
      ward: TEST_WARDS[i],
      personalDetails: {
        firstNames: `${name.first} ${name.middle}`,
        lastName: name.last,
        institution: TEST_INSTITUTIONS[i],
        subCounty: TEST_SUB_COUNTIES[i],
        ward: TEST_WARDS[i],
        regNumber: `REG${year}${(i + 1).toString().padStart(3, '0')}`,
        gender: i % 2 === 0 ? 'Male' : 'Female'
      },
      financialDetails: {
        monthlyIncome: [30000, 45000, 35000][i],
        totalAnnualFees: [250000, 300000, 280000][i],
        feeBalance: [200000, 250000, 230000][i],
        amountRequested: amountRequested,
        justification: `Need financial support for education at ${TEST_INSTITUTIONS[i]}. Family monthly income is Ksh ${[30000, 45000, 35000][i]} and we have a fee balance of Ksh ${[200000, 250000, 230000][i]}.`
      },
      familyDetails: {
        fatherName: `Father ${name.last}`,
        fatherOccupation: 'Farmer',
        motherName: `Mother ${name.last}`,
        motherOccupation: 'Teacher'
      },
      institutionDetails: {
        principalName: `Principal ${i + 1}`,
        principalPhone: `+25471234567${i}`,
        outstandingFees: [200000, 250000, 230000][i]
      }
    });
  }
  
  // 2 Pending applications
  for (let i = 3; i < 5; i++) {
    const name = TEST_NAMES[i];
    const appID = `GSA/${year}/${(baseCounter + i + 1).toString().padStart(4, '0')}`;
    const amountRequested = [175000, 195000][i - 3];
    
    testApps.push({
      appID: appID,
      applicantEmail: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@test.com`,
      applicantName: `${name.first} ${name.middle} ${name.last}`,
      dateSubmitted: new Date(Date.now() - (i - 2) * 86400000).toISOString(),
      status: 'Pending Submission',
      subCounty: TEST_SUB_COUNTIES[i],
      ward: TEST_WARDS[i],
      personalDetails: {
        firstNames: `${name.first} ${name.middle}`,
        lastName: name.last,
        institution: TEST_INSTITUTIONS[i],
        subCounty: TEST_SUB_COUNTIES[i],
        ward: TEST_WARDS[i],
        regNumber: `REG${year}${(i + 1).toString().padStart(3, '0')}`,
        gender: i % 2 === 0 ? 'Male' : 'Female'
      },
      financialDetails: {
        monthlyIncome: [25000, 30000][i - 3],
        totalAnnualFees: [270000, 290000][i - 3],
        feeBalance: [220000, 240000][i - 3],
        amountRequested: amountRequested,
        justification: `Requesting bursary support to continue education at ${TEST_INSTITUTIONS[i]}. Family monthly income is Ksh ${[25000, 30000][i - 3]} and we have a fee balance of Ksh ${[220000, 240000][i - 3]}.`
      },
      familyDetails: {
        fatherName: `Father ${name.last}`,
        fatherOccupation: 'Business',
        motherName: `Mother ${name.last}`,
        motherOccupation: 'Nurse'
      },
      institutionDetails: {
        principalName: `Principal ${i + 1}`,
        principalPhone: `+25471234567${i}`,
        outstandingFees: [220000, 240000][i - 3]
      }
    });
  }
  
  return testApps;
}

/**
 * Initialize test data (5 records: 3 Rejected, 2 Pending)
 */
function initializeTestData() {
  try {
    const existingApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const existingCount = existingApps.length;
    
    // Generate test applications
    const testApps = generateTestApplications();
    
    // Merge with existing applications (avoid duplicates)
    const existingAppIDs = new Set(existingApps.map(app => app.appID));
    const newTestApps = testApps.filter(app => !existingAppIDs.has(app.appID));
    
    if (newTestApps.length === 0) {
      console.log('Test data already exists');
      return false;
    }
    
    // Add new test apps
    const allApps = [...existingApps, ...newTestApps];
    localStorage.setItem('mbms_applications', JSON.stringify(allApps));
    
    // Update counter
    const newCount = allApps.length;
    const currentCounter = parseInt(localStorage.getItem('mbms_application_counter') || '0');
    if (currentCounter < newCount) {
      localStorage.setItem('mbms_application_counter', newCount.toString());
    }
    
    // Ensure budget is initialized (but NOT affected since no awards)
    if (typeof initializeBudget !== 'undefined') {
      initializeBudget();
    }
    if (typeof syncBudgetWithAwards !== 'undefined') {
      syncBudgetWithAwards(); // This will keep budget at 0 allocated since no awards
    }
    
    console.log(`✅ Test data initialized: ${newTestApps.length} new applications added`);
    console.log(`   - 3 Rejected applications`);
    console.log(`   - 2 Pending applications`);
    console.log(`   - Total applications: ${newCount}`);
    console.log(`   - Budget: KSH 50,000,000 (unchanged - no awards)`);
    
    return true;
  } catch (error) {
    console.error('Error initializing test data:', error);
    return false;
  }
}

/**
 * Clear test data (optional - for testing)
 */
function clearTestData() {
  const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  const filtered = apps.filter(app => !app.applicantEmail?.includes('@test.com'));
  localStorage.setItem('mbms_applications', JSON.stringify(filtered));
  console.log('Test data cleared');
}

// Export functions
window.generateTestApplications = generateTestApplications;
window.initializeTestData = initializeTestData;
window.clearTestData = clearTestData;

