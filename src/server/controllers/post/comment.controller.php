<?php

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "INSERT INTO comments (user_id, post_id, comment)
        VALUES (?, ?, ?)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['userId'], $_POST['postId'], $_POST['comment']]);

    $lastInsertedId = $pdo->lastInsertId();
    echo $lastInsertedId;
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>