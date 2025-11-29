// CREATE TEST DATA - Generates 10 test application records for system testing
// These records will be used to test the system before receiving real applications

(function() {
  'use strict';
  
  console.log('📝 Creating 10 test application records...');
  
  // Garissa Sub-Counties and Wards
  const GARISSA_WARDS = {
    "Garissa Township": ["Waberi", "Galbet", "Township", "Iftin"],
    "Lagdera": ["Modogashe", "Benane", "Goreale", "Maalimin", "Sabena", "Baraki"],
    "Dadaab": ["Dertu", "Dadaab", "Labasigale", "Damajale", "Liboi", "Abakaile"],
    "Fafi": ["Bura", "Dekaharia", "Jarajila", "Fafi", "Nanighi"],
    "Balambala": ["Balambala", "Danyere", "Jarajara", "Saka", "Sankuri"],
    "Ijara": ["Hulugho", "Sangailu", "Ijara", "Masalani"]
  };
  
  // Sample names (Garissa County typical names)
  const firstNames = ["Ahmed", "Hassan", "Abdi", "Mohamed", "Ibrahim", "Omar", "Ali", "Abdullahi", "Yusuf", "Ismail"];
  const lastNames = ["Hassan", "Ali", "Mohamed", "Ibrahim", "Omar", "Abdi", "Yusuf", "Ahmed", "Abdullahi", "Ismail"];
  
  // Sample institutions
  const institutions = [
    "Garissa University",
    "University of Nairobi",
    "Kenyatta University",
    "Moi University",
    "Technical University of Kenya",
    "Jomo Kenyatta University",
    "Maseno University",
    "Egerton University",
    "Wajir Technical Training Institute",
    "Garissa Technical Training Institute"
  ];
  
  // Sample courses
  const courses = [
    "Bachelor of Science in Computer Science",
    "Bachelor of Education (Arts)",
    "Bachelor of Commerce",
    "Bachelor of Science in Nursing",
    "Diploma in Information Technology",
    "Bachelor of Science in Agriculture",
    "Diploma in Business Management",
    "Bachelor of Science in Public Health",
    "Diploma in Electrical Engineering",
    "Bachelor of Arts in Development Studies"
  ];
  
  // Generate test applications
  function generateTestApplications() {
    const applications = [];
    const subCounties = Object.keys(GARISSA_WARDS);
    
    for (let i = 1; i <= 10; i++) {
      const subCounty = subCounties[i % subCounties.length];
      const wards = GARISSA_WARDS[subCounty];
      const ward = wards[i % wards.length];
      const firstName = firstNames[i - 1];
      const lastName = lastNames[i - 1];
      const email = `test.applicant${i}@garissa.test`;
      const phoneNumber = `0712${String(i).padStart(6, '0')}`;
      const idNumber = `1234567${String(i).padStart(2, '0')}`;
      
      // Vary statuses
      const statuses = ['Pending Ward Review', 'Pending Committee Review', 'Awarded', 'Rejected'];
      const status = statuses[i % statuses.length];
      
      // Vary amounts
      const amounts = [25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000];
      const amountRequested = amounts[i % amounts.length];
      const amountAwarded = status === 'Awarded' ? amountRequested : null;
      
      // Generate application ID
      const year = new Date().getFullYear();
      const appID = `GSA/${year}/${String(i).padStart(4, '0')}`;
      
      const application = {
        appID: appID,
        applicantName: `${firstName} ${lastName}`,
        applicantEmail: email,
        applicantPhone: phoneNumber,
        submissionDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        status: status,
        
        // Personal Details
        personalDetails: {
          firstNames: firstName,
          lastName: lastName,
          idNumber: idNumber,
          dateOfBirth: `199${i % 10}/01/15`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          phoneNumber: phoneNumber,
          email: email,
          subCounty: subCounty,
          ward: ward,
          location: `${ward}, ${subCounty}`,
          postalAddress: `P.O. Box ${100 + i}, Garissa`
        },
        
        // Institution Details
        institutionDetails: {
          institutionName: institutions[i - 1],
          courseName: courses[i - 1],
          yearOfStudy: i <= 3 ? 'Year 1' : i <= 6 ? 'Year 2' : i <= 8 ? 'Year 3' : 'Year 4',
          admissionNumber: `ADM${year}${String(i).padStart(4, '0')}`,
          feeBalance: amountRequested + (i * 1000)
        },
        
        // Financial Details
        financialDetails: {
          amountRequested: amountRequested,
          feeBalance: amountRequested + (i * 1000),
          monthlyIncome: 5000 + (i * 500),
          familyIncome: 10000 + (i * 1000),
          dependents: i % 5 + 1
        },
        
        // Family Details
        familyDetails: {
          guardianName: `Guardian ${firstName}`,
          guardianPhone: `0722${String(i).padStart(6, '0')}`,
          relationship: i % 2 === 0 ? 'Father' : 'Mother',
          occupation: i % 3 === 0 ? 'Farmer' : i % 3 === 1 ? 'Business' : 'Employee'
        },
        
        // Sub-county and ward
        subCounty: subCounty,
        ward: ward,
        institution: institutions[i - 1],
        amountRequested: amountRequested
      };
      
      // Add award details if awarded
      if (status === 'Awarded' && amountAwarded) {
        application.awardDetails = {
          amount: amountAwarded,
          committee_amount_kes: amountAwarded,
          awardDate: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)).toISOString(),
          serialNumber: `GSA-${year}-${String(i).padStart(4, '0')}`
        };
      }
      
      // Add rejection details if rejected
      if (status === 'Rejected') {
        application.rejectionDetails = {
          reason: i % 2 === 0 ? 'Incomplete documentation' : 'Does not meet criteria',
          rejectionDate: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)).toISOString()
        };
      }
      
      applications.push(application);
    }
    
    return applications;
  }
  
  // Load test applications to database
  async function loadTestApplications() {
    try {
      const testApps = generateTestApplications();
      console.log('✅ Generated', testApps.length, 'test applications');
      
      // Save to localStorage
      localStorage.setItem('mbms_applications', JSON.stringify(testApps));
      console.log('✅ Saved to localStorage');
      
      // Save to Firebase if available
      if (typeof saveApplicationToDB !== 'undefined') {
        console.log('📦 Saving to Firebase...');
        for (const app of testApps) {
          try {
            await saveApplicationToDB(app);
          } catch (e) {
            console.warn('Firebase save error for', app.appID, ':', e);
          }
        }
        console.log('✅ Saved to Firebase');
      } else if (typeof getApplicationsFirebase !== 'undefined') {
        console.log('📦 Saving to Firebase (direct)...');
        for (const app of testApps) {
          try {
            await saveApplicationFirebase(app);
          } catch (e) {
            console.warn('Firebase save error for', app.appID, ':', e);
          }
        }
        console.log('✅ Saved to Firebase (direct)');
      }
      
      // Update application counter
      localStorage.setItem('mbms_application_counter', '10');
      
      // Update budget if there are awarded applications
      const awarded = testApps.filter(a => a.status === 'Awarded');
      if (awarded.length > 0) {
        const totalAwarded = awarded.reduce((sum, app) => {
          return sum + (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
        }, 0);
        
        const currentAllocated = parseFloat(localStorage.getItem('mbms_budget_allocated') || '0');
        const newAllocated = currentAllocated + totalAwarded;
        localStorage.setItem('mbms_budget_allocated', newAllocated.toString());
        localStorage.setItem('mbms_budget_total', '50000000');
        
        console.log('💰 Budget updated:', {
          total: 50000000,
          allocated: newAllocated,
          balance: 50000000 - newAllocated
        });
        
        // Update Firebase budget if available
        if (typeof updateBudgetFirebase !== 'undefined') {
          try {
            await updateBudgetFirebase({
              total: 50000000,
              allocated: newAllocated,
              balance: 50000000 - newAllocated
            });
            console.log('✅ Budget updated in Firebase');
          } catch (e) {
            console.warn('Firebase budget update error:', e);
          }
        }
      }
      
      console.log('✅ Test data loaded successfully!');
      console.log('📊 Summary:', {
        total: testApps.length,
        pending: testApps.filter(a => a.status.includes('Pending')).length,
        awarded: testApps.filter(a => a.status === 'Awarded').length,
        rejected: testApps.filter(a => a.status === 'Rejected').length
      });
      
      return testApps;
    } catch (error) {
      console.error('❌ Error loading test data:', error);
      throw error;
    }
  }
  
  // Export function
  window.createTestData = loadTestApplications;
  
  // Auto-load if on admin dashboard
  if (window.location.pathname.includes('admin_dashboard')) {
    // Check if test data already exists
    const existing = localStorage.getItem('mbms_applications');
    if (!existing || JSON.parse(existing).length === 0) {
      console.log('📝 No applications found, creating test data...');
      setTimeout(() => {
        loadTestApplications().then(() => {
          // Refresh the page to show test data
          if (typeof refreshApplications === 'function') {
            refreshApplications();
          } else {
            window.location.reload();
          }
        }).catch(e => {
          console.error('Failed to load test data:', e);
        });
      }, 1000);
    } else {
      console.log('✅ Applications already exist, skipping test data creation');
    }
  }
  
  console.log('✅ Create Test Data script loaded');
})();

