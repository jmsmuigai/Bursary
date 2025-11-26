// COMPLETE BUTTON FIX - Ensures ALL buttons work properly
// This file fixes all button issues and makes everything functional

(function() {
  'use strict';
  
  console.log('🔧 COMPLETE BUTTON FIX - Initializing...');
  
  /**
   * Fix Excel Download Button - Include ALL records
   */
  function fixExcelDownloadButton() {
    console.log('🔧 Fixing Excel download button...');
    
    // Remove old button and create new one
    const oldBtn = document.getElementById('downloadReportBtn');
    if (oldBtn) {
      const newBtn = oldBtn.cloneNode(true);
      oldBtn.parentNode.replaceChild(newBtn, oldBtn);
      
      // Attach fresh event listener
      newBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📊 Excel download button clicked');
        
        try {
          const reportType = document.getElementById('reportType')?.value || 'beneficiaries';
          const reportStatus = document.getElementById('reportStatus')?.value || 'All';
          
          // Get ALL applications from database
          let apps = [];
          if (typeof window.getApplications !== 'undefined') {
            try {
              apps = await window.getApplications();
            } catch (e) {
              console.warn('Firebase error, using localStorage:', e);
              apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
            }
          } else {
            apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
          }
          
          console.log('📊 Total applications found:', apps.length);
          
          // Filter based on status if needed
          let filtered = apps;
          if (reportStatus === 'Awarded') {
            filtered = apps.filter(a => a.status === 'Awarded');
          } else if (reportStatus === 'Pending') {
            filtered = apps.filter(a => a.status?.includes('Pending') || a.status === 'Pending Submission');
          } else if (reportStatus === 'Rejected') {
            filtered = apps.filter(a => a.status === 'Rejected');
          }
          // If 'All', use all apps
          
          console.log('📊 Filtered applications:', filtered.length);
          
          let rows = [];
          let filename = '';
          
          if (reportType === 'beneficiaries') {
            rows = [['Serial No', 'App ID', 'Applicant Name', 'Sub-County', 'Ward', 'Institution', 'Status', 'Amount Requested', 'Awarded Amount', 'Date Submitted', 'Date Awarded']];
            // Include ALL filtered applications
            filtered.forEach(app => {
              rows.push([
                app.awardDetails?.serialNumber || 'N/A',
                app.appID || 'N/A',
                app.applicantName || 'N/A',
                app.personalDetails?.subCounty || app.subCounty || 'N/A',
                app.personalDetails?.ward || app.ward || 'N/A',
                app.personalDetails?.institution || app.institution || 'N/A',
                app.status || 'N/A',
                (app.financialDetails?.amountRequested || 0).toString(),
                (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0).toString(),
                app.dateSubmitted ? new Date(app.dateSubmitted).toLocaleDateString() : 'N/A',
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
              ]);
            });
            filename = `garissa_bursary_beneficiaries_${new Date().toISOString().split('T')[0]}.csv`;
          } else if (reportType === 'allocation') {
            rows = [['Sub-County', 'Ward', 'Applicant Name', 'Institution', 'Amount Requested', 'Amount Awarded', 'Serial Number', 'Date Awarded']];
            const awarded = filtered.filter(a => a.status === 'Awarded');
            awarded.forEach(app => {
              rows.push([
                app.personalDetails?.subCounty || app.subCounty || 'N/A',
                app.personalDetails?.ward || app.ward || 'N/A',
                app.applicantName || 'N/A',
                app.personalDetails?.institution || app.institution || 'N/A',
                (app.financialDetails?.amountRequested || 0).toString(),
                (app.awardDetails?.committee_amount_kes || 0).toString(),
                app.awardDetails?.serialNumber || 'N/A',
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
              ]);
            });
            filename = `garissa_bursary_allocation_${new Date().toISOString().split('T')[0]}.csv`;
          } else if (reportType === 'demographics') {
            rows = [['Sub-County', 'Ward', 'Applicant Name', 'Gender', 'Education Level', 'Institution', 'Status', 'Amount Awarded']];
            filtered.forEach(app => {
              rows.push([
                app.personalDetails?.subCounty || app.subCounty || 'N/A',
                app.personalDetails?.ward || app.ward || 'N/A',
                app.applicantName || 'N/A',
                app.personalDetails?.gender || 'N/A',
                app.personalDetails?.courseNature || app.personalDetails?.yearForm || 'N/A',
                app.personalDetails?.institution || app.institution || 'N/A',
                app.status || 'N/A',
                (app.awardDetails?.committee_amount_kes || 0).toString()
              ]);
            });
            filename = `garissa_bursary_demographics_${new Date().toISOString().split('T')[0]}.csv`;
          } else if (reportType === 'budget') {
            const budget = typeof getBudgetBalance !== 'undefined' ? getBudgetBalance() : { total: 50000000, allocated: 0 };
            rows = [
              ['Budget Report', ''],
              ['Total Budget', budget.total.toString()],
              ['Total Allocated', budget.allocated.toString()],
              ['Remaining Balance', (budget.total - budget.allocated).toString()],
              ['Utilization Percentage', ((budget.allocated / budget.total) * 100).toFixed(2) + '%'],
              ['', ''],
              ['Awarded Applications Breakdown', ''],
              ['Serial No', 'Applicant Name', 'Amount Awarded', 'Date Awarded']
            ];
            const awarded = apps.filter(a => a.status === 'Awarded' && a.awardDetails);
            awarded.forEach(app => {
              rows.push([
                app.awardDetails?.serialNumber || 'N/A',
                app.applicantName || 'N/A',
                (app.awardDetails?.committee_amount_kes || 0).toString(),
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
              ]);
            });
            filename = `garissa_bursary_budget_${new Date().toISOString().split('T')[0]}.csv`;
          }
          
          // Download CSV
          if (typeof downloadCSV === 'function') {
            downloadCSV(filename, rows);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successMsg.style.zIndex = '9999';
            successMsg.style.minWidth = '400px';
            successMsg.innerHTML = `
              <strong>✅ Document Downloaded!</strong><br>
              <div class="mt-2">
                📄 File: <strong>${filename}</strong><br>
                📊 Records: <strong>${filtered.length}</strong> applications<br>
                <small class="text-muted">File saved to your default downloads folder</small>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) {
                successMsg.remove();
              }
            }, 5000);
            
            console.log('✅ Excel download successful:', filename, '-', filtered.length, 'records');
          } else {
            alert('❌ CSV download function not available. Please refresh the page.');
          }
        } catch (error) {
          console.error('Excel download error:', error);
          alert('❌ Error generating report. Please try again.\n\nError: ' + error.message);
        }
      });
      
      console.log('✅ Excel download button fixed');
    } else {
      console.warn('⚠️ Excel download button not found');
    }
  }
  
  /**
   * Fix Filter Dropdowns - Populate and enable
   */
  function fixFilterDropdowns() {
    console.log('🔧 Fixing filter dropdowns...');
    
    // Fix Sub-County dropdown
    const subCountySel = document.getElementById('filterSubCounty');
    if (subCountySel && typeof GARISSA_WARDS !== 'undefined') {
      // Clear and repopulate
      subCountySel.innerHTML = '<option value="">All Sub-Counties</option>';
      
      const subCounties = Object.keys(GARISSA_WARDS).sort();
      subCounties.forEach(sc => {
        const option = document.createElement('option');
        option.value = sc;
        option.textContent = sc;
        subCountySel.appendChild(option);
      });
      
      // Add "Other" option
      const otherOption = document.createElement('option');
      otherOption.value = 'Other';
      otherOption.textContent = 'Other (Specify)';
      subCountySel.appendChild(otherOption);
      
      subCountySel.disabled = false;
      console.log('✅ Sub-County dropdown populated with', subCounties.length, 'options');
    }
    
    // Fix Ward dropdown
    const wardSel = document.getElementById('filterWard');
    if (wardSel && typeof GARISSA_WARDS !== 'undefined') {
      wardSel.innerHTML = '<option value="">All Wards</option>';
      
      // Populate all wards from all sub-counties
      const allWards = [];
      Object.values(GARISSA_WARDS).forEach(wardArray => {
        wardArray.forEach(ward => {
          if (!allWards.includes(ward)) {
            allWards.push(ward);
          }
        });
      });
      allWards.sort().forEach(w => {
        const option = document.createElement('option');
        option.value = w;
        option.textContent = w;
        wardSel.appendChild(option);
      });
      
      // Add "Other" option
      const otherOption = document.createElement('option');
      otherOption.value = 'Other';
      otherOption.textContent = 'Other (Specify)';
      wardSel.appendChild(otherOption);
      
      wardSel.disabled = false;
      console.log('✅ Ward dropdown populated with', allWards.length, 'options');
    }
    
    // Fix Status dropdown
    const statusSel = document.getElementById('filterStatus');
    if (statusSel) {
      statusSel.innerHTML = `
        <option value="">All Statuses</option>
        <option value="Pending Ward Review">Pending Ward Review</option>
        <option value="Pending Committee Review">Pending Committee Review</option>
        <option value="Awarded">Awarded</option>
        <option value="Rejected">Rejected</option>
      `;
      statusSel.disabled = false;
      console.log('✅ Status dropdown populated');
    }
  }
  
  /**
   * Fix All Table Buttons - View, Edit, Download
   */
  function fixTableButtons() {
    console.log('🔧 Fixing table buttons...');
    
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) {
      console.warn('⚠️ Table body not found');
      return;
    }
    
    // Use event delegation for all buttons
    tbody.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn, button[data-action]');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const action = btn.getAttribute('data-action');
      const appID = btn.getAttribute('data-appid');
      
      if (!appID) {
        console.error('No appID found');
        return;
      }
      
      console.log('🔘 Button clicked:', action, '- AppID:', appID);
      
      if (action === 'view') {
        if (typeof window.viewApplication === 'function') {
          window.viewApplication(appID);
        } else {
          alert('View function not available. Please refresh the page.');
        }
      } else if (action === 'edit') {
        if (typeof window.editApplication === 'function') {
          window.editApplication(appID);
        } else {
          alert('Edit function not available.');
        }
      } else if (action === 'download') {
        if (typeof window.downloadApplicationLetter === 'function') {
          window.downloadApplicationLetter(appID).then(() => {
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successMsg.style.zIndex = '9999';
            successMsg.style.minWidth = '300px';
            successMsg.innerHTML = `
              <strong>✅ Document Downloaded!</strong><br>
              <small>File saved to your default downloads folder</small>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) {
                successMsg.remove();
              }
            }, 3000);
          });
        } else {
          alert('Download function not available. Please refresh the page.');
        }
      }
    });
    
    console.log('✅ Table buttons fixed with event delegation');
  }
  
  /**
   * Initialize everything
   */
  function initialize() {
    // Fix Excel download
    fixExcelDownloadButton();
    
    // Fix filter dropdowns
    fixFilterDropdowns();
    
    // Fix table buttons
    fixTableButtons();
    
    // Re-run filter setup
    if (typeof window.setupFilterEventListeners === 'function') {
      setTimeout(() => {
        window.setupFilterEventListeners();
      }, 500);
    }
    
    console.log('✅ COMPLETE BUTTON FIX - All fixes applied');
  }
  
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run after delay to catch dynamically loaded content
  setTimeout(initialize, 1000);
  setTimeout(initialize, 2000);
  
  console.log('✅ COMPLETE BUTTON FIX loaded');
})();

