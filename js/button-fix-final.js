// Final Button Fix - Ensures ALL buttons work
// This runs after all scripts to activate buttons

(function() {
  'use strict';
  
  console.log('🔧 Final Button Fix: Initializing...');
  
  function activateAllButtons() {
    console.log('🔧 Final Button Fix: Activating all buttons...');
    
    // Ensure all critical functions are available
    const criticalFunctions = [
      'viewApplication',
      'safeViewApplication',
      'safeDownloadApplication',
      'downloadApplicationLetter',
      'downloadApplicationPDFFromView',
      'editApplication',
      'approveApplication',
      'rejectApplication',
      'applyFilters',
      'populateFilters',
      'populateFilterWards'
    ];
    
    const missing = criticalFunctions.filter(fn => typeof window[fn] === 'undefined');
    if (missing.length > 0) {
      console.warn('⚠️ Missing functions:', missing);
    } else {
      console.log('✅ All critical functions are available');
    }
    
    // Event delegation for table buttons (works even if buttons are dynamically added)
    const tableBody = document.getElementById('applicationsTableBody');
    if (tableBody) {
      // Remove old listener if exists
      tableBody.removeEventListener('click', handleTableButtonClick);
      tableBody.addEventListener('click', handleTableButtonClick);
      console.log('✅ Table button event delegation attached');
    }
    
    function handleTableButtonClick(e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const action = btn.getAttribute('data-action');
      const appID = btn.getAttribute('data-appid');
      
      if (!appID) {
        console.error('No appID found for button');
        return;
      }
      
      console.log(`🔘 ${action} button clicked for:`, appID);
      
      if (action === 'view') {
        if (typeof window.safeViewApplication === 'function') {
          window.safeViewApplication(appID);
        } else if (typeof window.viewApplication === 'function') {
          window.viewApplication(appID);
        } else {
          alert('View function not available. Please refresh the page.');
        }
      } else if (action === 'edit') {
        if (typeof window.editApplication === 'function') {
          window.editApplication(appID);
        } else {
          alert('Edit function not available. Please refresh the page.');
        }
      } else if (action === 'download') {
        if (typeof window.safeDownloadApplication === 'function') {
          window.safeDownloadApplication(appID);
        } else if (typeof window.downloadApplicationLetter === 'function') {
          window.downloadApplicationLetter(appID);
        } else {
          alert('Download function not available. Please refresh the page.');
        }
      }
    }
    
    // Fix dropdown filters
    setTimeout(() => {
      const filterSubCounty = document.getElementById('filterSubCounty');
      const filterWard = document.getElementById('filterWard');
      const filterStatus = document.getElementById('filterStatus');
      const applyFiltersBtn = document.getElementById('applyFilters') || document.getElementById('applyFiltersBtn');
      
      if (filterSubCounty) {
        // Remove old listener
        const newSc = filterSubCounty.cloneNode(true);
        filterSubCounty.parentNode.replaceChild(newSc, filterSubCounty);
        
        newSc.addEventListener('change', function() {
          console.log('📍 Sub-county changed:', this.value);
          if (typeof window.populateFilterWards === 'function') {
            window.populateFilterWards();
          }
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            }
          }, 100);
        });
      }
      
      if (filterWard) {
        const newWard = filterWard.cloneNode(true);
        filterWard.parentNode.replaceChild(newWard, filterWard);
        
        newWard.addEventListener('change', function() {
          console.log('📍 Ward changed:', this.value);
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            }
          }, 100);
        });
      }
      
      if (filterStatus) {
        const newStatus = filterStatus.cloneNode(true);
        filterStatus.parentNode.replaceChild(newStatus, filterStatus);
        
        newStatus.addEventListener('change', function() {
          console.log('📍 Status changed:', this.value);
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            }
          }, 100);
        });
      }
      
      if (applyFiltersBtn) {
        const newBtn = applyFiltersBtn.cloneNode(true);
        applyFiltersBtn.parentNode.replaceChild(newBtn, applyFiltersBtn);
        
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔍 Apply Filters clicked');
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          }
        });
      }
      
      console.log('✅ Dropdown filters activated');
    }, 500);
    
    console.log('✅ Final Button Fix: All buttons activated');
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateAllButtons);
  } else {
    activateAllButtons();
  }
  
  // Also run after delays to catch dynamically added elements
  setTimeout(activateAllButtons, 1000);
  setTimeout(activateAllButtons, 3000);
  
})();

