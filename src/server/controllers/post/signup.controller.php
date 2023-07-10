<?php
include(__DIR__ . "/../../models/session.php");

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) || empty($_POST['uname']) || empty($_POST['password'])) {
    http_response_code(400); // 400 Bad Request
    die('Incorrect Input.');
}

$hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['email'], $_POST['uname'], $hashed_password]);
    http_response_code(201); // 201 Created
}
catch (PDOException $e) {
    if ($e->getCode() === "23000" && strpos($e->getMessage(), 'email') !== false) {
        http_response_code(409); // 409 Conflict
        die("Email already taken.");
    }
    else if ($e->getCode() === "23000" && strpos($e->getMessage(), "username") !== false) {
        http_response_code(409); // 409 Conflict
        die("Username already taken.");
    }
    else {
        http_response_code(500); // 500 Internal Server Error
        die("SQL Error: " . $e->getMessage());
    }
}
$_SESSION['main-view'] = "email-verification";
exit;
?>