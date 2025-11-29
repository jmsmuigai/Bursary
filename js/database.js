/**
 * UNIFIED DATABASE ACCESS LAYER
 * All components use this to access the same database
 * AUTO-CONVERTED TO FIREBASE - Uses Firebase if available, falls back to localStorage
 * This file now delegates to Firebase-first functions from database-firebase.js
 */

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

/**
 * Get all registered users (SAME DATABASE)
 */
function getUsers() {
  try {
    const usersStr = localStorage.getItem(DB_KEYS.USERS);
    if (!usersStr) return [];
    const users = JSON.parse(usersStr);
    console.log('📊 Database: Loaded', users.length, 'users from', DB_KEYS.USERS);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Save user (SAME DATABASE)
 */
function saveUser(user) {
  try {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    console.log('💾 Database: Saved user to', DB_KEYS.USERS);
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

/**
 * Get all applications (SAME DATABASE)
 */
function getApplications() {
  try {
    const appsStr = localStorage.getItem(DB_KEYS.APPLICATIONS);
    if (!appsStr) return [];
    const apps = JSON.parse(appsStr);
    console.log('📊 Database: Loaded', apps.length, 'applications from', DB_KEYS.APPLICATIONS);
    return Array.isArray(apps) ? apps : [];
  } catch (error) {
    console.error('Error loading applications:', error);
    return [];
  }
}

/**
 * Save application (SAME DATABASE)
 */
function saveApplication(application) {
  try {
    const apps = getApplications();
    apps.push(application);
    localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
    console.log('💾 Database: Saved application to', DB_KEYS.APPLICATIONS);
    
    // Trigger update event for real-time sync
    window.dispatchEvent(new CustomEvent('mbms-data-updated', {
      detail: { key: DB_KEYS.APPLICATIONS, action: 'added', appID: application.appID }
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving application:', error);
    return false;
  }
}

/**
 * Update application (SAME DATABASE)
 */
function updateApplication(appID, updates) {
  try {
    const apps = getApplications();
    const index = apps.findIndex(a => a.appID === appID);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...updates };
      localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
      console.log('💾 Database: Updated application', appID, 'in', DB_KEYS.APPLICATIONS);
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: DB_KEYS.APPLICATIONS, action: 'updated', appID: appID }
      }));
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating application:', error);
    return false;
  }
}

/**
 * Get draft application (SAME DATABASE)
 */
function getDraftApplication(email) {
  try {
    const draftKey = `mbms_application_${email}`;
    const draftStr = localStorage.getItem(draftKey);
    if (!draftStr) return null;
    return JSON.parse(draftStr);
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

/**
 * Save draft application (SAME DATABASE)
 */
function saveDraftApplication(email, draftData) {
  try {
    const draftKey = `mbms_application_${email}`;
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    console.log('💾 Database: Saved draft to', draftKey);
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
}

/**
 * Get budget data (SAME DATABASE)
 */
function getBudget() {
  try {
    const total = parseFloat(localStorage.getItem(DB_KEYS.BUDGET_TOTAL) || '50000000');
    const allocated = parseFloat(localStorage.getItem(DB_KEYS.BUDGET_ALLOCATED) || '0');
    return { total, allocated, balance: total - allocated };
  } catch (error) {
    console.error('Error loading budget:', error);
    return { total: 50000000, allocated: 0, balance: 50000000 };
  }
}

/**
 * Update budget (SAME DATABASE)
 */
function updateBudget(allocated) {
  try {
    localStorage.setItem(DB_KEYS.BUDGET_ALLOCATED, allocated.toString());
    console.log('💾 Database: Updated budget allocated to', allocated);
    return true;
  } catch (error) {
    console.error('Error updating budget:', error);
    return false;
  }
}

/**
 * Get application counter (SAME DATABASE)
 */
function getApplicationCounter() {
  try {
    return parseInt(localStorage.getItem(DB_KEYS.APP_COUNTER) || '0');
  } catch (error) {
    console.error('Error loading counter:', error);
    return 0;
  }
}

/**
 * Increment application counter (SAME DATABASE)
 */
function incrementApplicationCounter() {
  try {
    const counter = getApplicationCounter() + 1;
    localStorage.setItem(DB_KEYS.APP_COUNTER, counter.toString());
    console.log('💾 Database: Incremented counter to', counter);
    return counter;
  } catch (error) {
    console.error('Error incrementing counter:', error);
    return 0;
  }
}

/**
 * Get last serial number (SAME DATABASE)
 */
function getLastSerial() {
  try {
    return parseInt(localStorage.getItem(DB_KEYS.LAST_SERIAL) || '0');
  } catch (error) {
    console.error('Error loading serial:', error);
    return 0;
  }
}

/**
 * Increment serial number (SAME DATABASE)
 */
function incrementSerial() {
  try {
    const serial = getLastSerial() + 1;
    localStorage.setItem(DB_KEYS.LAST_SERIAL, serial.toString());
    console.log('💾 Database: Incremented serial to', serial);
    return serial;
  } catch (error) {
    console.error('Error incrementing serial:', error);
    return 0;
  }
}

/**
 * Delete application (SAME DATABASE)
 */
function deleteApplication(appID) {
  try {
    const apps = getApplications();
    const index = apps.findIndex(a => a.appID === appID);
    if (index !== -1) {
      const deletedApp = apps.splice(index, 1)[0];
      localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify(apps));
      console.log('🗑️ Database: Deleted application', appID, 'from', DB_KEYS.APPLICATIONS);
      
      // If application was awarded, refund budget
      if (deletedApp.status === 'Awarded' && deletedApp.awardDetails) {
        const amount = deletedApp.awardDetails.committee_amount_kes || deletedApp.awardDetails.amount || 0;
        if (amount > 0) {
          const budget = getBudget();
          const newAllocated = Math.max(0, budget.allocated - amount);
          updateBudget(newAllocated);
          console.log('💰 Budget refunded:', amount, 'New allocated:', newAllocated);
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
}

// Note: Functions are now exported by database-firebase.js which handles Firebase conversion
// This file maintains backward compatibility but delegates to Firebase-first layer

// Export DB_KEYS for backward compatibility
window.DB_KEYS = DB_KEYS;

// Functions will be overridden by database-firebase.js if Firebase is available
// Otherwise, use local implementations below as fallback

// Export functions globally (will be overridden by database-firebase.js if Firebase is available)
window.getUsers = getUsers;
window.saveUser = saveUser;
window.getApplications = getApplications;
window.saveApplication = saveApplication;
window.updateApplication = updateApplication;
window.deleteApplication = deleteApplication;
window.getDraftApplication = getDraftApplication;
window.saveDraftApplication = saveDraftApplication;
window.getBudget = getBudget;
window.updateBudget = updateBudget;
window.getApplicationCounter = getApplicationCounter;
window.incrementApplicationCounter = incrementApplicationCounter;
window.getLastSerial = getLastSerial;
window.incrementSerial = incrementSerial;

console.log('✅ Unified Database Access Layer loaded - Firebase conversion will override if available');

