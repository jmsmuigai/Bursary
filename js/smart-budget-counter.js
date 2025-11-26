// SMART BUDGET COUNTER - Modern visual counter showing budget status
// Displays: Total Budget, Allocated, Remaining, Estimated Applicants Until Exhaustion
// Visible to both applicants and admin

(function() {
  'use strict';
  
  console.log('💰 SMART BUDGET COUNTER - Initializing...');
  
  // Initialize budget counter
  function initBudgetCounter() {
    const counterContainer = document.getElementById('smartBudgetCounter');
    if (!counterContainer) {
      console.log('⚠️ Budget counter container not found');
      return;
    }
    
    updateBudgetCounter();
    
    // Update every 5 seconds
    setInterval(updateBudgetCounter, 5000);
    
    // Also listen for budget update events
    window.addEventListener('mbms-budget-updated', updateBudgetCounter);
    window.addEventListener('mbms-data-updated', function(e) {
      if (e.detail && (e.detail.action === 'awarded' || e.detail.action === 'rejected')) {
        setTimeout(updateBudgetCounter, 500);
      }
    });
  }
  
  // Update budget counter display
  function updateBudgetCounter() {
    try {
      const counterContainer = document.getElementById('smartBudgetCounter');
      if (!counterContainer) return;
      
      // Get budget data
      const budget = typeof getBudgetBalance !== 'undefined' ? getBudgetBalance() : {
        total: 50000000,
        allocated: 0,
        balance: 50000000
      };
      
      // Calculate average award amount (for estimation)
      let avgAward = 0;
      let awardedCount = 0;
      
      try {
        const apps = typeof getApplications !== 'undefined' ? 
          (async () => {
            const result = await getApplications();
            return Array.isArray(result) ? result : [];
          })() : 
          JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        
        // Handle async result
        if (apps && typeof apps.then === 'function') {
          apps.then(result => {
            calculateAndDisplay(result);
          });
          return;
        } else {
          calculateAndDisplay(Array.isArray(apps) ? apps : []);
        }
      } catch (error) {
        console.error('Error getting applications:', error);
        calculateAndDisplay([]);
      }
      
      function calculateAndDisplay(applications) {
        // Filter real awarded applications
        const awarded = applications.filter(a => 
          a.status === 'Awarded' && 
          a.awardDetails &&
          a.applicantEmail &&
          !a.applicantEmail.includes('example.com') &&
          !a.applicantEmail.includes('TEST_') &&
          !a.applicantName?.includes('DUMMY')
        );
        
        awardedCount = awarded.length;
        
        if (awarded.length > 0) {
          const totalAwarded = awarded.reduce((sum, app) => {
            return sum + (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
          }, 0);
          avgAward = totalAwarded / awarded.length;
        } else {
          // Default average if no awards yet (estimate based on typical bursary)
          avgAward = 150000; // KSH 150,000 average estimate
        }
        
        // Calculate estimated applicants until exhaustion
        const remaining = budget.balance;
        const estimatedApplicants = avgAward > 0 ? Math.floor(remaining / avgAward) : 0;
        
        // Calculate percentage used
        const percentageUsed = (budget.allocated / budget.total) * 100;
        const percentageRemaining = 100 - percentageUsed;
        
        // Determine status color
        let statusColor = 'success';
        let statusText = 'Healthy';
        if (percentageUsed >= 90) {
          statusColor = 'danger';
          statusText = 'Critical';
        } else if (percentageUsed >= 75) {
          statusColor = 'warning';
          statusText = 'Low';
        } else if (percentageUsed >= 50) {
          statusColor = 'info';
          statusText = 'Moderate';
        }
        
        // Render modern counter
        counterContainer.innerHTML = `
          <div class="row g-3">
            <!-- Total Budget Card -->
            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm h-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <div class="card-body text-center">
                  <i class="bi bi-wallet2 fs-1 mb-2 d-block"></i>
                  <h6 class="mb-2 opacity-75">Total Budget</h6>
                  <h4 class="fw-bold mb-0">Ksh ${(budget.total / 1000000).toFixed(1)}M</h4>
                  <small class="opacity-75">Ksh ${budget.total.toLocaleString()}</small>
                </div>
              </div>
            </div>
            
            <!-- Allocated Card -->
            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm h-100" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                <div class="card-body text-center">
                  <i class="bi bi-cash-stack fs-1 mb-2 d-block"></i>
                  <h6 class="mb-2 opacity-75">Allocated</h6>
                  <h4 class="fw-bold mb-0">Ksh ${(budget.allocated / 1000000).toFixed(1)}M</h4>
                  <small class="opacity-75">${percentageUsed.toFixed(1)}% Used</small>
                </div>
              </div>
            </div>
            
            <!-- Remaining Balance Card -->
            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm h-100" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
                <div class="card-body text-center">
                  <i class="bi bi-piggy-bank fs-1 mb-2 d-block"></i>
                  <h6 class="mb-2 opacity-75">Remaining</h6>
                  <h4 class="fw-bold mb-0">Ksh ${(budget.balance / 1000000).toFixed(1)}M</h4>
                  <small class="opacity-75">${percentageRemaining.toFixed(1)}% Left</small>
                </div>
              </div>
            </div>
            
            <!-- Estimated Applicants Card -->
            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm h-100" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
                <div class="card-body text-center">
                  <i class="bi bi-people fs-1 mb-2 d-block"></i>
                  <h6 class="mb-2 opacity-75">Est. Capacity</h6>
                  <h4 class="fw-bold mb-0">${estimatedApplicants}</h4>
                  <small class="opacity-75">More Applicants</small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted"><strong>Budget Utilization</strong></span>
              <span class="badge bg-${statusColor}">${statusText}</span>
            </div>
            <div class="progress" style="height: 25px; border-radius: 12px; overflow: hidden;">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-${statusColor}" 
                   role="progressbar" 
                   style="width: ${percentageUsed}%; font-weight: bold; font-size: 0.9rem; line-height: 25px;"
                   aria-valuenow="${percentageUsed}" 
                   aria-valuemin="0" 
                   aria-valuemax="100">
                ${percentageUsed.toFixed(1)}% Used
              </div>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <small class="text-muted">
                <i class="bi bi-check-circle me-1"></i>${awardedCount} Awarded
                ${avgAward > 0 ? `| Avg: Ksh ${Math.round(avgAward).toLocaleString()}` : ''}
              </small>
              <small class="text-muted">
                ${estimatedApplicants > 0 ? `~${estimatedApplicants} more applicants can be awarded` : 'Budget exhausted'}
              </small>
            </div>
          </div>
        `;
        
        console.log('✅ Budget counter updated:', {
          total: budget.total,
          allocated: budget.allocated,
          remaining: budget.balance,
          percentageUsed: percentageUsed.toFixed(1) + '%',
          estimatedApplicants: estimatedApplicants,
          avgAward: avgAward
        });
      }
    } catch (error) {
      console.error('Error updating budget counter:', error);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBudgetCounter);
  } else {
    initBudgetCounter();
  }
  
  console.log('✅ Smart budget counter module loaded');
})();

