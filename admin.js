 // Admin Dashboard Script (Updated)

let hubs = JSON.parse(localStorage.getItem('hubs')) || {};
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

function saveData() {
  localStorage.setItem('hubs', JSON.stringify(hubs));
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

function showSection(id) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

function showPopup(message, color = 'green') {
  const popup = document.getElementById('popupMsg');
  popup.innerText = message;
  popup.style.backgroundColor = color;
  popup.style.display = 'block';
  setTimeout(() => popup.style.display = 'none', 2000);
}

function updateDropdowns() {
  const hubDropdowns = [
    'hubSelect', 'empHubSelect', 'attendanceHubSelect', 'reportMonthHubSelect', 'reportHubSelect'
  ];
  hubDropdowns.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = '<option disabled selected>Select HUB</option>';
      Object.keys(hubs).forEach(hub => {
        const option = document.createElement('option');
        option.value = option.text = hub;
        select.appendChild(option);
      });
    }
  });
  updateEmpCheckpostSelect();
}

function updateEmpCheckpostSelect() {
  const hub = document.getElementById('empHubSelect').value;
  const select = document.getElementById('empCheckpostSelect');
  select.innerHTML = '<option disabled selected>Select Checkpost</option>';
  (hubs[hub] || []).forEach(cp => {
    const option = document.createElement('option');
    option.value = option.text = cp;
    select.appendChild(option);
  });
}

function addHub() {
  const hubName = document.getElementById('newHubName').value.trim();
  if (!hubName || hubs[hubName]) return showPopup('Invalid or existing HUB', 'red');
  hubs[hubName] = [];
  saveData();
  updateDropdowns();
  showPopup('HUB Added Successfully');
  document.getElementById('newHubName').value = '';
}

function addCheckpost() {
  const hub = document.getElementById('hubSelect').value;
  const cpName = document.getElementById('newCheckpostName').value.trim();
  if (!hub || !cpName || hubs[hub].includes(cpName)) return showPopup('Invalid or duplicate Checkpost', 'red');
  hubs[hub].push(cpName);
  saveData();
  updateDropdowns();
  showPopup('Checkpost Added Successfully');
  document.getElementById('newCheckpostName').value = '';
}

function addEmployee() {
  const emp = {
    name: document.getElementById('empName').value.trim(),
    surname: document.getElementById('empSurname').value.trim(),
    mobile: document.getElementById('empMobile').value.trim(),
    location: document.getElementById('empLocation').value.trim(),
    account: document.getElementById('empBankAccount').value.trim(),
    ifsc: document.getElementById('empIFSC').value.trim(),
    bank: document.getElementById('empBankName').value.trim(),
    pan: document.getElementById('empPAN').value.trim(),
    hub: document.getElementById('empHubSelect').value,
    checkpost: document.getElementById('empCheckpostSelect').value,
    id: Date.now()
  };
  if (!emp.name || !emp.hub || !emp.checkpost) return showPopup('Fill all fields', 'red');
  employees.push(emp);
  saveData();
  showPopup('Employee Added Successfully');
  document.querySelectorAll('#employeeSection input').forEach(input => input.value = '');
}

function renderEmployees() {
  const table = document.getElementById('employeeTable');
  if (!table) return;
  table.innerHTML = `<table><tr><th>Name</th><th>Mobile</th><th>Hub</th><th>Checkpost</th><th>Action</th></tr>
    ${employees.map(emp => `
      <tr>
        <td>${emp.name} ${emp.surname}</td>
        <td>${emp.mobile}</td>
        <td>${emp.hub}</td>
        <td>${emp.checkpost}</td>
        <td><button onclick="deleteEmployee(${emp.id})">🗑️</button></td>
      </tr>`).join('')}</table>`;
}

function deleteEmployee(id) {
  if (confirm('Delete this employee?')) {
    employees = employees.filter(e => e.id !== id);
    saveData();
    renderEmployees();
    showPopup('Employee Deleted');
  }
}

