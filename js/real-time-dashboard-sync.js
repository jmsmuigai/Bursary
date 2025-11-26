// REAL-TIME DASHBOARD SYNC - Ensures applications appear instantly on admin dashboard
// Listens for new applications and updates dashboard automatically

(function() {
  'use strict';
  
  console.log('🔄 REAL-TIME DASHBOARD SYNC - Initializing...');
  
  // Only run on admin dashboard
  if (!window.location.pathname.includes('admin_dashboard')) {
    return;
  }
  
  let refreshInterval;
  let lastApplicationCount = 0;
  
  // Initialize real-time sync
  function initRealTimeSync() {
    console.log('✅ Initializing real-time dashboard sync...');
    
    // Method 1: Firebase real-time listener (if Firebase is enabled)
    if (typeof db !== 'undefined' && db) {
      try {
        console.log('📡 Setting up Firebase real-time listener...');
        
        // Listen to 'applicants' collection (or 'applications' for backward compatibility)
        let unsubscribe;
        try {
          unsubscribe = db.collection('applicants').onSnapshot((snapshot) => {
            console.log('📡 Firebase snapshot received:', snapshot.size, 'applications');
            handleDataUpdate();
          }, (error) => {
            console.error('Firebase listener error:', error);
            // Fallback to 'applications' collection
            try {
              unsubscribe = db.collection('applications').onSnapshot((snapshot) => {
                console.log('📡 Firebase snapshot received (fallback):', snapshot.size, 'applications');
                handleDataUpdate();
              });
            } catch (e) {
              console.log('Firebase listener not available, using localStorage sync');
            }
          });
        } catch (e) {
          console.log('Firebase not available, using localStorage sync');
        }
      } catch (error) {
        console.log('Firebase listener setup failed, using localStorage sync:', error);
      }
    }
    
    // Method 2: localStorage storage event listener (cross-tab sync)
    window.addEventListener('storage', function(e) {
      if (e.key === 'mbms_applications' && e.newValue !== e.oldValue) {
        console.log('📦 Storage event detected - applications updated');
        handleDataUpdate();
      }
    });
    
    // Method 3: Custom event listener (same-tab sync)
    window.addEventListener('mbms-data-updated', function(e) {
      console.log('📢 Custom event detected - data updated:', e.detail);
      handleDataUpdate();
    });
    
    // Method 4: Periodic refresh (every 3 seconds)
    refreshInterval = setInterval(() => {
      checkForNewApplications();
    }, 3000);
    
    // Method 5: Visibility change (refresh when tab becomes visible)
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        console.log('👁️ Tab became visible - refreshing data');
        handleDataUpdate();
      }
    });
    
    // Method 6: Focus event (refresh when window gains focus)
    window.addEventListener('focus', function() {
      console.log('🎯 Window focused - refreshing data');
      handleDataUpdate();
    });
    
    // Initial load
    setTimeout(() => {
      handleDataUpdate();
    }, 1000);
    
    console.log('✅ Real-time sync initialized - dashboard will update automatically');
  }
  
  // Check for new applications
  function checkForNewApplications() {
    try {
      const apps = typeof getApplications !== 'undefined' ? 
        (async () => {
          const result = await getApplications();
          return Array.isArray(result) ? result : [];
        })() : 
        JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      
      // Handle async result
      if (apps && typeof apps.then === 'function') {
        apps.then(result => {
          const currentCount = Array.isArray(result) ? result.length : 0;
          if (currentCount !== lastApplicationCount) {
            console.log('📊 Application count changed:', lastApplicationCount, '→', currentCount);
            lastApplicationCount = currentCount;
            handleDataUpdate();
          }
        });
      } else {
        const currentCount = Array.isArray(apps) ? apps.length : 0;
        if (currentCount !== lastApplicationCount) {
          console.log('📊 Application count changed:', lastApplicationCount, '→', currentCount);
          lastApplicationCount = currentCount;
          handleDataUpdate();
        }
      }
    } catch (error) {
      console.error('Error checking for new applications:', error);
    }
  }
  
  // Handle data update
  function handleDataUpdate() {
    console.log('🔄 Data update detected - refreshing dashboard...');
    
    // Call refreshApplications if available
    if (typeof refreshApplications === 'function') {
      refreshApplications();
    } else if (typeof loadApplications === 'function') {
      // Fallback: manually trigger table render
      const apps = loadApplications();
      if (typeof renderTable === 'function') {
        renderTable(apps);
      }
      if (typeof updateMetrics === 'function') {
        updateMetrics();
      }
    } else {
      // Last resort: reload page
      console.log('⚠️ Refresh functions not available, reloading page...');
      window.location.reload();
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRealTimeSync);
  } else {
    initRealTimeSync();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  
  console.log('✅ Real-time dashboard sync module loaded');
})();

