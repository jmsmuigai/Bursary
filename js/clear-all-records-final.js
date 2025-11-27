/**
 * FINAL RECORD CLEARER
 * Removes ALL application records, keeping only column headers
 * Specifically removes Abdi Ali and any remaining test data
 */

(function() {
  'use strict';
  
  console.log('🧹 FINAL RECORD CLEARER - Removing all application records...');
  
  function clearAllApplicationRecords() {
    try {
      // Get all applications
      const allApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      
      console.log('📊 Found', allApps.length, 'applications to clear');
      
      // Clear ALL applications (keep structure but empty array)
      localStorage.setItem('mbms_applications', JSON.stringify([]));
      
      // Reset counter
      localStorage.setItem('mbms_application_counter', '0');
      
      // Reset serial number
      localStorage.setItem('mbms_last_serial', '0');
      
      // Reset budget allocated
      localStorage.setItem('mbms_budget_allocated', '0');
      
      // Clear any draft applications
      const keys = Object.keys(localStorage);
      let draftsCleared = 0;
      keys.forEach(key => {
        if (key.startsWith('mbms_application_')) {
          localStorage.removeItem(key);
          draftsCleared++;
        }
      });
      
      console.log('✅ All application records cleared');
      console.log('   Applications removed:', allApps.length);
      console.log('   Drafts cleared:', draftsCleared);
      console.log('   Counters reset to 0');
      console.log('✅ Database is now empty - ready for first real application');
      
      // Clear from Firebase if configured
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          db.collection('applicants').get().then(snapshot => {
            const batch = db.batch();
            let deleted = 0;
            snapshot.forEach(doc => {
              batch.delete(doc.ref);
              deleted++;
            });
            if (deleted > 0) {
              batch.commit().then(() => {
                console.log('✅ Cleared', deleted, 'records from Firebase');
              });
            }
          });
        } catch (e) {
          console.warn('Firebase clear error:', e);
        }
      }
      
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'cleared' }
      }));
      
      // Force storage event
      try {
        const storageEvent = new Event('storage');
        Object.defineProperty(storageEvent, 'key', { value: 'mbms_applications' });
        Object.defineProperty(storageEvent, 'newValue', { value: '[]' });
        window.dispatchEvent(storageEvent);
      } catch (e) {
        // Fallback
        localStorage.setItem('mbms_applications', JSON.stringify([]));
      }
      
      return {
        success: true,
        cleared: allApps.length,
        draftsCleared: draftsCleared
      };
      
    } catch (error) {
      console.error('❌ Error clearing records:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Auto-run on admin dashboard
  if (window.location.pathname.includes('admin_dashboard.html')) {
    console.log('🏠 Admin dashboard detected - clearing all records...');
    setTimeout(() => {
      const result = clearAllApplicationRecords();
      if (result.success) {
        console.log('✅ All records cleared successfully');
        
        // Refresh dashboard
        if (typeof window.forceRefreshAll === 'function') {
          setTimeout(() => {
            window.forceRefreshAll();
          }, 500);
        }
        
        // Refresh dashboard without reload (fix flickering)
        if (typeof window.forceRefreshAll === 'function') {
          setTimeout(() => {
            window.forceRefreshAll();
          }, 500);
        }
      }
    }, 1000);
  }
  
  // Export function
  window.clearAllApplicationRecords = clearAllApplicationRecords;
  
  console.log('✅ Final record clearer loaded');
  console.log('💡 Run manually: clearAllApplicationRecords()');
  
})();

