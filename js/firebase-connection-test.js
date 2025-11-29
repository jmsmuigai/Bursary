// Firebase Connection Test - Verify Firebase is working correctly
// This file can be included in admin_dashboard.html to test Firebase connectivity

(function() {
  'use strict';
  
  /**
   * Test Firebase Connection
   * This function tests if Firebase is properly configured and working
   */
  window.testFirebaseConnection = async function() {
    console.log('🔍 Testing Firebase Connection...');
    
    const results = {
      sdkLoaded: false,
      configLoaded: false,
      initialized: false,
      connectionTest: false,
      readTest: false,
      writeTest: false,
      error: null
    };
    
    try {
      // Test 1: Check if Firebase SDK is loaded
      if (typeof firebase !== 'undefined') {
        results.sdkLoaded = true;
        console.log('✅ Firebase SDK is loaded');
      } else {
        results.error = 'Firebase SDK not loaded';
        console.error('❌ Firebase SDK not loaded');
        return results;
      }
      
      // Test 2: Check if Firebase config exists
      if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey) {
        results.configLoaded = true;
        console.log('✅ Firebase config is loaded');
        console.log('   Project ID:', firebaseConfig.projectId);
      } else {
        results.error = 'Firebase config not found';
        console.error('❌ Firebase config not found');
        return results;
      }
      
      // Test 3: Check if Firebase is initialized
      if (typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
        results.initialized = true;
        console.log('✅ Firebase is initialized');
      } else {
        results.error = 'Firebase not initialized - using localStorage fallback';
        console.warn('⚠️ Firebase not initialized - using localStorage fallback');
        return results;
      }
      
      // Test 4: Test database connection (read)
      if (typeof window.getApplications === 'function') {
        try {
          const apps = await window.getApplications();
          results.readTest = true;
          console.log('✅ Firebase read test successful -', apps.length, 'applications found');
        } catch (error) {
          results.error = 'Firebase read test failed: ' + error.message;
          console.error('❌ Firebase read test failed:', error);
        }
      }
      
      // Test 5: Test database connection (write)
      if (typeof window.saveApplication === 'function') {
        try {
          const testApp = {
            appID: 'FIREBASE_TEST_' + Date.now(),
            applicantName: 'Firebase Connection Test',
            applicantEmail: 'test@firebase.test',
            status: 'Test',
            dateSubmitted: new Date().toISOString(),
            isTest: true,
            testMarker: true
          };
          
          await window.saveApplication(testApp);
          results.writeTest = true;
          console.log('✅ Firebase write test successful');
          
          // Clean up test data immediately
          setTimeout(async () => {
            try {
              if (typeof window.deleteApplication === 'function') {
                // Try to delete by appID
                const apps = await window.getApplications();
                const testAppFound = apps.find(a => a.appID === testApp.appID);
                if (testAppFound && testAppFound.id) {
                  // Delete from Firebase
                  if (typeof firebase !== 'undefined' && firebase.firestore) {
                    const db = firebase.firestore();
                    await db.collection('applicants').doc(testAppFound.id).delete();
                    console.log('✅ Test data cleaned up from Firebase');
                  }
                }
                // Also try deleteApplication function
                await window.deleteApplication(testApp.appID);
                console.log('✅ Test data cleaned up');
              }
            } catch (e) {
              console.warn('Could not clean up test data:', e);
            }
          }, 2000);
        } catch (error) {
          results.error = 'Firebase write test failed: ' + error.message;
          console.error('❌ Firebase write test failed:', error);
        }
      }
      
      // Test 7: Test budget operations
      if (typeof window.getBudget === 'function' && typeof window.updateBudget === 'function') {
        try {
          const budget = await window.getBudget();
          console.log('✅ Budget read test successful:', budget);
          
          // Test budget update
          const testAllocated = budget.allocated;
          await window.updateBudget(testAllocated);
          console.log('✅ Budget update test successful');
        } catch (error) {
          console.warn('⚠️ Budget test:', error.message);
        }
      }
      
      // Test 8: Test user operations
      if (typeof window.getUsers === 'function' && typeof window.saveUser === 'function') {
        try {
          const users = await window.getUsers();
          console.log('✅ Users read test successful:', users.length, 'users');
        } catch (error) {
          console.warn('⚠️ Users test:', error.message);
        }
      }
      
      // Test 9: Test counters
      if (typeof window.getApplicationCounter === 'function' && typeof window.incrementApplicationCounter === 'function') {
        try {
          const counter = await window.getApplicationCounter();
          console.log('✅ Counter read test successful:', counter);
        } catch (error) {
          console.warn('⚠️ Counter test:', error.message);
        }
      }
      
      // Test 6: Test real-time listener
      if (typeof window.listenForUpdates === 'function') {
        try {
          const unsubscribe = window.listenForUpdates((apps) => {
            results.connectionTest = true;
            console.log('✅ Firebase real-time listener working -', apps.length, 'applications');
            if (unsubscribe) unsubscribe();
          });
          
          // Auto-unsubscribe after 2 seconds
          setTimeout(() => {
            if (unsubscribe && typeof unsubscribe === 'function') {
              unsubscribe();
            }
          }, 2000);
        } catch (error) {
          console.warn('⚠️ Real-time listener test:', error.message);
        }
      }
      
      // Summary
      const allTestsPassed = results.sdkLoaded && results.configLoaded && results.initialized && results.readTest;
      
      if (allTestsPassed) {
        console.log('🎉 ALL FIREBASE TESTS PASSED!');
        console.log('✅ Firebase is fully operational');
      } else {
        console.warn('⚠️ Some Firebase tests failed - check results above');
      }
      
      return results;
      
    } catch (error) {
      results.error = error.message;
      console.error('❌ Firebase test error:', error);
      return results;
    }
  };
  
  /**
   * Display Firebase Status in UI
   */
  window.showFirebaseStatus = async function() {
    const results = await window.testFirebaseConnection();
    
    const statusModal = document.createElement('div');
    statusModal.className = 'modal fade';
    statusModal.id = 'firebaseStatusModal';
    statusModal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header ${results.initialized && results.readTest ? 'bg-success text-white' : 'bg-warning text-dark'}">
            <h5 class="modal-title">
              <i class="bi bi-database me-2"></i>Firebase Connection Status
            </h5>
            <button type="button" class="btn-close ${results.initialized && results.readTest ? 'btn-close-white' : ''}" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Connection Tests</h6>
                <ul class="list-group mb-3">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Firebase SDK Loaded
                    <span class="badge ${results.sdkLoaded ? 'bg-success' : 'bg-danger'}">${results.sdkLoaded ? '✅ Yes' : '❌ No'}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Config Loaded
                    <span class="badge ${results.configLoaded ? 'bg-success' : 'bg-danger'}">${results.configLoaded ? '✅ Yes' : '❌ No'}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Initialized
                    <span class="badge ${results.initialized ? 'bg-success' : 'bg-warning'}">${results.initialized ? '✅ Yes' : '⚠️ No (using localStorage)'}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Read Test
                    <span class="badge ${results.readTest ? 'bg-success' : 'bg-danger'}">${results.readTest ? '✅ Passed' : '❌ Failed'}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Write Test
                    <span class="badge ${results.writeTest ? 'bg-success' : 'bg-warning'}">${results.writeTest ? '✅ Passed' : '⚠️ Not tested'}</span>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6>Configuration</h6>
                <div class="card">
                  <div class="card-body">
                    ${results.configLoaded ? `
                      <p><strong>Project ID:</strong> ${firebaseConfig.projectId}</p>
                      <p><strong>Auth Domain:</strong> ${firebaseConfig.authDomain}</p>
                      <p><strong>API Key:</strong> ${firebaseConfig.apiKey.substring(0, 20)}...</p>
                    ` : '<p class="text-danger">Config not loaded</p>'}
                  </div>
                </div>
              </div>
            </div>
            
            ${results.error ? `
              <div class="alert alert-danger mt-3">
                <strong>Error:</strong> ${results.error}
              </div>
            ` : ''}
            
            ${results.initialized && results.readTest ? `
              <div class="alert alert-success mt-3">
                <strong>✅ Firebase is working correctly!</strong><br>
                Your system is using Firebase for real-time multi-device synchronization.
              </div>
            ` : `
              <div class="alert alert-warning mt-3">
                <strong>⚠️ Firebase not active</strong><br>
                System is using localStorage fallback. This is fine for single-device use, but multi-device sync will not work.
              </div>
            `}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="testFirebaseConnection(); showFirebaseStatus();">Re-test</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(statusModal);
    const bsModal = new bootstrap.Modal(statusModal);
    bsModal.show();
    
    statusModal.addEventListener('hidden.bs.modal', () => {
      statusModal.remove();
    });
  };
  
  /**
   * Update Firebase status indicator in sidebar
   */
  function updateFirebaseStatusIndicator() {
    const badge = document.getElementById('firebaseStatusBadge');
    if (!badge) return;
    
    if (typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      badge.className = 'badge bg-success';
      badge.innerHTML = '<i class="bi bi-database-check"></i> Firebase Active';
      badge.title = 'Firebase is connected and working - Real-time sync enabled';
    } else {
      badge.className = 'badge bg-warning text-dark';
      badge.innerHTML = '<i class="bi bi-database-x"></i> localStorage';
      badge.title = 'Using localStorage - Multi-device sync not available';
    }
  }
  
  // Auto-test on load and update indicator
  function autoTestFirebase() {
    if (window.location.pathname.includes('admin_dashboard')) {
      setTimeout(() => {
        console.log('🔍 Auto-testing Firebase connection...');
        window.testFirebaseConnection().then(results => {
          updateFirebaseStatusIndicator();
          if (results.initialized && results.readTest) {
            console.log('✅ Firebase is working - system ready!');
            console.log('📊 Real-time multi-device sync is enabled');
          } else {
            console.warn('⚠️ Firebase not active - using localStorage fallback');
            console.log('📦 System will work with localStorage (single device)');
          }
        });
      }, 2000);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoTestFirebase);
  } else {
    autoTestFirebase();
  }
  
  // Update indicator immediately if Firebase status is already known
  setTimeout(updateFirebaseStatusIndicator, 1000);
  
  console.log('📦 Firebase connection test module loaded');
})();

