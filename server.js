const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Update the password below to match your local MySQL root password.
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_attendance_db',
  waitForConnections: true,
  connectionLimit: 10
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/dashboard', async (_req, res) => {
  try {
    const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) AS totalStudents FROM students');
    const [[{ presentToday }]] = await db.query(
      "SELECT COUNT(*) AS presentToday FROM attendance WHERE attendance_date = CURDATE() AND status = 'Present'"
    );
    const [[{ absentToday }]] = await db.query(
      "SELECT COUNT(*) AS absentToday FROM attendance WHERE attendance_date = CURDATE() AND status = 'Absent'"
    );
    const [[{ markedToday }]] = await db.query(
      'SELECT COUNT(*) AS markedToday FROM attendance WHERE attendance_date = CURDATE()'
    );
    res.json({ totalStudents, presentToday, absentToday, markedToday });
  } catch (err) {
    res.status(500).json({ error: 'Could not load dashboard. Check your MySQL setup.' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const search = `%${req.query.search || ''}%`;
    const [rows] = await db.query(
      'SELECT * FROM students WHERE full_name LIKE ? OR roll_no LIKE ? ORDER BY roll_no',
      [search, search]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load students.' });
  }
});

app.post('/api/students', async (req, res) => {
  const { roll_no, full_name, class_name, email } = req.body;
  if (!roll_no || !full_name || !class_name) {
    return res.status(400).json({ error: 'Roll number, student name and class are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO students (roll_no, full_name, class_name, email) VALUES (?, ?, ?, ?)',
      [roll_no.trim(), full_name.trim(), class_name.trim(), email || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Student added successfully.' });
  } catch (err) {
    res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      error: err.code === 'ER_DUP_ENTRY' ? 'That roll number already exists.' : 'Could not add student.'
    });
  }
});

app.get('/api/attendance', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const [rows] = await db.query(
      `SELECT s.id AS student_id, s.roll_no, s.full_name, s.class_name,
              a.id AS attendance_id, a.status, a.remarks
       FROM students s
       LEFT JOIN attendance a ON a.student_id = s.id AND a.attendance_date = ?
       ORDER BY s.roll_no`, [date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load attendance.' });
  }
});

app.post('/api/attendance', async (req, res) => {
  const { student_id, attendance_date, status, remarks } = req.body;
  if (!student_id || !attendance_date || !['Present', 'Absent', 'Late'].includes(status)) {
    return res.status(400).json({ error: 'Valid student, date and attendance status are required.' });
  }
  try {
    await db.query(
      `INSERT INTO attendance (student_id, attendance_date, status, remarks)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
      [student_id, attendance_date, status, remarks || null]
    );
    res.json({ message: 'Attendance saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not save attendance.' });
  }
});

app.listen(PORT, () => console.log(`Attendance app running at http://localhost:${PORT}`));
