// Enhanced Authentication with Single Admin Account
(function() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Admin account. The admin signs in with Firebase Authentication;
  // no admin password is stored in this code or in the browser.
  const ADMIN_ACCOUNT = {
    email: 'fundadmin@garissa.go.ke',
    role: 'admin'
  };
  const PW = window.MBMS_pw;

  // Remove any legacy admin record that stored a password in this browser.
  (function purgeLegacyAdmin() {
    try {
      const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
      const kept = users.filter(u => u.role !== 'admin');
      if (kept.length !== users.length) localStorage.setItem('mbms_users', JSON.stringify(kept));
    } catch (e) { /* ignore */ }
  })();

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
        user.password = PW.hash(newPassword, user.email || user.idNumber);
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
      if (typeof firebase === 'undefined' || !firebase.auth) {
        alert('Admin sign-in needs Firebase Authentication, which could not load. Check your connection and try again.');
        return;
      }
      firebase.auth().signInWithEmailAndPassword(ADMIN_ACCOUNT.email, password).then(() => {
        const adminData = { email: ADMIN_ACCOUNT.email, role: ADMIN_ACCOUNT.role };
        sessionStorage.setItem('mbms_admin', JSON.stringify(adminData));
        sessionStorage.setItem('mbms_current_user', JSON.stringify(adminData));
        window.location.href = 'admin_dashboard.html';
      }).catch(() => {
        alert('❌ Incorrect admin email or password.\n\nForgotten it? Ask the system administrator to send a reset link from the Firebase console.');
      });
      return;
    }

    // Check for regular applicant (must be registered)
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const user = users.find(u => 
      (u.email?.toLowerCase() === username.toLowerCase() || 
       u.nemisId === username || 
       u.idNumber === username) &&
      u.role === 'applicant' &&
      PW.check(u, password, u.email || u.idNumber)
    );

    if (user) {
      if (String(user.password).indexOf('sha256$') !== 0) {
        user.password = PW.hash(password, user.email || user.idNumber);
        localStorage.setItem('mbms_users', JSON.stringify(users));
      }
      const { password: _omit, ...safeUser } = user;
      sessionStorage.setItem('mbms_current_user', JSON.stringify(safeUser));
      window.location.href = 'applicant_dashboard.html';
      return;
    }

    // No match found
    alert('❌ Invalid credentials. Please check your email/ID and password.\n\n' +
          'Admin: Use fundadmin@garissa.go.ke (contact system administrator for password)\n\n' +
          'Applicants: Use your registered email/ID. If you forgot your password, click "Forgot password?"');
  });
})();
