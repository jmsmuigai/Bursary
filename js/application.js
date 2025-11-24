// Application Form Handler with Autosave
(function() {
  let currentStep = 0;
  const totalSteps = 5;
  const sections = document.querySelectorAll('.form-section');
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const form = document.getElementById('applicationForm');
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');
  const saveStatusText = document.getElementById('saveStatusText');

  // Get current user from session
  function getCurrentUser() {
    const userStr = sessionStorage.getItem('mbms_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Autosave functionality
  function autosave() {
    const user = getCurrentUser();
    if (!user) return;

    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Get all form inputs
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'radio') {
        if (input.checked) data[input.name] = input.value;
      } else if (input.type === 'checkbox') {
        data[input.name] = input.checked;
      } else {
        data[input.id] = input.value;
      }
    });

    const applicationKey = `mbms_application_${user.email}`;
    const applicationData = {
      ...data,
      lastSaved: new Date().toISOString(),
      step: currentStep,
      status: 'Draft'
    };

    localStorage.setItem(applicationKey, JSON.stringify(applicationData));
    showSaveStatus('Auto-saved', 'success');
  }

  // Manual save
  function manualSave() {
    autosave();
    showSaveStatus('Progress saved successfully!', 'success');
  }

  // Load saved application
  function loadSavedApplication() {
    const user = getCurrentUser();
    if (!user) return;

    const applicationKey = `mbms_application_${user.email}`;
    const saved = localStorage.getItem(applicationKey);
    if (!saved) return;

    const data = JSON.parse(saved);
    
    // Populate form fields
    Object.keys(data).forEach(key => {
      const field = document.getElementById(key);
      if (field) {
        if (field.type === 'radio') {
          const radio = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
          if (radio) radio.checked = true;
        } else if (field.type === 'checkbox') {
          field.checked = data[key];
        } else {
          field.value = data[key];
        }
      }
    });

    // Restore step
    if (data.step !== undefined) {
      currentStep = parseInt(data.step);
      showStep(currentStep);
    }

    showSaveStatus('Application loaded', 'info');
  }

  // Show save status
  function showSaveStatus(message, type) {
    saveStatus.className = `alert alert-${type} alert-sm mb-0 shadow-sm`;
    saveStatusText.textContent = message;
    saveStatus.style.display = 'block';
    setTimeout(() => {
      saveStatus.style.display = 'none';
    }, 3000);
  }

  // Show step
  function showStep(step) {
    sections.forEach((s, i) => {
      s.classList.toggle('active', i === step);
    });

    // Update progress
    const progress = ((step + 1) / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;

    // Update buttons
    prevBtn.style.display = step > 0 ? 'block' : 'none';
    nextBtn.style.display = step < totalSteps - 1 ? 'block' : 'none';
    submitBtn.style.display = step === totalSteps - 1 ? 'block' : 'none';

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((ind, i) => {
      ind.classList.toggle('text-warning', i <= step);
      ind.classList.toggle('text-white', i <= step);
    });

    // Generate review summary on last step
    if (step === totalSteps - 1) {
      generateReviewSummary();
    }
  }

  // Generate review summary
  function generateReviewSummary() {
    const summary = document.getElementById('reviewSummary');
    const data = new FormData(form);
    
    let html = '<h6 class="mb-3">Application Summary</h6>';
    html += `<p><strong>Name:</strong> ${document.getElementById('firstNames')?.value || ''} ${document.getElementById('lastNameApp')?.value || ''}</p>`;
    html += `<p><strong>Institution:</strong> ${document.getElementById('institutionName')?.value || ''}</p>`;
    html += `<p><strong>Registration No:</strong> ${document.getElementById('regNumber')?.value || ''}</p>`;
    html += `<p><strong>Fee Balance:</strong> Ksh ${parseInt(document.getElementById('feeBalance')?.value || 0).toLocaleString()}</p>`;
    html += `<p><strong>Amount Requested:</strong> Ksh ${parseInt(document.getElementById('amountRequested')?.value || 0).toLocaleString()}</p>`;
    
    summary.innerHTML = html;
  }

  // Handle disability description toggle
  setTimeout(() => {
    document.querySelectorAll('input[name="hasDisability"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const descField = document.getElementById('disabilityDescription');
        if (descField) {
          descField.style.display = this.value === 'Yes' ? 'block' : 'none';
          if (this.value === 'Yes') descField.setAttribute('required', 'required');
          else descField.removeAttribute('required');
        }
      });
    });

    // Handle previous benefit toggle
    document.querySelectorAll('input[name="previousBenefit"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const detailsDiv = document.getElementById('previousBenefitDetails');
        if (detailsDiv) {
          detailsDiv.style.display = this.value === 'Yes' ? 'block' : 'none';
        }
      });
    });

    // Handle education payer other
    document.querySelectorAll('input[name="educationPayer"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const otherField = document.getElementById('payerOtherSpecify');
        if (otherField) {
          otherField.style.display = this.value === 'Other' ? 'block' : 'none';
        }
      });
    });
  }, 100);

  // Navigation
  nextBtn.addEventListener('click', function() {
    const currentSection = sections[currentStep];
    const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        valid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });

    if (valid) {
      if (currentStep < totalSteps - 1) {
        currentStep++;
        showStep(currentStep);
        autosave();
      }
    } else {
      alert('Please fill all required fields before proceeding.');
    }
  });

  prevBtn.addEventListener('click', function() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Step indicator clicks
  document.querySelectorAll('.step-indicator').forEach((ind, i) => {
    ind.addEventListener('click', function() {
      if (i <= currentStep) {
        currentStep = i;
        showStep(currentStep);
      }
    });
  });

  // Save button
  saveBtn.addEventListener('click', manualSave);

  // Autosave on input change (debounced)
  let autosaveTimeout;
  form.addEventListener('input', function() {
    clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(autosave, 2000);
  });

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert('Please login to submit your application.');
      window.location.href = 'index.html';
      return;
    }

    // Collect all form data
    const formData = new FormData(form);
    
    // Generate unique application ID
    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0') + 1;
    const appID = `GSA/${year}/${counter.toString().padStart(4, '0')}`;
    
    const applicationData = {
      appID: appID,
      applicantEmail: user.email,
      applicantName: `${user.firstName} ${user.lastName}`,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending Submission',
      dateSubmitted: new Date().toISOString(),
      // Include location from user registration
      subCounty: user.subCounty || 'N/A',
      ward: user.ward || 'N/A',
      village: user.village || '',
      personalDetails: {
        firstNames: document.getElementById('firstNames').value,
        middleName: document.getElementById('middleName').value,
        lastName: document.getElementById('lastNameApp').value,
        gender: document.getElementById('genderApp').value,
        studentPhone: document.getElementById('studentPhone').value,
        parentPhone: document.getElementById('parentPhone').value,
        institution: document.getElementById('institutionName').value,
        regNumber: document.getElementById('regNumber').value,
        yearForm: document.getElementById('yearForm').value,
        courseNature: document.getElementById('courseNature').value,
        courseDuration: document.getElementById('courseDuration').value,
        // Include location in personalDetails too for compatibility
        subCounty: user.subCounty || 'N/A',
        ward: user.ward || 'N/A'
      },
      familyDetails: {
        parentStatus: form.querySelector('input[name="parentStatus"]:checked')?.value,
        hasDisability: form.querySelector('input[name="hasDisability"]:checked')?.value,
        disabilityDescription: document.getElementById('disabilityDescription').value,
        fatherName: document.getElementById('fatherName').value,
        fatherOccupation: document.getElementById('fatherOccupation').value,
        motherName: document.getElementById('motherName').value,
        motherOccupation: document.getElementById('motherOccupation').value,
        guardianName: document.getElementById('guardianName').value,
        guardianOccupation: document.getElementById('guardianOccupation').value,
        totalSiblings: parseInt(document.getElementById('totalSiblings').value || 0),
        guardianChildren: parseInt(document.getElementById('guardianChildren').value || 0),
        siblingsWorking: parseInt(document.getElementById('siblingsWorking').value || 0),
        siblingsSecondary: parseInt(document.getElementById('siblingsSecondary').value || 0),
        siblingsPostSecondary: parseInt(document.getElementById('siblingsPostSecondary').value || 0),
        educationPayer: form.querySelector('input[name="educationPayer"]:checked')?.value,
        payerOtherSpecify: document.getElementById('payerOtherSpecify').value,
        previousBenefit: form.querySelector('input[name="previousBenefit"]:checked')?.value,
        previousAmount: parseInt(document.getElementById('previousAmount').value || 0),
        previousYear: parseInt(document.getElementById('previousYear').value || 0)
      },
      institutionDetails: {
        principalName: document.getElementById('principalName').value,
        principalPhone: document.getElementById('principalPhone').value,
        principalComments: document.getElementById('principalComments').value,
        discipline: form.querySelector('input[name="discipline"]:checked')?.value,
        outstandingFees: parseInt(document.getElementById('outstandingFees').value || 0)
      },
      financialDetails: {
        monthlyIncome: parseInt(document.getElementById('monthlyIncome').value || 0),
        totalAnnualFees: parseInt(document.getElementById('totalAnnualFees').value || 0),
        feeBalance: parseInt(document.getElementById('feeBalance').value || 0),
        amountRequested: parseInt(document.getElementById('amountRequested').value || 0),
        justification: document.getElementById('justification').value
      }
    };

    // Save application
    const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    applications.push(applicationData);
    localStorage.setItem('mbms_applications', JSON.stringify(applications));

    // Remove draft
    const applicationKey = `mbms_application_${user.email}`;
    localStorage.removeItem(applicationKey);

    // Update application counter
    localStorage.setItem('mbms_application_counter', counter.toString());
    
    console.log('✅ Application submitted:', appID);
    console.log('📊 Total applications now:', applications.length);
    
    // Trigger storage event to notify admin dashboard (for real-time updates)
    window.dispatchEvent(new CustomEvent('mbms-data-updated', {
      detail: { key: 'mbms_applications', action: 'submitted', appID: appID }
    }));
    
    // Also trigger storage event for cross-tab sync
    try {
      const storageEvent = new StorageEvent('storage', {
        key: 'mbms_applications',
        newValue: localStorage.getItem('mbms_applications'),
        oldValue: null,
        storageArea: localStorage
      });
      window.dispatchEvent(storageEvent);
    } catch (e) {
      console.log('Storage event dispatch:', e);
    }
    
    // Force localStorage update to trigger cross-tab events
    const currentApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    localStorage.setItem('mbms_applications', JSON.stringify(currentApps));

    alert('✅ Application submitted successfully! Redirecting to dashboard...');
    window.location.href = 'applicant_dashboard.html';
  });

  // Initialize
  loadSavedApplication();
  showStep(currentStep);
})();

