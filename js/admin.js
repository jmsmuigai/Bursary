// Enhanced Admin Dashboard with Full Functionality
(function() {
  // Prevent multiple initializations
  if (window.adminDashboardInitialized) {
    console.warn('Admin dashboard already initialized');
    return;
  }
  window.adminDashboardInitialized = true;

  // Check admin access
  try {
    const adminStr = sessionStorage.getItem('mbms_admin');
    if (!adminStr) {
      alert('Access denied. Admin login required.');
      window.location.href = 'index.html';
      return;
    }

    const admin = JSON.parse(adminStr);
    const adminEmailEl = document.getElementById('adminEmail');
    if (adminEmailEl) {
      adminEmailEl.textContent = admin.email;
    }
  } catch (error) {
    console.error('Admin access check error:', error);
    alert('Error loading admin session. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  // Load applications from localStorage (all applications, no filtering)
  function loadApplications() {
    try {
      const appsStr = localStorage.getItem('mbms_applications');
      if (!appsStr) {
        console.log('No applications in localStorage');
        return [];
      }
      
      const apps = JSON.parse(appsStr);
      
      // Validate apps array
      if (!Array.isArray(apps)) {
        console.error('Applications data is not an array:', apps);
        return [];
      }
      
      console.log('✅ Loaded', apps.length, 'applications from localStorage');
      
      // Ensure all applications have required fields for backward compatibility
      return apps.map((app, index) => {
        // Ensure appID exists
        if (!app.appID) {
          app.appID = `GSA/${new Date().getFullYear()}/${(index + 1).toString().padStart(4, '0')}`;
        }
        
        // Ensure status exists
        if (!app.status) {
          app.status = 'Pending Submission';
        }
        // If application doesn't have location data, try to get from user registration
        if (!app.subCounty && !app.personalDetails?.subCounty) {
          const users = loadUsers();
          const user = users.find(u => u.email === app.applicantEmail);
          if (user) {
            app.subCounty = user.subCounty || 'N/A';
            app.ward = user.ward || 'N/A';
            if (!app.personalDetails) app.personalDetails = {};
            app.personalDetails.subCounty = user.subCounty || 'N/A';
            app.personalDetails.ward = user.ward || 'N/A';
          }
        }
        return app;
      });
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  }
  
  // Debug function to check localStorage
  window.debugApplications = function() {
    const apps = localStorage.getItem('mbms_applications');
    const users = localStorage.getItem('mbms_users');
    console.log('Applications in localStorage:', apps ? JSON.parse(apps).length : 0);
    console.log('Users in localStorage:', users ? JSON.parse(users).length : 0);
    console.log('Full applications:', JSON.parse(apps || '[]'));
    alert(`Applications found: ${apps ? JSON.parse(apps).length : 0}\nCheck browser console (F12) for details.`);
  };

  // Load users to get applicant details
  function loadUsers() {
    return JSON.parse(localStorage.getItem('mbms_users') || '[]');
  }

  // Get application counter
  function getApplicationCounter() {
    return parseInt(localStorage.getItem('mbms_application_counter') || '0');
  }

  // Update metrics
  function updateMetrics() {
    const apps = loadApplications();
    const counter = getApplicationCounter();
    
    document.getElementById('metricTotal').textContent = counter || apps.length;
    document.getElementById('counterValue').textContent = counter || apps.length;
    document.getElementById('metricPending').textContent = apps.filter(a => 
      a.status?.includes('Pending') || a.status === 'Pending Submission'
    ).length;
    document.getElementById('metricAwarded').textContent = apps.filter(a => 
      a.status === 'Awarded'
    ).length;
    
    // Calculate total funds allocated (use awarded amounts, not requested)
    const awarded = apps.filter(a => a.status === 'Awarded' && a.awardDetails);
    const totalFunds = awarded.reduce((sum, app) => {
      const amount = app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0;
      return sum + amount;
    }, 0);
    document.getElementById('metricFunds').textContent = `Ksh ${totalFunds.toLocaleString()}`;
    
    // Update budget display immediately
    updateBudgetDisplay();
  }
  
  // Update budget display with accurate calculations
  function updateBudgetDisplay() {
    if (typeof getBudgetBalance === 'undefined') return;
    
    // Recalculate budget from actual awarded applications (most accurate)
    if (typeof syncBudgetWithAwards !== 'undefined') {
      syncBudgetWithAwards();
    }
    
    const budget = getBudgetBalance();
    const status = getBudgetStatus();
    
    // Formula: Balance = Total Budget - Allocated Amount
    const calculatedBalance = budget.total - budget.allocated;
    
    // Update budget card with accurate values
    const budgetTotalEl = document.getElementById('budgetTotal');
    const budgetAllocatedEl = document.getElementById('budgetAllocated');
    const budgetBalanceEl = document.getElementById('budgetBalance');
    const budgetPercentageEl = document.getElementById('budgetPercentage');
    
    if (budgetTotalEl) budgetTotalEl.textContent = `Ksh ${budget.total.toLocaleString()}`;
    if (budgetAllocatedEl) budgetAllocatedEl.textContent = `Ksh ${budget.allocated.toLocaleString()}`;
    if (budgetBalanceEl) budgetBalanceEl.textContent = `Ksh ${calculatedBalance.toLocaleString()}`;
    if (budgetPercentageEl) budgetPercentageEl.textContent = status.percentage.toFixed(1) + '%';
    
    // Update progress bar with dynamic colors
    const progressBar = document.getElementById('budgetProgressBar');
    if (progressBar) {
      const percentage = Math.min(status.percentage, 100);
      progressBar.style.width = percentage + '%';
      progressBar.setAttribute('aria-valuenow', percentage);
      progressBar.setAttribute('aria-valuemin', 0);
      progressBar.setAttribute('aria-valuemax', 100);
      
      // Dynamic color based on utilization (real-time updates)
        const budgetCard = document.getElementById('budgetCard');
      if (status.isExhausted || calculatedBalance <= 0) {
        // Dark red when exhausted
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#8b0000'; // Dark red
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #8b0000 0%, #6b0000 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else if (percentage >= 90) {
        // Red when 90%+ used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#dc3545';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else if (percentage >= 75) {
        // Orange when 75-90% used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#fd7e14';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
      } else if (percentage >= 50) {
        // Yellow when 50-75% used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#ffc107';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
      } else {
        // Green when <50% used
        progressBar.className = 'progress-bar bg-success';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
      } else if (status.isLow) {
        progressBar.className = 'progress-bar bg-warning';
        const budgetCard = document.getElementById('budgetCard');
        if (budgetCard) budgetCard.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
      } else {
        progressBar.className = 'progress-bar bg-success';
        const budgetCard = document.getElementById('budgetCard');
        if (budgetCard) budgetCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    }
    
    console.log('Budget Updated:', {
      total: budget.total,
      allocated: budget.allocated,
      balance: calculatedBalance,
      percentage: status.percentage.toFixed(2) + '%',
      formula: `${budget.total} - ${budget.allocated} = ${calculatedBalance}`
    });
  }

  // Populate filters
  function populateFilters() {
    const scSel = document.getElementById('filterSubCounty');
    const wardSel = document.getElementById('filterWard');
    
    scSel.innerHTML = '<option value="">All Sub-Counties</option>';
    Object.keys(GARISSA_WARDS).forEach(sc => {
      scSel.add(new Option(sc, sc));
    });
    scSel.add(new Option('Other', 'Other'));

    function populateFilterWards() {
      wardSel.innerHTML = '<option value="">All Wards</option>';
      const wards = GARISSA_WARDS[scSel.value] || [];
      wards.forEach(w => wardSel.add(new Option(w, w)));
      wardSel.add(new Option('Other', 'Other'));
    }
    
    scSel.addEventListener('change', populateFilterWards);
    populateFilterWards();
  }

  // Render applications table
  function renderTable(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) {
      console.error('Table body not found');
      return;
    }
    
    tbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No applications found. Applications will appear here once submitted.</td></tr>';
      return;
    }

    // Sort by date submitted (newest first)
    const sortedApps = [...applications].sort((a, b) => {
      const dateA = new Date(a.dateSubmitted || 0);
      const dateB = new Date(b.dateSubmitted || 0);
      return dateB - dateA;
    });

    sortedApps.forEach(app => {
      const tr = document.createElement('tr');
      const status = app.status || 'Pending Submission';
      const statusClass = getStatusBadgeClass(status);
      const amount = app.financialDetails?.amountRequested || app.amountRequested || 0;
      const name = app.applicantName || `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'N/A';
      const location = app.personalDetails?.subCounty || app.subCounty || 'N/A';
      const ward = app.personalDetails?.ward || app.ward || 'N/A';
      const institution = app.personalDetails?.institution || app.institution || 'N/A';

      const serialNumber = app.awardDetails?.serialNumber || '';
      const appID = app.appID || 'N/A';
      
      // Escape quotes in onclick handlers
      const safeAppID = appID.replace(/'/g, "\\'");
      const safeName = name.replace(/'/g, "\\'");
      
      tr.innerHTML = `
        <td><strong>${appID}</strong>${serialNumber ? `<br><small class="text-muted">Serial: ${serialNumber}</small>` : ''}</td>
        <td>${name}</td>
        <td>${location} / ${ward}</td>
        <td>${institution}</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
        <td>Ksh ${amount.toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewApplication('${safeAppID}')" title="View Application Details">
            <i class="bi bi-eye"></i> View
          </button>
          <button class="btn btn-sm btn-success" onclick="downloadApplicationLetter('${safeAppID}')" title="Download ${status === 'Awarded' ? 'Award' : status === 'Rejected' ? 'Rejection' : 'Status'} Letter">
              <i class="bi bi-download"></i> Download
            </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
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

  // Apply filters
  function applyFilters() {
    const apps = loadApplications();
    const filterSubCounty = document.getElementById('filterSubCounty').value;
    const filterWard = document.getElementById('filterWard').value;
    const filterStatus = document.getElementById('filterStatus').value;

    let filtered = apps;

    if (filterSubCounty) {
      filtered = filtered.filter(a => {
        const sc = a.personalDetails?.subCounty || a.subCounty;
        return sc === filterSubCounty || (filterSubCounty === 'Other' && !Object.keys(GARISSA_WARDS).includes(sc));
      });
    }

    if (filterWard) {
      filtered = filtered.filter(a => {
        const w = a.personalDetails?.ward || a.ward;
        return w === filterWard || (filterWard === 'Other' && !GARISSA_WARDS[filterSubCounty]?.includes(w));
      });
    }

    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    renderTable(filtered);
  }

  // View application modal
  window.viewApplication = function(appID) {
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (!app) {
      alert('Application not found');
      return;
    }

    // Create and show modal (simplified - in production use Bootstrap modal)
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Application Details - ${app.appID}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Applicant Information</h6>
                <p><strong>Name:</strong> ${app.applicantName || 'N/A'}</p>
                <p><strong>Location:</strong> ${app.personalDetails?.subCounty || 'N/A'}, ${app.personalDetails?.ward || 'N/A'}</p>
                <p><strong>Institution:</strong> ${app.personalDetails?.institution || 'N/A'}</p>
                <p><strong>Registration No:</strong> ${app.personalDetails?.regNumber || 'N/A'}</p>
              </div>
              <div class="col-md-6">
                <h6>Financial Summary</h6>
                <p><strong>Fee Balance:</strong> Ksh ${(app.financialDetails?.feeBalance || 0).toLocaleString()}</p>
                <p><strong>Amount Requested:</strong> Ksh ${(app.financialDetails?.amountRequested || 0).toLocaleString()}</p>
                <p><strong>Monthly Income:</strong> Ksh ${(app.financialDetails?.monthlyIncome || 0).toLocaleString()}</p>
              </div>
            </div>
            <hr>
            <h6>Justification</h6>
            <p class="bg-light p-3 rounded">${app.financialDetails?.justification || 'N/A'}</p>
            <hr>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Actions</h6>
              <button class="btn btn-sm btn-outline-primary" onclick="downloadApplicationPDFFromView('${appID}')" title="Download Application as PDF">
                <i class="bi bi-download me-1"></i>Download PDF
              </button>
            </div>
            <h6>Admin Action</h6>
            <div class="input-group mb-3">
              <span class="input-group-text">Award Amount (KES):</span>
              <input type="number" class="form-control" id="awardAmount" placeholder="e.g. 20000" min="0">
            </div>
            <textarea class="form-control mb-3" id="awardJustification" rows="3" placeholder="Recommendation/Justification (Mandatory)"></textarea>
            <div class="d-flex gap-2">
              <button class="btn btn-success" onclick="approveApplication('${appID}')">
                <i class="bi bi-check-circle"></i> Approve/Award
              </button>
              <button class="btn btn-danger" onclick="rejectApplication('${appID}')">
                <i class="bi bi-x-circle"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  };

  // Approve application - works for all statuses
  window.approveApplication = async function(appID) {
    // Handle if appID is an object (error case)
    if (typeof appID === 'object') {
      console.error('Invalid appID (object):', appID);
      alert('⚠️ Invalid application ID. Please refresh the page and try again.');
      return;
    }
    
    // Get admin email from session
    let adminEmail = 'fundadmin@garissa.go.ke';
    try {
      const adminStr = sessionStorage.getItem('mbms_admin');
      if (adminStr) {
        const admin = JSON.parse(adminStr);
        adminEmail = admin.email || adminEmail;
      }
    } catch (e) {
      console.warn('Could not get admin email:', e);
    }
    
    const awardAmountInput = document.getElementById('awardAmount');
    const justificationInput = document.getElementById('awardJustification');
    
    if (!awardAmountInput || !justificationInput) {
      alert('⚠️ Award form not found. Please refresh the page.');
      return;
    }

    const awardAmount = parseFloat(awardAmountInput.value);
    const justification = justificationInput.value.trim();
    
    if (isNaN(awardAmount) || awardAmount <= 0) {
      alert('⚠️ Please enter a valid award amount (greater than 0).');
      awardAmountInput.focus();
      return;
    }
    
    if (!justification) {
      alert('⚠️ Justification is required. Please provide a reason for this award.');
      justificationInput.focus();
      return;
    }
    
    // Check budget availability (recalculate first)
    if (typeof checkBudgetAvailable !== 'undefined') {
      if (typeof syncBudgetWithAwards !== 'undefined') {
      syncBudgetWithAwards(); // Sync before checking
      }
      const budgetCheck = checkBudgetAvailable(awardAmount);
      if (!budgetCheck.available) {
        const budget = getBudgetBalance();
        const available = budget.total - budget.allocated;
        alert(`❌ INSUFFICIENT BUDGET!\n\n${budgetCheck.message}\n\nTotal Budget: Ksh ${budget.total.toLocaleString()}\nAlready Allocated: Ksh ${budget.allocated.toLocaleString()}\nAvailable: Ksh ${available.toLocaleString()}\nRequested: Ksh ${awardAmount.toLocaleString()}\n\nPlease reduce the award amount or contact finance department.`);
        return;
      }
    }
    
    if (!confirm(`Are you sure you want to award Ksh ${awardAmount.toLocaleString()} to this applicant?`)) {
      return;
    }

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    
    if (!app) {
      alert('⚠️ Application not found.');
      return;
    }
    
      // Get serial number before awarding
      const serialNumber = getNextSerialNumber();
      
      // Allocate budget FIRST (before updating application)
      let budgetStatus = null;
      if (typeof allocateBudget !== 'undefined') {
        try {
          budgetStatus = allocateBudget(awardAmount);
          console.log('Budget allocated:', budgetStatus);
        } catch (error) {
          alert('❌ Budget Allocation Error: ' + error.message);
          return;
        }
      }
      
    // Update application status (works for all statuses)
      app.status = 'Awarded';
      app.awardDetails = {
        committee_amount_kes: awardAmount,
        date_awarded: new Date().toISOString(),
        justification: justification,
      admin_assigned_uid: adminEmail,
        serialNumber: serialNumber,
        amount: awardAmount // For compatibility
      };
      
      // Save applications
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      
      // Force budget sync to ensure accuracy
      if (typeof syncBudgetWithAwards !== 'undefined') {
        syncBudgetWithAwards();
      }
      
      // Update metrics and budget display IMMEDIATELY (real-time)
      updateMetrics();
      updateBudgetDisplay();
      applyFilters();
      refreshApplications(); // Force table refresh
      
      // Force immediate UI refresh
      setTimeout(() => {
        updateMetrics();
        updateBudgetDisplay();
        refreshApplications(); // Ensure table is updated
      }, 100);
      
      // Trigger storage event for multi-device sync
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'awarded', appID: appID }
      }));
      
      // Get updated budget status
      const updatedBudget = getBudgetBalance();
      const updatedStatus = getBudgetStatus();
      const remainingBalance = updatedBudget.total - updatedBudget.allocated;
      
      // Check if budget is exhausted or low
      if (updatedStatus.isExhausted || remainingBalance <= 0) {
        alert('⚠️ BUDGET EXHAUSTED!\n\nNo more budget available. Please contact finance department to replenish funds.');
      } else if (updatedStatus.isLow) {
        alert('⚠️ LOW BUDGET WARNING!\n\nOnly ' + updatedStatus.percentage.toFixed(1) + '% budget remaining.\nRemaining: Ksh ' + remainingBalance.toLocaleString());
      }
      
      // Close the view modal first
      const viewModal = document.querySelector('.modal');
      if (viewModal) {
        bootstrap.Modal.getInstance(viewModal).hide();
      }
      
      // Notify admin via email
      if (typeof notifyAdminAwarded !== 'undefined') {
        notifyAdminAwarded(app, app.awardDetails);
      }
      
      // Auto-download award letter immediately
      try {
        await downloadPDFDirect(app, app.awardDetails);
      } catch (pdfError) {
        console.error('PDF download error:', pdfError);
        // Continue even if PDF fails
      }
      
      // Send email draft with award letter
      setTimeout(() => {
        if (typeof sendEmailDraft !== 'undefined') {
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          const filename = `Garissa_Bursary_Award_${sanitizedName}_${serialNumber}_${app.appID}.pdf`;
          sendEmailDraft(app, 'award', filename, app.awardDetails);
        }
      }, 2000);
      
      // Show success message
      alert('✅ Successfully awarded!\n\n📄 Serial Number: ' + serialNumber + '\n💰 Amount Awarded: Ksh ' + awardAmount.toLocaleString() + '\n📊 Budget Remaining: Ksh ' + remainingBalance.toLocaleString() + '\n📧 Copy sent to fundadmin@garissa.go.ke\n\n📥 Award letter has been automatically downloaded!');
      
      // Refresh display
      refreshApplications();
    }
  };

  // Reject application
  window.rejectApplication = function(appID) {
    const rejectionReason = prompt('Please provide a reason for rejection (this will be included in the rejection letter):');
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required. Please provide a reason.');
      return;
    }

    if (!confirm('Are you sure you want to reject this application?')) return;

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app) {
      app.status = 'Rejected';
      app.rejectionDate = new Date().toISOString();
      app.rejectionReason = rejectionReason.trim();
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      
      // Budget remains unchanged when rejecting (only changes when awarding)
      // No need to update budget - it stays the same
      const budget = getBudgetBalance();
      const remainingBalance = budget.total - budget.allocated;
      
      // Notify admin via email
      if (typeof notifyAdminRejected !== 'undefined') {
        notifyAdminRejected(app);
      }
      
      // Update metrics and display (budget stays same)
      updateMetrics();
      updateBudgetDisplay(); // Refresh display but budget unchanged
      applyFilters();
      refreshApplications();
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'rejected', appID: appID }
      }));
      
      alert('✅ Application rejected successfully!\n\n💰 Budget remains unchanged (Ksh ' + remainingBalance.toLocaleString() + ' available)\n📧 Email notification sent to fundadmin@garissa.go.ke\n\nRejection letter can be downloaded from the applications list.');
      
      const viewModal = document.querySelector('.modal');
      if (viewModal) {
        bootstrap.Modal.getInstance(viewModal).hide();
      }
    }
  };

  // Download application PDF from view modal
  window.downloadApplicationPDFFromView = async function(appID) {
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (!app) {
      alert('Application not found');
      return;
    }

    // Download application summary PDF
    if (typeof downloadApplicationSummaryPDF !== 'undefined') {
      await downloadApplicationSummaryPDF(app);
    } else {
      // Fallback to letter download
      await downloadApplicationLetter(appID);
    }
  };

  // Download application letter (works for all statuses: Awarded, Rejected, Pending)
  window.downloadApplicationLetter = async function(appID) {
    try {
      const apps = loadApplications();
      if (!apps || apps.length === 0) {
        alert('⚠️ No applications found. Please load demo data or wait for applications to be submitted.');
        return;
      }
      
      // Handle if appID is an object (error case)
      if (typeof appID === 'object') {
        console.error('Invalid appID (object):', appID);
        alert('⚠️ Invalid application ID. Please refresh the page and try again.');
        return;
      }
      
    const app = apps.find(a => a.appID === appID);
      
      if (!app) {
        console.error('Application not found. AppID:', appID);
        console.log('Available applications:', apps.map(a => a.appID));
        alert('⚠️ Application not found.\n\nApplication ID: ' + appID + '\n\nPlease refresh the page and try again.');
      return;
    }

      // Show loading indicator
      const loadingAlert = document.createElement('div');
      loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingAlert.style.zIndex = '9999';
      loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating and downloading PDF...';
      document.body.appendChild(loadingAlert);

      if (app.status === 'Awarded') {
        // Download award letter
    if (!app.awardDetails) {
          loadingAlert.remove();
      alert('⚠️ Award details not found. Please award this application first.');
      return;
    }

      const awardDetails = {
        ...app.awardDetails,
        serialNumber: app.awardDetails.serialNumber || getNextSerialNumber()
      };
      
      await downloadPDFDirect(app, awardDetails);
        loadingAlert.remove();
      } else if (app.status === 'Rejected') {
        // Download rejection letter
        await downloadRejectionLetter(app);
        loadingAlert.remove();
      } else {
        // Download status letter for pending applications
        await downloadStatusLetter(app);
        loadingAlert.remove();
      }
    } catch (error) {
      console.error('PDF download error:', error);
      const loadingAlert = document.querySelector('.alert-info');
      if (loadingAlert) loadingAlert.remove();
      alert('❌ Error downloading PDF. Please try again or contact support.\n\nError: ' + error.message);
    }
  };
  
  // Legacy functions for backward compatibility
  window.previewPDFLetter = async function(appID) {
    // Redirect to download for awarded applications
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app && app.status === 'Awarded') {
      await downloadApplicationLetter(appID);
    } else {
      alert('⚠️ Preview is only available for awarded applications. Use Download instead.');
    }
  };
  
  window.downloadPDFDirect = async function(appID) {
    await downloadApplicationLetter(appID);
  };
  
  window.downloadPDF = window.downloadApplicationLetter;

  // Generate comprehensive summary report
  window.generateSummaryReport = function() {
    const apps = loadApplications();
    const budget = getBudgetBalance();
    
    // Calculate statistics
    const totalApps = apps.length;
    const pendingApps = apps.filter(a => a.status?.includes('Pending') || a.status === 'Pending Submission').length;
    const awardedApps = apps.filter(a => a.status === 'Awarded').length;
    const rejectedApps = apps.filter(a => a.status === 'Rejected').length;
    
    const awarded = apps.filter(a => a.status === 'Awarded' && a.awardDetails);
    const totalAwarded = awarded.reduce((sum, app) => {
      return sum + (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
    }, 0);
    
    const avgAward = awarded.length > 0 ? totalAwarded / awarded.length : 0;
    const maxAward = Math.max(...awarded.map(a => a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), 0);
    const minAward = Math.min(...awarded.map(a => a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), totalAwarded);
    
    // Sub-county breakdown
    const subCountyBreakdown = {};
    awarded.forEach(app => {
      const sc = app.personalDetails?.subCounty || app.subCounty || 'N/A';
      if (!subCountyBreakdown[sc]) {
        subCountyBreakdown[sc] = { count: 0, total: 0 };
      }
      subCountyBreakdown[sc].count++;
      subCountyBreakdown[sc].total += (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
    });
    
    // Gender breakdown
    const genderBreakdown = { Male: 0, Female: 0, 'N/A': 0 };
    awarded.forEach(app => {
      const gender = app.personalDetails?.gender || 'N/A';
      genderBreakdown[gender] = (genderBreakdown[gender] || 0) + 1;
    });
    
    // Display summary cards
    const summaryCards = document.getElementById('summaryCards');
    if (summaryCards) {
      summaryCards.innerHTML = `
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Total Applications</h6>
              <h2 class="fw-bold">${totalApps}</h2>
              <small>Pending: ${pendingApps} | Awarded: ${awardedApps} | Rejected: ${rejectedApps}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Total Awarded</h6>
              <h2 class="fw-bold">Ksh ${totalAwarded.toLocaleString()}</h2>
              <small>Avg: Ksh ${Math.round(avgAward).toLocaleString()} | Range: ${minAward.toLocaleString()} - ${maxAward.toLocaleString()}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Budget Utilization</h6>
              <h2 class="fw-bold">${((budget.allocated / budget.total) * 100).toFixed(1)}%</h2>
              <small>Remaining: Ksh ${(budget.total - budget.allocated).toLocaleString()}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Awarded Beneficiaries</h6>
              <h2 class="fw-bold">${awardedApps}</h2>
              <small>Male: ${genderBreakdown.Male} | Female: ${genderBreakdown.Female}</small>
            </div>
          </div>
        </div>
        <div class="col-12 mt-3">
          <div class="card shadow-sm">
            <div class="card-header bg-primary-700 text-white">
              <h6 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Sub-County Allocation Breakdown</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Sub-County</th>
                      <th class="text-end">Beneficiaries</th>
                      <th class="text-end">Total Amount</th>
                      <th class="text-end">Average Award</th>
                      <th class="text-end">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(subCountyBreakdown).map(([sc, data]) => `
                      <tr>
                        <td><strong>${sc}</strong></td>
                        <td class="text-end">${data.count}</td>
                        <td class="text-end">Ksh ${data.total.toLocaleString()}</td>
                        <td class="text-end">Ksh ${Math.round(data.total / data.count).toLocaleString()}</td>
                        <td class="text-end">${((data.total / totalAwarded) * 100).toFixed(1)}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Scroll to reports section
    setTimeout(() => {
      const reportsSection = document.getElementById('reports');
      if (reportsSection) {
        reportsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Export to Excel/CSV with error handling
  try {
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
      downloadReportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        try {
          const reportType = document.getElementById('reportType')?.value || 'beneficiary';
          const reportStatus = document.getElementById('reportStatus')?.value || 'all';
          const apps = loadApplications();
          
          let filtered = apps;
          if (reportStatus === 'Awarded') {
            filtered = apps.filter(a => a.status === 'Awarded');
          } else if (reportStatus === 'Pending') {
            filtered = apps.filter(a => a.status?.includes('Pending') || a.status === 'Pending Submission');
          } else if (reportStatus === 'Rejected') {
            filtered = apps.filter(a => a.status === 'Rejected');
          }

          let rows = [];
          let filename = '';
          
          if (reportType === 'beneficiaries') {
            rows = [['Serial No', 'App ID', 'Applicant Name', 'Sub-County', 'Ward', 'Institution', 'Status', 'Amount Requested', 'Awarded Amount', 'Date Submitted', 'Date Awarded']];
          // Include ALL applications, not just filtered
          const allAppsForExport = reportStatus === 'all' ? apps : filtered;
          allAppsForExport.forEach(app => {
            rows.push([
                app.awardDetails?.serialNumber || 'N/A',
              app.appID || 'N/A',
              app.applicantName || 'N/A',
              app.personalDetails?.subCounty || app.subCounty || 'N/A',
              app.personalDetails?.ward || app.ward || 'N/A',
              app.personalDetails?.institution || app.institution || 'N/A',
              app.status || 'N/A',
              (app.financialDetails?.amountRequested || 0).toString(),
              (app.awardDetails?.committee_amount_kes || 0).toString(),
                new Date(app.dateSubmitted).toLocaleDateString(),
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
            ]);
          });
            filename = `garissa_bursary_beneficiaries_${new Date().toISOString().split('T')[0]}.csv`;
            console.log(`✅ CSV Export: ${allAppsForExport.length} applications exported`);
          } else if (reportType === 'allocation') {
            rows = [['Sub-County', 'Ward', 'Applicant Name', 'Institution', 'Amount Requested', 'Amount Awarded', 'Serial Number', 'Date Awarded']];
            const awarded = filtered.filter(a => a.status === 'Awarded');
            awarded.forEach(app => {
              rows.push([
                app.personalDetails?.subCounty || app.subCounty || 'N/A',
                app.personalDetails?.ward || app.ward || 'N/A',
                app.applicantName || 'N/A',
                app.personalDetails?.institution || app.institution || 'N/A',
                (app.financialDetails?.amountRequested || 0).toString(),
                (app.awardDetails?.committee_amount_kes || 0).toString(),
                app.awardDetails?.serialNumber || 'N/A',
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
              ]);
            });
            filename = `garissa_bursary_allocation_${new Date().toISOString().split('T')[0]}.csv`;
          } else if (reportType === 'demographics') {
            rows = [['Sub-County', 'Ward', 'Applicant Name', 'Gender', 'Education Level', 'Institution', 'Status', 'Amount Awarded']];
            filtered.forEach(app => {
              rows.push([
                app.personalDetails?.subCounty || app.subCounty || 'N/A',
                app.personalDetails?.ward || app.ward || 'N/A',
                app.applicantName || 'N/A',
                app.personalDetails?.gender || 'N/A',
                app.personalDetails?.courseNature || app.personalDetails?.yearForm || 'N/A',
                app.personalDetails?.institution || app.institution || 'N/A',
                app.status || 'N/A',
                (app.awardDetails?.committee_amount_kes || 0).toString()
              ]);
            });
            filename = `garissa_bursary_demographics_${new Date().toISOString().split('T')[0]}.csv`;
          } else if (reportType === 'budget') {
            const budget = getBudgetBalance();
            rows = [
              ['Budget Report', ''],
              ['Total Budget', budget.total.toString()],
              ['Total Allocated', budget.allocated.toString()],
              ['Remaining Balance', (budget.total - budget.allocated).toString()],
              ['Utilization Percentage', ((budget.allocated / budget.total) * 100).toFixed(2) + '%'],
              ['', ''],
              ['Awarded Applications Breakdown', ''],
              ['Serial No', 'Applicant Name', 'Amount Awarded', 'Date Awarded']
            ];
            const awarded = apps.filter(a => a.status === 'Awarded' && a.awardDetails);
            awarded.forEach(app => {
              rows.push([
                app.awardDetails?.serialNumber || 'N/A',
                app.applicantName || 'N/A',
                (app.awardDetails?.committee_amount_kes || 0).toString(),
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
              ]);
            });
            filename = `garissa_bursary_budget_${new Date().toISOString().split('T')[0]}.csv`;
          }

          if (typeof downloadCSV === 'function') {
            downloadCSV(filename, rows);
            
            // Notify admin via email
            if (typeof notifyAdminReportGenerated !== 'undefined') {
              const reportSummary = {
                type: reportType,
                status: reportStatus,
                recordCount: filtered.length,
                generatedDate: new Date().toLocaleString()
              };
              notifyAdminReportGenerated(reportType, reportSummary);
            }
            
            alert(`✅ Report downloaded successfully!\n\nFile: ${filename}\n📧 Email notification sent to fundadmin@garissa.go.ke`);
          } else {
            alert('CSV download function not available. Please refresh the page.');
          }
        } catch (error) {
          console.error('Report download error:', error);
          alert('Error generating report. Please try again.');
        }
      });
    }
  } catch (error) {
    console.error('Report button setup error:', error);
  }

  // Change admin password
  window.changeAdminPassword = function() {
    const currentPassword = prompt('Enter current password:');
    if (!currentPassword) return;

    // Verify current password
    if (currentPassword !== '@Omar.123!') {
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminUser = users.find(u => u.email === 'fundadmin@garissa.go.ke' && u.role === 'admin');
      if (!adminUser || adminUser.password !== currentPassword) {
        alert('❌ Current password is incorrect.');
        return;
      }
    }

    const newPassword = prompt('Enter new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('❌ Password must be at least 8 characters long.');
      return;
    }

    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match.');
      return;
    }

    // Update password
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminUser = users.find(u => u.email === 'fundadmin@garissa.go.ke' && u.role === 'admin');
    if (adminUser) {
      adminUser.password = newPassword;
      localStorage.setItem('mbms_users', JSON.stringify(users));
      alert('✅ Password changed successfully! Please login again with your new password.');
      sessionStorage.clear();
      window.location.href = 'index.html';
    } else {
      // Create admin user if doesn't exist
      users.push({
        email: 'fundadmin@garissa.go.ke',
        password: newPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('mbms_users', JSON.stringify(users));
      alert('✅ Password set successfully! Please login again.');
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  };

  // Refresh applications display (force reload from localStorage)
  window.refreshApplications = function() {
    try {
      console.log('Refreshing applications...');
      
      // Force reload from localStorage
      const apps = loadApplications();
      console.log('Loaded applications:', apps.length);
      
      if (apps.length > 0) {
        console.log('Sample application:', apps[0]);
        console.log('All applications:', apps);
      } else {
        console.log('No applications found in localStorage');
        // Check if data exists in localStorage
        const rawData = localStorage.getItem('mbms_applications');
        console.log('Raw localStorage data:', rawData ? 'exists' : 'missing');
        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            console.log('Parsed data:', parsed.length, 'items');
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
      
      // Sync budget
      if (typeof syncBudgetWithAwards !== 'undefined') {
        try {
          syncBudgetWithAwards();
        } catch (e) {
          console.error('Budget sync error:', e);
        }
      }
      
      // Update everything with error handling
      try {
        updateMetrics();
        console.log('Metrics updated');
      } catch (e) {
        console.error('Metrics update error:', e);
      }
      
      try {
        updateBudgetDisplay();
        console.log('Budget display updated');
      } catch (e) {
        console.error('Budget display update error:', e);
      }
      
      try {
        renderTable(apps); // Show all applications by default
        console.log('Table rendered with', apps.length, 'applications');
      } catch (e) {
        console.error('Table render error:', e);
      }
      
      // Apply filters to show all
      try {
        applyFilters();
      } catch (e) {
        console.error('Filter apply error:', e);
      }
      
      // Show refresh confirmation
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Refreshed!';
        refreshBtn.classList.add('btn-success');
        refreshBtn.classList.remove('btn-outline-primary');
        setTimeout(() => {
          if (refreshBtn) {
            refreshBtn.innerHTML = originalText;
            refreshBtn.classList.remove('btn-success');
            refreshBtn.classList.add('btn-outline-primary');
          }
        }, 2000);
      }
      
      return apps;
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Error refreshing applications. Please try again.\n\nError: ' + error.message);
      return [];
    }
  };

  // DISABLED: Auto-refresh to prevent page freezing
  // Manual refresh available via Refresh button
  // Auto-refresh can be re-enabled if needed, but currently disabled for stability

  // Initialize budget
  if (typeof initializeBudget !== 'undefined') {
    initializeBudget();
  }
  
  // Function to load demo data and refresh display
  // Load test data and refresh (5 records: 3 Rejected, 2 Pending)
  window.loadTestDataAndRefresh = function() {
    try {
      console.log('🔄 Loading test data...');
      
      // Clear the flag to allow reloading
      localStorage.removeItem('mbms_test_data_loaded');
      
      if (typeof initializeTestData === 'function') {
        const loaded = initializeTestData();
        if (loaded) {
          localStorage.setItem('mbms_test_data_loaded', 'loaded');
          
          // Force refresh display immediately
          const allApps = loadApplications();
          console.log('✅ Test data loaded:', allApps.length, 'applications');
          console.log('Applications:', allApps.map(a => ({ id: a.appID, status: a.status, name: a.applicantName })));
          
          // Update everything
          updateMetrics();
          updateBudgetDisplay();
          renderTable(allApps);
          applyFilters();
          
          // Update session storage
          sessionStorage.setItem('mbms_last_app_count', allApps.length.toString());
          
          // Generate summary report
          setTimeout(() => {
            if (typeof generateSummaryReport === 'function') {
              generateSummaryReport();
            }
          }, 500);
          
          // Force another refresh to ensure display
          setTimeout(() => {
            const verifyApps = loadApplications();
            updateMetrics();
            updateBudgetDisplay();
            renderTable(verifyApps);
            console.log('✅ Forced refresh completed with', verifyApps.length, 'applications');
          }, 500);
          
          alert('✅ Test Data Loaded Successfully!\n\n📊 5 applications created:\n   • 3 Rejected\n   • 2 Pending\n\n💰 Budget: KSH 50,000,000 (unchanged - no awards)\n\n✅ All records visible in dashboard and Excel export');
        } else {
          // Try to reload existing test data
          const existingApps = loadApplications();
          if (existingApps.length > 0) {
            updateMetrics();
            updateBudgetDisplay();
            renderTable(existingApps);
            applyFilters();
            alert('✅ Test data already exists. Display refreshed!\n\n📊 ' + existingApps.length + ' applications found');
          } else {
            alert('⚠️ Test data could not be loaded. Please check console for errors.');
          }
        }
      } else {
        console.error('initializeTestData function not found');
        alert('❌ Test data function not available. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('Error loading test data:', error);
      alert('❌ Error loading test data: ' + error.message);
    }
  };
  
  window.loadDemoDataAndRefresh = function() {
    try {
      console.log('Loading demo data...');
      
      if (typeof initializeDummyData === 'function') {
        const loaded = initializeDummyData();
        if (loaded) {
          console.log('Demo data loaded, refreshing display...');
          
          // Wait a moment for localStorage to be updated
          setTimeout(() => {
            // Force refresh all displays
            const allApps = loadApplications();
            console.log('Applications loaded after demo data:', allApps.length);
            
            // Update metrics
            if (typeof updateMetrics === 'function') {
              updateMetrics();
            }
            
            // Update budget display
            if (typeof updateBudgetDisplay === 'function') {
              updateBudgetDisplay();
            }
            
            // Render table with all applications
            if (typeof renderTable === 'function') {
              renderTable(allApps);
              console.log('Table rendered with', allApps.length, 'applications');
            }
            
            // Apply filters (this will show all by default)
            if (typeof applyFilters === 'function') {
              applyFilters();
            }
            
            // Generate summary report
            setTimeout(() => {
              if (typeof generateSummaryReport === 'function') {
                generateSummaryReport();
              }
            }, 500);
            
            // Scroll to applications section
            const appsSection = document.getElementById('apps');
            if (appsSection) {
              appsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } else {
          console.log('Demo data not loaded (user cancelled or error)');
        }
      } else {
        console.error('initializeDummyData function not found');
        alert('❌ Demo data function not available. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
      alert('❌ Error loading demo data: ' + error.message);
    }
  };
  
  // Initialize
  populateFilters();
  
  // Load and display all applications on page load
  let allApps = loadApplications();
  console.log('Initial applications loaded:', allApps.length);
  
  // AUTO-LOAD DUMMY DATA if no applications exist (like it was before)
  if (allApps.length === 0 && typeof initializeDummyData === 'function') {
    console.log('🔄 No applications found. Auto-loading dummy data (10 records)...');
    setTimeout(() => {
      try {
        if (initializeDummyData()) {
          // Reload applications
          allApps = loadApplications();
          console.log('✅ Dummy data loaded:', allApps.length, 'applications');
          
          // Refresh all displays
          updateMetrics();
          updateBudgetDisplay();
          renderTable(allApps);
          applyFilters();
          
          // Update session storage
          sessionStorage.setItem('mbms_last_app_count', allApps.length.toString());
          
          // Show notification
          const notification = document.createElement('div');
          notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
          notification.style.zIndex = '9999';
          notification.style.minWidth = '450px';
          notification.innerHTML = `
            <strong>✅ Demo Data Auto-Loaded!</strong><br>
            10 sample applications created (5 Awarded, 3 Pending, 1 Rejected, 1 Pending Submission)
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 5000);
          
          // Generate summary report
          if (typeof generateSummaryReport === 'function') {
            setTimeout(() => generateSummaryReport(), 500);
          }
        }
      } catch (error) {
        console.error('Error auto-loading dummy data:', error);
      }
    }, 300);
  }
  
  // Legacy check (removed - using simple auto-load above)
  if (false && allApps.length === 0 && typeof initializeDummyData === 'function') {
    // Auto-load demo data immediately (for testing/demo purposes)
    console.log('No applications found. Auto-loading demo data...');
    setTimeout(() => {
      try {
        // Generate and save dummy data
        if (typeof generateDummyApplications === 'function') {
          const dummyApps = generateDummyApplications();
          localStorage.setItem('mbms_applications', JSON.stringify(dummyApps));
          localStorage.setItem('mbms_application_counter', '10');
          localStorage.setItem('mbms_last_serial', '10');
          
          // Initialize budget
          if (typeof initializeBudget !== 'undefined') {
            initializeBudget();
          }
          if (typeof syncBudgetWithAwards !== 'undefined') {
            syncBudgetWithAwards();
          }
          
          // Reload and refresh display
          const newApps = loadApplications();
          console.log('Demo data auto-loaded:', newApps.length, 'applications');
          
          updateMetrics();
          updateBudgetDisplay();
          renderTable(newApps);
          applyFilters();
          
          // Generate summary report
          if (typeof generateSummaryReport === 'function') {
            setTimeout(() => generateSummaryReport(), 500);
          }
          
          // Show notification
          const notification = document.createElement('div');
          notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
          notification.style.zIndex = '9999';
          notification.style.minWidth = '400px';
          notification.innerHTML = `
            <strong>✅ Demo Data Auto-Loaded!</strong><br>
            10 sample applications created (5 Awarded, 3 Pending, 1 Rejected, 1 Pending Submission)
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 5000);
        }
      } catch (error) {
        console.error('Error auto-loading demo data:', error);
      }
    }, 500);
  }
  
  // Auto-generate summary report on load if there are applications
  if (allApps.length > 0) {
    console.log('Applications found:', allApps.map(a => ({ id: a.appID, status: a.status, name: a.applicantName })));
    // Generate summary report after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (typeof generateSummaryReport === 'function') {
        generateSummaryReport();
      }
    }, 500);
  }
  
  // Initial display - ensure applications are shown
  console.log('📊 Initializing dashboard with', allApps.length, 'applications');
  
  if (allApps.length > 0) {
    console.log('✅ Sample applications:', allApps.slice(0, 3).map(a => ({
      id: a.appID,
      name: a.applicantName,
      status: a.status
    })));
  } else {
    console.log('⚠️ No applications found - test data should load automatically');
  }
  
  // ALWAYS update and render, even if empty (test data will load)
  updateMetrics();
  updateBudgetDisplay();
  renderTable(allApps);
  
  // Store initial count for comparison
  sessionStorage.setItem('mbms_last_app_count', allApps.length.toString());
  
  console.log('✅ Admin dashboard initialized with', allApps.length, 'applications');
  
  // Force multiple refreshes to ensure test data appears
  setTimeout(() => {
    const verifyApps = loadApplications();
    console.log('🔄 Refresh check 1:', verifyApps.length, 'applications');
    if (verifyApps.length > 0) {
      updateMetrics();
      updateBudgetDisplay();
      renderTable(verifyApps);
      sessionStorage.setItem('mbms_last_app_count', verifyApps.length.toString());
    }
  }, 500);
  
  // Removed duplicate refresh - single refresh is enough
  
  // Expose a global function to manually refresh everything
  window.forceRefreshAll = function() {
    console.log('🔄 Force refreshing all displays...');
    
    // Clear any cached data
    const apps = loadApplications();
    console.log('📊 Loaded', apps.length, 'applications from localStorage');
    
    if (apps.length > 0) {
      console.log('Sample applications:', apps.slice(0, 3).map(a => ({
        id: a.appID,
        name: a.applicantName,
        status: a.status
      })));
    }
    
    // Force update everything
    updateMetrics();
    updateBudgetDisplay();
    renderTable(apps);
    applyFilters();
    
    // Update session storage
    sessionStorage.setItem('mbms_last_app_count', apps.length.toString());
    
    // Generate summary report
    if (typeof generateSummaryReport === 'function') {
      setTimeout(() => generateSummaryReport(), 500);
    }
    
    // Force another refresh after short delay
    setTimeout(() => {
      const verifyApps = loadApplications();
      updateMetrics();
      updateBudgetDisplay();
      renderTable(verifyApps);
      console.log('✅ Force refresh completed with', verifyApps.length, 'applications');
    }, 500);
    
    alert(`✅ Display Force Refreshed!\n\n📊 Found ${apps.length} applications in the system.\n\nAll data updated and displayed.`);
  };
  
  // Real-time budget updates - listen for storage changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'mbms_applications' || e.key === 'mbms_budget') {
      console.log('Storage changed, updating budget...');
      updateMetrics();
      updateBudgetDisplay();
      refreshApplications();
    }
  });
  
  // Listen for custom data update events (including new submissions)
  window.addEventListener('mbms-data-updated', function(e) {
    console.log('Data updated event:', e.detail);
    updateMetrics();
    updateBudgetDisplay();
    if (e.detail && (e.detail.action === 'awarded' || e.detail.action === 'rejected' || e.detail.action === 'submitted')) {
      refreshApplications();
    }
  });
  
  // Real-time update interval (every 2 seconds) for multi-tab sync and new submissions
  setInterval(function() {
    try {
      const apps = loadApplications();
      const currentCount = apps.length;
      const lastCount = parseInt(sessionStorage.getItem('mbms_last_app_count') || '0');
      
      if (currentCount !== lastCount) {
        console.log('🔄 New application detected! Count changed from', lastCount, 'to', currentCount);
        sessionStorage.setItem('mbms_last_app_count', currentCount.toString());
        
        // Force full refresh
        updateMetrics();
        updateBudgetDisplay();
        renderTable(apps); // Render all applications
        applyFilters(); // Apply current filters
        
        // Show notification if new applications added
        if (currentCount > lastCount) {
          const newCount = currentCount - lastCount;
          console.log(`✅ ${newCount} new application(s) detected and displayed!`);
        }
      } else {
        // Still update metrics and budget periodically (for budget changes)
        updateMetrics();
        updateBudgetDisplay();
      }
    } catch (error) {
      console.error('Error in real-time update interval:', error);
    }
  }, 2000);
  
  // Check budget status on load
  if (typeof getBudgetStatus !== 'undefined') {
    const status = getBudgetStatus();
    if (status.isExhausted) {
      setTimeout(() => {
        alert('⚠️ BUDGET EXHAUSTED!\n\nNo more budget available. Please contact finance department.');
      }, 1000);
    } else if (status.isLow) {
      setTimeout(() => {
        alert('⚠️ LOW BUDGET WARNING!\n\nOnly ' + status.percentage.toFixed(1) + '% budget remaining.\nRemaining: Ksh ' + status.balance.toLocaleString());
      }, 1000);
    }
  }
  
  // Add visibility to window for debugging
  window.debugAdmin = function() {
    const apps = loadApplications();
    const budget = getBudgetBalance();
    console.log('=== ADMIN DEBUG ===');
    console.log('Applications:', apps.length, apps);
    console.log('Budget:', budget);
    console.log('localStorage keys:', Object.keys(localStorage).filter(k => k.startsWith('mbms')));
    alert(`Applications: ${apps.length}\nBudget Allocated: Ksh ${budget.allocated.toLocaleString()}\nBudget Balance: Ksh ${budget.balance.toLocaleString()}\n\nCheck console (F12) for details.`);
  };

  // Smooth scroll function for sidebar navigation - SIMPLIFIED
  window.scrollToSection = function(sectionId) {
    try {
      // Prevent default behavior
      event?.preventDefault();
      
      // Find the section
      const section = document.getElementById(sectionId);
      if (!section) {
        console.warn('Section not found:', sectionId);
        return false;
      }
      
      // Simple scroll - no animation to prevent blocking
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      // Update active nav link
      setTimeout(() => {
        try {
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        } catch (e) {
          // Ignore nav update errors
        }
      }, 100);
      
      return false;
    } catch (error) {
      console.error('Scroll error:', error);
      return false;
    }
  };

  // Sidebar navigation - SIMPLE AND RELIABLE (works immediately)
  function setupSidebarNavigation() {
    try {
      // Sidebar links - use event delegation for reliability
      const sidebarNav = document.getElementById('sidebarNav');
      if (sidebarNav) {
        sidebarNav.addEventListener('click', function(e) {
          const link = e.target.closest('.sidebar-link');
          if (link) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = link.getAttribute('data-section');
            if (sectionId) {
              const section = document.getElementById(sectionId);
              if (section) {
                // Simple scroll - no animation to prevent blocking
                section.scrollIntoView({ behavior: 'auto', block: 'start' });
                
                // Update active state
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
              }
            }
          }
        });
      }
      
      // Change Password link
      const changePasswordLink = document.getElementById('changePasswordLink');
      if (changePasswordLink) {
        changePasswordLink.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof changeAdminPassword === 'function') {
            changeAdminPassword();
          }
        });
      }
      
      // Sign Out link
      const signOutLink = document.getElementById('signOutLink');
      if (signOutLink) {
        signOutLink.addEventListener('click', function(e) {
          sessionStorage.clear();
          // Let the link navigate naturally
        });
      }
    } catch (error) {
      console.error('Sidebar navigation setup error:', error);
    }
  }
  
  // Setup immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarNavigation);
  } else {
    setupSidebarNavigation();
  }

  // Filter event listeners with error handling
  try {
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          applyFilters();
        } catch (error) {
          console.error('Filter error:', error);
          alert('Error applying filters. Please try again.');
        }
      });
    }
    
    const filterSubCounty = document.getElementById('filterSubCounty');
    if (filterSubCounty) {
      filterSubCounty.addEventListener('change', function() {
        try {
          const wardSel = document.getElementById('filterWard');
          if (wardSel) {
            wardSel.innerHTML = '<option value="">All Wards</option>';
            const wards = GARISSA_WARDS[this.value] || [];
            wards.forEach(w => wardSel.add(new Option(w, w)));
            wardSel.add(new Option('Other', 'Other'));
          }
        } catch (error) {
          console.error('Filter ward update error:', error);
        }
      });
    }
  } catch (error) {
    console.error('Event listener setup error:', error);
  }
})();
