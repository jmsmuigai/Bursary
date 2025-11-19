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
 */
function getBudgetBalance() {
  initializeBudget();
  const total = parseInt(localStorage.getItem('mbms_budget_total') || TOTAL_BUDGET.toString());
  const allocated = parseInt(localStorage.getItem('mbms_budget_allocated') || '0');
  return {
    total: total,
    allocated: allocated,
    balance: total - allocated
  };
}

/**
 * Allocate budget (when awarding)
 */
function allocateBudget(amount) {
  initializeBudget();
  const current = parseInt(localStorage.getItem('mbms_budget_allocated') || '0');
  const newAllocated = current + amount;
  const balance = TOTAL_BUDGET - newAllocated;
  
  if (balance < 0) {
    throw new Error('Insufficient budget! Available: KSH ' + (TOTAL_BUDGET - current).toLocaleString());
  }
  
  localStorage.setItem('mbms_budget_allocated', newAllocated.toString());
  return {
    allocated: newAllocated,
    balance: balance
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

