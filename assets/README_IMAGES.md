# Adding Signature and Stamp Images

## Required Images

To enable PDF offer letter generation with signature and stamp, you need to add two images:

### 1. Signature Image
- **File name**: `signature.png`
- **Location**: `assets/signature.png`
- **Format**: PNG (transparent background recommended)
- **Size**: Recommended 200x75 pixels (width x height)
- **Content**: The Fund Administrator's signature

### 2. Stamp Image
- **File name**: `stamp.png`
- **Location**: `assets/stamp.png`
- **Format**: PNG (transparent background recommended)
- **Size**: Recommended 200x200 pixels (circular stamp)
- **Content**: The official Garissa County Scholarship Fund stamp

## How to Add Images

1. **Prepare your images**:
   - Scan or take a photo of the signature
   - Scan or take a photo of the stamp
   - Use an image editor to:
     - Remove background (make transparent)
     - Resize to recommended dimensions
     - Save as PNG format

2. **Add to project**:
   - Place `signature.png` in the `assets/` folder
   - Place `stamp.png` in the `assets/` folder

3. **Verify**:
   - The files should be at:
     - `assets/signature.png`
     - `assets/stamp.png`

## Note

- If images are not found, the PDF will still generate but without signature/stamp
- The system will work without these images, but the PDF will be more professional with them
- Images should be high quality for best results in the PDF

## Quick Test

After adding images, test by:
1. Logging in as admin
2. Awarding an application
3. The PDF should automatically download with signature and stamp

