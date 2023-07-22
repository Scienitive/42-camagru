<?php
include(__DIR__ . "/../../models/session.php");

$pdo = require(__DIR__ . "/../../models/database.php");

if (isset($_GET['lastPostId'])) {
    $sql = "SELECT posts.*, users.username, COUNT(likes.id) AS like_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            LEFT JOIN likes ON posts.id = likes.post_id
            WHERE posts.id < ?
            GROUP BY posts.id, users.username
            ORDER BY posts.id DESC
            LIMIT 3";
}
else {
    $sql = "SELECT posts.*, users.username, COUNT(likes.id) AS like_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            LEFT JOIN likes ON posts.id = likes.post_id
            GROUP BY posts.id, users.username
            ORDER BY posts.id DESC
            LIMIT 3";
}

try {
    $stmt = $pdo->prepare($sql);
    if (isset($_GET['lastPostId'])) {
        $stmt->execute([$_GET['lastPostId']]);
    }
    else {
        $stmt->execute();
    }
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