<?php
if (isset($_POST['sessionId'])) {
    session_id($_POST['sessionId']);
}
include(__DIR__ . "/../../models/session.php");

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) || empty($_POST['password'])) {
    http_response_code(400); // 400 Bad Request
    die('Incorrect Input.');
}

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "SELECT * FROM users
        WHERE email = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['email']]);
    $user = $stmt->fetch();
    if ($user) {
        if (!password_verify($_POST['password'], $user['password'])) {
            http_response_code(401); // 401 Unauthorized
            die("Password is wrong.");
        }
        else if (!$user['is_verified']) {
            http_response_code(401); // 401 Unauthorized
            die("Please verify your email.");
        }
    }
    else {
        http_response_code(401); // 401 Unauthorized
        die("Email is not registered.");
        exit;
    }
    $_SESSION['user-id'] = $user['id'];
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}

exit;
?>