/**
 * FIREBASE-FIRST DATABASE ACCESS LAYER
 * All components use this to access Firebase (with localStorage fallback)
 * Auto-converts everything to Firebase
 */

(function() {
  'use strict';
  
  // Wait for Firebase to initialize
  let firebaseReady = false;
  let checkFirebaseInterval = null;
  
  function waitForFirebase() {
    if (typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      firebaseReady = true;
      if (checkFirebaseInterval) clearInterval(checkFirebaseInterval);
      console.log('✅ Firebase ready - using Firebase database');
      initializeFirebaseFunctions();
    } else if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
      // Firebase SDK loaded but not initialized yet
      setTimeout(waitForFirebase, 100);
    } else {
      // Firebase not available, use localStorage
      console.log('📦 Firebase not available - using localStorage fallback');
      firebaseReady = false;
      if (checkFirebaseInterval) clearInterval(checkFirebaseInterval);
      initializeLocalStorageFunctions();
    }
  }
  
  // Start checking for Firebase
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkFirebaseInterval = setInterval(waitForFirebase, 100);
      waitForFirebase();
    });
  } else {
    checkFirebaseInterval = setInterval(waitForFirebase, 100);
    waitForFirebase();
  }
  
  // Database Keys (Centralized)
  const DB_KEYS = {
    USERS: 'mbms_users',
    APPLICATIONS: 'mbms_applications',
    BUDGET_TOTAL: 'mbms_budget_total',
    BUDGET_ALLOCATED: 'mbms_budget_allocated',
    APP_COUNTER: 'mbms_application_counter',
    LAST_SERIAL: 'mbms_last_serial',
    DUMMY_LOADED: 'mbms_dummy_data_loaded'
  };
  
  // ============================================
  // FIREBASE FUNCTIONS
  // ============================================
  function initializeFirebaseFunctions() {
    console.log('🔥 Initializing Firebase-first database functions...');
    
    // Use Firebase functions from firebase-db.js if available
    if (typeof window.getApplications === 'function') {
      // Override getApplications to use Firebase
      window.getApplications = window.getApplications; // Already Firebase-enabled
    }
    
    if (typeof window.saveApplication === 'function') {
      // Already Firebase-enabled
      window.saveApplication = window.saveApplication;
    }
    
    if (typeof window.updateApplicationStatus === 'function') {
      // Already Firebase-enabled
      window.updateApplicationStatus = window.updateApplicationStatus;
    }
    
    // Export all functions
    exportFirebaseFunctions();
  }
  
  // ============================================
  // LOCALSTORAGE FALLBACK FUNCTIONS
  // ============================================
  function initializeLocalStorageFunctions() {
    console.log('📦 Initializing localStorage fallback functions...');
    exportLocalStorageFunctions();
  }
  
  // ============================================
  // UNIFIED FUNCTIONS (Firebase or localStorage)
  // ============================================
  
  /**
   * Get all registered users
   */
  window.getUsers = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        // Use Firebase
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const snapshot = await db.collection('users').get();
          const users = [];
          snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
          });
          
          // Sync to localStorage
          localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
          console.log('✅ Loaded', users.length, 'users from Firebase');
          return users;
        }
      } catch (error) {
        console.error('Firebase users read error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const usersStr = localStorage.getItem(DB_KEYS.USERS);
      if (!usersStr) return [];
      const users = JSON.parse(usersStr);
      console.log('📦 Loaded', users.length, 'users from localStorage');
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };
  
  /**
   * Save user
   */
  window.saveUser = async function(user) {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        // Use Firebase
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const userRef = db.collection('users').doc(user.email || `user_${Date.now()}`);
          await userRef.set(user, { merge: true });
          console.log('✅ User saved to Firebase');
          
          // Sync to localStorage
          const users = await window.getUsers();
          const index = users.findIndex(u => u.email === user.email);
          if (index >= 0) {
            users[index] = user;
          } else {
            users.push(user);
          }
          localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
          return true;
        }
      } catch (error) {
        console.error('Firebase user save error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const users = await window.getUsers();
      const index = users.findIndex(u => u.email === user.email);
      if (index >= 0) {
        users[index] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      console.log('📦 User saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  };
  
  /**
   * Get all applications (uses Firebase if available)
   */
  window.getApplications = window.getApplications || async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      // Use Firebase function from firebase-db.js
      if (typeof window.getApplications === 'function') {
        return await window.getApplications();
      }
    }
    
    // Fallback to localStorage
    try {
      const appsStr = localStorage.getItem(DB_KEYS.APPLICATIONS);
      if (!appsStr) return [];
      const apps = JSON.parse(appsStr);
      return Array.isArray(apps) ? apps : [];
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  };
  
  /**
   * Save application (uses Firebase if available)
   */
  window.saveApplication = window.saveApplication || async function(application) {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      // Use Firebase function from firebase-db.js
      if (typeof window.saveApplication === 'function') {
        return await window.saveApplication(application);
      }
    }
    
    // Fallback to localStorage
    try {
      const apps = await window.getApplications();
      const index = apps.findIndex(a => a.appID === application.appID);
      if (index >= 0) {
        apps[index] = application;
      } else {
        apps.push(application);
      }
      localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
      console.log('📦 Application saved to localStorage');
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: DB_KEYS.APPLICATIONS, action: 'added', appID: application.appID }
      }));
      
      return application;
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  };
  
  /**
   * Update application (uses Firebase if available)
   */
  window.updateApplication = async function(appID, updates) {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      // Use Firebase function
      if (typeof window.updateApplicationStatus === 'function') {
        return await window.updateApplicationStatus(appID, updates);
      }
    }
    
    // Fallback to localStorage
    try {
      const apps = await window.getApplications();
      const index = apps.findIndex(a => a.appID === appID);
      if (index !== -1) {
        apps[index] = { ...apps[index], ...updates };
        localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
        console.log('📦 Application updated in localStorage');
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('mbms-data-updated', {
          detail: { key: DB_KEYS.APPLICATIONS, action: 'updated', appID: appID }
        }));
        
        return apps[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  };
  
  /**
   * Delete application (uses Firebase if available)
   */
  window.deleteApplication = async function(appID) {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        // Use Firebase
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const apps = await window.getApplications();
          const app = apps.find(a => a.appID === appID);
          
          if (app && app.id) {
            await db.collection('applicants').doc(app.id).delete();
            console.log('✅ Application deleted from Firebase');
            
            // Refund budget if awarded
            if (app.status === 'Awarded' && app.awardDetails) {
              const amount = app.awardDetails.committee_amount_kes || app.awardDetails.amount || 0;
              if (amount > 0) {
                const budget = await window.getBudget();
                const newAllocated = Math.max(0, budget.allocated - amount);
                await window.updateBudget(newAllocated);
                console.log('💰 Budget refunded:', amount);
              }
            }
            
            // Sync to localStorage
            await window.syncFirebaseToLocalStorage();
            
            // Trigger update event
            window.dispatchEvent(new CustomEvent('mbms-data-updated', {
              detail: { key: DB_KEYS.APPLICATIONS, action: 'deleted', appID: appID }
            }));
            
            return true;
          }
        }
      } catch (error) {
        console.error('Firebase delete error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const apps = await window.getApplications();
      const index = apps.findIndex(a => a.appID === appID);
      if (index !== -1) {
        const deletedApp = apps.splice(index, 1)[0];
        localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
        console.log('📦 Application deleted from localStorage');
        
        // Refund budget if awarded
        if (deletedApp.status === 'Awarded' && deletedApp.awardDetails) {
          const amount = deletedApp.awardDetails.committee_amount_kes || deletedApp.awardDetails.amount || 0;
          if (amount > 0) {
            const budget = await window.getBudget();
            const newAllocated = Math.max(0, budget.allocated - amount);
            await window.updateBudget(newAllocated);
            console.log('💰 Budget refunded:', amount);
          }
        }
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('mbms-data-updated', {
          detail: { key: DB_KEYS.APPLICATIONS, action: 'deleted', appID: appID }
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  };
  
  /**
   * Get budget data (uses Firebase if available)
   */
  window.getBudget = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      // Use Firebase function from firebase-db.js
      if (typeof window.getBudgetData === 'function') {
        const budget = await window.getBudgetData();
        return {
          total: budget.total || 50000000,
          allocated: budget.allocated || 0,
          balance: (budget.total || 50000000) - (budget.allocated || 0)
        };
      }
    }
    
    // Fallback to localStorage
    try {
      const total = parseFloat(localStorage.getItem(DB_KEYS.BUDGET_TOTAL) || '50000000');
      const allocated = parseFloat(localStorage.getItem(DB_KEYS.BUDGET_ALLOCATED) || '0');
      return { total, allocated, balance: total - allocated };
    } catch (error) {
      console.error('Error loading budget:', error);
      return { total: 50000000, allocated: 0, balance: 50000000 };
    }
  };
  
  /**
   * Update budget (uses Firebase if available)
   */
  window.updateBudget = async function(allocated) {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      // Use Firebase function from firebase-db.js
      if (typeof window.updateBudgetData === 'function') {
        const budget = await window.getBudget();
        await window.updateBudgetData(budget.total, allocated);
        console.log('✅ Budget updated in Firebase');
        return true;
      }
    }
    
    // Fallback to localStorage
    try {
      localStorage.setItem(DB_KEYS.BUDGET_ALLOCATED, allocated.toString());
      console.log('📦 Budget updated in localStorage');
      return true;
    } catch (error) {
      console.error('Error updating budget:', error);
      return false;
    }
  };
  
  /**
   * Get application counter (uses Firebase if available)
   */
  window.getApplicationCounter = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const doc = await db.collection('settings').doc('counters').get();
          if (doc.exists) {
            const data = doc.data();
            const counter = data.applicationCounter || 0;
            localStorage.setItem(DB_KEYS.APP_COUNTER, counter.toString());
            return counter;
          }
        }
      } catch (error) {
        console.error('Firebase counter read error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      return parseInt(localStorage.getItem(DB_KEYS.APP_COUNTER) || '0');
    } catch (error) {
      return 0;
    }
  };
  
  /**
   * Increment application counter (uses Firebase if available)
   */
  window.incrementApplicationCounter = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const counterRef = db.collection('settings').doc('counters');
          const counter = await window.getApplicationCounter();
          const newCounter = counter + 1;
          
          await counterRef.set({
            applicationCounter: newCounter,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          localStorage.setItem(DB_KEYS.APP_COUNTER, newCounter.toString());
          console.log('✅ Counter incremented in Firebase:', newCounter);
          return newCounter;
        }
      } catch (error) {
        console.error('Firebase counter increment error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const counter = await window.getApplicationCounter();
      const newCounter = counter + 1;
      localStorage.setItem(DB_KEYS.APP_COUNTER, newCounter.toString());
      console.log('📦 Counter incremented in localStorage:', newCounter);
      return newCounter;
    } catch (error) {
      return 0;
    }
  };
  
  /**
   * Get last serial number (uses Firebase if available)
   */
  window.getLastSerial = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const doc = await db.collection('settings').doc('counters').get();
          if (doc.exists) {
            const data = doc.data();
            const serial = data.lastSerial || 0;
            localStorage.setItem(DB_KEYS.LAST_SERIAL, serial.toString());
            return serial;
          }
        }
      } catch (error) {
        console.error('Firebase serial read error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      return parseInt(localStorage.getItem(DB_KEYS.LAST_SERIAL) || '0');
    } catch (error) {
      return 0;
    }
  };
  
  /**
   * Increment serial number (uses Firebase if available)
   */
  window.incrementSerial = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
          const db = firebase.firestore();
          const counterRef = db.collection('settings').doc('counters');
          const serial = await window.getLastSerial();
          const newSerial = serial + 1;
          
          await counterRef.set({
            lastSerial: newSerial,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          localStorage.setItem(DB_KEYS.LAST_SERIAL, newSerial.toString());
          console.log('✅ Serial incremented in Firebase:', newSerial);
          return newSerial;
        }
      } catch (error) {
        console.error('Firebase serial increment error:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const serial = await window.getLastSerial();
      const newSerial = serial + 1;
      localStorage.setItem(DB_KEYS.LAST_SERIAL, newSerial.toString());
      console.log('📦 Serial incremented in localStorage:', newSerial);
      return newSerial;
    } catch (error) {
      return 0;
    }
  };
  
  /**
   * Get draft application
   */
  window.getDraftApplication = function(email) {
    try {
      const draftKey = `mbms_application_${email}`;
      const draftStr = localStorage.getItem(draftKey);
      if (!draftStr) return null;
      return JSON.parse(draftStr);
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  };
  
  /**
   * Save draft application
   */
  window.saveDraftApplication = function(email, draftData) {
    try {
      const draftKey = `mbms_application_${email}`;
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      console.log('💾 Draft saved to', draftKey);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  };
  
  /**
   * Sync Firebase data to localStorage (backup)
   */
  window.syncFirebaseToLocalStorage = async function() {
    if (firebaseReady && typeof window.isFirebaseEnabled === 'function' && window.isFirebaseEnabled()) {
      try {
        const apps = await window.getApplications();
        localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
        console.log('✅ Synced Firebase data to localStorage');
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  };
  
  // Export DB_KEYS
  window.DB_KEYS = DB_KEYS;
  
  // Export functions
  function exportFirebaseFunctions() {
    console.log('✅ Firebase-first database functions exported');
  }
  
  function exportLocalStorageFunctions() {
    console.log('✅ LocalStorage fallback functions exported');
  }
  
  console.log('✅ Firebase-First Database Access Layer loaded');
})();

