// Simple demo auth:
// - If username === 'Admin' and password === '@12345' → redirect to admin dashboard
// - Otherwise, just show an alert (replace with Firebase Auth in production)
(function(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    if((u.toLowerCase() === 'admin' || u === 'Admin') && p === '@12345'){
      sessionStorage.setItem('mbms_admin','Admin');
      window.location.href = 'admin_dashboard.html';
      return;
    }
    alert('Invalid credentials (demo). Use Admin / @12345 or integrate Firebase Auth.');
  });
})();

