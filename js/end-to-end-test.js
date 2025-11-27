// END-TO-END SYSTEM TEST - Simulates complete workflow from registration to award
// This script tests the entire system: registration → application → award → PDF download

(function() {
  'use strict';
  
  console.log('🧪 END-TO-END SYSTEM TEST - Starting complete workflow simulation...');
  
  /**
   * Simulate complete workflow: Registration → Application → Award → PDF Download
   */
  window.simulateCompleteWorkflow = async function() {
    console.log('🚀 Starting complete workflow simulation...');
    
    const testResults = {
      registration: { success: false, error: null },
      application: { success: false, error: null },
      adminAward: { success: false, error: null },
      pdfDownload: { success: false, error: null }
    };
    
    try {
      // ============================================
      // STEP 1: CREATE TEST APPLICANT (Registration)
      // ============================================
      console.log('\n📝 STEP 1: Creating test applicant...');
      
      const testApplicant = {
        firstName: 'Test',
        lastName: 'Applicant',
        otherName: 'Auto',
        email: 'test.applicant@garissa.test',
        phoneNumber: '0712345678',
        gender: 'Male',
        dateOfBirth: '2000-01-15',
        yearOfBirth: 2000,
        idType: 'National ID',
        nemisId: '12345678',
        idNumber: '12345678',
        subCounty: 'Garissa Township',
        ward: 'Waberi',
        village: 'Test Village',
        role: 'applicant',
        password: 'Test@1234',
        createdAt: new Date().toISOString()
      };
      
      // Save test applicant to database
      try {
        const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
        // Remove existing test applicant if exists
        const filteredUsers = users.filter(u => u.email !== testApplicant.email);
        filteredUsers.push(testApplicant);
        localStorage.setItem('mbms_users', JSON.stringify(filteredUsers));
        
        // Set as current user
        sessionStorage.setItem('mbms_current_user', JSON.stringify(testApplicant));
        
        testResults.registration.success = true;
        console.log('✅ Test applicant created:', testApplicant.email);
      } catch (error) {
        testResults.registration.error = error.message;
        throw new Error('Registration failed: ' + error.message);
      }
      
      // ============================================
      // STEP 2: CREATE TEST APPLICATION
      // ============================================
      console.log('\n📝 STEP 2: Creating test application...');
      
      const year = new Date().getFullYear();
      const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0') + 1;
      const appID = `GSA/${year}/${counter.toString().padStart(4, '0')}`;
      
      const testApplication = {
        appID: appID,
        applicantEmail: testApplicant.email,
        applicantName: `${testApplicant.firstName} ${testApplicant.lastName}`,
        dateSubmitted: new Date().toISOString(),
        status: 'Pending Ward Review',
        subCounty: testApplicant.subCounty,
        ward: testApplicant.ward,
        village: testApplicant.village,
        idNumber: testApplicant.nemisId,
        nemisId: testApplicant.nemisId,
        isFinalSubmission: true,
        personalDetails: {
          firstNames: testApplicant.firstName,
          middleName: testApplicant.otherName,
          lastName: testApplicant.lastName,
          gender: testApplicant.gender,
          studentPhone: testApplicant.phoneNumber,
          parentPhone: '0723456789',
          institution: 'University of Nairobi',
          regNumber: 'UON/2020/12345',
          yearForm: 'Year 3',
          courseNature: 'Bachelor of Science',
          courseDuration: '4 years',
          subCounty: testApplicant.subCounty,
          ward: testApplicant.ward
        },
        familyDetails: {
          parentStatus: 'Both parents alive',
          hasDisability: 'No',
          disabilityDescription: '',
          fatherName: 'Test Father',
          fatherOccupation: 'Farmer',
          motherName: 'Test Mother',
          motherOccupation: 'Teacher',
          totalSiblings: 3,
          guardianChildren: 3,
          siblingsWorking: 1,
          siblingsSecondary: 1,
          siblingsPostSecondary: 1,
          educationPayer: 'Guardian',
          previousBenefit: 'No',
          previousAmount: 0,
          previousYear: 0
        },
        institutionDetails: {
          principalName: 'Dr. Principal',
          principalPhone: '0734567890',
          principalComments: 'Good student, needs financial support',
          discipline: 'Excellent',
          outstandingFees: 50000
        },
        financialDetails: {
          monthlyIncome: 30000,
          totalAnnualFees: 150000,
          feeBalance: 50000,
          amountRequested: 100000,
          justification: 'Family has limited income and needs support for education. Student is performing well academically.'
        }
      };
      
      // Save application to database
      try {
        const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        // Remove existing test application if exists
        const filteredApps = applications.filter(a => a.appID !== appID && a.applicantEmail !== testApplicant.email);
        filteredApps.push(testApplication);
        localStorage.setItem('mbms_applications', JSON.stringify(filteredApps));
        
        // Update counter
        localStorage.setItem('mbms_application_counter', counter.toString());
        
        testResults.application.success = true;
        console.log('✅ Test application created:', appID);
        console.log('   Applicant:', testApplication.applicantName);
        console.log('   Amount Requested: Ksh', testApplication.financialDetails.amountRequested.toLocaleString());
      } catch (error) {
        testResults.application.error = error.message;
        throw new Error('Application creation failed: ' + error.message);
      }
      
      // ============================================
      // STEP 3: SIMULATE ADMIN AWARD PROCESS
      // ============================================
      console.log('\n📝 STEP 3: Simulating admin award process...');
      
      try {
        // Get the application
        const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const app = applications.find(a => a.appID === appID);
        
        if (!app) {
          throw new Error('Application not found');
        }
        
        // Award the application
        const awardAmount = 100000;
        // Use global getNextSerialNumber if available, otherwise use local function
        const getSerial = typeof getNextSerialNumber === 'function' ? getNextSerialNumber : getNextSerialNumberLocal;
        const serialNumber = getSerial();
        const awardDate = new Date().toISOString();
        
        app.status = 'Awarded';
        app.awardDetails = {
          committee_amount_kes: awardAmount,
          amount: awardAmount,
          serialNumber: serialNumber,
          date_awarded: awardDate,
          justification: 'Awarded based on financial need and academic performance',
          awardedBy: 'Fund Administrator',
          awardedByEmail: 'fundadmin@garissa.go.ke'
        };
        
        // Update application in database
        const updatedApps = applications.map(a => a.appID === appID ? app : a);
        localStorage.setItem('mbms_applications', JSON.stringify(updatedApps));
        
        // Update budget (if budget system exists)
        if (typeof updateBudgetAfterAward !== 'undefined') {
          updateBudgetAfterAward(awardAmount);
        } else if (typeof deductBudget !== 'undefined') {
          deductBudget(awardAmount);
        }
        
        testResults.adminAward.success = true;
        console.log('✅ Application awarded successfully');
        console.log('   Application ID:', appID);
        console.log('   Amount Awarded: Ksh', awardAmount.toLocaleString());
        console.log('   Serial Number:', serialNumber);
        console.log('   Status:', app.status);
        
      } catch (error) {
        testResults.adminAward.error = error.message;
        throw new Error('Award process failed: ' + error.message);
      }
      
      // ============================================
      // STEP 4: GENERATE AND DOWNLOAD PDF
      // ============================================
      console.log('\n📝 STEP 4: Generating and downloading award letter PDF...');
      
      try {
        // Get the awarded application
        const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const app = applications.find(a => a.appID === appID);
        
        if (!app || app.status !== 'Awarded') {
          throw new Error('Awarded application not found');
        }
        
        // Check if PDF generator is available
        if (typeof generateOfferLetterPDF === 'undefined') {
          // Try to load it
          console.log('⚠️ PDF generator not found, attempting to load...');
          if (typeof loadJSPDF !== 'undefined') {
            await loadJSPDF();
          }
        }
        
        // Generate PDF with auto-download
        if (typeof generateOfferLetterPDF === 'function') {
          console.log('📄 Generating PDF...');
          console.log('   Application:', app.appID);
          console.log('   Award Details:', app.awardDetails);
          
          // Ensure award details are properly formatted
          const awardDetails = {
            committee_amount_kes: app.awardDetails.amount || app.awardDetails.committee_amount_kes || 100000,
            amount: app.awardDetails.amount || app.awardDetails.committee_amount_kes || 100000,
            serialNumber: app.awardDetails.serialNumber,
            date_awarded: app.awardDetails.date_awarded,
            justification: app.awardDetails.justification || 'Awarded based on financial need and academic performance'
          };
          
          const pdfResult = await generateOfferLetterPDF(
            app,
            awardDetails,
            { directSave: true } // Auto-download
          );
          
          testResults.pdfDownload.success = true;
          console.log('✅ PDF generated and downloaded successfully');
          console.log('   Filename:', pdfResult.filename);
          console.log('   Serial Number:', pdfResult.serialNumber || awardDetails.serialNumber);
          
          // Show success message
          setTimeout(() => {
            alert('✅ COMPLETE WORKFLOW TEST SUCCESSFUL!\n\n' +
                  'Registration: ✅\n' +
                  'Application: ✅\n' +
                  'Award: ✅\n' +
                  'PDF Download: ✅\n\n' +
                  'PDF File: ' + (pdfResult.filename || 'Downloaded') + '\n' +
                  'Serial Number: ' + (pdfResult.serialNumber || awardDetails.serialNumber) + '\n' +
                  'Amount: Ksh ' + awardDetails.amount.toLocaleString() + '\n\n' +
                  'Check your downloads folder for the PDF!');
          }, 1000);
          
        } else if (typeof downloadPDFDirect === 'function') {
          // Alternative method
          console.log('📄 Using alternative PDF download method...');
          const pdfResult = await downloadPDFDirect(app, app.awardDetails);
          
          testResults.pdfDownload.success = true;
          console.log('✅ PDF downloaded successfully');
          console.log('   Filename:', pdfResult.filename);
          
        } else {
          throw new Error('PDF generator functions not available. Please ensure pdf-generator.js is loaded.');
        }
        
      } catch (error) {
        testResults.pdfDownload.error = error.message;
        console.error('❌ PDF download failed:', error);
        
        // Try to show error but continue
        alert('⚠️ PDF Download Error:\n\n' + error.message + '\n\n' +
              'Other steps completed successfully. Please check PDF generator configuration.');
      }
      
      // ============================================
      // FINAL RESULTS
      // ============================================
      console.log('\n📊 FINAL TEST RESULTS:');
      console.log('====================');
      console.log('Registration:', testResults.registration.success ? '✅ PASS' : '❌ FAIL');
      if (testResults.registration.error) console.log('  Error:', testResults.registration.error);
      
      console.log('Application:', testResults.application.success ? '✅ PASS' : '❌ FAIL');
      if (testResults.application.error) console.log('  Error:', testResults.application.error);
      
      console.log('Admin Award:', testResults.adminAward.success ? '✅ PASS' : '❌ FAIL');
      if (testResults.adminAward.error) console.log('  Error:', testResults.adminAward.error);
      
      console.log('PDF Download:', testResults.pdfDownload.success ? '✅ PASS' : '❌ FAIL');
      if (testResults.pdfDownload.error) console.log('  Error:', testResults.pdfDownload.error);
      
      const allPassed = Object.values(testResults).every(r => r.success);
      console.log('====================');
      console.log('Overall:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED');
      
      // Get final application state for return value
      const finalApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const finalApp = finalApps.find(a => a.appID === appID);
      const serialNumber = finalApp?.awardDetails?.serialNumber || 'N/A';
      
      // Return results
      return {
        success: allPassed,
        results: testResults,
        applicationId: appID,
        applicantEmail: testApplicant.email,
        awardAmount: 100000,
        serialNumber: serialNumber
      };
      
    } catch (error) {
      console.error('❌ Workflow simulation error:', error);
      alert('❌ Workflow simulation failed:\n\n' + error.message);
      return {
        success: false,
        results: testResults,
        error: error.message
      };
    }
  };
  
  /**
   * Get next serial number (helper function - fallback if global not available)
   */
  function getNextSerialNumberLocal() {
    const lastSerial = parseInt(localStorage.getItem('mbms_last_serial') || '0');
    const nextSerial = lastSerial + 1;
    localStorage.setItem('mbms_last_serial', nextSerial.toString());
    const serialStr = nextSerial.toString().padStart(3, '0');
    return `GRS/Bursary/${serialStr}`;
  }
  
  /**
   * Quick test - just create test data without full workflow
   */
  window.createTestData = function() {
    const testApplicant = {
      firstName: 'Test',
      lastName: 'Applicant',
      email: 'test.applicant@garissa.test',
      phoneNumber: '0712345678',
      gender: 'Male',
      subCounty: 'Garissa Township',
      ward: 'Waberi',
      role: 'applicant',
      password: 'Test@1234',
      createdAt: new Date().toISOString()
    };
    
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const filteredUsers = users.filter(u => u.email !== testApplicant.email);
    filteredUsers.push(testApplicant);
    localStorage.setItem('mbms_users', JSON.stringify(filteredUsers));
    
    console.log('✅ Test applicant created:', testApplicant.email);
    return testApplicant;
  };
  
  console.log('✅ End-to-End Test script loaded');
  console.log('📝 Available functions:');
  console.log('   - simulateCompleteWorkflow() - Full workflow test');
  console.log('   - createTestData() - Create test applicant only');
})();

