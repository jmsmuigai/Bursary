// Enhanced Authentication with Single Admin Account
(function() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Single Admin Account
  const ADMIN_ACCOUNT = {
    email: 'fundadmin@garissa.go.ke',
    password: '@Omar.123!',
    role: 'admin'
  };

  // Initialize admin account in localStorage if not exists
  function initializeAdmin() {
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminExists = users.some(u => u.email === ADMIN_ACCOUNT.email && u.role === 'admin');
    
    if (!adminExists) {
      users.push({
        ...ADMIN_ACCOUNT,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('mbms_users', JSON.stringify(users));
    }
  }

  initializeAdmin();

  // Password reset functionality
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

    // Check admin account (check both default and stored password)
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminUser = users.find(u => u.email === 'fundadmin@garissa.go.ke' && u.role === 'admin');
    const adminPassword = adminUser?.password || ADMIN_ACCOUNT.password;

    if (ADMIN_ACCOUNT.email.toLowerCase() === username.toLowerCase() && 
        (password === ADMIN_ACCOUNT.password || password === adminPassword)) {
      const adminData = {
        email: ADMIN_ACCOUNT.email,
        role: ADMIN_ACCOUNT.role
      };
      sessionStorage.setItem('mbms_admin', JSON.stringify(adminData));
      sessionStorage.setItem('mbms_current_user', JSON.stringify(adminData));
      window.location.href = 'admin_dashboard.html';
      return;
    }

    // Check for regular applicant
    const allUsers = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const user = allUsers.find(u => 
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

    alert('❌ Invalid credentials. Please check your email/ID and password.\n\nIf you forgot your password, you can reset it from the login page.');
  });
})();
