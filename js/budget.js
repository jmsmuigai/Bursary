// Budget Management System for Garissa County Bursary
const TOTAL_BUDGET = 50000000; // KSH 50,000,000

/**
 * Initialize budget if not exists
 * Budget baseline remains KSH 50,000,000 until first award
 */
function initializeBudget() {
  if (!localStorage.getItem('mbms_budget_total')) {
    localStorage.setItem('mbms_budget_total', TOTAL_BUDGET.toString());
  }
  
  // Only sync budget with ACTUAL awarded applications (not dummy data)
  // Budget stays at 50M until first real award
  syncBudgetWithAwards();
  
  // Ensure allocated is 0 if no real awards exist
  const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  const realAwards = apps.filter(a => 
    a.status === 'Awarded' && 
    a.awardDetails && 
    a.applicantEmail && 
    !a.applicantEmail.includes('example.com') // Exclude dummy data
  );
  
  if (realAwards.length === 0) {
    localStorage.setItem('mbms_budget_allocated', '0');
  }
}

/**
 * Sync budget allocation with existing awarded applications
 * EXCLUDES dummy data - budget stays at 50M until first real award
 */
function syncBudgetWithAwards() {
  try {
    const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    // Only count REAL awards (exclude dummy data with example.com emails)
    const awarded = applications.filter(a => 
      a.status === 'Awarded' && 
      a.awardDetails &&
      a.applicantEmail &&
      !a.applicantEmail.includes('example.com') // Exclude dummy data
    );
    
    const totalAllocated = awarded.reduce((sum, app) => {
      return sum + (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
    }, 0);
    
    localStorage.setItem('mbms_budget_allocated', totalAllocated.toString());
    console.log('💰 Budget synced: Real awards =', awarded.length, ', Total allocated = KSH', totalAllocated.toLocaleString());
  } catch (error) {
    console.error('Error syncing budget:', error);
    if (!localStorage.getItem('mbms_budget_allocated')) {
      localStorage.setItem('mbms_budget_allocated', '0');
    }
  }
}

/**
 * Get current budget balance
 * Formula: Balance = Total Budget - Allocated Amount
 */
function getBudgetBalance() {
  initializeBudget();
  
  // Get values from localStorage
  const total = parseInt(localStorage.getItem('mbms_budget_total') || TOTAL_BUDGET.toString());
  
  // Recalculate allocated from actual awarded applications (most accurate)
  syncBudgetWithAwards();
  
  const allocated = parseInt(localStorage.getItem('mbms_budget_allocated') || '0');
  
  // Calculate balance using formula: Balance = Total - Allocated
  const balance = total - allocated;
  
  return {
    total: total,
    allocated: allocated,
    balance: Math.max(0, balance) // Ensure balance is never negative
  };
}

/**
 * Allocate budget (when awarding)
 * Formula: New Allocated = Current Allocated + Award Amount
 *          New Balance = Total Budget - New Allocated
 */
function allocateBudget(amount) {
  initializeBudget();
  
  // Get current allocated amount
  const currentAllocated = parseInt(localStorage.getItem('mbms_budget_allocated') || '0');
  
  // Calculate new allocated amount
  const newAllocated = currentAllocated + amount;
  
  // Calculate new balance using formula: Balance = Total - Allocated
  const newBalance = TOTAL_BUDGET - newAllocated;
  
  // Validate: balance cannot be negative
  if (newBalance < 0) {
    const available = TOTAL_BUDGET - currentAllocated;
    throw new Error('Insufficient budget! Available: KSH ' + available.toLocaleString() + ', Requested: KSH ' + amount.toLocaleString());
  }
  
  // Save new allocated amount to localStorage IMMEDIATELY
  localStorage.setItem('mbms_budget_allocated', newAllocated.toString());
  
  // Also update Firebase if available (async, don't wait)
  if (typeof updateBudgetData !== 'undefined') {
    updateBudgetData(TOTAL_BUDGET, newAllocated).catch(err => {
      console.warn('Firebase budget update failed (non-critical):', err);
    });
  }
  
  // Trigger immediate UI update event
  window.dispatchEvent(new CustomEvent('mbms-budget-updated', {
    detail: {
      allocated: newAllocated,
      balance: newBalance,
      total: TOTAL_BUDGET
    }
  }));
  
  console.log('💰 Budget Allocation (IMMEDIATE):', {
    currentAllocated: currentAllocated,
    awardAmount: amount,
    newAllocated: newAllocated,
    newBalance: newBalance,
    formula: `${TOTAL_BUDGET} - ${newAllocated} = ${newBalance}`
  });
  
  return {
    allocated: newAllocated,
    balance: newBalance,
    previousAllocated: currentAllocated
  };
}

/**
 * Check if budget is available
 */
function checkBudgetAvailable(amount) {
  const budget = getBudgetBalance();
  return budget.balance >= amount;
}

/**
 * Get budget status (for alerts)
 */
function getBudgetStatus() {
  const budget = getBudgetBalance();
  const percentage = (budget.allocated / budget.total) * 100;
  
  return {
    ...budget,
    percentage: percentage,
    isLow: percentage >= 80,
    isExhausted: budget.balance <= 0
  };
}

// Export functions
window.getBudgetBalance = getBudgetBalance;
window.allocateBudget = allocateBudget;
window.checkBudgetAvailable = checkBudgetAvailable;
window.getBudgetStatus = getBudgetStatus;
window.initializeBudget = initializeBudget;
window.syncBudgetWithAwards = syncBudgetWithAwards;
window.TOTAL_BUDGET = TOTAL_BUDGET;

