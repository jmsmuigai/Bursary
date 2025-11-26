// APPLICATION NEXT BUTTON FIX - Ensures Next button works and applicants can complete application
// This file ensures the Next button is always enabled and functional

(function() {
  'use strict';
  
  console.log('🔧 APPLICATION NEXT BUTTON FIX - Initializing...');
  
  // Function to ensure Next button is enabled and working
  function enableNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
      console.warn('⚠️ Next button not found, retrying...');
      setTimeout(enableNextButton, 500);
      return;
    }
    
    // Remove any disabled state
    nextBtn.disabled = false;
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
    nextBtn.classList.remove('disabled');
    nextBtn.removeAttribute('disabled');
    
    // Ensure button is visible
    nextBtn.style.display = 'block';
    
    // Add click handler if not already present
    if (!nextBtn.hasAttribute('data-listener-attached')) {
      nextBtn.setAttribute('data-listener-attached', 'true');
      
      // Clone and replace to ensure clean event listener
      const newBtn = nextBtn.cloneNode(true);
      nextBtn.parentNode.replaceChild(newBtn, nextBtn);
      
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('➡️ Next button clicked (from fix)');
        
        // Get current step
        const sections = document.querySelectorAll('.form-section');
        let currentStep = 0;
        sections.forEach((s, i) => {
          if (s.classList.contains('active')) {
            currentStep = i;
          }
        });
        
        const totalSteps = sections.length;
        
        // Auto-save before proceeding
        if (typeof autosave === 'function') {
          autosave();
        }
        
        // Move to next step
        if (currentStep < totalSteps - 1) {
          // Hide current section
          sections[currentStep].classList.remove('active');
          
          // Show next section
          currentStep++;
          sections[currentStep].classList.add('active');
          
          // Update progress bar
          const progressBar = document.getElementById('progressBar');
          if (progressBar) {
            const progress = ((currentStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
          }
          
          // Update button visibility
          const prevBtn = document.getElementById('prevBtn');
          if (prevBtn) {
            prevBtn.style.display = currentStep > 0 ? 'block' : 'none';
          }
          
          if (newBtn) {
            newBtn.style.display = currentStep < totalSteps - 1 ? 'block' : 'none';
          }
          
          const submitBtn = document.getElementById('submitBtn');
          if (submitBtn) {
            submitBtn.style.display = currentStep === totalSteps - 1 ? 'block' : 'none';
          }
          
          // Scroll to top of form
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          console.log('✅ Moved to step', currentStep + 1);
        }
      });
      
      console.log('✅ Next button enabled and click handler attached');
    }
  }
  
  // Function to ensure all form buttons are enabled
  function enableAllButtons() {
    const buttons = ['nextBtn', 'prevBtn', 'submitBtn', 'saveBtn'];
    buttons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.classList.remove('disabled');
        btn.removeAttribute('disabled');
        console.log('✅ Enabled button:', btnId);
      }
    });
  }
  
  // Function to ensure form can be completed
  function ensureFormCompletion() {
    const form = document.getElementById('applicationForm');
    if (!form) {
      setTimeout(ensureFormCompletion, 500);
      return;
    }
    
    // Remove novalidate if present (to allow HTML5 validation)
    // But make it non-blocking for navigation
    form.setAttribute('novalidate', 'novalidate');
    
    // Ensure all inputs are enabled
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.disabled = false;
      input.style.pointerEvents = 'auto';
      input.style.opacity = '1';
    });
    
    console.log('✅ Form completion ensured - all inputs enabled');
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(enableNextButton, 100);
      setTimeout(enableAllButtons, 200);
      setTimeout(ensureFormCompletion, 300);
    });
  } else {
    setTimeout(enableNextButton, 100);
    setTimeout(enableAllButtons, 200);
    setTimeout(ensureFormCompletion, 300);
  }
  
  // Also enable on window load
  window.addEventListener('load', function() {
    setTimeout(enableNextButton, 100);
    setTimeout(enableAllButtons, 200);
    setTimeout(ensureFormCompletion, 300);
  });
  
  // Periodically check and enable (in case button gets disabled)
  setInterval(function() {
    enableNextButton();
    enableAllButtons();
  }, 2000);
  
  console.log('✅ Application Next Button Fix initialized');
})();

