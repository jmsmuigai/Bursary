// Clear All Data - Remove all dummy and test data
// This prepares the system for the first real application

(function() {
  'use strict';
  
  window.clearAllData = async function() {
    if (!confirm('⚠️ WARNING: This will delete ALL applications and test data!\n\nAre you sure you want to clear everything? This cannot be undone.')) {
      return;
    }
    
    if (!confirm('⚠️ FINAL CONFIRMATION:\n\nThis will:\n- Delete all applications\n- Delete all dummy/test data\n- Reset the system for the first real application\n\nContinue?')) {
      return;
    }
    
    try {
      // Clear localStorage
      const keysToKeep = ['mbms_admin', 'mbms_current_user', 'mbms_budget'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key) && (key.includes('mbms_application') || key.includes('TEST_') || key.includes('dummy'))) {
          localStorage.removeItem(key);
          console.log('🗑️ Cleared:', key);
        }
      });
      
      // Clear Firebase if available
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          const applicationsRef = db.collection('applicants');
          const snapshot = await applicationsRef.get();
          
          const batch = db.batch();
          snapshot.docs.forEach(doc => {
            // Only delete test/dummy data
            const data = doc.data();
            if (data.applicantEmail && (data.applicantEmail.includes('example.com') || data.applicantEmail.includes('TEST_'))) {
              batch.delete(doc.ref);
              console.log('🗑️ Firebase: Deleting', doc.id);
            }
          });
          
          await batch.commit();
          console.log('✅ Firebase test data cleared');
        } catch (firebaseError) {
          console.warn('Firebase clear error:', firebaseError);
        }
      }
      
      // Reset budget to baseline
      if (typeof updateBudgetData !== 'undefined') {
        await updateBudgetData({
          total: 50000000,
          allocated: 0,
          lastUpdated: new Date().toISOString()
        });
      } else {
        localStorage.setItem('mbms_budget', JSON.stringify({
          total: 50000000,
          allocated: 0,
          lastUpdated: new Date().toISOString()
        }));
      }
      
      alert('✅ All data cleared successfully!\n\n📊 System is now ready for the first real application.\n💰 Budget reset to Ksh 50,000,000');
      
      // Refresh dashboard
      if (typeof refreshApplications === 'function') {
        refreshApplications();
      }
      if (typeof updateMetrics === 'function') {
        updateMetrics();
      }
      if (typeof updateBudgetDisplay === 'function') {
        updateBudgetDisplay();
      }
      
      // Reload page
      setTimeout(() => {
        // Refresh without reload (fix flickering)
        if (typeof window.forceRefreshAll === 'function') {
          window.forceRefreshAll();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('❌ Error clearing data: ' + error.message);
    }
  };
  
  console.log('✅ Clear all data function ready');
})();

