# Manohar Student Attendance Management System

A beginner-friendly attendance website built with HTML, CSS, JavaScript, Express.js and MySQL.

## Features
- Dashboard with student and attendance totals
- Add and view students
- Mark attendance as Present, Absent or Late
- View attendance records by date
- Search students by name or roll number
- MySQL database schema included

## Requirements
- Node.js and npm
- MySQL Server 8.x

## Setup (Windows PowerShell)

1. Open this project folder in VS Code.
2. Create the database by running the SQL file:
   ```powershell
   mysql -u root -p < database.sql
   ```
   Or open `database.sql` in MySQL Workbench and execute it.
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Set your MySQL password in `server.js` in the `db` configuration (default is blank).
5. Start the server:
   ```powershell
   npm start
   ```
6. Open http://localhost:3000

## Default database settings
- Host: `localhost`
- User: `root`
- Password: set your own in `server.js`
- Database: `student_attendance_db`

## GitHub
Create a new GitHub repository, then run:
```powershell
git init
git add .
git commit -m "Initial student attendance management system"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Use this project for learning and customize it for your institution.
