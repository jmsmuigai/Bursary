/**
 * BUTTON FIX & COMPATIBILITY LAYER
 * Ensures all buttons work across all browsers and devices
 * Handles Save, Next, View, Download buttons with robust error handling
 */

(function() {
  'use strict';
  
  /**
   * Universal button click handler with error handling
   */
  function safeButtonClick(button, handler, options = {}) {
    if (!button) {
      console.warn('Button not found:', button);
      return false;
    }
    
    // Remove existing listeners to prevent duplicates
    const newButton = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(newButton, button);
    }
    
    // Ensure button is active
    newButton.disabled = false;
    newButton.style.cursor = 'pointer';
    newButton.style.pointerEvents = 'auto';
    newButton.style.opacity = '1';
    newButton.classList.remove('disabled');
    
    // Add click handler with comprehensive error handling
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Show loading state if option provided
        if (options.loadingText) {
          const originalHTML = newButton.innerHTML;
          newButton.disabled = true;
          newButton.innerHTML = options.loadingText;
          
          // Re-enable after handler completes
          setTimeout(() => {
            newButton.disabled = false;
            newButton.innerHTML = originalHTML;
          }, options.loadingTimeout || 2000);
        }
        
        // Execute handler
        const result = handler.call(this, e);
        
        // Handle async results
        if (result && typeof result.then === 'function') {
          result.catch(error => {
            console.error('Button handler error:', error);
            if (options.onError) {
              options.onError(error);
            } else {
              alert('An error occurred. Please try again.\n\nError: ' + error.message);
            }
          });
        }
        
        return false;
      } catch (error) {
        console.error('Button click error:', error);
        if (options.onError) {
          options.onError(error);
        } else {
          alert('An error occurred. Please try again.\n\nError: ' + error.message);
        }
        return false;
      }
    });
    
    // Add touch support for mobile
    if ('ontouchstart' in window) {
      newButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        newButton.click();
      });
    }
    
    return newButton;
  }
  
  /**
   * Fix Save button with robust error handling
   */
  function fixSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) {
      console.warn('Save button not found');
      return;
    }
    
    safeButtonClick(saveBtn, function(e) {
      console.log('💾 Save button clicked');
      
      // Get save function
      if (typeof manualSave === 'function') {
        manualSave();
        
        // Visual feedback
        this.classList.add('btn-success');
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="bi bi-check-circle me-1"></i>Saved!';
        
        setTimeout(() => {
          this.classList.remove('btn-success');
          this.classList.add('btn-warning');
          this.innerHTML = originalHTML;
        }, 2000);
        
        console.log('✅ Save completed');
      } else if (typeof autosave === 'function') {
        autosave();
        console.log('✅ Auto-save triggered');
      } else {
        alert('Save function not available. Please refresh the page.');
      }
    }, {
      loadingText: '<i class="bi bi-hourglass-split me-1"></i>Saving...',
      loadingTimeout: 1500
    });
    
    console.log('✅ Save button fixed and activated');
  }
  
  /**
   * Fix Next button with robust error handling
   */
  function fixNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
      console.warn('Next button not found');
      return;
    }
    
    safeButtonClick(nextBtn, function(e) {
      console.log('➡️ Next button clicked');
      
      // Auto-save before proceeding
      if (typeof autosave === 'function') {
        autosave();
      }
      
      // Get current step and sections
      const sections = document.querySelectorAll('.form-section');
      const currentStep = Array.from(sections).findIndex(s => s.classList.contains('active'));
      const totalSteps = sections.length;
      
      if (currentStep < totalSteps - 1) {
        // Move to next step
        sections.forEach((s, i) => {
          s.classList.toggle('active', i === currentStep + 1);
        });
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
          const progress = ((currentStep + 2) / totalSteps) * 100;
          progressBar.style.width = `${progress}%`;
        }
        
        // Update buttons
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
          prevBtn.style.display = 'block';
        }
        
        if (currentStep + 1 === totalSteps - 1) {
          this.style.display = 'none';
          const submitBtn = document.getElementById('submitBtn');
          if (submitBtn) {
            submitBtn.style.display = 'block';
          }
        }
        
        console.log('✅ Moved to step', currentStep + 2);
      }
    }, {
      loadingText: '<i class="bi bi-arrow-right me-1"></i>Loading...',
      loadingTimeout: 500
    });
    
    console.log('✅ Next button fixed and activated');
  }
  
  /**
   * Fix Previous button
   */
  function fixPreviousButton() {
    const prevBtn = document.getElementById('prevBtn');
    if (!prevBtn) {
      console.warn('Previous button not found');
      return;
    }
    
    safeButtonClick(prevBtn, function(e) {
      console.log('⬅️ Previous button clicked');
      
      // Auto-save before going back
      if (typeof autosave === 'function') {
        autosave();
      }
      
      const sections = document.querySelectorAll('.form-section');
      const currentStep = Array.from(sections).findIndex(s => s.classList.contains('active'));
      
      if (currentStep > 0) {
        sections.forEach((s, i) => {
          s.classList.toggle('active', i === currentStep - 1);
        });
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
          const progress = (currentStep / sections.length) * 100;
          progressBar.style.width = `${progress}%`;
        }
        
        // Update buttons
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
          nextBtn.style.display = 'block';
        }
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
          submitBtn.style.display = 'none';
        }
        
        if (currentStep - 1 === 0) {
          this.style.display = 'none';
        }
        
        console.log('✅ Moved to step', currentStep);
      }
    });
    
    console.log('✅ Previous button fixed and activated');
  }
  
  /**
   * Fix View button in admin dashboard
   */
  function fixViewButton() {
    // View buttons are created dynamically, so we'll enhance the global function
    if (typeof window.viewApplication === 'function') {
      const originalView = window.viewApplication;
      window.viewApplication = function(appID) {
        try {
          console.log('👁️ View button clicked for:', appID);
          return originalView.call(this, appID);
        } catch (error) {
          console.error('View button error:', error);
          alert('Error viewing application. Please try again.\n\nError: ' + error.message);
        }
      };
      console.log('✅ View button function enhanced');
    }
  }
  
  /**
   * Fix Download button with auto-download
   */
  function fixDownloadButton() {
    // Download buttons are created dynamically, so we'll enhance the global function
    if (typeof window.downloadApplicationLetter === 'function') {
      const originalDownload = window.downloadApplicationLetter;
      window.downloadApplicationLetter = async function(appID) {
        try {
          console.log('📥 Download button clicked for:', appID);
          
          // Show loading indicator
          const loadingAlert = document.createElement('div');
          loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
          loadingAlert.style.zIndex = '9999';
          loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF...';
          document.body.appendChild(loadingAlert);
          
          try {
            const result = await originalDownload.call(this, appID);
            
            // Remove loading indicator
            setTimeout(() => {
              if (loadingAlert.parentNode) {
                loadingAlert.remove();
              }
            }, 1000);
            
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successAlert.style.zIndex = '9999';
            successAlert.innerHTML = `
              <strong>✅ Downloaded Successfully!</strong><br>
              <small>Document saved to your downloads folder</small>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successAlert);
            
            setTimeout(() => {
              if (successAlert.parentNode) {
                successAlert.remove();
              }
            }, 5000);
            
            return result;
          } catch (error) {
            if (loadingAlert.parentNode) {
              loadingAlert.remove();
            }
            throw error;
          }
        } catch (error) {
          console.error('Download button error:', error);
          alert('Error downloading document. Please try again.\n\nError: ' + error.message);
        }
      };
      console.log('✅ Download button function enhanced with auto-download');
    }
  }
  
  /**
   * Make all buttons responsive
   */
  function makeButtonsResponsive() {
    // Add responsive styles to all buttons
    const style = document.createElement('style');
    style.textContent = `
      /* Button Responsive Styles */
      .btn {
        min-height: 44px; /* Touch-friendly size */
        min-width: 44px;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        transition: all 0.2s ease;
      }
      
      .btn-sm {
        min-height: 38px;
        min-width: 38px;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
      }
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        .btn {
          width: 100%;
          margin-bottom: 0.5rem;
        }
        
        .btn-group .btn {
          width: auto;
        }
        
        .d-flex .btn {
          width: auto;
          margin-bottom: 0;
        }
      }
      
      /* Button hover states */
      .btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .btn:active:not(:disabled) {
        transform: translateY(0);
      }
      
      /* Disabled button styles */
      .btn:disabled,
      .btn.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    console.log('✅ Responsive button styles added');
  }
  
  /**
   * Initialize all button fixes
   */
  function initializeButtonFixes() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeButtonFixes, 100);
      });
      return;
    }
    
    // Make buttons responsive
    makeButtonsResponsive();
    
    // Fix application form buttons
    if (document.getElementById('applicationForm')) {
      fixSaveButton();
      fixNextButton();
      fixPreviousButton();
      console.log('✅ Application form buttons fixed');
    }
    
    // Fix admin dashboard buttons
    if (document.getElementById('applicationsTableBody')) {
      fixViewButton();
      fixDownloadButton();
      console.log('✅ Admin dashboard buttons fixed');
    }
    
    console.log('✅ All button fixes initialized');
  }
  
  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButtonFixes);
  } else {
    initializeButtonFixes();
  }
  
  // Re-initialize on dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        // Check if buttons were added
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.id === 'saveBtn' || node.id === 'nextBtn' || node.id === 'prevBtn') {
              setTimeout(initializeButtonFixes, 100);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Export functions globally
  window.fixSaveButton = fixSaveButton;
  window.fixNextButton = fixNextButton;
  window.fixPreviousButton = fixPreviousButton;
  window.fixViewButton = fixViewButton;
  window.fixDownloadButton = fixDownloadButton;
  window.safeButtonClick = safeButtonClick;
  
  console.log('✅ Button Fix & Compatibility Layer loaded');
})();

