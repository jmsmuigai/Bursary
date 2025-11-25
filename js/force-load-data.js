// FORCE LOAD AND DISPLAY DUMMY DATA - IMMEDIATE EXECUTION
// This script runs immediately to ensure data is visible

(function() {
  'use strict';
  
  console.log('🚀 FORCE LOAD DATA SCRIPT STARTING...');
  
  // Function to force load and display dummy data
  function forceLoadAndDisplayDummyData() {
    try {
      console.log('🔄 Step 1: Checking localStorage...');
      
      // Check if we have data
      let apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      console.log('📊 Current applications in localStorage:', apps.length);
      
      // If less than 10, generate fresh dummy data
      if (apps.length < 10) {
        console.log('🔄 Step 2: Generating fresh dummy data...');
        
        // Import generateDummyApplications if available
        if (typeof generateDummyApplications === 'function') {
          const dummyApps = generateDummyApplications();
          console.log('✅ Generated', dummyApps.length, 'dummy applications');
          
          // Save to localStorage
          localStorage.setItem('mbms_applications', JSON.stringify(dummyApps));
          localStorage.setItem('mbms_application_counter', '10');
          localStorage.setItem('mbms_last_serial', '10');
          
          // Verify save
          const verify = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
          console.log('✅ Verified:', verify.length, 'applications saved');
          
          apps = verify;
        } else {
          console.error('❌ generateDummyApplications function not found');
        }
      }
      
      // Force display if we have data
      if (apps.length > 0) {
        console.log('🔄 Step 3: Forcing display of', apps.length, 'applications...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => forceDisplayData(apps), 500);
          });
        } else {
          setTimeout(() => forceDisplayData(apps), 500);
        }
      }
    } catch (error) {
      console.error('❌ Error in forceLoadAndDisplayDummyData:', error);
    }
  }
  
  // Function to force display data in table
  function forceDisplayData(apps) {
    try {
      console.log('🔄 Force displaying', apps.length, 'applications...');
      
      const tbody = document.getElementById('applicationsTableBody');
      if (!tbody) {
        console.error('❌ Table body not found');
        // Retry after delay
        setTimeout(() => forceDisplayData(apps), 1000);
        return;
      }
      
      console.log('✅ Table body found, rendering...');
      
      // Clear table
      tbody.innerHTML = '';
      
      // Render each application
      apps.forEach((app, index) => {
        const tr = document.createElement('tr');
        const status = app.status || 'Pending Submission';
        const amount = app.financialDetails?.amountRequested || app.amountRequested || 0;
        const name = app.applicantName || `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'N/A';
        const location = app.personalDetails?.subCounty || app.subCounty || 'N/A';
        const ward = app.personalDetails?.ward || app.ward || 'N/A';
        const institution = app.personalDetails?.institution || app.institution || 'N/A';
        const appID = app.appID || 'N/A';
        const isDummy = app.applicantEmail && app.applicantEmail.includes('example.com');
        const dummyBadge = isDummy ? '<span class="badge bg-secondary ms-1">DUMMY</span>' : '';
        
        // Status badge class
        const statusClasses = {
          'Pending Submission': 'bg-warning text-dark',
          'Pending Ward Review': 'bg-info',
          'Pending Committee Review': 'bg-primary',
          'Awarded': 'bg-success',
          'Rejected': 'bg-danger'
        };
        const statusClass = statusClasses[status] || 'bg-secondary';
        
        tr.innerHTML = `
          <td><strong>${appID}</strong>${dummyBadge}</td>
          <td>${name}${dummyBadge}</td>
          <td>${location} / ${ward}</td>
          <td>${institution}</td>
          <td><span class="badge ${statusClass}">${status}</span></td>
          <td>Ksh ${amount.toLocaleString()}</td>
          <td>
            <button class="btn btn-sm btn-info me-1" onclick="viewApplication('${appID.replace(/'/g, "\\'")}')" title="View">
              <i class="bi bi-eye"></i> View
            </button>
            ${!app.isFinalSubmission ? `<button class="btn btn-sm btn-warning me-1" onclick="editApplication('${appID.replace(/'/g, "\\'")}')" title="Edit">
              <i class="bi bi-pencil"></i> Edit
            </button>` : ''}
            <button class="btn btn-sm btn-success" onclick="downloadApplicationLetter('${appID.replace(/'/g, "\\'")}')" title="Download">
              <i class="bi bi-download"></i> Download
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      
      console.log('✅ Rendered', apps.length, 'rows in table');
      
      // Update metrics if function exists
      if (typeof updateMetrics === 'function') {
        updateMetrics();
      }
      
      // Update budget if function exists
      if (typeof updateBudgetDisplay === 'function') {
        updateBudgetDisplay();
      }
      
    } catch (error) {
      console.error('❌ Error in forceDisplayData:', error);
    }
  }
  
  // Execute immediately
  forceLoadAndDisplayDummyData();
  
  // Also execute when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceLoadAndDisplayDummyData);
  } else {
    forceLoadAndDisplayDummyData();
  }
  
  // Execute again after a delay to ensure it works
  setTimeout(forceLoadAndDisplayDummyData, 1000);
  setTimeout(forceLoadAndDisplayDummyData, 2000);
  
})();

