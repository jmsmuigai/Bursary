// Budget Management System for Garissa County Bursary
const TOTAL_BUDGET = 50000000; // KSH 50,000,000

/**
 * Initialize budget if not exists
 */
function initializeBudget() {
  if (!localStorage.getItem('mbms_budget_allocated')) {
    localStorage.setItem('mbms_budget_allocated', '0');
  }
  if (!localStorage.getItem('mbms_budget_total')) {
    localStorage.setItem('mbms_budget_total', TOTAL_BUDGET.toString());
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
window.TOTAL_BUDGET = TOTAL_BUDGET;

