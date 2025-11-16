// Enhanced Authentication with Two Admin Accounts
(function() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  // Admin accounts
  const ADMIN_ACCOUNTS = [
    {
      email: 'jmsmuigai@gmail.com',
      password: '@12345',
      name: 'James Muigai',
      role: 'admin'
    },
    {
      email: 'osmanmohamud60@gmail.com',
      password: '@12345',
      name: 'Osman Mohamud',
      role: 'admin'
    }
  ];

  // Initialize admin accounts in localStorage if not exists
  function initializeAdmins() {
    const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
    const adminEmails = users.filter(u => u.role === 'admin').map(u => u.email);
    
    ADMIN_ACCOUNTS.forEach(admin => {
      if (!adminEmails.includes(admin.email)) {
        users.push({
          ...admin,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    localStorage.setItem('mbms_users', JSON.stringify(users));
  }

  initializeAdmins();

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Check admin accounts
    const admin = ADMIN_ACCOUNTS.find(a => 
      a.email.toLowerCase() === username.toLowerCase() && 
      a.password === password
    );

    if (admin) {
      sessionStorage.setItem('mbms_admin', JSON.stringify(admin));
      sessionStorage.setItem('mbms_current_user', JSON.stringify(admin));
      window.location.href = 'admin_dashboard.html';
      return;
    }

    // Check for regular applicant
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

    alert('❌ Invalid credentials. Please check your email/ID and password.\n\nFor Admin Access:\n• Email: jmsmuigai@gmail.com or osmanmohamud60@gmail.com\n• Password: @12345\n\nFor Applicants:\n• Use the email/ID you registered with\n• If you haven\'t registered, click "Create an account"');
  });
})();
