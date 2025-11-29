// FIREBASE AUTO-ACTIVATION
// Automatically activates Firebase and ensures all database operations use Firebase

(function() {
  'use strict';
  
  console.log('🔥 Firebase Auto-Activation - Initializing...');
  
  let activationAttempts = 0;
  const maxAttempts = 50; // Try for 5 seconds (50 * 100ms)
  
  function activateFirebase() {
    activationAttempts++;
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
      if (activationAttempts < maxAttempts) {
        setTimeout(activateFirebase, 100);
        return;
      } else {
        console.log('📦 Firebase not available - using localStorage fallback');
        return;
      }
    }
    
    // Check if Firebase is initialized
    if (typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      console.log('✅ Firebase is already active!');
      verifyFirebaseOperations();
      return;
    }
    
    // Try to initialize Firebase
    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized');
      }
      
      const db = firebase.firestore();
      console.log('✅ Firebase Firestore connected');
      
      // Verify connection with a test read
      db.collection('applicants').limit(1).get().then(() => {
        console.log('✅ Firebase connection verified');
        verifyFirebaseOperations();
      }).catch(error => {
        console.warn('⚠️ Firebase connection test failed:', error);
        console.log('📦 Falling back to localStorage');
      });
      
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      console.log('📦 Falling back to localStorage');
    }
  }
  
  function verifyFirebaseOperations() {
    console.log('🔍 Verifying Firebase operations...');
    
    const operations = [
      { name: 'getApplications', func: window.getApplications },
      { name: 'saveApplication', func: window.saveApplication },
      { name: 'updateApplication', func: window.updateApplication },
      { name: 'deleteApplication', func: window.deleteApplication },
      { name: 'getUsers', func: window.getUsers },
      { name: 'saveUser', func: window.saveUser },
      { name: 'getBudget', func: window.getBudget },
      { name: 'updateBudget', func: window.updateBudget },
      { name: 'getApplicationCounter', func: window.getApplicationCounter },
      { name: 'incrementApplicationCounter', func: window.incrementApplicationCounter },
      { name: 'getLastSerial', func: window.getLastSerial },
      { name: 'incrementSerial', func: window.incrementSerial }
    ];
    
    let allWorking = true;
    operations.forEach(op => {
      if (typeof op.func === 'function') {
        console.log(`✅ ${op.name} is available`);
      } else {
        console.warn(`⚠️ ${op.name} is not available`);
        allWorking = false;
      }
    });
    
    if (allWorking) {
      console.log('🎉 All Firebase operations are ready!');
      
      // Show success notification
      if (window.location.pathname.includes('admin_dashboard')) {
        setTimeout(() => {
          const badge = document.getElementById('firebaseStatusBadge');
          if (badge) {
            badge.className = 'badge bg-success';
            badge.innerHTML = '<i class="bi bi-database-check"></i> Firebase Active';
            badge.title = 'Firebase is connected - Real-time sync enabled';
          }
        }, 500);
      }
    } else {
      console.warn('⚠️ Some Firebase operations are missing');
    }
  }
  
  // Start activation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(activateFirebase, 500);
    });
  } else {
    setTimeout(activateFirebase, 500);
  }
  
  console.log('✅ Firebase Auto-Activation loaded');
})();

