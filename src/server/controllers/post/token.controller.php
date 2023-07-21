<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "UPDATE users
        SET verification_token = ?
        WHERE email = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['token'], $_POST['email']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>