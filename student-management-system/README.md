# Student Management System

A full-stack internship project built with HTML, CSS, JavaScript, PHP and MySQL.

## Features
- Admin login with PHP sessions
- Dashboard with statistics and chart
- Student CRUD: create, read, update, delete
- Search and status filtering
- Courses, attendance, fees, results and reports UI
- Responsive design
- MySQL database schema
- Vercel Docker deployment configuration

## Local installation

### Option A — XAMPP
1. Install XAMPP.
2. Start Apache and MySQL.
3. Copy this project into `htdocs`.
4. Open phpMyAdmin.
5. Import `database/student_management.sql`.
6. Open `http://localhost/student-management-system/public/login.html`.
7. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

### API configuration
For local XAMPP, the default database values are:
- DB_HOST = 127.0.0.1
- DB_NAME = student_management
- DB_USER = root
- DB_PASS = empty

For production, set these as environment variables.

## Vercel
Vercel can deploy containerized HTTP servers using `Dockerfile.vercel`. A production MySQL database must be hosted outside the Vercel container because Vercel compute is stateless.

Set these environment variables in Vercel:
DB_HOST
DB_NAME
DB_USER
DB_PASS

Then deploy the repository.

## Demo credentials
Email: admin@example.com
Password: admin123
