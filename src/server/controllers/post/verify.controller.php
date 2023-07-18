<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sqlSelect = "SELECT is_verified
              FROM users
              WHERE verification_token = ?";

$sqlUpdate = "UPDATE users
              SET is_verified = 1
              WHERE verification_token = ?";

try {
    $stmtSelect = $pdo->prepare($sqlSelect);
    $stmtSelect->execute([$_POST['token']]);

    $row_count = $stmtSelect->rowCount();

    if ($row_count === 0) {
        http_response_code(404); // 404 Not Found
        exit;
    }

    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([$_POST['token']]);

    $row_count = $stmtUpdate->rowCount();

    if ($row_count === 0) {
        http_response_code(400); // 400 Bad Request
    }
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>