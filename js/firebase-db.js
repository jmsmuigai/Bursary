// Firebase Database Layer for Real-Time Multi-Device Sync
// Falls back to localStorage if Firebase is not configured

(function() {
  'use strict';
  
  let firebaseInitialized = false;
  let db = null;
  let useFirebase = false;
  
  // Check if Firebase is available and configured
  function initFirebase() {
    try {
      // Check if Firebase SDK is loaded
      if (typeof firebase === 'undefined') {
        console.log('📦 Firebase SDK not loaded - using localStorage fallback');
        return false;
      }
      
      // Check if firebaseConfig exists and is configured
      if (typeof firebaseConfig === 'undefined' || 
          firebaseConfig.apiKey === 'YOUR_API_KEY' ||
          !firebaseConfig.apiKey) {
        console.log('📦 Firebase not configured - using localStorage fallback');
        return false;
      }
      
      // Initialize Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      db = firebase.firestore();
      firebaseInitialized = true;
      useFirebase = true;
      
      console.log('✅ Firebase initialized successfully - using real-time database');
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      console.log('📦 Falling back to localStorage');
      return false;
    }
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
  } else {
    initFirebase();
  }
  
  // Unified Database Access Layer
  // All data operations go through this layer for consistency
  
  /**
   * Get all applications from database (Firebase or localStorage)
   */
  window.getApplications = async function() {
    if (useFirebase && db) {
      try {
        const snapshot = await db.collection('applications').get();
        const apps = [];
        snapshot.forEach(doc => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ Loaded', apps.length, 'applications from Firebase');
        
        // Sync to localStorage as backup
        localStorage.setItem('mbms_applications', JSON.stringify(apps));
        
        return apps;
      } catch (error) {
        console.error('Firebase read error:', error);
        // Fallback to localStorage
        return getApplicationsFromLocalStorage();
      }
    } else {
      return getApplicationsFromLocalStorage();
    }
  };
  
  /**
   * Get applications from localStorage (fallback)
   */
  function getApplicationsFromLocalStorage() {
    try {
      const appsStr = localStorage.getItem('mbms_applications');
      if (!appsStr) return [];
      const apps = JSON.parse(appsStr);
      return Array.isArray(apps) ? apps : [];
    } catch (error) {
      console.error('localStorage read error:', error);
      return [];
    }
  }
  
  /**
   * Save application to database (Firebase or localStorage)
   */
  window.saveApplication = async function(application) {
    if (useFirebase && db) {
      try {
        if (application.id) {
          // Update existing
          await db.collection('applications').doc(application.id).set(application, { merge: true });
        } else {
          // Create new
          const docRef = await db.collection('applications').add(application);
          application.id = docRef.id;
        }
        
        console.log('✅ Application saved to Firebase');
        
        // Sync to localStorage as backup
        syncToLocalStorage();
        
        return application;
      } catch (error) {
        console.error('Firebase save error:', error);
        // Fallback to localStorage
        return saveApplicationToLocalStorage(application);
      }
    } else {
      return saveApplicationToLocalStorage(application);
    }
  };
  
  /**
   * Save application to localStorage (fallback)
   */
  function saveApplicationToLocalStorage(application) {
    try {
      const apps = getApplicationsFromLocalStorage();
      const index = apps.findIndex(a => a.appID === application.appID);
      
      if (index >= 0) {
        apps[index] = application;
      } else {
        apps.push(application);
      }
      
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      console.log('✅ Application saved to localStorage');
      return application;
    } catch (error) {
      console.error('localStorage save error:', error);
      throw error;
    }
  }
  
  /**
   * Update application status (for awarding/rejecting)
   */
  window.updateApplicationStatus = async function(appID, updates) {
    if (useFirebase && db) {
      try {
        const apps = await getApplications();
        const app = apps.find(a => a.appID === appID);
        
        if (!app) {
          throw new Error('Application not found');
        }
        
        const updatedApp = { ...app, ...updates };
        
        if (app.id) {
          await db.collection('applications').doc(app.id).update(updates);
        } else {
          await db.collection('applications').doc(app.id).set(updatedApp, { merge: true });
        }
        
        console.log('✅ Application status updated in Firebase');
        
        // Sync to localStorage
        syncToLocalStorage();
        
        return updatedApp;
      } catch (error) {
        console.error('Firebase update error:', error);
        // Fallback to localStorage
        return updateApplicationStatusInLocalStorage(appID, updates);
      }
    } else {
      return updateApplicationStatusInLocalStorage(appID, updates);
    }
  };
  
  /**
   * Update application status in localStorage (fallback)
   */
  function updateApplicationStatusInLocalStorage(appID, updates) {
    try {
      const apps = getApplicationsFromLocalStorage();
      const app = apps.find(a => a.appID === appID);
      
      if (!app) {
        throw new Error('Application not found');
      }
      
      Object.assign(app, updates);
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      console.log('✅ Application status updated in localStorage');
      
      return app;
    } catch (error) {
      console.error('localStorage update error:', error);
      throw error;
    }
  }
  
  /**
   * Sync Firebase data to localStorage (backup)
   */
  async function syncToLocalStorage() {
    if (useFirebase && db) {
      try {
        const apps = await getApplications();
        localStorage.setItem('mbms_applications', JSON.stringify(apps));
        console.log('✅ Synced Firebase data to localStorage');
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }
  
  /**
   * Listen for real-time updates from Firebase
   */
  window.listenForUpdates = function(callback) {
    if (useFirebase && db) {
      try {
        return db.collection('applications').onSnapshot((snapshot) => {
          const apps = [];
          snapshot.forEach(doc => {
            apps.push({ id: doc.id, ...doc.data() });
          });
          
          // Sync to localStorage
          localStorage.setItem('mbms_applications', JSON.stringify(apps));
          
          // Call callback
          if (typeof callback === 'function') {
            callback(apps);
          }
          
          console.log('🔄 Real-time update received:', apps.length, 'applications');
        }, (error) => {
          console.error('Firebase listener error:', error);
        });
      } catch (error) {
        console.error('Firebase listener setup error:', error);
      }
    } else {
      // Fallback: Use storage event for localStorage
      window.addEventListener('storage', (e) => {
        if (e.key === 'mbms_applications') {
          const apps = JSON.parse(e.newValue || '[]');
          if (typeof callback === 'function') {
            callback(apps);
          }
        }
      });
    }
  };
  
  /**
   * Get budget data
   */
  window.getBudgetData = async function() {
    if (useFirebase && db) {
      try {
        const doc = await db.collection('system').doc('budget').get();
        if (doc.exists) {
          const data = doc.data();
          // Sync to localStorage
          localStorage.setItem('mbms_budget_total', data.total.toString());
          localStorage.setItem('mbms_budget_allocated', data.allocated.toString());
          return data;
        }
      } catch (error) {
        console.error('Firebase budget read error:', error);
      }
    }
    
    // Fallback to localStorage
    return {
      total: parseInt(localStorage.getItem('mbms_budget_total') || '50000000'),
      allocated: parseInt(localStorage.getItem('mbms_budget_allocated') || '0')
    };
  };
  
  /**
   * Update budget data
   */
  window.updateBudgetData = async function(total, allocated) {
    if (useFirebase && db) {
      try {
        await db.collection('system').doc('budget').set({
          total: total,
          allocated: allocated,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Budget updated in Firebase');
      } catch (error) {
        console.error('Firebase budget update error:', error);
      }
    }
    
    // Always update localStorage
    localStorage.setItem('mbms_budget_total', total.toString());
    localStorage.setItem('mbms_budget_allocated', allocated.toString());
  };
  
  // Export initialization status
  window.isFirebaseEnabled = function() {
    return useFirebase;
  };
  
  console.log('📦 Database layer initialized (Firebase: ' + (useFirebase ? 'enabled' : 'localStorage fallback') + ')');
})();

