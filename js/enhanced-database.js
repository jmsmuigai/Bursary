// ENHANCED UNIFIED DATABASE LAYER
// Comprehensive database access with test data filtering
// This enhances the base database.js functions with test data filtering

(function() {
  'use strict';
  
  console.log('💾 Loading Enhanced Unified Database Layer');
  
  // Store original functions if they exist
  const originalSaveUser = window.saveUser;
  const originalSaveApplication = window.saveApplication;
  const originalGetApplications = window.getApplications;
  const originalGetUsers = window.getUsers;
  
  // ENHANCED DATABASE FUNCTIONS
  window.saveUser = function(userData) {
    try {
      console.log('💾 Saving user to unified database:', userData.email);
      
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      
      // Check for duplicates
      const duplicate = users.find(u => 
        u.email === userData.email || 
        u.nemisId === userData.nemisId ||
        u.idNumber === userData.idNumber
      );
      
      if (duplicate) {
        console.error('❌ Duplicate user detected:', userData.email);
        return false;
      }
      
      users.push(userData);
      localStorage.setItem('mbms_users', JSON.stringify(users));
      
      // Also call original function if it exists (for compatibility)
      if (originalSaveUser && originalSaveUser !== window.saveUser) {
        try {
          originalSaveUser(userData);
        } catch (e) {
          // Ignore if original doesn't work
        }
      }
      
      // Trigger event for admin dashboard
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { 
          key: 'mbms_users', 
          action: 'registered', 
          email: userData.email,
          user: userData
        }
      }));
      
      // Force storage event
      try {
        const storageEvent = new Event('storage');
        Object.defineProperty(storageEvent, 'key', { value: 'mbms_users' });
        Object.defineProperty(storageEvent, 'newValue', { value: JSON.stringify(users) });
        window.dispatchEvent(storageEvent);
      } catch (e) {
        // Fallback: just update localStorage
        localStorage.setItem('mbms_users', JSON.stringify(users));
      }
      
      console.log('✅ User saved successfully:', userData.email);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving user:', error);
      return false;
    }
  };

  window.saveApplication = function(applicationData) {
    try {
      console.log('💾 Saving application to unified database:', applicationData.appID);
      
      const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      
      // Check for duplicates
      const duplicate = applications.find(a => a.appID === applicationData.appID);
      if (duplicate) {
        // Update existing
        const index = applications.indexOf(duplicate);
        applications[index] = applicationData;
        console.log('📝 Updating existing application:', applicationData.appID);
      } else {
        // Add new
        applications.push(applicationData);
        console.log('➕ Adding new application:', applicationData.appID);
      }
      
      localStorage.setItem('mbms_applications', JSON.stringify(applications));
      
      // Also call original function if it exists (for compatibility)
      if (originalSaveApplication && originalSaveApplication !== window.saveApplication) {
        try {
          originalSaveApplication(applicationData);
        } catch (e) {
          // Ignore if original doesn't work
        }
      }
      
      // Update counter
      const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0');
      if (!duplicate) {
        localStorage.setItem('mbms_application_counter', (counter + 1).toString());
      }
      
      // Trigger multiple events for reliable updates
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { 
          key: 'mbms_applications', 
          action: 'submitted', 
          appID: applicationData.appID,
          application: applicationData
        }
      }));
      
      // Additional event for compatibility
      window.dispatchEvent(new CustomEvent('mbms-application-submitted', {
        detail: applicationData
      }));
      
      // Force storage event for cross-tab sync
      try {
        const storageEvent = new Event('storage');
        Object.defineProperty(storageEvent, 'key', { value: 'mbms_applications' });
        Object.defineProperty(storageEvent, 'newValue', { value: JSON.stringify(applications) });
        window.dispatchEvent(storageEvent);
      } catch (e) {
        // Fallback: just update localStorage
        localStorage.setItem('mbms_applications', JSON.stringify(applications));
      }
      
      // Update timestamp
      localStorage.setItem('mbms-last-update', Date.now().toString());
      
      console.log('✅ Application saved successfully:', applicationData.appID);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving application:', error);
      return false;
    }
  };

  window.getApplications = function() {
    try {
      // Try to get from original function first, then filter
      let applications = [];
      if (originalGetApplications && originalGetApplications !== window.getApplications) {
        try {
          applications = originalGetApplications();
        } catch (e) {
          // Fallback to direct access
          applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        }
      } else {
        applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      }
      
      // Filter out any test data
      const realApplications = applications.filter(app => {
        if (!app || !app.applicantEmail) return false;
        
        const email = app.applicantEmail || app.email || '';
        const name = app.applicantName || app.name || '';
        const appID = app.appID || '';
        
        const isTest = 
          email.includes('example.com') ||
          email.includes('TEST_') ||
          email.includes('test@') ||
          email.includes('dummy') ||
          email.includes('demo') ||
          appID.includes('TEST_') ||
          appID.includes('DUMMY') ||
          appID.includes('Firebase Test') ||
          appID.includes('Demo') ||
          name.includes('DUMMY') ||
          name.includes('Test User') ||
          name.includes('Demo User') ||
          name.includes('Example') ||
          app.status === 'Deleted' ||
          app.status === 'Test' ||
          app.status === 'Demo';
        
        return !isTest;
      });
      
      // Auto-save cleaned data if test data was found
      if (realApplications.length !== applications.length) {
        localStorage.setItem('mbms_applications', JSON.stringify(realApplications));
        console.log('🧹 Auto-cleaned', applications.length - realApplications.length, 'test applications');
      }
      
      console.log('📊 Retrieved applications:', realApplications.length, 'real applications');
      return realApplications;
      
    } catch (error) {
      console.error('❌ Error getting applications:', error);
      return [];
    }
  };

  window.getUsers = function() {
    try {
      // Try to get from original function first, then filter
      let users = [];
      if (originalGetUsers && originalGetUsers !== window.getUsers) {
        try {
          users = originalGetUsers();
        } catch (e) {
          // Fallback to direct access
          users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
        }
      } else {
        users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      }
      
      // Filter out test users (keep admin)
      const realUsers = users.filter(user => {
        if (user.role === 'admin') return true;
        if (!user || !user.email) return false;
        
        const email = user.email || '';
        const name = (user.firstName || '') + ' ' + (user.lastName || '');
        
        const isTest = 
          email.includes('example.com') ||
          email.includes('TEST_') ||
          email.includes('test@') ||
          email.includes('dummy') ||
          email.includes('demo') ||
          name.includes('DUMMY') ||
          name.includes('Test User') ||
          name.includes('Demo User');
        
        return !isTest;
      });
      
      // Auto-save cleaned data if test data was found
      if (realUsers.length !== users.length) {
        localStorage.setItem('mbms_users', JSON.stringify(realUsers));
        console.log('🧹 Auto-cleaned', users.length - realUsers.length, 'test users');
      }
      
      console.log('📊 Retrieved users:', realUsers.length, 'real users');
      return realUsers;
      
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  };

  // BUDGET MANAGEMENT
  window.getBudgetBalance = function() {
    try {
      const budgetStr = localStorage.getItem('mbms_budget');
      let budget;
      
      if (budgetStr) {
        budget = JSON.parse(budgetStr);
      } else {
        // Initialize budget
        budget = { total: 50000000, allocated: 0, balance: 50000000 };
        localStorage.setItem('mbms_budget', JSON.stringify(budget));
      }
      
      // Ensure budget structure
      if (!budget.total) budget.total = 50000000;
      if (!budget.allocated) budget.allocated = 0;
      budget.balance = budget.total - budget.allocated;
      
      return budget;
    } catch (error) {
      console.error('❌ Error getting budget:', error);
      return { total: 50000000, allocated: 0, balance: 50000000 };
    }
  };

  window.allocateBudget = function(amount) {
    try {
      const budget = window.getBudgetBalance();
      budget.allocated += amount;
      budget.balance = budget.total - budget.allocated;
      
      localStorage.setItem('mbms_budget', JSON.stringify(budget));
      
      // Trigger budget update event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_budget', action: 'allocated', amount: amount }
      }));
      
      console.log('💰 Budget allocated:', amount, 'Remaining:', budget.balance);
      return true;
      
    } catch (error) {
      console.error('❌ Error allocating budget:', error);
      return false;
    }
  };

  // Increment application counter
  window.incrementApplicationCounter = function() {
    try {
      const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0') + 1;
      localStorage.setItem('mbms_application_counter', counter.toString());
      console.log('📊 Application counter incremented to:', counter);
      return counter;
    } catch (error) {
      console.error('❌ Error incrementing counter:', error);
      return 0;
    }
  };

  // Get application counter
  window.getApplicationCounter = function() {
    try {
      return parseInt(localStorage.getItem('mbms_application_counter') || '0');
    } catch (error) {
      console.error('❌ Error getting counter:', error);
      return 0;
    }
  };

  console.log('✅ Enhanced Unified Database Layer loaded');
})();

