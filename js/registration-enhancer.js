// REGISTRATION FORM ENHANCER - Activates all buttons, inputs, and dropdowns
// Ensures smooth registration experience with Save and Submit functionality

(function() {
  'use strict';
  
  console.log('🔧 REGISTRATION FORM ENHANCER - Initializing...');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceRegistrationForm);
  } else {
    enhanceRegistrationForm();
  }
  
  function enhanceRegistrationForm() {
    const form = document.getElementById('applicantRegistrationForm');
    if (!form) {
      console.warn('⚠️ Registration form not found, retrying...');
      setTimeout(enhanceRegistrationForm, 500);
      return;
    }
    
    console.log('✅ Registration form found - enhancing...');
    
    // Activate all inputs, selects, and buttons
    const allInputs = form.querySelectorAll('input, select, textarea, button');
    allInputs.forEach(input => {
      // Remove disabled attributes
      input.removeAttribute('disabled');
      input.disabled = false;
      input.style.pointerEvents = 'auto';
      input.style.opacity = '1';
      input.style.cursor = input.type === 'button' || input.type === 'submit' ? 'pointer' : 'text';
      input.classList.remove('disabled');
      
      // Ensure inputs are not readonly unless they should be
      if (input.type !== 'hidden' && input.id !== 'robotCheck') {
        input.removeAttribute('readonly');
      }
    });
    
    // Ensure ward dropdown is enabled when sub-county is selected
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    
    if (subCountySelect && wardSelect) {
      // Force enable ward dropdown if sub-county has a value
      if (subCountySelect.value && subCountySelect.value !== '' && subCountySelect.value !== 'other_subcounty') {
        wardSelect.disabled = false;
        wardSelect.style.pointerEvents = 'auto';
        wardSelect.style.opacity = '1';
        console.log('✅ Ward dropdown enabled');
      }
      
      // Enhanced sub-county change handler
      const originalHandler = subCountySelect.onchange;
      subCountySelect.addEventListener('change', function() {
        // Enable ward dropdown
        if (this.value && this.value !== '' && this.value !== 'other_subcounty') {
          wardSelect.disabled = false;
          wardSelect.style.pointerEvents = 'auto';
          wardSelect.style.opacity = '1';
          console.log('✅ Ward dropdown enabled after sub-county selection');
        }
        
        // Call original handler if exists
        if (originalHandler) {
          originalHandler.call(this);
        }
      });
    }
    
    // Ensure submit button is always enabled
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.classList.remove('disabled');
      console.log('✅ Submit button activated');
    }
    
    // Add Save Progress functionality
    addSaveProgressFeature();
    
    // Enhance form validation with better feedback
    enhanceFormValidation();
    
    // Add real-time validation feedback
    addRealTimeValidation();
    
    console.log('✅ Registration form enhanced - all inputs, dropdowns, and buttons activated');
  }
  
  // Add Save Progress feature
  function addSaveProgressFeature() {
    const form = document.getElementById('applicantRegistrationForm');
    if (!form) return;
    
    // Check if save button already exists
    let saveBtn = document.getElementById('saveProgressBtn');
    if (!saveBtn) {
      // Create save button
      saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.id = 'saveProgressBtn';
      saveBtn.className = 'btn btn-outline-warning w-100 py-2 mb-2';
      saveBtn.innerHTML = '<i class="bi bi-save me-2"></i>Save Progress';
      
      // Insert before submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn && submitBtn.parentElement) {
        submitBtn.parentElement.insertBefore(saveBtn, submitBtn);
      }
    }
    
    // Save progress functionality
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveRegistrationProgress();
    });
    
    // Auto-save on input change (debounced)
    let saveTimeout;
    form.addEventListener('input', function() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveRegistrationProgress(true); // Silent save
      }, 2000);
    });
  }
  
  // Save registration progress
  function saveRegistrationProgress(silent = false) {
    try {
      const form = document.getElementById('applicantRegistrationForm');
      if (!form) return;
      
      const formData = new FormData(form);
      const progress = {};
      
      // Collect all form data
      form.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type === 'radio') {
          if (input.checked) progress[input.name] = input.value;
        } else if (input.type === 'checkbox') {
          progress[input.name] = input.checked;
        } else if (input.id) {
          progress[input.id] = input.value;
        }
      });
      
      // Save to localStorage
      localStorage.setItem('mbms_registration_progress', JSON.stringify({
        ...progress,
        lastSaved: new Date().toISOString()
      }));
      
      if (!silent) {
        // Show save status
        const saveBtn = document.getElementById('saveProgressBtn');
        if (saveBtn) {
          const originalHTML = saveBtn.innerHTML;
          saveBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Saved!';
          saveBtn.classList.remove('btn-outline-warning');
          saveBtn.classList.add('btn-success');
          setTimeout(() => {
            saveBtn.innerHTML = originalHTML;
            saveBtn.classList.remove('btn-success');
            saveBtn.classList.add('btn-outline-warning');
          }, 2000);
        }
        console.log('✅ Registration progress saved');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
  
  // Load saved progress
  function loadSavedProgress() {
    try {
      const saved = localStorage.getItem('mbms_registration_progress');
      if (!saved) return;
      
      const progress = JSON.parse(saved);
      const form = document.getElementById('applicantRegistrationForm');
      if (!form) return;
      
      // Restore form values
      Object.keys(progress).forEach(key => {
        if (key === 'lastSaved') return;
        
        const input = document.getElementById(key) || form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'radio') {
            const radio = form.querySelector(`[name="${key}"][value="${progress[key]}"]`);
            if (radio) radio.checked = true;
          } else if (input.type === 'checkbox') {
            input.checked = progress[key];
          } else {
            input.value = progress[key];
          }
        }
      });
      
      // Trigger sub-county change to populate wards
      const subCountySelect = document.getElementById('subCounty');
      if (subCountySelect && progress.subCounty) {
        subCountySelect.dispatchEvent(new Event('change'));
      }
      
      console.log('✅ Registration progress loaded');
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  
  // Enhance form validation
  function enhanceFormValidation() {
    const form = document.getElementById('applicantRegistrationForm');
    if (!form) return;
    
    // Add custom validation
    form.addEventListener('submit', function(e) {
      // Ensure all required fields are filled
      const requiredFields = form.querySelectorAll('[required]');
      let allValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          allValid = false;
        } else {
          field.classList.remove('is-invalid');
          field.classList.add('is-valid');
        }
      });
      
      // Password match validation
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      if (password && confirmPassword) {
        if (password.value !== confirmPassword.value) {
          confirmPassword.classList.add('is-invalid');
          document.getElementById('passwordMatchFeedback').style.display = 'block';
          allValid = false;
        } else {
          confirmPassword.classList.remove('is-invalid');
          confirmPassword.classList.add('is-valid');
          document.getElementById('passwordMatchFeedback').style.display = 'none';
        }
      }
      
      if (!allValid) {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        
        // Scroll to first invalid field
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
      }
    });
  }
  
  // Add real-time validation feedback
  function addRealTimeValidation() {
    const form = document.getElementById('applicantRegistrationForm');
    if (!form) return;
    
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else if (this.value.trim()) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        }
      });
      
      input.addEventListener('input', function() {
        if (this.classList.contains('is-invalid') && this.value.trim()) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        }
      });
    });
    
    // Password match real-time validation
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    if (password && confirmPassword) {
      [password, confirmPassword].forEach(input => {
        input.addEventListener('input', function() {
          if (password.value && confirmPassword.value) {
            if (password.value === confirmPassword.value) {
              confirmPassword.classList.remove('is-invalid');
              confirmPassword.classList.add('is-valid');
              document.getElementById('passwordMatchFeedback').style.display = 'none';
            } else {
              confirmPassword.classList.remove('is-valid');
              confirmPassword.classList.add('is-invalid');
              document.getElementById('passwordMatchFeedback').style.display = 'block';
            }
          }
        });
      });
    }
  }
  
  // Load saved progress on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(loadSavedProgress, 500);
    });
  } else {
    setTimeout(loadSavedProgress, 500);
  }
  
  // Periodic activation check
  setInterval(() => {
    const form = document.getElementById('applicantRegistrationForm');
    if (form) {
      form.querySelectorAll('input, select, textarea, button').forEach(input => {
        if (input.disabled || input.style.pointerEvents === 'none') {
          input.disabled = false;
          input.style.pointerEvents = 'auto';
          input.style.opacity = '1';
        }
      });
    }
  }, 3000);
  
  console.log('✅ Registration form enhancer initialized');
})();

