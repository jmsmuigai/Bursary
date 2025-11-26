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
      if (typeof firebaseConfig === 'undefined') {
        console.log('📦 Firebase config not found - using localStorage fallback');
        return false;
      }
      
      // Validate config has real values (not template values)
      if (!firebaseConfig.apiKey || 
          firebaseConfig.apiKey === 'YOUR_API_KEY' ||
          !firebaseConfig.projectId ||
          firebaseConfig.projectId === 'YOUR_PROJECT_ID') {
        console.log('📦 Firebase not properly configured - using localStorage fallback');
        console.log('📦 Config:', firebaseConfig);
        return false;
      }
      
      // Initialize Firebase
      try {
        if (!firebase.apps || firebase.apps.length === 0) {
          firebase.initializeApp(firebaseConfig);
        }
        
        db = firebase.firestore();
        firebaseInitialized = true;
        useFirebase = true;
        
        console.log('✅ Firebase initialized successfully - using real-time database');
        console.log('✅ Project:', firebaseConfig.projectId);
        return true;
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
      }
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
        console.log('📦 Loading applications from Firebase...');
        // Try 'applicants' collection first (recommended), fallback to 'applications' for backward compatibility
        let snapshot;
        try {
          snapshot = await db.collection('applicants').get();
        } catch (e) {
          // Fallback to old collection name
          snapshot = await db.collection('applications').get();
        }
        const apps = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          apps.push({ 
            id: doc.id, 
            ...data,
            // Ensure appID exists
            appID: data.appID || doc.id
          });
        });
        console.log('✅ Loaded', apps.length, 'applications from Firebase');
        
        // Sync to localStorage as backup
        if (apps.length > 0) {
          localStorage.setItem('mbms_applications', JSON.stringify(apps));
        }
        
        return apps;
      } catch (error) {
        console.error('❌ Firebase read error:', error);
        console.log('📦 Falling back to localStorage...');
        // Fallback to localStorage
        return getApplicationsFromLocalStorage();
      }
    } else {
      console.log('📦 Using localStorage (Firebase not enabled)');
      return getApplicationsFromLocalStorage();
    }
  };
  
  /**
   * Get applications from localStorage (fallback) - ENHANCED: Filters out all test/dummy data
   */
  function getApplicationsFromLocalStorage() {
    try {
      const appsStr = localStorage.getItem('mbms_applications');
      if (!appsStr) return [];
      const apps = JSON.parse(appsStr);
      if (!Array.isArray(apps)) return [];
      
      // CRITICAL: Filter out ALL test/dummy data
      const realApps = apps.filter(app => {
        if (!app || !app.applicantEmail) return false;
        
        // Comprehensive test data detection
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
            app.applicantName.includes('Test User')
          ) ||
          app.status === 'Deleted' ||
          app.status === 'Test';
        
        return !isTest;
      });
      
      // Auto-save cleaned data if test data was found
      if (realApps.length !== apps.length) {
        console.log('🧹 Auto-clearing', apps.length - realApps.length, 'test/dummy records from localStorage');
        localStorage.setItem('mbms_applications', JSON.stringify(realApps));
      }
      
      return realApps;
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
        console.log('📦 Saving application to Firebase...', application.appID);
        
        // Use 'applicants' collection (recommended structure)
        const collectionName = 'applicants';
        
        if (application.id) {
          // Update existing
          await db.collection(collectionName).doc(application.id).set(application, { merge: true });
          console.log('✅ Application updated in Firebase:', application.id);
        } else {
          // Create new - use appID as document ID for easier lookup
          const docId = application.appID || `app_${Date.now()}`;
          await db.collection(collectionName).doc(docId).set(application);
          application.id = docId;
          console.log('✅ Application created in Firebase:', docId);
        }
        
        // Sync to localStorage as backup
        await syncToLocalStorage();
        
        return application;
      } catch (error) {
        console.error('❌ Firebase save error:', error);
        console.log('📦 Falling back to localStorage...');
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
        console.log('📦 Updating application in Firebase:', appID);
        
        // Try to find by appID first
        const apps = await getApplications();
        const app = apps.find(a => a.appID === appID);
        
        if (!app) {
          console.warn('⚠️ Application not found by appID, trying direct update...');
          // Try to update directly using appID as document ID
          const docRef = db.collection('applicants').doc(appID);
          const doc = await docRef.get();
          
          if (doc.exists) {
            await docRef.update(updates);
            console.log('✅ Application updated in Firebase (direct)');
            await syncToLocalStorage();
            return { ...doc.data(), ...updates };
          } else {
            throw new Error('Application not found in Firebase');
          }
        }
        
        const updatedApp = { ...app, ...updates };
        
        // Use app.id if available, otherwise use appID as document ID
        const docId = app.id || appID;
        await db.collection('applicants').doc(docId).update(updates);
        
        console.log('✅ Application status updated in Firebase:', docId);
        
        // Sync to localStorage
        await syncToLocalStorage();
        
        return updatedApp;
      } catch (error) {
        console.error('❌ Firebase update error:', error);
        console.log('📦 Falling back to localStorage...');
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
        console.log('📡 Setting up Firebase real-time listener...');
        return db.collection('applicants').onSnapshot((snapshot) => {
          const apps = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          
          // Filter out test data before adding
          const isTest = 
            data.applicantEmail && (
              data.applicantEmail.includes('example.com') ||
              data.applicantEmail.includes('TEST_') ||
              data.applicantEmail.includes('test@')
            ) ||
            data.appID && (
              data.appID.includes('TEST_') || 
              data.appID.includes('DUMMY') ||
              data.appID.includes('Firebase Test')
            ) ||
            data.applicantName && (
              data.applicantName.includes('DUMMY') ||
              data.applicantName.includes('Test User')
            ) ||
            data.status === 'Deleted' ||
            data.status === 'Test';
          
          if (!isTest) {
            apps.push({ 
              id: doc.id, 
              ...data,
              appID: data.appID || doc.id
            });
          }
        });
        
        // Sync to localStorage (only real apps)
        localStorage.setItem('mbms_applications', JSON.stringify(apps));
          
          // Call callback
          if (typeof callback === 'function') {
            callback(apps);
          }
          
          console.log('🔄 Real-time update received:', apps.length, 'applications');
        }, (error) => {
          console.error('❌ Firebase listener error:', error);
        });
      } catch (error) {
        console.error('❌ Firebase listener setup error:', error);
      }
    } else {
      console.log('📦 Using localStorage storage events (Firebase not enabled)');
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
        // Try 'settings' collection first (recommended), fallback to 'system' for backward compatibility
        let doc;
        try {
          doc = await db.collection('settings').doc('budget').get();
        } catch (e) {
          doc = await db.collection('system').doc('budget').get();
        }
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
        // Use 'settings' collection (recommended structure)
        await db.collection('settings').doc('budget').set({
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

