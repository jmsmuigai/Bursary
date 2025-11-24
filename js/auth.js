// Enhanced Authentication with Single Admin Account
(function() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Single Admin Account - Hardcoded (no registration needed)
  const ADMIN_ACCOUNT = {
    email: 'fundadmin@garissa.go.ke',
    password: '@Omar.123!',
    role: 'admin'
  };

  // Initialize admin account in localStorage for password changes
  function initializeAdmin() {
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminExists = users.some(u => u.email === ADMIN_ACCOUNT.email && u.role === 'admin');
    
    if (!adminExists) {
      users.push({
        email: ADMIN_ACCOUNT.email,
        password: ADMIN_ACCOUNT.password,
        role: ADMIN_ACCOUNT.role,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('mbms_users', JSON.stringify(users));
    }
  }

  initializeAdmin();

  // Password reset functionality for applicants
  window.resetPassword = function() {
    const email = prompt('Enter your email address:');
    if (!email) return;

    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      if (user.role === 'admin') {
        alert('Admin password reset must be done by system administrator. Please contact: fundadmin@garissa.go.ke');
        return;
      }
      
      const newPassword = prompt('Enter new password (min 8 characters):');
      if (newPassword && newPassword.length >= 8) {
        user.password = newPassword;
        localStorage.setItem('mbms_users', JSON.stringify(users));
        alert('✅ Password reset successful! Please login with your new password.');
      } else {
        alert('❌ Password must be at least 8 characters long.');
      }
    } else {
      alert('❌ Email not found. Please check your email address.');
    }
  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // First, check admin account (hardcoded - no registration needed)
    // Check exact match first, then check if password was changed
    const isAdminEmail = ADMIN_ACCOUNT.email.toLowerCase() === username.toLowerCase();
    
    if (isAdminEmail) {
      // Check default password first
      if (password === ADMIN_ACCOUNT.password) {
        const adminData = {
          email: ADMIN_ACCOUNT.email,
          role: ADMIN_ACCOUNT.role
        };
        sessionStorage.setItem('mbms_admin', JSON.stringify(adminData));
        sessionStorage.setItem('mbms_current_user', JSON.stringify(adminData));
        window.location.href = 'admin_dashboard.html';
        return;
      }
      
      // Check if password was changed (stored in localStorage)
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const adminUser = users.find(u => u.email === ADMIN_ACCOUNT.email && u.role === 'admin');
      
      if (adminUser && adminUser.password === password) {
        const adminData = {
          email: ADMIN_ACCOUNT.email,
          role: ADMIN_ACCOUNT.role
        };
        sessionStorage.setItem('mbms_admin', JSON.stringify(adminData));
        sessionStorage.setItem('mbms_current_user', JSON.stringify(adminData));
        window.location.href = 'admin_dashboard.html';
        return;
      }
      
      // If admin email but wrong password
      alert('❌ Incorrect password for admin account.\n\nIf you have changed your password, please use the new password.\n\nIf you have forgotten your password, please contact the system administrator.');
      return;
    }

    // Check for regular applicant (must be registered)
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const user = users.find(u => 
      (u.email?.toLowerCase() === username.toLowerCase() || 
       u.nemisId === username || 
       u.idNumber === username) &&
      u.password === password &&
      u.role === 'applicant'
    );

    if (user) {
      sessionStorage.setItem('mbms_current_user', JSON.stringify(user));
      window.location.href = 'applicant_dashboard.html';
      return;
    }

    // No match found
    alert('❌ Invalid credentials. Please check your email/ID and password.\n\n' +
          'Admin: Use fundadmin@garissa.go.ke (contact system administrator for password)\n\n' +
          'Applicants: Use your registered email/ID. If you forgot your password, click "Forgot password?"');
  });
})();
