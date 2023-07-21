<?php
include(__DIR__ . "/../../models/session.php");

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "SELECT * FROM users
        WHERE verification_token = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['token']]);
    $user = $stmt->fetch();
    if ($user) {
        header('Content-Type: application/json');
        echo json_encode($user);
    }
    else {
        http_response_code(404); // 404 Not Found
        die("Token is invalid.");
    }
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>