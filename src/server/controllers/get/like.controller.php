<?php
include(__DIR__ . "/../../models/session.php");

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "SELECT COUNT(*) AS count
        FROM likes
        WHERE user_id = ? AND post_id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['userId'], $_GET['postId']]);

    $count = $stmt->fetchColumn();
    echo $count;
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>