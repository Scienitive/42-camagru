<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "INSERT INTO likes (user_id, post_id)
        VALUES (?, ?)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['userId'], $_POST['postId']]);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}

exit;
?>