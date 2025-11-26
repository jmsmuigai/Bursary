// NEXT BUTTON COMPLETE FIX - Ensures Next button works through all parts and enables submission
// This is a comprehensive fix that redesigns buttons and ensures perfect navigation

(function() {
  'use strict';
  
  console.log('🔧 NEXT BUTTON COMPLETE FIX - Initializing...');
  
  // Wait for DOM to be ready
  function initializeNextButtonFix() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (!nextBtn) {
      console.warn('⚠️ Next button not found, retrying...');
      setTimeout(initializeNextButtonFix, 500);
      return;
    }
    
    console.log('✅ Next button found - applying complete fix...');
    
    // Get current step from global scope or calculate
    let currentStep = 0;
    const sections = document.querySelectorAll('.form-section');
    const totalSteps = sections.length;
    
    // Find current active step
    sections.forEach((section, index) => {
      if (section.classList.contains('active')) {
        currentStep = index;
      }
    });
    
    console.log('📊 Current step:', currentStep + 1, 'of', totalSteps);
    
    // REDESIGN NEXT BUTTON - Modern, prominent, always enabled
    function redesignNextButton() {
      if (!nextBtn) return;
      
      // Modern styling
      nextBtn.className = 'btn btn-primary-700 btn-lg px-5 py-3';
      nextBtn.style.cssText = `
        background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1.1rem;
        box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
        transition: all 0.3s ease;
        cursor: pointer;
        pointer-events: auto;
        opacity: 1;
        display: block;
        min-width: 150px;
      `;
      
      // Hover effect
      nextBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.4)';
      });
      
      nextBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(139, 69, 19, 0.3)';
      });
      
      // Always enabled
      nextBtn.disabled = false;
      nextBtn.removeAttribute('disabled');
      nextBtn.classList.remove('disabled');
      
      console.log('✅ Next button redesigned and enabled');
    }
    
    // REDESIGN SAVE BUTTON - Modern, always visible
    function redesignSaveButton() {
      if (!saveBtn) return;
      
      saveBtn.className = 'btn btn-warning btn-lg px-4 py-2';
      saveBtn.style.cssText = `
        background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
        border: none;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 3px 10px rgba(255, 193, 7, 0.3);
        transition: all 0.3s ease;
        cursor: pointer;
        pointer-events: auto;
        opacity: 1;
        display: block;
      `;
      
      saveBtn.disabled = false;
      saveBtn.removeAttribute('disabled');
      saveBtn.classList.remove('disabled');
      
      console.log('✅ Save button redesigned and enabled');
    }
    
    // REDESIGN SUBMIT BUTTON - Modern, prominent
    function redesignSubmitButton() {
      if (!submitBtn) return;
      
      submitBtn.className = 'btn btn-success btn-lg px-5 py-3';
      submitBtn.style.cssText = `
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1.1rem;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        transition: all 0.3s ease;
        cursor: pointer;
        pointer-events: auto;
        opacity: 1;
        min-width: 200px;
      `;
      
      submitBtn.disabled = false;
      submitBtn.removeAttribute('disabled');
      submitBtn.classList.remove('disabled');
      
      console.log('✅ Submit button redesigned and enabled');
    }
    
    // ENHANCED NEXT BUTTON FUNCTIONALITY
    function setupNextButton() {
      // Remove existing listeners
      const newNextBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
      
      newNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('➡️ Next button clicked!');
        
        // Find current step
        let activeStep = 0;
        sections.forEach((section, index) => {
          if (section.classList.contains('active')) {
            activeStep = index;
          }
        });
        
        console.log('📊 Current step:', activeStep + 1, 'of', totalSteps);
        
        // Auto-save before proceeding
        if (typeof autosave === 'function') {
          autosave();
        } else if (typeof window.autosave === 'function') {
          window.autosave();
        }
        
        // Check if we can proceed
        if (activeStep < totalSteps - 1) {
          // Move to next step
          activeStep++;
          
          // Hide current section
          sections.forEach((section, index) => {
            section.classList.remove('active');
            if (index === activeStep) {
              section.classList.add('active');
            }
          });
          
          // Update progress bar
          const progressBar = document.getElementById('progressBar');
          if (progressBar) {
            const progress = ((activeStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
          }
          
          // Update step indicators
          document.querySelectorAll('.step-indicator').forEach((ind, i) => {
            if (i <= activeStep) {
              ind.style.color = '#8B4513';
              ind.style.fontWeight = 'bold';
            } else {
              ind.style.color = '#999';
              ind.style.fontWeight = 'normal';
            }
          });
          
          // Show/hide buttons
          if (prevBtn) {
            prevBtn.style.display = activeStep > 0 ? 'block' : 'none';
          }
          
          if (newNextBtn) {
            newNextBtn.style.display = activeStep < totalSteps - 1 ? 'block' : 'none';
          }
          
          if (submitBtn) {
            submitBtn.style.display = activeStep === totalSteps - 1 ? 'block' : 'none';
          }
          
          // Scroll to top of form
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Show success message
          const saveStatus = document.getElementById('saveStatus');
          const saveStatusText = document.getElementById('saveStatusText');
          if (saveStatus && saveStatusText) {
            saveStatus.className = 'alert alert-success alert-sm mb-0 shadow-sm';
            saveStatusText.textContent = `Moved to Part ${String.fromCharCode(65 + activeStep)}`;
            saveStatus.style.display = 'block';
            setTimeout(() => {
              saveStatus.style.display = 'none';
            }, 2000);
          }
          
          console.log('✅ Successfully moved to step', activeStep + 1);
          
          // Auto-save after moving
          setTimeout(() => {
            if (typeof autosave === 'function') {
              autosave();
            } else if (typeof window.autosave === 'function') {
              window.autosave();
            }
          }, 500);
        } else {
          console.log('⚠️ Already on last step');
        }
      });
      
      // Apply redesign
      redesignNextButton();
      
      console.log('✅ Next button setup complete');
    }
    
    // ENHANCED PREVIOUS BUTTON
    function setupPreviousButton() {
      if (!prevBtn) return;
      
      const newPrevBtn = prevBtn.cloneNode(true);
      prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
      
      newPrevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('⬅️ Previous button clicked!');
        
        // Find current step
        let activeStep = 0;
        sections.forEach((section, index) => {
          if (section.classList.contains('active')) {
            activeStep = index;
          }
        });
        
        if (activeStep > 0) {
          activeStep--;
          
          // Update sections
          sections.forEach((section, index) => {
            section.classList.remove('active');
            if (index === activeStep) {
              section.classList.add('active');
            }
          });
          
          // Update progress bar
          const progressBar = document.getElementById('progressBar');
          if (progressBar) {
            const progress = ((activeStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
          }
          
          // Update buttons
          if (newPrevBtn) {
            newPrevBtn.style.display = activeStep > 0 ? 'block' : 'none';
          }
          
          if (nextBtn) {
            nextBtn.style.display = activeStep < totalSteps - 1 ? 'block' : 'none';
          }
          
          if (submitBtn) {
            submitBtn.style.display = activeStep === totalSteps - 1 ? 'block' : 'none';
          }
          
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          console.log('✅ Moved to step', activeStep + 1);
        }
      });
      
      newPrevBtn.className = 'btn btn-secondary btn-lg px-4 py-3';
      newPrevBtn.style.cssText = `
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        pointer-events: auto;
        opacity: 1;
      `;
      newPrevBtn.disabled = false;
      
      console.log('✅ Previous button setup complete');
    }
    
    // Initialize all buttons
    setupNextButton();
    setupPreviousButton();
    redesignSaveButton();
    redesignSubmitButton();
    
    // Ensure buttons stay enabled
    setInterval(() => {
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.opacity = '1';
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.pointerEvents = 'auto';
        saveBtn.style.opacity = '1';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.pointerEvents = 'auto';
        submitBtn.style.opacity = '1';
      }
    }, 2000);
    
    console.log('✅ Next Button Complete Fix initialized successfully');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNextButtonFix);
  } else {
    initializeNextButtonFix();
  }
  
  // Also retry after a delay to catch dynamically loaded content
  setTimeout(initializeNextButtonFix, 1000);
  setTimeout(initializeNextButtonFix, 2000);
  
})();

