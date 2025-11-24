# 🌟 Garissa County Modern Bursary Management System (MBMS) v2.2

A comprehensive, modern, and secure bursary management system for Garissa County, Kenya. This system streamlines the entire bursary lifecycle from online application to fund allocation and reporting.

**Version:** 2.2  
**Release Date:** January 2025  
**Status:** ✅ **PRODUCTION READY**  
**Developed by:** jmsmuigai@gmail.com  
**Support Email:** fundadmin@garissa.go.ke

## 🌐 Public Access

**The system is publicly accessible via GitHub Pages:**
👉 **https://jmsmuigai.github.io/Bursary/**

Anyone with this link can:
- ✅ View application instructions
- ✅ Register as an applicant
- ✅ Submit bursary applications
- ✅ Track their application status

## ✨ Features

### Public Portal (Applicants)
- ✅ **Instructions Page** - Clear guidance before registration
- ✅ **Account Registration** - With duplicate detection (email/ID check)
- ✅ **Comprehensive Application Form** - All fields from manual form (Part A, B, C, D)
  - Multi-step form with progress indicator
  - Auto-save functionality (saves every 2 seconds)
  - Manual save button
  - Draft applications tracking
- ✅ **Applicant Dashboard** - View own application status only
  - View awarded amount when application is approved
  - Print Award Letter (PDF preview and print)
  - Download Award Letter PDF
  - View serial number for awarded applications
- ✅ **Privacy** - Applicants cannot see other applicants' information

### Administration Dashboard
- ✅ **Single Admin Account**:
  - `fundadmin@garissa.go.ke`
  - Password can be changed by administrator (see Help Guide for instructions)
  - Contact system administrator for initial access credentials
- ✅ **Budget Management System**:
  - Total Budget: KSH 50,000,000
  - Real-time budget tracking and deduction
  - Colorful budget display card (Total, Allocated, Balance, Utilization %)
  - Budget alerts (Low budget warning at 80%, Exhausted alert at 0%)
  - Prevents awarding when budget is insufficient
  - Auto-syncs with existing awarded applications
- ✅ **Smart Application Counter** - Real-time updates when new applications are submitted
- ✅ **Application Management**:
  - View all applications with smart scrolling
  - Filter by Sub-County, Ward, and Status
  - Review individual applications
  - Approve/Award applications with amount and justification
  - Automatic serial number generation (GRS/Bursary/001, 002, 003...)
  - Reject applications
- ✅ **PDF Document Generation** (Receipt-Style Format):
  - **Award Letters**: Professional receipt-style format with amount in words
  - **Rejection Letters**: Official rejection notices with reasons
  - **Status Letters**: Current status updates for pending applications
  - **Application Summary**: Complete application details PDF
  - **Digital Signatures**: All documents include Fund Administrator signature
  - **Email Notifications**: Automatic email notifications to fundadmin@garissa.go.ke
  - Print to PDF functionality
  - Download documents with all details
  - Professional design with Garissa County branding
- ✅ **Smart Reports & Analytics Dashboard**:
  - **Summary Report** with comprehensive analytics
    - Total applications, awarded count, and budget utilization
    - Sub-county allocation breakdown with percentages
    - Gender distribution statistics
    - Average award amounts and ranges
  - **Filterable Data Export**:
    - Beneficiary List (CSV/Excel with digital signature)
    - Financial Allocation Summary
    - Demographics Report (Sub-County/Gender/Level)
    - Budget Utilization Report
  - **Digital Signatures**: All reports include Fund Administrator digital signature
  - **Email Notifications**: Reports automatically notify fundadmin@garissa.go.ke
  - One-click "Summary Report" button for instant insights
- ✅ **Dashboard Metrics**:
  - Total Applications
  - Pending Review
  - Total Awarded
  - Funds Allocated (YTD)
  - Budget Status (Total, Allocated, Remaining, Utilization %)

