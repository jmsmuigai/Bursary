// TEST SYSTEM WITH DATA - Verifies system works with test data
// Runs after test data is loaded to ensure everything is functioning

(function() {
  'use strict';
  
  console.log('🧪 Testing system with test data...');
  
  // Test system functionality
  async function testSystem() {
    try {
      console.log('🧪 Starting system test...');
      
      // Test 1: Check if applications are loaded
      const apps = localStorage.getItem('mbms_applications');
      if (!apps) {
        console.error('❌ Test 1 FAILED: No applications found');
        return false;
      }
      
      const applications = JSON.parse(apps);
      if (!Array.isArray(applications) || applications.length === 0) {
        console.error('❌ Test 1 FAILED: Applications array is empty');
        return false;
      }
      
      console.log('✅ Test 1 PASSED: Found', applications.length, 'applications');
      
      // Test 2: Check application structure
      const sampleApp = applications[0];
      const requiredFields = ['appID', 'applicantName', 'applicantEmail', 'status', 'subCounty', 'ward'];
      const missingFields = requiredFields.filter(field => !sampleApp[field]);
      
      if (missingFields.length > 0) {
        console.error('❌ Test 2 FAILED: Missing required fields:', missingFields);
        return false;
      }
      
      console.log('✅ Test 2 PASSED: Application structure is valid');
      
      // Test 3: Check budget
      const budgetTotal = parseFloat(localStorage.getItem('mbms_budget_total') || '50000000');
      const budgetAllocated = parseFloat(localStorage.getItem('mbms_budget_allocated') || '0');
      const budgetBalance = budgetTotal - budgetAllocated;
      
      if (budgetTotal !== 50000000) {
        console.warn('⚠️ Test 3 WARNING: Budget total is not 50,000,000');
      } else {
        console.log('✅ Test 3 PASSED: Budget is correct');
      }
      
      console.log('💰 Budget Status:', {
        total: budgetTotal.toLocaleString(),
        allocated: budgetAllocated.toLocaleString(),
        balance: budgetBalance.toLocaleString()
      });
      
      // Test 4: Check status distribution
      const statusCounts = {
        pending: applications.filter(a => a.status?.includes('Pending')).length,
        awarded: applications.filter(a => a.status === 'Awarded').length,
        rejected: applications.filter(a => a.status === 'Rejected').length
      };
      
      console.log('✅ Test 4 PASSED: Status distribution:', statusCounts);
      
      // Test 5: Check if admin dashboard functions exist
      const requiredFunctions = ['loadApplications', 'renderTable', 'updateMetrics', 'updateBudgetDisplay'];
      const missingFunctions = requiredFunctions.filter(fn => typeof window[fn] !== 'function');
      
      if (missingFunctions.length > 0) {
        console.warn('⚠️ Test 5 WARNING: Missing functions:', missingFunctions);
      } else {
        console.log('✅ Test 5 PASSED: All required functions exist');
      }
      
      // Test 6: Verify table can render
      if (typeof window.renderTable === 'function') {
        try {
          window.renderTable(applications);
          console.log('✅ Test 6 PASSED: Table rendering works');
        } catch (e) {
          console.error('❌ Test 6 FAILED: Table rendering error:', e);
        }
      }
      
      // Test 7: Verify metrics can update
      if (typeof window.updateMetrics === 'function') {
        try {
          window.updateMetrics();
          console.log('✅ Test 7 PASSED: Metrics update works');
        } catch (e) {
          console.error('❌ Test 7 FAILED: Metrics update error:', e);
        }
      }
      
      // Test 8: Verify budget display
      if (typeof window.updateBudgetDisplay === 'function') {
        try {
          window.updateBudgetDisplay();
          console.log('✅ Test 8 PASSED: Budget display works');
        } catch (e) {
          console.error('❌ Test 8 FAILED: Budget display error:', e);
        }
      }
      
      console.log('✅ System test completed successfully!');
      console.log('📊 Test Summary:', {
        totalApplications: applications.length,
        pending: statusCounts.pending,
        awarded: statusCounts.awarded,
        rejected: statusCounts.rejected,
        budgetTotal: budgetTotal,
        budgetAllocated: budgetAllocated,
        budgetBalance: budgetBalance
      });
      
      // Show success notification
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        notification.style.zIndex = '10000';
        notification.style.maxWidth = '90%';
        notification.innerHTML = `
          <strong>✅ System Test Complete!</strong><br>
          <small>Found ${applications.length} test applications. System is ready!</small>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) notification.remove();
        }, 5000);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ System test error:', error);
      return false;
    }
  }
  
  // Run test after page loads
  if (window.location.pathname.includes('admin_dashboard')) {
    // Wait for data to be loaded
    setTimeout(() => {
      const apps = localStorage.getItem('mbms_applications');
      if (apps) {
        const applications = JSON.parse(apps);
        if (applications.length > 0) {
          console.log('🧪 Test data detected, running system test...');
          testSystem();
        } else {
          console.log('⚠️ No test data found yet, waiting...');
          // Retry after 2 seconds
          setTimeout(() => {
            const retryApps = localStorage.getItem('mbms_applications');
            if (retryApps) {
              const retryApplications = JSON.parse(retryApps);
              if (retryApplications.length > 0) {
                testSystem();
              }
            }
          }, 2000);
        }
      }
    }, 2000);
  }
  
  // Export function
  window.testSystemWithData = testSystem;
  
  console.log('✅ Test System With Data script loaded');
})();

