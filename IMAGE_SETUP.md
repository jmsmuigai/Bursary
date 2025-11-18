# 📸 Setting Up Signature and Stamp Images

## Quick Setup Guide

You mentioned you have the images in a folder called "ASSET". Here's how to move them to the correct location:

### Step 1: Locate Your Images

Your images should be:
- `SIGNATURE.png` (or `signature.png`)
- `STAMP.png` (or `stamp.png`)

They might be in:
- A folder called `ASSET` (uppercase)
- A folder called `asset` (lowercase)
- The root directory

### Step 2: Move to Correct Location

**Option A: Using Finder (Mac)**
1. Open Finder
2. Navigate to your Bursary project folder
3. Find your `ASSET` folder (or wherever the images are)
4. Copy `SIGNATURE.png` and `STAMP.png`
5. Go to the `assets` folder (lowercase) in your project
6. Paste the images there
7. Rename them to lowercase:
   - `SIGNATURE.png` → `signature.png`
   - `STAMP.png` → `stamp.png`

**Option B: Using Terminal**
```bash
cd "/Users/james/Library/CloudStorage/GoogleDrive-jmsmuigai@gmail.com/My Drive/Bursary"

# If images are in ASSET folder (uppercase)
cp ASSET/SIGNATURE.png assets/signature.png
cp ASSET/STAMP.png assets/stamp.png

# Or if they're already in assets folder but uppercase
mv assets/SIGNATURE.png assets/signature.png
mv assets/STAMP.png assets/stamp.png
```

**Option C: Using VS Code**
1. Open VS Code in your project
2. Find the images in your `ASSET` folder
3. Right-click → Copy
4. Navigate to `assets` folder
5. Right-click → Paste
6. Rename to lowercase if needed

### Step 3: Verify File Structure

Your final structure should be:
```
Bursary/
├── assets/
│   ├── signature.png  ✅
│   ├── stamp.png      ✅
│   └── README_IMAGES.md
└── ...
```

### Step 4: Test PDF Generation

1. Login as admin: `jmsmuigai@gmail.com` / `@12345`
2. Award an application
3. PDF should download with signature and stamp!

## Important Notes

- ✅ File names must be **lowercase**: `signature.png` and `stamp.png`
- ✅ Files must be in the `assets/` folder (lowercase)
- ✅ Images should be PNG format with transparent background
- ✅ The system will work without images, but PDFs will be more professional with them

## Troubleshooting

**Images not showing in PDF?**
- Check file names are exactly `signature.png` and `stamp.png` (lowercase)
- Verify files are in `assets/` folder (not `ASSET`)
- Check browser console (F12) for errors
- Ensure images are PNG format

**Need to download from Google Drive?**
If your images are still in Google Drive:
1. Go to: https://drive.google.com/drive/folders/13XXZQKZ3w4ucnBl9wFTb1T5OD03PqrvH
2. Download `SIGNATURE.png` and `STAMP.png`
3. Place them in `assets/` folder
4. Rename to lowercase

## Current Status

Once you've moved the images, the PDF generation will be complete and professional!

