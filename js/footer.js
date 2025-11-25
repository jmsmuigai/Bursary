// Footer Component - Add to all pages
(function() {
  function addFooter() {
    const footer = document.createElement('footer');
    footer.className = 'mt-5 py-4';
    footer.style.cssText = 'background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-600) 100%); color: white;';
    footer.innerHTML = `
      <div class="container">
        <div class="text-center">
          <p class="mb-2" style="font-size: 0.9rem;">
            <span style="color: #FFD700; font-weight: bold;">Garissa County Bursary Management System v3.0</span>
          </p>
          <p class="mb-0" style="font-size: 0.85rem; opacity: 0.9;">
            System developed by <a href="mailto:jmsmuigai@gmail.com" style="color: #FFD700; text-decoration: none; font-weight: bold;">jmsmuigai@gmail.com</a>
          </p>
          <p class="mt-2 mb-0" style="font-size: 0.75rem; opacity: 0.8;">
            © 2025 Garissa County Government. All rights reserved.
          </p>
        </div>
      </div>
    `;
    
    // Insert before closing body tag
    const body = document.body;
    if (body) {
      body.appendChild(footer);
    }
  }
  
  // Add footer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFooter);
  } else {
    addFooter();
  }
})();

