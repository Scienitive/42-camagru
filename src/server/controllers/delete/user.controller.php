<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "DELETE FROM users
        WHERE email = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['email']]);
    
    $row_count = $stmt->rowCount();

    if ($row_count === 0) {
        http_response_code(404); // 404 Not Found
        exit;
    }
    http_response_code(204); // 204 No Content
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>