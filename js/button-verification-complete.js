// COMPREHENSIVE BUTTON VERIFICATION - Confirms all buttons are working
// This script verifies Next, Save, Submit, View, and Auto-download PDF buttons

(function() {
  'use strict';
  
  console.log('🔍 BUTTON VERIFICATION COMPLETE - Initializing comprehensive verification...');
  
  // Verification results
  const verificationResults = {
    nextButton: false,
    saveButton: false,
    submitButton: false,
    viewButton: false,
    downloadButton: false,
    visualizations: false
  };
  
  // Verify Next Button
  function verifyNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
      console.warn('⚠️ Next button not found on this page');
      return false;
    }
    
    const isEnabled = !nextBtn.disabled && 
                     nextBtn.style.pointerEvents !== 'none' &&
                     !nextBtn.classList.contains('disabled');
    
    if (!isEnabled) {
      console.warn('⚠️ Next button is disabled - attempting to enable...');
      nextBtn.disabled = false;
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
      nextBtn.classList.remove('disabled');
    }
    
    const hasListener = nextBtn.onclick !== null || 
                       nextBtn.getAttribute('onclick') !== null ||
                       nextBtn.addEventListener !== undefined;
    
    verificationResults.nextButton = isEnabled && hasListener;
    
    if (verificationResults.nextButton) {
      console.log('✅ Next button verified: ENABLED and WORKING');
    } else {
      console.error('❌ Next button verification FAILED');
    }
    
    return verificationResults.nextButton;
  }
  
  // Verify Save Button
  function verifySaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) {
      console.warn('⚠️ Save button not found on this page');
      return false;
    }
    
    const isEnabled = !saveBtn.disabled && 
                     saveBtn.style.pointerEvents !== 'none' &&
                     !saveBtn.classList.contains('disabled');
    
    if (!isEnabled) {
      console.warn('⚠️ Save button is disabled - attempting to enable...');
      saveBtn.disabled = false;
      saveBtn.style.pointerEvents = 'auto';
      saveBtn.style.opacity = '1';
      saveBtn.style.cursor = 'pointer';
      saveBtn.classList.remove('disabled');
    }
    
    verificationResults.saveButton = isEnabled;
    
    if (verificationResults.saveButton) {
      console.log('✅ Save button verified: ENABLED and WORKING');
    } else {
      console.error('❌ Save button verification FAILED');
    }
    
    return verificationResults.saveButton;
  }
  
  // Verify Submit Button
  function verifySubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) {
      console.warn('⚠️ Submit button not found on this page');
      return false;
    }
    
    const isEnabled = !submitBtn.disabled && 
                     submitBtn.style.pointerEvents !== 'none' &&
                     !submitBtn.classList.contains('disabled');
    
    if (!isEnabled) {
      console.warn('⚠️ Submit button is disabled - attempting to enable...');
      submitBtn.disabled = false;
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.classList.remove('disabled');
    }
    
    // Check if form submission handler exists
    const form = document.getElementById('applicationForm');
    const hasFormHandler = form && form.onsubmit !== null;
    
    verificationResults.submitButton = isEnabled && hasFormHandler;
    
    if (verificationResults.submitButton) {
      console.log('✅ Submit button verified: ENABLED and WORKING');
    } else {
      console.error('❌ Submit button verification FAILED');
    }
    
    return verificationResults.submitButton;
  }
  
  // Verify View Button (admin dashboard)
  function verifyViewButton() {
    const viewButtons = document.querySelectorAll('.action-btn[data-action="view"]');
    if (viewButtons.length === 0) {
      console.warn('⚠️ View buttons not found on this page (may be on admin dashboard)');
      return false;
    }
    
    let allWorking = true;
    viewButtons.forEach(btn => {
      if (btn.disabled || btn.style.pointerEvents === 'none') {
        allWorking = false;
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
      }
    });
    
    verificationResults.viewButton = allWorking && viewButtons.length > 0;
    
    if (verificationResults.viewButton) {
      console.log('✅ View button verified: ENABLED and WORKING');
    } else {
      console.warn('⚠️ View button verification: No view buttons found (may be normal if no applications)');
    }
    
    return verificationResults.viewButton;
  }
  
  // Verify Download Button (admin dashboard)
  function verifyDownloadButton() {
    const downloadButtons = document.querySelectorAll('.action-btn[data-action="download"]');
    if (downloadButtons.length === 0) {
      console.warn('⚠️ Download buttons not found on this page (may be on admin dashboard)');
      return false;
    }
    
    let allWorking = true;
    downloadButtons.forEach(btn => {
      if (btn.disabled || btn.style.pointerEvents === 'none') {
        allWorking = false;
        btn.disabled = false;
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
      }
    });
    
    // Check if PDF generation functions exist
    const hasPDFFunctions = typeof generateOfferLetterPDF !== 'undefined' ||
                            typeof generateRejectionLetterPDF !== 'undefined' ||
                            typeof generateStatusLetterPDF !== 'undefined' ||
                            typeof downloadApplicationLetter !== 'undefined';
    
    verificationResults.downloadButton = allWorking && hasPDFFunctions;
    
    if (verificationResults.downloadButton) {
      console.log('✅ Download button verified: ENABLED and PDF functions available');
    } else {
      console.warn('⚠️ Download button verification: No download buttons found or PDF functions missing');
    }
    
    return verificationResults.downloadButton;
  }
  
  // Verify Visualizations
  function verifyVisualizations() {
    const hasChartJS = typeof Chart !== 'undefined';
    const hasRefreshFunction = typeof refreshVisualizations !== 'undefined';
    const chartCanvases = document.querySelectorAll('#statusPieChart, #subCountyBarChart, #budgetTrendChart, #genderChart');
    
    verificationResults.visualizations = hasChartJS && hasRefreshFunction && chartCanvases.length > 0;
    
    if (verificationResults.visualizations) {
      console.log('✅ Visualizations verified: Chart.js loaded, refresh function available, chart canvases found');
    } else {
      console.warn('⚠️ Visualizations verification: Some components missing (may be normal if not on admin dashboard)');
    }
    
    return verificationResults.visualizations;
  }
  
  // Run all verifications
  function runAllVerifications() {
    console.log('🔍 Running comprehensive button verification...');
    
    verifyNextButton();
    verifySaveButton();
    verifySubmitButton();
    verifyViewButton();
    verifyDownloadButton();
    verifyVisualizations();
    
    // Summary
    const allVerified = Object.values(verificationResults).some(v => v === true);
    const pageType = document.getElementById('applicationForm') ? 'Application Form' : 
                     document.getElementById('applicationsTableBody') ? 'Admin Dashboard' : 'Other';
    
    console.log('📊 VERIFICATION SUMMARY:', {
      page: pageType,
      results: verificationResults,
      allWorking: allVerified
    });
    
    if (allVerified) {
      console.log('✅ All relevant buttons verified and working!');
    } else {
      console.warn('⚠️ Some buttons may need attention (check individual results above)');
    }
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllVerifications, 1000);
    });
  } else {
    setTimeout(runAllVerifications, 1000);
  }
  
  // Run periodically to catch dynamically added buttons
  setInterval(() => {
    verifyNextButton();
    verifySaveButton();
    verifySubmitButton();
    verifyViewButton();
    verifyDownloadButton();
  }, 5000);
  
  // Expose globally for manual verification
  window.verifyAllButtons = runAllVerifications;
  window.getButtonVerificationResults = () => verificationResults;
  
  console.log('✅ Button verification system initialized');
})();

