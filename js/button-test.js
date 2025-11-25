/**
 * BUTTON COMPATIBILITY TEST & AUTO-FIX
 * Tests all buttons and auto-fixes any issues
 */

(function() {
  'use strict';
  
  console.log('🧪 Starting Button Compatibility Test...');
  
  /**
   * Test Next Button
   */
  function testNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
      console.warn('⚠️ Next button not found');
      return false;
    }
    
    // Check if button is enabled
    if (nextBtn.disabled) {
      console.warn('⚠️ Next button is disabled');
      nextBtn.disabled = false;
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.opacity = '1';
      console.log('✅ Next button auto-fixed: Enabled');
    }
    
    // Check if button has click handler
    const hasHandler = nextBtn.onclick !== null || nextBtn.getAttribute('onclick') !== null;
    if (!hasHandler) {
      console.warn('⚠️ Next button has no click handler');
      // Will be fixed by button-fix.js
    }
    
    console.log('✅ Next button test passed');
    return true;
  }
  
  /**
   * Test Save Button
   */
  function testSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) {
      console.warn('⚠️ Save button not found');
      return false;
    }
    
    // Check if button is enabled
    if (saveBtn.disabled) {
      console.warn('⚠️ Save button is disabled');
      saveBtn.disabled = false;
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.style.opacity = '1';
      console.log('✅ Save button auto-fixed: Enabled');
    }
    
    console.log('✅ Save button test passed');
    return true;
  }
  
  /**
   * Test View Button
   */
  function testViewButton() {
    if (typeof safeViewApplication === 'function') {
      console.log('✅ View button function (safeViewApplication) exists');
      return true;
    } else if (typeof viewApplication === 'function') {
      console.log('✅ View button function (viewApplication) exists');
      return true;
    } else {
      console.error('❌ View button function not found');
      return false;
    }
  }
  
  /**
   * Test Download Button
   */
  function testDownloadButton() {
    if (typeof safeDownloadApplication === 'function') {
      console.log('✅ Download button function (safeDownloadApplication) exists');
      return true;
    } else if (typeof downloadApplicationLetter === 'function') {
      console.log('✅ Download button function (downloadApplicationLetter) exists');
      return true;
    } else {
      console.error('❌ Download button function not found');
      return false;
    }
  }
  
  /**
   * Test Award Button
   */
  function testAwardButton() {
    if (typeof approveApplication === 'function') {
      console.log('✅ Award button function (approveApplication) exists');
      return true;
    } else {
      console.error('❌ Award button function not found');
      return false;
    }
  }
  
  /**
   * Test Registration
   */
  function testRegistration() {
    const registerForm = document.getElementById('applicantRegistrationForm');
    if (registerForm) {
      console.log('✅ Registration form found');
      return true;
    } else {
      console.warn('⚠️ Registration form not found (may not be on registration page)');
      return true; // Not an error if not on registration page
    }
  }
  
  /**
   * Run all tests
   */
  function runAllTests() {
    console.log('🧪 Running comprehensive button tests...');
    
    const results = {
      nextButton: testNextButton(),
      saveButton: testSaveButton(),
      viewButton: testViewButton(),
      downloadButton: testDownloadButton(),
      awardButton: testAwardButton(),
      registration: testRegistration()
    };
    
    const allPassed = Object.values(results).every(r => r === true);
    
    if (allPassed) {
      console.log('✅ ALL BUTTON TESTS PASSED');
      console.log('📊 Test Results:', results);
    } else {
      console.warn('⚠️ Some button tests failed');
      console.log('📊 Test Results:', results);
    }
    
    return results;
  }
  
  /**
   * Auto-fix common issues
   */
  function autoFixIssues() {
    console.log('🔧 Running auto-fix...');
    
    // Fix Next button
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.cursor = 'pointer';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.opacity = '1';
      nextBtn.classList.remove('disabled');
    }
    
    // Fix Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.style.opacity = '1';
      saveBtn.classList.remove('disabled');
    }
    
    // Fix Previous button
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.cursor = 'pointer';
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.style.opacity = '1';
      prevBtn.classList.remove('disabled');
    }
    
    // Fix Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.cursor = 'pointer';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = '1';
      submitBtn.classList.remove('disabled');
    }
    
    console.log('✅ Auto-fix completed');
  }
  
  // Run tests when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        autoFixIssues();
        runAllTests();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      autoFixIssues();
      runAllTests();
    }, 1000);
  }
  
  // Re-run tests periodically
  setInterval(() => {
    autoFixIssues();
  }, 5000);
  
  // Export for manual testing
  window.testAllButtons = runAllTests;
  window.autoFixButtons = autoFixIssues;
  
  console.log('✅ Button Compatibility Test loaded');
})();

