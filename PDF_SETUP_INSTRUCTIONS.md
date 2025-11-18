# PDF Offer Letter Generation - Setup Instructions

## ✅ What's Already Done

The PDF generation system is **fully integrated** and ready to use! Here's what's been implemented:

1. ✅ **PDF Generator Module** (`js/pdf-generator.js`)
   - Professional offer letter template
   - Automatic PDF generation on award
   - Includes Garissa County branding

2. ✅ **Admin Integration**
   - PDF generates automatically when you award an application
   - "Download PDF" button for already-awarded applications
   - Only visible to administrators

3. ✅ **jsPDF Library**
   - Added to admin dashboard
   - No installation needed (loaded from CDN)

## 📋 What You Need to Do

### Step 1: Add Signature and Stamp Images

The system needs two images to make the PDF complete:

1. **Signature Image**:
   - Take a photo or scan of the Fund Administrator's signature
   - Remove background (make it transparent)
   - Save as `assets/signature.png`
   - Recommended size: 200x75 pixels

2. **Stamp Image**:
   - Take a photo or scan of the official stamp
   - Remove background (make it transparent)
   - Save as `assets/stamp.png`
   - Recommended size: 200x200 pixels (circular)

### Step 2: How to Prepare Images

**Option A: Using Online Tools**
1. Go to https://www.remove.bg/ (free background remover)
2. Upload your signature/stamp photo
3. Download the transparent PNG
4. Resize if needed using https://www.iloveimg.com/resize-image

**Option B: Using Your Phone**
1. Take a clear photo of signature/stamp on white paper
2. Use a photo editor app to:
   - Remove background
   - Crop to size
   - Save as PNG

**Option C: Using Photoshop/GIMP**
1. Open image
2. Remove background (magic wand tool)
3. Export as PNG with transparency

### Step 3: Place Images in Project

1. Create `assets` folder if it doesn't exist
2. Place `signature.png` in `assets/` folder
3. Place `stamp.png` in `assets/` folder

**File structure should be:**
```
Bursary/
├── assets/
│   ├── signature.png  ← Add this
│   └── stamp.png      ← Add this
└── ...
```

### Step 4: Test the System

1. **Login as Admin**:
   - Email: `jmsmuigai@gmail.com`
   - Password: `@12345`

2. **Award an Application**:
   - Go to Application Management
   - Click "View" on any application
   - Enter award amount and justification
   - Click "Approve/Award"
   - PDF should automatically download!

3. **Download Existing Award PDF**:
   - Find an already-awarded application
   - Click "PDF" button
   - PDF will generate and download

## 🎨 PDF Features

The generated PDF includes:

- ✅ **Garissa County Logo** (top right)
- ✅ **Official Letterhead** with county details
- ✅ **Applicant Information** (name, institution, location)
- ✅ **Award Details Box** (highlighted amount)
- ✅ **Professional Letter Content**
- ✅ **Fund Administrator Signature** (if image provided)
- ✅ **Official Stamp** (if image provided)
- ✅ **Reference Number** (GSA/BURSARY/APPID/YEAR)
- ✅ **Date** (automatically generated)

## ⚠️ Important Notes

1. **Images are Optional**: The PDF will generate even without signature/stamp images, but it will look more professional with them.

2. **Image Format**: Must be PNG format with transparent background for best results.

3. **File Names**: Must be exactly:
   - `assets/signature.png`
   - `assets/stamp.png`

4. **Access Control**: Only administrators can generate PDFs. Applicants cannot see or download offer letters.

5. **Automatic Generation**: PDF is generated automatically when you award an application - no extra steps needed!

## 🔧 Troubleshooting

**PDF not generating?**
- Check browser console for errors (F12)
- Ensure jsPDF library loaded (check Network tab)
- Try refreshing the page

**Images not showing in PDF?**
- Verify file names are correct: `signature.png` and `stamp.png`
- Check file location: `assets/` folder
- Ensure images are PNG format
- Check browser console for image loading errors

**PDF looks different than expected?**
- Clear browser cache
- Try in a different browser
- Check that all required fields are filled in application

## 📝 Example PDF Structure

```
┌─────────────────────────────────────┐
│  [Logo]    COUNTY GOVERNMENT OF     │
│            GARISSA                   │
│            SCHOLARSHIP FUND         │
│            P.O. Box 1377-70100      │
├─────────────────────────────────────┤
│ Date: 17 September 2025            │
│ REF: GSA/BURSARY/1001/2025         │
├─────────────────────────────────────┤
│                                     │
│ Applicant Name                      │
│ Institution                         │
│ Location                            │
│                                     │
│ RE: BURSARY AWARD NOTIFICATION     │
│                                     │
│ Dear [Name],                        │
│                                     │
│ [Letter content...]                 │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ AWARD DETAILS               │   │
│ │ Amount: KES 20,000          │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Signature]    [Stamp]             │
│ Fund Administrator                  │
└─────────────────────────────────────┘
```

## ✅ You're All Set!

Once you add the signature and stamp images, the system is complete and ready for production use. The PDF generation happens automatically whenever you award an application.

**Need Help?** Contact: jmsmuigai@gmail.com

