<?php
require __DIR__ . '/config.php';
jsonResponse([
  'authenticated' => !empty($_SESSION['admin_id']),
  'name' => $_SESSION['admin_name'] ?? null
]);
