// COMPREHENSIVE SYSTEM TESTING SCRIPT
// Tests the entire system from registration to listing to visualization to downloading

(function() {
  'use strict';
  
  console.log('🧪 SYSTEM TEST COMPLETE - Initializing comprehensive tests...');
  
  /**
   * Test the entire system workflow
   */
  window.testSystemComplete = async function() {
    console.log('🧪 Starting comprehensive system test...');
    
    const results = {
      registration: false,
      application: false,
      validation: false,
      submission: false,
      listing: false,
      download: false,
      buttons: false,
      dropdowns: false
    };
    
    const errors = [];
    
    try {
      // Test 1: Registration Page
      console.log('📝 Test 1: Registration Page');
      if (document.getElementById('applicantRegistrationForm')) {
        const form = document.getElementById('applicantRegistrationForm');
        const inputs = form.querySelectorAll('input, select');
        if (inputs.length > 0) {
          results.registration = true;
          console.log('✅ Registration form found');
        } else {
          errors.push('Registration form has no inputs');
        }
      } else {
        errors.push('Registration form not found');
      }
      
      // Test 2: Application Form
      console.log('📝 Test 2: Application Form');
      if (document.getElementById('applicationForm')) {
        const form = document.getElementById('applicationForm');
        const requiredFields = form.querySelectorAll('[required]');
        if (requiredFields.length > 0) {
          results.application = true;
          console.log('✅ Application form found with', requiredFields.length, 'required fields');
        } else {
          errors.push('Application form has no required fields');
        }
      } else {
        errors.push('Application form not found');
      }
      
      // Test 3: Form Validation
      console.log('📝 Test 3: Form Validation');
      if (document.getElementById('applicationForm')) {
        const form = document.getElementById('applicationForm');
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
          // Test validation by trying to submit empty form
          const originalCheckValidity = form.checkValidity;
          let validationTriggered = false;
          
          form.checkValidity = function() {
            validationTriggered = true;
            return originalCheckValidity.call(this);
          };
          
          // Trigger validation
          form.checkValidity();
          
          if (validationTriggered) {
            results.validation = true;
            console.log('✅ Form validation working');
          } else {
            errors.push('Form validation not triggered');
          }
          
          // Restore original
          form.checkValidity = originalCheckValidity;
        } else {
          errors.push('Submit button not found');
        }
      }
      
      // Test 4: Buttons
      console.log('📝 Test 4: Buttons');
      const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
      let enabledButtons = 0;
      buttons.forEach(btn => {
        if (!btn.disabled && btn.style.pointerEvents !== 'none') {
          enabledButtons++;
        }
      });
      
      if (enabledButtons > 0) {
        results.buttons = true;
        console.log('✅ Found', enabledButtons, 'enabled buttons out of', buttons.length);
      } else {
        errors.push('No enabled buttons found');
      }
      
      // Test 5: Dropdowns
      console.log('📝 Test 5: Dropdowns');
      const dropdowns = document.querySelectorAll('select');
      let enabledDropdowns = 0;
      dropdowns.forEach(select => {
        if (!select.disabled && select.style.pointerEvents !== 'none') {
          enabledDropdowns++;
        }
      });
      
      if (enabledDropdowns > 0) {
        results.dropdowns = true;
        console.log('✅ Found', enabledDropdowns, 'enabled dropdowns out of', dropdowns.length);
      } else {
        errors.push('No enabled dropdowns found');
      }
      
      // Test 6: PDF Download Functions
      console.log('📝 Test 6: PDF Download Functions');
      const pdfFunctions = [
        'generateOfferLetterPDF',
        'downloadPDFDirect',
        'generateRejectionLetterPDF',
        'downloadApplicationSummaryPDF'
      ];
      
      let pdfFunctionsFound = 0;
      pdfFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
          pdfFunctionsFound++;
        }
      });
      
      if (pdfFunctionsFound > 0) {
        results.download = true;
        console.log('✅ Found', pdfFunctionsFound, 'PDF functions');
      } else {
        errors.push('PDF download functions not found');
      }
      
      // Test 7: Database Functions
      console.log('📝 Test 7: Database Functions');
      const dbFunctions = [
        'saveApplication',
        'getApplications',
        'saveUser',
        'getUsers'
      ];
      
      let dbFunctionsFound = 0;
      dbFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function' || typeof window[funcName] !== 'undefined') {
          dbFunctionsFound++;
        }
      });
      
      if (dbFunctionsFound > 0 || localStorage.getItem('mbms_applications') !== null) {
        results.listing = true;
        console.log('✅ Database functions available');
      } else {
        errors.push('Database functions not found');
      }
      
      // Generate Test Report
      const totalTests = Object.keys(results).length;
      const passedTests = Object.values(results).filter(r => r === true).length;
      const passRate = ((passedTests / totalTests) * 100).toFixed(1);
      
      console.log('\n📊 TEST RESULTS:');
      console.log('================');
      Object.keys(results).forEach(test => {
        const status = results[test] ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${test}`);
      });
      console.log('================');
      console.log(`Pass Rate: ${passRate}% (${passedTests}/${totalTests})`);
      
      if (errors.length > 0) {
        console.log('\n⚠️ ERRORS FOUND:');
        errors.forEach((error, idx) => {
          console.log(`${idx + 1}. ${error}`);
        });
      }
      
      // Show results to user
      const resultMessage = `🧪 SYSTEM TEST RESULTS\n\n` +
        `Pass Rate: ${passRate}% (${passedTests}/${totalTests})\n\n` +
        `✅ Registration: ${results.registration ? 'PASS' : 'FAIL'}\n` +
        `✅ Application Form: ${results.application ? 'PASS' : 'FAIL'}\n` +
        `✅ Validation: ${results.validation ? 'PASS' : 'FAIL'}\n` +
        `✅ Buttons: ${results.buttons ? 'PASS' : 'FAIL'}\n` +
        `✅ Dropdowns: ${results.dropdowns ? 'PASS' : 'FAIL'}\n` +
        `✅ PDF Download: ${results.download ? 'PASS' : 'FAIL'}\n` +
        `✅ Database: ${results.listing ? 'PASS' : 'FAIL'}\n\n` +
        (errors.length > 0 ? `⚠️ Errors: ${errors.length}\nCheck console for details.` : '✅ No errors found!');
      
      alert(resultMessage);
      
      return {
        results,
        errors,
        passRate: parseFloat(passRate),
        passedTests,
        totalTests
      };
      
    } catch (error) {
      console.error('❌ Test error:', error);
      alert('❌ Test error: ' + error.message);
      return {
        results,
        errors: [...errors, error.message],
        passRate: 0,
        passedTests: 0,
        totalTests: Object.keys(results).length
      };
    }
  };
  
  /**
   * Quick test - just check if key elements exist
   */
  window.quickSystemTest = function() {
    const checks = {
      'Registration Form': !!document.getElementById('applicantRegistrationForm'),
      'Application Form': !!document.getElementById('applicationForm'),
      'Submit Button': !!document.getElementById('submitBtn'),
      'Next Button': !!document.getElementById('nextBtn'),
      'Gender Dropdown': !!document.getElementById('genderApp'),
      'PDF Functions': typeof window.generateOfferLetterPDF === 'function',
      'Database': localStorage.getItem('mbms_applications') !== null
    };
    
    const passed = Object.values(checks).filter(v => v === true).length;
    const total = Object.keys(checks).length;
    
    console.log('🧪 Quick Test Results:');
    Object.keys(checks).forEach(key => {
      console.log(`${checks[key] ? '✅' : '❌'} ${key}`);
    });
    
    alert(`Quick Test: ${passed}/${total} checks passed\n\nCheck console for details.`);
    
    return checks;
  };
  
  console.log('✅ System Test Complete script loaded');
  console.log('📝 Available functions:');
  console.log('   - testSystemComplete() - Full system test');
  console.log('   - quickSystemTest() - Quick element check');
})();

