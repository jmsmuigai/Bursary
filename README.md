# 🌟 Garissa County Modern Bursary Management System (MBMS)

A comprehensive, modern, and secure bursary management system for Garissa County, Kenya. This system streamlines the entire bursary lifecycle from online application to fund allocation and reporting.

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
- ✅ **Privacy** - Applicants cannot see other applicants' information

### Administration Dashboard
- ✅ **Two Admin Accounts**:
  - `jmsmuigai@gmail.com` (Password: `@12345`)
  - `osmanmohamud60@gmail.com` (Password: `@12345`)
- ✅ **Smart Application Counter** - Real-time updates when new applications are submitted
- ✅ **Application Management**:
  - View all applications
  - Filter by Sub-County, Ward, and Status
  - Review individual applications
  - Approve/Award applications with amount and justification
  - Reject applications
- ✅ **Smart Reports**:
  - Filterable data export
  - Download Excel/CSV reports
  - Beneficiary lists
  - Financial allocation summaries
  - Demographics reports
- ✅ **Dashboard Metrics**:
  - Total Applications
  - Pending Review
  - Total Awarded
  - Funds Allocated (YTD)

### Technical Features
- ✅ **Duplicate Registration Detection** - Prevents multiple registrations with same email/ID
- ✅ **Incomplete Applications** - Track and continue draft applications
- ✅ **Data Validation** - Clean data only saved
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI/UX** - Colorful, professional theme with Garissa County branding
- ✅ **Local Storage** - Demo mode (ready for Firebase integration)

## 🚀 Quick Start

### Local Testing (No Backend Required)

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Test Admin Login**:
   - Email: `jmsmuigai@gmail.com` or `osmanmohamud60@gmail.com`
   - Password: `@12345`
4. **Test Applicant Flow**:
   - Click "Read Instructions First"
   - Register a new account
   - Complete the application form
   - View dashboard

### GitHub Pages (Live)

The system is deployed at: **https://jmsmuigai.github.io/Bursary/**

## 📁 Project Structure

```
Bursary/
├── index.html                 # Login page
├── instructions.html          # Application instructions
├── register.html              # Applicant registration
├── application.html           # Comprehensive application form
├── applicant_dashboard.html   # Applicant's personal dashboard
├── admin_dashboard.html       # Admin portal
├── styles.css                 # Modern theme and styling
├── firebase_config.js         # Firebase configuration template
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

## 👥 Admin Accounts

### Primary Admin
- **Email**: `jmsmuigai@gmail.com`
- **Password**: `@12345` (can be changed)
- **Name**: James Muigai

### Secondary Admin
- **Email**: `osmanmohamud60@gmail.com`
- **Password**: `@12345` (can be changed)
- **Name**: Osman Mohamud

Both admins have full access to:
- All applications
- Filtering and reports
- Awarding/Rejecting applications
- Excel/CSV exports

## 📝 User Manual

### For Applicants

1. **Read Instructions**: Click "Read Instructions First" on login page
2. **Register**: Create account with email, ID/Birth Certificate number
3. **Complete Application**: Fill all 4 parts of the form
   - Form auto-saves every 2 seconds
   - Click "Save Progress" to manually save
   - You can continue later if incomplete
4. **Submit**: Review and submit application
5. **Track Status**: View your application status on dashboard

### For Administrators

1. **Login**: Use admin email and password
2. **Dashboard**: View metrics and recent applications
3. **Filter**: Use filters to find specific applications
4. **Review**: Click "View" to see full application details
5. **Action**: Approve with amount or reject with reason
6. **Reports**: Generate and download Excel/CSV reports

## 🛠️ Development

### Technologies Used
- **HTML5/CSS3** - Modern, responsive design
- **Bootstrap 5** - UI framework
- **Vanilla JavaScript** - No dependencies
- **Local Storage** - Demo data storage (replace with Firebase)

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📄 License

This project is developed for Garissa County, Kenya.

## 📧 Contact

For support or questions:
- Email: `jmsmuigai@gmail.com`
- GitHub: https://github.com/jmsmuigai/Bursary

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
