// Enhanced Admin Dashboard with Full Functionality
(function() {
  // Prevent multiple initializations
  if (window.adminDashboardInitialized) {
    console.warn('Admin dashboard already initialized');
    return;
  }
  
  // Wait for DOM to be ready before initializing
  function initAdminDashboard() {
    if (window.adminDashboardInitialized) {
      console.warn('Admin dashboard already initialized');
      return;
    }
    window.adminDashboardInitialized = true;

  // Check admin access
  try {
    const adminStr = sessionStorage.getItem('mbms_admin');
    if (!adminStr) {
      alert('Access denied. Admin login required.');
      window.location.href = 'index.html';
      return;
    }

    const admin = JSON.parse(adminStr);
    const adminEmailEl = document.getElementById('adminEmail');
    if (adminEmailEl) {
      adminEmailEl.textContent = admin.email;
    }
  } catch (error) {
    console.error('Admin access check error:', error);
    alert('Error loading admin session. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  // Load applications from UNIFIED DATABASE (SAME DATABASE as registration and application form)
  function loadApplications() {
    try {
      // Use unified database access layer (Firebase or localStorage)
      // Note: getApplications is async, but we make this sync for backward compatibility
      if (typeof getApplications !== 'undefined') {
        // For async Firebase, we'll use a promise but return sync for now
        // In production, this should be properly async
        const appsPromise = getApplications();
        if (appsPromise && typeof appsPromise.then === 'function') {
          // Async - return empty array for now, will be updated by listener
          console.log('📦 Loading applications from Firebase (async)...');
          // Set up listener for real-time updates
          if (typeof listenForUpdates !== 'undefined') {
            listenForUpdates((apps) => {
              console.log('✅ Real-time update:', apps.length, 'applications');
              renderTable(apps);
              updateMetrics();
            });
          }
          // Return cached data immediately
          const cached = localStorage.getItem('mbms_applications');
          if (cached) {
            const apps = JSON.parse(cached);
            return Array.isArray(apps) ? apps : [];
          }
          return [];
        } else {
          // Sync - return directly
          return appsPromise || [];
        }
      }
      
      // Fallback to direct localStorage access
      const appsStr = localStorage.getItem('mbms_applications');
      if (!appsStr) {
        console.log('📊 No applications in database (localStorage: mbms_applications)');
        return [];
      }
      
      const apps = JSON.parse(appsStr);
      
      // Validate apps array
      if (!Array.isArray(apps)) {
        console.error('Applications data is not an array:', apps);
        return [];
      }
      
      // CRITICAL: Filter out ALL test/dummy data before processing
      const realApps = apps.filter(app => {
        if (!app || !app.applicantEmail) return false;
        
        // Comprehensive test data detection
        const email = app.applicantEmail || app.email || '';
        const name = app.applicantName || app.name || '';
        const appID = app.appID || '';
        
        const isTest = 
          email.includes('example.com') ||
          email.includes('TEST_') ||
          email.includes('test@') ||
          email.includes('dummy') ||
          email.includes('demo') ||
          appID.includes('TEST_') ||
          appID.includes('DUMMY') ||
          appID.includes('Firebase Test') ||
          appID.includes('Demo') ||
          name.includes('DUMMY') ||
          name.includes('Test User') ||
          name.includes('Demo User') ||
          name.includes('Example') ||
          app.status === 'Deleted' ||
          app.status === 'Test' ||
          app.status === 'Demo';
        
        return !isTest;
      });
      
      // Auto-save cleaned data if test data was found
      if (realApps.length !== apps.length) {
        console.log('🧹 Auto-clearing', apps.length - realApps.length, 'test/dummy records');
        localStorage.setItem('mbms_applications', JSON.stringify(realApps));
        
        // Also clear from Firebase if configured
        if (typeof window.clearFirebaseTestData === 'function') {
          window.clearFirebaseTestData('applications');
        }
      }
      
      console.log('✅ Loaded', realApps.length, 'REAL applications from database (filtered from', apps.length, 'total)');
      console.log('📊 Database: localStorage (same as registration and application form)');
      
      // Ensure all applications have required fields for backward compatibility
      return realApps.map((app, index) => {
        // Ensure appID exists
        if (!app.appID) {
          app.appID = `GSA/${new Date().getFullYear()}/${(index + 1).toString().padStart(4, '0')}`;
        }
        
        // Ensure status exists
        if (!app.status) {
          app.status = 'Pending Submission';
        }
        // If application doesn't have location data, try to get from user registration - ENHANCED
        if (!app.subCounty && !app.personalDetails?.subCounty) {
          const users = loadUsers();
          const user = users.find(u => u.email === app.applicantEmail);
          if (user) {
            app.subCounty = user.subCounty || 'N/A';
            app.ward = user.ward || 'N/A';
            if (!app.personalDetails) app.personalDetails = {};
            app.personalDetails.subCounty = user.subCounty || 'N/A';
            app.personalDetails.ward = user.ward || 'N/A';
            app.personalDetails.firstNames = app.personalDetails.firstNames || user.firstName || '';
            app.personalDetails.lastName = app.personalDetails.lastName || user.lastName || '';
            app.personalDetails.phoneNumber = app.personalDetails.phoneNumber || user.phoneNumber || '';
            app.personalDetails.gender = app.personalDetails.gender || user.gender || '';
          }
        }
        
        // Try to get applicant name from user registration if missing - ENHANCED
        if (!app.applicantName && app.applicantEmail) {
          const users = loadUsers();
          const user = users.find(u => u.email === app.applicantEmail);
          if (user) {
            app.applicantName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            app.subCounty = app.subCounty || user.subCounty || 'N/A';
            app.ward = app.ward || user.ward || 'N/A';
            
            // Also populate personalDetails if missing
            if (!app.personalDetails) {
              app.personalDetails = {
                firstNames: user.firstName || '',
                lastName: user.lastName || '',
                subCounty: user.subCounty || 'N/A',
                ward: user.ward || 'N/A',
                phoneNumber: user.phoneNumber || '',
                gender: user.gender || '',
                dateOfBirth: user.dateOfBirth || ''
              };
            }
            
            console.log('✅ Enhanced application with user data:', app.appID);
          }
        }
        return app;
      });
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  }
  
  // Debug function to check localStorage
  window.debugApplications = function() {
    const apps = localStorage.getItem('mbms_applications');
    const users = localStorage.getItem('mbms_users');
    console.log('Applications in localStorage:', apps ? JSON.parse(apps).length : 0);
    console.log('Users in localStorage:', users ? JSON.parse(users).length : 0);
    console.log('Full applications:', JSON.parse(apps || '[]'));
    alert(`Applications found: ${apps ? JSON.parse(apps).length : 0}\nCheck browser console (F12) for details.`);
  };

  // Load users to get applicant details
  function loadUsers() {
    // Use unified database access layer
    if (typeof getUsers !== 'undefined') {
      return getUsers();
    }
    // Fallback to direct localStorage access
    return JSON.parse(localStorage.getItem('mbms_users') || '[]');
  }

  // Get application counter
  function getApplicationCounter() {
    return parseInt(localStorage.getItem('mbms_application_counter') || '0');
  }

  // Update metrics
  function updateMetrics() {
    const apps = loadApplications();
    const users = loadUsers();
    const registeredUsers = users.filter(u => u.role === 'applicant');
    const counter = getApplicationCounter();
    
    // Include registered users who haven't submitted applications yet
    const totalRegistered = registeredUsers.length;
    const totalWithApplications = apps.filter(a => a.appID && !a.appID.startsWith('USER-')).length;
    
    document.getElementById('metricTotal').textContent = counter || apps.length;
    document.getElementById('counterValue').textContent = counter || apps.length;
    document.getElementById('metricPending').textContent = apps.filter(a => 
      a.status?.includes('Pending') || a.status === 'Pending Submission'
    ).length;
    document.getElementById('metricAwarded').textContent = apps.filter(a => 
      a.status === 'Awarded'
    ).length;
    
    // Calculate total funds allocated (use awarded amounts, not requested)
    const awarded = apps.filter(a => a.status === 'Awarded' && a.awardDetails);
    const totalFunds = awarded.reduce((sum, app) => {
      const amount = app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0;
      return sum + amount;
    }, 0);
    document.getElementById('metricFunds').textContent = `Ksh ${totalFunds.toLocaleString()}`;
    
    // Update budget display immediately
    updateBudgetDisplay();
  }
  
  // Update budget display with accurate calculations
  function updateBudgetDisplay() {
    if (typeof getBudgetBalance === 'undefined') return;
    
    // Recalculate budget from actual awarded applications (most accurate)
    if (typeof syncBudgetWithAwards !== 'undefined') {
      syncBudgetWithAwards();
    }
    
    const budget = getBudgetBalance();
    const status = getBudgetStatus();
    
    // Formula: Balance = Total Budget - Allocated Amount
    const calculatedBalance = budget.total - budget.allocated;
    
    // Update budget card with accurate values
    const budgetTotalEl = document.getElementById('budgetTotal');
    const budgetAllocatedEl = document.getElementById('budgetAllocated');
    const budgetBalanceEl = document.getElementById('budgetBalance');
    const budgetPercentageEl = document.getElementById('budgetPercentage');
    
    // Fix NaN errors: Ensure all values are numbers
    const safeTotal = Number(budget.total) || 0;
    const safeAllocated = Number(budget.allocated) || 0;
    const safeBalance = safeTotal - safeAllocated;
    const safePercentage = safeTotal > 0 ? ((safeAllocated / safeTotal) * 100) : 0;
    
    if (budgetTotalEl) budgetTotalEl.textContent = `Ksh ${safeTotal.toLocaleString()}`;
    if (budgetAllocatedEl) budgetAllocatedEl.textContent = `Ksh ${safeAllocated.toLocaleString()}`;
    if (budgetBalanceEl) budgetBalanceEl.textContent = `Ksh ${safeBalance.toLocaleString()}`;
    if (budgetPercentageEl) budgetPercentageEl.textContent = safePercentage.toFixed(1) + '%';
    
    // Update progress bar with dynamic colors (fix NaN)
    const progressBar = document.getElementById('budgetProgressBar');
    if (progressBar) {
      const safePercentage = Number(status.percentage) || 0;
      const percentage = Math.min(Math.max(safePercentage, 0), 100); // Clamp between 0-100
      progressBar.style.width = percentage + '%';
      progressBar.setAttribute('aria-valuenow', percentage);
      progressBar.setAttribute('aria-valuemin', 0);
      progressBar.setAttribute('aria-valuemax', 100);
      
      // Dynamic color based on utilization (real-time updates)
        const budgetCard = document.getElementById('budgetCard');
      if (status.isExhausted || calculatedBalance <= 0) {
        // Dark red when exhausted
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#8b0000'; // Dark red
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #8b0000 0%, #6b0000 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else if (percentage >= 90) {
        // Red when 90%+ used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#dc3545';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else if (percentage >= 75) {
        // Orange when 75-90% used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#fd7e14';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #fd7e14 0%, #ff9800 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else if (percentage >= 50) {
        // Yellow when 50-75% used
        progressBar.className = 'progress-bar';
        progressBar.style.backgroundColor = '#ffc107';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      } else {
        // Green when <50% used
        progressBar.className = 'progress-bar bg-success';
        progressBar.style.transition = 'background-color 0.3s ease, width 0.5s ease';
        if (budgetCard) {
          budgetCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          budgetCard.style.transition = 'background 0.3s ease';
        }
      }
    }
    
    console.log('Budget Updated:', {
      total: budget.total,
      allocated: budget.allocated,
      balance: calculatedBalance,
      percentage: status.percentage.toFixed(2) + '%',
      formula: `${budget.total} - ${budget.allocated} = ${calculatedBalance}`
    });
  }

  // Populate filters with all sub-counties and wards - ENHANCED & RECONSTRUCTED
  function populateFilters() {
    console.log('🔧 Populating filter dropdowns...');
    const scSel = document.getElementById('filterSubCounty');
    const wardSel = document.getElementById('filterWard');
    
    if (!scSel || !wardSel) {
      console.error('❌ Filter elements not found - retrying...');
      setTimeout(populateFilters, 500);
      return;
    }
    
    // Load applications to get actual data
    const apps = loadApplications();
    console.log('📊 Loaded', apps.length, 'applications for filter population');
    
    // Collect unique sub-counties from applications
    const subCountiesFromApps = new Set();
    apps.forEach(app => {
      const sc = app.personalDetails?.subCounty || app.subCounty;
      if (sc && sc !== 'N/A') {
        subCountiesFromApps.add(sc);
      }
    });
    
    // RECONSTRUCT: Populate sub-counties - Start with "All" option
    scSel.innerHTML = '<option value="">All Sub-Counties</option>';
    
    // Add sub-counties from GARISSA_WARDS (standard list)
    if (typeof GARISSA_WARDS !== 'undefined' && GARISSA_WARDS) {
      const standardSubCounties = Object.keys(GARISSA_WARDS).sort();
      standardSubCounties.forEach(sc => {
        const option = document.createElement('option');
        option.value = sc;
        option.textContent = sc;
        // Mark if this sub-county has applications
        const hasApps = subCountiesFromApps.has(sc);
        if (hasApps) {
          option.textContent += ` (${apps.filter(a => (a.personalDetails?.subCounty || a.subCounty) === sc).length})`;
        }
        scSel.appendChild(option);
      });
      console.log('✅ Sub-county filter populated with', standardSubCounties.length, 'standard sub-counties');
    } else {
      console.error('❌ GARISSA_WARDS not defined - cannot populate sub-counties');
    }
    
    // Add any "Other" sub-counties from applications that aren't in the standard list
    subCountiesFromApps.forEach(sc => {
      if (typeof GARISSA_WARDS !== 'undefined' && !Object.keys(GARISSA_WARDS).includes(sc)) {
        // Check if already added
        const exists = Array.from(scSel.options).some(opt => opt.value === sc);
        if (!exists) {
          const option = document.createElement('option');
          option.value = sc;
          option.textContent = `${sc} (${apps.filter(a => (a.personalDetails?.subCounty || a.subCounty) === sc).length})`;
          scSel.appendChild(option);
          console.log('✅ Added "Other" sub-county from applications:', sc);
        }
      }
    });
    
    // Always add "Other" option at the end
    const otherOption = document.createElement('option');
    otherOption.value = 'Other';
    otherOption.textContent = 'Other (Specify)';
    scSel.appendChild(otherOption);
    
    console.log('✅ Sub-county filter fully populated with', scSel.options.length, 'options');

    // ENHANCED: Function to populate wards based on selected sub-county - includes actual application data
    function populateFilterWards() {
      const currentWardSel = document.getElementById('filterWard');
      const currentScSel = document.getElementById('filterSubCounty');
      if (!currentWardSel || !currentScSel) {
        console.error('❌ Filter elements not found in populateFilterWards');
        return;
      }
      
      // Load applications to get actual ward data
      const apps = loadApplications();
      
      currentWardSel.innerHTML = '<option value="">All Wards</option>';
      const selectedSubCounty = currentScSel.value;
      
      // Collect unique wards from applications
      const wardsFromApps = new Set();
      apps.forEach(app => {
        const sc = app.personalDetails?.subCounty || app.subCounty;
        const w = app.personalDetails?.ward || app.ward;
        if (w && w !== 'N/A') {
          // If sub-county is selected, only include wards from that sub-county
          if (selectedSubCounty && selectedSubCounty !== 'Other' && selectedSubCounty !== '') {
            if (sc === selectedSubCounty) {
              wardsFromApps.add(w);
            }
          } else {
            // If no sub-county selected, include all wards
            wardsFromApps.add(w);
          }
        }
      });
      
      if (selectedSubCounty && selectedSubCounty !== 'Other' && typeof GARISSA_WARDS !== 'undefined' && GARISSA_WARDS[selectedSubCounty]) {
        // Show wards for selected sub-county (from standard list)
        const standardWards = [...GARISSA_WARDS[selectedSubCounty]].sort();
        standardWards.forEach(w => {
          const option = document.createElement('option');
          option.value = w;
          const appCount = apps.filter(a => {
            const appSc = a.personalDetails?.subCounty || a.subCounty;
            const appW = a.personalDetails?.ward || a.ward;
            return appSc === selectedSubCounty && appW === w;
          }).length;
          option.textContent = appCount > 0 ? `${w} (${appCount})` : w;
          currentWardSel.appendChild(option);
        });
        console.log('✅ Ward filter populated with', standardWards.length, 'standard wards for', selectedSubCounty);
        
        // Add any "Other" wards from applications that aren't in the standard list
        wardsFromApps.forEach(w => {
          if (!standardWards.includes(w)) {
            const option = document.createElement('option');
            option.value = w;
            const appCount = apps.filter(a => {
              const appSc = a.personalDetails?.subCounty || a.subCounty;
              const appW = a.personalDetails?.ward || a.ward;
              return appSc === selectedSubCounty && appW === w;
            }).length;
            option.textContent = `${w} (${appCount})`;
            currentWardSel.appendChild(option);
            console.log('✅ Added "Other" ward from applications:', w);
          }
        });
      } else if (selectedSubCounty === '' || !selectedSubCounty) {
        // If no sub-county selected, show ALL wards from ALL sub-counties
        if (typeof GARISSA_WARDS !== 'undefined' && GARISSA_WARDS) {
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
            const appCount = apps.filter(a => (a.personalDetails?.ward || a.ward) === w).length;
            option.textContent = appCount > 0 ? `${w} (${appCount})` : w;
            currentWardSel.appendChild(option);
          });
          console.log('✅ Ward filter populated with ALL', allWards.length, 'standard wards from all sub-counties');
        } else {
          console.warn('⚠️ GARISSA_WARDS not available for ward population');
        }
        
        // Add any "Other" wards from applications
        wardsFromApps.forEach(w => {
          if (typeof GARISSA_WARDS !== 'undefined') {
            const isStandard = Object.values(GARISSA_WARDS).some(wardArray => wardArray.includes(w));
            if (!isStandard) {
              const option = document.createElement('option');
              option.value = w;
              const appCount = apps.filter(a => (a.personalDetails?.ward || a.ward) === w).length;
              option.textContent = `${w} (${appCount})`;
              currentWardSel.appendChild(option);
              console.log('✅ Added "Other" ward from applications:', w);
            }
          }
        });
      }
      
      // Always add "Other" option for typing custom ward
      const otherWardOption = document.createElement('option');
      otherWardOption.value = 'Other';
      otherWardOption.textContent = 'Other (Specify)';
      currentWardSel.appendChild(otherWardOption);
      
      // Enable/disable based on selection
      currentWardSel.disabled = false;
      console.log('✅ Ward filter fully populated with', currentWardSel.options.length, 'options');
    }
    
    // Make populateFilterWards accessible globally for event handlers
    window.populateFilterWards = populateFilterWards;
    
    // Get status filter element
    const statusSel = document.getElementById('filterStatus');
    
    // Use event delegation to avoid duplicate listeners
    // Remove old listeners by using one-time setup flag
    if (!scSel.dataset.listenersAttached) {
      scSel.dataset.listenersAttached = 'true';
      
      // Handle sub-county change - update wards and apply filters
      scSel.addEventListener('change', function() {
        console.log('📍 Sub-county changed to:', this.value);
        if (typeof window.populateFilterWards === 'function') {
          window.populateFilterWards();
        } else if (typeof populateFilterWards === 'function') {
          populateFilterWards();
        }
        // Auto-apply filters when sub-county changes
        setTimeout(() => {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          } else if (typeof applyFilters === 'function') {
            applyFilters();
          }
        }, 100);
      });
    }
    
    if (!wardSel.dataset.listenersAttached) {
      wardSel.dataset.listenersAttached = 'true';
      
      // Handle ward change - apply filters
      wardSel.addEventListener('change', function() {
        console.log('📍 Ward changed to:', this.value);
        setTimeout(() => {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          }
        }, 100);
      });
    }
    
    // Handle status change - apply filters
    if (statusSel && !statusSel.dataset.listenersAttached) {
      statusSel.dataset.listenersAttached = 'true';
      statusSel.addEventListener('change', function() {
        console.log('📍 Status changed to:', this.value);
        setTimeout(() => {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          }
        }, 100);
      });
    }
    
    // Find and attach Apply Filters button
    const applyFiltersBtn = document.getElementById('applyFiltersBtn') || 
                           document.querySelector('button[onclick*="applyFilters"]');
    if (applyFiltersBtn && !applyFiltersBtn.dataset.listenersAttached) {
      applyFiltersBtn.dataset.listenersAttached = 'true';
      applyFiltersBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔍 Apply Filters button clicked');
        if (typeof window.applyFilters === 'function') {
          window.applyFilters();
        }
      });
    }
    
    populateFilterWards(); // Initial population
    console.log('✅ All filter event listeners attached');
  }

  // Render applications table - ENHANCED with better logging and Excel-like format
  function renderTable(applications) {
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) {
      console.error('❌ Table body not found - element ID: applicationsTableBody');
      // Try to find it again after a short delay
      setTimeout(() => {
        const retryTbody = document.getElementById('applicationsTableBody');
        if (retryTbody) {
          console.log('✅ Table body found on retry');
          renderTable(applications);
        } else {
          console.error('❌ Table body still not found after retry');
        }
      }, 100);
      return;
    }
    
    console.log('🔄 RENDERING TABLE with', applications?.length || 0, 'applications');
    console.log('Applications data:', applications);
    
    // Clear table
    tbody.innerHTML = '';

    if (!applications || applications.length === 0) {
      console.log('⚠️ No applications to render - showing empty message');
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <i class="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
            <h5 class="text-muted">No Applications Found</h5>
            <p class="text-muted mb-0">The system is ready for the first application submission.</p>
          </td>
        </tr>
      `;
      return;
    }
    
    // Filter out test data if needed (optional - can be enabled)
    // const filteredApps = applications.filter(app => {
    //   return !(app.applicantEmail && (app.applicantEmail.includes('example.com') || app.applicantEmail.includes('TEST_')));
    // });
    // if (filteredApps.length === 0 && applications.length > 0) {
    //   tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><i class="bi bi-info-circle me-2"></i>Only test data found. Click "Clear All Data" to remove test records.</td></tr>';
    //   return;
    // }
    
    console.log('✅ About to render', applications.length, 'applications to table');

    // Sort by date submitted (newest first)
    const sortedApps = [...applications].sort((a, b) => {
      const dateA = new Date(a.dateSubmitted || 0);
      const dateB = new Date(b.dateSubmitted || 0);
      return dateB - dateA;
    });

    console.log('✅ Rendering', sortedApps.length, 'sorted applications');

    sortedApps.forEach((app, index) => {
      const tr = document.createElement('tr');
      const status = app.status || 'Pending Submission';
      const statusClass = getStatusBadgeClass(status);
      const amount = app.financialDetails?.amountRequested || app.amountRequested || 0;
      const name = app.applicantName || `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'N/A';
      const location = app.personalDetails?.subCounty || app.subCounty || 'N/A';
      const ward = app.personalDetails?.ward || app.ward || 'N/A';
      const institution = app.personalDetails?.institution || app.institution || 'N/A';

      const serialNumber = app.awardDetails?.serialNumber || '';
      const appID = app.appID || 'N/A';
      const rowNumber = index + 1; // Sequential number starting from 1
      
      // Escape quotes in onclick handlers
      const safeAppID = appID.replace(/'/g, "\\'");
      const safeName = name.replace(/'/g, "\\'");
      
      // CRITICAL: Filter out ALL dummy/test data - DO NOT RENDER
      const isTestData = 
        (app.applicantEmail && (
          app.applicantEmail.includes('example.com') || 
          app.applicantEmail.includes('TEST_') ||
          app.applicantEmail.includes('test@')
        )) ||
        (app.appID && (
          app.appID.includes('TEST_') || 
          app.appID.includes('DUMMY') ||
          app.appID.includes('Firebase Test')
        )) ||
        (name && (
          name.includes('DUMMY') ||
          name.includes('Test User')
        )) ||
        app.status === 'Deleted' ||
        app.status === 'Test';
      
      // Skip rendering dummy/test data
      if (isTestData) {
        console.log('⏭️ Skipping dummy/test data:', app.appID, name);
        return; // Skip this row
      }
      
      tr.innerHTML = `
        <td><strong class="text-primary">${rowNumber}</strong></td>
        <td>
          <strong>${appID}</strong>
          ${serialNumber ? `<br><small class="text-muted"><i class="bi bi-tag me-1"></i>Serial: ${serialNumber}</small>` : ''}
        </td>
        <td>
          <div class="d-flex align-items-center">
            <i class="bi bi-person-circle me-2 text-primary"></i>
            <div>
              <div class="fw-semibold">${name}</div>
              ${app.personalDetails?.gender ? `<small class="text-muted">${app.personalDetails.gender}</small>` : ''}
            </div>
          </div>
        </td>
        <td>
          <div><i class="bi bi-geo-alt me-1 text-muted"></i><strong>${location}</strong></div>
          <small class="text-muted">${ward}</small>
        </td>
        <td>
          <div><i class="bi bi-building me-1 text-muted"></i>${institution}</div>
          ${app.personalDetails?.regNumber ? `<small class="text-muted">Reg: ${app.personalDetails.regNumber}</small>` : ''}
        </td>
        <td><span class="badge ${statusClass} px-3 py-2">${status}</span></td>
        <td><strong class="text-success">Ksh ${amount.toLocaleString()}</strong></td>
        <td style="text-align: center;">
          <div class="btn-group-vertical btn-group-sm" role="group">
            <button class="btn btn-info action-btn" data-action="view" data-appid="${safeAppID}" title="View Application Details" style="min-width: 100px; cursor: pointer;">
              <i class="bi bi-eye me-1"></i>View
            </button>
            <button class="btn btn-success action-btn" data-action="download" data-appid="${safeAppID}" data-status="${status}" title="Download ${status === 'Awarded' ? 'Award' : status === 'Rejected' ? 'Rejection' : 'Status'} Letter" style="min-width: 100px; cursor: pointer;">
              <i class="bi bi-download me-1"></i>Download
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    // Attach event listeners to all action buttons using event delegation
    tbody.addEventListener('click', function(e) {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const action = btn.getAttribute('data-action');
      const appID = btn.getAttribute('data-appid');
      
      if (!appID) {
        console.error('No appID found for button');
        return;
      }
      
      console.log(`🔘 ${action} button clicked for:`, appID);
      
      if (action === 'view') {
        if (typeof window.safeViewApplication === 'function') {
          window.safeViewApplication(appID);
        } else if (typeof window.viewApplication === 'function') {
          window.viewApplication(appID);
        } else {
          alert('View function not available. Please refresh the page.');
        }
      } else if (action === 'download') {
        // Get status from the button's data attribute
        const status = btn.getAttribute('data-status') || '';
        console.log('📥 Download action - AppID:', appID, 'Status:', status);
        
        // Use the download function with status
        if (typeof window.downloadApplicationLetter === 'function') {
          window.downloadApplicationLetter(appID, status);
        } else if (typeof window.safeDownloadApplication === 'function') {
          window.safeDownloadApplication(appID);
        } else {
          alert('Download function not available. Please refresh the page.');
        }
      }
    });
    
    console.log('✅ Event delegation attached to table buttons');
    
    // VERIFY RENDERING
    const renderedRows = tbody.children.length;
    console.log('✅ TABLE RENDERED SUCCESSFULLY!');
    console.log('   - Expected rows:', sortedApps.length);
    console.log('   - Actual rows in DOM:', renderedRows);
    console.log('   - Table body element:', tbody);
    console.log('   - First row preview:', tbody.firstElementChild?.textContent?.substring(0, 100));
    
    if (renderedRows === 0) {
      console.error('❌ CRITICAL: Table rendered but no rows visible!');
      console.error('   - Applications:', applications.length);
      console.error('   - Sorted apps:', sortedApps.length);
      console.error('   - Table body:', tbody);
    } else {
      console.log('✅ SUCCESS: Table has', renderedRows, 'visible rows - SCROLL DOWN TO SEE THEM!');
    }
    
    // Force table to be visible and scrollable
    const tableContainer = tbody.closest('.table-responsive');
    if (tableContainer) {
      tableContainer.style.display = 'block';
      tableContainer.style.visibility = 'visible';
      console.log('✅ Table container is visible');
    }
  }

  function getStatusBadgeClass(status) {
    const classes = {
      'Pending Submission': 'bg-warning text-dark',
      'Pending Ward Review': 'bg-info',
      'Pending Committee Review': 'bg-primary',
      'Awarded': 'bg-success',
      'Rejected': 'bg-danger',
      'Draft': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  // ENHANCED: Apply filters with better data matching and logging
  window.applyFilters = function() {
    try {
      console.log('🔍 Applying filters...');
      const apps = loadApplications();
      console.log('📊 Total applications loaded:', apps.length);
      
      const filterSubCountyEl = document.getElementById('filterSubCounty');
      const filterWardEl = document.getElementById('filterWard');
      const filterStatusEl = document.getElementById('filterStatus');
      
      if (!filterSubCountyEl || !filterWardEl || !filterStatusEl) {
        console.error('❌ Filter elements not found');
        console.log('   - filterSubCounty:', filterSubCountyEl ? 'found' : 'NOT FOUND');
        console.log('   - filterWard:', filterWardEl ? 'found' : 'NOT FOUND');
        console.log('   - filterStatus:', filterStatusEl ? 'found' : 'NOT FOUND');
        renderTable(apps); // Show all if filters not available
        return;
      }
      
      const filterSubCounty = filterSubCountyEl.value || '';
      const filterWard = filterWardEl.value || '';
      const filterStatus = filterStatusEl.value || '';

      console.log('🔍 Filter values:', {
        subCounty: filterSubCounty || '(all)',
        ward: filterWard || '(all)',
        status: filterStatus || '(all)'
      });

      let filtered = [...apps]; // Create a copy to avoid mutating original

      // Filter by Sub-County
      if (filterSubCounty) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(a => {
          // Try multiple sources for sub-county data
          const sc = a.personalDetails?.subCounty || a.subCounty || '';
          
          if (filterSubCounty === 'Other') {
            // Match if sub-county is not in the standard list
            const isOther = sc && sc !== 'N/A' && typeof GARISSA_WARDS !== 'undefined' && !Object.keys(GARISSA_WARDS).includes(sc);
            return isOther;
          }
          // Exact match (case-insensitive)
          return sc && sc.toLowerCase() === filterSubCounty.toLowerCase();
        });
        console.log(`   📍 Sub-county filter: ${beforeCount} → ${filtered.length} applications`);
      }

      // Filter by Ward
      if (filterWard) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(a => {
          // Try multiple sources for ward data
          const w = a.personalDetails?.ward || a.ward || '';
          
          if (filterWard === 'Other') {
            // Match if ward is not in the standard list for its sub-county
            const sc = a.personalDetails?.subCounty || a.subCounty || '';
            const wards = (typeof GARISSA_WARDS !== 'undefined' && GARISSA_WARDS[sc]) ? GARISSA_WARDS[sc] : [];
            const isOther = w && w !== 'N/A' && !wards.includes(w);
            return isOther;
          }
          // Exact match (case-insensitive)
          return w && w.toLowerCase() === filterWard.toLowerCase();
        });
        console.log(`   📍 Ward filter: ${beforeCount} → ${filtered.length} applications`);
      }

      // Filter by Status
      if (filterStatus) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(a => {
          const status = a.status || 'Pending Submission';
          // Exact match (case-insensitive)
          return status.toLowerCase() === filterStatus.toLowerCase();
        });
        console.log(`   📊 Status filter: ${beforeCount} → ${filtered.length} applications`);
      }

      // Render filtered results (uses modern list if available)
      renderTable(filtered);
      
      console.log('✅ Filters applied successfully:', {
        total: apps.length,
        filtered: filtered.length,
        subCounty: filterSubCounty || '(all)',
        ward: filterWard || '(all)',
        status: filterStatus || '(all)'
      });
      
      // Show user-friendly message if no results
      if (filtered.length === 0 && apps.length > 0) {
        console.warn('⚠️ No applications match the selected filters');
      }
      
    } catch (error) {
      console.error('❌ Filter error:', error);
      console.error('   Stack:', error.stack);
      const apps = loadApplications();
      renderTable(apps);
      alert('Error applying filters. Showing all applications.\n\nError: ' + error.message);
    }
  }

  // View application modal
  window.viewApplication = function(appID) {
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (!app) {
      alert('Application not found');
      return;
    }

    // Remove any existing modal first
    const existingModal = document.getElementById('viewApplicationModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create and show modal using Bootstrap
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'viewApplicationModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'viewApplicationModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Application Details - ${app.appID}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <h6>Applicant Information</h6>
                <p><strong>Name:</strong> ${app.applicantName || 'N/A'}</p>
                <p><strong>Location:</strong> ${app.personalDetails?.subCounty || 'N/A'}, ${app.personalDetails?.ward || 'N/A'}</p>
                <p><strong>Institution:</strong> ${app.personalDetails?.institution || 'N/A'}</p>
                <p><strong>Registration No:</strong> ${app.personalDetails?.regNumber || 'N/A'}</p>
              </div>
              <div class="col-md-6">
                <h6>Financial Summary</h6>
                <p><strong>Fee Balance:</strong> Ksh ${(app.financialDetails?.feeBalance || 0).toLocaleString()}</p>
                <p><strong>Amount Requested:</strong> Ksh ${(app.financialDetails?.amountRequested || 0).toLocaleString()}</p>
                <p><strong>Monthly Income:</strong> Ksh ${(app.financialDetails?.monthlyIncome || 0).toLocaleString()}</p>
              </div>
            </div>
            <hr>
            <h6>Justification</h6>
            <p class="bg-light p-3 rounded">${app.financialDetails?.justification || 'N/A'}</p>
            <hr>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Document Actions</h6>
              <div class="btn-group">
                <button class="btn btn-sm btn-primary" onclick="viewFormattedDocument('${appID}')" title="View & Auto-Download Document (Downloads automatically)">
                  <i class="bi bi-file-earmark-pdf me-1"></i>View & Download
                </button>
                <button class="btn btn-sm btn-success" onclick="downloadApplicationPDFFromView('${appID}')" title="Download Application Summary PDF">
                  <i class="bi bi-download me-1"></i>Download Summary
                </button>
              </div>
            </div>
            <h6>Admin Action</h6>
            <div class="input-group mb-3">
              <span class="input-group-text">Award Amount (KES):</span>
              <input type="number" class="form-control" id="awardAmount" placeholder="e.g. 20000" min="0">
            </div>
            <textarea class="form-control mb-3" id="awardJustification" rows="3" placeholder="Recommendation/Justification (Mandatory)"></textarea>
            <div class="d-flex gap-2">
              <button class="btn btn-success" onclick="approveApplication('${appID}')">
                <i class="bi bi-check-circle"></i> Approve/Award
              </button>
              <button class="btn btn-danger" onclick="rejectApplication('${appID}')">
                <i class="bi bi-x-circle"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Initialize and show Bootstrap modal
    try {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = new bootstrap.Modal(modal, {
          backdrop: true,
          keyboard: true
        });
        bsModal.show();
        console.log('✅ Modal opened via Bootstrap');
      } else {
        // Fallback: show modal manually
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'modalBackdrop';
        document.body.appendChild(backdrop);
        console.log('✅ Modal opened via fallback');
      }
    } catch (error) {
      console.error('Modal error:', error);
      // Fallback: show as alert
      alert(`Application: ${app.appID}\nName: ${app.applicantName}\nStatus: ${app.status}`);
    }
    
    // Clean up on close
    modal.addEventListener('hidden.bs.modal', function() {
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) backdrop.remove();
      modal.remove();
    });
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  };

  // Approve application - works for all statuses
  window.approveApplication = async function(appID) {
    // Handle if appID is an object (error case)
    if (typeof appID === 'object') {
      console.error('Invalid appID (object):', appID);
      alert('⚠️ Invalid application ID. Please refresh the page and try again.');
      return;
    }
    
    // Get admin email from session
    let adminEmail = 'fundadmin@garissa.go.ke';
    try {
      const adminStr = sessionStorage.getItem('mbms_admin');
      if (adminStr) {
        const admin = JSON.parse(adminStr);
        adminEmail = admin.email || adminEmail;
      }
    } catch (e) {
      console.warn('Could not get admin email:', e);
    }
    
    const awardAmountInput = document.getElementById('awardAmount');
    const justificationInput = document.getElementById('awardJustification');
    
    if (!awardAmountInput || !justificationInput) {
      alert('⚠️ Award form not found. Please refresh the page.');
      return;
    }

    const awardAmount = parseFloat(awardAmountInput.value);
    const justification = justificationInput.value.trim();
    
    if (isNaN(awardAmount) || awardAmount <= 0) {
      alert('⚠️ Please enter a valid award amount (greater than 0).');
      awardAmountInput.focus();
      return;
    }
    
    if (!justification) {
      alert('⚠️ Justification is required. Please provide a reason for this award.');
      justificationInput.focus();
      return;
    }
    
    // Check budget availability (recalculate first)
    if (typeof checkBudgetAvailable !== 'undefined') {
      if (typeof syncBudgetWithAwards !== 'undefined') {
      syncBudgetWithAwards(); // Sync before checking
      }
      const budgetCheck = checkBudgetAvailable(awardAmount);
      if (!budgetCheck.available) {
        const budget = getBudgetBalance();
        const available = budget.total - budget.allocated;
        alert(`❌ INSUFFICIENT BUDGET!\n\n${budgetCheck.message}\n\nTotal Budget: Ksh ${budget.total.toLocaleString()}\nAlready Allocated: Ksh ${budget.allocated.toLocaleString()}\nAvailable: Ksh ${available.toLocaleString()}\nRequested: Ksh ${awardAmount.toLocaleString()}\n\nPlease reduce the award amount or contact finance department.`);
        return;
      }
    }
    
    if (!confirm(`Are you sure you want to award Ksh ${awardAmount.toLocaleString()} to this applicant?`)) {
      return;
    }

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    
    if (!app) {
      alert('⚠️ Application not found.');
      return;
    }
    
      // Get serial number before awarding
      const serialNumber = getNextSerialNumber();
      
      // Allocate budget FIRST (before updating application)
      let budgetStatus = null;
      if (typeof allocateBudget !== 'undefined') {
        try {
          budgetStatus = allocateBudget(awardAmount);
          console.log('Budget allocated:', budgetStatus);
        } catch (error) {
          alert('❌ Budget Allocation Error: ' + error.message);
          return;
        }
      }
      
    // Update application status (works for all statuses)
      app.status = 'Awarded';
      app.awardDetails = {
        committee_amount_kes: awardAmount,
        date_awarded: new Date().toISOString(),
        justification: justification,
      admin_assigned_uid: adminEmail,
        serialNumber: serialNumber,
        amount: awardAmount // For compatibility
      };
      
      // Save applications to UNIFIED DATABASE (Firebase or localStorage)
      if (typeof updateApplicationStatus !== 'undefined') {
        await updateApplicationStatus(appID, {
          status: 'Awarded',
          awardDetails: app.awardDetails
        });
        console.log('✅ Application awarded and updated in UNIFIED DATABASE:', appID);
      } else {
        localStorage.setItem('mbms_applications', JSON.stringify(apps));
        console.log('✅ Application awarded (fallback):', appID);
      }
      
      // Force budget sync to ensure accuracy
      if (typeof syncBudgetWithAwards !== 'undefined') {
        syncBudgetWithAwards();
      }
      
      // Update metrics and budget display IMMEDIATELY (real-time)
      updateMetrics();
      updateBudgetDisplay();
      applyFilters();
      refreshApplications(); // Force table refresh
      
      // Force immediate UI refresh
      setTimeout(() => {
        updateMetrics();
        updateBudgetDisplay();
        refreshApplications(); // Ensure table is updated
      }, 100);
      
      // Trigger storage event for multi-device sync
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'awarded', appID: appID }
      }));
      
      // Get updated budget status
      const updatedBudget = getBudgetBalance();
      const updatedStatus = getBudgetStatus();
      const remainingBalance = updatedBudget.total - updatedBudget.allocated;
      
      // Check if budget is exhausted or low
      if (updatedStatus.isExhausted || remainingBalance <= 0) {
        alert('⚠️ BUDGET EXHAUSTED!\n\nNo more budget available. Please contact finance department to replenish funds.');
      } else if (updatedStatus.isLow) {
        alert('⚠️ LOW BUDGET WARNING!\n\nOnly ' + updatedStatus.percentage.toFixed(1) + '% budget remaining.\nRemaining: Ksh ' + remainingBalance.toLocaleString());
      }
      
      // Close the view modal first
      const awardViewModal = document.querySelector('.modal');
      if (awardViewModal) {
        bootstrap.Modal.getInstance(awardViewModal).hide();
      }
      
      // Notify admin via email
      if (typeof notifyAdminAwarded !== 'undefined') {
        notifyAdminAwarded(app, app.awardDetails);
      }
      
      // Auto-download award letter immediately (to default downloads folder)
      let downloadSuccess = false;
      let downloadedFilename = '';
      try {
        console.log('📥 Auto-downloading award letter...');
        if (typeof generateOfferLetterPDF !== 'undefined') {
          const result = await generateOfferLetterPDF(app, app.awardDetails, { preview: false });
          if (result && result.filename) {
            downloadSuccess = true;
            downloadedFilename = result.filename;
            console.log('✅ Award letter auto-downloaded:', downloadedFilename);
          }
        } else if (typeof downloadPDFDirect !== 'undefined') {
          await downloadPDFDirect(app, app.awardDetails);
          downloadSuccess = true;
          downloadedFilename = `Award_Letter_${app.appID}.pdf`;
          console.log('✅ Award letter auto-downloaded to default downloads folder');
        }
        
        // Auto-send email to fundadmin@garissa.go.ke ONLY if download succeeded
        if (downloadSuccess && downloadedFilename) {
          setTimeout(() => {
            if (typeof sendEmailDraft !== 'undefined') {
              sendEmailDraft(app, 'award', downloadedFilename, app.awardDetails);
              console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
            }
          }, 1000);
        }
      } catch (pdfError) {
        console.error('PDF download error:', pdfError);
        downloadSuccess = false;
        // Continue even if PDF fails - show warning but don't block
        alert('⚠️ Award successful but PDF download failed. You can download it later from the applications list.');
      }
      
      // Show success message (only mention download if it succeeded)
      const downloadMsg = downloadSuccess ? '\n\n📥 Award letter has been automatically downloaded!' : '\n\n⚠️ Award letter download failed - you can download it later from the applications list.';
      alert('✅ Successfully awarded!\n\n📄 Serial Number: ' + serialNumber + '\n💰 Amount Awarded: Ksh ' + awardAmount.toLocaleString() + '\n📊 Budget Remaining: Ksh ' + remainingBalance.toLocaleString() + (downloadSuccess ? '\n📧 Copy sent to fundadmin@garissa.go.ke' : '') + downloadMsg);
      
      // Refresh display and visualizations
      refreshApplications();
      updateMetrics();
      updateBudgetDisplay();
      applyFilters();
      
      // Refresh visualizations with updated data
      setTimeout(() => {
        if (typeof refreshVisualizations === 'function') {
          refreshVisualizations();
          console.log('✅ Visualizations updated after award');
        }
      }, 500);
    }
  };

  // Reject application
  window.rejectApplication = async function(appID) {
    const rejectionReason = prompt('Please provide a reason for rejection (this will be included in the rejection letter):');
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required. Please provide a reason.');
      return;
    }

    if (!confirm('Are you sure you want to reject this application?')) return;

    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app) {
      app.status = 'Rejected';
      app.rejectionDate = new Date().toISOString();
      app.rejectionReason = rejectionReason.trim();
      
      // Save to UNIFIED DATABASE (Firebase or localStorage)
      try {
        if (typeof updateApplicationStatus !== 'undefined') {
          await updateApplicationStatus(appID, {
            status: 'Rejected',
            rejectionDate: app.rejectionDate,
            rejectionReason: app.rejectionReason
          });
          console.log('✅ Application rejected and updated in UNIFIED DATABASE:', appID);
        } else {
          // Fallback: Update in apps array and save
          const appIndex = apps.findIndex(a => a.appID === appID);
          if (appIndex >= 0) {
            apps[appIndex] = app;
          }
          localStorage.setItem('mbms_applications', JSON.stringify(apps));
          console.log('✅ Application rejected (localStorage fallback):', appID);
        }
      } catch (error) {
        console.error('Error saving rejection:', error);
        // Still save to localStorage as backup
        const appIndex = apps.findIndex(a => a.appID === appID);
        if (appIndex >= 0) {
          apps[appIndex] = app;
        }
        localStorage.setItem('mbms_applications', JSON.stringify(apps));
      }
      
      // Update metrics and display
      updateMetrics();
      applyFilters();
      refreshApplications();
      
      // Budget remains unchanged when rejecting (only changes when awarding)
      const budget = getBudgetBalance();
      const remainingBalance = budget.total - budget.allocated;
      
      // Notify admin via email
      if (typeof notifyAdminRejected !== 'undefined') {
        notifyAdminRejected(app);
      }
      
      // Auto-download rejection letter to default downloads folder
      let rejectionDownloadSuccess = false;
      let rejectionFilename = '';
      try {
        console.log('📥 Auto-downloading rejection letter...');
        if (typeof generateRejectionLetterPDF !== 'undefined') {
          const result = await generateRejectionLetterPDF(app);
          if (result && result.filename) {
            rejectionDownloadSuccess = true;
            rejectionFilename = result.filename;
            console.log('✅ Rejection letter auto-downloaded to default downloads folder:', rejectionFilename);
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successMsg.style.zIndex = '10000';
            successMsg.style.minWidth = '400px';
            successMsg.innerHTML = `
              <strong>✅ Document Downloaded!</strong><br>
              <div class="mt-2">
                📄 File: <strong>${rejectionFilename}</strong><br>
                <small class="text-muted">File saved to your default downloads folder</small>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) successMsg.remove();
            }, 5000);
            
            // Auto-send email to fundadmin@garissa.go.ke ONLY if download succeeded
            setTimeout(() => {
              if (typeof sendEmailDraft !== 'undefined') {
                sendEmailDraft(app, 'rejection', rejectionFilename, null);
                console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
              }
            }, 1000);
          }
        }
      } catch (pdfError) {
        console.error('PDF download error:', pdfError);
        rejectionDownloadSuccess = false;
        // Continue even if PDF fails - show warning but don't block
        alert('⚠️ Application rejected but PDF download failed. You can download it later from the applications list.');
      }
      
      // Close modal
      const rejectViewModal = document.querySelector('.modal');
      if (rejectViewModal) {
        bootstrap.Modal.getInstance(rejectViewModal).hide();
      }
      
      // Show success message (only mention download if it succeeded)
      const rejectionDownloadMsg = rejectionDownloadSuccess ? '\n\n📥 Rejection letter has been automatically downloaded!' : '\n\n⚠️ Rejection letter download failed - you can download it later from the applications list.';
      alert('✅ Application rejected successfully!' + (rejectionDownloadSuccess ? '\n\n📧 Copy sent to fundadmin@garissa.go.ke' : '') + rejectionDownloadMsg);
      
      // Refresh display
      refreshApplications();
      updateMetrics();
      applyFilters();
      
      // Update metrics and display (budget stays same)
      updateMetrics();
      updateBudgetDisplay(); // Refresh display but budget unchanged
      applyFilters();
      refreshApplications();
      
      // Refresh visualizations with updated data
      setTimeout(() => {
        if (typeof refreshVisualizations === 'function') {
          refreshVisualizations();
          console.log('✅ Visualizations updated after rejection');
        }
      }, 500);
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('mbms-data-updated', {
        detail: { key: 'mbms_applications', action: 'rejected', appID: appID }
      }));
      
      // Don't show duplicate alert - already shown above
      
      const rejectViewModal2 = document.querySelector('.modal');
      if (rejectViewModal2) {
        bootstrap.Modal.getInstance(rejectViewModal2).hide();
      }
    }
  };

  // Download application PDF from view modal - AUTO-DOWNLOADS with success message
  window.downloadApplicationPDFFromView = async function(appID) {
    try {
      const apps = loadApplications();
      const app = apps.find(a => a.appID === appID);
      if (!app) {
        alert('Application not found');
        return;
      }

      // Show loading indicator
      const loadingAlert = document.createElement('div');
      loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingAlert.style.zIndex = '9999';
      loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating application summary PDF...';
      document.body.appendChild(loadingAlert);

      // Download application summary PDF - AUTO-DOWNLOADS with success message
      if (typeof downloadApplicationSummaryPDF !== 'undefined') {
        // Use downloadApplicationSummaryPDF which handles auto-download and success message
        loadingAlert.remove();
        await downloadApplicationSummaryPDF(app);
        return; // downloadApplicationSummaryPDF shows its own success message
      } else if (typeof generateApplicationSummaryPDF !== 'undefined') {
        const result = await generateApplicationSummaryPDF(app);
        loadingAlert.remove();
        if (result && result.filename) {
          // Show success message
          showDownloadSuccess(result.filename, app);
        }
      } else {
        // Fallback to letter download
        loadingAlert.remove();
        await window.downloadApplicationLetter(appID);
        return; // downloadApplicationLetter will show its own success message
      }
    } catch (error) {
      console.error('Error downloading application summary:', error);
      const loadingAlert = document.querySelector('.alert-info');
      if (loadingAlert) loadingAlert.remove();
      alert('❌ Error downloading PDF. Please try again.\n\nError: ' + error.message);
    }
  };

  // Download application letter (works for all statuses: Awarded, Rejected, Pending) - ENHANCED with verification
  window.downloadApplicationLetter = async function(appID, status = null) {
    try {
      console.log('📥 Download triggered for appID:', appID);
      
      const apps = loadApplications();
      if (!apps || apps.length === 0) {
        alert('⚠️ No applications found. The system is ready for the first applicant submission.');
        return;
      }
      
      // Handle if appID is an object (error case)
      if (typeof appID === 'object') {
        console.error('Invalid appID (object):', appID);
        alert('⚠️ Invalid application ID. Please refresh the page and try again.');
        return;
      }
      
      // Ensure appID is a string
      appID = String(appID);
      
      const app = apps.find(a => String(a.appID) === appID);
      
      if (!app) {
        console.error('Application not found. AppID:', appID);
        console.log('Available applications:', apps.map(a => a.appID));
        alert('⚠️ Application not found.\n\nApplication ID: ' + appID + '\n\nPlease refresh the page and try again.');
        return;
      }
      
      console.log('✅ Application found:', app.appID);

      // Show loading indicator
      const loadingAlert = document.createElement('div');
      loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingAlert.style.zIndex = '9999';
      loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating and downloading PDF...';
      document.body.appendChild(loadingAlert);

      let filename = '';
      let documentType = '';
      
      // Use provided status or app status
      const appStatus = status || app.status;
      
      if (appStatus === 'Awarded') {
        // Download award letter
        if (!app.awardDetails) {
          loadingAlert.remove();
          alert('⚠️ Award details not found. Please award this application first.');
          return;
        }

        const awardDetails = {
          ...app.awardDetails,
          serialNumber: app.awardDetails.serialNumber || getNextSerialNumber()
        };
        
        // Generate and auto-download award letter
        if (typeof generateOfferLetterPDF !== 'undefined') {
          documentType = 'award';
          const result = await generateOfferLetterPDF(app, awardDetails, { preview: false });
          if (result && result.filename) {
            filename = result.filename;
            console.log('✅ Award letter auto-downloaded:', filename);
            
            // Show success message
            loadingAlert.remove();
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successMsg.style.zIndex = '9999';
            successMsg.style.minWidth = '300px';
            successMsg.innerHTML = `
              <strong>✅ Document Downloaded!</strong><br>
              <small>File: ${filename}</small><br>
              <small class="text-muted">Saved to your default downloads folder</small>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) {
                successMsg.remove();
              }
            }, 5000);
            return;
          } else {
            // Fallback filename
            const applicantName = app.applicantName || 
              `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
            const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            filename = `Garissa_Bursary_Award_${sanitizedName}_${awardDetails.serialNumber}_${app.appID}.pdf`;
          }
        } else {
          // Fallback
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `Garissa_Bursary_Award_${sanitizedName}_${awardDetails.serialNumber}_${app.appID}.pdf`;
          documentType = 'award';
          await downloadPDFDirect(app, awardDetails);
        }
        loadingAlert.remove();
      } else if (appStatus === 'Rejected') {
        // Download rejection letter
        if (typeof generateRejectionLetterPDF !== 'undefined') {
          documentType = 'rejection';
          const result = await generateRejectionLetterPDF(app);
          if (result && result.filename) {
            filename = result.filename;
            console.log('✅ Rejection letter auto-downloaded:', filename);
            
            // Show success message
            loadingAlert.remove();
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successMsg.style.zIndex = '9999';
            successMsg.style.minWidth = '300px';
            successMsg.innerHTML = `
              <strong>✅ Document Downloaded!</strong><br>
              <small>File: ${filename}</small><br>
              <small class="text-muted">Saved to your default downloads folder</small>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) {
                successMsg.remove();
              }
            }, 5000);
            return;
          } else {
            // Fallback filename
            const applicantName = app.applicantName || 
              `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
            const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            filename = `Garissa_Bursary_Rejection_${sanitizedName}_${app.appID}.pdf`;
          }
        } else {
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `Garissa_Bursary_Rejection_${sanitizedName}_${app.appID}.pdf`;
          documentType = 'rejection';
          await downloadRejectionLetter(app);
        }
        loadingAlert.remove();
      } else {
        // Download status letter for pending applications (use appStatus)
        if (typeof generateStatusLetterPDF !== 'undefined') {
          documentType = 'status';
          const result = await generateStatusLetterPDF(app);
          if (result && result.filename) {
            filename = result.filename;
            console.log('✅ Status letter auto-downloaded:', filename);
            
            // Show success message
            loadingAlert.remove();
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successMsg.style.zIndex = '9999';
            successMsg.style.minWidth = '300px';
            successMsg.innerHTML = `
              <strong>✅ Document Downloaded!</strong><br>
              <small>File: ${filename}</small><br>
              <small class="text-muted">Saved to your default downloads folder</small>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) {
                successMsg.remove();
              }
            }, 5000);
            return;
          } else {
            // Fallback filename
            const applicantName = app.applicantName || 
              `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
            const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
            filename = `Garissa_Bursary_Status_${sanitizedName}_${app.appID}.pdf`;
          }
        } else {
          const applicantName = app.applicantName || 
            `${app.personalDetails?.firstNames || ''} ${app.personalDetails?.lastName || ''}`.trim() || 'Applicant';
          const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
          filename = `Garissa_Bursary_Status_${sanitizedName}_${app.appID}.pdf`;
          documentType = 'status';
          await downloadStatusLetter(app);
        }
        loadingAlert.remove();
      }
      
      // Only show success and send email if download actually succeeded
      if (filename && documentType) {
        // Show success message
        showDownloadSuccess(filename, app);
        
        // Auto-send email to fundadmin@garissa.go.ke ONLY if download succeeded
        if (typeof sendEmailDraft !== 'undefined') {
          setTimeout(() => {
            sendEmailDraft(app, documentType, filename, app.awardDetails || null);
            console.log('✅ Email draft sent to fundadmin@garissa.go.ke');
          }, 1000);
        }
      } else {
        // Download failed - show error
        loadingAlert.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        errorMsg.style.zIndex = '10000';
        errorMsg.innerHTML = `
          <strong>❌ Document Generation Failed</strong><br>
          <small>Please try again or contact support</small>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(errorMsg);
        setTimeout(() => {
          if (errorMsg.parentNode) errorMsg.remove();
        }, 5000);
      }
    } catch (error) {
      console.error('PDF download error:', error);
      const loadingAlert = document.querySelector('.alert-info');
      if (loadingAlert) loadingAlert.remove();
      alert('❌ Error downloading PDF. Please try again or contact support.\n\nError: ' + error.message);
    }
  };
  
  // Show download success notification
  function showDownloadSuccess(filename, app) {
    // Remove loading alert if exists
    const loadingAlert = document.querySelector('.alert-info');
    if (loadingAlert) loadingAlert.remove();
    
    // Create success notification
    const successNotification = document.createElement('div');
    successNotification.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg';
    successNotification.style.zIndex = '10000';
    successNotification.style.minWidth = '400px';
    successNotification.style.animation = 'slideDown 0.5s ease-out';
    successNotification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-check-circle-fill me-2" style="font-size: 1.5rem;"></i>
        <div class="flex-grow-1">
          <strong>✅ Downloaded Successfully!</strong><br>
          <small class="text-muted">${filename}</small><br>
          <small class="text-muted">Document saved to your downloads folder</small>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    document.body.appendChild(successNotification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (successNotification.parentNode) {
        successNotification.remove();
      }
    }, 5000);
    
    console.log('✅ Download success notification shown:', filename);
  }
  
  // Legacy functions for backward compatibility
  window.previewPDFLetter = async function(appID) {
    // Redirect to download for awarded applications
    const apps = loadApplications();
    const app = apps.find(a => a.appID === appID);
    if (app && app.status === 'Awarded') {
      if (typeof window.downloadApplicationLetter === 'function') {
        await window.downloadApplicationLetter(appID);
      } else if (typeof window.safeDownloadApplication === 'function') {
        await window.safeDownloadApplication(appID);
      }
    } else {
      alert('⚠️ Preview is only available for awarded applications. Use Download instead.');
    }
  };
  
  window.downloadPDFDirect = async function(application, awardDetails) {
    // Handle both appID string and application object
    if (typeof application === 'string') {
      await window.downloadApplicationLetter(application);
      return;
    }
    
    // If application object provided, generate PDF directly
    if (application && awardDetails) {
      try {
        if (typeof generateOfferLetterPDF !== 'undefined') {
          const result = await generateOfferLetterPDF(application, awardDetails, { preview: false });
          if (result && result.filename) {
            console.log('✅ PDF auto-downloaded:', result.filename);
            
            // Send email
            if (typeof sendEmailDraft !== 'undefined') {
              setTimeout(() => {
                sendEmailDraft(application, 'award', result.filename, awardDetails);
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + error.message);
      }
    }
  };
  
  // Create downloadApplicationLetter as alias to downloadApplicationPDFFromView
  window.downloadApplicationLetter = async function(appID) {
    return await window.downloadApplicationPDFFromView(appID);
  };
  
  window.downloadPDF = window.downloadApplicationPDFFromView;
  
  // Safe View Application wrapper - ENHANCED: Always works
  window.safeViewApplication = function(appID) {
    try {
      console.log('👁️ View button clicked for:', appID);
      console.log('🔍 Available functions:', {
        viewApplication: typeof window.viewApplication,
        safeViewApplication: typeof window.safeViewApplication
      });
      
      // Ensure appID is a string
      if (typeof appID === 'object') {
        console.error('Invalid appID (object):', appID);
        alert('⚠️ Invalid application ID. Please refresh the page.');
        return;
      }
      appID = String(appID).trim();
      
      // Always use viewApplication if it exists
      if (typeof window.viewApplication === 'function') {
        try {
          window.viewApplication(appID);
          console.log('✅ View function called successfully');
          return;
        } catch (error) {
          console.error('Error in viewApplication:', error);
          alert('Error opening application: ' + error.message);
        }
      }
      
      // Fallback: Direct implementation
      const apps = loadApplications();
      const app = apps.find(a => String(a.appID) === appID);
      
      if (!app) {
        alert('⚠️ Application not found.\n\nApplication ID: ' + appID);
        return;
      }
      
      // Create and show modal
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'viewApplicationModal';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-eye me-2"></i>Application Details - ${app.appID}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6><i class="bi bi-person me-1"></i>Applicant Information</h6>
                  <p><strong>Name:</strong> ${app.applicantName || 'N/A'}</p>
                  <p><strong>Location:</strong> ${app.personalDetails?.subCounty || app.subCounty || 'N/A'}, ${app.personalDetails?.ward || app.ward || 'N/A'}</p>
                  <p><strong>Institution:</strong> ${app.personalDetails?.institution || app.institution || 'N/A'}</p>
                  <p><strong>Registration No:</strong> ${app.personalDetails?.regNumber || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                  <h6><i class="bi bi-cash-coin me-1"></i>Financial Summary</h6>
                  <p><strong>Fee Balance:</strong> Ksh ${(app.financialDetails?.feeBalance || 0).toLocaleString()}</p>
                  <p><strong>Amount Requested:</strong> Ksh ${(app.financialDetails?.amountRequested || 0).toLocaleString()}</p>
                  <p><strong>Monthly Income:</strong> Ksh ${(app.financialDetails?.monthlyIncome || 0).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span class="badge bg-${app.status === 'Awarded' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}">${app.status || 'Pending'}</span></p>
                </div>
              </div>
              <hr>
              <h6><i class="bi bi-file-text me-1"></i>Justification</h6>
              <p class="bg-light p-3 rounded">${app.financialDetails?.justification || 'N/A'}</p>
              <hr>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0"><i class="bi bi-file-earmark-pdf me-1"></i>Document Actions</h6>
                <div class="btn-group">
                  <button class="btn btn-sm btn-success" onclick="safeDownloadApplication('${appID}')" title="Download Document (Auto-downloads to your default folder)">
                    <i class="bi bi-download me-1"></i>Download Document
                  </button>
                </div>
              </div>
              <div class="alert alert-info">
                <small><i class="bi bi-info-circle me-1"></i>Click "Download Document" to automatically download the ${app.status === 'Awarded' ? 'award letter' : app.status === 'Rejected' ? 'rejection letter' : 'status letter'} to your default downloads folder.</small>
              </div>
              ${app.status !== 'Awarded' && app.status !== 'Rejected' ? `
              <hr>
              <h6><i class="bi bi-check-circle me-1"></i>Admin Action</h6>
              <div class="input-group mb-3">
                <span class="input-group-text">Award Amount (KES):</span>
                <input type="number" class="form-control" id="awardAmount" placeholder="e.g. 20000" min="0">
              </div>
              <textarea class="form-control mb-3" id="awardJustification" rows="3" placeholder="Recommendation/Justification (Mandatory)"></textarea>
              <div class="d-flex gap-2">
                <button class="btn btn-success" onclick="approveApplication('${appID}'); bootstrap.Modal.getInstance(document.getElementById('viewApplicationModal')).hide();">
                  <i class="bi bi-check-circle me-1"></i> Approve/Award
                </button>
                <button class="btn btn-danger" onclick="rejectApplication('${appID}'); bootstrap.Modal.getInstance(document.getElementById('viewApplicationModal')).hide();">
                  <i class="bi bi-x-circle me-1"></i> Reject
                </button>
              </div>
              ` : ''}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-1"></i>Close
              </button>
              <button type="button" class="btn btn-success" onclick="safeDownloadApplication('${appID}')" title="Auto-downloads document to your default folder">
                <i class="bi bi-download me-1"></i>Download Document
              </button>
            </div>
          </div>
        </div>
      `;
    document.body.appendChild(modal);
    
    // Initialize and show Bootstrap modal
    try {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = new bootstrap.Modal(modal, {
          backdrop: true,
          keyboard: true
        });
        bsModal.show();
        console.log('✅ Modal opened via Bootstrap');
      } else {
        // Fallback: show modal manually
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'modalBackdrop';
        document.body.appendChild(backdrop);
        console.log('✅ Modal opened via fallback');
      }
    } catch (error) {
      console.error('Modal error:', error);
      // Fallback: show as alert
      alert(`Application: ${app.appID}\nName: ${app.applicantName}\nStatus: ${app.status}`);
    }
    
    // Clean up on close
    modal.addEventListener('hidden.bs.modal', function() {
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) backdrop.remove();
      modal.remove();
    });
      
      console.log('✅ View modal displayed successfully');
    } catch (error) {
      console.error('View error:', error);
      alert('Error viewing application. Please try again.\n\nError: ' + error.message);
    }
  };
  
  // Safe Download Application wrapper with auto-download - ENHANCED: Always works
  window.safeDownloadApplication = async function(appID) {
    try {
      console.log('📥 Download button clicked for:', appID);
      console.log('🔍 Available functions:', {
        downloadApplicationLetter: typeof window.downloadApplicationLetter,
        safeDownloadApplication: typeof window.safeDownloadApplication,
        downloadPDFDirect: typeof window.downloadPDFDirect
      });
      
      // Ensure appID is a string
      if (typeof appID === 'object') {
        console.error('Invalid appID (object):', appID);
        alert('⚠️ Invalid application ID. Please refresh the page.');
        return;
      }
      appID = String(appID).trim();
      
      // Show loading indicator
      const loadingAlert = document.createElement('div');
      loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingAlert.style.zIndex = '10000';
      loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF... Please wait...';
      document.body.appendChild(loadingAlert);
      
      // Try downloadApplicationLetter first
      if (typeof window.downloadApplicationLetter === 'function') {
        try {
          await window.downloadApplicationLetter(appID);
          console.log('✅ Download completed via downloadApplicationLetter');
          setTimeout(() => {
            if (loadingAlert.parentNode) loadingAlert.remove();
          }, 1000);
          return;
        } catch (error) {
          console.error('downloadApplicationLetter error:', error);
          // Continue to fallback
        }
      }
      
      // Fallback: Direct download implementation
      const apps = loadApplications();
      const app = apps.find(a => String(a.appID) === appID);
      
      if (!app) {
        loadingAlert.remove();
        alert('⚠️ Application not found.\n\nApplication ID: ' + appID);
        return;
      }
      
      // Generate PDF based on status - ENHANCED: Multiple fallbacks
      let pdfGenerated = false;
      
      if (app.status === 'Awarded') {
        if (typeof generateOfferLetterPDF === 'function') {
          try {
            await generateOfferLetterPDF(app, app.awardDetails || {}, { preview: false });
            pdfGenerated = true;
            console.log('✅ Award letter PDF generated');
          } catch (error) {
            console.error('generateOfferLetterPDF error:', error);
          }
        }
      } else if (app.status === 'Rejected') {
        if (typeof generateRejectionLetterPDF === 'function') {
          try {
            await generateRejectionLetterPDF(app);
            pdfGenerated = true;
            console.log('✅ Rejection letter PDF generated');
          } catch (error) {
            console.error('generateRejectionLetterPDF error:', error);
          }
        }
      } else {
        if (typeof generateStatusLetterPDF === 'function') {
          try {
            await generateStatusLetterPDF(app);
            pdfGenerated = true;
            console.log('✅ Status letter PDF generated');
          } catch (error) {
            console.error('generateStatusLetterPDF error:', error);
          }
        }
      }
      
      if (!pdfGenerated) {
        loadingAlert.remove();
        alert('⚠️ PDF generation functions not available. Please refresh the page.\n\nIf the problem persists, check the browser console (F12) for errors.');
        return;
      }
      
      // Remove loading indicator
      setTimeout(() => {
        if (loadingAlert.parentNode) loadingAlert.remove();
      }, 1000);
      
      // Show success message
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
      successAlert.style.zIndex = '10000';
      successAlert.innerHTML = `
        <strong>✅ Downloaded Successfully!</strong><br>
        <small>Document saved to your downloads folder</small>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(successAlert);
      setTimeout(() => {
        if (successAlert.parentNode) successAlert.remove();
      }, 5000);
      
      console.log('✅ Download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
      const loadingAlert = document.querySelector('.alert-info');
      if (loadingAlert) loadingAlert.remove();
      alert('Error downloading document. Please try again.\n\nError: ' + error.message);
    }
  };
  
  // View formatted document - AUTO-DOWNLOADS by default
  window.viewFormattedDocument = async function(appID) {
    try {
      const apps = loadApplications();
      const app = apps.find(a => a.appID === appID);
      if (!app) {
        alert('Application not found');
        return;
      }
      
      // AUTO-DOWNLOAD the document immediately
      console.log('📥 Auto-downloading document for:', appID);
      await safeDownloadApplication(appID);
      
      // Show brief preview modal while downloading
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'documentViewModal';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">
                <i class="bi bi-download me-2"></i>Document Auto-Downloaded - ${app.appID}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center">
              <div class="mb-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                <h4 class="mt-3">Document Downloaded Successfully!</h4>
                <p class="text-muted">The document has been automatically downloaded to your default downloads folder.</p>
              </div>
              <div class="card">
                <div class="card-body text-start">
                  <h6>Document Details:</h6>
                  <p><strong>Application ID:</strong> ${app.appID || 'N/A'}</p>
                  <p><strong>Applicant:</strong> ${app.applicantName || 'N/A'}</p>
                  <p><strong>Status:</strong> ${app.status || 'N/A'}</p>
                  ${app.status === 'Awarded' && app.awardDetails ? `
                    <p><strong>Amount Awarded:</strong> Ksh ${(app.awardDetails.committee_amount_kes || app.awardDetails.amount || 0).toLocaleString()}</p>
                    <p><strong>Serial Number:</strong> ${app.awardDetails.serialNumber || 'N/A'}</p>
                  ` : app.status === 'Rejected' ? `
                    <p><strong>Rejection Reason:</strong> ${app.rejectionReason || 'N/A'}</p>
                  ` : ''}
                </div>
              </div>
              <div class="alert alert-info mt-3">
                <small><i class="bi bi-info-circle me-1"></i>Check your downloads folder for the PDF document. An email notification has also been sent to fundadmin@garissa.go.ke</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="downloadApplicationLetter('${appID}')">
                <i class="bi bi-download me-1"></i>Download Again
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        if (bsModal && bsModal.hide) {
          bsModal.hide();
        }
      }, 3000);
      
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error viewing document: ' + error.message);
    }
  };

  // Generate comprehensive summary report - ENHANCED: Uses UNIFIED DATABASE
  window.generateSummaryReport = function() {
    // Use UNIFIED DATABASE (SAME as all components)
    const apps = typeof getApplications !== 'undefined' ? getApplications() : loadApplications();
    console.log('📊 Summary Report: Using', apps.length, 'applications from UNIFIED DATABASE');
    const budget = getBudgetBalance();
    
    // Calculate statistics
    const totalApps = apps.length;
    const pendingApps = apps.filter(a => a.status?.includes('Pending') || a.status === 'Pending Submission').length;
    const awardedApps = apps.filter(a => a.status === 'Awarded').length;
    const rejectedApps = apps.filter(a => a.status === 'Rejected').length;
    
    const awarded = apps.filter(a => a.status === 'Awarded' && a.awardDetails);
    const totalAwarded = awarded.reduce((sum, app) => {
      return sum + (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
    }, 0);
    
    const avgAward = awarded.length > 0 ? totalAwarded / awarded.length : 0;
    const maxAward = Math.max(...awarded.map(a => a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), 0);
    const minAward = Math.min(...awarded.map(a => a.awardDetails?.committee_amount_kes || a.awardDetails?.amount || 0), totalAwarded);
    
    // Sub-county breakdown
    const subCountyBreakdown = {};
    awarded.forEach(app => {
      const sc = app.personalDetails?.subCounty || app.subCounty || 'N/A';
      if (!subCountyBreakdown[sc]) {
        subCountyBreakdown[sc] = { count: 0, total: 0 };
      }
      subCountyBreakdown[sc].count++;
      subCountyBreakdown[sc].total += (app.awardDetails?.committee_amount_kes || app.awardDetails?.amount || 0);
    });
    
    // Gender breakdown
    const genderBreakdown = { Male: 0, Female: 0, 'N/A': 0 };
    awarded.forEach(app => {
      const gender = app.personalDetails?.gender || 'N/A';
      genderBreakdown[gender] = (genderBreakdown[gender] || 0) + 1;
    });
    
    // Display summary cards
    const summaryCards = document.getElementById('summaryCards');
    if (summaryCards) {
      summaryCards.innerHTML = `
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Total Applications</h6>
              <h2 class="fw-bold">${totalApps}</h2>
              <small>Pending: ${pendingApps} | Awarded: ${awardedApps} | Rejected: ${rejectedApps}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Total Awarded</h6>
              <h2 class="fw-bold">Ksh ${totalAwarded.toLocaleString()}</h2>
              <small>Avg: Ksh ${Math.round(avgAward).toLocaleString()} | Range: ${minAward.toLocaleString()} - ${maxAward.toLocaleString()}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Budget Utilization</h6>
              <h2 class="fw-bold">${budget.total > 0 ? ((budget.allocated / budget.total) * 100).toFixed(1) : '0.0'}%</h2>
              <small>Remaining: Ksh ${(budget.total - budget.allocated).toLocaleString()}</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white;">
            <div class="card-body text-center">
              <h6 class="mb-2">Awarded Beneficiaries</h6>
              <h2 class="fw-bold">${awardedApps}</h2>
              <small>Male: ${genderBreakdown.Male} | Female: ${genderBreakdown.Female}</small>
            </div>
          </div>
        </div>
        <div class="col-12 mt-3">
          <div class="card shadow-sm">
            <div class="card-header bg-primary-700 text-white">
              <h6 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Sub-County Allocation Breakdown</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Sub-County</th>
                      <th class="text-end">Beneficiaries</th>
                      <th class="text-end">Total Amount</th>
                      <th class="text-end">Average Award</th>
                      <th class="text-end">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(subCountyBreakdown).map(([sc, data]) => `
                      <tr>
                        <td><strong>${sc}</strong></td>
                        <td class="text-end">${data.count}</td>
                        <td class="text-end">Ksh ${data.total.toLocaleString()}</td>
                        <td class="text-end">Ksh ${Math.round(data.total / data.count).toLocaleString()}</td>
                        <td class="text-end">${((data.total / totalAwarded) * 100).toFixed(1)}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Scroll to reports section
    setTimeout(() => {
      const reportsSection = document.getElementById('reports');
      if (reportsSection) {
        reportsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Export to Excel/CSV with error handling - DISABLED (handled by button-fix-complete.js)
  // The button-fix-complete.js file handles this more reliably
  try {
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
      // Remove old listener if exists
      const newBtn = downloadReportBtn.cloneNode(true);
      downloadReportBtn.parentNode.replaceChild(newBtn, downloadReportBtn);
      
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        try {
          const reportType = document.getElementById('reportType')?.value || 'beneficiary';
          const reportStatus = document.getElementById('reportStatus')?.value || 'all';
          // Get applications from UNIFIED DATABASE
          const apps = typeof getApplications !== 'undefined' ? getApplications() : loadApplications();
          console.log('📊 Report: Using', apps.length, 'applications from UNIFIED DATABASE');
          
          let filtered = apps;
          if (reportStatus === 'Awarded') {
            filtered = apps.filter(a => a.status === 'Awarded');
          } else if (reportStatus === 'Pending') {
            filtered = apps.filter(a => a.status?.includes('Pending') || a.status === 'Pending Submission');
          } else if (reportStatus === 'Rejected') {
            filtered = apps.filter(a => a.status === 'Rejected');
          }

          let rows = [];
          let filename = '';
          
          if (reportType === 'beneficiaries') {
            rows = [['Serial No', 'App ID', 'Applicant Name', 'Sub-County', 'Ward', 'Institution', 'Status', 'Amount Requested', 'Awarded Amount', 'Date Submitted', 'Date Awarded']];
          // Include ALL applications based on status filter
          const allAppsForExport = reportStatus === 'All' ? apps : filtered;
          console.log('📊 Exporting', allAppsForExport.length, 'applications');
          allAppsForExport.forEach(app => {
            rows.push([
                app.awardDetails?.serialNumber || 'N/A',
              app.appID || 'N/A',
              app.applicantName || 'N/A',
              app.personalDetails?.subCounty || app.subCounty || 'N/A',
              app.personalDetails?.ward || app.ward || 'N/A',
              app.personalDetails?.institution || app.institution || 'N/A',
              app.status || 'N/A',
              (app.financialDetails?.amountRequested || 0).toString(),
              (app.awardDetails?.committee_amount_kes || 0).toString(),
                new Date(app.dateSubmitted).toLocaleDateString(),
                app.awardDetails?.date_awarded ? new Date(app.awardDetails.date_awarded).toLocaleDateString() : 'N/A'
            ]);
          });
            filename = `garissa_bursary_beneficiaries_${new Date().toISOString().split('T')[0]}.csv`;
            console.log(`✅ CSV Export: ${allAppsForExport.length} applications exported`);
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
            const budget = getBudgetBalance();
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

          if (typeof downloadCSV === 'function') {
            downloadCSV(filename, rows);
            
            // Notify admin via email
            if (typeof notifyAdminReportGenerated !== 'undefined') {
              const reportSummary = {
                type: reportType,
                status: reportStatus,
                recordCount: filtered.length,
                generatedDate: new Date().toLocaleString()
              };
              notifyAdminReportGenerated(reportType, reportSummary);
            }
            
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
            alert('CSV download function not available. Please refresh the page.');
          }
        } catch (error) {
          console.error('Report download error:', error);
          alert('Error generating report. Please try again.');
        }
      });
    }
  } catch (error) {
    console.error('Report button setup error:', error);
  }

  // Change admin password
  window.changeAdminPassword = function() {
    const currentPassword = prompt('Enter current password:');
    if (!currentPassword) return;

    // Verify current password
    if (currentPassword !== '@Omar.123!') {
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminUser = users.find(u => u.email === 'fundadmin@garissa.go.ke' && u.role === 'admin');
      if (!adminUser || adminUser.password !== currentPassword) {
        alert('❌ Current password is incorrect.');
        return;
      }
    }

    const newPassword = prompt('Enter new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('❌ Password must be at least 8 characters long.');
      return;
    }

    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match.');
      return;
    }

    // Update password
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminUser = users.find(u => u.email === 'fundadmin@garissa.go.ke' && u.role === 'admin');
    if (adminUser) {
      adminUser.password = newPassword;
      localStorage.setItem('mbms_users', JSON.stringify(users));
      alert('✅ Password changed successfully! Please login again with your new password.');
      sessionStorage.clear();
      window.location.href = 'index.html';
    } else {
      // Create admin user if doesn't exist
      users.push({
        email: 'fundadmin@garissa.go.ke',
        password: newPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('mbms_users', JSON.stringify(users));
      alert('✅ Password set successfully! Please login again.');
      sessionStorage.clear();
      window.location.href = 'index.html';
    }
  };

  // Refresh applications display (force reload from Firebase or localStorage)
  window.refreshApplications = async function() {
    try {
      console.log('Refreshing applications...');
      
      // Force reload from unified database
      let apps;
      if (typeof window.getApplications !== 'undefined') {
        try {
          apps = await window.getApplications();
          console.log('✅ Refreshed from Firebase:', apps.length, 'applications');
        } catch (error) {
          console.warn('Firebase refresh error, using localStorage:', error);
          apps = loadApplications();
        }
      } else {
        apps = loadApplications();
      }
      console.log('Loaded applications:', apps.length);
      
      if (apps.length > 0) {
        console.log('Sample application:', apps[0]);
        console.log('All applications:', apps);
      } else {
        console.log('No applications found in localStorage');
        // Check if data exists in localStorage
        const rawData = localStorage.getItem('mbms_applications');
        console.log('Raw localStorage data:', rawData ? 'exists' : 'missing');
        if (rawData) {
          try {
            const parsed = JSON.parse(rawData);
            console.log('Parsed data:', parsed.length, 'items');
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }
      
      // Sync budget
      if (typeof syncBudgetWithAwards !== 'undefined') {
        try {
          syncBudgetWithAwards();
        } catch (e) {
          console.error('Budget sync error:', e);
        }
      }
      
      // Update everything with error handling
      try {
        updateMetrics();
        console.log('Metrics updated');
      } catch (e) {
        console.error('Metrics update error:', e);
      }
      
      try {
        updateBudgetDisplay();
        console.log('Budget display updated');
      } catch (e) {
        console.error('Budget display update error:', e);
      }
      
      try {
        renderTable(apps); // Show all applications by default
        console.log('Table rendered with', apps.length, 'applications');
      } catch (e) {
        console.error('Table render error:', e);
      }
      
      // Apply filters to show all
      try {
        applyFilters();
      } catch (e) {
        console.error('Filter apply error:', e);
      }
      
      // Show refresh confirmation
      const refreshBtn = document.getElementById('refreshBtn');
      if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Refreshed!';
        refreshBtn.classList.add('btn-success');
        refreshBtn.classList.remove('btn-outline-primary');
        setTimeout(() => {
          if (refreshBtn) {
            refreshBtn.innerHTML = originalText;
            refreshBtn.classList.remove('btn-success');
            refreshBtn.classList.add('btn-outline-primary');
          }
        }, 2000);
      }
      
      return apps;
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Error refreshing applications. Please try again.\n\nError: ' + error.message);
      return [];
    }
  };

  // DISABLED: Auto-refresh to prevent page freezing
  // Manual refresh available via Refresh button
  // Auto-refresh can be re-enabled if needed, but currently disabled for stability

  // Initialize budget
  if (typeof initializeBudget !== 'undefined') {
    initializeBudget();
  }
  
    // Initialize filters
  populateFilters();
  
  // Setup filter event listeners after a short delay to ensure DOM is ready
  // Note: setupFilterEventListeners is defined later in the file, so we call it via setTimeout
  setTimeout(() => {
    if (typeof window.setupFilterEventListeners === 'function') {
      window.setupFilterEventListeners();
    } else if (typeof setupFilterEventListeners === 'function') {
      setupFilterEventListeners();
    } else {
      console.warn('setupFilterEventListeners not yet available, will be called later');
    }
  }, 800);
  
  // SYSTEM PREPARATION: Filter out test data and show blank list if no real applications
  console.log('🔄 PREPARING SYSTEM FOR PRODUCTION...');
  
  // CRITICAL: Auto-clear all test/dummy data first
  try {
    const allAppsRaw = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
    const realAppsFiltered = allAppsRaw.filter(app => {
      if (!app || !app.applicantEmail) return false;
      
      // Comprehensive test data detection
      const isTest = 
        app.applicantEmail.includes('example.com') ||
        app.applicantEmail.includes('TEST_') ||
        app.applicantEmail.includes('test@') ||
        app.appID && (
          app.appID.includes('TEST_') || 
          app.appID.includes('Firebase Test') ||
          app.appID.includes('DUMMY')
        ) ||
        app.applicantName && (
          app.applicantName.includes('DUMMY') ||
          app.applicantName.includes('Test User')
        ) ||
        app.status === 'Deleted' ||
        app.status === 'Test';
      
      return !isTest;
    });
    
    // Auto-save cleaned data
    if (realAppsFiltered.length !== allAppsRaw.length) {
      console.log('🧹 Auto-clearing', allAppsRaw.length - realAppsFiltered.length, 'test/dummy records');
      localStorage.setItem('mbms_applications', JSON.stringify(realAppsFiltered));
      
      // Also clear from Firebase if available
      if (typeof firebase !== 'undefined' && typeof firebase.firestore !== 'undefined') {
        try {
          const db = firebase.firestore();
          allAppsRaw.forEach(async (app) => {
            const isTest = 
              app.applicantEmail && (
                app.applicantEmail.includes('example.com') ||
                app.applicantEmail.includes('TEST_') ||
                app.applicantEmail.includes('test@')
              ) ||
              app.appID && (
                app.appID.includes('TEST_') || 
                app.appID.includes('DUMMY') ||
                app.appID.includes('Firebase Test')
              ) ||
              app.applicantName && (
                app.applicantName.includes('DUMMY') ||
                app.applicantName.includes('Test')
              ) ||
              app.status === 'Deleted' ||
              app.status === 'Test';
            
            if (isTest && app.id) {
              try {
                await db.collection('applicants').doc(app.id).delete();
              } catch (e) {
                // Ignore Firebase errors
              }
            }
          });
        } catch (e) {
          console.warn('Firebase auto-clear error:', e);
        }
      }
    }
  } catch (e) {
    console.warn('Auto-clear error:', e);
  }
  
  // CRITICAL: Clear ALL application records on load (including Abdi Ali and all dummy data)
  console.log('🧹 Clearing ALL application records from database...');
  
  // Clear applications
  localStorage.setItem('mbms_applications', JSON.stringify([]));
  
  // Clear all draft applications
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('mbms_application_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Reset all counters
  localStorage.setItem('mbms_application_counter', '0');
  localStorage.setItem('mbms_last_serial', '0');
  localStorage.setItem('mbms_budget_allocated', '0');
  
  // Clear Firebase if configured
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    try {
      const db = firebase.firestore();
      db.collection('applicants').get().then(snapshot => {
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        if (snapshot.size > 0) {
          batch.commit().then(() => {
            console.log('✅ Cleared', snapshot.size, 'records from Firebase');
          });
        }
      });
    } catch (e) {
      console.warn('Firebase clear error:', e);
    }
  }
  
  console.log('✅ Database completely emptied - ready for first application');
  
  // Load existing applications (should be empty now)
  let allApps = loadApplications();
  const realApps = allApps; // loadApplications already filters
  
  console.log('📊 Applications loaded:', realApps.length, 'Real applications');
  
  // Show completely empty table - only column headers, no data rows
  console.log('📋 Showing empty table with column headers only');
  
  // Update metrics to show 0
  updateMetrics();
  updateBudgetDisplay();
  
  // Show empty table with only column headers
  const tbody = document.getElementById('applicationsTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <i class="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
          <h5 class="text-muted mb-2">No Applications Found</h5>
          <p class="text-muted mb-0">The system is ready for the first application submission.</p>
          <p class="text-muted small mt-2">All previous records have been cleared.</p>
        </td>
      </tr>
    `;
  }
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '500px';
    notification.innerHTML = `
      <strong>📋 System Ready!</strong><br>
      <div class="mt-2">
        The system is ready for the first application submission.<br>
        <small class="text-muted">Blank list view displayed with placeholder rows. Once an applicant submits, their application will appear automatically.</small>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
    
    console.log('✅ Blank list displayed - ready for first applicant');
    sessionStorage.setItem('mbms_last_app_count', '0');
    return; // Exit early - don't load dummy data
  }
  
  // If real applications exist, show them
  console.log('✅ Real applications found:', realApps.length);
  updateMetrics();
  updateBudgetDisplay();
  renderTable(realApps);
  applyFilters();
  sessionStorage.setItem('mbms_last_app_count', realApps.length.toString());
  
  // OLD CODE REMOVED - No more dummy data auto-loading
  // The system now shows blank list if no real applications
  // Dummy data loading is completely disabled
    
    // Periodic refresh to catch new applications
    setTimeout(() => {
      const verifyApps = loadApplications();
      const realVerifyApps = verifyApps.filter(app => {
        if (!app.applicantEmail) return false;
        return !(
          app.applicantEmail.includes('example.com') ||
          app.applicantEmail.includes('TEST_') ||
          app.appID && (app.appID.includes('TEST_') || app.appID.includes('Firebase Test'))
        );
      });
      
      if (realVerifyApps.length > 0) {
        updateMetrics();
        updateBudgetDisplay();
        renderTable(realVerifyApps);
        applyFilters();
        console.log('✅ Refresh completed - Showing', realVerifyApps.length, 'real applications');
      } else {
        // Show blank list
        const tbody = document.getElementById('applicationsTableBody');
        if (tbody) {
          tbody.innerHTML = '';
          for (let i = 1; i <= 10; i++) {
            const tr = document.createElement('tr');
            tr.className = 'table-row-placeholder';
            tr.style.opacity = '0.4';
            tr.innerHTML = `
              <td><strong class="text-muted">${i}</strong></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="text-muted">Waiting for first applicant...</span></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="badge bg-secondary">-</span></td>
              <td><span class="text-muted">-</span></td>
              <td><span class="text-muted">-</span></td>
            `;
            tbody.appendChild(tr);
          }
        }
        console.log('✅ Blank list displayed - ready for first applicant');
      }
    }, 500);
    
    // Listen for new application submissions AND user registrations
    window.addEventListener('mbms-data-updated', function(e) {
      const detail = e.detail || {};
      const key = detail.key;
      
      if (key === 'mbms_applications') {
        console.log('📬 New application submitted! Refreshing dashboard...', detail);
        setTimeout(() => {
          const newApps = loadApplications();
          updateMetrics();
          updateBudgetDisplay();
          renderTable(newApps);
          applyFilters();
          
          // CRITICAL: Refresh visualizations immediately when first submission is received
          if (typeof refreshVisualizations === 'function') {
            refreshVisualizations();
            console.log('✅ Visualizations refreshed with new application data');
          }
          
          console.log('✅ Dashboard refreshed with', newApps.length, 'applications');
        }, 500);
      } else if (key === 'mbms_users') {
        console.log('📬 New user registered! Refreshing metrics...', detail);
        setTimeout(() => {
          updateMetrics();
          console.log('✅ Metrics refreshed with new user registration');
        }, 500);
      }
    });
    
    // Listen for storage changes (cross-tab sync) - DEBOUNCED to prevent flickering
    let storageUpdateDebounce = null;
    window.addEventListener('storage', function(e) {
      if (e.key === 'mbms_applications') {
        // Debounce to prevent rapid updates causing flickering
        if (storageUpdateDebounce) clearTimeout(storageUpdateDebounce);
        storageUpdateDebounce = setTimeout(() => {
          console.log('📬 Storage change detected (applications)! Refreshing dashboard...');
          const newApps = loadApplications();
          updateMetrics();
          updateBudgetDisplay();
          renderTable(newApps);
          applyFilters();
          
          // CRITICAL: Refresh visualizations on storage change
          if (typeof refreshVisualizations === 'function') {
            refreshVisualizations();
            console.log('✅ Visualizations refreshed via storage event');
          }
        }, 1000); // 1 second debounce to prevent flickering
      } else if (e.key === 'mbms_users') {
        // Debounce user updates too
        if (storageUpdateDebounce) clearTimeout(storageUpdateDebounce);
        storageUpdateDebounce = setTimeout(() => {
          console.log('📬 Storage change detected (users)! Refreshing metrics...');
          updateMetrics();
          console.log('✅ Metrics refreshed via storage event (user registration)');
        }, 1000);
      }
    });
    
    // DISABLED: setInterval completely removed to prevent flickering
    // Using event-based updates only (mbms-data-updated events)
    // No periodic polling - all updates are event-driven
  } // End of initAdminDashboard function
  
  // Removed: forceReloadDummyData function - system is production-ready
  
  // Expose a global function to manually refresh everything
  window.forceRefreshAll = function() {
    console.log('🔄 Force refreshing all displays...');
    
    // Clear any cached data
    const apps = loadApplications();
    console.log('📊 Loaded', apps.length, 'applications from localStorage');
    
    if (apps.length > 0) {
      console.log('Sample applications:', apps.slice(0, 3).map(a => ({
        id: a.appID,
        name: a.applicantName,
        status: a.status
      })));
    }
    
    // Force update everything
    updateMetrics();
    updateBudgetDisplay();
    renderTable(apps);
    applyFilters();
    
    // Update session storage
    sessionStorage.setItem('mbms_last_app_count', apps.length.toString());
    
    // Generate summary report
    if (typeof generateSummaryReport === 'function') {
      setTimeout(() => generateSummaryReport(), 500);
    }
    
    // Force another refresh after short delay
    setTimeout(() => {
      const verifyApps = loadApplications();
      updateMetrics();
      updateBudgetDisplay();
      renderTable(verifyApps);
      console.log('✅ Force refresh completed with', verifyApps.length, 'applications');
    }, 500);
    
    alert(`✅ Display Force Refreshed!\n\n📊 Found ${apps.length} applications in the system.\n\nAll data updated and displayed.`);
  };
  
  // Real-time budget updates - listen for storage changes (debounced to prevent flickering)
  let storageUpdateTimeout = null;
  window.addEventListener('storage', function(e) {
    if (e.key === 'mbms_applications' || e.key === 'mbms_budget') {
      // Debounce to prevent rapid updates causing flickering
      if (storageUpdateTimeout) clearTimeout(storageUpdateTimeout);
      storageUpdateTimeout = setTimeout(() => {
        console.log('Storage changed, updating budget...');
        updateMetrics();
        updateBudgetDisplay();
        refreshApplications();
      }, 500); // 500ms debounce
    }
  });
  
  // Listen for custom data update events (including new submissions) - debounced to prevent flickering
  let dataUpdateTimeout = null;
  window.addEventListener('mbms-data-updated', function(e) {
    // Debounce to prevent rapid updates causing flickering
    if (dataUpdateTimeout) clearTimeout(dataUpdateTimeout);
    dataUpdateTimeout = setTimeout(() => {
      console.log('Data updated event:', e.detail);
      updateMetrics();
      updateBudgetDisplay();
      if (e.detail && (e.detail.action === 'awarded' || e.detail.action === 'rejected' || e.detail.action === 'submitted')) {
        refreshApplications();
      }
    }, 300); // 300ms debounce
  });
  
  // DISABLED: Real-time update interval - causes flickering
  // Using event-based updates instead (mbms-data-updated events)
  // Periodic refresh moved to 10-second interval in real-time-dashboard-sync.js
  
  // Check budget status on load
  if (typeof getBudgetStatus !== 'undefined') {
    const status = getBudgetStatus();
    if (status.isExhausted) {
      setTimeout(() => {
        alert('⚠️ BUDGET EXHAUSTED!\n\nNo more budget available. Please contact finance department.');
      }, 1000);
    } else if (status.isLow) {
      setTimeout(() => {
        alert('⚠️ LOW BUDGET WARNING!\n\nOnly ' + status.percentage.toFixed(1) + '% budget remaining.\nRemaining: Ksh ' + status.balance.toLocaleString());
      }, 1000);
    }
  }
  
  // Add visibility to window for debugging
  window.debugAdmin = function() {
    const apps = loadApplications();
    const budget = getBudgetBalance();
    console.log('=== ADMIN DEBUG ===');
    console.log('Applications:', apps.length, apps);
    console.log('Budget:', budget);
    console.log('localStorage keys:', Object.keys(localStorage).filter(k => k.startsWith('mbms')));
    alert(`Applications: ${apps.length}\nBudget Allocated: Ksh ${budget.allocated.toLocaleString()}\nBudget Balance: Ksh ${budget.balance.toLocaleString()}\n\nCheck console (F12) for details.`);
  };

  // Smooth scroll function for sidebar navigation - SIMPLIFIED
  window.scrollToSection = function(sectionId) {
    try {
      // Prevent default behavior
      event?.preventDefault();
      
      // Find the section
      const section = document.getElementById(sectionId);
      if (!section) {
        console.warn('Section not found:', sectionId);
        return false;
      }
      
      // Simple scroll - no animation to prevent blocking
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      // Update active nav link
      setTimeout(() => {
        try {
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        } catch (e) {
          // Ignore nav update errors
        }
      }, 100);
      
      return false;
    } catch (error) {
      console.error('Scroll error:', error);
      return false;
    }
  };

  // Sidebar navigation - SIMPLE AND RELIABLE (works immediately)
  // Expose loadApplications globally for visualizations
  window.loadApplications = loadApplications; // Synchronous version for backward compatibility
  window.loadApplicationsSync = loadApplicationsSync; // Async version for Firebase
  
  function setupSidebarNavigation() {
    try {
      // Sidebar links - use event delegation for reliability
      const sidebarNav = document.getElementById('sidebarNav');
      if (sidebarNav) {
        sidebarNav.addEventListener('click', function(e) {
          const link = e.target.closest('.sidebar-link');
          if (link) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = link.getAttribute('data-section');
            if (sectionId) {
              const section = document.getElementById(sectionId);
              if (section) {
                // Simple scroll - no animation to prevent blocking
                section.scrollIntoView({ behavior: 'auto', block: 'start' });
                
                // Update active state
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Special handling for visualizations section
                if (sectionId === 'visualizations') {
                  setTimeout(() => {
                    if (typeof refreshVisualizations === 'function') {
                      refreshVisualizations();
                    }
                  }, 300);
                }
              }
            }
          }
        });
      }
      
      // Change Password link
      const changePasswordLink = document.getElementById('changePasswordLink');
      if (changePasswordLink) {
        changePasswordLink.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof changeAdminPassword === 'function') {
            changeAdminPassword();
          }
        });
      }
      
      // Sign Out link
      const signOutLink = document.getElementById('signOutLink');
      if (signOutLink) {
        signOutLink.addEventListener('click', function(e) {
          sessionStorage.clear();
          // Let the link navigate naturally
        });
      }
    } catch (error) {
      console.error('Sidebar navigation setup error:', error);
    }
  }
  
  // Debounce refresh to prevent flickering
  let refreshDebounceTimeout;
  let isRefreshing = false;
  
  // Listen for new application submissions - auto-refresh when new applicants join
  window.addEventListener('mbms-data-updated', function(event) {
    console.log('📢 Data update event received:', event.detail);
    if (event.detail && event.detail.key === 'mbms_applications') {
      // Clear any pending refresh
      if (refreshDebounceTimeout) {
        clearTimeout(refreshDebounceTimeout);
      }
      
      // Prevent multiple simultaneous refreshes
      if (isRefreshing) {
        console.log('⏸️ Refresh already in progress, skipping...');
        return;
      }
      
      // Debounce: wait 1 second before refreshing
      refreshDebounceTimeout = setTimeout(() => {
        isRefreshing = true;
        console.log('🔄 New application detected - refreshing dashboard...');
        
        // Single refresh (no double refresh)
        refreshApplications().finally(() => {
          updateMetrics();
          updateBudgetDisplay();
          applyFilters();
          
          // Refresh visualizations
          if (typeof refreshVisualizations === 'function') {
            refreshVisualizations();
            console.log('✅ Visualizations refreshed with new data');
          }
          
          isRefreshing = false;
          console.log('✅ Dashboard refreshed with new application');
          
          // Show notification
          const notification = document.createElement('div');
          notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
          notification.style.zIndex = '9999';
          notification.style.minWidth = '400px';
          notification.innerHTML = `
            <strong>🆕 New Application Received!</strong><br>
            <div class="mt-2">
              A new application has been submitted and is now in the "Pending Ward Review" list.<br>
              <small class="text-muted">Application ID: ${event.detail.appID || 'N/A'}</small>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 5000);
        });
      }, 1000);
    }
  });
  
  // Also listen for storage events (cross-tab sync) - with debouncing
  window.addEventListener('storage', function(event) {
    if (event.key === 'mbms_applications') {
      // Clear any pending refresh
      if (refreshDebounceTimeout) {
        clearTimeout(refreshDebounceTimeout);
      }
      
      // Prevent multiple simultaneous refreshes
      if (isRefreshing) {
        console.log('⏸️ Refresh already in progress, skipping storage event...');
        return;
      }
      
      // Debounce: wait 1 second before refreshing
      refreshDebounceTimeout = setTimeout(() => {
        isRefreshing = true;
        console.log('📢 Storage event detected - new application added');
        refreshApplications().finally(() => {
          updateMetrics();
          updateBudgetDisplay();
          applyFilters();
          if (typeof refreshVisualizations === 'function') {
            refreshVisualizations();
          }
          isRefreshing = false;
        });
      }, 1000);
    }
  });
  
  // DISABLED: Periodic check - causes flickering
  // Using event-based updates instead (mbms-data-updated events)
  // Real-time sync handled by real-time-dashboard-sync.js with 10-second interval
  
  // Setup immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupSidebarNavigation();
      // Delay initAdminDashboard slightly to ensure all scripts are loaded
      setTimeout(() => {
        initAdminDashboard();
        // Initialize visualizations after dashboard is ready
        setTimeout(() => {
          if (typeof initializeVisualizations === 'function') {
            initializeVisualizations();
            console.log('✅ Visualizations initialized');
          }
        }, 2000);
      }, 100);
    });
  } else {
    setupSidebarNavigation();
    // Delay initAdminDashboard slightly to ensure all scripts are loaded
    setTimeout(() => {
      initAdminDashboard();
      // Initialize visualizations after dashboard is ready
      setTimeout(() => {
        if (typeof initializeVisualizations === 'function') {
          initializeVisualizations();
          console.log('✅ Visualizations initialized');
        }
      }, 2000);
    }, 100);
  }

  // ENHANCED: Filter event listeners with proper initialization and auto-apply
  window.setupFilterEventListeners = function() {
    console.log('🔧 Setting up filter event listeners...');
    
    // Apply Filters Button - Use event delegation for reliability
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
      // Remove any existing listeners
      const newBtn = applyFiltersBtn.cloneNode(true);
      applyFiltersBtn.parentNode.replaceChild(newBtn, applyFiltersBtn);
      
      // Attach fresh listener
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔍 Apply Filters button clicked');
        try {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          } else if (typeof applyFilters === 'function') {
            applyFilters();
          } else {
            console.error('applyFilters function not found');
            alert('Filter function not available. Please refresh the page.');
          }
        } catch (error) {
          console.error('Filter error:', error);
          alert('Error applying filters. Please try again.\n\nError: ' + error.message);
        }
      });
      console.log('✅ Apply Filters button listener attached');
    } else {
      console.error('❌ Apply Filters button not found');
    }
    
    // Sub-County Filter - Auto-populate wards and auto-apply
    const filterSubCounty = document.getElementById('filterSubCounty');
    if (filterSubCounty) {
      // Remove any existing listeners
      const newSubCounty = filterSubCounty.cloneNode(true);
      filterSubCounty.parentNode.replaceChild(newSubCounty, filterSubCounty);
      
      newSubCounty.addEventListener('change', function() {
        console.log('📍 Sub-county changed to:', this.value);
        try {
          // Populate wards for selected sub-county
          const wardSel = document.getElementById('filterWard');
          if (wardSel) {
            wardSel.innerHTML = '<option value="">All Wards</option>';
            
            if (this.value && this.value !== 'Other' && typeof GARISSA_WARDS !== 'undefined' && GARISSA_WARDS[this.value]) {
              const wards = [...GARISSA_WARDS[this.value]].sort();
              wards.forEach(w => {
                const option = document.createElement('option');
                option.value = w;
                option.textContent = w;
                wardSel.appendChild(option);
              });
              console.log('✅ Populated', wards.length, 'wards for', this.value);
            } else if (this.value === '') {
              // Show all wards from all sub-counties
              if (typeof GARISSA_WARDS !== 'undefined') {
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
                console.log('✅ Populated ALL', allWards.length, 'wards');
              }
            }
            
            // Always add "Other" option
            const otherOption = document.createElement('option');
            otherOption.value = 'Other';
            otherOption.textContent = 'Other (Specify)';
            wardSel.appendChild(otherOption);
            
            wardSel.disabled = false;
          }
          
          // Auto-apply filters after a short delay
          setTimeout(() => {
            if (typeof window.applyFilters === 'function') {
              window.applyFilters();
            } else if (typeof applyFilters === 'function') {
              applyFilters();
            }
          }, 100);
        } catch (error) {
          console.error('Filter ward update error:', error);
        }
      });
      console.log('✅ Sub-county filter listener attached');
    } else {
      console.error('❌ Sub-county filter not found');
    }
    
    // Ward Filter - Auto-apply on change
    const filterWard = document.getElementById('filterWard');
    if (filterWard) {
      // Remove any existing listeners
      const newWard = filterWard.cloneNode(true);
      filterWard.parentNode.replaceChild(newWard, filterWard);
      
      newWard.addEventListener('change', function() {
        console.log('📍 Ward changed to:', this.value);
        // Auto-apply filters after a short delay
        setTimeout(() => {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          } else if (typeof applyFilters === 'function') {
            applyFilters();
          }
        }, 100);
      });
      console.log('✅ Ward filter listener attached');
    } else {
      console.error('❌ Ward filter not found');
    }
    
    // Status Filter - Auto-apply on change
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      // Remove any existing listeners
      const newStatus = filterStatus.cloneNode(true);
      filterStatus.parentNode.replaceChild(newStatus, filterStatus);
      
      newStatus.addEventListener('change', function() {
        console.log('📍 Status changed to:', this.value);
        // Auto-apply filters after a short delay
        setTimeout(() => {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters();
          } else if (typeof applyFilters === 'function') {
            applyFilters();
          }
         }, 100);
      });
      console.log('✅ Status filter listener attached');
    } else {
      console.error('❌ Status filter not found');
    }
    
    console.log('✅ All filter event listeners set up successfully');
  };
  
  // Call setupFilterEventListeners after populateFilters (backup call)
  setTimeout(() => {
    if (typeof window.setupFilterEventListeners === 'function') {
      window.setupFilterEventListeners();
    }
  }, 1000);
})();
