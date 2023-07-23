<?php

$pdo = require(__DIR__ . "/../../models/database.php");

if (isset($_GET['id'])) {
    $sql = "SELECT * FROM users
            WHERE id = ?";
    $var = $_GET['id'];
}
else if (isset($_GET['email'])) {
    $sql = "SELECT * FROM users
            WHERE email = ?";
    $var = $_GET['email'];
}
else if (isset($_GET['username'])) {
    $sql = "SELECT * FROM users
            WHERE username = ?";
    $var = $_GET['username'];
}
else if (isset($_GET['token'])) {
    $sql = "SELECT * FROM users
            WHERE verification_token = ?";
    $var = $_GET['token'];
}
else {
    http_response_code(400); // 400 Bad Request
    exit;
}

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$var]);
    $user = $stmt->fetch();
    if ($user) {
        header('Content-Type: application/json');
        echo json_encode($user);
    }
    else {
        http_response_code(404); // 404 Not Found
        die("User not found.");
    }
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>