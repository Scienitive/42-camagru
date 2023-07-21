<?php

if (empty($_POST['password'])) {
    http_response_code(400); // 400 Bad Request
    die('Incorrect Input.');
}

$hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$pdo = require(__DIR__ . "/../../models/database.php");

$sqlSelect = "SELECT id
              FROM users
              WHERE verification_token = ?";

$sqlUpdate = "UPDATE users
              SET password = ?
              WHERE verification_token = ?";

try {
    $stmtSelect = $pdo->prepare($sqlSelect);
    $stmtSelect->execute([$_POST['token']]);

    $row_count = $stmtSelect->rowCount();

    if ($row_count === 0) {
        http_response_code(404); // 404 Not Found
        die("Verification token is invalid.");
    }

    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([$hashed_password, $_POST['token']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>