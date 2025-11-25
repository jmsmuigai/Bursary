// Enhanced Admin Dashboard with Full Functionality
(function() {
  // Prevent multiple initializations
  if (window.adminDashboardInitialized) {
    console.warn('Admin dashboard already initialized');
    return;
  }
  
  // Wait for DOM to be ready before initializing
  function initAdminDashboard() {
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
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #fd7e14 0%, #ff9800 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else if (percentage >= 50) {
        // Yellow when 50-75% used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#ffc107';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else {
        // Green when <50% used
        progressBar.className = 'progress-bar bg-success';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
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

  // Populate filters with all sub-counties and wards - ENHANCED
  function populateFilters() {
    const scSel = document.getElementById('filterSubCounty');
    const wardSel = document.getElementById('filterWard');
    
    if (!scSel || !wardSel) {
      console.error('Filter elements not found');
      return;
    }
    
    // Populate sub-counties - ALL Garissa sub-counties with "Other" option
    scSel.innerHTML = '<option value="">All Sub-Counties</option>';
    if (typeof GARISSA_WARDS !== 'undefined') {
      const subCounties = Object.keys(GARISSA_WARDS);
      subCounties.forEach(sc => {
        const option = new Option(sc, sc);
        scSel.add(option);
      });
    }
    scSel.add(new Option('Other', 'Other'));
    console.log('✅ Sub-county filter populated with', (typeof GARISSA_WARDS !== 'undefined' ? Object.keys(GARISSA_WARDS).length : 0) + 1, 'options (including Other)');

    // Function to populate wards based on selected sub-county - ALL wards
    function populateFilterWards() {
      wardSel.innerHTML = '<option value="">All Wards</option>';
      const selectedSubCounty = scSel.value;
      
      if (selectedSubCounty && selectedSubCounty !== 'Other' && GARISSA_WARDS[selectedSubCounty]) {
        // Show wards for selected sub-county
        const wards = GARISSA_WARDS[selectedSubCounty];
        wards.forEach(w => wardSel.add(new Option(w, w)));
      } else if (selectedSubCounty === '') {
        // If no sub-county selected, show ALL wards from ALL sub-counties
        const allWards = [];
        Object.values(GARISSA_WARDS).forEach(wardArray => {
          wardArray.forEach(ward => {
            if (!allWards.includes(ward)) {
              allWards.push(ward);
            }
          });
        });
        allWards.sort().forEach(w => wardSel.add(new Option(w, w)));
      }
      
      // Always add "Other" option for typing custom ward
      wardSel.add(new Option('Other', 'Other'));
      console.log('✅ Ward filter populated with', (selectedSubCounty && selectedSubCounty !== 'Other' && GARISSA_WARDS[selectedSubCounty] ? GARISSA_WARDS[selectedSubCounty].length : (typeof GARISSA_WARDS !== 'undefined' ? [...new Set(Object.values(GARISSA_WARDS).flat())].length : 0)) + 1, 'options (including Other)');
      
      // Enable/disable based on selection
      wardSel.disabled = false;
    }
    
    // Handle sub-county change - update wards and apply filters
    scSel.addEventListener('change', function() {
      populateFilterWards();
      // Auto-apply filters when sub-county changes
      setTimeout(() => applyFilters(), 100);
    });
    
    // Handle ward change - apply filters
    wardSel.addEventListener('change', function() {
      setTimeout(() => applyFilters(), 100);
    });
    
    // Handle status change - apply filters
    if (statusSel) {
      statusSel.addEventListener('change', function() {
        setTimeout(() => applyFilters(), 100);
      });
    }
    
    // Find and attach Apply Filters button
    const applyFiltersBtn = document.getElementById('applyFiltersBtn') || 
                           document.querySelector('button[onclick*="applyFilters"]') ||
                           document.querySelector('button:contains("Apply Filters")');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', function(e) {
        e.preventDefault();
        applyFilters();
      });
    }
    
    populateFilterWards(); // Initial population
    console.log('✅ All filter event listeners attached');
  }

  // Render applications table - ENHANCED with better logging and Excel-like format
  function renderTable(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) {
      console.error('❌ Table body not found - element ID: applicationsTableBody');
      // Try to find it again after a short delay
      setTimeout(() => {
        const retryTbody = document.getElementById('applicationsTableBody');
        if (retryTbody) {
          console.log('✅ Table body found on retry');
          renderTable(applications);
        } else {
          console.error('❌ Table body still not found after retry');
        }
      }, 100);
      return;
    }
    
    console.log('🔄 RENDERING TABLE with', applications?.length || 0, 'applications');
    console.log('Applications data:', applications);
    
    // Clear table
    tbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      console.log('⚠️ No applications to render - showing empty message');
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><i class="bi bi-inbox me-2"></i>No applications found. Click "Load Demo Data" button to load sample data.</td></tr>';
      return;
    }
    
    console.log('✅ About to render', applications.length, 'applications to table');

    // Sort by date submitted (newest first)
    const sortedApps = [...applications].sort((a, b) => {
      const dateA = new Date(a.dateSubmitted || 0);
      const dateB = new Date(b.dateSubmitted || 0);
      return dateB - dateA;
    });

    console.log('✅ Rendering', sortedApps.length, 'sorted applications');

    sortedApps.forEach((app, index) => {
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
      const rowNumber = index + 1; // Sequential number starting from 1
      
      // Escape quotes in onclick handlers
      const safeAppID = appID.replace(/'/g, "\\'");
      const safeName = name.replace(/'/g, "\\'");
      
      // Check if this is dummy data (by checking if email contains 'example.com')
      const isDummy = app.applicantEmail && app.applicantEmail.includes('example.com');
      const dummyBadge = isDummy ? '<span class="badge bg-secondary ms-1" title="Demo Data">DUMMY</span>' : '';
      
      tr.innerHTML = `
        <td><strong>${rowNumber}</strong></td>
        <td><strong>${appID}</strong>${serialNumber ? `<br><small class="text-muted">Serial: ${serialNumber}</small>` : ''}${dummyBadge}</td>
        <td>${name}${dummyBadge}</td>
        <td>${location} / ${ward}</td>
        <td>${institution}</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
        <td>Ksh ${amount.toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewApplication('${safeAppID}')" title="View Application Details">
            <i class="bi bi-eye"></i> View
          </button>
          ${!app.isFinalSubmission ? `<button class="btn btn-sm btn-warning me-1" onclick="editApplication('${safeAppID}')" title="Edit Application">
            <i class="bi bi-pencil"></i> Edit
          </button>` : ''}
          <button class="btn btn-sm btn-success" onclick="downloadApplicationLetter('${safeAppID}')" title="Download ${status === 'Awarded' ? 'Award' : status === 'Rejected' ? 'Rejection' : 'Status'} Letter">
              <i class="bi bi-download"></i> Download
            </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    // VERIFY RENDERING
    const renderedRows = tbody.children.length;
    console.log('✅ TABLE RENDERED SUCCESSFULLY!');
    console.log('   - Expected rows:', sortedApps.length);
    console.log('   - Actual rows in DOM:', renderedRows);
    console.log('   - Table body element:', tbody);
    console.log('   - First row preview:', tbody.firstElementChild?.textContent?.substring(0, 100));
    
    if (renderedRows === 0) {
      console.error('❌ CRITICAL: Table rendered but no rows visible!');
      console.error('   - Applications:', applications.length);
      console.error('   - Sorted apps:', sortedApps.length);
      console.error('   - Table body:', tbody);
    } else {
      console.log('✅ SUCCESS: Table has', renderedRows, 'visible rows - SCROLL DOWN TO SEE THEM!');
    }
    
    // Force table to be visible and scrollable
    const tableContainer = tbody.closest('.table-responsive');
    if (tableContainer) {
      tableContainer.style.display = 'block';
      tableContainer.style.visibility = 'visible';
      console.log('✅ Table container is visible');
    }
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
    try {
    const apps = loadApplications();
      const filterSubCountyEl = document.getElementById('filterSubCounty');
      const filterWardEl = document.getElementById('filterWard');
      const filterStatusEl = document.getElementById('filterStatus');
      
      if (!filterSubCountyEl || !filterWardEl || !filterStatusEl) {
        console.error('Filter elements not found');
        renderTable(apps); // Show all if filters not available
        return;
      }
      
      const filterSubCounty = filterSubCountyEl.value;
      const filterWard = filterWardEl.value;
      const filterStatus = filterStatusEl.value;

    let filtered = apps;

    if (filterSubCounty) {
      filtered = filtered.filter(a => {
          const sc = a.subCounty || a.personalDetails?.subCounty;
          if (filterSubCounty === 'Other') {
            return sc && !Object.keys(GARISSA_WARDS).includes(sc);
          }
          return sc === filterSubCounty;
      });
    }

    if (filterWard) {
      filtered = filtered.filter(a => {
          const w = a.ward || a.personalDetails?.ward;
          if (filterWard === 'Other') {
            const sc = a.subCounty || a.personalDetails?.subCounty;
            const wards = GARISSA_WARDS[sc] || [];
            return w && !wards.includes(w);
          }
          return w === filterWard;
      });
    }

    if (filterStatus) {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    renderTable(filtered);
      console.log('✅ Filters applied:', { subCounty: filterSubCounty, ward: filterWard, status: filterStatus, result: filtered.length });
    } catch (error) {
      console.error('Filter error:', error);
      const apps = loadApplications();
      renderTable(apps);
    }
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
              <h6 class="mb-0">Document Actions</h6>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" onclick="viewFormattedDocument('${appID}')" title="View Formatted Document">
                  <i class="bi bi-file-earmark-pdf me-1"></i>View Document
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="downloadApplicationPDFFromView('${appID}')" title="Download Application as PDF">
                  <i class="bi bi-download me-1"></i>Download PDF
                </button>
              </div>
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
        if (typeof generateOfferLetterPDF !== 'undefined') {
          const result = await generateOfferLetterPDF(app, app.awardDetails, { preview: false });
          if (result && result.filename) {
            console.log('✅ Award letter auto-downloaded:', result.filename);
            
            // Auto-send email to fundadmin@garissa.go.ke
            setTimeout(() => {
              if (typeof sendEmailDraft !== 'undefined') {
                sendEmailDraft(app, 'award', result.filename, app.awardDetails);
                console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
              }
            }, 1000);
          }
        } else {
          // Fallback
          await downloadPDFDirect(app, app.awardDetails);
        }
      } catch (pdfError) {
        console.error('PDF download error:', pdfError);
        // Continue even if PDF fails
      }
      
      // Show success message
      alert('✅ Successfully awarded!\n\n📄 Serial Number: ' + serialNumber + '\n💰 Amount Awarded: Ksh ' + awardAmount.toLocaleString() + '\n📊 Budget Remaining: Ksh ' + remainingBalance.toLocaleString() + '\n📧 Copy sent to fundadmin@garissa.go.ke\n\n📥 Award letter has been automatically downloaded!');
      
      // Refresh display and visualizations
      refreshApplications();
      updateMetrics();
      updateBudgetDisplay();
      applyFilters();
      
      // Refresh visualizations with updated data
      setTimeout(() => {
        if (typeof refreshVisualizations === 'function') {
          refreshVisualizations();
          console.log('✅ Visualizations updated after award');
        }
      }, 500);
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
      
      // Auto-download rejection letter and send email
      try {
        if (typeof generateRejectionLetterPDF !== 'undefined') {
          const result = await generateRejectionLetterPDF(app);
          if (result && result.filename) {
            console.log('✅ Rejection letter auto-downloaded:', result.filename);
            
            // Auto-send email to fundadmin@garissa.go.ke
            setTimeout(() => {
              if (typeof sendEmailDraft !== 'undefined') {
                sendEmailDraft(app, 'rejection', result.filename, null);
                console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
              }
            }, 1000);
          }
        }
      } catch (pdfError) {
        console.error('PDF download error:', pdfError);
        // Continue even if PDF fails
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

      let filename = '';
      let documentType = '';
      
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
        
        // Generate and auto-download award letter
        if (typeof generateOfferLetterPDF !== 'undefined') {
          documentType = 'award';
          const result = await generateOfferLetterPDF(app, awardDetails, { preview: false });
          if (result && result.filename) {
            filename = result.filename;
            console.log('✅ Award letter auto-downloaded:', filename);
          } else {
            // Fallback filename
            const applicantName = app.applicantName || 
              `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
            const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            filename = `Garissa_Bursary_Award_${sanitizedName}_${awardDetails.serialNumber}_${app.appID}.pdf`;
          }
        } else {
          // Fallback
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `Garissa_Bursary_Award_${sanitizedName}_${awardDetails.serialNumber}_${app.appID}.pdf`;
          documentType = 'award';
          await downloadPDFDirect(app, awardDetails);
        }
        loadingAlert.remove();
      } else if (app.status === 'Rejected') {
        // Download rejection letter
        if (typeof generateRejectionLetterPDF !== 'undefined') {
          documentType = 'rejection';
          const result = await generateRejectionLetterPDF(app);
          if (result && result.filename) {
            filename = result.filename;
            console.log('✅ Rejection letter auto-downloaded:', filename);
          } else {
            // Fallback filename
            const applicantName = app.applicantName || 
              `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
            const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            filename = `Garissa_Bursary_Rejection_${sanitizedName}_${app.appID}.pdf`;
          }
        } else {
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `Garissa_Bursary_Rejection_${sanitizedName}_${app.appID}.pdf`;
          documentType = 'rejection';
          await downloadRejectionLetter(app);
        }
        loadingAlert.remove();
      } else {
        // Download status letter for pending applications
        if (typeof generateStatusLetterPDF !== 'undefined') {
          documentType = 'status';
          const result = await generateStatusLetterPDF(app);
          if (result && result.filename) {
            filename = result.filename;
            console.log('✅ Status letter auto-downloaded:', filename);
          } else {
            // Fallback filename
            const applicantName = app.applicantName || 
              `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
            const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            filename = `Garissa_Bursary_Status_${sanitizedName}_${app.appID}.pdf`;
          }
        } else {
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `Garissa_Bursary_Status_${sanitizedName}_${app.appID}.pdf`;
          documentType = 'status';
          await downloadStatusLetter(app);
        }
        loadingAlert.remove();
      }
      
      // Auto-send email to fundadmin@garissa.go.ke after download
      if (filename && typeof sendEmailDraft !== 'undefined') {
        setTimeout(() => {
          sendEmailDraft(app, documentType || 'summary', filename, app.awardDetails || null);
          console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
        }, 1000);
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
  
  window.downloadPDFDirect = async function(application, awardDetails) {
    // Handle both appID string and application object
    if (typeof application === 'string') {
      await downloadApplicationLetter(application);
      return;
    }
    
    // If application object provided, generate PDF directly
    if (application && awardDetails) {
      try {
        if (typeof generateOfferLetterPDF !== 'undefined') {
          const result = await generateOfferLetterPDF(application, awardDetails, { preview: false });
          if (result && result.filename) {
            console.log('✅ PDF auto-downloaded:', result.filename);
            
            // Send email
            if (typeof sendEmailDraft !== 'undefined') {
              setTimeout(() => {
                sendEmailDraft(application, 'award', result.filename, awardDetails);
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + error.message);
      }
    }
  };
  
  window.downloadPDF = window.downloadApplicationLetter;
  
  // View formatted document in modal with county logo, signature, and stamp
  window.viewFormattedDocument = async function(appID) {
    try {
      const apps = loadApplications();
      const app = apps.find(a => a.appID === appID);
      if (!app) {
        alert('Application not found');
        return;
      }
      
      // Create modal to show formatted document preview
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'documentViewModal';
      modal.innerHTML = `
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-file-earmark-pdf me-2"></i>Formatted Document - ${app.appID}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
              <div class="text-center mb-3">
                <img src="Garissa Logo.png" alt="Garissa County Logo" style="max-width: 100px; height: auto;" onerror="this.style.display='none'">
                <h4 class="mt-2">THE COUNTY GOVERNMENT OF GARISSA</h4>
                <h5>BURSARY MANAGEMENT SYSTEM</h5>
              </div>
              <hr>
              <div class="document-content">
                ${app.status === 'Awarded' ? `
                  <div class="alert alert-success">
                    <h5><i class="bi bi-trophy me-2"></i>AWARD LETTER</h5>
                    <p class="mb-0"><strong>Serial Number:</strong> ${app.awardDetails?.serialNumber || 'N/A'}</p>
                    <p class="mb-0"><strong>Amount Awarded:</strong> Ksh ${(app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0).toLocaleString()}</p>
                  </div>
                ` : app.status === 'Rejected' ? `
                  <div class="alert alert-danger">
                    <h5><i class="bi bi-x-circle me-2"></i>REJECTION LETTER</h5>
                    <p class="mb-0"><strong>Reason:</strong> ${app.rejectionReason || 'Application did not meet requirements'}</p>
                  </div>
                ` : `
                  <div class="alert alert-info">
                    <h5><i class="bi bi-hourglass-split me-2"></i>STATUS LETTER</h5>
                    <p class="mb-0"><strong>Current Status:</strong> ${app.status || 'Pending'}</p>
                  </div>
                `}
                <div class="card mt-3">
                  <div class="card-body">
                    <h6>Applicant Information</h6>
                    <p><strong>Name:</strong> ${app.applicantName || 'N/A'}</p>
                    <p><strong>Application ID:</strong> ${app.appID || 'N/A'}</p>
                    <p><strong>Institution:</strong> ${app.personalDetails?.institution || 'N/A'}</p>
                    <p><strong>Location:</strong> ${app.personalDetails?.subCounty || app.subCounty || 'N/A'}, ${app.personalDetails?.ward || app.ward || 'N/A'}</p>
                    ${app.status === 'Awarded' && app.awardDetails ? `
                      <p><strong>Amount Awarded:</strong> Ksh ${(app.awardDetails.committee_amount_kes || app.awardDetails.amount || 0).toLocaleString()}</p>
                      <p><strong>Serial Number:</strong> ${app.awardDetails.serialNumber || 'N/A'}</p>
                      <p><strong>Date Awarded:</strong> ${new Date(app.awardDetails.date_awarded || new Date()).toLocaleDateString()}</p>
                    ` : ''}
                  </div>
                </div>
                <div class="mt-4 text-center">
                  <div class="border p-3 d-inline-block" style="border-radius: 50%; width: 120px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <strong>OFFICIAL</strong>
                    <strong>STAMP</strong>
                    <small>GARISSA COUNTY</small>
                  </div>
                  <p class="mt-3"><strong>Digital Signature</strong></p>
                  <p>Fund Administrator<br>fundadmin@garissa.go.ke</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="downloadApplicationLetter('${appID}')">
                <i class="bi bi-download me-1"></i>Download PDF
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error viewing document: ' + error.message);
    }
  };

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
  
    // Initialize filters
  populateFilters();
  
  // CRITICAL: FORCE LOAD AND DISPLAY DUMMY DATA IMMEDIATELY
  console.log('🔄 FORCING DUMMY DATA LOAD AND DISPLAY ON PAGE LOAD...');
  
  // Clear any existing dummy data flag to force reload
  localStorage.removeItem('mbms_dummy_data_loaded');
  
  // Load existing applications
  let allApps = loadApplications();
  console.log('📊 Initial applications loaded:', allApps.length);
  
  // ALWAYS ensure we have exactly 10 dummy records - Force load if less than 10
  if (allApps.length < 10) {
    console.log('🔄 LESS THAN 10 APPLICATIONS - FORCING DUMMY DATA GENERATION AND DISPLAY...');
      
      try {
        // Method 1: Try initializeDummyData
        if (typeof initializeDummyData === 'function') {
          console.log('✅ Using initializeDummyData...');
          const loaded = initializeDummyData();
          if (loaded) {
            allApps = loadApplications();
            console.log('✅ Method 1 success:', allApps.length, 'applications');
          }
        }
        
        // Method 2: Direct generation - ALWAYS generate fresh dummy data
        if (allApps.length < 10 && typeof generateDummyApplications === 'function') {
          console.log('🔄 Generating fresh dummy data directly...');
          const dummyApps = generateDummyApplications();
          console.log('✅ Generated', dummyApps.length, 'dummy applications');
          
          if (dummyApps && dummyApps.length > 0) {
            // Clear existing and set fresh dummy data
            localStorage.setItem('mbms_applications', JSON.stringify(dummyApps));
            localStorage.setItem('mbms_application_counter', '10');
            localStorage.setItem('mbms_last_serial', '10');
            localStorage.setItem('mbms_dummy_data_loaded', 'true');
            
            // Initialize budget
            if (typeof initializeBudget !== 'undefined') {
              initializeBudget();
            }
            if (typeof syncBudgetWithAwards !== 'undefined') {
              syncBudgetWithAwards();
            }
            
            // Reload applications
            allApps = loadApplications();
            console.log('✅ Method 2 success - Loaded', allApps.length, 'applications from localStorage');
            
            // VERIFY data is actually in localStorage
            const verify = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
            console.log('✅ Verification: localStorage contains', verify.length, 'applications');
            console.log('Sample apps:', verify.slice(0, 3).map(a => ({
              id: a.appID,
              name: a.applicantName,
              subCounty: a.subCounty,
              ward: a.ward
            })));
          }
        }
        
        // Verify data was loaded
        if (allApps.length > 0) {
          console.log('✅ DUMMY DATA LOADED SUCCESSFULLY:', allApps.length, 'applications');
          console.log('Sample data:', allApps.slice(0, 3).map(a => ({
            id: a.appID,
            name: a.applicantName || 'N/A',
            status: a.status,
            subCounty: a.subCounty || a.personalDetails?.subCounty || 'N/A',
            ward: a.ward || a.personalDetails?.ward || 'N/A'
          })));
          
          // FORCE UPDATE ALL DISPLAYS IMMEDIATELY - MULTIPLE TIMES TO ENSURE VISIBILITY
          console.log('🔄 FORCING IMMEDIATE UI UPDATE...');
          
          // Update 1: Immediate
          updateMetrics();
          updateBudgetDisplay();
          renderTable(allApps);
          applyFilters();
          
          // Update 2: After 100ms
          setTimeout(() => {
            updateMetrics();
            updateBudgetDisplay();
            renderTable(allApps);
            applyFilters();
            console.log('✅ UI Update 2 completed');
          }, 100);
          
          // Update 3: After 500ms
          setTimeout(() => {
            updateMetrics();
            updateBudgetDisplay();
            renderTable(allApps);
            applyFilters();
            console.log('✅ UI Update 3 completed');
          }, 500);
          
          // Update 4: After 1000ms (final)
          setTimeout(() => {
            updateMetrics();
            updateBudgetDisplay();
            renderTable(allApps);
            applyFilters();
            
            // Refresh visualizations
            if (typeof refreshVisualizations === 'function') {
              refreshVisualizations();
              console.log('✅ Visualizations refreshed with dummy data');
            }
            
            console.log('✅ FINAL UI Update completed - All', allApps.length, 'records should be visible');
          }, 1000);
          
          sessionStorage.setItem('mbms_last_app_count', allApps.length.toString());
          
          // Show success notification
          const notification = document.createElement('div');
          notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
          notification.style.zIndex = '9999';
          notification.style.minWidth = '500px';
              notification.innerHTML = `
                <strong>✅ Demo Data Auto-Loaded!</strong><br>
                <div class="mt-2">
                  📊 <strong>10 sample applications</strong> created and visible in table:<br>
                  &nbsp;&nbsp;• All applications are <strong>PENDING REVIEW</strong> (ready for award)<br>
                  &nbsp;&nbsp;• Distributed across all Garissa sub-counties and wards<br>
                  &nbsp;&nbsp;• From different schools and institutions<br>
                  &nbsp;&nbsp;• <strong>NONE AWARDED</strong> - ready for first review and award<br>
                  <small class="text-muted d-block mt-2">💰 Budget: KSH 50,000,000 (Baseline - ready for first award)</small>
                  <small class="text-success d-block mt-1"><strong>✅ Scroll down to see all 10 records in the scrollable table!</strong></small>
                  <small class="text-info d-block mt-1">📊 Visualizations will show data once you scroll to that section</small>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
              `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 8000);
        } else {
          console.error('❌ CRITICAL: Failed to load dummy data!');
          alert('⚠️ Failed to load dummy data. Please click "Load Demo Data" button manually.');
        }
      } catch (error) {
        console.error('❌ Error loading dummy data:', error);
        alert('Error loading dummy data: ' + error.message + '\n\nPlease click "Load Demo Data" button manually.');
      }
    } else {
      console.log('✅ Applications already exist:', allApps.length);
      console.log('Sample:', allApps.slice(0, 2).map(a => ({ id: a.appID, name: a.applicantName, status: a.status })));
      
      // Even if apps exist, ensure we have at least 10 for demo
      if (allApps.length < 10) {
        console.log('⚠️ Less than 10 applications - loading more dummy data...');
        try {
          if (typeof generateDummyApplications === 'function') {
            const existingIds = new Set(allApps.map(a => a.appID));
            const dummyApps = generateDummyApplications();
            const newApps = dummyApps.filter(a => !existingIds.has(a.appID));
            if (newApps.length > 0) {
              const combined = [...allApps, ...newApps.slice(0, 10 - allApps.length)];
              localStorage.setItem('mbms_applications', JSON.stringify(combined));
              allApps = loadApplications();
              console.log('✅ Added dummy data. Total now:', allApps.length);
              updateMetrics();
              updateBudgetDisplay();
              renderTable(allApps);
              applyFilters();
            }
          }
        } catch (e) {
          console.error('Error adding more dummy data:', e);
        }
      }
    }
    
    // FORCE MULTIPLE REFRESHES TO ENSURE DATA IS VISIBLE
    // Refresh 1: Immediate
    setTimeout(() => {
      const verifyApps = loadApplications();
      console.log('🔄 Refresh 1 (500ms):', verifyApps.length, 'applications');
      if (verifyApps.length > 0) {
        updateMetrics();
        updateBudgetDisplay();
        renderTable(verifyApps);
        applyFilters();
        console.log('✅ Refresh 1 completed - Table should show', verifyApps.length, 'rows');
      } else {
        console.warn('⚠️ Refresh 1: No applications found!');
      }
    }, 500);
    
    // Refresh 2: After 1 second
    setTimeout(() => {
      const verifyApps = loadApplications();
      console.log('🔄 Refresh 2 (1000ms):', verifyApps.length, 'applications');
      if (verifyApps.length > 0) {
        updateMetrics();
        updateBudgetDisplay();
        renderTable(verifyApps);
        applyFilters();
        console.log('✅ Refresh 2 completed - Table should show', verifyApps.length, 'rows');
      }
    }, 1000);
    
    // Refresh 3: After 1.5 seconds
    setTimeout(() => {
      const verifyApps = loadApplications();
      console.log('🔄 Refresh 3 (1500ms):', verifyApps.length, 'applications');
      if (verifyApps.length > 0) {
        updateMetrics();
        updateBudgetDisplay();
        renderTable(verifyApps);
        applyFilters();
        console.log('✅ Refresh 3 completed - Table should show', verifyApps.length, 'rows');
      }
    }, 1500);
    
    // ALWAYS update and render - CRITICAL: This must happen IMMEDIATELY
    console.log('🔄 FORCING IMMEDIATE RENDER with', allApps.length, 'applications');
    updateMetrics();
    updateBudgetDisplay();
    renderTable(allApps); // FORCE render table immediately
    console.log('✅ Immediate render completed');
    
    // Store initial count for comparison
    sessionStorage.setItem('mbms_last_app_count', allApps.length.toString());
    
    console.log('✅ Admin dashboard initialized with', allApps.length, 'applications');
    
    // FINAL CHECK: If still no apps after 1 second, force load dummy data
    setTimeout(() => {
      const finalCheck = loadApplications();
      console.log('🔍 Final check (1s):', finalCheck.length, 'applications');
      const tbody = document.getElementById('applicationsTableBody');
      console.log('Table body exists:', !!tbody, 'Rows:', tbody?.children.length || 0);
      
      if (finalCheck.length === 0) {
        console.log('⚠️ Still no applications - forcing dummy data load...');
        // Force clear and reload
        if (typeof generateDummyApplications === 'function') {
          console.log('🔄 Direct generation as last resort...');
          const dummyApps = generateDummyApplications();
          console.log('Generated', dummyApps.length, 'dummy applications');
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
          
          const newApps = loadApplications();
          console.log('Loaded', newApps.length, 'applications after force generation');
          if (newApps.length > 0) {
            updateMetrics();
            updateBudgetDisplay();
            renderTable(newApps);
            applyFilters();
            
            // Refresh visualizations if available
            setTimeout(() => {
              if (typeof refreshVisualizations === 'function') {
                refreshVisualizations();
                console.log('✅ Visualizations refreshed with new data');
              }
            }, 1000);
            
            console.log('✅ Dummy data force-loaded:', newApps.length, 'applications');
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            notification.style.zIndex = '9999';
            notification.style.minWidth = '500px';
            notification.innerHTML = `
              <strong>✅ Demo Data Loaded!</strong><br>
              <div class="mt-2">
                📊 <strong>${newApps.length} sample applications</strong> created and visible in table:<br>
                &nbsp;&nbsp;• <strong>ALL PENDING REVIEW</strong> (ready for award)<br>
                &nbsp;&nbsp;• Distributed across all Garissa sub-counties<br>
                &nbsp;&nbsp;• From different schools and institutions<br>
                &nbsp;&nbsp;• <strong>NONE AWARDED</strong> - ready for first review<br>
                <small class="text-muted d-block mt-2">💰 Budget: KSH 50,000,000 (Baseline - ready for first award)</small>
                <small class="text-success d-block mt-1">✅ All records visible in scrollable Application Management table</small>
                <small class="text-info d-block mt-1">📊 Check Visualizations section for colorful charts</small>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
              if (notification.parentNode) {
                notification.remove();
              }
            }, 8000);
          } else {
            console.error('❌ CRITICAL: Generated apps but loadApplications returned empty!');
            alert('⚠️ Error: Data generated but not loading. Please refresh the page.');
          }
        }
      } else {
        // Data exists but might not be visible - force render
        updateMetrics();
        updateBudgetDisplay();
        renderTable(finalCheck);
        applyFilters();
        console.log('✅ Forced render with', finalCheck.length, 'applications');
        
        // Verify table has rows
        const tbodyCheck = document.getElementById('applicationsTableBody');
        if (tbodyCheck && tbodyCheck.children.length === 0 && finalCheck.length > 0) {
          console.log('⚠️ Table body empty but apps exist - forcing render again');
          renderTable(finalCheck);
        }
      }
    }, 1000);
    
    // EXTRA CHECK: Verify table has data after 3 seconds
    setTimeout(() => {
      const tbody = document.getElementById('applicationsTableBody');
      const apps = loadApplications();
      console.log('🔍 Table verification (3s):', apps.length, 'apps,', tbody?.children.length || 0, 'rows');
      if (tbody && apps.length > 0 && tbody.children.length === 0) {
        console.log('⚠️ Table body empty but apps exist - forcing render');
        renderTable(apps);
        applyFilters();
      } else if (tbody && apps.length > 0 && tbody.children.length > 0) {
        console.log('✅ Table verified: Data is visible');
      }
    }, 3000);
    
    // FINAL VERIFICATION: After 5 seconds, ensure everything is displayed
    setTimeout(() => {
      const apps = loadApplications();
      const tbody = document.getElementById('applicationsTableBody');
      const metricTotal = document.getElementById('metricTotal');
      
      console.log('🔍 Final verification (5s):');
      console.log('  - Applications in storage:', apps.length);
      console.log('  - Table rows:', tbody?.children.length || 0);
      console.log('  - Metric total:', metricTotal?.textContent || 'N/A');
      
      if (apps.length > 0 && (!tbody || tbody.children.length === 0)) {
        console.log('⚠️ FINAL FIX: Forcing complete refresh...');
        updateMetrics();
        updateBudgetDisplay();
        renderTable(apps);
        applyFilters();
      }
    }, 5000);
    
    // Listen for new application submissions
    window.addEventListener('mbms-data-updated', function(e) {
      console.log('📬 New application submitted! Refreshing dashboard...', e.detail);
      setTimeout(() => {
        const newApps = loadApplications();
        updateMetrics();
        updateBudgetDisplay();
        renderTable(newApps);
        applyFilters();
        console.log('✅ Dashboard refreshed with', newApps.length, 'applications');
      }, 500);
    });
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', function(e) {
      if (e.key === 'mbms_applications') {
        console.log('📬 Storage change detected! Refreshing dashboard...');
        setTimeout(() => {
          const newApps = loadApplications();
          updateMetrics();
          updateBudgetDisplay();
          renderTable(newApps);
          applyFilters();
        }, 500);
      }
    });
    
    // Periodic check for new applications (every 5 seconds)
    setInterval(() => {
      const currentCount = parseInt(sessionStorage.getItem('mbms_last_app_count') || '0');
      const apps = loadApplications();
      if (apps.length !== currentCount) {
        console.log('📊 Application count changed:', currentCount, '->', apps.length);
        updateMetrics();
        updateBudgetDisplay();
        renderTable(apps);
        applyFilters();
        sessionStorage.setItem('mbms_last_app_count', apps.length.toString());
      }
    }, 5000);
  }
  
  } // End of initAdminDashboard function
  
  // Force reload dummy data (for testing)
  window.forceReloadDummyData = function() {
    console.log('🔄 Force reloading dummy data...');
    
    // Clear existing data
    localStorage.removeItem('mbms_applications');
    localStorage.removeItem('mbms_application_counter');
    localStorage.removeItem('mbms_last_serial');
    
    // Reload dummy data
    if (typeof initializeDummyData === 'function') {
      if (initializeDummyData()) {
        const apps = loadApplications();
        updateMetrics();
        updateBudgetDisplay();
        renderTable(apps);
        applyFilters();
        sessionStorage.setItem('mbms_last_app_count', apps.length.toString());
        alert('✅ Dummy data reloaded! ' + apps.length + ' applications now visible.');
      }
    }
  };
  
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
  // Expose loadApplications globally for visualizations
  window.loadApplications = loadApplications;
  
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
                
                // Special handling for visualizations section
                if (sectionId === 'visualizations') {
                  setTimeout(() => {
                    if (typeof refreshVisualizations === 'function') {
                      refreshVisualizations();
                    }
                  }, 300);
                }
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
  
  // Listen for new application submissions - auto-refresh when new applicants join
  window.addEventListener('mbms-data-updated', function(event) {
    console.log('📢 Data update event received:', event.detail);
    if (event.detail && event.detail.key === 'mbms_applications') {
      console.log('🔄 New application detected - refreshing dashboard...');
      
      // Immediate refresh
      refreshApplications();
      updateMetrics();
      updateBudgetDisplay();
      
      // Refresh after short delay
      setTimeout(() => {
        refreshApplications();
        updateMetrics();
        updateBudgetDisplay();
        applyFilters();
        
        // Refresh visualizations
        if (typeof refreshVisualizations === 'function') {
          refreshVisualizations();
          console.log('✅ Visualizations refreshed with new data');
        }
        
        console.log('✅ Dashboard refreshed with new application');
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '400px';
        notification.innerHTML = `
          <strong>🆕 New Application Received!</strong><br>
          <div class="mt-2">
            A new application has been submitted and is now in the "Pending Ward Review" list.<br>
            <small class="text-muted">Application ID: ${event.detail.appID || 'N/A'}</small>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 5000);
      }, 500);
    }
  });
  
  // Also listen for storage events (cross-tab sync)
  window.addEventListener('storage', function(event) {
    if (event.key === 'mbms_applications') {
      console.log('📢 Storage event detected - new application added');
      setTimeout(() => {
        refreshApplications();
        updateMetrics();
        updateBudgetDisplay();
        applyFilters();
        if (typeof refreshVisualizations === 'function') {
          refreshVisualizations();
        }
      }, 500);
    }
  });
  
  // Periodic check for new applications (every 2 seconds) - more frequent
  setInterval(() => {
    const currentCount = parseInt(sessionStorage.getItem('mbms_last_app_count') || '0');
    const apps = loadApplications();
    if (apps.length > currentCount) {
      console.log('🔄 New applications detected via periodic check:', apps.length - currentCount, 'new');
      refreshApplications();
      updateMetrics();
      updateBudgetDisplay();
      applyFilters();
      sessionStorage.setItem('mbms_last_app_count', apps.length.toString());
      if (typeof refreshVisualizations === 'function') {
        refreshVisualizations();
      }
    }
  }, 2000);
  
  // Setup immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupSidebarNavigation();
      // Delay initAdminDashboard slightly to ensure all scripts are loaded
      setTimeout(() => {
        initAdminDashboard();
        // Initialize visualizations after dashboard is ready
        setTimeout(() => {
          if (typeof initializeVisualizations === 'function') {
            initializeVisualizations();
            console.log('✅ Visualizations initialized');
          }
        }, 2000);
      }, 100);
    });
  } else {
    setupSidebarNavigation();
    // Delay initAdminDashboard slightly to ensure all scripts are loaded
    setTimeout(() => {
      initAdminDashboard();
      // Initialize visualizations after dashboard is ready
      setTimeout(() => {
        if (typeof initializeVisualizations === 'function') {
          initializeVisualizations();
          console.log('✅ Visualizations initialized');
        }
      }, 2000);
    }, 100);
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
