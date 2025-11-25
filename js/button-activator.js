// Button Activator - Ensures ALL buttons work properly
// This script runs after all other scripts to activate buttons

(function() {
  'use strict';
  
  console.log('🔧 Button Activator: Initializing...');
  
  // Wait for DOM and all scripts to load
  function activateAllButtons() {
    console.log('🔧 Button Activator: Activating all buttons...');
    
    // Ensure all window functions exist
    const requiredFunctions = [
      'viewApplication',
      'safeViewApplication',
      'safeDownloadApplication',
      'downloadApplicationLetter',
      'editApplication',
      'approveApplication',
      'rejectApplication',
      'applyFilters',
      'refreshApplications',
      'populateFilters'
    ];
    
    // Check which functions are missing
    const missing = requiredFunctions.filter(fn => typeof window[fn] === 'undefined');
    if (missing.length > 0) {
      console.warn('⚠️ Missing functions:', missing);
    } else {
      console.log('✅ All required functions are available');
    }
    
    // Fix View buttons - use event delegation
    document.addEventListener('click', function(e) {
      const target = e.target.closest('button[onclick*="safeViewApplication"]');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const onclick = target.getAttribute('onclick');
        const match = onclick.match(/safeViewApplication\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          const appID = match[1];
          console.log('👁️ View button clicked via delegation:', appID);
          if (typeof window.safeViewApplication === 'function') {
            window.safeViewApplication(appID);
          } else if (typeof window.viewApplication === 'function') {
            window.viewApplication(appID);
          } else {
            alert('View function not available. Please refresh the page.');
          }
        }
        return false;
      }
      
      // Fix Download buttons
      const downloadBtn = e.target.closest('button[onclick*="safeDownloadApplication"]');
      if (downloadBtn) {
        e.preventDefault();
        e.stopPropagation();
        const onclick = downloadBtn.getAttribute('onclick');
        const match = onclick.match(/safeDownloadApplication\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          const appID = match[1];
          console.log('📥 Download button clicked via delegation:', appID);
          if (typeof window.safeDownloadApplication === 'function') {
            window.safeDownloadApplication(appID);
          } else if (typeof window.downloadApplicationLetter === 'function') {
            window.downloadApplicationLetter(appID);
          } else {
            alert('Download function not available. Please refresh the page.');
          }
        }
        return false;
      }
      
      // Fix Edit buttons
      const editBtn = e.target.closest('button[onclick*="editApplication"]');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const onclick = editBtn.getAttribute('onclick');
        const match = onclick.match(/editApplication\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          const appID = match[1];
          console.log('✏️ Edit button clicked via delegation:', appID);
          if (typeof window.editApplication === 'function') {
            window.editApplication(appID);
          } else {
            alert('Edit function not available. Please refresh the page.');
          }
        }
        return false;
      }
    });
    
    // Fix dropdown filters - ensure they work
    setTimeout(() => {
      const filterSubCounty = document.getElementById('filterSubCounty');
      const filterWard = document.getElementById('filterWard');
      const filterStatus = document.getElementById('filterStatus');
      const applyFiltersBtn = document.getElementById('applyFiltersBtn');
      
      if (filterSubCounty) {
        filterSubCounty.addEventListener('change', function() {
          console.log('📍 Sub-county changed:', this.value);
          if (typeof window.populateFilters === 'function') {
            // Trigger ward population
            const populateFilterWards = function() {
              const wardSel = document.getElementById('filterWard');
              if (!wardSel) return;
              
              wardSel.innerHTML = '<option value="">All Wards</option>';
              const selectedSubCounty = filterSubCounty.value;
              
              if (selectedSubCounty && selectedSubCounty !== 'Other' && typeof GARISSA_WARDS !== 'undefined' && GARISSA_WARDS[selectedSubCounty]) {
                const wards = [...GARISSA_WARDS[selectedSubCounty]].sort();
                wards.forEach(w => {
                  const option = document.createElement('option');
                  option.value = w;
                  option.textContent = w;
                  wardSel.appendChild(option);
                });
              } else if (!selectedSubCounty) {
                // Show all wards
                if (typeof GARISSA_WARDS !== 'undefined') {
                  const allWards = [];
                  Object.values(GARISSA_WARDS).forEach(wardArray => {
                    wardArray.forEach(ward => {
                      if (!allWards.includes(ward)) allWards.push(ward);
                    });
                  });
                  allWards.sort().forEach(w => {
                    const option = document.createElement('option');
                    option.value = w;
                    option.textContent = w;
                    wardSel.appendChild(option);
                  });
                }
              }
              
              // Add Other option
              const otherOption = document.createElement('option');
              otherOption.value = 'Other';
              otherOption.textContent = 'Other (Specify)';
              wardSel.appendChild(otherOption);
            };
            
            populateFilterWards();
          }
          
          // Auto-apply filters
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            }
          }, 100);
        });
      }
      
      if (filterWard) {
        filterWard.addEventListener('change', function() {
          console.log('📍 Ward changed:', this.value);
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            }
          }, 100);
        });
      }
      
      if (filterStatus) {
        filterStatus.addEventListener('change', function() {
          console.log('📍 Status changed:', this.value);
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            }
          }, 100);
        });
      }
      
      if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔍 Apply Filters button clicked');
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          }
        });
      }
      
      console.log('✅ Dropdown event listeners attached');
    }, 1000);
    
    // Ensure Bootstrap modals work
    if (typeof bootstrap !== 'undefined') {
      console.log('✅ Bootstrap is available');
    } else {
      console.warn('⚠️ Bootstrap not available - modals may not work');
    }
    
    console.log('✅ Button Activator: All buttons activated');
  }
  
  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateAllButtons);
  } else {
    activateAllButtons();
  }
  
  // Also run after a delay to catch dynamically added buttons
  setTimeout(activateAllButtons, 2000);
  setTimeout(activateAllButtons, 5000);
  
})();

