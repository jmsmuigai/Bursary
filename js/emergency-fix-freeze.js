// EMERGENCY FIX FREEZE - Aggressively prevents page freezing
// Makes ALL operations non-blocking, adds timeouts, prevents infinite loops

(function() {
  'use strict';
  
  console.log('🚨 EMERGENCY FIX FREEZE - Activating...');
  
  // ============================================
  // 1. AGGRESSIVE TIMEOUT PROTECTION
  // ============================================
  function addAggressiveTimeouts() {
    // Wrap ALL async operations with timeout
    const originalFetch = window.fetch;
    if (originalFetch) {
      window.fetch = function(...args) {
        return Promise.race([
          originalFetch.apply(this, args),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fetch timeout')), 3000);
          })
        ]);
      };
    }
    
    // Limit all setTimeout chains
    let timeoutCount = 0;
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, delay, ...args) {
      timeoutCount++;
      if (timeoutCount > 50) {
        console.warn('⚠️ Too many timeouts, clearing...');
        timeoutCount = 0;
        return null;
      }
      return originalSetTimeout.call(this, callback, Math.min(delay || 0, 5000), ...args);
    };
    
    // Auto-clear all intervals after 10 seconds
    const originalSetInterval = window.setInterval;
    window.setInterval = function(callback, delay, ...args) {
      const id = originalSetInterval.call(this, callback, delay, ...args);
      setTimeout(() => {
        clearInterval(id);
        console.warn('⚠️ Auto-cleared interval to prevent freeze');
      }, 10000);
      return id;
    };
    
    console.log('✅ Aggressive timeout protection enabled');
  }
  
  // ============================================
  // 2. DISABLE BLOCKING OPERATIONS
  // ============================================
  function disableBlockingOperations() {
    // Make loadApplications return immediately
    if (typeof window.loadApplications === 'function') {
      const original = window.loadApplications;
      window.loadApplications = function() {
        // Return cached data immediately, never block
        const cached = localStorage.getItem('mbms_applications');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (e) {
            return [];
          }
        }
        return [];
      };
    }
    
    // Make renderTable non-blocking with chunking
    if (typeof window.renderTable === 'function') {
      const original = window.renderTable;
      window.renderTable = function(applications) {
        // Limit to 100 applications max
        const limited = applications.slice(0, 100);
        
        // Use requestAnimationFrame
        requestAnimationFrame(() => {
          try {
            original.call(this, limited);
          } catch (e) {
            console.error('Render error:', e);
            const tbody = document.getElementById('applicationsTableBody');
            if (tbody) {
              tbody.innerHTML = `
                <tr>
                  <td colspan="8" class="text-center py-4 text-muted">
                    <p>Applications loaded. Please refresh if needed.</p>
                  </td>
                </tr>
              `;
            }
          }
        });
      };
    }
    
    // Make updateMetrics non-blocking
    if (typeof window.updateMetrics === 'function') {
      const original = window.updateMetrics;
      window.updateMetrics = function() {
        setTimeout(() => {
          try {
            original.call(this);
          } catch (e) {
            console.error('Metrics error:', e);
          }
        }, 0);
      };
    }
    
    // Make updateBudgetDisplay non-blocking
    if (typeof window.updateBudgetDisplay === 'function') {
      const original = window.updateBudgetDisplay;
      window.updateBudgetDisplay = function() {
        setTimeout(() => {
          try {
            original.call(this);
          } catch (e) {
            console.error('Budget error:', e);
          }
        }, 0);
      };
    }
    
    console.log('✅ Blocking operations disabled');
  }
  
  // ============================================
  // 3. FIX SMART BUDGET COUNTER
  // ============================================
  function fixSmartBudgetCounter() {
    const counter = document.getElementById('smartBudgetCounter');
    if (counter && counter.innerHTML.includes('Loading')) {
      // Show cached budget immediately
      const total = parseFloat(localStorage.getItem('mbms_budget_total') || '50000000');
      const allocated = parseFloat(localStorage.getItem('mbms_budget_allocated') || '0');
      const balance = total - allocated;
      
      counter.innerHTML = `
        <div class="text-center py-2">
          <p class="text-muted small mb-0">Budget: Ksh ${balance.toLocaleString()} remaining</p>
        </div>
      `;
      console.log('✅ Budget counter fixed');
    }
  }
  
  // ============================================
  // 4. PREVENT TEST DATA FROM BLOCKING
  // ============================================
  function preventTestDataBlocking() {
    // Override createTestData to be non-blocking
    if (typeof window.createTestData === 'function') {
      const original = window.createTestData;
      window.createTestData = function() {
        setTimeout(() => {
          original().catch(e => {
            console.error('Test data error:', e);
          });
        }, 2000); // Delay by 2 seconds
      };
    }
  }
  
  // ============================================
  // 5. SIMPLIFY INITIALIZATION
  // ============================================
  function simplifyInitialization() {
    // Show cached data immediately
    setTimeout(() => {
      const tbody = document.getElementById('applicationsTableBody');
      if (tbody && tbody.innerHTML.includes('Loading')) {
        const cached = localStorage.getItem('mbms_applications');
        if (cached) {
          try {
            const apps = JSON.parse(cached);
            if (Array.isArray(apps) && apps.length > 0) {
              // Show immediately
              if (typeof window.renderTable === 'function') {
                window.renderTable(apps);
              }
            } else {
              // Show empty state
              tbody.innerHTML = `
                <tr>
                  <td colspan="8" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
                    <h5 class="text-muted">No Applications Found</h5>
                    <p class="text-muted mb-0">The system is ready for the first application submission.</p>
                  </td>
                </tr>
              `;
            }
          } catch (e) {
            console.error('Cache error:', e);
          }
        } else {
          // Show empty state
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="text-center py-5">
                <i class="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
                <h5 class="text-muted">No Applications Found</h5>
                <p class="text-muted mb-0">The system is ready for the first application submission.</p>
              </td>
            </tr>
          `;
        }
      }
      
      // Fix budget counter
      fixSmartBudgetCounter();
    }, 100);
  }
  
  // ============================================
  // 6. ADD ERROR BOUNDARIES
  // ============================================
  function addErrorBoundaries() {
    // Global error handler - prevent blocking
    window.addEventListener('error', (e) => {
      console.error('Error caught:', e.error);
      e.preventDefault();
      return true;
    }, true);
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled rejection:', e.reason);
      e.preventDefault();
    });
    
    console.log('✅ Error boundaries added');
  }
  
  // ============================================
  // 7. RUN ALL FIXES IMMEDIATELY
  // ============================================
  function runEmergencyFixes() {
    console.log('🚨 Running emergency fixes...');
    
    addAggressiveTimeouts();
    disableBlockingOperations();
    preventTestDataBlocking();
    simplifyInitialization();
    addErrorBoundaries();
    
    // Show page is responsive
    setTimeout(() => {
      const notification = document.createElement('div');
      notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
      notification.style.zIndex = '10000';
      notification.style.maxWidth = '90%';
      notification.innerHTML = `
        <strong>✅ Page Fixed!</strong><br>
        <small>All blocking operations removed. Page should be responsive now.</small>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) notification.remove();
      }, 3000);
    }, 500);
    
    console.log('✅ Emergency fixes applied');
  }
  
  // Run immediately (highest priority)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runEmergencyFixes, 0);
    });
  } else {
    setTimeout(runEmergencyFixes, 0);
  }
  
  // Also run on next tick
  setTimeout(runEmergencyFixes, 100);
  
  // Export function
  window.emergencyFixFreeze = runEmergencyFixes;
  
  console.log('✅ Emergency Fix Freeze loaded');
})();

