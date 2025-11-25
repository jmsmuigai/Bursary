// Data Visualizations for Admin Dashboard
// Uses Chart.js for colorful, interactive charts

let chartInstances = {};

/**
 * Initialize all visualizations
 */
function initializeVisualizations() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded. Visualizations will not be available.');
    return;
  }
  
  refreshVisualizations();
}

/**
 * Refresh all visualizations with latest data - ENHANCED: Uses UNIFIED DATABASE
 */
function refreshVisualizations() {
  // Use UNIFIED DATABASE access layer (SAME DATABASE as all components)
  let apps = [];
  
  if (typeof getApplications !== 'undefined') {
    // Use unified database access
    apps = getApplications();
    console.log('📊 Visualizations: Loaded', apps.length, 'applications from UNIFIED DATABASE');
  } else if (typeof window.loadApplications !== 'undefined') {
    // Fallback to admin.js function
    apps = window.loadApplications();
    console.log('📊 Visualizations: Loaded', apps.length, 'applications from admin.js');
  } else {
    // Last resort: direct localStorage access
    try {
      apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
      console.log('📊 Visualizations: Loaded', apps.length, 'applications from localStorage');
    } catch (e) {
      console.error('Error loading applications:', e);
      return;
    }
  }
  
  console.log('📊 Refreshing visualizations with', apps.length, 'applications from SAME DATABASE');
  
  // Force reload from unified database to get latest data
  try {
    const latestApps = typeof getApplications !== 'undefined' ? getApplications() : 
                      JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    if (latestApps.length !== apps.length) {
      console.log('🔄 Data mismatch detected - using latest data from UNIFIED DATABASE');
      apps = latestApps;
    }
  } catch (e) {
    console.error('Error refreshing data:', e);
  }
  
  if (apps.length === 0) {
    console.warn('⚠️ No applications found for visualizations');
    // Show message in chart containers
    ['statusPieChart', 'subCountyBarChart', 'budgetTrendChart', 'genderChart'].forEach(id => {
      const canvas = document.getElementById(id);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available. Load demo data first.', canvas.width / 2, canvas.height / 2);
      }
    });
    return;
  }
  
  // Destroy existing charts
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  chartInstances = {};
  
  // Create new charts
  createStatusPieChart(apps);
  createSubCountyBarChart(apps);
  createBudgetTrendChart(apps);
  createGenderChart(apps);
}

/**
 * Create Status Distribution Pie Chart
 */
function createStatusPieChart(applications) {
  const ctx = document.getElementById('statusPieChart');
  if (!ctx) return;
  
  // Count by status
  const statusCounts = {};
  applications.forEach(app => {
    const status = app.status || 'Pending Submission';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  const labels = Object.keys(statusCounts);
  const data = Object.values(statusCounts);
  const colors = [
    '#28a745', // Green for Awarded
    '#17a2b8', // Blue for Pending
    '#ffc107', // Yellow for Pending Review
    '#dc3545', // Red for Rejected
    '#6c757d'  // Gray for Others
  ];
  
  chartInstances.statusPie = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12 }
          }
        },
        title: {
          display: true,
          text: 'Applications by Status',
          font: { size: 16, weight: 'bold' }
        }
      }
    }
  });
}

/**
 * Create Sub-County Allocation Bar Chart
 */
function createSubCountyBarChart(applications) {
  const ctx = document.getElementById('subCountyBarChart');
  if (!ctx) return;
  
  // Count by sub-county
  const subCountyCounts = {};
  applications.forEach(app => {
    const subCounty = app.subCounty || app.personalDetails?.subCounty || 'Unknown';
    subCountyCounts[subCounty] = (subCountyCounts[subCounty] || 0) + 1;
  });
  
  const labels = Object.keys(subCountyCounts).sort();
  const data = labels.map(sc => subCountyCounts[sc]);
  
  chartInstances.subCountyBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Applications',
        data: data,
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Applications by Sub-County',
          font: { size: 16, weight: 'bold' }
        }
      }
    }
  });
}

/**
 * Create Budget Utilization Trend Chart
 */
function createBudgetTrendChart(applications) {
  const ctx = document.getElementById('budgetTrendChart');
  if (!ctx) return;
  
  // Get budget data
  const budget = typeof getBudgetBalance !== 'undefined' ? getBudgetBalance() : { total: 50000000, allocated: 0, balance: 50000000 };
  const utilization = (budget.allocated / budget.total) * 100;
  
  // Calculate awarded amounts over time (simplified - using current data)
  const awarded = applications.filter(a => a.status === 'Awarded' && a.awardDetails);
  const totalAwarded = awarded.reduce((sum, a) => sum + (a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), 0);
  
  chartInstances.budgetTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Budget Utilization'],
      datasets: [{
        label: 'Allocated (KSH)',
        data: [budget.allocated],
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }, {
        label: 'Total Budget (KSH)',
        data: [budget.total],
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'KSH ' + (value / 1000000).toFixed(1) + 'M';
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: `Budget Utilization: ${utilization.toFixed(2)}%`,
          font: { size: 16, weight: 'bold' }
        }
      }
    }
  });
}

/**
 * Create Gender Distribution Chart
 */
function createGenderChart(applications) {
  const ctx = document.getElementById('genderChart');
  if (!ctx) return;
  
  // Count by gender
  const genderCounts = { Male: 0, Female: 0, Other: 0 };
  applications.forEach(app => {
    const gender = app.personalDetails?.gender || app.gender || 'Other';
    if (genderCounts.hasOwnProperty(gender)) {
      genderCounts[gender]++;
    } else {
      genderCounts.Other++;
    }
  });
  
  chartInstances.gender = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [genderCounts.Male, genderCounts.Female, genderCounts.Other],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12 }
          }
        },
        title: {
          display: true,
          text: 'Gender Distribution',
          font: { size: 16, weight: 'bold' }
        }
      }
    }
  });
}

// Expose globally
window.initializeVisualizations = initializeVisualizations;
window.refreshVisualizations = refreshVisualizations;

