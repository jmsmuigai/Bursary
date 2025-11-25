// Firebase Test Data Script
// Run this in browser console after Firebase is initialized to add test records

async function addTestRecordsToFirebase() {
  try {
    console.log('🔄 Adding test records to Firebase...');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
      console.error('❌ Firebase not initialized. Please make sure Firebase is set up.');
      return;
    }
    
    // Initialize Firebase if not already done
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    
    const db = firebase.firestore();
    
    // Test applications data
    const testApplications = [
      {
        appID: 'GSA/2025/2001',
        applicantEmail: 'test1@example.com',
        applicantName: 'Ahmed Hassan Mohamed',
        status: 'Pending Ward Review',
        dateSubmitted: new Date().toISOString(),
        subCounty: 'Garissa Township',
        ward: 'Waberi',
        village: 'Waberi Village',
        idNumber: '2025000001',
        personalDetails: {
          firstNames: 'Ahmed Hassan',
          lastName: 'Mohamed',
          gender: 'Male',
          institution: 'Garissa University',
          regNumber: 'GU2025001',
          subCounty: 'Garissa Township',
          ward: 'Waberi'
        },
        financialDetails: {
          amountRequested: 50000,
          feeBalance: 60000,
          monthlyIncome: 10000
        }
      },
      {
        appID: 'GSA/2025/2002',
        applicantEmail: 'test2@example.com',
        applicantName: 'Amina Abdi Ali',
        status: 'Pending Committee Review',
        dateSubmitted: new Date().toISOString(),
        subCounty: 'Lagdera',
        ward: 'Modogashe',
        village: 'Modogashe Village',
        idNumber: '2025000002',
        personalDetails: {
          firstNames: 'Amina Abdi',
          lastName: 'Ali',
          gender: 'Female',
          institution: 'University of Nairobi',
          regNumber: 'UON2025002',
          subCounty: 'Lagdera',
          ward: 'Modogashe'
        },
        financialDetails: {
          amountRequested: 75000,
          feeBalance: 80000,
          monthlyIncome: 15000
        }
      },
      {
        appID: 'GSA/2025/2003',
        applicantEmail: 'test3@example.com',
        applicantName: 'Omar Ibrahim Hussein',
        status: 'Pending Ward Review',
        dateSubmitted: new Date().toISOString(),
        subCounty: 'Dadaab',
        ward: 'Dertu',
        village: 'Dertu Village',
        idNumber: '2025000003',
        personalDetails: {
          firstNames: 'Omar Ibrahim',
          lastName: 'Hussein',
          gender: 'Male',
          institution: 'Kenyatta University',
          regNumber: 'KU2025003',
          subCounty: 'Dadaab',
          ward: 'Dertu'
        },
        financialDetails: {
          amountRequested: 60000,
          feeBalance: 70000,
          monthlyIncome: 12000
        }
      }
    ];
    
    // Add applications to Firebase
    console.log('📝 Adding', testApplications.length, 'test applications...');
    for (const app of testApplications) {
      try {
        await db.collection('applicants').doc(app.appID).set(app);
        console.log('✅ Added:', app.appID, '-', app.applicantName);
      } catch (error) {
        console.error('❌ Error adding', app.appID, ':', error);
      }
    }
    
    // Initialize budget if not exists
    const budgetRef = db.collection('settings').doc('budget');
    const budgetDoc = await budgetRef.get();
    
    if (!budgetDoc.exists) {
      await budgetRef.set({
        total: 50000000,
        allocated: 0,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Budget initialized in Firebase');
    } else {
      console.log('✅ Budget already exists in Firebase');
    }
    
    console.log('🎉 Test data added successfully!');
    console.log('📊 Check Firebase Console to see the data');
    console.log('🔄 Refresh the admin dashboard to see the new applications');
    
    // Trigger data update event
    window.dispatchEvent(new CustomEvent('mbms-data-updated', {
      detail: { key: 'mbms_applications', action: 'test-data-added', count: testApplications.length }
    }));
    
    return true;
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    alert('Error adding test data: ' + error.message);
    return false;
  }
}

// Export to window for console access
window.addTestRecordsToFirebase = addTestRecordsToFirebase;

// Auto-run if Firebase is ready
if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
  console.log('📦 Firebase test data script loaded');
  console.log('💡 To add test records, run: addTestRecordsToFirebase()');
}

