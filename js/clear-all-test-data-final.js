/**
 * COMPREHENSIVE TEST DATA CLEANER
 * Removes ALL test data, dummy data, and example data from:
 * - localStorage (applications, users, drafts)
 * - Firebase (if configured)
 * - Ensures system is ready for first real application
 */

(function() {
  'use strict';
  
  console.log('🧹 Starting comprehensive test data cleanup...');
  
  // Function to detect if data is test/dummy data
  function isTestData(item, type) {
    if (!item) return true;
    
    // For applications
    if (type === 'application') {
      const email = item.applicantEmail || item.email || '';
      const name = item.applicantName || item.name || '';
      const appID = item.appID || '';
      
      return (
        email.includes('example.com') ||
        email.includes('TEST_') ||
        email.includes('test@') ||
        email.includes('dummy') ||
        email.includes('demo') ||
        appID.includes('TEST_') ||
        appID.includes('DUMMY') ||
        appID.includes('Firebase Test') ||
        appID.includes('Demo') ||
        name.includes('DUMMY') ||
        name.includes('Test User') ||
        name.includes('Demo User') ||
        name.includes('Example') ||
        item.status === 'Deleted' ||
        item.status === 'Test' ||
        item.status === 'Demo'
      );
    }
    
    // For users
    if (type === 'user') {
      const email = item.email || '';
      const name = (item.firstName || '') + ' ' + (item.lastName || '');
      
      return (
        email.includes('example.com') ||
        email.includes('TEST_') ||
        email.includes('test@') ||
        email.includes('dummy') ||
        email.includes('demo') ||
        name.includes('DUMMY') ||
        name.includes('Test User') ||
        name.includes('Demo User') ||
        name.includes('Example')
      );
    }
    
    return false;
  }
  
  // Clear applications
  function clearTestApplications() {
    try {
      const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const realApps = apps.filter(app => !isTestData(app, 'application'));
      
      if (apps.length !== realApps.length) {
        localStorage.setItem('mbms_applications', JSON.stringify(realApps));
        console.log('✅ Cleared', apps.length - realApps.length, 'test applications');
        console.log('✅ Remaining real applications:', realApps.length);
      } else {
        console.log('✅ No test applications found');
      }
      
      // Also clear from Firebase if configured
      if (typeof window.clearFirebaseTestData === 'function') {
        window.clearFirebaseTestData('applications');
      }
      
      return realApps.length;
    } catch (error) {
      console.error('❌ Error clearing test applications:', error);
      return 0;
    }
  }
  
  // Clear users (keep admin)
  function clearTestUsers() {
    try {
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const realUsers = users.filter(user => {
        // Keep admin user
        if (user.role === 'admin') return true;
        // Remove test users
        return !isTestData(user, 'user');
      });
      
      if (users.length !== realUsers.length) {
        localStorage.setItem('mbms_users', JSON.stringify(realUsers));
        console.log('✅ Cleared', users.length - realUsers.length, 'test users');
        console.log('✅ Remaining real users:', realUsers.length);
      } else {
        console.log('✅ No test users found');
      }
      
      // Also clear from Firebase if configured
      if (typeof window.clearFirebaseTestData === 'function') {
        window.clearFirebaseTestData('users');
      }
      
      return realUsers.length;
    } catch (error) {
      console.error('❌ Error clearing test users:', error);
      return 0;
    }
  }
  
  // Clear draft applications
  function clearDraftApplications() {
    try {
      let cleared = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('mbms_application_')) {
          try {
            const draft = JSON.parse(localStorage.getItem(key));
            if (isTestData(draft, 'application')) {
              localStorage.removeItem(key);
              cleared++;
            }
          } catch (e) {
            // If not valid JSON, remove it
            localStorage.removeItem(key);
            cleared++;
          }
        }
      });
      
      if (cleared > 0) {
        console.log('✅ Cleared', cleared, 'test draft applications');
      } else {
        console.log('✅ No test draft applications found');
      }
      
      return cleared;
    } catch (error) {
      console.error('❌ Error clearing draft applications:', error);
      return 0;
    }
  }
  
  // Clear all test data
  function clearAllTestData() {
    console.log('🧹 Starting comprehensive cleanup...');
    
    const appsBefore = JSON.parse(localStorage.getItem('mbms_applications') || '[]').length;
    const usersBefore = JSON.parse(localStorage.getItem('mbms_users') || '[]').length;
    
    // Clear applications
    const appsAfter = clearTestApplications();
    
    // Clear users
    const usersAfter = clearTestUsers();
    
    // Clear drafts
    const draftsCleared = clearDraftApplications();
    
    // Reset counters if no real applications
    if (appsAfter === 0) {
      localStorage.setItem('mbms_application_counter', '0');
      localStorage.setItem('mbms_last_serial', '0');
      console.log('✅ Reset application counter and serial number');
    }
    
    // Clear budget allocated if no awarded applications
    const remainingApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const awardedApps = remainingApps.filter(app => app.status === 'Awarded');
    if (awardedApps.length === 0) {
      localStorage.setItem('mbms_budget_allocated', '0');
      console.log('✅ Reset budget allocated (no awarded applications)');
    }
    
    // Summary
    console.log('📊 Cleanup Summary:');
    console.log('   Applications:', appsBefore, '→', appsAfter);
    console.log('   Users:', usersBefore, '→', usersAfter);
    console.log('   Drafts cleared:', draftsCleared);
    console.log('✅ System is now clean and ready for first real application!');
    
    // Trigger refresh if on admin dashboard
    if (typeof window.forceRefreshAll === 'function') {
      setTimeout(() => {
        window.forceRefreshAll();
        console.log('✅ Admin dashboard refreshed');
      }, 500);
    }
    
    // Trigger event for admin dashboard
    window.dispatchEvent(new CustomEvent('mbms-data-updated', {
      detail: { key: 'mbms_applications', action: 'cleared' }
    }));
    
    return {
      applicationsCleared: appsBefore - appsAfter,
      usersCleared: usersBefore - usersAfter,
      draftsCleared: draftsCleared,
      remainingApplications: appsAfter,
      remainingUsers: usersAfter
    };
  }
  
  // Clear Firebase test data
  async function clearFirebaseTestData(collection) {
    try {
      if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.log('📦 Firebase not configured - skipping Firebase cleanup');
        return;
      }
      
      const db = firebase.firestore();
      const snapshot = await db.collection(collection).get();
      
      const batch = db.batch();
      let deleted = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (isTestData(data, collection === 'applications' ? 'application' : 'user')) {
          batch.delete(doc.ref);
          deleted++;
        }
      });
      
      if (deleted > 0) {
        await batch.commit();
        console.log('✅ Cleared', deleted, 'test records from Firebase', collection);
      } else {
        console.log('✅ No test data in Firebase', collection);
      }
    } catch (error) {
      console.error('❌ Error clearing Firebase test data:', error);
    }
  }
  
  // Export functions
  window.clearAllTestData = clearAllTestData;
  window.clearFirebaseTestData = clearFirebaseTestData;
  
  // Auto-run on admin dashboard
  if (window.location.pathname.includes('admin_dashboard.html')) {
    console.log('🔍 Admin dashboard detected - Auto-cleaning test data...');
    setTimeout(() => {
      const result = clearAllTestData();
      if (result.applicationsCleared > 0 || result.usersCleared > 0) {
        alert(`✅ Test Data Cleaned!\n\nApplications removed: ${result.applicationsCleared}\nUsers removed: ${result.usersCleared}\nDrafts cleared: ${result.draftsCleared}\n\nSystem is now ready for first real application!`);
      }
    }, 1000);
  }
  
  console.log('✅ Test data cleaner loaded - Call clearAllTestData() to clean');
})();

