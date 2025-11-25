/**
 * SMART ENGINE - Instant Data Management & Real-time Updates
 * Ensures all components stay synchronized with the database
 */

(function() {
  'use strict';
  
  let updateInterval = null;
  let lastApplicationCount = 0;
  let lastUserCount = 0;
  
  /**
   * Smart Engine: Instant data synchronization
   */
  function smartEngine() {
    try {
      // Check for new applications
      const currentApps = typeof getApplications !== 'undefined' ? getApplications() : 
                         JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const currentUsers = typeof getUsers !== 'undefined' ? getUsers() : 
                           JSON.parse(localStorage.getItem('mbms_users') || '[]');
      
      // Detect changes
      if (currentApps.length !== lastApplicationCount || currentUsers.length !== lastUserCount) {
        console.log('🔄 Smart Engine: Data change detected');
        console.log('   Applications:', lastApplicationCount, '→', currentApps.length);
        console.log('   Users:', lastUserCount, '→', currentUsers.length);
        
        // Update counts
        lastApplicationCount = currentApps.length;
        lastUserCount = currentUsers.length;
        
        // Trigger refresh events
        window.dispatchEvent(new CustomEvent('mbms-data-updated', {
          detail: { 
            key: 'mbms_applications', 
            action: 'changed',
            count: currentApps.length
          }
        }));
        
        // Refresh admin dashboard if loaded
        if (typeof refreshApplications === 'function') {
          refreshApplications();
        }
        
        // Refresh visualizations if loaded
        if (typeof refreshVisualizations === 'function') {
          refreshVisualizations();
        }
        
        // Refresh metrics if loaded
        if (typeof updateMetrics === 'function') {
          updateMetrics();
        }
        
        // Refresh budget if loaded
        if (typeof updateBudgetDisplay === 'function') {
          updateBudgetDisplay();
        }
      }
    } catch (error) {
      console.error('Smart Engine error:', error);
    }
  }
  
  /**
   * Start Smart Engine
   */
  function startSmartEngine() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    // Initial sync
    smartEngine();
    
    // Run every 1.5 seconds for instant updates
    updateInterval = setInterval(smartEngine, 1500);
    
    console.log('✅ Smart Engine started - Real-time synchronization active');
  }
  
  /**
   * Stop Smart Engine
   */
  function stopSmartEngine() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
      console.log('⏸️ Smart Engine stopped');
    }
  }
  
  // Listen for data updates
  window.addEventListener('mbms-data-updated', function(e) {
    console.log('📡 Smart Engine: Received data update event:', e.detail);
    smartEngine();
  });
  
  // Start engine when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSmartEngine);
  } else {
    startSmartEngine();
  }
  
  // Export functions
  window.startSmartEngine = startSmartEngine;
  window.stopSmartEngine = stopSmartEngine;
  window.smartEngine = smartEngine;
  
  console.log('✅ Smart Engine loaded - Instant data management ready');
})();

