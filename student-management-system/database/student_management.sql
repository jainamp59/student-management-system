CREATE DATABASE IF NOT EXISTS student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(30),
  gender VARCHAR(20),
  dob DATE,
  course VARCHAR(100) DEFAULT 'BCA',
  address TEXT,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  admission_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE,
  course_name VARCHAR(150) NOT NULL,
  duration VARCHAR(50),
  annual_fee DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present','Absent','Late') DEFAULT 'Present',
  UNIQUE KEY unique_attendance (student_id, attendance_date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'Cash',
  notes VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  max_marks DECIMAL(5,2) DEFAULT 100,
  exam_name VARCHAR(100),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Demo admin:
-- email: admin@example.com
-- password: admin123
INSERT INTO admins (name,email,password)
SELECT 'Administrator','admin@example.com',
'$2y$10$8Kz7r3kY3KxH5Y2Lh7JxOe4aZlM2Hh4oQm2gq2f2q0nqvJf4nGm7K'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email='admin@example.com');

INSERT INTO courses (course_code,course_name,duration,annual_fee)
SELECT 'BCA','Bachelor of Computer Applications','3 Years',45000
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code='BCA');

INSERT INTO courses (course_code,course_name,duration,annual_fee)
SELECT 'BBA','Bachelor of Business Administration','3 Years',42000
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code='BBA');

INSERT INTO students (student_id,first_name,last_name,email,phone,gender,dob,course,status,admission_date)
SELECT 'STU-2026-1001','Aarav','Shah','aarav@example.com','9876543210','Male','2007-03-12','BCA','Active','2026-04-10'
WHERE NOT EXISTS (SELECT 1 FROM students WHERE student_id='STU-2026-1001');

INSERT INTO students (student_id,first_name,last_name,email,phone,gender,dob,course,status,admission_date)
SELECT 'STU-2026-1002','Riya','Patel','riya@example.com','9876543211','Female','2006-08-22','BBA','Active','2026-04-14'
WHERE NOT EXISTS (SELECT 1 FROM students WHERE student_id='STU-2026-1002');

INSERT INTO students (student_id,first_name,last_name,email,phone,gender,dob,course,status,admission_date)
SELECT 'STU-2026-1003','Kabir','Mehta','kabir@example.com','9876543212','Male','2007-01-17','BCA','Active','2026-05-02'
WHERE NOT EXISTS (SELECT 1 FROM students WHERE student_id='STU-2026-1003');

INSERT INTO students (student_id,first_name,last_name,email,phone,gender,dob,course,status,admission_date)
SELECT 'STU-2026-1004','Anaya','Joshi','anaya@example.com','9876543213','Female','2006-11-08','B.Des','Inactive','2026-05-08'
WHERE NOT EXISTS (SELECT 1 FROM students WHERE student_id='STU-2026-1004');
