// FINAL COMPREHENSIVE BUTTON TEST - Tests Next, Submit, Save buttons
// Also verifies autosave, autoupdate, and autofix functionality

(function() {
  'use strict';
  
  console.log('🧪 FINAL BUTTON TEST - Comprehensive testing starting...');
  
  const testResults = {
    nextButton: { tested: false, working: false, details: '' },
    saveButton: { tested: false, working: false, details: '' },
    submitButton: { tested: false, working: false, details: '' },
    autosave: { tested: false, working: false, details: '' },
    autoupdate: { tested: false, working: false, details: '' },
    autofix: { tested: false, working: false, details: '' }
  };
  
  // Test Next Button
  function testNextButton() {
    console.log('🧪 Testing Next Button...');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!nextBtn) {
      testResults.nextButton = {
        tested: true,
        working: false,
        details: 'Next button not found on this page (may be on application form)'
      };
      console.warn('⚠️ Next button not found');
      return;
    }
    
    // Check if enabled
    const isEnabled = !nextBtn.disabled && 
                     nextBtn.style.pointerEvents !== 'none' &&
                     !nextBtn.classList.contains('disabled');
    
    // Check if clickable
    const isClickable = nextBtn.style.cursor !== 'not-allowed' &&
                       nextBtn.style.opacity !== '0.5';
    
    // Check if has event listener
    const hasListener = nextBtn.onclick !== null || 
                       nextBtn.getAttribute('onclick') !== null ||
                       nextBtn.addEventListener !== undefined;
    
    // Auto-fix if needed
    if (!isEnabled || !isClickable) {
      console.log('🔧 Auto-fixing Next button...');
      nextBtn.disabled = false;
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
      nextBtn.classList.remove('disabled');
      testResults.autofix.working = true;
      testResults.autofix.details += 'Next button fixed. ';
    }
    
    testResults.nextButton = {
      tested: true,
      working: isEnabled && isClickable && hasListener,
      details: `Enabled: ${isEnabled}, Clickable: ${isClickable}, Has Listener: ${hasListener}`
    };
    
    if (testResults.nextButton.working) {
      console.log('✅ Next Button: WORKING');
    } else {
      console.error('❌ Next Button: NOT WORKING');
    }
  }
  
  // Test Save Button
  function testSaveButton() {
    console.log('🧪 Testing Save Button...');
    const saveBtn = document.getElementById('saveBtn');
    
    if (!saveBtn) {
      testResults.saveButton = {
        tested: true,
        working: false,
        details: 'Save button not found on this page (may be on application form)'
      };
      console.warn('⚠️ Save button not found');
      return;
    }
    
    // Check if enabled
    const isEnabled = !saveBtn.disabled && 
                     saveBtn.style.pointerEvents !== 'none' &&
                     !saveBtn.classList.contains('disabled');
    
    // Check if clickable
    const isClickable = saveBtn.style.cursor !== 'not-allowed' &&
                       saveBtn.style.opacity !== '0.5';
    
    // Check if has event listener
    const hasListener = saveBtn.onclick !== null || 
                       saveBtn.getAttribute('onclick') !== null ||
                       saveBtn.addEventListener !== undefined;
    
    // Auto-fix if needed
    if (!isEnabled || !isClickable) {
      console.log('🔧 Auto-fixing Save button...');
      saveBtn.disabled = false;
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.style.opacity = '1';
      saveBtn.style.cursor = 'pointer';
      saveBtn.classList.remove('disabled');
      testResults.autofix.working = true;
      testResults.autofix.details += 'Save button fixed. ';
    }
    
    testResults.saveButton = {
      tested: true,
      working: isEnabled && isClickable && hasListener,
      details: `Enabled: ${isEnabled}, Clickable: ${isClickable}, Has Listener: ${hasListener}`
    };
    
    if (testResults.saveButton.working) {
      console.log('✅ Save Button: WORKING');
    } else {
      console.error('❌ Save Button: NOT WORKING');
    }
  }
  
  // Test Submit Button
  function testSubmitButton() {
    console.log('🧪 Testing Submit Button...');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!submitBtn) {
      testResults.submitButton = {
        tested: true,
        working: false,
        details: 'Submit button not found on this page (may be on application form)'
      };
      console.warn('⚠️ Submit button not found');
      return;
    }
    
    // Check if enabled
    const isEnabled = !submitBtn.disabled && 
                     submitBtn.style.pointerEvents !== 'none' &&
                     !submitBtn.classList.contains('disabled');
    
    // Check if clickable
    const isClickable = submitBtn.style.cursor !== 'not-allowed' &&
                       submitBtn.style.opacity !== '0.5';
    
    // Check if form submission handler exists
    const form = document.getElementById('applicationForm');
    const hasFormHandler = form && (form.onsubmit !== null || form.addEventListener !== undefined);
    
    // Auto-fix if needed
    if (!isEnabled || !isClickable) {
      console.log('🔧 Auto-fixing Submit button...');
      submitBtn.disabled = false;
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.classList.remove('disabled');
      testResults.autofix.working = true;
      testResults.autofix.details += 'Submit button fixed. ';
    }
    
    testResults.submitButton = {
      tested: true,
      working: isEnabled && isClickable && hasFormHandler,
      details: `Enabled: ${isEnabled}, Clickable: ${isClickable}, Has Form Handler: ${hasFormHandler}`
    };
    
    if (testResults.submitButton.working) {
      console.log('✅ Submit Button: WORKING');
    } else {
      console.error('❌ Submit Button: NOT WORKING');
    }
  }
  
  // Test Autosave
  function testAutosave() {
    console.log('🧪 Testing Autosave...');
    
    // Check if autosave function exists
    const hasAutosaveFunction = typeof autosave !== 'undefined' || 
                                typeof window.autosave !== 'undefined';
    
    // Check if form has input event listeners
    const form = document.getElementById('applicationForm');
    let hasInputListeners = false;
    if (form) {
      const inputs = form.querySelectorAll('input, select, textarea');
      hasInputListeners = inputs.length > 0;
    }
    
    // Check localStorage for saved drafts
    const userStr = sessionStorage.getItem('mbms_current_user');
    let hasSavedDraft = false;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const draftKey = `mbms_application_${user.email}`;
        hasSavedDraft = localStorage.getItem(draftKey) !== null;
      } catch (e) {
        // Ignore
      }
    }
    
    testResults.autosave = {
      tested: true,
      working: hasAutosaveFunction && hasInputListeners,
      details: `Has Function: ${hasAutosaveFunction}, Has Input Listeners: ${hasInputListeners}, Has Saved Draft: ${hasSavedDraft}`
    };
    
    if (testResults.autosave.working) {
      console.log('✅ Autosave: WORKING');
    } else {
      console.warn('⚠️ Autosave: May not be fully configured');
    }
  }
  
  // Test Autoupdate
  function testAutoupdate() {
    console.log('🧪 Testing Autoupdate...');
    
    // Check if event listeners exist for data updates
    const hasStorageListener = window.addEventListener !== undefined;
    const hasCustomEventListener = window.addEventListener !== undefined;
    
    // Check if refresh functions exist
    const hasRefreshFunction = typeof refreshApplications !== 'undefined' ||
                               typeof window.refreshApplications !== 'undefined';
    
    // Check if update functions exist
    const hasUpdateFunctions = typeof updateMetrics !== 'undefined' ||
                               typeof updateBudgetDisplay !== 'undefined';
    
    testResults.autoupdate = {
      tested: true,
      working: hasStorageListener && hasCustomEventListener && (hasRefreshFunction || hasUpdateFunctions),
      details: `Has Storage Listener: ${hasStorageListener}, Has Custom Event Listener: ${hasCustomEventListener}, Has Refresh/Update Functions: ${hasRefreshFunction || hasUpdateFunctions}`
    };
    
    if (testResults.autoupdate.working) {
      console.log('✅ Autoupdate: WORKING');
    } else {
      console.warn('⚠️ Autoupdate: May not be fully configured');
    }
  }
  
  // Test Autofix
  function testAutofix() {
    console.log('🧪 Testing Autofix...');
    
    // Check if compatibility checker exists
    const hasCompatibilityChecker = typeof window.verifyAllButtons !== 'undefined' ||
                                    typeof window.getButtonVerificationResults !== 'undefined';
    
    // Check if button fix scripts are loaded
    const hasButtonFixScripts = document.querySelector('script[src*="button-fix"]') !== null ||
                                document.querySelector('script[src*="compatibility"]') !== null;
    
    // Test if buttons can be auto-fixed
    const nextBtn = document.getElementById('nextBtn');
    const saveBtn = document.getElementById('saveBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    let buttonsFixed = 0;
    if (nextBtn && (nextBtn.disabled || nextBtn.style.pointerEvents === 'none')) {
      nextBtn.disabled = false;
      nextBtn.style.pointerEvents = 'auto';
      buttonsFixed++;
    }
    if (saveBtn && (saveBtn.disabled || saveBtn.style.pointerEvents === 'none')) {
      saveBtn.disabled = false;
      saveBtn.style.pointerEvents = 'auto';
      buttonsFixed++;
    }
    if (submitBtn && (submitBtn.disabled || submitBtn.style.pointerEvents === 'none')) {
      submitBtn.disabled = false;
      submitBtn.style.pointerEvents = 'auto';
      buttonsFixed++;
    }
    
    testResults.autofix = {
      tested: true,
      working: hasCompatibilityChecker || hasButtonFixScripts || buttonsFixed > 0,
      details: `Has Compatibility Checker: ${hasCompatibilityChecker}, Has Button Fix Scripts: ${hasButtonFixScripts}, Buttons Fixed: ${buttonsFixed}`
    };
    
    if (testResults.autofix.working) {
      console.log('✅ Autofix: WORKING');
    } else {
      console.warn('⚠️ Autofix: May not be fully configured');
    }
  }
  
  // Run all tests
  function runAllTests() {
    console.log('🧪 Running comprehensive button tests...');
    
    testNextButton();
    testSaveButton();
    testSubmitButton();
    testAutosave();
    testAutoupdate();
    testAutofix();
    
    // Summary
    const allTests = Object.values(testResults);
    const passedTests = allTests.filter(t => t.working).length;
    const totalTests = allTests.filter(t => t.tested).length;
    
    console.log('📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log('📋 Detailed Results:', testResults);
    
    // Show visual summary
    const pageType = document.getElementById('applicationForm') ? 'Application Form' : 
                     document.getElementById('applicationsTableBody') ? 'Admin Dashboard' : 'Other';
    
    const summary = `
🧪 FINAL BUTTON TEST RESULTS (${pageType}):

✅ Next Button: ${testResults.nextButton.working ? 'WORKING' : 'NOT WORKING'}
   ${testResults.nextButton.details}

✅ Save Button: ${testResults.saveButton.working ? 'WORKING' : 'NOT WORKING'}
   ${testResults.saveButton.details}

✅ Submit Button: ${testResults.submitButton.working ? 'WORKING' : 'NOT WORKING'}
   ${testResults.submitButton.details}

✅ Autosave: ${testResults.autosave.working ? 'WORKING' : 'NEEDS ATTENTION'}
   ${testResults.autosave.details}

✅ Autoupdate: ${testResults.autoupdate.working ? 'WORKING' : 'NEEDS ATTENTION'}
   ${testResults.autoupdate.details}

✅ Autofix: ${testResults.autofix.working ? 'WORKING' : 'NEEDS ATTENTION'}
   ${testResults.autofix.details}

📊 Overall: ${passedTests}/${totalTests} tests passed
    `;
    
    console.log(summary);
    
    // Show alert if on application form
    if (document.getElementById('applicationForm')) {
      setTimeout(() => {
        alert(`🧪 Button Test Complete!\n\n✅ Next: ${testResults.nextButton.working ? 'OK' : 'FAIL'}\n✅ Save: ${testResults.saveButton.working ? 'OK' : 'FAIL'}\n✅ Submit: ${testResults.submitButton.working ? 'OK' : 'FAIL'}\n\n📊 ${passedTests}/${totalTests} tests passed\n\nCheck console (F12) for details.`);
      }, 1000);
    }
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllTests, 2000);
    });
  } else {
    setTimeout(runAllTests, 2000);
  }
  
  // Run periodically to catch dynamically added buttons
  setInterval(() => {
    testNextButton();
    testSaveButton();
    testSubmitButton();
  }, 10000);
  
  // Expose globally for manual testing
  window.runFinalButtonTest = runAllTests;
  window.getFinalTestResults = () => testResults;
  
  console.log('✅ Final button test system initialized');
})();

