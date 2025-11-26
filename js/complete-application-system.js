// COMPLETE APPLICATION SYSTEM - Ensures Next button works, submission works, and admin dashboard updates
// This is a comprehensive fix that ensures everything works end-to-end

(function() {
  'use strict';
  
  console.log('🚀 COMPLETE APPLICATION SYSTEM - Initializing...');
  
  // Clear all test/dummy data and prepare for first real application
  window.clearAllTestData = async function() {
    if (!confirm('⚠️ This will delete ALL test and dummy data!\n\nAre you sure you want to clear everything and prepare for the first real application?')) {
      return;
    }
    
    try {
      console.log('🧹 Clearing all test/dummy data...');
      
      // Clear localStorage applications (but keep structure)
      const keysToClear = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('mbms_application') && 
          !key.includes('mbms_application_counter') ||
          key.includes('TEST_') ||
          key.includes('dummy') ||
          key.includes('DUMMY')
        )) {
          keysToClear.push(key);
        }
      }
      
      keysToClear.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      });
      
      // Clear applications array but keep counter
      localStorage.setItem('mbms_applications', JSON.stringify([]));
      
      // Reset counter to 0 (first application will be GSA/2025/0001)
      localStorage.setItem('mbms_application_counter', '0');
      
      // Clear Firebase test data if available
      if (typeof window.getApplications !== 'undefined' && typeof firebase !== 'undefined' && firebase.firestore) {
        try {
          const db = firebase.firestore();
          const snapshot = await db.collection('applicants').get();
          snapshot.forEach(async doc => {
            const data = doc.data();
            // Delete test/dummy data
            if (data.applicantEmail && (
              data.applicantEmail.includes('example.com') ||
              data.applicantEmail.includes('TEST_') ||
              data.appID && (data.appID.includes('TEST_') || data.appID.includes('Firebase Test'))
            )) {
              await db.collection('applicants').doc(doc.id).delete();
              console.log('🗑️ Deleted Firebase test record:', doc.id);
            }
          });
        } catch (error) {
          console.warn('Firebase cleanup error:', error);
        }
      }
      
      // Refresh admin dashboard
      if (typeof refreshApplications !== 'undefined') {
        refreshApplications();
      }
      
      alert('✅ All test data cleared!\n\nThe system is now ready for the first real application submission.');
      
      console.log('✅ Test data cleared - system ready for first application');
    } catch (error) {
      console.error('Error clearing test data:', error);
      alert('Error clearing test data: ' + error.message);
    }
  };
  
  // Enhanced Next button handler - ensures navigation works
  function enhanceNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    if (!nextBtn) {
      setTimeout(enhanceNextButton, 500);
      return;
    }
    
    // Remove old listener and create new one
    const newBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newBtn, nextBtn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('➡️ Next button clicked (enhanced handler)');
      
      // Get current step
      const sections = document.querySelectorAll('.form-section');
      let currentStep = 0;
      sections.forEach((s, i) => {
        if (s.classList.contains('active')) {
          currentStep = i;
        }
      });
      
      const totalSteps = sections.length;
      
      // Auto-save before proceeding
      if (typeof autosave === 'function') {
        autosave();
      }
      
      // Move to next step
      if (currentStep < totalSteps - 1) {
        // Hide current section
        sections[currentStep].classList.remove('active');
        
        // Show next section
        currentStep++;
        sections[currentStep].classList.add('active');
        
        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
          const progress = ((currentStep + 1) / totalSteps) * 100;
          progressBar.style.width = `${progress}%`;
        }
        
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((ind, i) => {
          if (i <= currentStep) {
            ind.classList.add('active');
          } else {
            ind.classList.remove('active');
          }
        });
        
        // Update button visibility
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
          prevBtn.style.display = currentStep > 0 ? 'block' : 'none';
        }
        
        if (newBtn) {
          newBtn.style.display = currentStep < totalSteps - 1 ? 'block' : 'none';
        }
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
          submitBtn.style.display = currentStep === totalSteps - 1 ? 'block' : 'none';
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Auto-save after step change
        setTimeout(() => {
          if (typeof autosave === 'function') {
            autosave();
          }
        }, 500);
        
        console.log('✅ Moved to step', currentStep + 1, 'of', totalSteps);
      }
    });
    
    newBtn.disabled = false;
    newBtn.style.cursor = 'pointer';
    newBtn.style.opacity = '1';
    newBtn.style.pointerEvents = 'auto';
    
    console.log('✅ Next button enhanced and enabled');
  }
  
  // Enhanced Submit button handler - ensures submission works
  function enhanceSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) {
      setTimeout(enhanceSubmitButton, 500);
      return;
    }
    
    const form = document.getElementById('applicationForm');
    if (!form) {
      setTimeout(enhanceSubmitButton, 500);
      return;
    }
    
    // Remove old listener and create new one
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('📝 Form submission triggered (enhanced handler)');
      
      // Show loading
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      loadingMsg.style.zIndex = '10000';
      loadingMsg.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Submitting application... Please wait...';
      document.body.appendChild(loadingMsg);
      
      try {
        // Get user
        const userStr = sessionStorage.getItem('mbms_current_user');
        if (!userStr) {
          loadingMsg.remove();
          alert('Please login to submit your application.');
          window.location.href = 'index.html';
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // Collect all form data
        const allFormData = {};
        const inputs = newForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (input.type === 'radio') {
            if (input.checked) allFormData[input.name] = input.value;
          } else if (input.type === 'checkbox') {
            allFormData[input.name] = input.checked;
          } else if (input.id) {
            allFormData[input.id] = input.value;
          }
        });
        
        // Generate application ID
        const year = new Date().getFullYear();
        const counter = parseInt(localStorage.getItem('mbms_application_counter') || '0') + 1;
        const appID = `GSA/${year}/${counter.toString().padStart(4, '0')}`;
        
        // Build application data
        const applicationData = {
          appID: appID,
          applicantEmail: user.email,
          applicantName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          dateSubmitted: new Date().toISOString(),
          status: 'Pending Ward Review',
          subCounty: user.subCounty || 'N/A',
          ward: user.ward || 'N/A',
          village: user.village || '',
          idNumber: user.nemisId || user.idNumber || '',
          nemisId: user.nemisId || user.idNumber || '',
          birthCertificate: user.birthCertificate || '',
          dateOfBirth: user.dateOfBirth || '',
          isFinalSubmission: true,
          personalDetails: {
            firstNames: allFormData['firstNames'] || '',
            middleName: allFormData['middleName'] || '',
            lastName: allFormData['lastNameApp'] || '',
            gender: allFormData['genderApp'] || '',
            studentPhone: allFormData['studentPhone'] || '',
            parentPhone: allFormData['parentPhone'] || '',
            institution: allFormData['institutionName'] || '',
            regNumber: allFormData['regNumber'] || '',
            yearForm: allFormData['yearForm'] || '',
            courseNature: allFormData['courseNature'] || '',
            courseDuration: allFormData['courseDuration'] || '',
            subCounty: user.subCounty || 'N/A',
            ward: user.ward || 'N/A'
          },
          familyDetails: {
            parentStatus: newForm.querySelector('input[name="parentStatus"]:checked')?.value || '',
            hasDisability: newForm.querySelector('input[name="hasDisability"]:checked')?.value || '',
            disabilityDescription: allFormData['disabilityDescription'] || '',
            fatherName: allFormData['fatherName'] || '',
            fatherOccupation: allFormData['fatherOccupation'] || '',
            motherName: allFormData['motherName'] || '',
            motherOccupation: allFormData['motherOccupation'] || '',
            guardianName: allFormData['guardianName'] || '',
            guardianOccupation: allFormData['guardianOccupation'] || '',
            totalSiblings: parseInt(allFormData['totalSiblings'] || 0),
            guardianChildren: parseInt(allFormData['guardianChildren'] || 0),
            siblingsWorking: parseInt(allFormData['siblingsWorking'] || 0),
            siblingsSecondary: parseInt(allFormData['siblingsSecondary'] || 0),
            siblingsPostSecondary: parseInt(allFormData['siblingsPostSecondary'] || 0),
            educationPayer: newForm.querySelector('input[name="educationPayer"]:checked')?.value || '',
            payerOtherSpecify: allFormData['payerOtherSpecify'] || '',
            previousBenefit: newForm.querySelector('input[name="previousBenefit"]:checked')?.value || '',
            previousAmount: parseInt(allFormData['previousAmount'] || 0),
            previousYear: parseInt(allFormData['previousYear'] || 0)
          },
          institutionDetails: {
            principalName: allFormData['principalName'] || '',
            principalPhone: allFormData['principalPhone'] || '',
            principalComments: allFormData['principalComments'] || '',
            discipline: newForm.querySelector('input[name="discipline"]:checked')?.value || '',
            outstandingFees: parseInt(allFormData['outstandingFees'] || 0)
          },
          financialDetails: {
            monthlyIncome: parseInt(allFormData['monthlyIncome'] || 0),
            totalAnnualFees: parseInt(allFormData['totalAnnualFees'] || 0),
            feeBalance: parseInt(allFormData['feeBalance'] || 0),
            amountRequested: parseInt(allFormData['amountRequested'] || 0),
            justification: allFormData['justification'] || ''
          }
        };
        
        // Save to Firebase and localStorage
        if (typeof window.saveApplication !== 'undefined') {
          await window.saveApplication(applicationData);
          console.log('✅ Saved to Firebase:', appID);
        }
        
        // Also save to localStorage
        const applications = JSON.parse(localStorage.getItem('mbms_applications') || '[]');
        const existingIndex = applications.findIndex(a => a.appID === appID);
        if (existingIndex >= 0) {
          applications[existingIndex] = applicationData;
        } else {
          applications.push(applicationData);
        }
        localStorage.setItem('mbms_applications', JSON.stringify(applications));
        
        // Update counter
        localStorage.setItem('mbms_application_counter', counter.toString());
        
        // Remove draft
        localStorage.removeItem(`mbms_application_${user.email}`);
        
        // Trigger events for admin dashboard
        window.dispatchEvent(new CustomEvent('mbms-data-updated', {
          detail: { 
            key: 'mbms_applications', 
            action: 'submitted', 
            appID: appID,
            application: applicationData
          }
        }));
        
        // Force localStorage update
        localStorage.setItem('mbms_applications', JSON.stringify(applications));
        
        loadingMsg.remove();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
        successMsg.style.zIndex = '10000';
        successMsg.style.minWidth = '500px';
        successMsg.innerHTML = `
          <div class="text-center">
            <i class="bi bi-check-circle-fill fs-1 text-success d-block mb-3"></i>
            <h4>✅ Submission Successful!</h4>
            <p class="mb-2"><strong>Application ID:</strong> ${appID}</p>
            <p class="mb-2">Your application has been submitted and is now in <strong>"Pending Ward Review"</strong> status.</p>
            <p class="mb-0"><small>Your application will appear on the admin dashboard and is awaiting review.</small></p>
          </div>
        `;
        document.body.appendChild(successMsg);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = 'applicant_dashboard.html';
        }, 3000);
        
        console.log('✅ Application submitted successfully:', appID);
      } catch (error) {
        console.error('Submission error:', error);
        loadingMsg.remove();
        alert('Error submitting application: ' + error.message + '\n\nPlease try again.');
      }
    });
    
    console.log('✅ Submit button enhanced');
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(enhanceNextButton, 100);
      setTimeout(enhanceSubmitButton, 200);
    });
  } else {
    setTimeout(enhanceNextButton, 100);
    setTimeout(enhanceSubmitButton, 200);
  }
  
  console.log('✅ Complete Application System initialized');
})();

