// Budget Management System for Garissa County Bursary
const TOTAL_BUDGET = 50000000; // KSH 50,000,000

/**
 * Initialize budget if not exists
 */
function initializeBudget() {
  if (!localStorage.getItem('mbms_budget_total')) {
    localStorage.setItem('mbms_budget_total', TOTAL_BUDGET.toString());
  }
  
  // Sync budget with existing awarded applications
  syncBudgetWithAwards();
}

/**
 * Sync budget allocation with existing awarded applications
 */
function syncBudgetWithAwards() {
  try {
    const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const awarded = applications.filter(a => a.status === 'Awarded' && a.awardDetails);
    
    const totalAllocated = awarded.reduce((sum, app) => {
      return sum + (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
    }, 0);
    
    localStorage.setItem('mbms_budget_allocated', totalAllocated.toString());
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
  
  // Save new allocated amount
  localStorage.setItem('mbms_budget_allocated', newAllocated.toString());
  
  console.log('Budget Allocation:', {
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

