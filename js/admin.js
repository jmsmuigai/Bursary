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
      console.log('Loaded applications from localStorage:', apps.length);
      
      // Ensure all applications have required fields for backward compatibility
      return apps.map(app => {
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
    
    // Update progress bar
    const progressBar = document.getElementById('budgetProgressBar');
    if (progressBar) {
      progressBar.style.width = Math.min(status.percentage, 100) + '%';
      progressBar.setAttribute('aria-valuenow', status.percentage);
      progressBar.setAttribute('aria-valuemin', 0);
      progressBar.setAttribute('aria-valuemax', 100);
      
      // Change color based on utilization
      if (status.isExhausted || calculatedBalance <= 0) {
        progressBar.className = 'progress-bar bg-danger';
        const budgetCard = document.getElementById('budgetCard');
        if (budgetCard) budgetCard.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
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
      tr.innerHTML = `
        <td><strong>${app.appID || 'N/A'}</strong>${serialNumber ? `<br><small class="text-muted">Serial: ${serialNumber}</small>` : ''}</td>
        <td>${name}</td>
        <td>${location} / ${ward}</td>
        <td>${institution}</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
        <td>Ksh ${amount.toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewApplication('${app.appID}')" title="View Details">
            <i class="bi bi-eye"></i> View
          </button>
          ${status === 'Awarded' ? `
            <button class="btn btn-sm btn-primary me-1" onclick="previewPDFLetter('${app.appID}')" title="Preview & Print PDF">
              <i class="bi bi-eye"></i> Preview
            </button>
            <button class="btn btn-sm btn-success" onclick="downloadPDFDirect('${app.appID}')" title="Download PDF">
              <i class="bi bi-download"></i> Download
            </button>
          ` : ''}
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

  // Approve application
  window.approveApplication = async function(appID) {
    const amount = document.getElementById('awardAmount').value;
    const justification = document.getElementById('awardJustification').value;

    if (!amount || !justification) {
      alert('Please enter award amount and justification');
      return;
    }

    const awardAmount = parseInt(amount);
    
    if (isNaN(awardAmount) || awardAmount <= 0) {
      alert('Please enter a valid award amount greater than 0');
      return;
    }
    
    // Check budget availability (recalculate first)
    if (typeof checkBudgetAvailable !== 'undefined') {
      syncBudgetWithAwards(); // Sync before checking
      if (!checkBudgetAvailable(awardAmount)) {
        const budget = getBudgetBalance();
        const available = budget.total - budget.allocated;
        alert(`❌ Insufficient Budget!\n\nTotal Budget: Ksh ${budget.total.toLocaleString()}\nAlready Allocated: Ksh ${budget.allocated.toLocaleString()}\nAvailable: Ksh ${available.toLocaleString()}\nRequested: Ksh ${awardAmount.toLocaleString()}\n\nPlease reduce the award amount or contact finance department.`);
        return;
      }
    }

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app) {
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
      
      // Update application status
      app.status = 'Awarded';
      app.awardDetails = {
        committee_amount_kes: awardAmount,
        date_awarded: new Date().toISOString(),
        justification: justification,
        admin_assigned_uid: admin.email,
        serialNumber: serialNumber,
        amount: awardAmount // For compatibility
      };
      
      // Save applications
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      
      // Force budget sync to ensure accuracy
      if (typeof syncBudgetWithAwards !== 'undefined') {
        syncBudgetWithAwards();
      }
      
      // Update metrics and budget display IMMEDIATELY
      updateMetrics();
      updateBudgetDisplay();
      applyFilters();
      
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
      
      // Generate and preview PDF offer letter
      try {
        await previewPDF(app, app.awardDetails);
        alert('✅ Application awarded successfully!\n\n📄 Serial Number: ' + serialNumber + '\n💰 Amount Awarded: Ksh ' + awardAmount.toLocaleString() + '\n📊 Budget Remaining: Ksh ' + remainingBalance.toLocaleString() + '\n\nPDF preview is now open. You can print or download it.');
      } catch (error) {
        console.error('PDF generation error:', error);
        alert('✅ Application awarded successfully!\n\n📄 Serial Number: ' + serialNumber + '\n💰 Amount Awarded: Ksh ' + awardAmount.toLocaleString() + '\n📊 Budget Remaining: Ksh ' + remainingBalance.toLocaleString() + '\n\n⚠️ PDF preview failed. You can generate it later from the applications list.');
      }
    }
  };

  // Reject application
  window.rejectApplication = function(appID) {
    if (!confirm('Are you sure you want to reject this application?')) return;

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app) {
      app.status = 'Rejected';
      app.rejectionDate = new Date().toISOString();
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      updateMetrics();
      applyFilters();
      alert('Application rejected');
      bootstrap.Modal.getInstance(document.querySelector('.modal')).hide();
    }
  };

  // Preview PDF offer letter (with print option)
  window.previewPDFLetter = async function(appID) {
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (!app || app.status !== 'Awarded') {
      alert('⚠️ This application has not been awarded yet. Please award it first to generate the offer letter.');
      return;
    }

    if (!app.awardDetails) {
      alert('⚠️ Award details not found. Please award this application first.');
      return;
    }

    try {
      // Use the serial number from award details if available
      const awardDetails = {
        ...app.awardDetails,
        serialNumber: app.awardDetails.serialNumber || getNextSerialNumber()
      };
      
      await previewPDF(app, awardDetails);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('❌ Error generating PDF preview. Please try again or contact support.\n\nError: ' + error.message);
    }
  };
  
  // Direct download PDF (without preview)
  window.downloadPDFDirect = async function(appID) {
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (!app || app.status !== 'Awarded') {
      alert('⚠️ This application has not been awarded yet. Please award it first to generate the offer letter.');
      return;
    }

    if (!app.awardDetails) {
      alert('⚠️ Award details not found. Please award this application first.');
      return;
    }

    try {
      const awardDetails = {
        ...app.awardDetails,
        serialNumber: app.awardDetails.serialNumber || getNextSerialNumber()
      };
      
      await downloadPDFDirect(app, awardDetails);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('❌ Error downloading PDF. Please try again or contact support.\n\nError: ' + error.message);
    }
  };
  
  // Legacy function for backward compatibility
  window.downloadPDF = window.previewPDFLetter;

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
          }

          const rows = [['App ID', 'Applicant Name', 'Sub-County', 'Ward', 'Institution', 'Status', 'Amount Requested', 'Awarded Amount', 'Date Submitted']];
          
          filtered.forEach(app => {
            rows.push([
              app.appID || 'N/A',
              app.applicantName || 'N/A',
              app.personalDetails?.subCounty || app.subCounty || 'N/A',
              app.personalDetails?.ward || app.ward || 'N/A',
              app.personalDetails?.institution || app.institution || 'N/A',
              app.status || 'N/A',
              (app.financialDetails?.amountRequested || 0).toString(),
              (app.awardDetails?.committee_amount_kes || 0).toString(),
              new Date(app.dateSubmitted).toLocaleDateString()
            ]);
          });

          const filename = `garissa_bursary_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
          if (typeof downloadCSV === 'function') {
            downloadCSV(filename, rows);
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
      } catch (e) {
        console.error('Metrics update error:', e);
      }
      
      try {
        updateBudgetDisplay();
      } catch (e) {
        console.error('Budget display update error:', e);
      }
      
      try {
        renderTable(apps); // Show all applications by default
      } catch (e) {
        console.error('Table render error:', e);
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
      alert('Error refreshing applications. Please try again.');
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
  
  // Initialize
  populateFilters();
  
  // Load and display all applications on page load
  const allApps = loadApplications();
  console.log('Initial applications loaded:', allApps.length);
  
  if (allApps.length > 0) {
    console.log('Applications found:', allApps.map(a => ({ id: a.appID, status: a.status, name: a.applicantName })));
  }
  
  updateMetrics();
  renderTable(allApps);
  
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

  // Sidebar navigation - SIMPLE AND RELIABLE
  document.addEventListener('DOMContentLoaded', function() {
    try {
      // Sidebar links
      document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const sectionId = this.getAttribute('data-section');
          if (sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
              // Simple scroll - no animation
              section.scrollIntoView({ behavior: 'auto', block: 'start' });
              
              // Update active state
              document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
              this.classList.add('active');
            }
          }
        });
      });
      
      // Change Password link
      const changePasswordLink = document.getElementById('changePasswordLink');
      if (changePasswordLink) {
        changePasswordLink.addEventListener('click', function(e) {
          e.preventDefault();
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
  });

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
