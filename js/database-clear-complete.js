// COMPREHENSIVE DATABASE CLEARING SCRIPT
// This script completely clears the database and prepares it for fresh start

(function() {
  'use strict';
  
  console.log('🗑️ DATABASE CLEAR COMPLETE - Initializing...');
  
  /**
   * Clear ALL data from the system (applications, users except admin, drafts, counters)
   * WARNING: This is a destructive operation!
   */
  window.clearDatabaseComplete = async function() {
    // Double confirmation
    if (!confirm('⚠️ WARNING: This will DELETE ALL DATA from the system!\n\n' +
                 'This includes:\n' +
                 '- All applications\n' +
                 '- All user accounts (except admin)\n' +
                 '- All draft applications\n' +
                 '- Application counters\n' +
                 '- All test data\n\n' +
                 'This action CANNOT be undone!\n\n' +
                 'Are you absolutely sure?')) {
      return false;
    }
    
    if (!confirm('⚠️ FINAL CONFIRMATION:\n\n' +
                 'You are about to DELETE ALL DATA.\n\n' +
                 'This will leave only the admin account.\n\n' +
                 'Continue?')) {
      return false;
    }
    
    try {
      console.log('🗑️ Starting complete database clear...');
      
      // 1. Clear all applications
      localStorage.removeItem('mbms_applications');
      localStorage.setItem('mbms_applications', JSON.stringify([]));
      console.log('✅ Cleared all applications');
      
      // 2. Clear all draft applications
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('mbms_application_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('✅ Cleared all draft applications');
      
      // 3. Clear application counter
      localStorage.removeItem('mbms_application_counter');
      localStorage.setItem('mbms_application_counter', '0');
      console.log('✅ Reset application counter');
      
      // 4. Clear serial number counter
      localStorage.removeItem('mbms_last_serial');
      localStorage.setItem('mbms_last_serial', '0');
      console.log('✅ Reset serial number counter');
      
      // 5. Clear users except admin
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminUsers = users.filter(u => u.role === 'admin');
      localStorage.setItem('mbms_users', JSON.stringify(adminUsers));
      console.log('✅ Cleared all users except admin');
      
      // 6. Clear registration progress
      localStorage.removeItem('mbms_registration_progress');
      console.log('✅ Cleared registration progress');
      
      // 7. Clear budget data (optional - comment out if you want to keep budget)
      // localStorage.removeItem('mbms_budget');
      // localStorage.removeItem('mbms_budget_allocated');
      // console.log('✅ Cleared budget data');
      
      // 8. Clear Firebase data if available
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          
          // Clear applications collection
          const appsSnapshot = await db.collection('applicants').get();
          const deleteAppPromises = [];
          appsSnapshot.forEach(doc => {
            deleteAppPromises.push(doc.ref.delete());
          });
          await Promise.all(deleteAppPromises);
          console.log('✅ Cleared', deleteAppPromises.length, 'applications from Firebase');
          
          // Clear users collection (except admin)
          const usersSnapshot = await db.collection('users').get();
          const deleteUserPromises = [];
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.role !== 'admin') {
              deleteUserPromises.push(doc.ref.delete());
            }
          });
          await Promise.all(deleteUserPromises);
          console.log('✅ Cleared', deleteUserPromises.length, 'users from Firebase');
          
        } catch (error) {
          console.warn('Firebase clear error (may not be configured):', error);
        }
      }
      
      // 9. Clear session storage (optional - comment out if you want to keep current session)
      // sessionStorage.clear();
      // console.log('✅ Cleared session storage');
      
      // 10. Trigger refresh if on admin dashboard
      if (window.location.pathname.includes('admin_dashboard')) {
        if (typeof refreshApplications !== 'undefined') {
          await refreshApplications();
        }
        if (typeof updateMetrics !== 'undefined') {
          updateMetrics();
        }
        if (typeof updateBudgetDisplay !== 'undefined') {
          updateBudgetDisplay();
        }
      }
      
      // 11. Show success message
      alert('✅ DATABASE CLEARED SUCCESSFULLY!\n\n' +
            'All data has been removed from the system.\n\n' +
            'The system is now ready for fresh use.\n\n' +
            'Only the admin account remains.');
      
      console.log('✅ Database clear complete');
      return true;
      
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      alert('❌ Error clearing database:\n\n' + error.message);
      return false;
    }
  };
  
  /**
   * Clear only applications (keep users)
   */
  window.clearApplicationsOnly = async function() {
    if (!confirm('⚠️ This will delete ALL applications!\n\n' +
                 'User accounts will be kept.\n\n' +
                 'Continue?')) {
      return false;
    }
    
    try {
      localStorage.removeItem('mbms_applications');
      localStorage.setItem('mbms_applications', JSON.stringify([]));
      
      // Clear draft applications
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('mbms_application_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reset counters
      localStorage.setItem('mbms_application_counter', '0');
      localStorage.setItem('mbms_last_serial', '0');
      
      // Clear Firebase applications
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          const snapshot = await db.collection('applicants').get();
          const deletePromises = [];
          snapshot.forEach(doc => {
            deletePromises.push(doc.ref.delete());
          });
          await Promise.all(deletePromises);
          console.log('✅ Cleared', deletePromises.length, 'applications from Firebase');
        } catch (error) {
          console.warn('Firebase clear error:', error);
        }
      }
      
      // Refresh dashboard
      if (window.location.pathname.includes('admin_dashboard')) {
        if (typeof refreshApplications !== 'undefined') {
          await refreshApplications();
        }
        if (typeof updateMetrics !== 'undefined') {
          updateMetrics();
        }
      }
      
      alert('✅ All applications cleared successfully!');
      return true;
      
    } catch (error) {
      console.error('Error clearing applications:', error);
      alert('❌ Error: ' + error.message);
      return false;
    }
  };
  
  console.log('✅ Database Clear Complete script loaded');
  console.log('📝 Available functions:');
  console.log('   - clearDatabaseComplete() - Clear all data');
  console.log('   - clearApplicationsOnly() - Clear only applications');
})();

