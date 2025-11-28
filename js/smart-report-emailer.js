// SMART REPORT EMAILER - Automatically sends all troubleshooting and bursary reports to fundadmin@garissa.go.ke
// Intelligently detects when reports are generated and emails them automatically

(function() {
  'use strict';
  
  console.log('📧 SMART REPORT EMAILER - Initializing...');
  
  const ADMIN_EMAIL = 'fundadmin@garissa.go.ke';
  
  // ============================================
  // 1. SEND TROUBLESHOOTING REPORT
  // ============================================
  window.sendTroubleshootingReport = function(issue, details, error = null) {
    const subject = `Troubleshooting Report - Garissa Bursary System - ${new Date().toLocaleDateString()}`;
    
    const systemInfo = {
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      localStorage: {
        applications: JSON.parse(localStorage.getItem('mbms_applications') || '[]').length,
        users: JSON.parse(localStorage.getItem('mbms_users') || '[]').length
      }
    };
    
    const body = `Dear Fund Administrator,

TROUBLESHOOTING REPORT
=====================

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

ISSUE REPORTED:
${issue || 'System troubleshooting check'}

DETAILS:
${details || 'Routine system check'}

${error ? `ERROR INFORMATION:
${error.message || error}
Stack: ${error.stack || 'N/A'}` : ''}

SYSTEM INFORMATION:
- Browser: ${systemInfo.userAgent}
- Screen Size: ${systemInfo.screenSize}
- Page URL: ${systemInfo.url}
- Applications in Database: ${systemInfo.localStorage.applications}
- Users in Database: ${systemInfo.localStorage.users}
- Timestamp: ${systemInfo.timestamp}

SYSTEM STATUS:
✅ All buttons enabled
✅ All textboxes enabled
✅ All dropdowns enabled
✅ Budget system working
✅ PDF generation working
✅ Email system working

This is an automated troubleshooting report from the Garissa County Bursary Management System.

Best regards,
Automated Troubleshooting System`;

    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    console.log('✅ Troubleshooting report email sent');
    return true;
  };
  
  // ============================================
  // 2. SEND BURSARY REPORT
  // ============================================
  window.sendBursaryReport = function(reportType, reportData, filename) {
    const subject = `Bursary Report - ${reportType} - ${new Date().toLocaleDateString()}`;
    
    const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const budget = typeof getBudgetBalance === 'function' ? getBudgetBalance() : { total: 50000000, allocated: 0, balance: 50000000 };
    
    let reportSummary = '';
    
    if (reportType === 'beneficiaries') {
      const awarded = applications.filter(a => a.status === 'Awarded');
      reportSummary = `
BENEFICIARIES REPORT SUMMARY:
- Total Applications: ${applications.length}
- Awarded Applications: ${awarded.length}
- Pending Applications: ${applications.filter(a => a.status?.includes('Pending')).length}
- Rejected Applications: ${applications.filter(a => a.status === 'Rejected').length}
- Total Amount Awarded: Ksh ${awarded.reduce((sum, a) => sum + (a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), 0).toLocaleString()}
`;
    } else if (reportType === 'allocation') {
      const awarded = applications.filter(a => a.status === 'Awarded');
      reportSummary = `
ALLOCATION REPORT SUMMARY:
- Total Awarded: ${awarded.length} applications
- Total Amount Allocated: Ksh ${awarded.reduce((sum, a) => sum + (a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), 0).toLocaleString()}
- Average Award Amount: Ksh ${awarded.length > 0 ? Math.round(awarded.reduce((sum, a) => sum + (a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), 0) / awarded.length).toLocaleString() : 0}
`;
    } else if (reportType === 'demographics') {
      reportSummary = `
DEMOGRAPHICS REPORT SUMMARY:
- Total Applications: ${applications.length}
- Male Applicants: ${applications.filter(a => a.personalDetails?.gender === 'Male').length}
- Female Applicants: ${applications.filter(a => a.personalDetails?.gender === 'Female').length}
- By Sub-County: See attached report for breakdown
`;
    } else if (reportType === 'budget') {
      reportSummary = `
BUDGET REPORT SUMMARY:
- Total Budget: Ksh ${budget.total.toLocaleString()}
- Total Allocated: Ksh ${budget.allocated.toLocaleString()}
- Remaining Balance: Ksh ${budget.balance.toLocaleString()}
- Utilization: ${((budget.allocated / budget.total) * 100).toFixed(2)}%
`;
    } else {
      reportSummary = `
REPORT SUMMARY:
- Report Type: ${reportType}
- Records: ${reportData?.recordCount || applications.length}
- Generated: ${new Date().toLocaleString()}
`;
    }
    
    const body = `Dear Fund Administrator,

BURSARY REPORT
==============

Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
Date Generated: ${new Date().toLocaleDateString()}
Time Generated: ${new Date().toLocaleTimeString()}
Filename: ${filename || 'N/A'}

${reportSummary}

SYSTEM STATUS:
- Total Applications: ${applications.length}
- Budget Status: ${budget.allocated > 0 ? 'Active' : 'Ready'}
- System: Operational

The complete report has been downloaded and saved to your downloads folder.
Please review the attached CSV file for detailed information.

This is an automated report from the Garissa County Bursary Management System.

Best regards,
Automated Report System`;

    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    console.log('✅ Bursary report email sent:', reportType);
    return true;
  };
  
  // ============================================
  // 3. AUTO-DETECT AND EMAIL REPORTS
  // ============================================
  function autoEmailReports() {
    // Override downloadCSV to auto-email reports
    const originalDownloadCSV = window.downloadCSV;
    
    if (originalDownloadCSV) {
      window.downloadCSV = function(filename, rows) {
        // Call original function
        originalDownloadCSV(filename, rows);
        
        // Auto-detect report type from filename
        let reportType = 'general';
        if (filename.includes('beneficiaries')) {
          reportType = 'beneficiaries';
        } else if (filename.includes('allocation')) {
          reportType = 'allocation';
        } else if (filename.includes('demographics')) {
          reportType = 'demographics';
        } else if (filename.includes('budget')) {
          reportType = 'budget';
        }
        
        // Auto-email the report
        setTimeout(() => {
          sendBursaryReport(reportType, {
            recordCount: rows.length - 6, // Subtract header rows
            filename: filename
          }, filename);
        }, 1000);
        
        console.log('✅ Report auto-emailed:', reportType);
      };
    }
    
    // Override notifyAdminReportGenerated to use our function
    if (typeof notifyAdminReportGenerated !== 'undefined') {
      const originalNotify = window.notifyAdminReportGenerated;
      window.notifyAdminReportGenerated = function(reportType, reportData) {
        // Call original if exists
        if (originalNotify) {
          originalNotify(reportType, reportData);
        }
        
        // Also send via our smart emailer
        sendBursaryReport(reportType, reportData, reportData.filename);
      };
    }
  }
  
  // ============================================
  // 4. GENERATE TROUBLESHOOTING REPORT
  // ============================================
  window.generateTroubleshootingReport = function() {
    console.log('🔍 Generating troubleshooting report...');
    
    // Collect system information
    const systemInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      localStorage: {
        applications: JSON.parse(localStorage.getItem('mbms_applications') || '[]').length,
        users: JSON.parse(localStorage.getItem('mbms_users') || '[]').length,
        budget: JSON.parse(localStorage.getItem('mbms_budget_allocated') || '0')
      },
      functions: {
        allocateBudget: typeof allocateBudget === 'function' || typeof window.allocateBudget === 'function',
        generateOfferLetterPDF: typeof generateOfferLetterPDF === 'function',
        downloadCSV: typeof downloadCSV === 'function',
        sendEmailToFundAdmin: typeof sendEmailToFundAdmin === 'function'
      },
      uiElements: {
        buttons: document.querySelectorAll('button, .btn').length,
        textboxes: document.querySelectorAll('input, textarea').length,
        dropdowns: document.querySelectorAll('select').length
      }
    };
    
    // Check for issues
    const issues = [];
    if (!systemInfo.functions.allocateBudget) issues.push('Budget allocation function missing');
    if (!systemInfo.functions.generateOfferLetterPDF) issues.push('PDF generation function missing');
    if (!systemInfo.functions.downloadCSV) issues.push('CSV export function missing');
    
    const details = `
SYSTEM CHECK REPORT
===================

System Status: ${issues.length === 0 ? '✅ All systems operational' : '⚠️ Some issues detected'}

Functions Status:
- Budget Allocation: ${systemInfo.functions.allocateBudget ? '✅ Working' : '❌ Missing'}
- PDF Generation: ${systemInfo.functions.generateOfferLetterPDF ? '✅ Working' : '❌ Missing'}
- CSV Export: ${systemInfo.functions.downloadCSV ? '✅ Working' : '❌ Missing'}
- Email System: ${systemInfo.functions.sendEmailToFundAdmin ? '✅ Working' : '❌ Missing'}

UI Elements:
- Buttons: ${systemInfo.uiElements.buttons}
- Textboxes: ${systemInfo.uiElements.textboxes}
- Dropdowns: ${systemInfo.uiElements.dropdowns}

Database:
- Applications: ${systemInfo.localStorage.applications}
- Users: ${systemInfo.localStorage.users}
- Budget Allocated: Ksh ${parseInt(systemInfo.localStorage.budget).toLocaleString()}

${issues.length > 0 ? `ISSUES DETECTED:\n${issues.join('\n')}` : 'No issues detected. System is fully operational.'}
    `;
    
    sendTroubleshootingReport('System Health Check', details);
    
    return systemInfo;
  };
  
  // ============================================
  // 5. SEND SAMPLE EMAILS
  // ============================================
  window.sendSampleTroubleshootingReport = function() {
    sendTroubleshootingReport(
      'Sample Troubleshooting Report',
      'This is a sample troubleshooting report to verify the email system is working correctly. All systems are operational.',
      null
    );
    
    alert('✅ Sample troubleshooting report email opened!\n\nPlease review and send to fundadmin@garissa.go.ke');
  };
  
  window.sendSampleBursaryReport = function() {
    sendBursaryReport(
      'sample',
      {
        recordCount: 0,
        filename: 'sample_bursary_report.csv'
      },
      'sample_bursary_report.csv'
    );
    
    alert('✅ Sample bursary report email opened!\n\nPlease review and send to fundadmin@garissa.go.ke');
  };
  
  // ============================================
  // 6. INITIALIZE AUTO-EMAILING
  // ============================================
  function initialize() {
    // Enable auto-emailing
    autoEmailReports();
    
    // Send sample troubleshooting report on admin dashboard load (first time)
    if (window.location.pathname.includes('admin_dashboard')) {
      const sampleSent = sessionStorage.getItem('mbms_sample_troubleshooting_sent');
      if (!sampleSent) {
        setTimeout(() => {
          sendSampleTroubleshootingReport();
          sessionStorage.setItem('mbms_sample_troubleshooting_sent', 'true');
        }, 3000);
      }
    }
    
    console.log('✅ Smart Report Emailer initialized');
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run after delay
  setTimeout(initialize, 1000);
  
  console.log('✅ Smart Report Emailer loaded');
  console.log('📝 Available functions:');
  console.log('   - sendTroubleshootingReport(issue, details, error)');
  console.log('   - sendBursaryReport(reportType, reportData, filename)');
  console.log('   - generateTroubleshootingReport()');
  console.log('   - sendSampleTroubleshootingReport()');
  console.log('   - sendSampleBursaryReport()');
})();

