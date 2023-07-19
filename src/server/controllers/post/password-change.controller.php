<?php

if (empty($_POST['password'])) {
    http_response_code(400); // 400 Bad Request
    die('Incorrect Input.');
}

$hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "UPDATE users
        SET password = ?
        WHERE verification_token = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$hashed_password, $_POST['verification_token']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>