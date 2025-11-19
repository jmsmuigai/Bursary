// Multi-Device Sync System for Garissa Bursary Management
// Allows admin to login on multiple devices and see real-time updates

/**
 * Storage event listener for multi-device sync
 * When localStorage changes on one tab/device, update others
 */
(function() {
  // Listen for storage events (changes from other tabs/devices)
  window.addEventListener('storage', function(e) {
    if (e.key === 'mbms_applications' || e.key === 'mbms_budget_allocated') {
      console.log('Storage changed:', e.key);
      
      // Refresh applications if on admin dashboard
      if (window.location.pathname.includes('admin_dashboard.html')) {
        if (typeof refreshApplications !== 'undefined') {
          setTimeout(() => {
            refreshApplications();
          }, 500);
        }
        
        // Update budget display
        if (typeof updateBudgetDisplay !== 'undefined') {
          setTimeout(() => {
            updateBudgetDisplay();
          }, 500);
        }
      }
    }
  });
  
  // Custom event for same-tab updates
  window.addEventListener('mbms-data-updated', function(e) {
    console.log('Data updated event:', e.detail);
    
    if (window.location.pathname.includes('admin_dashboard.html')) {
      if (typeof refreshApplications !== 'undefined') {
        refreshApplications();
      }
      if (typeof updateBudgetDisplay !== 'undefined') {
        updateBudgetDisplay();
      }
    }
  });
  
  // DISABLED: Storage.prototype.setItem override to prevent conflicts
  // This was causing page freezing issues
  // Real-time sync can be handled via manual refresh button
})();

/**
 * Force refresh data from localStorage
 */
window.forceRefreshData = function() {
  if (typeof refreshApplications !== 'undefined') {
    refreshApplications();
  }
  if (typeof syncBudgetWithAwards !== 'undefined') {
    syncBudgetWithAwards();
  }
  if (typeof updateBudgetDisplay !== 'undefined') {
    updateBudgetDisplay();
  }
  if (typeof updateMetrics !== 'undefined') {
    updateMetrics();
  }
  console.log('Data refreshed from localStorage');
};

