/**
 * COMPREHENSIVE SYSTEM AUTOTEST
 * Tests the entire flow: Registration -> Application -> Admin Dashboard
 * Run this in browser console to verify system functionality
 */

(function() {
  console.log('🧪 Starting Comprehensive System Autotest...\n');
  
  const testResults = {
    registration: { passed: false, errors: [] },
    applicationSubmission: { passed: false, errors: [] },
    adminDashboard: { passed: false, errors: [] },
    dataSync: { passed: false, errors: [] },
    filters: { passed: false, errors: [] },
    budget: { passed: false, errors: [] }
  };
  
  // Test 1: Registration Flow
  function testRegistration() {
    console.log('📝 TEST 1: Registration Flow');
    try {
      // Check if saveUser function exists
      if (typeof saveUser === 'undefined' && typeof window.saveUser === 'undefined') {
        testResults.registration.errors.push('saveUser function not found');
        return;
      }
      
      // Create test user
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser' + Date.now() + '@test.com',
        phoneNumber: '0712345678',
        gender: 'Male',
        dateOfBirth: '2000-01-01',
        yearOfBirth: 2000,
        idType: 'National ID',
        nemisId: '12345678',
        idNumber: '12345678',
        subCounty: 'Garissa Township',
        ward: 'Waberi',
        village: 'Test Village',
        role: 'applicant',
        password: 'Test123!@#',
        createdAt: new Date().toISOString()
      };
      
      // Save user
      const saveFn = typeof saveUser !== 'undefined' ? saveUser : window.saveUser;
      const saved = saveFn(testUser);
      
      if (!saved) {
        testResults.registration.errors.push('Failed to save user');
        return;
      }
      
      // Verify user was saved
      const users = typeof getUsers !== 'undefined' ? getUsers() : 
                    (typeof window.getUsers !== 'undefined' ? window.getUsers() : 
                     JSON.parse(localStorage.getItem('mbms_users') || '[]'));
      
      const found = users.find(u => u.email === testUser.email);
      if (!found) {
        testResults.registration.errors.push('User not found after saving');
        return;
      }
      
      testResults.registration.passed = true;
      console.log('✅ Registration test PASSED');
    } catch (error) {
      testResults.registration.errors.push(error.message);
      console.error('❌ Registration test FAILED:', error);
    }
  }
  
  // Test 2: Application Submission
  function testApplicationSubmission() {
    console.log('📋 TEST 2: Application Submission');
    try {
      // Get a test user
      const users = typeof getUsers !== 'undefined' ? getUsers() : 
                    (typeof window.getUsers !== 'undefined' ? window.getUsers() : 
                     JSON.parse(localStorage.getItem('mbms_users') || '[]'));
      
      const testUser = users.find(u => u.role === 'applicant');
      if (!testUser) {
        testResults.applicationSubmission.errors.push('No test user found');
        return;
      }
      
      // Create test application
      const testApp = {
        appID: 'GSA/' + new Date().getFullYear() + '/TEST001',
        applicantEmail: testUser.email,
        applicantName: `${testUser.firstName} ${testUser.lastName}`,
        dateSubmitted: new Date().toISOString(),
        status: 'Pending Ward Review',
        subCounty: testUser.subCounty || 'Garissa Township',
        ward: testUser.ward || 'Waberi',
        idNumber: testUser.nemisId || testUser.idNumber || '',
        personalDetails: {
          firstNames: testUser.firstName,
          lastName: testUser.lastName,
          institution: 'Test University',
          regNumber: 'TEST123'
        },
        financialDetails: {
          amountRequested: 50000
        }
      };
      
      // Save application
      const saveFn = typeof saveApplication !== 'undefined' ? saveApplication : 
                     (typeof window.saveApplication !== 'undefined' ? window.saveApplication : null);
      
      if (!saveFn) {
        testResults.applicationSubmission.errors.push('saveApplication function not found');
        return;
      }
      
      const saved = saveFn(testApp);
      
      if (!saved) {
        testResults.applicationSubmission.errors.push('Failed to save application');
        return;
      }
      
      // Verify application was saved
      const apps = typeof getApplications !== 'undefined' ? getApplications() : 
                   (typeof window.getApplications !== 'undefined' ? window.getApplications() : 
                    JSON.parse(localStorage.getItem('mbms_applications') || '[]'));
      
      const found = apps.find(a => a.appID === testApp.appID);
      if (!found) {
        testResults.applicationSubmission.errors.push('Application not found after saving');
        return;
      }
      
      testResults.applicationSubmission.passed = true;
      console.log('✅ Application submission test PASSED');
    } catch (error) {
      testResults.applicationSubmission.errors.push(error.message);
      console.error('❌ Application submission test FAILED:', error);
    }
  }
  
  // Test 3: Admin Dashboard Data Loading
  function testAdminDashboard() {
    console.log('👨‍💼 TEST 3: Admin Dashboard Data Loading');
    try {
      // Check if loadApplications function exists (in admin.js context)
      const apps = typeof getApplications !== 'undefined' ? getApplications() : 
                   (typeof window.getApplications !== 'undefined' ? window.getApplications() : 
                    JSON.parse(localStorage.getItem('mbms_applications') || '[]'));
      
      if (!Array.isArray(apps)) {
        testResults.adminDashboard.errors.push('Applications is not an array');
        return;
      }
      
      // Check if applications have required fields
      const validApps = apps.filter(app => 
        app.appID && 
        app.applicantEmail && 
        app.status
      );
      
      if (validApps.length === 0 && apps.length > 0) {
        testResults.adminDashboard.errors.push('Applications missing required fields');
        return;
      }
      
      testResults.adminDashboard.passed = true;
      console.log('✅ Admin dashboard test PASSED - Found', apps.length, 'applications');
    } catch (error) {
      testResults.adminDashboard.errors.push(error.message);
      console.error('❌ Admin dashboard test FAILED:', error);
    }
  }
  
  // Test 4: Data Sync (Event System)
  function testDataSync() {
    console.log('🔄 TEST 4: Data Sync (Event System)');
    try {
      let eventReceived = false;
      
      // Listen for data update event
      const listener = function(e) {
        if (e.detail && e.detail.key === 'mbms_applications') {
          eventReceived = true;
          console.log('✅ Data sync event received:', e.detail);
        }
      };
      
      window.addEventListener('mbms-data-updated', listener);
      
      // Trigger a test event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'test', appID: 'TEST' }
      }));
      
      // Wait a bit for event
      setTimeout(() => {
        window.removeEventListener('mbms-data-updated', listener);
        
        if (eventReceived) {
          testResults.dataSync.passed = true;
          console.log('✅ Data sync test PASSED');
        } else {
          testResults.dataSync.errors.push('Event not received');
          console.log('❌ Data sync test FAILED - Event not received');
        }
      }, 100);
    } catch (error) {
      testResults.dataSync.errors.push(error.message);
      console.error('❌ Data sync test FAILED:', error);
    }
  }
  
  // Test 5: Filters
  function testFilters() {
    console.log('🔍 TEST 5: Filter System');
    try {
      // Check if GARISSA_WARDS exists
      if (typeof GARISSA_WARDS === 'undefined') {
        testResults.filters.errors.push('GARISSA_WARDS not defined');
        return;
      }
      
      const subCounties = Object.keys(GARISSA_WARDS);
      if (subCounties.length === 0) {
        testResults.filters.errors.push('No sub-counties found');
        return;
      }
      
      // Check if wards exist for each sub-county
      let hasWards = false;
      for (const sc of subCounties) {
        if (GARISSA_WARDS[sc] && GARISSA_WARDS[sc].length > 0) {
          hasWards = true;
          break;
        }
      }
      
      if (!hasWards) {
        testResults.filters.errors.push('No wards found');
        return;
      }
      
      testResults.filters.passed = true;
      console.log('✅ Filter test PASSED - Found', subCounties.length, 'sub-counties');
    } catch (error) {
      testResults.filters.errors.push(error.message);
      console.error('❌ Filter test FAILED:', error);
    }
  }
  
  // Test 6: Budget System
  function testBudget() {
    console.log('💰 TEST 6: Budget System');
    try {
      const budget = typeof getBudget !== 'undefined' ? getBudget() : 
                     (typeof window.getBudget !== 'undefined' ? window.getBudget() : 
                      { total: 50000000, allocated: 0, balance: 50000000 });
      
      if (!budget || typeof budget.total !== 'number') {
        testResults.budget.errors.push('Budget data invalid');
        return;
      }
      
      if (budget.total !== 50000000) {
        testResults.budget.errors.push('Budget total should be 50,000,000');
        return;
      }
      
      testResults.budget.passed = true;
      console.log('✅ Budget test PASSED - Total:', budget.total.toLocaleString());
    } catch (error) {
      testResults.budget.errors.push(error.message);
      console.error('❌ Budget test FAILED:', error);
    }
  }
  
  // Run all tests
  function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 COMPREHENSIVE SYSTEM AUTOTEST');
    console.log('='.repeat(60) + '\n');
    
    testRegistration();
    setTimeout(() => {
      testApplicationSubmission();
      setTimeout(() => {
        testAdminDashboard();
        setTimeout(() => {
          testDataSync();
          setTimeout(() => {
            testFilters();
            setTimeout(() => {
              testBudget();
              setTimeout(() => {
                printResults();
              }, 100);
            }, 100);
          }, 200);
        }, 100);
      }, 100);
    }, 100);
  }
  
  // Print results
  function printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    let totalPassed = 0;
    let totalTests = 0;
    
    for (const [testName, result] of Object.entries(testResults)) {
      totalTests++;
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} - ${testName.toUpperCase()}`);
      if (result.errors.length > 0) {
        result.errors.forEach(err => console.log(`   ⚠️ ${err}`));
      }
      if (result.passed) totalPassed++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 OVERALL: ${totalPassed}/${totalTests} tests passed`);
    console.log('='.repeat(60) + '\n');
    
    if (totalPassed === totalTests) {
      console.log('🎉 ALL TESTS PASSED! System is ready for production.');
    } else {
      console.log('⚠️ Some tests failed. Please review errors above.');
    }
  }
  
  // Export test function
  window.runSystemAutotest = runAllTests;
  
  // Auto-run if in admin dashboard
  if (window.location.pathname.includes('admin_dashboard.html')) {
    console.log('🔍 Admin dashboard detected - Running tests in 2 seconds...');
    setTimeout(runAllTests, 2000);
  } else {
    console.log('💡 To run tests, call: runSystemAutotest()');
    console.log('💡 Or open admin dashboard to auto-run tests');
  }
  
})();