### Technical Features
- ✅ **Duplicate Registration Detection** - Prevents multiple registrations with same email/ID
- ✅ **Incomplete Applications** - Track and continue draft applications
- ✅ **Data Validation** - Clean data only saved
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI/UX** - Colorful, professional theme with Garissa County branding
- ✅ **Enhanced Table Scrolling** - Smart scrolling with sticky headers
- ✅ **PDF Generation** - Client-side PDF generation using jsPDF
- ✅ **Serial Number System** - Auto-incrementing serial numbers (GRS/Bursary/001...)
- ✅ **Budget Tracking** - Real-time budget management and alerts
- ✅ **Password Reset** - For applicants (admin password change in dashboard)
- ✅ **Demo Data System** - 10 realistic dummy records with different statuses (load via admin dashboard)
- ✅ **Local Storage** - Demo mode (ready for Firebase integration)
- ✅ **Public Access** - Anyone with GitHub link can access and apply
- ✅ **Responsive Design** - Fully responsive on mobile, tablet, and desktop

## 🚀 Quick Start

### Access the System

**🌐 Live System URL:**  
👉 **https://jmsmuigai.github.io/Bursary/**

1. **Visit**: https://jmsmuigai.github.io/Bursary/
2. **For Applicants**:
   - Click "Read Instructions First"
   - Register a new account
   - Complete the application form
   - View dashboard
   - Print/Download award letter when approved
3. **For Admins**:
   - Email: `fundadmin@garissa.go.ke`
   - Contact system administrator for access credentials
   - Password can be changed after login (see Help Guide)
   - **Load Demo Data**: Click "Load Demo Data" button in Reports section to see 10 sample applications

### Local Testing (Optional)

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. All features work offline (uses localStorage)

## 📁 Project Structure

```
Bursary/
├── index.html                 # Login page (public access)
├── instructions.html          # Application instructions
├── register.html              # Applicant registration
├── application.html           # Comprehensive application form
├── applicant_dashboard.html   # Applicant's personal dashboard
├── admin_dashboard.html       # Admin portal
├── styles.css                 # Modern theme and styling
├── firebase_config.js         # Firebase configuration template
├── .nojekyll                  # GitHub Pages configuration
├── 404.html                   # Error page redirect
├── js/
│   ├── data.js               # Garissa sub-counties/wards data
│   ├── auth.js               # Authentication (2 admins + applicants)
│   ├── admin.js              # Admin dashboard logic
│   ├── application.js        # Application form handler with autosave
│   └── utils.js              # Helper functions (CSV export, currency)
├── assets/
│   └── Garissa Logo.png      # County logo
└── README.md                 # This file
```

## 🗺️ Garissa County Data

The system includes all Garissa County sub-counties and wards:
- **Garissa Township**: Waberi, Galbet, Township, Iftin
- **Lagdera**: Modogashe, Benane, Goreale, Maalimin, Sabena, Baraki
- **Dadaab**: Dertu, Dadaab, Labasigale, Damajale, Liboi, Abakaile
- **Fafi**: Bura, Dekaharia, Jarajila, Fafi, Nanighi
- **Balambala**: Balambala, Danyere, Jarajara, Saka, Sankuri
- **Ijara**: Hulugho, Sangailu, Ijara, Masalani

Users can select "Other (Specify)" if their location is not listed.

## 🔐 Security Features

- **Role-Based Access Control**:
  - Applicants can only see their own applications
  - Admins have full access to all applications and reports
- **Duplicate Detection**: Prevents multiple registrations
- **Data Validation**: All required fields validated before submission
- **Secure Storage**: Ready for Firebase integration
- **Public Access**: Open to all Garissa County residents

## 📊 Application Form Sections

### Part A: Student Personal Details
- Names (First, Middle, Last)
- Gender
- Phone numbers (Student & Parent/Guardian)
- Institution details
- Registration number
- Year/Form
- Course nature and duration

### Part B: Family Information
- Parent status (Both alive, One dead, Both dead)
- Disability information
- Father/Mother/Guardian names and occupations
- Siblings information
- Previous bursary benefits

### Part C: College/University
- Principal/Head information
- Principal's comments
- Student discipline rating
- Outstanding fees

### Part D: Financial Information
- Monthly income
- Total annual fees
- Fee balance
- Amount requested
- Justification statement

