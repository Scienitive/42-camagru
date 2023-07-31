<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "INSERT INTO posts (user_id, image)
        VALUES (?, ?)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['userId'], $_POST['imageFileName']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}

exit;
?>