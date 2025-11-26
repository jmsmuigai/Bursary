// CLEAR AND PREPARE SYSTEM - Clears all test data and shows blank list ready for first applicant
// This prepares the system for production use

(function() {
  'use strict';
  
  console.log('🧹 CLEAR AND PREPARE SYSTEM - Initializing...');
  
  // Auto-clear test data on admin dashboard load
  if (window.location.pathname.includes('admin_dashboard')) {
    // Filter out test data from display
    const originalLoadApplications = window.loadApplications;
    if (originalLoadApplications) {
      window.loadApplications = function() {
        const allApps = originalLoadApplications();
        // Filter out test/dummy data
        const realApps = allApps.filter(app => {
          if (!app.applicantEmail) return false;
          return !(
            app.applicantEmail.includes('example.com') ||
            app.applicantEmail.includes('TEST_') ||
            app.appID && (app.appID.includes('TEST_') || app.appID.includes('Firebase Test'))
          );
        });
        return realApps;
      };
    }
    
    // Update renderTable to show blank rows when empty
    const originalRenderTable = window.renderTable;
    if (originalRenderTable) {
      window.renderTable = function(applications) {
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) {
          if (originalRenderTable) originalRenderTable(applications);
          return;
        }
        
        // Filter out test data
        const realApps = applications.filter(app => {
          if (!app.applicantEmail) return false;
          return !(
            app.applicantEmail.includes('example.com') ||
            app.applicantEmail.includes('TEST_') ||
            app.appID && (app.appID.includes('TEST_') || app.appID.includes('Firebase Test'))
          );
        });
        
        // If no real applications, show blank rows
        if (realApps.length === 0) {
          tbody.innerHTML = '';
          
          // Show 10 blank rows
          for (let i = 1; i <= 10; i++) {
            const tr = document.createElement('tr');
            tr.className = 'table-row-placeholder';
            tr.style.opacity = '0.5';
            tr.innerHTML = `
              <td><strong class="text-muted">${i}</strong></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="text-muted">Waiting for first applicant...</span></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="badge bg-secondary">-</span></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="text-muted">-</span></td>
            `;
            tbody.appendChild(tr);
          }
          
          // Add message row
          const messageRow = document.createElement('tr');
          messageRow.innerHTML = `
            <td colspan="8" class="text-center py-4">
              <div class="alert alert-info mb-0">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                <h5>System Ready for First Application</h5>
                <p class="mb-0">The system is ready to receive the first application submission.</p>
                <p class="mb-0"><small>Once an applicant submits their application, it will appear here automatically.</small></p>
              </div>
            </td>
          `;
          tbody.appendChild(messageRow);
          
          console.log('✅ Showing blank list - ready for first applicant');
          return;
        }
        
        // Show real applications
        if (originalRenderTable) {
          originalRenderTable(realApps);
        }
      };
    }
  }
  
  // Clear test data function (called from admin dashboard)
  window.clearAllTestDataAndPrepare = async function() {
    if (!confirm('⚠️ WARNING: This will delete ALL test and dummy data!\n\nThis will:\n- Delete all test/dummy applications\n- Clear Firebase test data\n- Reset application counter\n- Prepare system for first real application\n\nAre you sure?')) {
      return;
    }
    
    if (!confirm('⚠️ FINAL CONFIRMATION:\n\nThis action cannot be undone!\n\nContinue?')) {
      return;
    }
    
    try {
      console.log('🧹 Clearing all test data...');
      
      // Clear localStorage
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.includes('mbms_application_') && !key.includes('mbms_application_counter')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.applicantEmail && (
                parsed.applicantEmail.includes('example.com') ||
                parsed.applicantEmail.includes('TEST_')
              )) {
                localStorage.removeItem(key);
                console.log('🗑️ Removed test draft:', key);
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      });
      
      // Clear applications array (keep structure)
      const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const realApps = applications.filter(app => {
        if (!app.applicantEmail) return false;
        return !(
          app.applicantEmail.includes('example.com') ||
          app.applicantEmail.includes('TEST_') ||
          app.appID && (app.appID.includes('TEST_') || app.appID.includes('Firebase Test'))
        );
      });
      
      localStorage.setItem('mbms_applications', JSON.stringify(realApps));
      
      // Reset counter to 0
      localStorage.setItem('mbms_application_counter', '0');
      
      // Clear Firebase test data
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          const snapshot = await db.collection('applicants').get();
          const deletePromises = [];
          
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.applicantEmail && (
              data.applicantEmail.includes('example.com') ||
              data.applicantEmail.includes('TEST_') ||
              data.appID && (data.appID.includes('TEST_') || data.appID.includes('Firebase Test'))
            )) {
              deletePromises.push(db.collection('applicants').doc(doc.id).delete());
            }
          });
          
          await Promise.all(deletePromises);
          console.log('✅ Cleared', deletePromises.length, 'test records from Firebase');
        } catch (error) {
          console.warn('Firebase cleanup error:', error);
        }
      }
      
      // Refresh dashboard
      if (typeof refreshApplications !== 'undefined') {
        await refreshApplications();
      }
      
      // Update metrics
      if (typeof updateMetrics !== 'undefined') {
        updateMetrics();
      }
      
      // Update budget
      if (typeof updateBudgetDisplay !== 'undefined') {
        updateBudgetDisplay();
      }
      
      alert('✅ All test data cleared!\n\nThe system is now ready for the first real application.\n\nBlank list view is displayed with 10 placeholder rows.\n\nOnce an applicant submits their application, it will appear automatically.');
      
      console.log('✅ System prepared - ready for first application');
    } catch (error) {
      console.error('Error clearing test data:', error);
      alert('Error clearing test data: ' + error.message);
    }
  };
  
  console.log('✅ Clear and Prepare System initialized');
})();

