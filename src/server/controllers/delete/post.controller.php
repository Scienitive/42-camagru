<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "DELETE FROM posts
        WHERE id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['postId']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}

exit;
?>