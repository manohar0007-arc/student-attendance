const $ = (id) => document.getElementById(id);
const today = new Date();
const localDate = (d) => {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};
$('todayLabel').textContent = today.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', year:'numeric' });
$('attendanceDate').value = localDate(today);

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2600);
}
async function loadDashboard() {
  try {
    const data = await api('/api/dashboard');
    Object.entries(data).forEach(([key, value]) => $(key).textContent = value);
  } catch (e) { toast(e.message); }
}
async function loadStudents() {
  try {
    const search = encodeURIComponent($('studentSearch').value.trim());
    const students = await api(`/api/students?search=${search}`);
    $('studentCount').textContent = `${students.length} student(s)`;
    $('studentsBody').innerHTML = students.length ? students.map(s => `
      <tr><td><strong>${escapeHtml(s.roll_no)}</strong></td><td>${escapeHtml(s.full_name)}</td>
      <td>${escapeHtml(s.class_name)}</td><td>${escapeHtml(s.email || '—')}</td></tr>`).join('') :
      '<tr><td colspan="4">No students found.</td></tr>';
  } catch (e) { $('studentsBody').innerHTML = `<tr><td colspan="4">${escapeHtml(e.message)}</td></tr>`; }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function loadAttendance() {
  try {
    const date = $('attendanceDate').value;
    const rows = await api(`/api/attendance?date=${encodeURIComponent(date)}`);
    $('attendanceBody').innerHTML = rows.length ? rows.map(s => `
      <tr data-student="${s.student_id}"><td><strong>${escapeHtml(s.roll_no)}</strong></td>
      <td>${escapeHtml(s.full_name)}</td><td>${escapeHtml(s.class_name)}</td>
      <td><select class="status"><option value="">Not marked</option>
        <option ${s.status === 'Present' ? 'selected' : ''}>Present</option>
        <option ${s.status === 'Absent' ? 'selected' : ''}>Absent</option>
        <option ${s.status === 'Late' ? 'selected' : ''}>Late</option>
      </select></td></tr>`).join('') : '<tr><td colspan="4">Add students to begin taking attendance.</td></tr>';
  } catch (e) { toast(e.message); }
}
$('addStudentBtn').addEventListener('click', () => $('studentDialog').showModal());
$('closeDialog').addEventListener('click', () => $('studentDialog').close());
$('studentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = Object.fromEntries(form.entries());
  try {
    await api('/api/students', { method:'POST', body:JSON.stringify(body) });
    event.currentTarget.reset(); $('studentDialog').close();
    toast('Student added successfully.'); await Promise.all([loadStudents(), loadAttendance(), loadDashboard()]);
  } catch (e) { toast(e.message); }
});
$('studentSearch').addEventListener('input', loadStudents);
$('attendanceDate').addEventListener('change', loadAttendance);
$('saveAllBtn').addEventListener('click', async () => {
  const date = $('attendanceDate').value;
  const rows = [...$('attendanceBody').querySelectorAll('tr[data-student]')];
  try {
    for (const row of rows) {
      const status = row.querySelector('select').value;
      if (!status) continue;
      await api('/api/attendance', { method:'POST', body:JSON.stringify({
        student_id: row.dataset.student, attendance_date: date, status
      }) });
    }
    toast('Attendance saved successfully.');
    loadDashboard();
  } catch (e) { toast(e.message); }
});
$('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  $('themeBtn').textContent = document.body.classList.contains('dark') ? '☀' : '☾';
});
loadDashboard();
loadStudents();
loadAttendance();