## 🔄 Roadmap to Production (Firebase Integration)

1. **Firebase Setup**:
   - Create Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage
   - Update `firebase_config.js` with your credentials

2. **Replace Local Storage**:
   - Update `js/auth.js` to use Firebase Auth
   - Update `js/application.js` to save to Firestore
   - Update `js/admin.js` to read from Firestore

3. **PDF Generation**:
   - Implement server-side PDF generator (Python + ReportLab)
   - Add QR codes for verification
   - Include county logo and signatures

4. **Email Notifications**:
   - Send confirmation emails on registration
   - Notify applicants of status changes
   - Send award letters via email

## 👥 Admin Account

### Fund Administrator
- **Email**: `fundadmin@garissa.go.ke`
- **Password**: Contact system administrator for access credentials (can be changed after login)
- **Role**: Fund Administrator

The administrator has full access to:
- All applications
- Filtering and reports
- Awarding/Rejecting applications
- Excel/CSV exports
- PDF offer letter generation
- Password reset for applicants

## 📝 User Manual

### For Applicants

1. **Access System**: Visit https://jmsmuigai.github.io/Bursary/
2. **Read Instructions**: Click "Read Instructions First" on login page
3. **Register**: Create account with email, ID/Birth Certificate number
4. **Complete Application**: Fill all 4 parts of the form
   - Form auto-saves every 2 seconds
   - Click "Save Progress" to manually save
   - You can continue later if incomplete
5. **Submit**: Review and submit application
6. **Track Status**: View your application status on dashboard

### For Administrators

1. **Access System**: Visit https://jmsmuigai.github.io/Bursary/
2. **Login**: Use admin email and password
3. **Dashboard**: View metrics and recent applications
4. **Filter**: Use filters to find specific applications
5. **Review**: Click "View" to see full application details
6. **Action**: Approve with amount or reject with reason
7. **Reports**: Generate and download Excel/CSV reports

## 🛠️ Development

### Technologies Used
- **HTML5/CSS3** - Modern, responsive design
- **Bootstrap 5** - UI framework
- **Vanilla JavaScript** - No dependencies
- **Local Storage** - Demo data storage (replace with Firebase)
- **GitHub Pages** - Free hosting

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

### GitHub Pages Configuration
- ✅ `.nojekyll` file included
- ✅ `404.html` redirect configured
- ✅ GitHub Actions workflow for auto-deployment
- ✅ All paths are relative (work on GitHub Pages)

## 📄 License

This project is developed for Garissa County, Kenya.

## 🎯 System Status

✅ **Production Ready - Version 2.0**

The system is fully functional and ready for use with:
- ✅ Complete application workflow
- ✅ Budget tracking (KSH 50,000,000)
- ✅ PDF generation with serial numbers
- ✅ Real-time budget alerts
- ✅ Applicant awarded amount display
- ✅ Print and download functionality
- ✅ Comprehensive help documentation

## 📝 Recent Updates (v2.0)

- **Budget Management**: Real-time tracking of KSH 50M budget with alerts
- **PDF System**: Preview, print, and download award letters
- **Serial Numbers**: Auto-incrementing serial numbers (GRS/Bursary/001...)
- **Applicant Features**: View awarded amount and download PDFs
- **Enhanced UI**: Smart scrolling, colorful budget display, improved tables
- **Documentation**: Updated README and comprehensive help guide

## 📧 Contact & Support

For support or questions:
- **Support Email**: `fundadmin@garissa.go.ke`
- **GitHub Repository**: https://github.com/jmsmuigai/Bursary
- **Live System**: https://jmsmuigai.github.io/Bursary/
- **System Developer**: jmsmuigai@gmail.com (for technical support only)

## 🎯 Future Enhancements

- [ ] Firebase Authentication integration
- [ ] Firestore database integration
- [ ] PDF generator with QR codes
- [ ] Email notifications
- [ ] Document upload functionality
- [ ] SMS notifications
- [ ] Mobile app version
- [ ] Advanced analytics and visualizations

---

**Built with ❤️ for Garissa County**

**Public Access**: Anyone with the GitHub link can access and use the system.
