// Enhanced Admin Dashboard with Full Functionality
(function() {
  // Check admin access
  const adminStr = sessionStorage.getItem('mbms_admin');
  if (!adminStr) {
    alert('Access denied. Admin login required.');
    window.location.href = 'index.html';
    return;
  }

  const admin = JSON.parse(adminStr);
  document.getElementById('adminEmail').textContent = admin.email;

  // Load applications from localStorage
  function loadApplications() {
    return JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  }

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
    
    const awarded = apps.filter(a => a.status === 'Awarded');
    const totalFunds = awarded.reduce((sum, a) => sum + (a.financialDetails?.amountRequested || a.awardDetails?.committee_amount_kes || 0), 0);
    document.getElementById('metricFunds').textContent = toCurrencyKES(totalFunds);
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
    tbody.innerHTML = '';

    if (applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No applications found</td></tr>';
      return;
    }

    applications.forEach(app => {
      const tr = document.createElement('tr');
      const status = app.status || 'Pending Submission';
      const statusClass = getStatusBadgeClass(status);
      const amount = app.financialDetails?.amountRequested || app.amountRequested || 0;
      const name = app.applicantName || `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`;
      const location = app.personalDetails?.subCounty || app.subCounty || 'N/A';
      const ward = app.personalDetails?.ward || app.ward || 'N/A';
      const institution = app.personalDetails?.institution || app.institution || 'N/A';

      tr.innerHTML = `
        <td><strong>${app.appID || 'N/A'}</strong></td>
        <td>${name}</td>
        <td>${location} / ${ward}</td>
        <td>${institution}</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
        <td>Ksh ${amount.toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewApplication('${app.appID}')">
            <i class="bi bi-eye"></i> View
          </button>
          ${status === 'Awarded' ? `
            <button class="btn btn-sm btn-success" onclick="downloadPDF('${app.appID}')">
              <i class="bi bi-download"></i> PDF
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
  window.approveApplication = function(appID) {
    const amount = document.getElementById('awardAmount').value;
    const justification = document.getElementById('awardJustification').value;

    if (!amount || !justification) {
      alert('Please enter award amount and justification');
      return;
    }

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app) {
      app.status = 'Awarded';
      app.awardDetails = {
        committee_amount_kes: parseInt(amount),
        date_awarded: new Date().toISOString(),
        justification: justification,
        admin_assigned_uid: admin.email
      };
      localStorage.setItem('mbms_applications', JSON.stringify(apps));
      updateMetrics();
      applyFilters();
      alert('✅ Application awarded successfully!');
      bootstrap.Modal.getInstance(document.querySelector('.modal')).hide();
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

  // Download PDF (placeholder)
  window.downloadPDF = function(appID) {
    alert('PDF generation will be implemented. Application ID: ' + appID);
    // In production, call PDF generator service
  };

  // Export to Excel/CSV
  document.getElementById('downloadReportBtn').addEventListener('click', function() {
    const reportType = document.getElementById('reportType').value;
    const reportStatus = document.getElementById('reportStatus').value;
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
    downloadCSV(filename, rows);
  });

  // Initialize
  populateFilters();
  updateMetrics();
  applyFilters();

  // Filter event listeners
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('filterSubCounty').addEventListener('change', function() {
    const wardSel = document.getElementById('filterWard');
    wardSel.innerHTML = '<option value="">All Wards</option>';
    const wards = GARISSA_WARDS[this.value] || [];
    wards.forEach(w => wardSel.add(new Option(w, w)));
    wardSel.add(new Option('Other', 'Other'));
  });
})();
