// COMPATIBILITY CHECKER & AUTOFIXER
// Automatically detects and fixes compatibility errors

(function() {
  'use strict';
  
  console.log('🔍 COMPATIBILITY CHECKER - Initializing...');
  
  const issues = [];
  const fixes = [];
  
  // Check 1: Ensure critical functions exist
  function checkCriticalFunctions() {
    const critical = [
      'loadApplications',
      'renderTable',
      'updateMetrics',
      'updateBudgetDisplay',
      'approveApplication',
      'rejectApplication',
      'downloadApplicationLetter'
    ];
    
    critical.forEach(func => {
      if (typeof window[func] !== 'function') {
        issues.push(`Missing function: ${func}`);
        console.warn(`⚠️ Missing function: ${func}`);
      }
    });
  }
  
  // Check 2: Ensure DOM elements exist
  function checkDOMElements() {
    const critical = [
      'applicationsTableBody',
      'metricTotal',
      'metricPending',
      'metricAwarded',
      'metricFunds',
      'budgetTotal',
      'budgetAllocated',
      'budgetBalance'
    ];
    
    critical.forEach(id => {
      const el = document.getElementById(id);
      if (!el) {
        issues.push(`Missing DOM element: #${id}`);
        console.warn(`⚠️ Missing DOM element: #${id}`);
      }
    });
  }
  
  // Check 3: Ensure localStorage structure
  function checkLocalStorage() {
    try {
      const apps = localStorage.getItem('mbms_applications');
      if (apps) {
        const parsed = JSON.parse(apps);
        if (!Array.isArray(parsed)) {
          issues.push('localStorage mbms_applications is not an array');
          // Auto-fix
          localStorage.setItem('mbms_applications', JSON.stringify([]));
          fixes.push('Fixed: Reset mbms_applications to empty array');
        }
      }
    } catch (e) {
      issues.push('localStorage mbms_applications is corrupted');
      // Auto-fix
      localStorage.removeItem('mbms_applications');
      fixes.push('Fixed: Removed corrupted mbms_applications');
    }
  }
  
  // Check 4: Ensure budget functions exist
  function checkBudgetFunctions() {
    const budgetFuncs = [
      'getBudgetBalance',
      'getBudgetStatus',
      'allocateBudget',
      'syncBudgetWithAwards'
    ];
    
    budgetFuncs.forEach(func => {
      if (typeof window[func] !== 'function') {
        issues.push(`Missing budget function: ${func}`);
        console.warn(`⚠️ Missing budget function: ${func}`);
      }
    });
  }
  
  // Check 5: Ensure Firebase functions exist (if Firebase is enabled)
  function checkFirebaseFunctions() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      const firebaseFuncs = [
        'getApplications',
        'saveApplication',
        'updateApplicationStatus'
      ];
      
      firebaseFuncs.forEach(func => {
        if (typeof window[func] !== 'function') {
          issues.push(`Missing Firebase function: ${func}`);
          console.warn(`⚠️ Missing Firebase function: ${func}`);
        }
      });
    }
  }
  
  // Check 6: Ensure Next button is enabled
  function checkNextButton() {
    if (window.location.pathname.includes('application.html')) {
      const nextBtn = document.getElementById('nextBtn');
      if (nextBtn && nextBtn.disabled) {
        issues.push('Next button is disabled');
        // Auto-fix
        nextBtn.disabled = false;
        nextBtn.style.cursor = 'pointer';
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
        fixes.push('Fixed: Enabled Next button');
      }
    }
  }
  
  // Check 7: Ensure Submit button is enabled
  function checkSubmitButton() {
    if (window.location.pathname.includes('application.html')) {
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn && submitBtn.disabled) {
        issues.push('Submit button is disabled');
        // Auto-fix
        submitBtn.disabled = false;
        submitBtn.style.cursor = 'pointer';
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'auto';
        fixes.push('Fixed: Enabled Submit button');
      }
    }
  }
  
  // Check 8: Ensure event listeners are attached
  function checkEventListeners() {
    if (window.location.pathname.includes('admin_dashboard')) {
      const tbody = document.getElementById('applicationsTableBody');
      if (tbody) {
        // Check if event delegation is set up
        const hasListener = tbody.onclick !== null || 
                           tbody.getAttribute('data-listener-attached') === 'true';
        if (!hasListener) {
          issues.push('Table event listeners not attached');
          // Auto-fix will be handled by admin.js
        }
      }
    }
  }
  
  // Check 9: Ensure filters are populated
  function checkFilters() {
    if (window.location.pathname.includes('admin_dashboard')) {
      const filterSubCounty = document.getElementById('filterSubCounty');
      if (filterSubCounty && filterSubCounty.options.length <= 1) {
        issues.push('Filter dropdowns not populated');
        // Auto-fix will be handled by populateFilters
        if (typeof populateFilters === 'function') {
          populateFilters();
          fixes.push('Fixed: Populated filter dropdowns');
        }
      }
    }
  }
  
  // Run all checks
  function runAllChecks() {
    console.log('🔍 Running compatibility checks...');
    issues.length = 0;
    fixes.length = 0;
    
    checkCriticalFunctions();
    checkDOMElements();
    checkLocalStorage();
    checkBudgetFunctions();
    checkFirebaseFunctions();
    checkNextButton();
    checkSubmitButton();
    checkEventListeners();
    checkFilters();
    
    // Report results
    if (issues.length === 0 && fixes.length === 0) {
      console.log('✅ All compatibility checks passed!');
    } else {
      console.log(`📊 Compatibility Check Results:`);
      console.log(`   - Issues found: ${issues.length}`);
      console.log(`   - Auto-fixes applied: ${fixes.length}`);
      
      if (issues.length > 0) {
        console.warn('⚠️ Issues:', issues);
      }
      if (fixes.length > 0) {
        console.log('✅ Auto-fixes:', fixes);
      }
    }
    
    return {
      issues: issues.length,
      fixes: fixes.length,
      details: { issues, fixes }
    };
  }
  
  // Run checks on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllChecks, 1000);
      // Run periodic checks
      setInterval(runAllChecks, 30000); // Every 30 seconds
    });
  } else {
    setTimeout(runAllChecks, 1000);
    // Run periodic checks
    setInterval(runAllChecks, 30000); // Every 30 seconds
  }
  
  // Expose globally
  window.runCompatibilityChecks = runAllChecks;
  
  console.log('✅ Compatibility Checker initialized');
})();

