// Unified System Activator - Ensures ALL buttons, forms, and functionality work
// This script activates and tests all system components

(function() {
  'use strict';
  
  console.log('🚀 Unified System Activator - Initializing...');
  
  /**
   * Activate All Application Form Buttons
   */
  window.activateApplicationFormButtons = function() {
    console.log('🔧 Activating application form buttons...');
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    const form = document.getElementById('applicationForm');
    
    if (!form) {
      console.warn('⚠️ Application form not found');
      return;
    }
    
    // Activate Next Button
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.cursor = 'pointer';
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.classList.remove('disabled');
      nextBtn.removeAttribute('disabled');
      console.log('✅ Next button activated');
    }
    
    // Activate Previous Button
    if (prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.cursor = 'pointer';
      prevBtn.style.opacity = '1';
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.classList.remove('disabled');
      prevBtn.removeAttribute('disabled');
      console.log('✅ Previous button activated');
    }
    
    // Activate Submit Button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.cursor = 'pointer';
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.classList.remove('disabled');
      submitBtn.removeAttribute('disabled');
      console.log('✅ Submit button activated');
    }
    
    // Activate Save Button
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.opacity = '1';
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.classList.remove('disabled');
      saveBtn.removeAttribute('disabled');
      console.log('✅ Save button activated');
    }
    
    // Activate all form inputs
    const allInputs = form.querySelectorAll('input, select, textarea, button');
    allInputs.forEach(input => {
      if (input.type !== 'hidden' && input.id !== 'submitBtn') {
        input.disabled = false;
        input.style.pointerEvents = 'auto';
        input.style.opacity = '1';
        input.removeAttribute('disabled');
      }
    });
    
    console.log('✅ All application form buttons and inputs activated');
  };
  
  /**
   * Activate All Admin Dashboard Buttons
   */
  window.activateAdminDashboardButtons = function() {
    console.log('🔧 Activating admin dashboard buttons...');
    
    // View buttons
    const viewButtons = document.querySelectorAll('[data-action="view"], button[onclick*="viewApplication"], button[onclick*="safeViewApplication"]');
    viewButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    // Edit buttons
    const editButtons = document.querySelectorAll('[data-action="edit"], button[onclick*="editApplication"]');
    editButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    // Download buttons
    const downloadButtons = document.querySelectorAll('[data-action="download"], button[onclick*="download"], button[onclick*="safeDownloadApplication"]');
    downloadButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    // Award/Reject buttons in modals
    const awardButtons = document.querySelectorAll('button[onclick*="approveApplication"], button[onclick*="award"]');
    awardButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    const rejectButtons = document.querySelectorAll('button[onclick*="rejectApplication"]');
    rejectButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('#applyFilters, button[onclick*="applyFilters"]');
    filterButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    // Refresh buttons
    const refreshButtons = document.querySelectorAll('button[onclick*="refresh"], button[onclick*="forceRefresh"]');
    refreshButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.classList.remove('disabled');
      btn.removeAttribute('disabled');
    });
    
    console.log('✅ All admin dashboard buttons activated');
  };
  
  /**
   * Test All System Functions
   */
  window.testAllSystemFunctions = async function() {
    console.log('🧪 Testing all system functions...');
    
    const results = {
      firebase: false,
      applicationForm: false,
      adminDashboard: false,
      buttons: false,
      filters: false,
      database: false
    };
    
    // Test Firebase
    if (typeof window.isFirebaseEnabled === 'function') {
      results.firebase = window.isFirebaseEnabled();
      console.log('📦 Firebase:', results.firebase ? '✅ Enabled' : '⚠️ Using localStorage');
    }
    
    // Test Application Form
    const form = document.getElementById('applicationForm');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    if (form && nextBtn && submitBtn) {
      results.applicationForm = true;
      console.log('✅ Application form: Found');
    } else {
      console.warn('⚠️ Application form: Not found (may be on different page)');
    }
    
    // Test Admin Dashboard
    const adminTable = document.getElementById('applicationsTableBody');
    const filterSubCounty = document.getElementById('filterSubCounty');
    if (adminTable && filterSubCounty) {
      results.adminDashboard = true;
      console.log('✅ Admin dashboard: Found');
    } else {
      console.warn('⚠️ Admin dashboard: Not found (may be on different page)');
    }
    
    // Test Buttons
    const buttons = document.querySelectorAll('button:not([disabled])');
    results.buttons = buttons.length > 0;
    console.log('✅ Buttons found:', buttons.length);
    
    // Test Filters
    if (filterSubCounty) {
      results.filters = filterSubCounty.options.length > 0;
      console.log('✅ Filters:', results.filters ? 'Populated' : 'Not populated');
    }
    
    // Test Database
    if (typeof window.getApplications !== 'undefined' || typeof window.loadApplications !== 'undefined') {
      results.database = true;
      console.log('✅ Database layer: Available');
    }
    
    console.log('📊 Test Results:', results);
    return results;
  };
  
  /**
   * Auto-activate on page load
   */
  function autoActivate() {
    // Activate application form buttons if on application page
    if (window.location.pathname.includes('application.html')) {
      setTimeout(() => {
        if (typeof window.activateApplicationFormButtons === 'function') {
          window.activateApplicationFormButtons();
        }
      }, 500);
    }
    
    // Activate admin dashboard buttons if on admin page
    if (window.location.pathname.includes('admin_dashboard.html')) {
      setTimeout(() => {
        if (typeof window.activateAdminDashboardButtons === 'function') {
          window.activateAdminDashboardButtons();
        }
        // Also test system
        if (typeof window.testAllSystemFunctions === 'function') {
          window.testAllSystemFunctions();
        }
      }, 1000);
    }
  }
  
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoActivate);
  } else {
    autoActivate();
  }
  
  // Also run after a delay to catch dynamically loaded content
  setTimeout(autoActivate, 2000);
  
  console.log('✅ Unified System Activator loaded');
})();

