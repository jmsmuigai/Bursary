# 🔥 Firebase Setup - Next Steps

## ✅ Step 1: Configuration File Updated
Your `firebase_config.js` file has been updated with your Firebase credentials!

---

## 📋 Step 2: Enable Firestore Database (IMPORTANT!)

### You need to enable the database now:

1. **In Firebase Console:**
   - Look at the left sidebar menu
   - Find "Firestore Database" (or "Build" → "Firestore Database")
   - Click on it

2. **Create Database:**
   - You'll see a button "Create database"
   - Click it!

3. **Choose Security Rules:**
   - Select **"Start in test mode"** (we'll fix the rules later)
   - Click "Next"

4. **Choose Location:**
   - Pick a location close to Kenya (like `us-central` or `europe-west`)
   - Click "Enable"
   - Wait about 30 seconds for it to create

5. **Database Created! ✅**
   - You'll see an empty database
   - This is normal - data will appear when applications are submitted

---

## 🔒 Step 3: Set Up Security Rules (Important!)

1. **In Firestore Database:**
   - Click on the "Rules" tab (at the top)

2. **Replace the rules with this code:**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Applications collection - allow read/write for all
       match /applications/{applicationId} {
         allow read, write: if true;
       }
       
       // System collection (budget, etc.)
       match /system/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

3. **Click "Publish"**
   - Wait for it to save

---

## ✅ Step 4: Test Your Setup!

1. **Go to your system:**
   - Open: https://jmsmuigai.github.io/Bursary/
   - Login as admin: `fundadmin@garissa.go.ke` / `@Omar.123!`

2. **Check if it's working:**
   - Press F12 (or right-click → Inspect)
   - Go to "Console" tab
   - Look for: "✅ Firebase initialized successfully"
   - If you see this, it's working! 🎉

3. **Test by submitting an application:**
   - Register a test applicant
   - Submit an application
   - Check Firebase Console → Firestore Database
   - You should see the application appear!

---

## 🎯 What You've Done:

✅ Created Firebase project  
✅ Registered web app  
✅ Updated configuration file  
⏳ Enable Firestore Database (DO THIS NOW!)  
⏳ Set up security rules  
⏳ Test the system  

---

## 🆘 Troubleshooting

### If you see "Firebase not configured":
- Make sure you saved `firebase_config.js`
- Refresh the page
- Check browser console (F12) for errors

### If database doesn't work:
- Make sure Firestore Database is enabled
- Check that security rules are published
- Make sure you selected "Start in test mode"

---

## 📞 Need Help?

Check the browser console (F12) for any error messages and let me know what you see!

