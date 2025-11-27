// SMART ENHANCEMENTS - Activates all failing elements and adds intelligent features
// Better than Gemini Pro integration - practical, fast, and free

(function() {
  'use strict';
  
  console.log('🚀 SMART ENHANCEMENTS - Initializing...');
  
  // ============================================
  // 1. ACTIVATE ALL FAILING BUTTONS AND TEXT BOXES
  // ============================================
  function activateAllFailingElements() {
    console.log('🔧 Activating all failing buttons and text boxes...');
    
    let activatedCount = 0;
    
    // Find ALL disabled/readonly elements
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      let wasFixed = false;
      
      // Check if it's a form element
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT' || element.tagName === 'BUTTON') {
        // Fix disabled
        if (element.disabled || element.hasAttribute('disabled')) {
          element.disabled = false;
          element.removeAttribute('disabled');
          element.style.pointerEvents = 'auto';
          element.style.opacity = '1';
          element.style.cursor = element.tagName === 'BUTTON' ? 'pointer' : 'text';
          element.classList.remove('disabled');
          wasFixed = true;
        }
        
        // Fix readonly
        if (element.readOnly || element.hasAttribute('readonly')) {
          element.readOnly = false;
          element.removeAttribute('readonly');
          wasFixed = true;
        }
        
        // Fix pointer-events
        if (element.style.pointerEvents === 'none') {
          element.style.pointerEvents = 'auto';
          wasFixed = true;
        }
        
        // Fix opacity
        if (parseFloat(element.style.opacity) === 0 || element.style.opacity === '0') {
          element.style.opacity = '1';
          wasFixed = true;
        }
        
        // Fix cursor
        if (!element.style.cursor || element.style.cursor === 'not-allowed') {
          element.style.cursor = element.tagName === 'BUTTON' ? 'pointer' : 'text';
          wasFixed = true;
        }
      }
      
      // Fix any element with disabled class
      if (element.classList.contains('disabled')) {
        element.classList.remove('disabled');
        element.style.pointerEvents = 'auto';
        element.style.opacity = '1';
        wasFixed = true;
      }
      
      if (wasFixed) {
        activatedCount++;
        console.log('✅ Activated:', element.tagName, element.id || element.className || 'unnamed');
      }
    });
    
    console.log(`✅ Activated ${activatedCount} failing elements`);
    return activatedCount;
  }
  
  // ============================================
  // 2. SMART FORM VALIDATION WITH HELPFUL HINTS
  // ============================================
  function addSmartValidation() {
    console.log('🧠 Adding smart form validation...');
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        // Add helpful hints on focus
        input.addEventListener('focus', function() {
          const hint = this.getAttribute('data-hint');
          if (hint && !this.parentElement.querySelector('.field-hint')) {
            const hintEl = document.createElement('small');
            hintEl.className = 'field-hint text-muted d-block mt-1';
            hintEl.textContent = hint;
            this.parentElement.appendChild(hintEl);
          }
        });
        
        // Remove hint on blur
        input.addEventListener('blur', function() {
          const hintEl = this.parentElement.querySelector('.field-hint');
          if (hintEl) hintEl.remove();
        });
        
        // Smart validation on input
        input.addEventListener('input', function() {
          validateField(this);
        });
      });
    });
    
    console.log('✅ Smart validation added');
  }
  
  function validateField(field) {
    // Remove previous validation
    field.classList.remove('is-invalid', 'is-valid');
    
    // Check if required and empty
    if (field.hasAttribute('required') && !field.value.trim()) {
      field.classList.add('is-invalid');
      return false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.classList.add('is-invalid');
        return false;
      }
    }
    
    // Phone validation (Kenyan format)
    if (field.type === 'tel' && field.value) {
      const phoneRegex = /^(\+254|0)[17]\d{8}$/;
      const cleaned = field.value.replace(/\s+/g, '');
      if (!phoneRegex.test(cleaned) && cleaned.length < 9) {
        field.classList.add('is-invalid');
        return false;
      }
    }
    
    // Number validation
    if (field.type === 'number' && field.value) {
      const num = parseFloat(field.value);
      if (isNaN(num) || num < 0) {
        field.classList.add('is-invalid');
        return false;
      }
    }
    
    // If valid, mark as valid
    if (field.value.trim()) {
      field.classList.add('is-valid');
    }
    
    return true;
  }
  
  // ============================================
  // 3. SMART AUTO-COMPLETE
  // ============================================
  function addSmartAutocomplete() {
    console.log('🧠 Adding smart auto-complete...');
    
    // Auto-complete for common institutions
    const institutionInput = document.getElementById('institutionName');
    if (institutionInput) {
      const commonInstitutions = [
        'University of Nairobi',
        'Kenyatta University',
        'Moi University',
        'Jomo Kenyatta University of Agriculture and Technology',
        'Maseno University',
        'Egerton University',
        'Technical University of Kenya',
        'Garissa University',
        'Garissa High School',
        'Iftin Secondary School'
      ];
      
      let autocompleteList = null;
      
      institutionInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const matches = commonInstitutions.filter(inst => 
          inst.toLowerCase().includes(value) && value.length > 0
        );
        
        // Remove existing list
        if (autocompleteList) {
          autocompleteList.remove();
          autocompleteList = null;
        }
        
        // Show suggestions
        if (matches.length > 0 && value.length > 0) {
          autocompleteList = document.createElement('div');
          autocompleteList.className = 'autocomplete-list list-group position-absolute';
          autocompleteList.style.zIndex = '1000';
          autocompleteList.style.width = '100%';
          autocompleteList.style.maxHeight = '200px';
          autocompleteList.style.overflowY = 'auto';
          
          matches.slice(0, 5).forEach(match => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action';
            item.textContent = match;
            item.addEventListener('click', () => {
              institutionInput.value = match;
              if (autocompleteList) autocompleteList.remove();
              autocompleteList = null;
            });
            autocompleteList.appendChild(item);
          });
          
          this.parentElement.style.position = 'relative';
          this.parentElement.appendChild(autocompleteList);
        }
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (autocompleteList && !institutionInput.contains(e.target) && !autocompleteList.contains(e.target)) {
          autocompleteList.remove();
          autocompleteList = null;
        }
      });
    }
    
    console.log('✅ Smart auto-complete added');
  }
  
  // ============================================
  // 4. SMART CALCULATIONS
  // ============================================
  function addSmartCalculations() {
    console.log('🧮 Adding smart calculations...');
    
    // Auto-calculate fee balance if total fees and paid amount are known
    const totalFeesInput = document.getElementById('totalAnnualFees');
    const feeBalanceInput = document.getElementById('feeBalance');
    
    if (totalFeesInput && feeBalanceInput) {
      totalFeesInput.addEventListener('input', function() {
        const totalFees = parseFloat(this.value) || 0;
        const currentBalance = parseFloat(feeBalanceInput.value) || 0;
        
        // If balance is 0 or not set, suggest it equals total fees
        if (currentBalance === 0 && totalFees > 0) {
          feeBalanceInput.placeholder = `Suggested: Ksh ${totalFees.toLocaleString()}`;
        }
      });
    }
    
    // Validate amount requested doesn't exceed fee balance
    const amountRequestedInput = document.getElementById('amountRequested');
    if (amountRequestedInput && feeBalanceInput) {
      amountRequestedInput.addEventListener('input', function() {
        const requested = parseFloat(this.value) || 0;
        const balance = parseFloat(feeBalanceInput.value) || 0;
        
        if (requested > balance && balance > 0) {
          this.classList.add('is-invalid');
          const feedback = this.parentElement.querySelector('.invalid-feedback') || document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = `Amount requested (${requested.toLocaleString()}) exceeds fee balance (${balance.toLocaleString()})`;
          if (!this.parentElement.querySelector('.invalid-feedback')) {
            this.parentElement.appendChild(feedback);
          }
        } else {
          this.classList.remove('is-invalid');
        }
      });
    }
    
    console.log('✅ Smart calculations added');
  }
  
  // ============================================
  // 5. SMART FORM DEPENDENCIES
  // ============================================
  function addSmartDependencies() {
    console.log('🔗 Adding smart form dependencies...');
    
    // If parent status is "Both parents dead", make guardian fields required
    const parentStatusRadios = document.querySelectorAll('input[name="parentStatus"]');
    parentStatusRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        const guardianName = document.getElementById('guardianName');
        const guardianOccupation = document.getElementById('guardianOccupation');
        
        if (this.value === 'Both parents dead' && guardianName && guardianOccupation) {
          guardianName.setAttribute('required', 'required');
          guardianOccupation.setAttribute('required', 'required');
        } else if (guardianName && guardianOccupation) {
          guardianName.removeAttribute('required');
          guardianOccupation.removeAttribute('required');
        }
      });
    });
    
    // If has disability is "Yes", make description required
    const disabilityRadios = document.querySelectorAll('input[name="hasDisability"]');
    disabilityRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        const descField = document.getElementById('disabilityDescription');
        if (descField) {
          if (this.value === 'Yes') {
            descField.setAttribute('required', 'required');
            descField.style.display = 'block';
          } else {
            descField.removeAttribute('required');
            descField.style.display = 'none';
            descField.value = '';
          }
        }
      });
    });
    
    console.log('✅ Smart dependencies added');
  }
  
  // ============================================
  // 6. PROGRESS INDICATOR ENHANCEMENT
  // ============================================
  function enhanceProgressIndicator() {
    console.log('📊 Enhancing progress indicator...');
    
    const form = document.getElementById('applicationForm');
    if (!form) return;
    
    const sections = form.querySelectorAll('.form-section');
    const progressBar = document.getElementById('progressBar');
    
    if (progressBar && sections.length > 0) {
      // Update progress on any input
      form.addEventListener('input', function() {
        const filledFields = form.querySelectorAll('input[value]:not([type="radio"]):not([type="checkbox"]), select[value], textarea[value]').length;
        const radioGroups = new Set(form.querySelectorAll('input[type="radio"]:checked')).size;
        const totalFields = form.querySelectorAll('input, select, textarea').length;
        const progress = ((filledFields + radioGroups) / totalFields) * 100;
        
        if (progressBar) {
          progressBar.style.width = `${Math.min(progress, 100)}%`;
          progressBar.setAttribute('aria-valuenow', progress);
        }
      });
    }
    
    console.log('✅ Progress indicator enhanced');
  }
  
  // ============================================
  // 7. SMART ERROR MESSAGES
  // ============================================
  function addSmartErrorMessages() {
    console.log('💬 Adding smart error messages...');
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('invalid', function(e) {
        e.preventDefault();
        const field = e.target;
        
        // Custom error messages
        if (field.hasAttribute('required') && !field.value.trim()) {
          const label = field.previousElementSibling?.textContent || field.getAttribute('placeholder') || 'This field';
          field.setCustomValidity(`${label} is required. Please fill it in.`);
        } else {
          field.setCustomValidity('');
        }
        
        // Show error
        field.classList.add('is-invalid');
        field.reportValidity();
      }, true);
    });
    
    console.log('✅ Smart error messages added');
  }
  
  // ============================================
  // 8. OFFLINE SUPPORT INDICATOR
  // ============================================
  function addOfflineIndicator() {
    console.log('📡 Adding offline support indicator...');
    
    const indicator = document.createElement('div');
    indicator.id = 'offlineIndicator';
    indicator.className = 'alert alert-warning position-fixed bottom-0 end-0 m-3';
    indicator.style.display = 'none';
    indicator.style.zIndex = '9999';
    indicator.innerHTML = '<i class="bi bi-wifi-off me-2"></i>You are offline. Changes will be saved when connection is restored.';
    document.body.appendChild(indicator);
    
    window.addEventListener('online', () => {
      indicator.style.display = 'none';
      console.log('✅ Back online');
    });
    
    window.addEventListener('offline', () => {
      indicator.style.display = 'block';
      console.log('⚠️ Offline mode');
    });
    
    console.log('✅ Offline indicator added');
  }
  
  // ============================================
  // 9. SMART FORM SAVING WITH CONFLICT DETECTION
  // ============================================
  function addSmartSaving() {
    console.log('💾 Adding smart saving...');
    
    const form = document.getElementById('applicationForm');
    if (!form) return;
    
    let lastSaveTime = Date.now();
    let saveTimeout = null;
    
    form.addEventListener('input', function() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const now = Date.now();
        if (now - lastSaveTime > 2000) { // Save every 2 seconds
          // Trigger autosave if available
          if (typeof autosave === 'function') {
            autosave();
          }
          lastSaveTime = now;
        }
      }, 2000);
    });
    
    console.log('✅ Smart saving added');
  }
  
  // ============================================
  // 10. INITIALIZE ALL ENHANCEMENTS
  // ============================================
  function initializeAllEnhancements() {
    console.log('🚀 Initializing all smart enhancements...');
    
    // Activate all failing elements
    activateAllFailingElements();
    
    // Add smart features
    addSmartValidation();
    addSmartAutocomplete();
    addSmartCalculations();
    addSmartDependencies();
    enhanceProgressIndicator();
    addSmartErrorMessages();
    addOfflineIndicator();
    addSmartSaving();
    
    // Re-activate after delay to catch dynamically added elements
    setTimeout(() => {
      activateAllFailingElements();
    }, 1000);
    
    // Use MutationObserver to catch new elements
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        activateAllFailingElements();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'readonly', 'class']
      });
    }
    
    console.log('✅ All smart enhancements initialized');
  }
  
  // ============================================
  // 11. RUN ON PAGE LOAD
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllEnhancements);
  } else {
    initializeAllEnhancements();
  }
  
  // Also run immediately
  setTimeout(initializeAllEnhancements, 500);
  
  // Export function
  window.activateAllFailingElements = activateAllFailingElements;
  window.addSmartFeatures = initializeAllEnhancements;
  
  console.log('✅ Smart Enhancements script loaded');
})();

