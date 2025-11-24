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

// Export functions
window.sendEmailNotification = sendEmailNotification;
window.notifyAdminAwarded = notifyAdminAwarded;
window.notifyAdminRejected = notifyAdminRejected;
window.notifyAdminReportGenerated = notifyAdminReportGenerated;

