// CLEAR ALL DUMMY DATA - Comprehensive script to remove all test/dummy data
// This ensures the system is ready for the first real applicant

(function() {
  'use strict';
  
  console.log('🧹 CLEAR ALL DUMMY DATA - Initializing comprehensive cleanup...');
  
  // Function to clear all dummy/test data
  window.clearAllDummyData = async function() {
    if (!confirm('⚠️ This will delete ALL dummy and test data!\n\nAre you sure you want to clear everything and prepare for the first real application?')) {
      return;
    }
    
    try {
      console.log('🧹 Starting comprehensive data cleanup...');
      
      // Step 1: Clear localStorage applications (filter out test data)
      const allApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const realApps = allApps.filter(app => {
        if (!app) return false;
        if (!app.applicantEmail) return false;
        
        // Filter out test/dummy data
        const isTest = 
          app.applicantEmail.includes('example.com') ||
          app.applicantEmail.includes('TEST_') ||
          app.applicantEmail.includes('test@') ||
          app.appID && (
            app.appID.includes('TEST_') || 
            app.appID.includes('Firebase Test') ||
            app.appID.includes('DUMMY')
          ) ||
          app.applicantName && (
            app.applicantName.includes('DUMMY') ||
            app.applicantName.includes('Test')
          ) ||
          app.status === 'Deleted' ||
          app.status === 'Test';
        
        return !isTest;
      });
      
      console.log('📊 Found', allApps.length, 'total applications');
      console.log('📊 Filtered to', realApps.length, 'real applications');
      console.log('🗑️ Removing', allApps.length - realApps.length, 'dummy/test records');
      
      // Save only real applications
      localStorage.setItem('mbms_applications', JSON.stringify(realApps));
      
      // Step 2: Clear Firebase (if available)
      if (typeof window.getApplications !== 'undefined' && typeof firebase !== 'undefined') {
        try {
          console.log('🔥 Clearing Firebase test data...');
          const db = firebase.firestore();
          const apps = await window.getApplications();
          
          // Delete test applications from Firebase
          for (const app of apps) {
            const isTest = 
              app.applicantEmail && (
                app.applicantEmail.includes('example.com') ||
                app.applicantEmail.includes('TEST_') ||
                app.applicantEmail.includes('test@')
              ) ||
              app.appID && (
                app.appID.includes('TEST_') || 
                app.appID.includes('Firebase Test') ||
                app.appID.includes('DUMMY')
              ) ||
              app.applicantName && (
                app.applicantName.includes('DUMMY') ||
                app.applicantName.includes('Test')
              ) ||
              app.status === 'Deleted' ||
              app.status === 'Test';
            
            if (isTest && app.id) {
              try {
                await db.collection('applicants').doc(app.id).delete();
                console.log('🗑️ Deleted test app from Firebase:', app.id);
              } catch (e) {
                console.warn('Could not delete from Firebase:', e);
              }
            }
          }
          
          console.log('✅ Firebase test data cleared');
        } catch (error) {
          console.warn('Firebase clear error (continuing with localStorage):', error);
        }
      }
      
      // Step 3: Reset counters (but keep structure)
      // Don't reset application counter - let it continue from where real apps left off
      // localStorage.removeItem('mbms_application_counter'); // Keep counter
      
      // Step 4: Clear any test-related flags
      localStorage.removeItem('mbms_dummy_data_loaded');
      localStorage.removeItem('mbms_test_mode');
      
      // Step 5: Refresh dashboard if on admin page
      if (window.location.pathname.includes('admin_dashboard')) {
        // Trigger refresh
        if (typeof refreshApplications === 'function') {
          refreshApplications();
        }
        if (typeof updateMetrics === 'function') {
          updateMetrics();
        }
        if (typeof updateBudgetDisplay === 'function') {
          updateBudgetDisplay();
        }
        if (typeof renderTable === 'function') {
          const apps = typeof loadApplications === 'function' ? loadApplications() : realApps;
          renderTable(apps);
        }
      }
      
      // Show success message
      const message = `✅ All dummy/test data cleared!\n\n📊 Real applications remaining: ${realApps.length}\n\n✅ System ready for first real applicant.\n\n🔄 Dashboard will refresh automatically.`;
      alert(message);
      
      // Reload page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      console.log('✅ Data cleanup completed successfully');
      return { success: true, realAppsCount: realApps.length, removedCount: allApps.length - realApps.length };
    } catch (error) {
      console.error('❌ Error clearing dummy data:', error);
      alert('❌ Error clearing dummy data: ' + error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Auto-clear on admin dashboard load (if no real applications)
  if (window.location.pathname.includes('admin_dashboard')) {
    setTimeout(() => {
      try {
        const allApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const hasTestData = allApps.some(app => {
          if (!app || !app.applicantEmail) return false;
          return (
            app.applicantEmail.includes('example.com') ||
            app.applicantEmail.includes('TEST_') ||
            app.appID && (
              app.appID.includes('TEST_') || 
              app.appID.includes('DUMMY') ||
              app.appID.includes('Firebase Test')
            ) ||
            app.applicantName && app.applicantName.includes('DUMMY') ||
            app.status === 'Deleted' ||
            app.status === 'Test'
          );
        });
        
        if (hasTestData) {
          console.log('⚠️ Test data detected - auto-clearing...');
          // Auto-clear without confirmation (silent cleanup)
          const realApps = allApps.filter(app => {
            if (!app || !app.applicantEmail) return false;
            const isTest = 
              app.applicantEmail.includes('example.com') ||
              app.applicantEmail.includes('TEST_') ||
              app.appID && (
                app.appID.includes('TEST_') || 
                app.appID.includes('DUMMY') ||
                app.appID.includes('Firebase Test')
              ) ||
              app.applicantName && app.applicantName.includes('DUMMY') ||
              app.status === 'Deleted' ||
              app.status === 'Test';
            return !isTest;
          });
          
          localStorage.setItem('mbms_applications', JSON.stringify(realApps));
          console.log('✅ Test data auto-cleared. Real apps:', realApps.length);
          
          // Refresh dashboard
          if (typeof refreshApplications === 'function') {
            refreshApplications();
          }
        }
      } catch (e) {
        console.warn('Auto-clear check error:', e);
      }
    }, 1000);
  }
  
  console.log('✅ Clear All Dummy Data script initialized');
})();

