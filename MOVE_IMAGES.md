# 🖼️ Quick Guide: Move Signature & Stamp Images

## Your Images Location

You mentioned the images are in a folder called "ASSET". Here's how to move them:

### Step 1: Find Your Images

Look for:
- `SIGNATURE.png` (or `signature.png`)
- `STAMP.png` (or `stamp.png`)

They should be in a folder called `ASSET` (uppercase) in your project.

### Step 2: Move to Correct Location

**Using Finder (Mac):**
1. Open Finder
2. Go to: `/Users/james/Library/CloudStorage/GoogleDrive-jmsmuigai@gmail.com/My Drive/Bursary`
3. Find the `ASSET` folder
4. Copy both `SIGNATURE.png` and `STAMP.png`
5. Go to the `assets` folder (lowercase, already exists)
6. Paste the images
7. Rename to lowercase:
   - `SIGNATURE.png` → `signature.png`
   - `STAMP.png` → `stamp.png`

**Using Terminal (Quick Method):**
```bash
cd "/Users/james/Library/CloudStorage/GoogleDrive-jmsmuigai@gmail.com/My Drive/Bursary"

# Copy from ASSET to assets (if ASSET folder exists)
cp ASSET/SIGNATURE.png assets/signature.png
cp ASSET/STAMP.png assets/stamp.png

# Or if they're already in assets but uppercase
cd assets
mv SIGNATURE.png signature.png 2>/dev/null
mv STAMP.png stamp.png 2>/dev/null
```

### Step 3: Verify

After moving, your structure should be:
```
Bursary/
├── assets/
│   ├── signature.png  ✅
│   ├── stamp.png      ✅
│   └── README_IMAGES.md
└── ...
```

### Step 4: Test

1. Login as admin
2. Award an application
3. PDF should download with signature and stamp!

## ✅ Done!

Once images are in place, the system is 100% ready for use!

