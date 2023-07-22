<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "SELECT COUNT(*) AS count
        FROM comments
        WHERE comments.post_id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['postId']]);

    $count = $stmt->fetchColumn();
    echo $count;
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>