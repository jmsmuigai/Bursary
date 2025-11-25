// Edit Application Functionality for Admin Dashboard
// Allows admin to edit applications before final submission

window.editApplication = function(appID) {
  const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  const app = apps.find(a => a.appID === appID);
  
  if (!app) {
    alert('⚠️ Application not found.');
    return;
  }
  
  // Check if application is final submission - NO EDITING ALLOWED
  if (app.isFinalSubmission) {
    alert('🚫 EDITING NOT ALLOWED!\n\n⚠️ This application has been FINALLY SUBMITTED.\n\nOnce an application is finally submitted, it CANNOT be edited.\n\nIf changes are required, please contact the system administrator at fundadmin@garissa.go.ke\n\nApplication ID: ' + appID);
    return;
  }
  
  // Check if application is already awarded or rejected - NO EDITING ALLOWED
  if (app.status === 'Awarded' || app.status === 'Rejected') {
    alert('🚫 EDITING NOT ALLOWED!\n\n⚠️ This application has been ' + app.status.toUpperCase() + '.\n\nApplications that have been awarded or rejected cannot be edited.\n\nIf changes are required, please contact the system administrator at fundadmin@garissa.go.ke\n\nApplication ID: ' + appID);
    return;
  }
  
  // Show edit modal with form
  const editModal = document.createElement('div');
  editModal.className = 'modal fade';
  editModal.id = 'editApplicationModal';
  editModal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-warning">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square me-2"></i>Edit Application: ${app.appID}
            ${app.isDummy ? '<span class="badge bg-secondary ms-2">DUMMY</span>' : ''}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Warning:</strong> Once this application is marked as "Final Submission", it CANNOT be edited again.
          </div>
          
          <form id="editApplicationForm">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">First Names</label>
                <input type="text" class="form-control" id="editFirstNames" value="${app.personalDetails?.firstNames || ''}" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" id="editLastName" value="${app.personalDetails?.lastName || ''}" required>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Institution</label>
                <input type="text" class="form-control" id="editInstitution" value="${app.personalDetails?.institution || ''}" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Amount Requested (KSH)</label>
                <input type="number" class="form-control" id="editAmountRequested" value="${app.financialDetails?.amountRequested || app.amountRequested || 0}" required>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Sub-County</label>
                <select class="form-select" id="editSubCounty" required>
                  ${Object.keys(GARISSA_WARDS).map(sc => 
                    `<option value="${sc}" ${(app.subCounty || app.personalDetails?.subCounty) === sc ? 'selected' : ''}>${sc}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Ward</label>
                <select class="form-select" id="editWard" required>
                  ${GARISSA_WARDS[app.subCounty || app.personalDetails?.subCounty || 'Garissa Township']?.map(w => 
                    `<option value="${w}" ${(app.ward || app.personalDetails?.ward) === w ? 'selected' : ''}>${w}</option>`
                  ).join('') || ''}
                </select>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <select class="form-select" id="editStatus" required>
                  <option value="Pending Submission" ${app.status === 'Pending Submission' ? 'selected' : ''}>Pending Submission</option>
                  <option value="Pending Ward Review" ${app.status === 'Pending Ward Review' ? 'selected' : ''}>Pending Ward Review</option>
                  <option value="Pending Committee Review" ${app.status === 'Pending Committee Review' ? 'selected' : ''}>Pending Committee Review</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-control" id="editPhone" value="${app.personalDetails?.studentPhone || ''}" required>
              </div>
            </div>
            
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="editFinalSubmission" ${app.isFinalSubmission ? 'checked disabled' : ''}>
              <label class="form-check-label text-danger fw-bold" for="editFinalSubmission">
                ⚠️ Mark as FINAL SUBMISSION (Cannot be edited after this)
              </label>
            </div>
            
            ${app.isFinalSubmission ? '<div class="alert alert-danger"><strong>⚠️ This application is already marked as FINAL SUBMISSION and cannot be edited.</strong></div>' : ''}
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="saveEditedApplication('${appID}')" ${app.isFinalSubmission ? 'disabled' : ''}>
            <i class="bi bi-save me-1"></i>Save Changes
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(editModal);
  const modal = new bootstrap.Modal(editModal);
  modal.show();
  
  // Clean up modal when closed
  editModal.addEventListener('hidden.bs.modal', () => {
    editModal.remove();
  });
  
  // Update ward dropdown when sub-county changes
  document.getElementById('editSubCounty')?.addEventListener('change', function() {
    const wardSel = document.getElementById('editWard');
    if (wardSel && GARISSA_WARDS[this.value]) {
      wardSel.innerHTML = GARISSA_WARDS[this.value].map(w => 
        `<option value="${w}">${w}</option>`
      ).join('');
    }
  });
};

window.saveEditedApplication = function(appID) {
  const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  const app = apps.find(a => a.appID === appID);
  
  if (!app) {
    alert('⚠️ Application not found.');
    return;
  }
  
  // Check if final submission - NO EDITING
  if (app.isFinalSubmission) {
    alert('🚫 EDITING NOT ALLOWED!\n\nThis application has been FINALLY SUBMITTED.');
    return;
  }
  
  // Get form values
  const firstNames = document.getElementById('editFirstNames').value.trim();
  const lastName = document.getElementById('editLastName').value.trim();
  const institution = document.getElementById('editInstitution').value.trim();
  const amountRequested = parseInt(document.getElementById('editAmountRequested').value) || 0;
  const subCounty = document.getElementById('editSubCounty').value;
  const ward = document.getElementById('editWard').value;
  const status = document.getElementById('editStatus').value;
  const phone = document.getElementById('editPhone').value.trim();
  const isFinalSubmission = document.getElementById('editFinalSubmission')?.checked || false;
  
  // Update application
  app.applicantName = `${firstNames} ${lastName}`;
  app.status = status;
  app.subCounty = subCounty;
  app.ward = ward;
  app.isFinalSubmission = isFinalSubmission;
  
  if (!app.personalDetails) app.personalDetails = {};
  app.personalDetails.firstNames = firstNames;
  app.personalDetails.lastName = lastName;
  app.personalDetails.institution = institution;
  app.personalDetails.studentPhone = phone;
  app.personalDetails.subCounty = subCounty;
  app.personalDetails.ward = ward;
  
  if (!app.financialDetails) app.financialDetails = {};
  app.financialDetails.amountRequested = amountRequested;
  
  // Save
  localStorage.setItem('mbms_applications', JSON.stringify(apps));
  
  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('editApplicationModal'));
  if (modal) modal.hide();
  
  // Refresh display
  if (typeof refreshApplications === 'function') {
    refreshApplications();
  }
  
  // Show success message
  if (isFinalSubmission) {
    alert('✅ Application updated and marked as FINAL SUBMISSION!\n\n⚠️ WARNING: This application can NO LONGER be edited.\n\nApplication ID: ' + appID);
  } else {
    alert('✅ Application updated successfully!\n\nApplication ID: ' + appID);
  }
  
  // Trigger update event
  window.dispatchEvent(new CustomEvent('mbms-data-updated', {
    detail: { key: 'mbms_applications', action: 'edited', appID: appID }
  }));
};

