<?php
include(__DIR__ . "/../../models/session.php");

if (!isset($_GET['lastPostId'])) {
    http_response_code(400); // 400 Bad Request
    exit;
}

$pdo = require(__DIR__ . "/../../models/database.php");

$sql = "SELECT posts.*, users.username FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id > ?
        ORDER BY posts.id DESC
        LIMIT 3";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_GET['lastPostId']]);
    $result = $stmt->fetchAll();
    header('Content-Type: application/json');
    echo json_encode($result);
}
catch (PDOException $e) {
    http_response_code(500); // 500 Internal Server Error
    die("SQL Error: " . $e->getMessage());
}
exit;
?>