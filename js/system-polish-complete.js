// COMPREHENSIVE SYSTEM POLISH - Fixes all issues, activates all buttons, enables all dropdowns
// This script ensures the entire system is working correctly

(function() {
  'use strict';
  
  console.log('🔧 SYSTEM POLISH - Initializing comprehensive fixes...');
  
  // ============================================
  // 1. ACTIVATE ALL DROPDOWNS
  // ============================================
  function activateAllDropdowns() {
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
      select.disabled = false;
      select.style.pointerEvents = 'auto';
      select.style.opacity = '1';
      select.style.cursor = 'pointer';
      select.removeAttribute('disabled');
      select.classList.remove('disabled');
      
      // Ensure all options are enabled
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        option.disabled = false;
        option.removeAttribute('disabled');
      });
      
      console.log('✅ Activated dropdown:', select.id || select.name || 'unnamed');
    });
    
    console.log(`✅ Activated ${allSelects.length} dropdowns`);
  }
  
  // ============================================
  // 2. ENABLE ALL BUTTONS
  // ============================================
  function enableAllButtons() {
    const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn');
    allButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.removeAttribute('disabled');
      btn.classList.remove('disabled');
      
      // Remove any overlay that might block clicks
      const overlay = btn.parentElement?.querySelector('.disabled-overlay');
      if (overlay) overlay.remove();
      
      console.log('✅ Enabled button:', btn.id || btn.className || 'unnamed');
    });
    
    console.log(`✅ Enabled ${allButtons.length} buttons`);
  }
  
  // ============================================
  // 3. ACTIVATE ALL FORM INPUTS
  // ============================================
  function activateAllInputs() {
    const allInputs = document.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
      if (input.type !== 'hidden') {
        input.disabled = false;
        input.readOnly = false;
        input.style.pointerEvents = 'auto';
        input.style.opacity = '1';
        input.style.cursor = input.type === 'text' || input.type === 'textarea' ? 'text' : 'pointer';
        input.removeAttribute('disabled');
        input.removeAttribute('readonly');
        input.classList.remove('disabled', 'readonly');
      }
    });
    
    console.log(`✅ Activated ${allInputs.length} form inputs`);
  }
  
  // ============================================
  // 4. FIX GENDER DROPDOWN SPECIFICALLY
  // ============================================
  function fixGenderDropdown() {
    const genderSelect = document.getElementById('genderApp');
    if (genderSelect) {
      genderSelect.disabled = false;
      genderSelect.style.pointerEvents = 'auto';
      genderSelect.style.opacity = '1';
      genderSelect.style.cursor = 'pointer';
      genderSelect.removeAttribute('disabled');
      
      // Ensure options are populated
      if (genderSelect.options.length <= 1) {
        genderSelect.innerHTML = `
          <option value="">-- Select Gender --</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        `;
      }
      
      console.log('✅ Gender dropdown fixed and activated');
    }
  }
  
  // ============================================
  // 5. FIX SUB-COUNTY AND WARD DROPDOWNS
  // ============================================
  function fixLocationDropdowns() {
    const subCountySelect = document.getElementById('subCounty');
    const wardSelect = document.getElementById('ward');
    
    if (subCountySelect) {
      subCountySelect.disabled = false;
      subCountySelect.style.pointerEvents = 'auto';
      subCountySelect.style.opacity = '1';
      subCountySelect.style.cursor = 'pointer';
      subCountySelect.removeAttribute('disabled');
      
      // Populate if empty and GARISSA_WARDS is available
      if (subCountySelect.options.length <= 1 && typeof GARISSA_WARDS !== 'undefined') {
        subCountySelect.innerHTML = '<option value="">-- Select Sub-County --</option>';
        Object.keys(GARISSA_WARDS).forEach(sc => {
          subCountySelect.add(new Option(sc, sc));
        });
        subCountySelect.add(new Option('Other (Specify below)', 'other_subcounty'));
      }
      
      console.log('✅ Sub-county dropdown fixed');
    }
    
    if (wardSelect) {
      wardSelect.disabled = false;
      wardSelect.style.pointerEvents = 'auto';
      wardSelect.style.opacity = '1';
      wardSelect.style.cursor = 'pointer';
      wardSelect.removeAttribute('disabled');
      console.log('✅ Ward dropdown fixed');
    }
  }
  
  // ============================================
  // 6. ENSURE ALL NAVIGATION BUTTONS WORK
  // ============================================
  function fixNavigationButtons() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    [nextBtn, prevBtn, submitBtn, saveBtn].forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.removeAttribute('disabled');
        btn.classList.remove('disabled');
        console.log('✅ Navigation button enabled:', btn.id);
      }
    });
  }
  
  // ============================================
  // 7. COMPREHENSIVE INITIALIZATION
  // ============================================
  function initializeSystemPolish() {
    // Run all fixes
    activateAllDropdowns();
    enableAllButtons();
    activateAllInputs();
    fixGenderDropdown();
    fixLocationDropdowns();
    fixNavigationButtons();
    
    // Re-run after a delay to catch dynamically added elements
    setTimeout(() => {
      activateAllDropdowns();
      enableAllButtons();
      activateAllInputs();
      fixGenderDropdown();
      fixLocationDropdowns();
      fixNavigationButtons();
    }, 1000);
    
    // Also run on DOM mutations
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        activateAllDropdowns();
        enableAllButtons();
        activateAllInputs();
        fixGenderDropdown();
        fixLocationDropdowns();
        fixNavigationButtons();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'class']
      });
    }
    
    console.log('✅ System polish complete - All elements activated');
  }
  
  // ============================================
  // 8. RUN ON PAGE LOAD
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystemPolish);
  } else {
    initializeSystemPolish();
  }
  
  // Also run immediately
  initializeSystemPolish();
  
  // Export function for manual activation
  window.activateAllSystemElements = function() {
    activateAllDropdowns();
    enableAllButtons();
    activateAllInputs();
    fixGenderDropdown();
    fixLocationDropdowns();
    fixNavigationButtons();
    console.log('✅ All system elements manually activated');
  };
  
  console.log('✅ System Polish script loaded');
})();

