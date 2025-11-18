// PDF Offer Letter Generator for Garissa County Bursary
// Uses jsPDF library for browser-based PDF generation

/**
 * Generate an offer letter PDF for awarded applicants
 * @param {Object} application - The application data
 * @param {Object} awardDetails - Award information
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
async function generateOfferLetterPDF(application, awardDetails) {
  // Load jsPDF dynamically
  if (typeof window.jsPDF === 'undefined') {
    await loadJSPDF();
  }

  const { jsPDF } = window.jsPDF;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add text with styling
  function addText(text, x, y, options = {}) {
    const {
      fontSize = 12,
      fontStyle = 'normal',
      align = 'left',
      color = [0, 0, 0]
    } = options;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, { align });
  }

  // Helper function to add image
  function addImage(imgSrc, x, y, width, height) {
    try {
      doc.addImage(imgSrc, 'PNG', x, y, width, height);
    } catch (e) {
      console.warn('Could not add image:', imgSrc, e);
    }
  }

  // Load images (with fallback handling)
  const logoImg = await loadImage('Garissa Logo.png').catch(() => null);
  const signatureImg = await loadImage('assets/signature.png').catch(() => null);
  const stampImg = await loadImage('assets/stamp.png').catch(() => null);

  // Header with Logo
  if (logoImg) {
    addImage(logoImg, margin, yPos, 25, 25);
  }
  
  yPos += 5;
  addText('THE COUNTY GOVERNMENT OF GARISSA', pageWidth - margin, yPos, {
    fontSize: 14,
    fontStyle: 'bold',
    align: 'right',
    color: [139, 69, 19] // Garissa brown
  });
  
  yPos += 6;
  addText('SCHOLARSHIP FUND', pageWidth - margin, yPos, {
    fontSize: 12,
    fontStyle: 'bold',
    align: 'right',
    color: [139, 69, 19]
  });
  
  yPos += 5;
  addText('P.O. Box 1377-70100, GARISSA', pageWidth - margin, yPos, {
    fontSize: 10,
    align: 'right',
    color: [100, 100, 100]
  });

  yPos += 15;

  // Date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  addText(`Date: ${dateStr}`, pageWidth - margin, yPos, {
    fontSize: 10,
    align: 'right'
  });

  yPos += 10;

  // Reference Number
  addText(`REF: GSA/BURSARY/${application.appID}/${today.getFullYear()}`, margin, yPos, {
    fontSize: 10,
    fontStyle: 'bold'
  });

  yPos += 10;

  // Recipient Address
  const applicantName = application.applicantName || 
    `${application.personalDetails?.firstNames || ''} ${application.personalDetails?.lastName || ''}`.trim();
  const institution = application.personalDetails?.institution || 'N/A';
  const subCounty = application.personalDetails?.subCounty || application.subCounty || 'N/A';
  const ward = application.personalDetails?.ward || application.ward || 'N/A';

  addText(applicantName, margin, yPos, { fontSize: 11, fontStyle: 'bold' });
  yPos += 6;
  addText(institution, margin, yPos, { fontSize: 11 });
  yPos += 6;
  addText(`${subCounty} Sub-County`, margin, yPos, { fontSize: 11 });
  yPos += 6;
  addText(`${ward} Ward`, margin, yPos, { fontSize: 11 });
  yPos += 6;
  addText('Garissa County', margin, yPos, { fontSize: 11 });

  yPos += 15;

  // Subject
  addText('RE: BURSARY AWARD NOTIFICATION', margin, yPos, {
    fontSize: 12,
    fontStyle: 'bold',
    color: [139, 69, 19]
  });

  yPos += 10;

  // Salutation
  addText('Dear ' + applicantName + ',', margin, yPos, { fontSize: 11 });
  yPos += 10;

  // Body Paragraph 1
  const bodyText1 = `Following your application for bursary support for the academic year ${today.getFullYear()}, I am pleased to inform you that the Garissa County Scholarship Fund Committee has reviewed your application and approved your request.`;
  doc.setFontSize(11);
  doc.text(bodyText1, margin, yPos, { 
    maxWidth: pageWidth - (margin * 2),
    align: 'justify'
  });
  yPos += 15;

  // Award Details Box
  const awardAmount = awardDetails.committee_amount_kes || awardDetails.amount || 0;
  const boxY = yPos;
  doc.setDrawColor(139, 69, 19);
  doc.setFillColor(255, 248, 220);
  doc.roundedRect(margin, boxY - 5, pageWidth - (margin * 2), 20, 3, 3, 'FD');
  
  addText('AWARD DETAILS', margin + 5, boxY + 2, {
    fontSize: 10,
    fontStyle: 'bold',
    color: [139, 69, 19]
  });
  yPos += 5;
  addText(`Amount Awarded: KES ${awardAmount.toLocaleString()}`, margin + 5, yPos, {
    fontSize: 11,
    fontStyle: 'bold'
  });
  yPos += 6;
  addText(`Application Reference: ${application.appID}`, margin + 5, yPos, {
    fontSize: 10
  });
  yPos += 6;
  addText(`Academic Year: ${today.getFullYear()}`, margin + 5, yPos, {
    fontSize: 10
  });

  yPos += 15;

  // Body Paragraph 2
  const bodyText2 = `This bursary award is intended to support your education at ${institution}. The funds will be disbursed directly to your institution upon confirmation of your enrollment and fee structure.`;
  doc.setFontSize(11);
  doc.text(bodyText2, margin, yPos, { 
    maxWidth: pageWidth - (margin * 2),
    align: 'justify'
  });
  yPos += 15;

  // Body Paragraph 3
  const bodyText3 = `Please note that this award is subject to your continued enrollment and good academic standing. You are required to maintain satisfactory academic performance to remain eligible for future consideration.`;
  doc.setFontSize(11);
  doc.text(bodyText3, margin, yPos, { 
    maxWidth: pageWidth - (margin * 2),
    align: 'justify'
  });
  yPos += 15;

  // Body Paragraph 4
  const bodyText4 = `Should you have any questions or require further clarification, please do not hesitate to contact the Scholarship Fund Office at P.O. Box 1377-70100, Garissa, or email fundadmin@garissa.go.ke.`;
  doc.setFontSize(11);
  doc.text(bodyText4, margin, yPos, { 
    maxWidth: pageWidth - (margin * 2),
    align: 'justify'
  });
  yPos += 15;

  // Closing
  addText('Congratulations on your award, and we wish you success in your academic pursuits.', margin, yPos, {
    fontSize: 11,
    fontStyle: 'italic'
  });
  yPos += 15;

  addText('Yours sincerely,', margin, yPos, { fontSize: 11 });
  yPos += 20;

  // Signature
  if (signatureImg) {
    addImage(signatureImg, margin, yPos, 40, 15);
    yPos += 18;
  } else {
    yPos += 10;
  }

  addText('Fund Administrator', margin, yPos, {
    fontSize: 11,
    fontStyle: 'bold'
  });
  yPos += 5;
  addText('fundadmin@garissa.go.ke', margin, yPos, {
    fontSize: 10
  });
  yPos += 5;
  addText('Garissa County Scholarship Fund', margin, yPos, {
    fontSize: 10
  });
  yPos += 5;
  addText('P.O. Box 1377-70100, Garissa', margin, yPos, {
    fontSize: 10
  });

  // Stamp on the right side
  if (stampImg) {
    const stampX = pageWidth - margin - 40;
    const stampY = pageHeight - 50;
    addImage(stampImg, stampX, stampY, 40, 40);
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, footerY, { align: 'center' });

  // Generate filename
  const filename = `Garissa_Bursary_Award_${application.appID}_${today.getFullYear()}.pdf`;

  // Save PDF
  doc.save(filename);
  
  return filename;
}

/**
 * Load jsPDF library dynamically
 */
function loadJSPDF() {
  return new Promise((resolve, reject) => {
    if (typeof window.jsPDF !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      // jsPDF is loaded in window.jspdf
      window.jsPDF = window.jspdf.jsPDF;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Load image and convert to base64
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Set timeout for image loading
    const timeout = setTimeout(() => {
      console.warn('Image load timeout:', src);
      resolve(null);
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        console.warn('Could not convert image to base64:', e);
        resolve(null);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('Could not load image:', src);
      resolve(null); // Resolve with null instead of reject to prevent errors
    };
    
    img.src = src;
  });
}

// Export function for use in admin.js
window.generateOfferLetterPDF = generateOfferLetterPDF;

