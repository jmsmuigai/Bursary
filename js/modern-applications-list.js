// MODERN APPLICATIONS LIST - Card-based display with proper data structure
// This replaces the old table with a modern, responsive card layout
// Auto-syncs with Firebase and shows applications immediately when submitted

(function() {
  'use strict';
  
  console.log('🎨 MODERN APPLICATIONS LIST - Initializing...');
  
  // Create 20 new dummy records with proper structure
  window.createNewDummyRecords = async function() {
    console.log('📝 Creating 20 new dummy records...');
    
    const names = [
      { first: 'Ahmed', middle: 'Hassan', last: 'Mohamed', gender: 'Male' },
      { first: 'Amina', middle: 'Abdi', last: 'Ali', gender: 'Female' },
      { first: 'Omar', middle: 'Ibrahim', last: 'Hussein', gender: 'Male' },
      { first: 'Fatuma', middle: 'Mohamed', last: 'Abdi', gender: 'Female' },
      { first: 'Khalid', middle: 'Ahmed', last: 'Omar', gender: 'Male' },
      { first: 'Halima', middle: 'Hassan', last: 'Ibrahim', gender: 'Female' },
      { first: 'Abdullahi', middle: 'Ali', last: 'Mohamed', gender: 'Male' },
      { first: 'Khadija', middle: 'Omar', last: 'Ahmed', gender: 'Female' },
      { first: 'Mohamed', middle: 'Hassan', last: 'Abdi', gender: 'Male' },
      { first: 'Aisha', middle: 'Ibrahim', last: 'Ali', gender: 'Female' },
      { first: 'Ibrahim', middle: 'Mohamed', last: 'Hassan', gender: 'Male' },
      { first: 'Sahra', middle: 'Ahmed', last: 'Omar', gender: 'Female' },
      { first: 'Yusuf', middle: 'Abdi', last: 'Ibrahim', gender: 'Male' },
      { first: 'Maryam', middle: 'Hassan', last: 'Ali', gender: 'Female' },
      { first: 'Abdirahman', middle: 'Omar', last: 'Mohamed', gender: 'Male' },
      { first: 'Naima', middle: 'Ibrahim', last: 'Hassan', gender: 'Female' },
      { first: 'Hassan', middle: 'Ahmed', last: 'Abdi', gender: 'Male' },
      { first: 'Faduma', middle: 'Mohamed', last: 'Omar', gender: 'Female' },
      { first: 'Abdi', middle: 'Hassan', last: 'Ibrahim', gender: 'Male' },
      { first: 'Zainab', middle: 'Ali', last: 'Mohamed', gender: 'Female' }
    ];
    
    const subCounties = Object.keys(GARISSA_WARDS || {});
    const institutions = [
      'Garissa University', 'University of Nairobi', 'Kenyatta University',
      'Moi University', 'Technical University of Mombasa', 'Garissa Technical Training Institute'
    ];
    
    const statuses = [
      'Pending Ward Review', 'Pending Ward Review', 'Pending Committee Review',
      'Pending Committee Review', 'Awarded', 'Awarded', 'Rejected',
      'Pending Submission', 'Pending Ward Review', 'Pending Committee Review',
      'Pending Ward Review', 'Awarded', 'Pending Committee Review',
      'Rejected', 'Pending Submission', 'Pending Ward Review',
      'Awarded', 'Pending Committee Review', 'Pending Ward Review', 'Awarded'
    ];
    
    const newRecords = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const name = names[i];
      const subCounty = subCounties[i % subCounties.length];
      const wards = GARISSA_WARDS[subCounty] || [];
      const ward = wards[i % wards.length] || 'Other';
      const institution = institutions[i % institutions.length];
      const status = statuses[i];
      const amountRequested = 150000 + Math.floor(Math.random() * 100000);
      const feeBalance = amountRequested + Math.floor(Math.random() * 20000);
      const monthlyIncome = Math.floor(Math.random() * 15000) + 5000;
      
      const appID = `GSA/2025/${1000 + i}`;
      const idNumber = `${now.getFullYear()}${String(1000000 + i).padStart(7, '0')}`;
      const email = `dummy${i}@example.com`;
      
      const record = {
        appID: appID,
        applicantEmail: email,
        applicantName: `${name.first} ${name.middle} ${name.last}`,
        dateSubmitted: new Date(now.getTime() - (i * 86400000)).toISOString(),
        status: status,
        personalDetails: {
          firstNames: `${name.first} ${name.middle}`,
          lastName: name.last,
          gender: name.gender,
          subCounty: subCounty,
          ward: ward,
          institution: institution,
          regNumber: `REG/${now.getFullYear()}/${String(1000 + i).padStart(4, '0')}`,
          course: ['Medicine', 'Engineering', 'Education', 'Business', 'IT'][i % 5],
          yearOfStudy: (i % 4) + 1
        },
        financialDetails: {
          amountRequested: amountRequested,
          feeBalance: feeBalance,
          monthlyIncome: monthlyIncome,
          justification: `Financial need for ${institution} tuition fees. Family income is insufficient to cover educational expenses.`
        },
        idNumber: idNumber,
        nemisId: idNumber,
        birthCertificate: `BC/${now.getFullYear()}/${String(1000 + i).padStart(4, '0')}`,
        dateOfBirth: `${1995 + (i % 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        isFinalSubmission: true,
        isDummy: true
      };
      
      // Add award details if awarded
      if (status === 'Awarded') {
        record.awardDetails = {
          committee_amount_kes: Math.floor(amountRequested * 0.7),
          date_awarded: new Date(now.getTime() - (i * 86400000)).toISOString(),
          justification: 'Approved by committee',
          serialNumber: `GRS/Bursary/${String(i + 1).padStart(3, '0')}`,
          amount: Math.floor(amountRequested * 0.7)
        };
      }
      
      // Add rejection details if rejected
      if (status === 'Rejected') {
        record.rejectionDate = new Date(now.getTime() - (i * 86400000)).toISOString();
        record.rejectionReason = 'Does not meet eligibility criteria';
      }
      
      newRecords.push(record);
    }
    
    // Save to Firebase (or localStorage)
    try {
      if (typeof saveApplication !== 'undefined') {
        for (const record of newRecords) {
          await saveApplication(record);
        }
        console.log('✅ 20 new records saved to Firebase');
      } else {
        const existing = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const updated = [...existing, ...newRecords];
        localStorage.setItem('mbms_applications', JSON.stringify(updated));
        console.log('✅ 20 new records saved to localStorage');
      }
      
      // Trigger refresh
      if (typeof window.renderModernApplicationsList === 'function') {
        window.renderModernApplicationsList();
      }
      
      alert('✅ 20 new records created successfully!');
    } catch (error) {
      console.error('Error creating records:', error);
      alert('Error creating records: ' + error.message);
    }
  };
  
  // Render modern card-based list
  window.renderModernApplicationsList = function(applications = null) {
    console.log('🎨 Rendering modern applications list...');
    
    const container = document.getElementById('applicationsTableBody');
    if (!container) {
      console.error('❌ Container not found');
      return;
    }
    
    // Get applications if not provided
    if (!applications) {
      if (typeof loadApplications === 'function') {
        applications = loadApplications();
      } else {
        applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      }
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (!applications || applications.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center py-5">
            <i class="bi bi-inbox fs-1 d-block mb-3"></i>
            <h5>No Applications Found</h5>
            <p class="mb-0">Click "Create 20 New Records" to load sample data.</p>
          </div>
        </div>
      `;
      return;
    }
    
    // Sort by date (newest first)
    const sorted = [...applications].sort((a, b) => {
      const dateA = new Date(a.dateSubmitted || 0);
      const dateB = new Date(b.dateSubmitted || 0);
      return dateB - dateA;
    });
    
    console.log('✅ Rendering', sorted.length, 'applications as cards');
    
    // Create card grid
    sorted.forEach((app, index) => {
      const card = createApplicationCard(app, index + 1);
      container.appendChild(card);
    });
    
    console.log('✅ Modern list rendered successfully');
  };
  
  // Create individual application card
  function createApplicationCard(app, rowNumber) {
    const card = document.createElement('div');
    card.className = 'col-12 col-md-6 col-lg-4 mb-4';
    
    const status = app.status || 'Pending Submission';
    const statusClass = getStatusBadgeClass(status);
    const amount = app.financialDetails?.amountRequested || app.amountRequested || 0;
    const name = app.applicantName || `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'N/A';
    const subCounty = app.personalDetails?.subCounty || app.subCounty || 'N/A';
    const ward = app.personalDetails?.ward || app.ward || 'N/A';
    const institution = app.personalDetails?.institution || app.institution || 'N/A';
    const appID = app.appID || 'N/A';
    const serialNumber = app.awardDetails?.serialNumber || '';
    const isDummy = app.applicantEmail && app.applicantEmail.includes('example.com');
    
    // Escape for HTML
    const safeAppID = appID.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    const safeName = name.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    
    card.innerHTML = `
      <div class="card h-100 shadow-sm border-0" style="transition: transform 0.2s;">
        <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <div>
            <strong class="text-primary">#${rowNumber}</strong>
            <span class="badge ${statusClass} ms-2">${status}</span>
          </div>
          ${isDummy ? '<span class="badge bg-secondary">DUMMY</span>' : ''}
        </div>
        <div class="card-body">
          <h6 class="card-title mb-3">
            <i class="bi bi-person-circle me-2 text-primary"></i>${safeName}
          </h6>
          <div class="mb-2">
            <small class="text-muted d-block">
              <i class="bi bi-hash me-1"></i><strong>App ID:</strong> ${safeAppID}
            </small>
            ${serialNumber ? `<small class="text-muted d-block"><i class="bi bi-tag me-1"></i><strong>Serial:</strong> ${serialNumber}</small>` : ''}
          </div>
          <hr class="my-2">
          <div class="mb-2">
            <small class="text-muted d-block">
              <i class="bi bi-geo-alt me-1"></i><strong>Location:</strong> ${subCounty} / ${ward}
            </small>
            <small class="text-muted d-block">
              <i class="bi bi-building me-1"></i><strong>Institution:</strong> ${institution}
            </small>
            <small class="text-muted d-block">
              <i class="bi bi-cash-coin me-1"></i><strong>Amount:</strong> Ksh ${amount.toLocaleString()}
            </small>
          </div>
        </div>
        <div class="card-footer bg-white border-top">
          <div class="d-grid gap-2">
            <button class="btn btn-sm btn-info action-btn-view" data-appid="${safeAppID}" title="View Application Details">
              <i class="bi bi-eye me-1"></i>View
            </button>
            <button class="btn btn-sm btn-success action-btn-download" data-appid="${safeAppID}" data-status="${status}" title="Download ${status === 'Awarded' ? 'Award' : status === 'Rejected' ? 'Rejection' : 'Status'} Letter">
              <i class="bi bi-download me-1"></i>Download
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add hover effect
    const cardElement = card.querySelector('.card');
    if (cardElement) {
      cardElement.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
      });
      cardElement.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    }
    
    return card;
  }
  
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
  
  // Setup event delegation for buttons
  function setupCardButtonListeners() {
    const container = document.getElementById('applicationsTableBody');
    if (!container) return;
    
    // Remove old listeners
    container.replaceWith(container.cloneNode(true));
    const newContainer = document.getElementById('applicationsTableBody');
    
    // View button
    newContainer.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn-view');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const appID = btn.getAttribute('data-appid');
      if (!appID) return;
      
      console.log('👁️ View button clicked for:', appID);
      
      if (typeof window.viewApplication === 'function') {
        window.viewApplication(appID);
      } else {
        alert('View function not available. Please refresh the page.');
      }
    });
    
    // Download button
    newContainer.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn-download');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const appID = btn.getAttribute('data-appid');
      const status = btn.getAttribute('data-status');
      
      if (!appID) return;
      
      console.log('📥 Download button clicked for:', appID, 'Status:', status);
      
      // Auto-generate and download the appropriate letter
      downloadApplicationLetter(appID, status);
    });
    
    console.log('✅ Card button listeners attached');
  }
  
  // Download application letter based on status
  async function downloadApplicationLetter(appID, status) {
    try {
      // Get application
      let apps = [];
      if (typeof loadApplications === 'function') {
        apps = loadApplications();
      } else {
        apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      }
      
      const app = apps.find(a => a.appID === appID);
      if (!app) {
        alert('Application not found');
        return;
      }
      
      // Show loading
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingMsg.style.zIndex = '9999';
      loadingMsg.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating document...';
      document.body.appendChild(loadingMsg);
      
      let result = null;
      let filename = '';
      
      // Generate appropriate letter based on status
      if (status === 'Awarded' && app.awardDetails) {
        if (typeof generateOfferLetterPDF !== 'undefined') {
          result = await generateOfferLetterPDF(app, app.awardDetails, { preview: false });
          filename = result?.filename || `Award_Letter_${appID}.pdf`;
        }
      } else if (status === 'Rejected' && app.rejectionReason) {
        if (typeof generateRejectionLetterPDF !== 'undefined') {
          result = await generateRejectionLetterPDF(app);
          filename = result?.filename || `Rejection_Letter_${appID}.pdf`;
        }
      } else {
        // Status letter for pending applications
        if (typeof generateStatusLetterPDF !== 'undefined') {
          result = await generateStatusLetterPDF(app);
          filename = result?.filename || `Status_Letter_${appID}.pdf`;
        }
      }
      
      loadingMsg.remove();
      
      if (result && result.filename) {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        successMsg.style.zIndex = '9999';
        successMsg.style.minWidth = '400px';
        successMsg.innerHTML = `
          <strong>✅ Document Downloaded!</strong><br>
          <div class="mt-2">
            📄 File: <strong>${result.filename}</strong><br>
            <small class="text-muted">File saved to your default downloads folder</small>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successMsg);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          successMsg.remove();
        }, 5000);
        
        console.log('✅ Document downloaded:', result.filename);
      } else {
        alert('⚠️ Document generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading document: ' + error.message);
    }
  }
  
  // Make download function global
  window.downloadApplicationLetter = downloadApplicationLetter;
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        setupCardButtonListeners();
        if (typeof window.renderModernApplicationsList === 'function') {
          window.renderModernApplicationsList();
        }
      }, 1000);
    });
  } else {
    setTimeout(() => {
      setupCardButtonListeners();
      if (typeof window.renderModernApplicationsList === 'function') {
        window.renderModernApplicationsList();
      }
    }, 1000);
  }
  
  // Listen for new applications (Firebase sync)
  window.addEventListener('storage', function(e) {
    if (e.key === 'mbms_applications') {
      console.log('🔄 Applications updated - refreshing list...');
      setTimeout(() => {
        if (typeof window.renderModernApplicationsList === 'function') {
          window.renderModernApplicationsList();
        }
      }, 100);
    }
  });
  
  // Listen for custom update events
  window.addEventListener('mbms-data-updated', function(e) {
    if (e.detail && e.detail.key === 'mbms_applications') {
      console.log('🔄 Applications updated via event - refreshing list...');
      setTimeout(() => {
        if (typeof window.renderModernApplicationsList === 'function') {
          window.renderModernApplicationsList();
        }
      }, 100);
    }
  });
  
  console.log('✅ Modern applications list system initialized');
})();

