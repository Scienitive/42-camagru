<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "UPDATE users
        SET email = ?,
        SET username = ?,
        SET password = ?,
        SET email_notification = ?
        WHERE id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['email'], $_POST['username'], $_POST['password'], $_POST['emailNotification'], $_POST['id']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}

exit;
?>