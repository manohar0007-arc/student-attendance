CREATE DATABASE IF NOT EXISTS student_attendance_db;
USE student_attendance_db;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_no VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  class_name VARCHAR(60) NOT NULL,
  email VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present','Absent','Late') NOT NULL,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_date (student_id, attendance_date),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id)
    REFERENCES students(id) ON DELETE CASCADE
);

INSERT IGNORE INTO students (roll_no, full_name, class_name, email) VALUES
('STU001', 'Aarav Kumar', 'BCA - II Year', 'aarav@example.com'),
('STU002', 'Diya Sharma', 'BCA - II Year', 'diya@example.com'),
('STU003', 'Rohan Reddy', 'BCA - II Year', 'rohan@example.com');
