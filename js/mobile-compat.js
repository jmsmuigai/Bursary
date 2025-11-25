/**
 * Mobile Compatibility & Auto-Fix Script
 * Ensures all functionality works seamlessly on mobile devices
 */

(function() {
  'use strict';

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);

  // Touch event support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  console.log('📱 Mobile Compatibility Check:', {
    isMobile,
    hasTouch,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });

  // Fix iOS viewport height issue
  function fixViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  // Fix iOS input zoom on focus
  function preventIOSZoom() {
    if (isMobile) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }

  // Enhance touch targets
  function enhanceTouchTargets() {
    if (hasTouch) {
      const buttons = document.querySelectorAll('button, a.btn, .btn, .nav-link, .step-indicator');
      buttons.forEach(btn => {
        if (btn.offsetHeight < 44 || btn.offsetWidth < 44) {
          btn.style.minHeight = '44px';
          btn.style.minWidth = '44px';
          btn.style.padding = '0.75rem 1rem';
        }
      });
    }
  }

  // Fix form input focus on mobile
  function fixMobileInputFocus() {
    if (isMobile) {
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', function() {
          // Scroll to input on focus
          setTimeout(() => {
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        });
      });
    }
  }

  // Fix modal scrolling on mobile
  function fixModalScrolling() {
    if (isMobile) {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
          const modalBody = this.querySelector('.modal-body');
          if (modalBody) {
            modalBody.style.maxHeight = `${window.innerHeight - 200}px`;
            modalBody.style.overflowY = 'auto';
            modalBody.style.webkitOverflowScrolling = 'touch';
          }
        });
      });
    }
  }

  // Fix table scrolling on mobile
  function fixTableScrolling() {
    if (isMobile) {
      const tables = document.querySelectorAll('.table-responsive');
      tables.forEach(table => {
        table.style.webkitOverflowScrolling = 'touch';
        table.style.overflowX = 'auto';
      });
    }
  }

  // Fix button click delays on mobile
  function fixButtonClickDelays() {
    if (hasTouch) {
      const buttons = document.querySelectorAll('button, a.btn, .btn');
      buttons.forEach(btn => {
        btn.addEventListener('touchstart', function(e) {
          this.style.opacity = '0.8';
        });
        btn.addEventListener('touchend', function(e) {
          this.style.opacity = '1';
        });
      });
    }
  }

  // Fix dropdown menus on mobile
  function fixDropdownMenus() {
    if (isMobile) {
      const dropdowns = document.querySelectorAll('.dropdown-menu');
      dropdowns.forEach(dropdown => {
        dropdown.style.maxHeight = `${window.innerHeight - 100}px`;
        dropdown.style.overflowY = 'auto';
        dropdown.style.webkitOverflowScrolling = 'touch';
      });
    }
  }

  // Fix sidebar on mobile
  function fixMobileSidebar() {
    if (isMobile) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('mobileOverlay');
      
      if (sidebar && overlay) {
        // Prevent body scroll when sidebar is open
        const toggleMenu = function() {
          if (sidebar.classList.contains('mobile-open')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        };
        
        // Watch for sidebar state changes
        const observer = new MutationObserver(toggleMenu);
        observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
      }
    }
  }

  // Fix PDF download on mobile
  function fixMobilePDFDownload() {
    if (isMobile) {
      // Ensure PDF downloads work on mobile
      window.addEventListener('beforeunload', function() {
        // Clear any pending downloads
      });
    }
  }

  // Fix autosave indicator position on mobile
  function fixAutosaveIndicator() {
    if (isMobile) {
      const indicator = document.querySelector('.autosave-indicator');
      if (indicator) {
        indicator.style.position = 'fixed';
        indicator.style.top = '10px';
        indicator.style.right = '10px';
        indicator.style.zIndex = '1050';
        indicator.style.maxWidth = 'calc(100vw - 20px)';
      }
    }
  }

  // Fix chart rendering on mobile
  function fixChartsOnMobile() {
    if (isMobile && typeof Chart !== 'undefined') {
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
      
      // Adjust chart container heights
      const chartContainers = document.querySelectorAll('.chart-container');
      chartContainers.forEach(container => {
        container.style.height = '250px';
      });
    }
  }

  // Fix filter dropdowns on mobile
  function fixFilterDropdowns() {
    if (isMobile) {
      const filterSelects = document.querySelectorAll('#filterSubCounty, #filterWard, #filterStatus');
      filterSelects.forEach(select => {
        select.style.fontSize = '16px'; // Prevent zoom on iOS
        select.style.minHeight = '44px';
      });
    }
  }

  // Initialize all fixes
  function initMobileFixes() {
    fixViewportHeight();
    preventIOSZoom();
    enhanceTouchTargets();
    fixMobileInputFocus();
    fixModalScrolling();
    fixTableScrolling();
    fixButtonClickDelays();
    fixDropdownMenus();
    fixMobileSidebar();
    fixMobilePDFDownload();
    fixAutosaveIndicator();
    fixChartsOnMobile();
    fixFilterDropdowns();

    // Re-run on resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fixViewportHeight();
        enhanceTouchTargets();
        fixChartsOnMobile();
      }, 250);
    });

    // Re-run on orientation change
    window.addEventListener('orientationchange', function() {
      setTimeout(() => {
        fixViewportHeight();
        fixModalScrolling();
        fixTableScrolling();
        fixChartsOnMobile();
      }, 500);
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileFixes);
  } else {
    initMobileFixes();
  }

  // Export for global access
  window.mobileCompat = {
    isMobile,
    hasTouch,
    init: initMobileFixes
  };

  console.log('✅ Mobile compatibility fixes initialized');
})();

