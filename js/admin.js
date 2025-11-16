// Populate filters and table with demo data. Replace sources with Firestore later.
(function(){
  // Metrics
  const apps = DEMO_APPLICATIONS;
  const metricTotal = document.getElementById('metricTotal');
  const metricPending = document.getElementById('metricPending');
  const metricAwarded = document.getElementById('metricAwarded');
  const metricFunds = document.getElementById('metricFunds');
  metricTotal.textContent = apps.length;
  metricPending.textContent = apps.filter(a=>a.status.toLowerCase().includes('pending')).length;
  const awarded = apps.filter(a=>a.status === 'Awarded');
  metricAwarded.textContent = awarded.length;
  metricFunds.textContent = toCurrencyKES(awarded.reduce((s,a)=> s + (a.amountRequested||0), 0));

  // Filters
  const scSel = document.getElementById('filterSubCounty');
  const wardSel = document.getElementById('filterWard');
  scSel.innerHTML = '<option value="">Filter by Sub-County</option>';
  Object.keys(GARISSA_WARDS).forEach(sc => scSel.add(new Option(sc, sc)));
  function populateFilterWards(){
    wardSel.innerHTML = '<option value="">Filter by Ward</option>';
    const wards = GARISSA_WARDS[scSel.value] || [];
    wards.forEach(w => wardSel.add(new Option(w, w)));
  }
  scSel.addEventListener('change', populateFilterWards);
  populateFilterWards();

  // Table
  const tbody = document.getElementById('applicationsTableBody');
  function renderTable(list){
    tbody.innerHTML = '';
    list.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.appID}</td>
        <td>${a.firstName} ${a.lastName}</td>
        <td>${a.subCounty} / ${a.ward}</td>
        <td>${a.institution}</td>
        <td><span class="badge ${a.status==='Awarded'?'bg-success':'bg-warning text-dark'}">${a.status}</span></td>
        <td>${Number(a.amountRequested).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1">View</button>
          <button class="btn btn-sm btn-success">PDF</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  renderTable(apps);

  // Apply filters
  document.getElementById('applyFilters').addEventListener('click', ()=>{
    const fsc = scSel.value;
    const fwd = wardSel.value;
    const fst = document.getElementById('filterStatus').value;
    const list = apps.filter(a => (!fsc || a.subCounty===fsc) && (!fwd || a.ward===fwd) && (!fst || a.status===fst));
    renderTable(list);
  });

  // Reports export
  document.getElementById('downloadReportBtn').addEventListener('click', ()=>{
    const status = document.getElementById('reportStatus').value;
    const list = status==='All' ? apps : apps.filter(a=>a.status==='Awarded');
    const rows = [
      ['App ID','First Name','Last Name','Sub-County','Ward','Institution','Status','Amount Requested']
    ];
    list.forEach(a => rows.push([a.appID,a.firstName,a.lastName,a.subCounty,a.ward,a.institution,a.status,String(a.amountRequested)]));
    downloadCSV('garissa_beneficiaries.csv', rows);
  });
})();

