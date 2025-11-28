// MOBILE PERFORMANCE OPTIMIZER - Makes system load quickly on mobile
// Optimizes loading, enables all elements, ensures responsiveness

(function() {
  'use strict';
  
  console.log('⚡ MOBILE PERFORMANCE OPTIMIZER - Initializing...');
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);
  
  // ============================================
  // 1. OPTIMIZE LOADING SPEED
  // ============================================
  function optimizeLoadingSpeed() {
    if (!isMobile) return;
    
    console.log('⚡ Optimizing loading speed for mobile...');
    
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
        // Defer scripts that are not critical
        const src = script.getAttribute('src');
        if (src && !src.includes('bootstrap') && !src.includes('data.js') && !src.includes('auth.js')) {
          script.defer = true;
        }
      }
    });
    
    // Lazy load images
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
    
    // Preconnect to external resources
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://cdn.jsdelivr.net';
    document.head.appendChild(preconnect);
    
    console.log('✅ Loading speed optimized');
  }
  
  // ============================================
  // 2. ENABLE ALL TEXTBOXES ON MOBILE
  // ============================================
  function enableAllTextboxes() {
    console.log('📝 Enabling all textboxes...');
    
    const textboxes = document.querySelectorAll('input, textarea');
    let enabledCount = 0;
    
    textboxes.forEach(input => {
      if (input.type === 'hidden') return;
      
      const wasDisabled = input.disabled || input.readOnly;
      
      input.disabled = false;
      input.readOnly = false;
      input.style.pointerEvents = 'auto';
      input.style.opacity = '1';
      input.style.cursor = 'text';
      input.style.minHeight = isMobile ? '44px' : 'auto'; // Touch-friendly on mobile
      input.style.fontSize = isMobile ? '16px' : ''; // Prevent zoom on iOS
      input.classList.remove('disabled', 'readonly');
      input.removeAttribute('disabled');
      input.removeAttribute('readonly');
      
      // Ensure responsive
      if (isMobile) {
        input.style.width = '100%';
        input.style.maxWidth = '100%';
      }
      
      if (wasDisabled) {
        enabledCount++;
      }
    });
    
    console.log(`✅ Enabled ${enabledCount} textboxes`);
  }
  
  // ============================================
  // 3. ENABLE ALL DROPDOWNS ON MOBILE
  // ============================================
  function enableAllDropdowns() {
    console.log('📋 Enabling all dropdowns...');
    
    const dropdowns = document.querySelectorAll('select');
    let enabledCount = 0;
    
    dropdowns.forEach(select => {
      const wasDisabled = select.disabled;
      
      select.disabled = false;
      select.style.pointerEvents = 'auto';
      select.style.opacity = '1';
      select.style.cursor = 'pointer';
      select.style.minHeight = isMobile ? '44px' : 'auto'; // Touch-friendly
      select.style.fontSize = isMobile ? '16px' : ''; // Prevent zoom on iOS
      select.style.width = isMobile ? '100%' : '';
      select.style.maxWidth = isMobile ? '100%' : '';
      select.classList.remove('disabled');
      select.removeAttribute('disabled');
      
      // Enable all options
      Array.from(select.options).forEach(option => {
        option.disabled = false;
        option.removeAttribute('disabled');
      });
      
      // Ensure responsive
      if (isMobile) {
        select.style.padding = '0.75rem';
      }
      
      if (wasDisabled) {
        enabledCount++;
      }
    });
    
    // Fix gender dropdown specifically
    const genderSelect = document.getElementById('genderApp');
    if (genderSelect) {
      genderSelect.disabled = false;
      genderSelect.style.pointerEvents = 'auto';
      genderSelect.style.opacity = '1';
      genderSelect.style.minHeight = isMobile ? '44px' : 'auto';
      genderSelect.style.fontSize = isMobile ? '16px' : '';
      
      if (genderSelect.options.length <= 1) {
        genderSelect.innerHTML = `
          <option value="">-- Select Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        `;
      }
      console.log('✅ Fixed gender dropdown');
    }
    
    // Fix sub-county and ward dropdowns
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    
    if (subCountySelect) {
      subCountySelect.disabled = false;
      subCountySelect.style.pointerEvents = 'auto';
      subCountySelect.style.minHeight = isMobile ? '44px' : 'auto';
      subCountySelect.style.fontSize = isMobile ? '16px' : '';
    }
    
    if (wardSelect) {
      wardSelect.disabled = false;
      wardSelect.style.pointerEvents = 'auto';
      wardSelect.style.minHeight = isMobile ? '44px' : 'auto';
      wardSelect.style.fontSize = isMobile ? '16px' : '';
    }
    
    console.log(`✅ Enabled ${enabledCount} dropdowns`);
  }
  
  // ============================================
  // 4. ENSURE RESPONSIVE BEHAVIOR
  // ============================================
  function ensureResponsive() {
    console.log('📱 Ensuring responsive behavior...');
    
    // Make all form elements responsive
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (isMobile) {
        form.style.width = '100%';
        form.style.maxWidth = '100%';
      }
    });
    
    // Make all containers responsive
    const containers = document.querySelectorAll('.container, .container-fluid');
    containers.forEach(container => {
      if (isMobile) {
        container.style.paddingLeft = '15px';
        container.style.paddingRight = '15px';
      }
    });
    
    // Make cards responsive
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (isMobile) {
        card.style.marginBottom = '1rem';
        card.style.borderRadius = '0.5rem';
      }
    });
    
    // Make tables responsive
    const tables = document.querySelectorAll('.table-responsive');
    tables.forEach(table => {
      if (isMobile) {
        table.style.webkitOverflowScrolling = 'touch';
        table.style.overflowX = 'auto';
        table.style.width = '100%';
      }
    });
    
    console.log('✅ Responsive behavior ensured');
  }
  
  // ============================================
  // 5. OPTIMIZE TOUCH INTERACTIONS
  // ============================================
  function optimizeTouchInteractions() {
    if (!isMobile) return;
    
    console.log('👆 Optimizing touch interactions...');
    
    // Enhance button touch targets
    const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
    buttons.forEach(btn => {
      if (btn.offsetHeight < 44 || btn.offsetWidth < 44) {
        btn.style.minHeight = '44px';
        btn.style.minWidth = '44px';
        btn.style.padding = '0.75rem 1rem';
      }
      
      // Add touch feedback
      btn.addEventListener('touchstart', function() {
        this.style.opacity = '0.8';
      });
      btn.addEventListener('touchend', function() {
        this.style.opacity = '1';
      });
    });
    
    // Enhance input touch targets
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.offsetHeight < 44) {
        input.style.minHeight = '44px';
        input.style.padding = '0.75rem';
      }
    });
    
    console.log('✅ Touch interactions optimized');
  }
  
  // ============================================
  // 6. FIX VIEWPORT FOR MOBILE
  // ============================================
  function fixViewport() {
    if (!isMobile) return;
    
    console.log('📱 Fixing viewport...');
    
    // Fix iOS viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newVh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${newVh}px`);
      }, 100);
    });
    
    // Fix viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    
    console.log('✅ Viewport fixed');
  }
  
  // ============================================
  // 7. COMPREHENSIVE MOBILE OPTIMIZATION
  // ============================================
  function runMobileOptimization() {
    console.log('🚀 Running comprehensive mobile optimization...');
    
    // Run all optimizations
    optimizeLoadingSpeed();
    enableAllTextboxes();
    enableAllDropdowns();
    ensureResponsive();
    optimizeTouchInteractions();
    fixViewport();
    
    // Summary
    const summary = `
⚡ MOBILE OPTIMIZATION COMPLETE

✅ Loading speed optimized
✅ All textboxes enabled and responsive
✅ All dropdowns enabled and responsive
✅ Touch interactions optimized
✅ Viewport fixed
✅ Responsive behavior ensured

System is now optimized for mobile!
    `;
    
    console.log(summary);
    
    // Show notification
    if (isMobile) {
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        notification.style.zIndex = '10000';
        notification.style.maxWidth = '90%';
        notification.innerHTML = `
          <strong>✅ Mobile Optimized!</strong><br>
          <small>All textboxes and dropdowns are enabled and responsive.</small>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) notification.remove();
        }, 3000);
      }, 1000);
    }
  }
  
  // ============================================
  // 8. EXPORT FUNCTIONS
  // ============================================
  window.runMobileOptimization = runMobileOptimization;
  window.enableAllTextboxes = enableAllTextboxes;
  window.enableAllDropdowns = enableAllDropdowns;
  window.ensureResponsive = ensureResponsive;
  
  // ============================================
  // 9. AUTO-RUN
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runMobileOptimization, 500);
    });
  } else {
    setTimeout(runMobileOptimization, 500);
  }
  
  // Run again after delay to catch dynamically loaded content
  setTimeout(runMobileOptimization, 2000);
  setTimeout(runMobileOptimization, 5000);
  
  // Run on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(runMobileOptimization, 500);
  });
  
  console.log('✅ Mobile Performance Optimizer loaded');
})();

