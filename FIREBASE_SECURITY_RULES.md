# 🔒 Firebase Security Rules - Production Setup

## Current Situation
- System hosted under: `jmsmuigai@gmail.com` (GitHub account)
- Admin account: `fundadmin@garissa.go.ke`
- Need to secure data so only admin can access

## Recommended Approach

### Phase 1: Testing (Now)
✅ **Start in test mode** - This allows you to test the system easily

### Phase 2: Production (After Testing)
🔒 **Switch to production mode** with custom security rules

---

## Step 1: Start in Test Mode (Now)

**What to do:**
1. ✅ Keep "Start in test mode" selected (it's already checked)
2. Click "Create" button
3. Wait 30 seconds for database to be created

**Why test mode now?**
- Easier to test the system
- No complex rules to debug
- You can switch to production later

---

## Step 2: After Testing - Set Up Production Security Rules

### Option A: Email-Based Security (Recommended)

**Security Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'fundadmin@garissa.go.ke';
    }
    
    // Applications collection - only admin can read/write
    match /applications/{applicationId} {
      allow read, write: if isAdmin();
    }
    
    // System collection (budget, etc.) - only admin
    match /system/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Note:** This requires Firebase Authentication to be set up.

---

### Option B: Simple Public Read/Write (For Now - Less Secure)

**Security Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all (temporary - for testing)
    match /applications/{applicationId} {
      allow read, write: if true;
    }
    
    match /system/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**When to use:** During testing phase only

---

## Step 3: How to Update Security Rules Later

1. **Go to Firestore Database → Rules tab**
2. **Replace the rules** with the production rules above
3. **Click "Publish"**
4. **Test that it works**

---

## Important Notes

### About jmsmuigai@gmail.com vs fundadmin@garissa.go.ke

- **jmsmuigai@gmail.com** = GitHub account (hosts the website)
- **fundadmin@garissa.go.ke** = Admin login for the bursary system
- These are different accounts!

### Security Considerations

1. **Test Mode:**
   - ✅ Easy to test
   - ⚠️ Data is accessible to anyone with the database reference
   - ⚠️ Only lasts 30 days, then you must update rules

2. **Production Mode:**
   - ✅ More secure
   - ⚠️ Requires proper authentication setup
   - ✅ Better for long-term use

---

## Recommended Timeline

**Week 1-2: Testing Phase**
- Use test mode
- Test all features
- Make sure everything works

**Week 3: Production Setup**
- Set up Firebase Authentication (if needed)
- Update security rules to production mode
- Test with production rules

---

## Next Steps (Right Now)

1. ✅ Click "Create" with "Start in test mode" selected
2. Wait for database to be created
3. Test your system
4. After testing, we'll set up proper production security rules

---

## Questions?

- **Q: Can I change from test mode to production mode later?**
  - A: Yes! Just update the security rules in the Rules tab.

- **Q: Will test mode expire?**
  - A: Yes, after 30 days you must update the rules. But you can update them anytime.

- **Q: Is test mode safe?**
  - A: For testing, yes. For production with real data, switch to production mode with proper rules.

