# 🧪 END-TO-END TEST RUN INSTRUCTIONS

## Complete Workflow Test: Registration → Application → Award → PDF Download

This document explains how to run the complete end-to-end test that simulates the entire system workflow.

## 🚀 Quick Start

### Option 1: Run from Browser Console (Recommended)

1. **Open Admin Dashboard**
   - Navigate to `admin_dashboard.html`
   - Open browser console (F12 or Cmd+Option+I)

2. **Run Complete Test**
   ```javascript
   simulateCompleteWorkflow()
   ```

3. **What It Does:**
   - ✅ Creates a test applicant
   - ✅ Creates a test application with all required fields
   - ✅ Awards the application (Ksh 100,000)
   - ✅ Generates and auto-downloads the award letter PDF
   - ✅ Shows test results

### Option 2: Run from Application Page

1. **Open Application Form**
   - Navigate to `application.html`
   - Open browser console

2. **Run Test**
   ```javascript
   simulateCompleteWorkflow()
   ```

## 📋 Test Details

### Test Applicant Created:
- **Name**: Test Applicant Auto
- **Email**: test.applicant@garissa.test
- **Phone**: 0712345678
- **Location**: Garissa Township / Waberi
- **ID Number**: 12345678

### Test Application Created:
- **Application ID**: GSA/2025/XXXX (auto-generated)
- **Institution**: University of Nairobi
- **Amount Requested**: Ksh 100,000
- **Status**: Pending Ward Review → Awarded

### Award Details:
- **Amount Awarded**: Ksh 100,000
- **Serial Number**: GRS/Bursary/001 (auto-generated)
- **Status**: Awarded
- **Justification**: "Awarded based on financial need and academic performance"

### PDF Generated:
- **Filename**: `Garissa_Bursary_Award_Test_Applicant_Auto_GRS_Bursary_001_GSA_2025_XXXX.pdf`
- **Auto-downloads** to your default downloads folder
- **Contains**: Complete award letter with all details

## ✅ Expected Results

After running the test, you should see:

1. **Console Output:**
   ```
   🧪 END-TO-END SYSTEM TEST - Starting complete workflow simulation...
   📝 STEP 1: Creating test applicant...
   ✅ Test applicant created: test.applicant@garissa.test
   📝 STEP 2: Creating test application...
   ✅ Test application created: GSA/2025/XXXX
   📝 STEP 3: Simulating admin award process...
   ✅ Application awarded successfully
   📝 STEP 4: Generating and downloading award letter PDF...
   ✅ PDF generated and downloaded successfully
   ```

2. **Success Alert:**
   - Shows all steps completed
   - Displays PDF filename
   - Shows serial number and amount

3. **PDF File:**
   - Automatically downloads to your downloads folder
   - Professional format with Garissa County branding
   - Contains all award details

## 🔍 Verification Steps

### 1. Check Database
```javascript
// In browser console
const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
const testApp = apps.find(a => a.applicantEmail === 'test.applicant@garissa.test');
console.log('Test Application:', testApp);
console.log('Status:', testApp?.status);
console.log('Amount Awarded:', testApp?.awardDetails?.amount);
```

### 2. Check PDF Download
- Open your downloads folder
- Look for file starting with `Garissa_Bursary_Award_Test_Applicant`
- Open the PDF and verify:
  - ✅ Garissa County logo
  - ✅ Applicant name
  - ✅ Amount awarded (Ksh 100,000)
  - ✅ Serial number
  - ✅ Digital signature
  - ✅ Official stamp

### 3. Check Admin Dashboard
- Navigate to admin dashboard
- Go to Applications section
- Find the test application
- Verify status is "Awarded"
- Verify amount is Ksh 100,000

## 🧹 Cleanup After Test

### Remove Test Data
```javascript
// In browser console
clearApplicationsOnly();  // Removes test application
// OR
clearDatabaseComplete();  // Removes all data (use with caution)
```

### Manual Cleanup
```javascript
// Remove test applicant
const users = JSON.parse(localStorage.getItem('mbms_users') || '[]');
const filtered = users.filter(u => u.email !== 'test.applicant@garissa.test');
localStorage.setItem('mbms_users', JSON.stringify(filtered));

// Remove test application
const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
const filteredApps = apps.filter(a => a.applicantEmail !== 'test.applicant@garissa.test');
localStorage.setItem('mbms_applications', JSON.stringify(filteredApps));
```

## ⚠️ Troubleshooting

### PDF Not Downloading
1. Check if jsPDF library is loaded:
   ```javascript
   typeof window.jspdf !== 'undefined'
   ```

2. Check browser download settings
3. Try manual download:
   ```javascript
   const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
   const testApp = apps.find(a => a.applicantEmail === 'test.applicant@garissa.test');
   if (testApp && testApp.status === 'Awarded') {
     downloadPDFDirect(testApp, testApp.awardDetails);
   }
   ```

### Application Not Found
- Check if application was created:
  ```javascript
  const apps = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
  console.log('All applications:', apps);
  ```

### Award Not Working
- Check if application exists and has correct status
- Verify award details are set correctly
- Check budget system if configured

## 📊 Test Results Format

The test returns an object with:
```javascript
{
  success: true/false,
  results: {
    registration: { success: true/false, error: null },
    application: { success: true/false, error: null },
    adminAward: { success: true/false, error: null },
    pdfDownload: { success: true/false, error: null }
  },
  applicationId: "GSA/2025/XXXX",
  applicantEmail: "test.applicant@garissa.test",
  awardAmount: 100000,
  serialNumber: "GRS/Bursary/001"
}
```

## 🎯 Next Steps After Successful Test

1. ✅ Verify PDF is correctly formatted
2. ✅ Check all data is saved correctly
3. ✅ Verify budget deduction (if configured)
4. ✅ Test on different browsers
5. ✅ Clear test data
6. ✅ System is ready for first real application!

---

**Test Status**: ✅ Ready to Run
**Last Updated**: 2025-01-XX

