# 🚀 Firebase Quick Start - Super Simple!

## ⚡ 5-Minute Setup

### Step 1: Open Firebase Console
👉 https://console.firebase.google.com/
👉 Click on your project: **garissa-bursary-system**

### Step 2: Create Database
1. Click **"Firestore Database"** in left menu
2. Click **"Create database"** (if not created)
3. Choose **"Start in test mode"**
4. Click **"Enable"**
5. Wait 30 seconds ⏳

### Step 3: Set Security Rules
1. Click **"Rules"** tab
2. Copy ALL text from `FIREBASE_SECURITY_RULES_COMPLETE.txt`
3. Paste into Firebase Rules editor
4. Click **"Publish"**

### Step 4: Create Collections
1. Click **"Data"** tab
2. Click **"Start collection"**
3. Create these 3 collections:

**Collection 1: `applicants`**
- Collection ID: `applicants`
- Document ID: Auto-ID
- Just create it (no fields needed yet)

**Collection 2: `settings`**
- Collection ID: `settings`
- Document ID: `budget` (type it, don't use Auto-ID!)
- Add field: `total` (number) = `50000000`
- Add field: `allocated` (number) = `0`
- Click Save

**Collection 3: `adminUsers`** (optional)
- Collection ID: `adminUsers`
- Document ID: Auto-ID
- Just create it (no fields needed yet)

### Step 5: Test It!
1. Go to: https://jmsmuigai.github.io/Bursary/
2. Press **F12** → **Console** tab
3. Look for: `✅ Firebase initialized successfully`

**Done! 🎉**

---

## 🔍 How to Check If It's Working

1. **Submit a test application** on your website
2. **Go to Firebase Console** → **Data tab** → **applicants collection**
3. **You should see your test application!**

---

## 📝 What Each Collection Does

- **`applicants`** = Stores all student applications
- **`settings`** = Stores budget information
- **`adminUsers`** = Stores admin user accounts (for later)

---

## ⚠️ Important Notes

- **Test mode** = Anyone can read/write (OK for testing)
- **After testing**, update security rules to be more secure
- **Collections are created automatically** when you save data (but it's better to create them first!)

---

**That's it! Your database is ready! 🚀**

