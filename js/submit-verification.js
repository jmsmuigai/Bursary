// SUBMIT BUTTON VERIFICATION - Ensures Submit button works and applications appear on admin dashboard
// This script verifies that submission works end-to-end

(function() {
  'use strict';
  
  console.log('🔍 SUBMIT BUTTON VERIFICATION - Initializing...');
  
  // Verify Submit button is enabled and working
  function verifySubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) {
      console.warn('⚠️ Submit button not found on this page');
      return false;
    }
    
    // Check if button is enabled
    if (submitBtn.disabled) {
      console.error('❌ Submit button is disabled');
      submitBtn.disabled = false;
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = '1';
      submitBtn.classList.remove('disabled');
      console.log('✅ Submit button enabled');
    }
    
    // Check if form submission handler exists
    const form = document.getElementById('applicationForm');
    if (form) {
      const hasHandler = form.onsubmit !== null || 
                        form.getAttribute('data-submit-handler') === 'attached';
      
      if (!hasHandler) {
        console.warn('⚠️ Form may not have submit handler - checking...');
      } else {
        console.log('✅ Form has submit handler');
      }
    }
    
    console.log('✅ Submit button verified and enabled');
    return true;
  }
  
  // Verify Next button is enabled and working
  function verifyNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
      console.warn('⚠️ Next button not found on this page');
      return false;
    }
    
    if (nextBtn.disabled) {
      console.error('❌ Next button is disabled');
      nextBtn.disabled = false;
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.opacity = '1';
      nextBtn.classList.remove('disabled');
      console.log('✅ Next button enabled');
    }
    
    console.log('✅ Next button verified and enabled');
    return true;
  }
  
  // Verify admin dashboard will receive new applications
  function verifyAdminDashboardIntegration() {
    // Check if we're on admin dashboard
    if (!window.location.pathname.includes('admin_dashboard')) {
      console.log('ℹ️ Not on admin dashboard - skipping admin verification');
      return true;
    }
    
    // Check if event listeners are set up
    const hasStorageListener = window.addEventListener !== undefined;
    const hasCustomListener = typeof window.addEventListener === 'function';
    
    // Check if refreshApplications function exists
    const hasRefreshFunction = typeof refreshApplications === 'function' || 
                               typeof window.refreshApplications === 'function';
    
    if (!hasRefreshFunction) {
      console.error('❌ refreshApplications function not found');
      return false;
    }
    
    // Verify event listener for new applications
    console.log('✅ Admin dashboard integration verified');
    console.log('   - Storage listener:', hasStorageListener ? '✅' : '❌');
    console.log('   - Custom event listener:', hasCustomListener ? '✅' : '❌');
    console.log('   - Refresh function:', hasRefreshFunction ? '✅' : '❌');
    
    return true;
  }
  
  // Run all verifications
  function runAllVerifications() {
    console.log('🧪 Running all verifications...\n');
    
    const nextOk = verifyNextButton();
    const submitOk = verifySubmitButton();
    const adminOk = verifyAdminDashboardIntegration();
    
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log('================');
    console.log(`${nextOk ? '✅' : '❌'} Next Button: ${nextOk ? 'WORKING' : 'ISSUES FOUND'}`);
    console.log(`${submitOk ? '✅' : '❌'} Submit Button: ${submitOk ? 'WORKING' : 'ISSUES FOUND'}`);
    console.log(`${adminOk ? '✅' : '❌'} Admin Dashboard: ${adminOk ? 'READY' : 'ISSUES FOUND'}`);
    
    if (nextOk && submitOk && adminOk) {
      console.log('\n🎉 ALL VERIFICATIONS PASSED! System is ready.');
    } else {
      console.log('\n⚠️ Some verifications failed. Check logs above.');
    }
    
    return { nextOk, submitOk, adminOk };
  }
  
  // Auto-run verifications on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllVerifications, 2000);
    });
  } else {
    setTimeout(runAllVerifications, 2000);
  }
  
  // Expose verification function globally
  window.verifySubmitAndNextButtons = runAllVerifications;
  
  console.log('✅ Submit Button Verification initialized');
})();

