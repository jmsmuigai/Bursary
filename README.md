# Garissa County Modern Bursary Management System (MBMS)

Modern, clean, and practical bursary management portal for Garissa County: public application + internal administration with reports.

## Quick Start (Demo, no backend)
1. Open `index.html` in your browser.
2. Log in with:
   - Username: `Admin`
   - Password: `@12345`
3. Explore the Admin Dashboard, filters, and download a sample CSV in Reports.
4. To test registration, open `register.html`, submit the form, then return to login.

Place the county logo at `assets/garissa-logo.png` (PNG recommended). The UI works even if the image is missing.

## Project Structure
```
Bursary/
  index.html              # Login
  register.html           # Applicant registration
  admin_dashboard.html    # Admin portal (applications + reports)
  styles.css              # Shared theme
  js/
    data.js               # Garissa subcounty/ward data + demo applications
    auth.js               # Demo auth (Admin/@12345); replace with Firebase
    admin.js              # Dashboard logic + export CSV
    utils.js              # Helpers (KES currency, CSV export)
  assets/
    garissa-logo.png      # (Add your logo file here)
```

## Roadmap to Full Stack (Firebase)
- Auth: Email/password sign-in for applicants and admins (RBAC via custom claims).
- Database: Firestore collections `users`, `applications`, `awards`.
- Storage: Required documents (fee structure, IDs).
- Cloud Functions:
  - Generate branded PDF award letters (ReportLab via Cloud Run if using Python).
  - Export Excel/CSV from filtered queries.
  - Optional QR verification link per application ID.

## Docs
See the User Manual inside the repository wiki or adapt from this README. Admin metrics and reports update automatically when hooked to Firestore queries.

## GitHub
Initialize Git and push to `https://github.com/jmsmuigai/Bursary`.
```bash
git init
git add .
git commit -m "feat: initial MBMS demo (frontend, admin, reports, data)"
git branch -M main
git remote add origin https://github.com/jmsmuigai/Bursary.git
git push -u origin main
```


