function toCurrencyKES(value){
  try{
    return new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:0}).format(value||0);
  }catch(e){
    return `Ksh ${Number(value||0).toLocaleString()}`;
  }
}

function downloadCSV(filename, rows){
  const process = rows.map(r => r.map(v => {
    const s = (v??'').toString();
    if(/[,"\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
    return s;
  }).join(',')).join('\n');
  const blob = new Blob([process],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a);
  a.click(); setTimeout(()=>{URL.revokeObjectURL(url); a.remove()}, 0);
}

