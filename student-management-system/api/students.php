<?php
require __DIR__ . '/config.php';
requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, student_id, first_name, last_name, email, phone, gender, dob, course, address, status, admission_date FROM students ORDER BY id DESC");
    jsonResponse(['success'=>true,'students'=>$stmt->fetchAll()]);
}

if ($method === 'POST' || $method === 'PUT') {
    $data = jsonInput();
    $first = trim($data['first_name'] ?? '');
    $last = trim($data['last_name'] ?? '');
    if ($first === '' || $last === '') jsonResponse(['success'=>false,'message'=>'First name and last name are required.'],422);

    if ($method === 'POST') {
        $studentId = 'STU-' . date('Y') . '-' . str_pad((string)random_int(1,9999), 4, '0', STR_PAD_LEFT);
        $stmt = $pdo->prepare("INSERT INTO students (student_id, first_name, last_name, email, phone, gender, dob, course, address, status, admission_date) VALUES (?,?,?,?,?,?,?,?,?,?,CURDATE())");
        $stmt->execute([$studentId,$first,$last,$data['email']??null,$data['phone']??null,$data['gender']??'Male',$data['dob']??null,$data['course']??'BCA',$data['address']??null,$data['status']??'Active']);
        jsonResponse(['success'=>true,'id'=>$pdo->lastInsertId(),'student_id'=>$studentId]);
    }

    $id=(int)($data['id']??0);
    if(!$id) jsonResponse(['success'=>false,'message'=>'Student ID is required.'],422);
    $stmt=$pdo->prepare("UPDATE students SET first_name=?, last_name=?, email=?, phone=?, gender=?, dob=?, course=?, address=?, status=? WHERE id=?");
    $stmt->execute([$first,$last,$data['email']??null,$data['phone']??null,$data['gender']??'Male',$data['dob']??null,$data['course']??'BCA',$data['address']??null,$data['status']??'Active',$id]);
    jsonResponse(['success'=>true]);
}

if ($method === 'DELETE') {
    $id=(int)($_GET['id']??0);
    if(!$id) jsonResponse(['success'=>false,'message'=>'Student ID is required.'],422);
    $stmt=$pdo->prepare("DELETE FROM students WHERE id=?");
    $stmt->execute([$id]);
    jsonResponse(['success'=>true]);
}

jsonResponse(['success'=>false,'message'=>'Method not allowed'],405);
