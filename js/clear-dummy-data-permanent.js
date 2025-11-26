// PERMANENT DUMMY DATA CLEARER - Removes all test/dummy data from database
// This script runs once on admin dashboard load to clean the database

(function() {
  'use strict';
  
  console.log('🧹 PERMANENT DUMMY DATA CLEARER - Initializing...');
  
  // Only run on admin dashboard
  if (!window.location.pathname.includes('admin_dashboard')) {
    return;
  }
  
  function clearAllDummyData() {
    try {
      console.log('🧹 Starting permanent dummy data cleanup...');
      
      // Get all applications
      const appsStr = localStorage.getItem('mbms_applications');
      if (!appsStr) {
        console.log('✅ No applications found - database is clean');
        return;
      }
      
      const allApps = JSON.parse(appsStr);
      if (!Array.isArray(allApps)) {
        console.log('✅ Invalid data format - resetting');
        localStorage.setItem('mbms_applications', '[]');
        return;
      }
      
      // Filter out ALL dummy/test data
      const realApps = allApps.filter(app => {
        if (!app || !app.applicantEmail) return false;
        
        // Comprehensive test data detection
        const isTest = 
          app.applicantEmail.includes('example.com') ||
          app.applicantEmail.includes('TEST_') ||
          app.applicantEmail.includes('test@') ||
          (app.appID && (
            app.appID.includes('TEST_') || 
            app.appID.includes('Firebase Test') ||
            app.appID.includes('DUMMY')
          )) ||
          (app.applicantName && (
            app.applicantName.includes('DUMMY') ||
            app.applicantName.includes('Test User')
          )) ||
          app.status === 'Deleted' ||
          app.status === 'Test';
        
        return !isTest;
      });
      
      // If dummy data was found, remove it permanently
      if (realApps.length !== allApps.length) {
        const removedCount = allApps.length - realApps.length;
        console.log(`🧹 Removing ${removedCount} dummy/test records permanently...`);
        
        // Save cleaned data
        localStorage.setItem('mbms_applications', JSON.stringify(realApps));
        
        // Also clear from Firebase if available
        if (typeof db !== 'undefined' && db) {
          try {
            allApps.forEach(async (app) => {
              const isTest = 
                app.applicantEmail && (
                  app.applicantEmail.includes('example.com') ||
                  app.applicantEmail.includes('TEST_') ||
                  app.applicantEmail.includes('test@')
                ) ||
                app.appID && (
                  app.appID.includes('TEST_') || 
                  app.appID.includes('DUMMY') ||
                  app.appID.includes('Firebase Test')
                ) ||
                app.applicantName && (
                  app.applicantName.includes('DUMMY') ||
                  app.applicantName.includes('Test User')
                ) ||
                app.status === 'Deleted' ||
                app.status === 'Test';
              
              if (isTest && app.id) {
                try {
                  await db.collection('applicants').doc(app.id).delete();
                  console.log('✅ Removed dummy data from Firebase:', app.id);
                } catch (e) {
                  console.warn('Firebase delete error:', e);
                }
              }
            });
          } catch (e) {
            console.warn('Firebase cleanup error:', e);
          }
        }
        
        console.log(`✅ Permanently removed ${removedCount} dummy/test records`);
        console.log(`✅ ${realApps.length} real applications remaining`);
        
        // Trigger refresh if refreshApplications is available
        if (typeof refreshApplications === 'function') {
          setTimeout(() => {
            refreshApplications();
          }, 500);
        }
      } else {
        console.log('✅ No dummy data found - database is clean');
      }
    } catch (error) {
      console.error('Error clearing dummy data:', error);
    }
  }
  
  // Run cleanup on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(clearAllDummyData, 1000);
    });
  } else {
    setTimeout(clearAllDummyData, 1000);
  }
  
  console.log('✅ Permanent dummy data clearer initialized');
})();

