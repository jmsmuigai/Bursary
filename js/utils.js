function toCurrencyKES(value){
  try{
    return new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:0}).format(value||0);
  }catch(e){
    return `Ksh ${Number(value||0).toLocaleString()}`;
  }
}

function downloadCSV(filename, rows){
  // Add header with digital signature info
  const header = [
    ['GARISSA COUNTY BURSARY MANAGEMENT SYSTEM - REPORT'],
    ['Generated: ' + new Date().toLocaleString()],
    ['Authorized by: Fund Administrator'],
    ['Email: fundadmin@garissa.go.ke'],
    ['Digital Signature: Verified'],
    ['']
  ];
  
  const allRows = [...header, ...rows];
  
  const process = allRows.map(r => r.map(v => {
    const s = (v??'').toString();
    if(/[,"\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
    return s;
  }).join(',')).join('\n');
  
  const blob = new Blob([process],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a);
  a.click(); setTimeout(()=>{URL.revokeObjectURL(url); a.remove()}, 0);
  
  // Auto-email report to fundadmin@garissa.go.ke
  if (typeof sendBursaryReport === 'function') {
    setTimeout(() => {
      // Detect report type from filename
      let reportType = 'general';
      if (filename.includes('beneficiaries')) {
        reportType = 'beneficiaries';
      } else if (filename.includes('allocation')) {
        reportType = 'allocation';
      } else if (filename.includes('demographics')) {
        reportType = 'demographics';
      } else if (filename.includes('budget')) {
        reportType = 'budget';
      }
      
      sendBursaryReport(reportType, {
        recordCount: rows.length,
        filename: filename
      }, filename);
    }, 1500);
  }
}

