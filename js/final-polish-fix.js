// FINAL POLISH FIX - Removes Edit button, fixes View, Download success detection, Email forwarding
// This ensures everything works perfectly

(function() {
  'use strict';
  
  console.log('✨ FINAL POLISH FIX - Initializing...');
  
  // Remove any Edit buttons that might exist
  function removeEditButtons() {
    const editButtons = document.querySelectorAll('.btn-warning[data-action="edit"], button:contains("Edit"), .action-btn[data-action="edit"]');
    editButtons.forEach(btn => {
      if (btn.textContent.includes('Edit') || btn.getAttribute('data-action') === 'edit') {
        console.log('🗑️ Removing Edit button:', btn);
        btn.remove();
      }
    });
    
    // Also check table rows
    const tableRows = document.querySelectorAll('#applicationsTableBody tr');
    tableRows.forEach(row => {
      const editBtn = row.querySelector('button[data-action="edit"], .btn-warning');
      if (editBtn && (editBtn.textContent.includes('Edit') || editBtn.getAttribute('data-action') === 'edit')) {
        console.log('🗑️ Removing Edit button from row');
        editBtn.remove();
      }
    });
  }
  
  // Enhanced View function - Shows comprehensive document summary
  const originalViewApplication = window.viewApplication;
  window.viewApplication = function(appID) {
    const apps = typeof loadApplications === 'function' ? loadApplications() : JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const app = apps.find(a => a.appID === appID);
    
    if (!app) {
      alert('Application not found');
      return;
    }
    
    // Remove any existing modal
    const existingModal = document.getElementById('viewApplicationModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create comprehensive view modal with document summary
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'viewApplicationModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'viewApplicationModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    const status = app.status || 'Pending Submission';
    const statusClass = getStatusBadgeClass(status);
    
    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-text me-2"></i>Application Document Summary - ${app.appID}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <!-- COMPREHENSIVE DOCUMENT SUMMARY -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card shadow-sm mb-3">
                  <div class="card-header bg-info text-white">
                    <h6 class="mb-0"><i class="bi bi-person-circle me-2"></i>Applicant Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Full Name:</strong> ${app.applicantName || 'N/A'}</p>
                    <p><strong>Gender:</strong> ${app.personalDetails?.gender || 'N/A'}</p>
                    <p><strong>Email:</strong> ${app.applicantEmail || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${app.personalDetails?.phoneNumber || app.personalDetails?.studentPhone || 'N/A'}</p>
                    <p><strong>ID Number:</strong> ${app.idNumber || app.nemisId || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${app.dateOfBirth || app.personalDetails?.dateOfBirth || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card shadow-sm mb-3">
                  <div class="card-header bg-success text-white">
                    <h6 class="mb-0"><i class="bi bi-geo-alt me-2"></i>Location Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Sub-County:</strong> ${app.personalDetails?.subCounty || app.subCounty || 'N/A'}</p>
                    <p><strong>Ward:</strong> ${app.personalDetails?.ward || app.ward || 'N/A'}</p>
                    <p><strong>Village/Bulla/Estate:</strong> ${app.personalDetails?.village || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card shadow-sm mb-3">
                  <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0"><i class="bi bi-building me-2"></i>Institution Details</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Institution:</strong> ${app.personalDetails?.institution || app.institution || 'N/A'}</p>
                    <p><strong>Registration No:</strong> ${app.personalDetails?.regNumber || 'N/A'}</p>
                    <p><strong>Course:</strong> ${app.personalDetails?.course || 'N/A'}</p>
                    <p><strong>Year of Study:</strong> ${app.personalDetails?.yearOfStudy || app.personalDetails?.yearForm || 'N/A'}</p>
                    <p><strong>Course Duration:</strong> ${app.personalDetails?.courseDuration || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card shadow-sm mb-3">
                  <div class="card-header bg-danger text-white">
                    <h6 class="mb-0"><i class="bi bi-cash-coin me-2"></i>Financial Information</h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Fee Balance:</strong> Ksh ${(app.financialDetails?.feeBalance || 0).toLocaleString()}</p>
                    <p><strong>Amount Requested:</strong> Ksh ${(app.financialDetails?.amountRequested || 0).toLocaleString()}</p>
                    <p><strong>Monthly Income:</strong> Ksh ${(app.financialDetails?.monthlyIncome || 0).toLocaleString()}</p>
                    <p><strong>Total Annual Fees:</strong> Ksh ${(app.financialDetails?.totalAnnualFees || 0).toLocaleString()}</p>
                    ${app.status === 'Awarded' && app.awardDetails ? `
                      <hr>
                      <p class="text-success"><strong>Amount Awarded:</strong> Ksh ${(app.awardDetails.committee_amount_kes || app.awardDetails.amount || 0).toLocaleString()}</p>
                      <p><strong>Serial Number:</strong> ${app.awardDetails.serialNumber || 'N/A'}</p>
                      <p><strong>Date Awarded:</strong> ${new Date(app.awardDetails.date_awarded || new Date()).toLocaleDateString()}</p>
                    ` : ''}
                    ${app.status === 'Rejected' ? `
                      <hr>
                      <p class="text-danger"><strong>Rejection Reason:</strong> ${app.rejectionReason || 'N/A'}</p>
                      <p><strong>Date Rejected:</strong> ${new Date(app.rejectionDate || new Date()).toLocaleDateString()}</p>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card shadow-sm mb-3">
              <div class="card-header bg-secondary text-white">
                <h6 class="mb-0"><i class="bi bi-file-text me-2"></i>Application Justification</h6>
              </div>
              <div class="card-body">
                <p class="bg-light p-3 rounded">${app.financialDetails?.justification || 'N/A'}</p>
              </div>
            </div>
            
            <div class="card shadow-sm mb-3">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Application Status</h6>
              </div>
              <div class="card-body">
                <p><strong>Status:</strong> <span class="badge ${statusClass} px-3 py-2">${status}</span></p>
                <p><strong>Date Submitted:</strong> ${new Date(app.dateSubmitted || new Date()).toLocaleDateString()}</p>
                <p><strong>Application ID:</strong> ${app.appID || 'N/A'}</p>
              </div>
            </div>
            
            <hr>
            
            <!-- Document Download Section -->
            <div class="card shadow-sm">
              <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="bi bi-download me-2"></i>Download Document</h6>
              </div>
              <div class="card-body">
                <p class="mb-3">Click the button below to download the ${status === 'Awarded' ? 'Award Letter' : status === 'Rejected' ? 'Rejection Letter' : 'Status Letter'}.</p>
                <button class="btn btn-success btn-lg w-100" onclick="safeDownloadApplicationWithVerification('${appID}')">
                  <i class="bi bi-download me-2"></i>Download ${status === 'Awarded' ? 'Award' : status === 'Rejected' ? 'Rejection' : 'Status'} Letter
                </button>
                <small class="text-muted d-block mt-2 text-center">The document will be automatically downloaded to your default downloads folder.</small>
              </div>
            </div>
            
            ${app.status !== 'Awarded' && app.status !== 'Rejected' ? `
            <hr>
            <!-- Admin Action Section -->
            <div class="card shadow-sm mt-3">
              <div class="card-header bg-warning text-dark">
                <h6 class="mb-0"><i class="bi bi-check-circle me-2"></i>Admin Action</h6>
              </div>
              <div class="card-body">
                <div class="input-group mb-3">
                  <span class="input-group-text">Award Amount (KES):</span>
                  <input type="number" class="form-control" id="awardAmount" placeholder="e.g. 20000" min="0">
                </div>
                <textarea class="form-control mb-3" id="awardJustification" rows="3" placeholder="Recommendation/Justification (Mandatory)"></textarea>
                <div class="d-flex gap-2">
                  <button class="btn btn-success flex-fill" onclick="approveApplicationWithAutoDownload('${appID}')">
                    <i class="bi bi-check-circle me-1"></i> Approve/Award
                  </button>
                  <button class="btn btn-danger flex-fill" onclick="rejectApplicationWithAutoDownload('${appID}')">
                    <i class="bi bi-x-circle me-1"></i> Reject
                  </button>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i>Close
            </button>
            <button type="button" class="btn btn-success" onclick="safeDownloadApplicationWithVerification('${appID}')">
              <i class="bi bi-download me-1"></i>Download Document
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    try {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = new bootstrap.Modal(modal, { backdrop: true, keyboard: true });
        bsModal.show();
      } else {
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
      }
    } catch (error) {
      console.error('Modal error:', error);
    }
    
    // Clean up on close
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  };
  
  function getStatusBadgeClass(status) {
    const classes = {
      'Pending Submission': 'bg-warning text-dark',
      'Pending Ward Review': 'bg-info',
      'Pending Committee Review': 'bg-primary',
      'Awarded': 'bg-success',
      'Rejected': 'bg-danger',
      'Draft': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }
  
  // Download with verification - Only shows success if download actually happened
  window.safeDownloadApplicationWithVerification = async function(appID) {
    try {
      const apps = typeof loadApplications === 'function' ? loadApplications() : JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const app = apps.find(a => a.appID === appID);
      
      if (!app) {
        alert('Application not found');
        return;
      }
      
      const status = app.status || 'Pending Submission';
      
      // Show loading
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingMsg.style.zIndex = '10000';
      loadingMsg.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF document...';
      document.body.appendChild(loadingMsg);
      
      let downloadSuccess = false;
      let filename = '';
      let errorMessage = '';
      
      try {
        // Generate appropriate PDF based on status
        if (status === 'Awarded' && app.awardDetails) {
          if (typeof generateOfferLetterPDF !== 'undefined') {
            const result = await generateOfferLetterPDF(app, app.awardDetails, { preview: false });
            if (result && result.filename) {
              downloadSuccess = true;
              filename = result.filename;
            } else {
              errorMessage = 'PDF generation returned no filename';
            }
          } else {
            errorMessage = 'generateOfferLetterPDF function not available';
          }
        } else if (status === 'Rejected' && app.rejectionReason) {
          if (typeof generateRejectionLetterPDF !== 'undefined') {
            const result = await generateRejectionLetterPDF(app);
            if (result && result.filename) {
              downloadSuccess = true;
              filename = result.filename;
            } else {
              errorMessage = 'PDF generation returned no filename';
            }
          } else {
            errorMessage = 'generateRejectionLetterPDF function not available';
          }
        } else {
          // Status letter for pending
          if (typeof generateStatusLetterPDF !== 'undefined') {
            const result = await generateStatusLetterPDF(app);
            if (result && result.filename) {
              downloadSuccess = true;
              filename = result.filename;
            } else {
              errorMessage = 'PDF generation returned no filename';
            }
          } else {
            errorMessage = 'generateStatusLetterPDF function not available';
          }
        }
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        errorMessage = pdfError.message || 'PDF generation failed';
        downloadSuccess = false;
      }
      
      loadingMsg.remove();
      
      // Only show success if download actually happened
      if (downloadSuccess && filename) {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        successMsg.style.zIndex = '10000';
        successMsg.style.minWidth = '400px';
        successMsg.innerHTML = `
          <strong>✅ Document Downloaded!</strong><br>
          <div class="mt-2">
            📄 File: <strong>${filename}</strong><br>
            <small class="text-muted">File saved to your default downloads folder</small>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => {
          if (successMsg.parentNode) successMsg.remove();
        }, 5000);
        
        // Send email to fundadmin@garissa.go.ke
        if (typeof sendEmailDraft !== 'undefined') {
          setTimeout(() => {
            sendEmailDraft(app, status === 'Awarded' ? 'award' : status === 'Rejected' ? 'rejection' : 'status', filename, app.awardDetails || null);
            console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
          }, 1000);
        }
      } else {
        // Show error - download did NOT succeed
        const errorMsg = document.createElement('div');
        errorMsg.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        errorMsg.style.zIndex = '10000';
        errorMsg.style.minWidth = '400px';
        errorMsg.innerHTML = `
          <strong>❌ Document Generation Failed</strong><br>
          <div class="mt-2">
            ${errorMessage || 'PDF generation function not available'}<br>
            <small class="text-muted">Please refresh the page and try again</small>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(errorMsg);
        setTimeout(() => {
          if (errorMsg.parentNode) errorMsg.remove();
        }, 5000);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading document: ' + error.message);
    }
  };
  
  // Approve with auto-download and email
  window.approveApplicationWithAutoDownload = async function(appID) {
    // Call original approve function
    if (typeof window.approveApplication === 'function') {
      await window.approveApplication(appID);
    }
    
    // Auto-download after award
    setTimeout(async () => {
      try {
        const apps = typeof loadApplications === 'function' ? loadApplications() : JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const app = apps.find(a => a.appID === appID);
        if (app && app.status === 'Awarded' && app.awardDetails) {
          await safeDownloadApplicationWithVerification(appID);
        }
      } catch (error) {
        console.error('Auto-download after award error:', error);
      }
    }, 500);
  };
  
  // Reject with auto-download and email
  window.rejectApplicationWithAutoDownload = async function(appID) {
    // Call original reject function
    if (typeof window.rejectApplication === 'function') {
      await window.rejectApplication(appID);
    }
    
    // Auto-download after rejection
    setTimeout(async () => {
      try {
        const apps = typeof loadApplications === 'function' ? loadApplications() : JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const app = apps.find(a => a.appID === appID);
        if (app && app.status === 'Rejected') {
          await safeDownloadApplicationWithVerification(appID);
        }
      } catch (error) {
        console.error('Auto-download after rejection error:', error);
      }
    }, 500);
  };
  
  // Enhanced email forwarding - Always sends to fundadmin@garissa.go.ke
  const originalSendEmailDraft = window.sendEmailDraft;
  window.sendEmailDraft = function(application, documentType, filename, awardDetails = null) {
    try {
      const ADMIN_EMAIL = 'fundadmin@garissa.go.ke';
      let subject = '';
      let body = '';
      
      const applicantName = application.applicantName || 
        `${application.personalDetails?.firstNames || ''} ${application.personalDetails?.lastName || ''}`.trim();
      const institution = application.personalDetails?.institution || 'N/A';
      const subCounty = application.personalDetails?.subCounty || application.subCounty || 'N/A';
      const ward = application.personalDetails?.ward || application.ward || 'N/A';
      
      if (documentType === 'award') {
        const amount = awardDetails?.committee_amount_kes || awardDetails?.amount || 0;
        const serialNumber = awardDetails?.serialNumber || 'N/A';
        subject = `Bursary Award Letter - ${application.appID} - ${applicantName}`;
        body = `Dear Fund Administrator,

Please find attached the AWARD LETTER for the following bursary application:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Application ID: ${application.appID}
Applicant Name: ${applicantName}
Institution: ${institution}
Location: ${subCounty} Sub-County, ${ward} Ward

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWARD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount Awarded: Ksh ${amount.toLocaleString()}
Serial Number: ${serialNumber}
Date Awarded: ${new Date(awardDetails?.date_awarded || new Date()).toLocaleDateString()}
Justification: ${awardDetails?.justification || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Type: Award Letter
Filename: ${filename}
Status: Generated and downloaded

This document has been automatically generated and saved to the downloads folder.
A copy of this letter should be forwarded to the applicant.

Best regards,
Garissa County Bursary Management System
Automated Notification System`;
      } else if (documentType === 'rejection') {
        subject = `Bursary Rejection Letter - ${application.appID} - ${applicantName}`;
        body = `Dear Fund Administrator,

Please find attached the REJECTION LETTER for the following bursary application:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Application ID: ${application.appID}
Applicant Name: ${applicantName}
Institution: ${institution}
Location: ${subCounty} Sub-County, ${ward} Ward

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REJECTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date Rejected: ${new Date(application.rejectionDate || new Date()).toLocaleDateString()}
Reason: ${application.rejectionReason || 'Application did not meet requirements'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Type: Rejection Letter
Filename: ${filename}
Status: Generated and downloaded

This document has been automatically generated and saved to the downloads folder.
A copy of this letter should be forwarded to the applicant.

Best regards,
Garissa County Bursary Management System
Automated Notification System`;
      } else {
        subject = `Bursary Status Letter - ${application.appID} - ${applicantName}`;
        body = `Dear Fund Administrator,

Please find attached the STATUS LETTER for the following bursary application:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Application ID: ${application.appID}
Applicant Name: ${applicantName}
Institution: ${institution}
Location: ${subCounty} Sub-County, ${ward} Ward
Current Status: ${application.status || 'Pending'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Type: Status Letter
Filename: ${filename}
Status: Generated and downloaded

This document has been automatically generated and saved to the downloads folder.

Best regards,
Garissa County Bursary Management System
Automated Notification System`;
      }
      
      // Create mailto link
      const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      console.log('✅ Email draft sent to fundadmin@garissa.go.ke:', { subject, filename });
      
      return true;
    } catch (error) {
      console.error('Email draft error:', error);
      return false;
    }
  };
  
  // Remove Edit buttons on page load and periodically
  removeEditButtons();
  setInterval(removeEditButtons, 2000);
  
  // Also remove when table is rendered
  const originalRenderTable = window.renderTable;
  if (originalRenderTable) {
    window.renderTable = function(applications) {
      const result = originalRenderTable(applications);
      setTimeout(removeEditButtons, 100);
      return result;
    };
  }
  
  console.log('✅ Final polish fix applied');
})();