function renderAttendance() {
  const hub = document.getElementById('attendanceHubSelect').value;
  const month = document.getElementById('attendanceMonth').value;
  if (!hub || !month) return;

  const date = new Date(`${month}-01`);
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const rows = employees.filter(e => e.hub === hub);

  let html = `<table><tr><th>Name</th>`;
  for (let i = 1; i <= days; i++) html += `<th>${i}</th>`;
  html += `<th>Total Present</th></tr>`;

  rows.forEach(emp => {
    const key = `${emp.id}_${month}`;
    if (!attendanceData[key]) attendanceData[key] = Array(days).fill('');
    let totalPresent = 0;

    html += `<tr><td>${emp.name}</td>`;
    attendanceData[key].forEach((v, i) => {
      if (v === 'P') totalPresent++;
      html += `<td style="background-color:${v === 'P' ? '#c8f7c5' : v === 'A' ? '#f7c5c5' : 'transparent'}">
        <select onchange="markAttendance('${key}', ${i}, this.value)">
          <option value="" ${v == '' ? 'selected' : ''}></option>
          <option value="P" ${v == 'P' ? 'selected' : ''}>P</option>
          <option value="A" ${v == 'A' ? 'selected' : ''}>A</option>
        </select></td>`;
    });
    html += `<td>${totalPresent}</td></tr>`;
  });
  html += `</table>`;
  document.getElementById('attendanceTable').innerHTML = html;
}

function markAttendance(key, index, value) {
  attendanceData[key][index] = value;
  saveData();
  renderAttendance();

  if (value === 'A') {
    const [empId, month] = key.split('_');
    const emp = employees.find(e => e.id == empId);
    if (emp) {
      const today = new Date();
      const timestamp = today.toLocaleString();
      alert(`📢 NOTIFICATION\nName: ${emp.name} ${emp.surname}\nMobile: ${emp.mobile}\nStatus: ABSENT (marked on ${timestamp})\nPlease contact your supervisor.`);
    }
  }
}

function renderMonthlyReport() {
  const hub = document.getElementById('reportMonthHubSelect').value;
  const month = document.getElementById('reportMonth').value;
  if (!hub || !month) return;
  const days = new Date(new Date(month + "-01").getFullYear(), new Date(month + "-01").getMonth() + 1, 0).getDate();

  let csvData = [['Name', 'Mobile', 'Bank Acc', 'IFSC', 'Total Days', 'Present', 'Absent', 'Absent Link']];

  let html = `<table><tr><th>Name</th><th>Mobile</th><th>Bank Acc</th><th>IFSC</th><th>Total Days</th><th>Present</th><th>Absent</th><th>Absent Link</th></tr>`;
  employees.filter(e => e.hub === hub).forEach(emp => {
    const key = `${emp.id}_${month}`;
    const data = attendanceData[key] || [];
    const present = data.filter(d => d === 'P').length;
    const absent = data.filter(d => d === 'A').length;

    const absentLink = `mailto:${emp.mobile}@sms.gateway.com?subject=ABSENT%20NOTICE&body=You%20were%20absent%20on%20${month}.%20Please%20contact%20your%20supervisor.`;

    html += `<tr>
      <td>${emp.name} ${emp.surname}</td>
      <td>${emp.mobile}</td>
      <td>${emp.account}</td>
      <td>${emp.ifsc}</td>
      <td>${days}</td>
      <td>${present}</td>
      <td>${absent}</td>
      <td><a href="${absentLink}" target="_blank">📧 Notify</a></td>
    </tr>`;

    csvData.push([
      `${emp.name} ${emp.surname}`, emp.mobile, emp.account, emp.ifsc, days, present, absent, absentLink
    ]);
  });
  html += `</table>`;
  document.getElementById('monthlyReportTable').innerHTML = html;

  const btn = document.createElement('button');
  btn.textContent = 'Download Monthly Report';
  btn.onclick = () => downloadCSV(csvData, 'monthly_report.csv');
  document.getElementById('monthlyReportTable').appendChild(btn);
}

function renderDailyReport() {
  const hub = document.getElementById('reportHubSelect').value;
  const date = document.getElementById('reportDateInput').value;
  if (!hub || !date) return;

  const day = new Date(date).getDate();
  const month = date.substring(0, 7);

  let html = `<table><tr><th>Name</th><th>Status</th></tr>`;
  employees.filter(e => e.hub === hub).forEach(emp => {
    const key = `${emp.id}_${month}`;
    const data = attendanceData[key] || [];
    html += `<tr><td>${emp.name}</td><td>${data[day - 1] || 'N/A'}</td></tr>`;
  });
  html += `</table>`;
  document.getElementById('dailyReportTable').innerHTML = html;
}

function exportToCSV() {
  let csv = 'Name,Surname,Mobile,Location,Bank Acc,IFSC,Bank,PAN,Hub,Checkpost\n';
  employees.forEach(e => {
    csv += `${e.name},${e.surname},${e.mobile},${e.location},${e.account},${e.ifsc},${e.bank},${e.pan},${e.hub},${e.checkpost}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'employees.csv';
  link.click();
}

function downloadCSV(data, filename) {
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

updateDropdowns();
renderEmployees();
