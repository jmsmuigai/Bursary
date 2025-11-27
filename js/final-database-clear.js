// FINAL DATABASE CLEAR - Ensures database is completely empty
// Removes ALL test data and ensures first column (admin list) is empty

(function() {
  'use strict';
  
  console.log('🗑️ FINAL DATABASE CLEAR - Ensuring database is empty...');
  
  /**
   * Clear database completely - ensures it's empty for first application
   */
  window.clearDatabaseForProduction = function() {
    console.log('🧹 Clearing database for production...');
    
    if (!confirm('⚠️ FINAL DATABASE CLEAR\n\nThis will:\n- Remove ALL applications\n- Remove ALL users (except admin)\n- Reset ALL counters\n- Clear ALL drafts\n\nDatabase will be completely empty and ready for first application.\n\nContinue?')) {
      return false;
    }
    
    try {
      // 1. Clear all applications
      localStorage.setItem('mbms_applications', JSON.stringify([]));
      console.log('✅ Cleared all applications');
      
      // 2. Clear all users except admin
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminUsers = users.filter(u => u.role === 'admin');
      localStorage.setItem('mbms_users', JSON.stringify(adminUsers));
      console.log('✅ Cleared all users except admin. Admin count:', adminUsers.length);
      
      // 3. Clear all draft applications
      const allKeys = Object.keys(localStorage);
      let draftsCleared = 0;
      allKeys.forEach(key => {
        if (key.startsWith('mbms_application_')) {
          localStorage.removeItem(key);
          draftsCleared++;
        }
      });
      console.log('✅ Cleared', draftsCleared, 'draft applications');
      
      // 4. Reset all counters
      localStorage.setItem('mbms_application_counter', '0');
      localStorage.setItem('mbms_last_serial', '0');
      console.log('✅ Reset all counters');
      
      // 5. Clear registration progress
      localStorage.removeItem('mbms_registration_progress');
      console.log('✅ Cleared registration progress');
      
      // 6. Clear Firebase data if available
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          
          // Clear applications
          db.collection('applicants').get().then(snapshot => {
            const deletePromises = [];
            snapshot.forEach(doc => {
              deletePromises.push(doc.ref.delete());
            });
            return Promise.all(deletePromises);
          }).then(() => {
            console.log('✅ Cleared Firebase applications');
          });
          
          // Clear users (except admin)
          db.collection('users').get().then(snapshot => {
            const deletePromises = [];
            snapshot.forEach(doc => {
              const userData = doc.data();
              if (userData.role !== 'admin') {
                deletePromises.push(doc.ref.delete());
              }
            });
            return Promise.all(deletePromises);
          }).then(() => {
            console.log('✅ Cleared Firebase users (except admin)');
          });
        } catch (error) {
          console.warn('Firebase clear error (may not be configured):', error);
        }
      }
      
      // 7. Verify database is empty
      const finalApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const finalUsers = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminCount = finalUsers.filter(u => u.role === 'admin').length;
      
      console.log('📊 Final Database Status:');
      console.log('   Applications:', finalApps.length, '(should be 0)');
      console.log('   Users:', finalUsers.length, '(should be', adminCount, '- admin only)');
      console.log('   Admin users:', adminCount);
      
      // Refresh dashboard if on admin page
      if (window.location.pathname.includes('admin_dashboard')) {
        if (typeof refreshApplications === 'function') {
          setTimeout(() => refreshApplications(), 500);
        }
        if (typeof updateMetrics === 'function') {
          setTimeout(() => updateMetrics(), 500);
        }
      }
      
      alert('✅ DATABASE CLEARED SUCCESSFULLY!\n\n' +
            'Database Status:\n' +
            '- Applications: 0\n' +
            '- Users: ' + adminCount + ' (admin only)\n' +
            '- Counters: Reset to 0\n' +
            '- Drafts: Cleared\n\n' +
            'The system is now ready for the first application!');
      
      return {
        success: true,
        applications: 0,
        users: adminCount,
        adminUsers: adminCount
      };
      
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      alert('❌ Error clearing database:\n\n' + error.message);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Verify database is empty
   */
  window.verifyDatabaseEmpty = function() {
    const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminUsers = users.filter(u => u.role === 'admin');
    const nonAdminUsers = users.filter(u => u.role !== 'admin');
    
    const testApps = applications.filter(app => 
      app.applicantEmail && (
        app.applicantEmail.includes('test') || 
        app.applicantEmail.includes('example.com') ||
        app.appID && (app.appID.includes('TEST') || app.appID.includes('test'))
      )
    );
    
    const status = {
      applications: applications.length,
      testApplications: testApps.length,
      users: users.length,
      adminUsers: adminUsers.length,
      nonAdminUsers: nonAdminUsers.length,
      isEmpty: applications.length === 0 && nonAdminUsers.length === 0,
      isReady: applications.length === 0 && nonAdminUsers.length === 0 && adminUsers.length > 0
    };
    
    console.log('📊 Database Verification:');
    console.log('   Applications:', status.applications, status.applications === 0 ? '✅' : '❌');
    console.log('   Test Applications:', status.testApplications, status.testApplications === 0 ? '✅' : '❌');
    console.log('   Users:', status.users);
    console.log('   Admin Users:', status.adminUsers, status.adminUsers > 0 ? '✅' : '❌');
    console.log('   Non-Admin Users:', status.nonAdminUsers, status.nonAdminUsers === 0 ? '✅' : '❌');
    console.log('   Is Empty:', status.isEmpty ? '✅' : '❌');
    console.log('   Is Ready:', status.isReady ? '✅' : '❌');
    
    if (status.isReady) {
      alert('✅ DATABASE IS EMPTY AND READY!\n\n' +
            'Applications: 0 ✅\n' +
            'Users: ' + status.adminUsers + ' (admin only) ✅\n' +
            'Test Data: None ✅\n\n' +
            'System is ready for first application!');
    } else {
      alert('⚠️ DATABASE NOT EMPTY\n\n' +
            'Applications: ' + status.applications + (status.applications > 0 ? ' ❌' : ' ✅') + '\n' +
            'Test Applications: ' + status.testApplications + (status.testApplications > 0 ? ' ❌' : ' ✅') + '\n' +
            'Non-Admin Users: ' + status.nonAdminUsers + (status.nonAdminUsers > 0 ? ' ❌' : ' ✅') + '\n\n' +
            'Run clearDatabaseForProduction() to clear all data.');
    }
    
    return status;
  };
  
  // Auto-clear on admin dashboard load (if needed)
  if (window.location.pathname.includes('admin_dashboard')) {
    // Check if database needs clearing
    const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const testApps = applications.filter(app => 
      app.applicantEmail && (
        app.applicantEmail.includes('test') || 
        app.applicantEmail.includes('example.com') ||
        app.appID && (app.appID.includes('TEST') || app.appID.includes('test'))
      )
    );
    
    if (testApps.length > 0) {
      console.log('⚠️ Test applications found. Run clearDatabaseForProduction() to clear them.');
    }
  }
  
  console.log('✅ Final Database Clear script loaded');
  console.log('📝 Available functions:');
  console.log('   - clearDatabaseForProduction() - Clear all data');
  console.log('   - verifyDatabaseEmpty() - Verify database is empty');
})();

