// AUTO EMAIL TEST - Automatically sends test email to fundadmin@garissa.go.ke on admin dashboard load
// Tests the email pipeline and sends sample documents

(function() {
  'use strict';
  
  console.log('📧 AUTO EMAIL TEST - Initializing...');
  
  /**
   * Auto-send test email on admin dashboard load (first time only)
   */
  function autoSendTestEmail() {
    // Only on admin dashboard
    if (!window.location.pathname.includes('admin_dashboard')) {
      return;
    }
    
    // Check if already sent
    const emailTestSent = sessionStorage.getItem('mbms_email_test_sent');
    if (emailTestSent === 'true') {
      console.log('ℹ️ Email test already sent in this session');
      return;
    }
    
    // Wait a bit for page to load
    setTimeout(() => {
      console.log('📧 Auto-sending test email to fundadmin@garissa.go.ke...');
      
      // Check if email functions are available
      if (typeof testEmailPipeline === 'function') {
        // Send test email
        testEmailPipeline();
        
        // Mark as sent
        sessionStorage.setItem('mbms_email_test_sent', 'true');
        
        console.log('✅ Test email sent to fundadmin@garissa.go.ke');
        
        // Show notification
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
          notification.style.zIndex = '10000';
          notification.innerHTML = `
            <strong>📧 Email Pipeline Test</strong><br>
            <small>A test email has been opened in your email client. Please review and send to fundadmin@garissa.go.ke to verify the email pipeline is working.</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 10000);
        }, 1000);
      } else {
        console.log('⚠️ Email test functions not loaded yet');
      }
    }, 2000);
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoSendTestEmail);
  } else {
    autoSendTestEmail();
  }
  
  // Also run after delay
  setTimeout(autoSendTestEmail, 3000);
  
  console.log('✅ Auto Email Test script loaded');
})();

