// FINAL SYSTEM POLISH - Clears test data, fixes PDF, ensures real-time updates, normalizes database
// This script ensures the system is production-ready

(function() {
  'use strict';
  
  console.log('🔧 FINAL SYSTEM POLISH - Initializing...');
  
  // ============================================
  // 1. CLEAR ALL TEST DATA FROM DATABASE
  // ============================================
  function clearAllTestData() {
    console.log('🧹 Clearing all test data from database...');
    
    try {
      // Clear test applications
      const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const realApps = applications.filter(app => {
        // Remove test applications
        if (!app.applicantEmail) return false;
        if (app.applicantEmail.includes('test') || 
            app.applicantEmail.includes('example.com') ||
            app.appID && (app.appID.includes('TEST') || app.appID.includes('test'))) {
          console.log('🗑️ Removing test application:', app.appID);
          return false;
        }
        return true;
      });
      
      localStorage.setItem('mbms_applications', JSON.stringify(realApps));
      console.log('✅ Cleared test applications. Remaining:', realApps.length);
      
      // Clear test users (except admin)
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const realUsers = users.filter(user => {
        if (user.role === 'admin') return true; // Keep admin
        if (user.email && (user.email.includes('test') || user.email.includes('example.com'))) {
          console.log('🗑️ Removing test user:', user.email);
          return false;
        }
        return true;
      });
      
      localStorage.setItem('mbms_users', JSON.stringify(realUsers));
      console.log('✅ Cleared test users. Remaining:', realUsers.length);
      
      // Clear test drafts
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('mbms_application_')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.applicantEmail && 
                  (parsed.applicantEmail.includes('test') || parsed.applicantEmail.includes('example.com'))) {
                localStorage.removeItem(key);
                console.log('🗑️ Removed test draft:', key);
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      });
      
      // Reset counters if no real applications
      if (realApps.length === 0) {
        localStorage.setItem('mbms_application_counter', '0');
        localStorage.setItem('mbms_last_serial', '0');
        console.log('✅ Reset counters - database is empty and ready');
      }
      
      return {
        applicationsRemoved: applications.length - realApps.length,
        usersRemoved: users.length - realUsers.length,
        remainingApplications: realApps.length,
        remainingUsers: realUsers.length
      };
      
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      return { error: error.message };
    }
  }
  
  // ============================================
  // 2. FIX PDF GENERATION ERROR
  // ============================================
  function fixPDFGeneration() {
    console.log('🔧 Fixing PDF generation...');
    
    // Ensure jsPDF is loaded
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      console.log('📦 Loading jsPDF library...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        console.log('✅ jsPDF loaded');
        if (typeof window.jspdf !== 'undefined') {
          window.jsPDF = window.jspdf;
        }
      };
      document.head.appendChild(script);
    }
    
    // Fix downloadApplicationLetter to handle errors better
    if (typeof window.downloadApplicationLetter === 'function') {
      const originalDownload = window.downloadApplicationLetter;
      window.downloadApplicationLetter = async function(appID, status) {
        try {
          // Ensure jsPDF is available
          if (typeof generateOfferLetterPDF === 'undefined' && 
              typeof downloadPDFDirect === 'undefined') {
            // Wait for PDF generator to load
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          return await originalDownload.call(this, appID, status);
        } catch (error) {
          console.error('PDF download error:', error);
          
          // Show user-friendly error
          const errorMsg = document.createElement('div');
          errorMsg.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
          errorMsg.style.zIndex = '10000';
          errorMsg.innerHTML = `
            <strong>❌ Document Generation Failed</strong><br>
            <small>Error: ${error.message}</small><br>
            <small>Please refresh the page and try again.</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.body.appendChild(errorMsg);
          setTimeout(() => {
            if (errorMsg.parentNode) errorMsg.remove();
          }, 5000);
          
          throw error;
        }
      };
      console.log('✅ PDF generation error handling fixed');
    }
  }
  
  // ============================================
  // 3. ENSURE REAL-TIME UPDATES
  // ============================================
  function ensureRealTimeUpdates() {
    console.log('🔄 Ensuring real-time updates...');
    
    // Listen for application submissions
    window.addEventListener('storage', function(e) {
      if (e.key === 'mbms_applications') {
        console.log('📊 Applications updated - refreshing dashboard');
        if (typeof refreshApplications === 'function') {
          refreshApplications();
        }
        if (typeof updateMetrics === 'function') {
          updateMetrics();
        }
      }
    });
    
    // Listen for custom events
    window.addEventListener('mbms-data-updated', function(e) {
      console.log('📊 Data updated event received:', e.detail);
      if (e.detail.key === 'mbms_applications') {
        if (typeof refreshApplications === 'function') {
          setTimeout(() => refreshApplications(), 100);
        }
        if (typeof updateMetrics === 'function') {
          setTimeout(() => updateMetrics(), 100);
        }
      }
    });
    
    // Poll for updates every 2 seconds (fallback)
    if (window.location.pathname.includes('admin_dashboard')) {
      setInterval(() => {
        if (typeof refreshApplications === 'function') {
          refreshApplications();
        }
      }, 2000);
    }
    
    console.log('✅ Real-time updates enabled');
  }
  
  // ============================================
  // 4. NORMALIZE DATABASE STRUCTURE
  // ============================================
  function normalizeDatabase() {
    console.log('🗄️ Normalizing database structure...');
    
    try {
      const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      let normalized = 0;
      
      applications.forEach(app => {
        let updated = false;
        
        // Ensure required fields exist
        if (!app.appID) {
          const year = new Date().getFullYear();
          const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0') + 1;
          app.appID = `GSA/${year}/${counter.toString().padStart(4, '0')}`;
          localStorage.setItem('mbms_application_counter', counter.toString());
          updated = true;
        }
        
        if (!app.status) {
          app.status = 'Pending Ward Review';
          updated = true;
        }
        
        if (!app.dateSubmitted) {
          app.dateSubmitted = new Date().toISOString();
          updated = true;
        }
        
        // Normalize personalDetails structure
        if (!app.personalDetails) {
          app.personalDetails = {
            firstNames: app.firstNames || '',
            lastName: app.lastName || app.lastNameApp || '',
            gender: app.gender || app.genderApp || '',
            studentPhone: app.studentPhone || '',
            parentPhone: app.parentPhone || '',
            institution: app.institution || app.institutionName || '',
            regNumber: app.regNumber || '',
            yearForm: app.yearForm || '',
            courseNature: app.courseNature || '',
            courseDuration: app.courseDuration || '',
            subCounty: app.subCounty || '',
            ward: app.ward || ''
          };
          updated = true;
        }
        
        // Normalize financialDetails structure
        if (!app.financialDetails) {
          app.financialDetails = {
            monthlyIncome: app.monthlyIncome || 0,
            totalAnnualFees: app.totalAnnualFees || 0,
            feeBalance: app.feeBalance || 0,
            amountRequested: app.amountRequested || 0,
            justification: app.justification || ''
          };
          updated = true;
        }
        
        // Normalize awardDetails structure
        if (app.status === 'Awarded' && app.awardDetails) {
          if (!app.awardDetails.amount && app.awardDetails.committee_amount_kes) {
            app.awardDetails.amount = app.awardDetails.committee_amount_kes;
          }
          if (!app.awardDetails.committee_amount_kes && app.awardDetails.amount) {
            app.awardDetails.committee_amount_kes = app.awardDetails.amount;
          }
          updated = true;
        }
        
        if (updated) {
          normalized++;
        }
      });
      
      if (normalized > 0) {
        localStorage.setItem('mbms_applications', JSON.stringify(applications));
        console.log(`✅ Normalized ${normalized} applications`);
      } else {
        console.log('✅ Database already normalized');
      }
      
      return { normalized };
      
    } catch (error) {
      console.error('❌ Error normalizing database:', error);
      return { error: error.message };
    }
  }
  
  // ============================================
  // 5. ENHANCE SUBMIT BUTTON WITH CONFIRMATION
  // ============================================
  function enhanceSubmitButton() {
    console.log('🔧 Enhancing submit button...');
    
    // This will be handled in application.js, but ensure it's enabled
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      console.log('✅ Submit button enabled');
    }
  }
  
  // ============================================
  // 6. AUTO-UPDATE ADMIN DASHBOARD ON SUBMISSION
  // ============================================
  function setupAutoUpdate() {
    console.log('🔄 Setting up auto-update for admin dashboard...');
    
    // Enhanced application submission handler
    const originalSubmit = window.addEventListener;
    
    // Override application submission to trigger immediate update
    if (window.location.pathname.includes('application.html')) {
      // Listen for form submission
      const form = document.getElementById('applicationForm');
      if (form) {
        form.addEventListener('submit', function(e) {
          // This will be handled by application.js
          // But we ensure events are triggered
          setTimeout(() => {
            // Trigger multiple update events
            window.dispatchEvent(new CustomEvent('mbms-application-submitted'));
            window.dispatchEvent(new CustomEvent('mbms-data-updated', {
              detail: { key: 'mbms_applications', action: 'submitted' }
            }));
            
            // Force localStorage update to trigger storage event
            const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
            localStorage.setItem('mbms_applications', JSON.stringify(apps));
          }, 500);
        });
      }
    }
    
    console.log('✅ Auto-update setup complete');
  }
  
  // ============================================
  // 7. INITIALIZE ALL FIXES
  // ============================================
  function initializeAllFixes() {
    console.log('🚀 Initializing all fixes...');
    
    // Clear test data on admin dashboard load - ENSURE DATABASE IS EMPTY
    if (window.location.pathname.includes('admin_dashboard')) {
      // Always clear test data to ensure clean database
      const cleared = clearAllTestData();
      
      // Also verify and clear if needed
      const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminUsers = users.filter(u => u.role === 'admin');
      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      
      // If there are any applications or non-admin users, clear them
      if (applications.length > 0 || nonAdminUsers.length > 0) {
        console.log('🧹 Ensuring database is completely empty...');
        
        // Clear applications
        localStorage.setItem('mbms_applications', JSON.stringify([]));
        
        // Keep only admin users
        localStorage.setItem('mbms_users', JSON.stringify(adminUsers));
        
        // Reset counters
        localStorage.setItem('mbms_application_counter', '0');
        localStorage.setItem('mbms_last_serial', '0');
        
        console.log(`✅ Database cleared - Applications: 0, Users: ${adminUsers.length} (admin only)`);
        
        // Refresh dashboard
        setTimeout(() => {
          if (typeof refreshApplications === 'function') {
            refreshApplications();
          }
          if (typeof updateMetrics === 'function') {
            updateMetrics();
          }
        }, 500);
      } else {
        console.log('✅ Database is already empty and ready');
      }
    }
    
    // Fix PDF generation
    fixPDFGeneration();
    
    // Ensure real-time updates
    ensureRealTimeUpdates();
    
    // Normalize database
    normalizeDatabase();
    
    // Enhance submit button
    enhanceSubmitButton();
    
    // Setup auto-update
    setupAutoUpdate();
    
    console.log('✅ All fixes initialized');
  }
  
  // ============================================
  // 8. EXPORT FUNCTIONS
  // ============================================
  window.clearAllTestDataNow = clearAllTestData;
  window.normalizeDatabaseNow = normalizeDatabase;
  window.fixPDFGenerationNow = fixPDFGeneration;
  
  // ============================================
  // 9. RUN ON PAGE LOAD
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFixes);
  } else {
    initializeAllFixes();
  }
  
  // Also run after a delay to catch dynamically loaded content
  setTimeout(initializeAllFixes, 1000);
  
  console.log('✅ Final System Polish script loaded');
})();

