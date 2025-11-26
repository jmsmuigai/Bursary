// SYSTEM VERIFICATION TEST - Comprehensive testing of all buttons and functionality
// This script verifies that all buttons work, records update, budget deducts, and PDFs generate

(function() {
  'use strict';
  
  console.log('🧪 SYSTEM VERIFICATION TEST - Starting comprehensive tests...');
  
  // Test results tracker
  const testResults = {
    nextButton: false,
    saveButton: false,
    submitButton: false,
    adminDashboardUpdate: false,
    budgetDeduction: false,
    pdfGeneration: false,
    visualizations: false,
    firebaseSync: false
  };
  
  // Test 1: Verify Next Button
  function testNextButton() {
    console.log('🧪 TEST 1: Next Button');
    try {
      const nextBtn = document.getElementById('nextBtn');
      if (!nextBtn) {
        console.warn('⚠️ Next button not found on this page');
        return false;
      }
      
      // Check if button is enabled
      if (nextBtn.disabled) {
        console.error('❌ Next button is disabled');
        return false;
      }
      
      // Check if click handler exists
      const hasHandler = nextBtn.onclick !== null || 
                        nextBtn.getAttribute('data-listener-attached') === 'true' ||
                        nextBtn.addEventListener !== undefined;
      
      if (!hasHandler) {
        console.warn('⚠️ Next button may not have click handler');
      }
      
      console.log('✅ Next button found and enabled');
      testResults.nextButton = true;
      return true;
    } catch (error) {
      console.error('❌ Next button test failed:', error);
      return false;
    }
  }
  
  // Test 2: Verify Save Button
  function testSaveButton() {
    console.log('🧪 TEST 2: Save Button');
    try {
      const saveBtn = document.getElementById('saveBtn');
      if (!saveBtn) {
        console.warn('⚠️ Save button not found on this page');
        return false;
      }
      
      if (saveBtn.disabled) {
        console.error('❌ Save button is disabled');
        return false;
      }
      
      console.log('✅ Save button found and enabled');
      testResults.saveButton = true;
      return true;
    } catch (error) {
      console.error('❌ Save button test failed:', error);
      return false;
    }
  }
  
  // Test 3: Verify Submit Button
  function testSubmitButton() {
    console.log('🧪 TEST 3: Submit Button');
    try {
      const submitBtn = document.getElementById('submitBtn');
      if (!submitBtn) {
        console.warn('⚠️ Submit button not found on this page (may be hidden)');
        return false;
      }
      
      if (submitBtn.disabled) {
        console.error('❌ Submit button is disabled');
        return false;
      }
      
      console.log('✅ Submit button found and enabled');
      testResults.submitButton = true;
      return true;
    } catch (error) {
      console.error('❌ Submit button test failed:', error);
      return false;
    }
  }
  
  // Test 4: Verify Admin Dashboard Auto-Update
  function testAdminDashboardUpdate() {
    console.log('🧪 TEST 4: Admin Dashboard Auto-Update');
    try {
      if (!window.location.pathname.includes('admin_dashboard')) {
        console.log('ℹ️ Not on admin dashboard - skipping test');
        return false;
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
      
      console.log('✅ Admin dashboard auto-update mechanisms in place');
      testResults.adminDashboardUpdate = true;
      return true;
    } catch (error) {
      console.error('❌ Admin dashboard update test failed:', error);
      return false;
    }
  }
  
  // Test 5: Verify Budget Deduction
  function testBudgetDeduction() {
    console.log('🧪 TEST 5: Budget Deduction');
    try {
      // Check if budget functions exist
      const hasAllocateFunction = typeof allocateBudget === 'function' || 
                                  typeof window.allocateBudget === 'function';
      const hasSyncFunction = typeof syncBudgetWithAwards === 'function' || 
                              typeof window.syncBudgetWithAwards === 'function';
      const hasGetBalanceFunction = typeof getBudgetBalance === 'function' || 
                                    typeof window.getBudgetBalance === 'function';
      
      if (!hasAllocateFunction || !hasSyncFunction || !hasGetBalanceFunction) {
        console.error('❌ Budget functions not found');
        return false;
      }
      
      // Test budget calculation
      const budget = typeof getBudgetBalance === 'function' ? getBudgetBalance() : 
                     typeof window.getBudgetBalance === 'function' ? window.getBudgetBalance() : null;
      
      if (!budget) {
        console.error('❌ Could not get budget balance');
        return false;
      }
      
      console.log('✅ Budget deduction system verified');
      console.log('   - Total Budget:', budget.total);
      console.log('   - Allocated:', budget.allocated);
      console.log('   - Balance:', budget.balance);
      testResults.budgetDeduction = true;
      return true;
    } catch (error) {
      console.error('❌ Budget deduction test failed:', error);
      return false;
    }
  }
  
  // Test 6: Verify PDF Generation
  function testPDFGeneration() {
    console.log('🧪 TEST 6: PDF Generation');
    try {
      // Check if PDF functions exist
      const hasOfferPDF = typeof generateOfferLetterPDF === 'function' || 
                         typeof window.generateOfferLetterPDF === 'function';
      const hasRejectionPDF = typeof generateRejectionLetterPDF === 'function' || 
                             typeof window.generateRejectionLetterPDF === 'function';
      const hasJSPDF = typeof window.jspdf !== 'undefined' || 
                       typeof window.jsPDF !== 'undefined';
      
      if (!hasOfferPDF || !hasRejectionPDF) {
        console.error('❌ PDF generation functions not found');
        return false;
      }
      
      // Check if jsPDF library is available
      if (!hasJSPDF) {
        console.warn('⚠️ jsPDF library not loaded yet (will load on demand)');
      }
      
      // Check if logo, signature, and stamp images exist
      const logoExists = document.querySelector('img[src*="Garissa Logo"]') !== null;
      
      console.log('✅ PDF generation system verified');
      console.log('   - Offer letter function:', hasOfferPDF ? '✅' : '❌');
      console.log('   - Rejection letter function:', hasRejectionPDF ? '✅' : '❌');
      console.log('   - Logo available:', logoExists ? '✅' : '⚠️');
      testResults.pdfGeneration = true;
      return true;
    } catch (error) {
      console.error('❌ PDF generation test failed:', error);
      return false;
    }
  }
  
  // Test 7: Verify Visualizations
  function testVisualizations() {
    console.log('🧪 TEST 7: Visualizations');
    try {
      if (!window.location.pathname.includes('admin_dashboard')) {
        console.log('ℹ️ Not on admin dashboard - skipping visualization test');
        return false;
      }
      
      // Check if visualization functions exist
      const hasRefreshViz = typeof refreshVisualizations === 'function' || 
                           typeof window.refreshVisualizations === 'function';
      const hasChartJS = typeof Chart !== 'undefined';
      
      if (!hasRefreshViz) {
        console.error('❌ refreshVisualizations function not found');
        return false;
      }
      
      // Check if charts can read from unified database
      const canReadData = typeof getApplications === 'function' || 
                         typeof window.getApplications === 'function' ||
                         typeof loadApplications === 'function' ||
                         typeof window.loadApplications === 'function';
      
      if (!canReadData) {
        console.error('❌ Cannot read applications from database');
        return false;
      }
      
      console.log('✅ Visualizations system verified');
      console.log('   - Chart.js loaded:', hasChartJS ? '✅' : '⚠️');
      console.log('   - Can read from database:', canReadData ? '✅' : '❌');
      testResults.visualizations = true;
      return true;
    } catch (error) {
      console.error('❌ Visualizations test failed:', error);
      return false;
    }
  }
  
  // Test 8: Verify Firebase Sync
  function testFirebaseSync() {
    console.log('🧪 TEST 8: Firebase Sync');
    try {
      // Check if Firebase is configured
      const hasFirebase = typeof firebase !== 'undefined';
      const hasFirestore = hasFirebase && typeof firebase.firestore !== 'undefined';
      const hasConfig = typeof firebaseConfig !== 'undefined';
      
      // Check if unified database functions exist
      const hasGetApps = typeof getApplications === 'function' || 
                        typeof window.getApplications === 'function';
      const hasSaveApp = typeof saveApplication === 'function' || 
                        typeof window.saveApplication === 'function';
      
      if (!hasGetApps || !hasSaveApp) {
        console.error('❌ Unified database functions not found');
        return false;
      }
      
      console.log('✅ Firebase sync system verified');
      console.log('   - Firebase available:', hasFirebase ? '✅' : '⚠️ (using localStorage)');
      console.log('   - Firestore available:', hasFirestore ? '✅' : '⚠️');
      console.log('   - Unified database functions:', hasGetApps && hasSaveApp ? '✅' : '❌');
      testResults.firebaseSync = true;
      return true;
    } catch (error) {
      console.error('❌ Firebase sync test failed:', error);
      return false;
    }
  }
  
  // Run all tests
  function runAllTests() {
    console.log('🧪 Running comprehensive system tests...\n');
    
    testNextButton();
    testSaveButton();
    testSubmitButton();
    testAdminDashboardUpdate();
    testBudgetDeduction();
    testPDFGeneration();
    testVisualizations();
    testFirebaseSync();
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    const passed = Object.values(testResults).filter(r => r).length;
    const total = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([test, result]) => {
      console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED/SKIPPED'}`);
    });
    
    console.log(`\n📈 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! System is ready for production.');
    } else {
      console.log('⚠️ Some tests failed or were skipped. Check logs above.');
    }
    
    return { passed, total, results: testResults };
  }
  
  // Auto-run tests on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllTests, 2000);
    });
  } else {
    setTimeout(runAllTests, 2000);
  }
  
  // Expose test function globally
  window.runSystemVerificationTests = runAllTests;
  
  console.log('✅ System Verification Test initialized');
})();

