// UPDATE NOTIFICATION SYSTEM - Notifies logged-in users of new updates
// Forces refresh and shows update message

(function() {
  'use strict';
  
  console.log('🔔 UPDATE NOTIFICATION - Initializing...');
  
  const UPDATE_VERSION = '3.0-FINAL';
  const UPDATE_DATE = new Date().toISOString().split('T')[0];
  const STORAGE_KEY = 'mbms_last_update_version';
  
  /**
   * Check if user needs to be notified of update
   */
  function checkForUpdates() {
    const lastVersion = localStorage.getItem(STORAGE_KEY);
    const currentUser = sessionStorage.getItem('mbms_current_user') || sessionStorage.getItem('mbms_admin');
    
    // Only show notification if user is logged in
    if (!currentUser) {
      return;
    }
    
    // Check if this is a new version
    if (lastVersion !== UPDATE_VERSION) {
      showUpdateNotification();
      localStorage.setItem(STORAGE_KEY, UPDATE_VERSION);
    }
  }
  
  /**
   * Show update notification modal
   */
  function showUpdateNotification() {
    // Remove existing notification if any
    const existing = document.getElementById('updateNotificationModal');
    if (existing) {
      existing.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'updateNotificationModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('data-bs-backdrop', 'static');
    modal.setAttribute('data-bs-keyboard', 'false');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-primary-700 text-white">
            <h5 class="modal-title">
              <i class="bi bi-arrow-clockwise me-2"></i>System Update Available
            </h5>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-info mb-3">
              <h6><i class="bi bi-info-circle me-2"></i>New Update: Version ${UPDATE_VERSION}</h6>
              <p class="mb-0">A new system update has been deployed with important improvements and fixes.</p>
            </div>
            
            <h6 class="mb-2">What's New:</h6>
            <ul class="mb-3">
              <li>✅ All buttons and text boxes activated</li>
              <li>✅ Smart form validation and auto-complete</li>
              <li>✅ Enhanced PDF generation (no more errors)</li>
              <li>✅ Real-time updates and auto-refresh</li>
              <li>✅ Database normalized and optimized</li>
              <li>✅ System tested and production-ready</li>
            </ul>
            
            <div class="alert alert-warning mb-0">
              <strong>⚠️ Important:</strong> Please refresh your browser to get the latest version and ensure all features work correctly.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" onclick="location.reload(true)">
              <i class="bi bi-arrow-clockwise me-2"></i>Refresh Now
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Refresh Later
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal using Bootstrap
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      
      // Auto-refresh after 10 seconds if user doesn't click
      setTimeout(() => {
        if (document.body.contains(modal)) {
          location.reload(true);
        }
      }, 10000);
    } else {
      // Fallback: show alert and refresh
      alert('🔄 SYSTEM UPDATE AVAILABLE!\n\nA new version has been deployed.\n\nPlease refresh your browser to get the latest updates.\n\nAuto-refreshing in 5 seconds...');
      setTimeout(() => {
        location.reload(true);
      }, 5000);
    }
  }
  
  /**
   * Force refresh for all logged-in users
   */
  function forceRefreshForAllUsers() {
    const currentUser = sessionStorage.getItem('mbms_current_user') || sessionStorage.getItem('mbms_admin');
    
    if (currentUser) {
      // Set flag to force refresh
      sessionStorage.setItem('mbms_force_refresh', 'true');
      
      // Show notification
      showUpdateNotification();
    }
  }
  
  // Check for updates on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForUpdates);
  } else {
    checkForUpdates();
  }
  
  // Also check after a delay
  setTimeout(checkForUpdates, 1000);
  
  // Check if force refresh is needed
  if (sessionStorage.getItem('mbms_force_refresh') === 'true') {
    sessionStorage.removeItem('mbms_force_refresh');
    showUpdateNotification();
  }
  
  // Export function
  window.forceRefreshForAllUsers = forceRefreshForAllUsers;
  window.checkForUpdates = checkForUpdates;
  
  console.log('✅ Update Notification system loaded');
})();

