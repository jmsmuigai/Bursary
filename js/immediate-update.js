// Immediate Update System - Ensures real-time UI updates
// This module ensures budget and data updates happen instantly

(function() {
  'use strict';
  
  // Listen for budget update events
  window.addEventListener('mbms-budget-updated', function(e) {
    console.log('💰 Budget update event received:', e.detail);
    
    // Update budget display immediately
    if (typeof updateBudgetDisplay === 'function') {
      updateBudgetDisplay();
    }
    
    // Update metrics
    if (typeof updateMetrics === 'function') {
      updateMetrics();
    }
  });
  
  // Listen for data update events
  window.addEventListener('mbms-data-updated', function(e) {
    console.log('📊 Data update event received:', e.detail);
    
    // Refresh applications table
    if (typeof refreshApplications === 'function') {
      refreshApplications();
    }
    
    // Update metrics
    if (typeof updateMetrics === 'function') {
      updateMetrics();
    }
    
    // Update budget display
    if (typeof updateBudgetDisplay === 'function') {
      updateBudgetDisplay();
    }
  });
  
  // Force immediate refresh on page visibility change
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      // Page became visible - refresh data
      console.log('👁️ Page visible - refreshing data...');
      
      if (typeof refreshApplications === 'function') {
        refreshApplications();
      }
      
      if (typeof updateBudgetDisplay === 'function') {
        updateBudgetDisplay();
      }
      
      if (typeof updateMetrics === 'function') {
        updateMetrics();
      }
    }
  });
  
  console.log('✅ Immediate update system initialized');
})();

