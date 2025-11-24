// Email Notification System for Garissa County Bursary
// Uses mailto: links for client-side email (can be upgraded to server-side)

const ADMIN_EMAIL = 'fundadmin@garissa.go.ke';

/**
 * Send email notification (using mailto: link)
 * In production, this would use a server-side email service
 */
function sendEmailNotification(to, subject, body, attachments = []) {
  try {
    // Create mailto link
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Log for debugging (in production, this would actually send via API)
    console.log('Email notification prepared:', {
      to: to,
      subject: subject,
      body: body.substring(0, 100) + '...',
      attachments: attachments.length
    });
    
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * Notify admin when application is awarded
 */
function notifyAdminAwarded(application, awardDetails) {
  const subject = `Bursary Award Notification - ${application.appID}`;
  const body = `Dear Fund Administrator,

A new bursary award has been processed:

Application ID: ${application.appID}
Applicant: ${application.applicantName}
Institution: ${application.personalDetails?.institution || 'N/A'}
Amount Awarded: Ksh ${(awardDetails.committee_amount_kes || awardDetails.amount || 0).toLocaleString()}
Serial Number: ${awardDetails.serialNumber || 'N/A'}
Date Awarded: ${new Date(awardDetails.date_awarded || new Date()).toLocaleDateString()}
Justification: ${awardDetails.justification || 'N/A'}

Please review the attached award letter.

Best regards,
Garissa County Bursary Management System`;

  // In production, this would attach the PDF
  // For now, we'll just send the notification
  sendEmailNotification(ADMIN_EMAIL, subject, body);
}

/**
 * Notify admin when application is rejected
 */
function notifyAdminRejected(application) {
  const subject = `Bursary Application Rejected - ${application.appID}`;
  const body = `Dear Fund Administrator,

An application has been rejected:

Application ID: ${application.appID}
Applicant: ${application.applicantName}
Institution: ${application.personalDetails?.institution || 'N/A'}
Date Rejected: ${new Date(application.rejectionDate || new Date()).toLocaleDateString()}
Reason: ${application.rejectionReason || 'Application did not meet requirements'}

Please review the attached rejection letter.

Best regards,
Garissa County Bursary Management System`;

  sendEmailNotification(ADMIN_EMAIL, subject, body);
}

/**
 * Notify admin when report is generated
 */
function notifyAdminReportGenerated(reportType, reportData) {
  const subject = `Bursary Report Generated - ${reportType}`;
  const body = `Dear Fund Administrator,

A new report has been generated:

Report Type: ${reportType}
Date Generated: ${new Date().toLocaleDateString()}
Time Generated: ${new Date().toLocaleTimeString()}

Report Summary:
${reportData.summary || 'See attached report for details.'}

The report has been downloaded and is ready for review.

Best regards,
Garissa County Bursary Management System`;

  sendEmailNotification(ADMIN_EMAIL, subject, body);
}

/**
 * Send email draft to fundadmin@garissa.go.ke
 * Creates a draft email that appears in the user's email client
 */
function sendEmailDraft(application, documentType, filename, awardDetails = null) {
  try {
    const ADMIN_EMAIL = 'fundadmin@garissa.go.ke';
    let subject = '';
    let body = '';
    
    const applicantName = application.applicantName || 
      `${application.personalDetails?.firstNames || ''} ${application.personalDetails?.lastName || ''}`.trim();
    const institution = application.personalDetails?.institution || 'N/A';
    
    if (documentType === 'award') {
      const amount = awardDetails?.committee_amount_kes || awardDetails?.amount || 0;
      const serialNumber = awardDetails?.serialNumber || 'N/A';
      subject = `Bursary Award - ${application.appID} - ${applicantName}`;
      body = `Dear Fund Administrator,

Please find attached the award letter for the following bursary application:

Application ID: ${application.appID}
Applicant: ${applicantName}
Institution: ${institution}
Amount Awarded: Ksh ${amount.toLocaleString()}
Serial Number: ${serialNumber}
Date Awarded: ${new Date(awardDetails?.date_awarded || new Date()).toLocaleDateString()}

Document: ${filename}

This document has been generated and saved to your downloads folder.

Best regards,
Garissa County Bursary Management System`;
    } else if (documentType === 'rejection') {
      subject = `Bursary Rejection - ${application.appID} - ${applicantName}`;
      body = `Dear Fund Administrator,

Please find attached the rejection letter for the following bursary application:

Application ID: ${application.appID}
Applicant: ${applicantName}
Institution: ${institution}
Date Rejected: ${new Date(application.rejectionDate || new Date()).toLocaleDateString()}
Reason: ${application.rejectionReason || 'Application did not meet requirements'}

Document: ${filename}

This document has been generated and saved to your downloads folder.

Best regards,
Garissa County Bursary Management System`;
    } else if (documentType === 'status') {
      subject = `Bursary Status Update - ${application.appID} - ${applicantName}`;
      body = `Dear Fund Administrator,

Please find attached the status letter for the following bursary application:

Application ID: ${application.appID}
Applicant: ${applicantName}
Institution: ${institution}
Current Status: ${application.status || 'Pending'}

Document: ${filename}

This document has been generated and saved to your downloads folder.

Best regards,
Garissa County Bursary Management System`;
    } else {
      subject = `Bursary Application Summary - ${application.appID} - ${applicantName}`;
      body = `Dear Fund Administrator,

Please find attached the application summary for:

Application ID: ${application.appID}
Applicant: ${applicantName}
Institution: ${institution}
Status: ${application.status || 'N/A'}

Document: ${filename}

This document has been generated and saved to your downloads folder.

Best regards,
Garissa County Bursary Management System`;
    }
    
    // Create mailto link with body (creates draft in email client)
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client with draft
    window.location.href = mailtoLink;
    
    console.log('Email draft created:', { to: ADMIN_EMAIL, subject, filename });
    
    return true;
  } catch (error) {
    console.error('Email draft error:', error);
    return false;
  }
}

/**
 * Send email to Jacob with GitHub access information
 */
function sendEmailToJacob() {
  const JACOB_EMAIL = 'Jacobmuimi@gmail.com';
  const subject = 'GitHub Access - Garissa County Bursary Management System';
  const body = `Dear Jacob,

I hope this email finds you well.

I am reaching out to request your assistance with hosting the Garissa County Bursary Management System. I would like to add you as a collaborator to the GitHub repository so you can help with deployment and hosting.

REPOSITORY DETAILS:
Repository URL: https://github.com/jmsmuigai/Bursary
Repository Name: Bursary
Owner: jmsmuigai

NEXT STEPS:
1. Accept the GitHub Invitation:
   - You should receive an email invitation from GitHub
   - Click "Accept invitation" in the email
   - Or visit: https://github.com/jmsmuigai/Bursary/invitations

2. Clone the Repository:
   git clone https://github.com/jmsmuigai/Bursary.git
   cd Bursary

3. Review the System:
   - Check README.md for system overview
   - Review DATABASE_STRUCTURE.md for data structure
   - Check help.html for user guide

SYSTEM INFORMATION:
- Technology: HTML, CSS, JavaScript (Vanilla JS)
- Storage: Currently using localStorage (client-side)
- PDF Generation: jsPDF library
- Hosting Ready: Can be hosted on GitHub Pages, Netlify, Vercel, or any static hosting

DATABASE STRUCTURE:
I have created a DATABASE_STRUCTURE.md file that details:
- Current localStorage structure
- Recommended migration to Firebase or MySQL
- Authentication structure
- Data models for users, applications, and budget

HOSTING REQUIREMENTS:
The system is currently a static web application that can be hosted on:
- GitHub Pages (already configured)
- Netlify
- Vercel
- Any static hosting service

For production, you may want to:
1. Migrate from localStorage to a backend database (Firebase/MongoDB/MySQL)
2. Set up authentication (Firebase Auth/JWT)
3. Configure environment variables
4. Set up CI/CD pipeline

CURRENT STATUS:
✅ System is fully functional
✅ All features tested and working
✅ Ready for production deployment
✅ Documentation complete

QUESTIONS OR SUPPORT:
If you have any questions or need clarification on any aspect of the system, please don't hesitate to reach out to me at jmsmuigai@gmail.com.

Thank you for your assistance with hosting this system. I look forward to working with you.

Best regards,
James Muigai
jmsmuigai@gmail.com

---
GitHub Repository: https://github.com/jmsmuigai/Bursary
Live Demo: https://jmsmuigai.github.io/Bursary/
Documentation: See README.md and DATABASE_STRUCTURE.md in the repository`;

  const mailtoLink = `mailto:${JACOB_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
  
  console.log('Email draft created for Jacob:', { to: JACOB_EMAIL, subject });
  return true;
}

// Export functions
window.sendEmailNotification = sendEmailNotification;
window.notifyAdminAwarded = notifyAdminAwarded;
window.notifyAdminRejected = notifyAdminRejected;
window.notifyAdminReportGenerated = notifyAdminReportGenerated;
window.sendEmailDraft = sendEmailDraft;
window.sendEmailToJacob = sendEmailToJacob;

