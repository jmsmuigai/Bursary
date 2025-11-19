// PDF Offer Letter Generator for Garissa County Bursary
// Uses jsPDF library for browser-based PDF generation

/**
 * Get next serial number for award letter
 * Format: GRS/Bursary/001, GRS/Bursary/002, etc.
 */
function getNextSerialNumber() {
  const lastSerial = parseInt(localStorage.getItem('mbms_last_serial') || '0');
  const nextSerial = lastSerial + 1;
  localStorage.setItem('mbms_last_serial', nextSerial.toString());
  const serialStr = nextSerial.toString().padStart(3, '0');
  return `GRS/Bursary/${serialStr}`;
}

/**
 * Generate an offer letter PDF for awarded applicants
 * @param {Object} application - The application data
 * @param {Object} awardDetails - Award information
 * @param {Object} options - Options for PDF generation (preview, serialNumber, etc.)
 * @returns {Promise} - Promise that resolves with PDF blob or filename
 */
async function generateOfferLetterPDF(application, awardDetails, options = {}) {
  try {
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

    // Get serial number
    const serialNumber = awardDetails?.serialNumber || options.serialNumber || getNextSerialNumber();

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
        if (imgSrc) {
          doc.addImage(imgSrc, 'PNG', x, y, width, height);
        }
      } catch (e) {
        console.warn('Could not add image:', e);
      }
    }

    // Load images (with fallback handling)
    let logoImg = null;
    let signatureImg = null;
    let stampImg = null;
    
    try {
      logoImg = await loadImage('Garissa Logo.png');
    } catch (e) {
      console.warn('Logo not loaded:', e);
    }
    
    try {
      signatureImg = await loadImage('assets/signature.png');
    } catch (e) {
      console.warn('Signature not loaded:', e);
    }
    
    try {
      stampImg = await loadImage('assets/stamp.png');
    } catch (e) {
      console.warn('Stamp not loaded:', e);
    }

    // Header with Logo
    if (logoImg) {
      addImage(logoImg, margin, yPos, 25, 25);
    }
    
    yPos += 5;
    addText('THE COUNTY GOVERNMENT OF GARISSA', pageWidth - margin, yPos, {
      fontSize: 14,
      fontStyle: 'bold',
      align: 'right',
      color: [139, 69, 19]
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

    // Serial Number (prominently displayed)
    addText(`SERIAL NO: ${serialNumber}`, margin, yPos, {
      fontSize: 11,
      fontStyle: 'bold',
      color: [139, 69, 19]
    });

    yPos += 6;

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
    addText(`Serial Number: ${serialNumber}`, margin + 5, yPos, {
      fontSize: 10
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
    const filename = `Garissa_Bursary_Award_${serialNumber}_${application.appID}.pdf`;

    // If preview mode, return blob URL
    if (options.preview) {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      return { blobUrl, filename, serialNumber, doc };
    }

    // Save PDF directly (for direct download)
    doc.save(filename);
    
    return { filename, serialNumber };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Error generating PDF: ${error.message}`);
  }
}

/**
 * Preview PDF in a modal before printing
 */
async function previewPDF(application, awardDetails) {
  try {
    const loadingAlert = document.createElement('div');
    loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
    loadingAlert.style.zIndex = '9999';
    loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF preview...';
    document.body.appendChild(loadingAlert);

    const result = await generateOfferLetterPDF(application, awardDetails, { preview: true });
    
    loadingAlert.remove();

    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'pdfPreviewModal';
    modal.setAttribute('data-blob-url', result.blobUrl);
    modal.setAttribute('data-filename', result.filename);
    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary-700 text-white">
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-pdf me-2"></i>PDF Preview - Serial: ${result.serialNumber}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <iframe src="${result.blobUrl}" style="width: 100%; height: 80vh; border: none;"></iframe>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i>Close
            </button>
            <button type="button" class="btn btn-primary" id="printPDFBtn">
              <i class="bi bi-printer me-1"></i>Print to PDF
            </button>
            <button type="button" class="btn btn-success" id="downloadPDFBtn">
              <i class="bi bi-download me-1"></i>Download PDF
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for buttons
    const printBtn = modal.querySelector('#printPDFBtn');
    const downloadBtn = modal.querySelector('#downloadPDFBtn');
    
    printBtn.addEventListener('click', () => {
      printPDFFromModal(result.blobUrl);
    });
    
    downloadBtn.addEventListener('click', () => {
      downloadPDFFromModal(result.blobUrl, result.filename);
    });
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      URL.revokeObjectURL(result.blobUrl);
      modal.remove();
    });

    return result;
  } catch (error) {
    console.error('Preview error:', error);
    alert('Error generating PDF preview: ' + error.message);
    throw error;
  }
}

/**
 * Print PDF (cross-platform compatible)
 */
function printPDFFromModal(blobUrl) {
  try {
    // Method 1: Try opening in new window (works on most platforms)
    const printWindow = window.open(blobUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = function() {
        setTimeout(() => {
          try {
            printWindow.print();
          } catch (e) {
            console.warn('Print window error:', e);
            // Fallback to iframe
            printWindow.close();
            printViaIframe(blobUrl);
          }
        }, 500);
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          try {
            printWindow.print();
          } catch (e) {
            printWindow.close();
            printViaIframe(blobUrl);
          }
        }
      }, 1000);
    } else {
      // Popup blocked or not supported - use iframe
      printViaIframe(blobUrl);
    }
  } catch (error) {
    console.error('Print error:', error);
    printViaIframe(blobUrl);
  }
}

/**
 * Print via iframe (fallback method)
 */
function printViaIframe(blobUrl) {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    
    iframe.onload = function() {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error('Iframe print error:', e);
          alert('⚠️ Print dialog could not open automatically. Please download the PDF and print it manually, or use your browser\'s print option on the preview.');
        }
        // Clean up after print dialog closes
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 500);
    };
    
    // Fallback timeout
    setTimeout(() => {
      if (iframe.parentNode && iframe.contentWindow) {
        try {
          iframe.contentWindow.print();
        } catch (e) {
          console.error('Iframe print timeout error:', e);
        }
      }
    }, 2000);
  } catch (error) {
    console.error('Iframe creation error:', error);
    alert('⚠️ Print dialog could not open. Please download the PDF and print it manually.');
  }
}

/**
 * Download PDF (cross-platform compatible)
 */
function downloadPDFFromModal(blobUrl, filename) {
  try {
    // Method 1: Create download link (works on all platforms)
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    link.setAttribute('download', filename); // Ensure download attribute is set
    
    // For iOS Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const reader = new FileReader();
      fetch(blobUrl)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          link.href = url;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
          showDownloadSuccess(filename);
        })
        .catch(err => {
          console.error('Download error:', err);
          window.open(blobUrl, '_blank');
          alert('✅ PDF opened in new tab. Please use your browser\'s download option.');
        });
      return;
    }
    
    // For Android and other platforms
    document.body.appendChild(link);
    
    // Trigger download
    if (link.click) {
      link.click();
    } else {
      // Fallback for older browsers
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(event);
    }
    
    // Clean up
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 100);
    
    // Show success message
    showDownloadSuccess(filename);
    
  } catch (error) {
    console.error('Download error:', error);
    // Fallback: open in new tab
    try {
      window.open(blobUrl, '_blank');
      alert('✅ PDF opened in new tab. Please use your browser\'s download option (right-click → Save As).');
    } catch (e) {
      alert('❌ Error downloading PDF. Please try again or contact support.');
    }
  }
}

/**
 * Direct download PDF (without preview) - Cross-platform compatible
 */
async function downloadPDFDirect(application, awardDetails) {
  try {
    const loadingAlert = document.createElement('div');
    loadingAlert.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
    loadingAlert.style.zIndex = '9999';
    loadingAlert.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Generating PDF...';
    document.body.appendChild(loadingAlert);

    // Generate PDF as blob
    const result = await generateOfferLetterPDF(application, awardDetails, { preview: true });
    
    loadingAlert.remove();
    
    // Download the blob
    try {
      const link = document.createElement('a');
      link.href = result.blobUrl;
      link.download = result.filename;
      link.style.display = 'none';
      link.setAttribute('download', result.filename);
      
      document.body.appendChild(link);
      
      // Trigger download
      if (link.click) {
        link.click();
      } else {
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(event);
      }
      
      // Clean up
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(result.blobUrl);
      }, 100);
      
      // Show success message
      showDownloadSuccess(result.filename);
      
    } catch (downloadError) {
      console.error('Download trigger error:', downloadError);
      // Fallback: regenerate without preview and use doc.save
      try {
        const directResult = await generateOfferLetterPDF(application, awardDetails);
        showDownloadSuccess(directResult.filename);
      } catch (fallbackError) {
        console.error('Fallback download error:', fallbackError);
        // Last resort: open in new tab
        window.open(result.blobUrl, '_blank');
        alert('✅ PDF opened in new tab. Please use your browser\'s download option (right-click → Save As).');
      }
    }
    
    return result;
  } catch (error) {
    console.error('Download error:', error);
    const loadingAlert = document.querySelector('.alert-info');
    if (loadingAlert) loadingAlert.remove();
    alert('❌ Error generating PDF: ' + error.message);
    throw error;
  }
}

/**
 * Show download success message
 */
function showDownloadSuccess(filename) {
  // Create success alert
  const successAlert = document.createElement('div');
  successAlert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
  successAlert.style.zIndex = '10000';
  successAlert.style.minWidth = '300px';
  successAlert.style.textAlign = 'center';
  successAlert.innerHTML = `
    <i class="bi bi-check-circle-fill me-2"></i>
    <strong>Downloaded Successfully!</strong><br>
    <small>${filename}</small>
  `;
  document.body.appendChild(successAlert);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successAlert.style.transition = 'opacity 0.5s';
    successAlert.style.opacity = '0';
    setTimeout(() => {
      if (successAlert.parentNode) {
        successAlert.parentNode.removeChild(successAlert);
      }
    }, 500);
  }, 3000);
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
    script.onerror = () => reject(new Error('Failed to load jsPDF library'));
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
      reject(new Error('Image load timeout'));
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
        reject(e);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Could not load image: ' + src));
    };
    
    img.src = src;
  });
}

// Export functions for use in admin.js and applicant_dashboard.html
window.generateOfferLetterPDF = generateOfferLetterPDF;
window.previewPDF = previewPDF;
window.printPDFFromModal = printPDFFromModal;
window.downloadPDFFromModal = downloadPDFFromModal;
window.downloadPDFDirect = downloadPDFDirect;
window.getNextSerialNumber = getNextSerialNumber;
window.showDownloadSuccess = showDownloadSuccess;

// Legacy function names for backward compatibility
window.printPDF = printPDFFromModal;
window.downloadPDFFromPreview = downloadPDFFromModal;
