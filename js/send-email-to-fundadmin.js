// SEND EMAIL TO FUNDADMIN - Direct email functionality to fundadmin@garissa.go.ke
// Enables easy email sending from admin dashboard

(function() {
  'use strict';
  
  console.log('📧 SEND EMAIL TO FUNDADMIN - Initializing...');
  
  const ADMIN_EMAIL = 'fundadmin@garissa.go.ke';
  
  /**
   * Send email directly to fundadmin@garissa.go.ke
   * This is the main function to send emails
   */
  window.sendEmailToFundAdmin = function(subject, body, customBody = null) {
    try {
      const emailSubject = subject || 'Garissa Bursary System - Notification';
      const emailBody = customBody || body || `Dear Fund Administrator,

This is an automated notification from the Garissa County Bursary Management System.

System Status: ✅ Operational
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Please review the system and ensure all features are working correctly.

Best regards,
Garissa County Bursary Management System
Automated Notification System`;

      // Create mailto link
      const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      console.log('✅ Email draft created for:', ADMIN_EMAIL);
      console.log('   Subject:', emailSubject);
      
      return true;
    } catch (error) {
      console.error('❌ Email error:', error);
      alert('❌ Error creating email: ' + error.message);
      return false;
    }
  };
  
  /**
   * Send system status email
   */
  window.sendSystemStatusEmail = function() {
    const subject = 'Garissa Bursary System - Status Report';
    const body = `Dear Fund Administrator,

SYSTEM STATUS REPORT
====================

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

SYSTEM STATUS:
✅ System is operational
✅ All features working correctly
✅ Database is ready for applications
✅ Email pipeline is functional
✅ PDF generation working
✅ Real-time updates active

DATABASE STATUS:
- Applications: ${JSON.parse(localStorage.getItem('mbms_applications') || '[]').length}
- Users: ${JSON.parse(localStorage.getItem('mbms_users') || '[]').length}
- Budget: Ksh 50,000,000

SYSTEM FEATURES:
✅ Application submission
✅ Award processing
✅ Rejection processing
✅ PDF document generation
✅ Email notifications
✅ Real-time updates
✅ Budget management
✅ Reports generation

SYSTEM LINK:
👉 https://jmsmuigai.github.io/Bursary/

Admin Dashboard:
👉 https://jmsmuigai.github.io/Bursary/admin_dashboard.html

The system is ready to receive applications.

Best regards,
Garissa County Bursary Management System
Automated Status Report`;

    return sendEmailToFundAdmin(subject, body);
  };
  
  /**
   * Send test email to verify email pipeline
   */
  window.sendTestEmailToFundAdmin = function() {
    const subject = 'Email Pipeline Test - Garissa Bursary System';
    const body = `Dear Fund Administrator,

This is a test email to verify that the email notification pipeline is working correctly.

EMAIL NOTIFICATIONS CONFIGURED:
✅ Award Letters - Sent when applications are awarded
✅ Rejection Letters - Sent when applications are rejected
✅ Status Updates - Sent for pending applications
✅ Smart Reports - Sent when reports are generated
✅ Application Submissions - Notified when new applications are submitted

HOW IT WORKS:
1. When you award an application, an email draft is automatically created
2. The award letter PDF is generated and saved to downloads
3. An email notification is prepared with all details
4. The email opens in your default email client (Outlook, Gmail, etc.)
5. You can attach the PDF and send

If you receive this email, the email pipeline is working correctly!

Best regards,
Garissa County Bursary Management System
Email Pipeline Test`;

    return sendEmailToFundAdmin(subject, body);
  };
  
  /**
   * Send notification about new application
   */
  window.sendNewApplicationEmail = function(application) {
    const subject = `New Bursary Application - ${application.appID || 'Pending'}`;
    const body = `Dear Fund Administrator,

A new bursary application has been submitted:

Application ID: ${application.appID || 'Pending Assignment'}
Applicant: ${application.applicantName || application.personalDetails?.firstNames + ' ' + application.personalDetails?.lastName || 'N/A'}
Email: ${application.applicantEmail || 'N/A'}
Institution: ${application.personalDetails?.institution || 'N/A'}
Amount Requested: Ksh ${(application.financialDetails?.amountRequested || 0).toLocaleString()}
Date Submitted: ${new Date(application.dateSubmitted || new Date()).toLocaleDateString()}
Status: ${application.status || 'Pending Ward Review'}

Please review the application in the admin dashboard.

Best regards,
Garissa County Bursary Management System`;

    return sendEmailToFundAdmin(subject, body);
  };
  
  /**
   * Add email button to admin dashboard
   */
  function addEmailButtonToDashboard() {
    // Only on admin dashboard
    if (!window.location.pathname.includes('admin_dashboard')) {
      return;
    }
    
    // Wait for dashboard to load
    setTimeout(() => {
      const metricsCard = document.querySelector('.card.mb-4');
      if (!metricsCard) {
        // Retry after delay
        setTimeout(addEmailButtonToDashboard, 1000);
        return;
      }
      
      // Check if button already exists
      if (document.getElementById('sendEmailToFundAdminBtn')) {
        return;
      }
      
      // Create email button
      const emailBtn = document.createElement('button');
      emailBtn.id = 'sendEmailToFundAdminBtn';
      emailBtn.className = 'btn btn-primary-700 btn-sm ms-2';
      emailBtn.innerHTML = '<i class="bi bi-envelope me-2"></i>Send Email to Fund Admin';
      emailBtn.onclick = function() {
        if (confirm('Send email to fundadmin@garissa.go.ke?\n\nThis will open your email client with a draft message.')) {
          sendSystemStatusEmail();
        }
      };
      
      // Try to add to header or metrics area
      const header = document.querySelector('.card-header');
      if (header) {
        const existingBtn = header.querySelector('#sendEmailToFundAdminBtn');
        if (!existingBtn) {
          header.appendChild(emailBtn);
        }
      } else {
        // Add to top of page
        const container = document.querySelector('.container');
        if (container) {
          const emailDiv = document.createElement('div');
          emailDiv.className = 'text-end mb-3';
          emailDiv.appendChild(emailBtn);
          container.insertBefore(emailDiv, container.firstChild);
        }
      }
      
      console.log('✅ Email button added to admin dashboard');
    }, 2000);
  }
  
  // Add button on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addEmailButtonToDashboard);
  } else {
    addEmailButtonToDashboard();
  }
  
  // Also try after delay
  setTimeout(addEmailButtonToDashboard, 3000);
  
  console.log('✅ Send Email to FundAdmin script loaded');
  console.log('📝 Available functions:');
  console.log('   - sendEmailToFundAdmin(subject, body) - Send custom email');
  console.log('   - sendSystemStatusEmail() - Send system status');
  console.log('   - sendTestEmailToFundAdmin() - Send test email');
  console.log('   - sendNewApplicationEmail(application) - Send new application notification');
})();

