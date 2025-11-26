// Application Form Handler with Autosave - ENHANCED with browser compatibility
(function() {
  // Wait for DOM to be fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplicationForm);
  } else {
    initializeApplicationForm();
  }
  
  function initializeApplicationForm() {
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
    
    // Ensure all elements exist before proceeding - ENHANCED: Check all critical elements
    if (!form || !saveBtn || !submitBtn || !nextBtn || !prevBtn) {
      console.error('⚠️ Critical form elements not found. Retrying...');
      setTimeout(initializeApplicationForm, 500);
      return;
    }
    
    console.log('✅ Application form initialized - all elements found');

  // Get current user from session
  function getCurrentUser() {
    const userStr = sessionStorage.getItem('mbms_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

    // Autosave functionality - ENHANCED: Saves on every step change and input
    function autosave() {
      try {
        const user = getCurrentUser();
        if (!user) {
          console.warn('⚠️ No user logged in - cannot save');
          return;
        }

        const currentForm = document.getElementById('applicationForm');
        if (!currentForm) {
          console.warn('⚠️ Form not found');
          return;
        }

        const formData = new FormData(currentForm);
        const data = {};
        
        // Try FormData first (modern browsers)
        try {
          for (let [key, value] of formData.entries()) {
            data[key] = value;
          }
        } catch (e) {
          console.warn('FormData iteration not supported, using fallback');
        }

        // Get all form inputs (fallback for older browsers)
        const inputs = currentForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (input.type === 'radio') {
            if (input.checked) data[input.name] = input.value;
          } else if (input.type === 'checkbox') {
            data[input.name] = input.checked;
          } else if (input.id) {
            data[input.id] = input.value;
          }
        });

        const applicationKey = `mbms_application_${user.email}`;
        const applicationData = {
          ...data,
          lastSaved: new Date().toISOString(),
          step: currentStep,
          status: 'Draft',
          applicantEmail: user.email,
          applicantName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          // Include user registration data for consistency
          subCounty: user.subCounty || '',
          ward: user.ward || '',
          village: user.village || ''
        };

        // Save to UNIFIED DATABASE (SAME DATABASE used by admin portal)
        if (typeof saveDraftApplication !== 'undefined') {
          saveDraftApplication(user.email, applicationData);
          console.log('💾 Auto-saved to UNIFIED DATABASE:', applicationKey, '- Step', currentStep + 1);
        } else {
          localStorage.setItem(applicationKey, JSON.stringify(applicationData));
          console.log('💾 Auto-saved to database (fallback):', applicationKey, '- Step', currentStep + 1);
        }
        console.log('📊 Database: UNIFIED DATABASE (mbms_application_' + user.email + ')');
        console.log('✅ Same database as admin portal, reports, and visualizations read from');
        
        // Show subtle save indicator (only if not already showing)
        if (saveStatus && saveStatusText) {
          saveStatusText.textContent = 'Progress saved automatically';
          saveStatus.className = 'alert alert-info alert-sm mb-0 shadow-sm';
          saveStatus.style.display = 'block';
          setTimeout(() => {
            if (saveStatus) saveStatus.style.display = 'none';
          }, 2000);
        }
      } catch (error) {
        console.error('Autosave error:', error);
      }
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

    // Update buttons - ENHANCED: Separate Save and Next buttons
    if (prevBtn) {
      prevBtn.style.display = step > 0 ? 'block' : 'none';
      prevBtn.disabled = false;
      prevBtn.style.cursor = 'pointer';
      prevBtn.style.opacity = '1';
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.classList.remove('disabled');
    }
    
    if (nextBtn) {
      nextBtn.style.display = step < totalSteps - 1 ? 'block' : 'none';
      nextBtn.disabled = false;
      nextBtn.style.cursor = 'pointer';
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.classList.remove('disabled');
    }
    
    if (submitBtn) {
      submitBtn.style.display = step === totalSteps - 1 ? 'block' : 'none';
      submitBtn.disabled = false;
      submitBtn.style.cursor = 'pointer';
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.classList.remove('disabled');
    }
    
    // Save button is always visible and active
    if (saveBtn) {
      saveBtn.style.display = 'block';
      saveBtn.disabled = false;
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.opacity = '1';
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.classList.remove('disabled');
    }

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((ind, i) => {
      ind.style.cursor = 'pointer';
      if (i <= step) {
        ind.style.color = '#8B4513';
        ind.style.fontWeight = 'bold';
      } else {
        ind.style.color = '#999';
        ind.style.fontWeight = 'normal';
      }
    });

    // Generate review summary on last step
    if (step === totalSteps - 1) {
      generateReviewSummary();
    }
    
    console.log('✅ Step', step + 1, 'displayed - all buttons enabled');
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

    // Navigation - ENHANCED: Separate Next button (Save is separate)
    if (nextBtn) {
      // Remove any existing listeners to prevent duplicates
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
      
      newNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          console.log('➡️ Next button clicked - Step', currentStep + 1);
          
          // Auto-save current step data before proceeding (automatic)
          autosave();
          
          // Show friendly message
          const currentSection = sections[currentStep];
          const requiredInputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
          let missingFields = [];
          
          requiredInputs.forEach(input => {
            if (!input.value.trim()) {
              input.classList.add('is-invalid');
              missingFields.push(input.previousElementSibling?.textContent || input.placeholder || 'field');
            } else {
              input.classList.remove('is-invalid');
            }
          });

          // Allow proceeding even if some fields are missing (user-friendly)
          if (missingFields.length > 0) {
            // Show friendly warning but allow proceeding
            const proceed = confirm(`⚠️ Some required fields are not filled:\n\n${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}\n\nYour progress has been saved automatically. You can continue and fill them later.\n\nDo you want to proceed to the next step?`);
            
            if (!proceed) {
              // Focus on first missing field
              const firstInvalid = currentSection.querySelector(':invalid');
              if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              return;
            }
          }

          // Proceed to next step
          if (currentStep < totalSteps - 1) {
            currentStep++;
            showStep(currentStep);
            
            // Auto-save again after moving to next step
            setTimeout(() => {
              autosave();
              showSaveStatus('Progress saved automatically', 'info');
            }, 500);
            
            console.log('✅ Moved to step', currentStep + 1);
          }
        } catch (error) {
          console.error('Next button error:', error);
          alert('Error navigating. Please try again.');
        }
      });
      
      newNextBtn.disabled = false;
      newNextBtn.style.cursor = 'pointer';
      newNextBtn.style.pointerEvents = 'auto';
      console.log('✅ Next button activated and working');
    }
    
    // Previous button - ENHANCED
    if (prevBtn) {
      // Remove any existing listeners to prevent duplicates
      const newPrevBtn = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
      
      newPrevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          // Auto-save before going back
          autosave();
          
          if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
            console.log('✅ Moved to step', currentStep + 1);
          }
        } catch (error) {
          console.error('Previous button error:', error);
          alert('Error navigating. Please try again.');
        }
      });
      
      newPrevBtn.disabled = false;
      newPrevBtn.style.cursor = 'pointer';
      newPrevBtn.style.pointerEvents = 'auto';
      console.log('✅ Previous button activated and working');
    }

    // Step indicator clicks - ENHANCED
    document.querySelectorAll('.step-indicator').forEach((ind, i) => {
      ind.addEventListener('click', function(e) {
        e.preventDefault();
        try {
          if (i <= currentStep) {
            currentStep = i;
            showStep(currentStep);
            console.log('✅ Navigated to step', currentStep + 1, 'via indicator');
          }
        } catch (error) {
          console.error('Step indicator error:', error);
        }
      });
      ind.style.cursor = 'pointer';
    });

    // Save button - ENHANCED: Separate button, always active
    if (saveBtn) {
      // Remove any existing listeners to prevent duplicates
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      
      newSaveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          console.log('💾 Save button clicked - Manual save triggered');
          manualSave();
          
          // Visual feedback
          newSaveBtn.classList.add('btn-success');
          newSaveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Saved!';
          setTimeout(() => {
            newSaveBtn.classList.remove('btn-success');
            newSaveBtn.classList.add('btn-warning');
            newSaveBtn.innerHTML = '<i class="bi bi-save me-1"></i>Save Progress';
          }, 2000);
          
          console.log('✅ Manual save completed');
        } catch (error) {
          console.error('Save error:', error);
          alert('Error saving progress. Please try again.');
        }
      });
      
      // Ensure button is always active and visible
      newSaveBtn.disabled = false;
      newSaveBtn.style.cursor = 'pointer';
      newSaveBtn.style.pointerEvents = 'auto';
      newSaveBtn.style.display = 'block';
      newSaveBtn.classList.remove('disabled');
      console.log('✅ Save button activated and always available');
    }

  // Autosave on input change (debounced)
  let autosaveTimeout;
  form.addEventListener('input', function() {
    clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(autosave, 2000);
  });

    // Form submission - ENHANCED with error handling and browser compatibility
    // Remove any existing listeners to prevent duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('📝 Form submission triggered');
      
      // Ensure submit button is enabled
      const currentSubmitBtn = document.getElementById('submitBtn');
      if (currentSubmitBtn) {
        currentSubmitBtn.disabled = false;
      }
      
      if (!newForm.checkValidity()) {
        console.warn('⚠️ Form validation failed');
        newForm.classList.add('was-validated');
        
        // Show validation errors
        const firstInvalid = newForm.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      console.log('✅ Form validation passed - proceeding with submission');

      const user = getCurrentUser();
      if (!user) {
        alert('Please login to submit your application.');
        window.location.href = 'index.html';
        return;
      }

      // Collect all form data - ENHANCED for browser compatibility
      const formData = new FormData(newForm);
      
      // Also collect data from all inputs directly (fallback for older browsers)
      const allFormData = {};
      const inputs = newForm.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.type === 'radio') {
          if (input.checked) allFormData[input.name] = input.value;
        } else if (input.type === 'checkbox') {
          allFormData[input.name] = input.checked;
        } else if (input.id) {
          allFormData[input.id] = input.value;
        }
      });
    
    // Generate unique application ID
    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0') + 1;
    const appID = `GSA/${year}/${counter.toString().padStart(4, '0')}`;
    
    const applicationData = {
      appID: appID,
      applicantEmail: user.email,
      applicantName: `${user.firstName} ${user.lastName}`,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending Ward Review', // Changed to Pending Ward Review - awaiting approval
      // Include location from user registration
      subCounty: user.subCounty || 'N/A',
      ward: user.ward || 'N/A',
      village: user.village || '',
      // CRITICAL: Add ID number and birth certificate for duplicate detection
      idNumber: user.nemisId || user.idNumber || '',
      nemisId: user.nemisId || user.idNumber || '', // For compatibility
      birthCertificate: user.birthCertificate || '',
      dateOfBirth: user.dateOfBirth || '',
      isFinalSubmission: true, // Final submission - cannot be edited
      personalDetails: {
        firstNames: allFormData['firstNames'] || document.getElementById('firstNames')?.value || '',
        middleName: allFormData['middleName'] || document.getElementById('middleName')?.value || '',
        lastName: allFormData['lastNameApp'] || document.getElementById('lastNameApp')?.value || '',
        gender: allFormData['genderApp'] || document.getElementById('genderApp')?.value || '',
        studentPhone: allFormData['studentPhone'] || document.getElementById('studentPhone')?.value || '',
        parentPhone: allFormData['parentPhone'] || document.getElementById('parentPhone')?.value || '',
        institution: allFormData['institutionName'] || document.getElementById('institutionName')?.value || '',
        regNumber: allFormData['regNumber'] || document.getElementById('regNumber')?.value || '',
        yearForm: allFormData['yearForm'] || document.getElementById('yearForm')?.value || '',
        courseNature: allFormData['courseNature'] || document.getElementById('courseNature')?.value || '',
        courseDuration: allFormData['courseDuration'] || document.getElementById('courseDuration')?.value || '',
        // Include location in personalDetails too for compatibility
        subCounty: user.subCounty || 'N/A',
        ward: user.ward || 'N/A'
      },
      familyDetails: {
        parentStatus: newForm.querySelector('input[name="parentStatus"]:checked')?.value || allFormData['parentStatus'] || '',
        hasDisability: newForm.querySelector('input[name="hasDisability"]:checked')?.value || allFormData['hasDisability'] || '',
        disabilityDescription: allFormData['disabilityDescription'] || document.getElementById('disabilityDescription')?.value || '',
        fatherName: allFormData['fatherName'] || document.getElementById('fatherName')?.value || '',
        fatherOccupation: allFormData['fatherOccupation'] || document.getElementById('fatherOccupation')?.value || '',
        motherName: allFormData['motherName'] || document.getElementById('motherName')?.value || '',
        motherOccupation: allFormData['motherOccupation'] || document.getElementById('motherOccupation')?.value || '',
        guardianName: allFormData['guardianName'] || document.getElementById('guardianName')?.value || '',
        guardianOccupation: allFormData['guardianOccupation'] || document.getElementById('guardianOccupation')?.value || '',
        totalSiblings: parseInt(allFormData['totalSiblings'] || document.getElementById('totalSiblings')?.value || 0),
        guardianChildren: parseInt(allFormData['guardianChildren'] || document.getElementById('guardianChildren')?.value || 0),
        siblingsWorking: parseInt(allFormData['siblingsWorking'] || document.getElementById('siblingsWorking')?.value || 0),
        siblingsSecondary: parseInt(allFormData['siblingsSecondary'] || document.getElementById('siblingsSecondary')?.value || 0),
        siblingsPostSecondary: parseInt(allFormData['siblingsPostSecondary'] || document.getElementById('siblingsPostSecondary')?.value || 0),
        educationPayer: newForm.querySelector('input[name="educationPayer"]:checked')?.value || allFormData['educationPayer'] || '',
        payerOtherSpecify: allFormData['payerOtherSpecify'] || document.getElementById('payerOtherSpecify')?.value || '',
        previousBenefit: newForm.querySelector('input[name="previousBenefit"]:checked')?.value || allFormData['previousBenefit'] || '',
        previousAmount: parseInt(allFormData['previousAmount'] || document.getElementById('previousAmount')?.value || 0),
        previousYear: parseInt(allFormData['previousYear'] || document.getElementById('previousYear')?.value || 0)
      },
      institutionDetails: {
        principalName: allFormData['principalName'] || document.getElementById('principalName')?.value || '',
        principalPhone: allFormData['principalPhone'] || document.getElementById('principalPhone')?.value || '',
        principalComments: allFormData['principalComments'] || document.getElementById('principalComments')?.value || '',
        discipline: newForm.querySelector('input[name="discipline"]:checked')?.value || allFormData['discipline'] || '',
        outstandingFees: parseInt(allFormData['outstandingFees'] || document.getElementById('outstandingFees')?.value || 0)
      },
      financialDetails: {
        monthlyIncome: parseInt(allFormData['monthlyIncome'] || document.getElementById('monthlyIncome')?.value || 0),
        totalAnnualFees: parseInt(allFormData['totalAnnualFees'] || document.getElementById('totalAnnualFees')?.value || 0),
        feeBalance: parseInt(allFormData['feeBalance'] || document.getElementById('feeBalance')?.value || 0),
        amountRequested: parseInt(allFormData['amountRequested'] || document.getElementById('amountRequested')?.value || 0),
        justification: allFormData['justification'] || document.getElementById('justification')?.value || ''
      }
    };

    // Save application to UNIFIED DATABASE (Firebase or localStorage)
    try {
      // Use unified database access layer - check both saveApplication and window.saveApplication
      const saveFn = typeof saveApplication !== 'undefined' ? saveApplication : 
                     (typeof window.saveApplication !== 'undefined' ? window.saveApplication : null);
      
      if (saveFn) {
        // Use unified database access layer (async or sync)
        const result = saveFn(applicationData);
        
        // Handle async result
        if (result && typeof result.then === 'function') {
          await result;
          console.log('✅ Application submitted and saved to UNIFIED DATABASE (async):', appID);
        } else {
          console.log('✅ Application submitted and saved to UNIFIED DATABASE (sync):', appID);
        }
        
        // Also ensure localStorage is updated for immediate sync
        const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const existingIndex = applications.findIndex(a => a.appID === appID);
        if (existingIndex >= 0) {
          applications[existingIndex] = applicationData;
        } else {
          applications.push(applicationData);
        }
        localStorage.setItem('mbms_applications', JSON.stringify(applications));
        console.log('✅ Application also saved to localStorage for sync:', appID);
      } else {
        // Fallback to direct localStorage access
        const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const existingIndex = applications.findIndex(a => a.appID === appID);
        if (existingIndex >= 0) {
          applications[existingIndex] = applicationData;
        } else {
          applications.push(applicationData);
        }
        localStorage.setItem('mbms_applications', JSON.stringify(applications));
        console.log('✅ Application submitted and saved (localStorage fallback):', appID);
        
        // Trigger event manually for fallback
        window.dispatchEvent(new CustomEvent('mbms-data-updated', {
          detail: { key: 'mbms_applications', action: 'added', appID: appID }
        }));
      }
    } catch (error) {
      console.error('❌ Error saving application:', error);
      // Fallback to localStorage
      const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      const existingIndex = applications.findIndex(a => a.appID === appID);
      if (existingIndex >= 0) {
        applications[existingIndex] = applicationData;
      } else {
        applications.push(applicationData);
      }
      localStorage.setItem('mbms_applications', JSON.stringify(applications));
      console.log('✅ Application saved via fallback:', appID);
      
      // Trigger event manually for fallback
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'added', appID: appID }
      }));
    }
    
    // Update counter using unified database
    if (typeof incrementApplicationCounter !== 'undefined') {
      incrementApplicationCounter();
    } else {
      localStorage.setItem('mbms_application_counter', counter.toString());
    }
    
    // Get updated count
    const updatedApps = typeof window.getApplications !== 'undefined' ? await window.getApplications() : 
                       JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    
    console.log('📊 Total applications now:', updatedApps.length);
    console.log('📋 Status: Pending Ward Review - Awaiting approval');
    console.log('💾 Database: UNIFIED DATABASE (mbms_applications)');
    console.log('✅ Same database admin portal, reports, and visualizations read from');
    
    // Show modern success message
    const successModal = document.createElement('div');
    successModal.className = 'modal fade';
    successModal.id = 'submissionSuccessModal';
    successModal.setAttribute('tabindex', '-1');
    successModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-body text-center p-5">
            <div class="mb-4">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
            </div>
            <h3 class="text-success mb-3">✅ Submission Successful!</h3>
            <div class="alert alert-info text-start mb-4">
              <p class="mb-2"><strong>Application ID:</strong> ${appID}</p>
              <p class="mb-2"><strong>Status:</strong> <span class="badge bg-info">Pending Ward Review</span></p>
              <p class="mb-0">Your application has been submitted and will appear on the admin dashboard immediately.</p>
            </div>
            <div class="alert alert-warning text-start mb-4">
              <small><strong>⚠️ Important:</strong> This is a FINAL SUBMISSION. You cannot edit this application.</small>
            </div>
            <p class="text-muted mb-4">You will be notified once a decision is made (Awarded or Rejected).</p>
            <button type="button" class="btn btn-primary-700 btn-lg" onclick="window.location.href='applicant_dashboard.html'">
              <i class="bi bi-arrow-right me-2"></i>Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(successModal);
    
    // Show modal
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(successModal);
      bsModal.show();
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        window.location.href = 'applicant_dashboard.html';
      }, 5000);
    } else {
      // Fallback alert
      alert('✅ Application submitted successfully!\n\n📋 Application ID: ' + appID + '\n📋 Status: Pending Ward Review\n\n🔄 Your application will appear on the admin dashboard immediately.\n\n📧 You will be notified once a decision is made.\n\n⚠️ IMPORTANT: This is a FINAL SUBMISSION. You CANNOT edit this application.');
      setTimeout(() => {
        window.location.href = 'applicant_dashboard.html';
      }, 2000);
    }

    // Remove draft
    const applicationKey = `mbms_application_${user.email}`;
    localStorage.removeItem(applicationKey);

    // Update application counter
    localStorage.setItem('mbms_application_counter', counter.toString());
    
    console.log('✅ Application submitted:', appID);
    
    // Get final count
    const finalApps = typeof window.getApplications !== 'undefined' ? await window.getApplications() : 
                     JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    console.log('📊 Total applications now:', finalApps.length);
    
    // CRITICAL: Trigger multiple events to ensure admin dashboard updates
    // Event 1: Custom event for admin dashboard
    window.dispatchEvent(new CustomEvent('mbms-data-updated', {
      detail: { 
        key: 'mbms_applications', 
        action: 'submitted', 
        appID: appID,
        application: applicationData
      }
    }));
    
    // Event 2: Storage event for cross-tab sync
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
    
    // Event 3: Force localStorage update (triggers storage events)
    const currentApps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    localStorage.setItem('mbms_applications', JSON.stringify(currentApps));
    
    // Event 4: Additional trigger after a short delay
    setTimeout(() => {
      localStorage.setItem('mbms_applications', JSON.stringify(currentApps));
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { 
          key: 'mbms_applications', 
          action: 'submitted', 
          appID: appID 
        }
      }));
    }, 500);
    
    console.log('✅ All events triggered - Admin dashboard should update automatically');
    
      // Redirect to applicant dashboard - ENHANCED with browser compatibility
      setTimeout(() => {
        try {
          window.location.href = 'applicant_dashboard.html';
        } catch (error) {
          console.error('Redirect error:', error);
          // Fallback for older browsers
          window.location = 'applicant_dashboard.html';
        }
      }, 1500);
  });

    // Initialize
    loadSavedApplication();
    showStep(currentStep);
    
    // Ensure all buttons are active and responsive - ENHANCED
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.opacity = '1';
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.style.display = 'block';
      saveBtn.classList.remove('disabled');
    }
    
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.cursor = 'pointer';
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.classList.remove('disabled');
    }
    
    if (prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.cursor = 'pointer';
      prevBtn.style.opacity = '1';
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.classList.remove('disabled');
    }
    
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.cursor = 'pointer';
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.classList.remove('disabled');
    }
    
    // Ensure all form inputs are active
    const allInputs = form.querySelectorAll('input, select, textarea, button');
    allInputs.forEach(input => {
      if (input.type !== 'hidden' && input.id !== 'submitBtn') {
        input.disabled = false;
        input.style.pointerEvents = 'auto';
        input.style.opacity = '1';
      }
    });
    
    console.log('✅ All buttons and inputs activated');
    console.log('💾 Database: localStorage (same for all components)');
    console.log('✅ System ready for use');
  }
})();

