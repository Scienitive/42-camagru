<?php

$pdo = require(__DIR__ . "/../../models/database.php");

if (isset($_GET['lastCommentId'])) {
    $sql = "SELECT comments.id, comments.comment, users.username
            FROM comments
            INNER JOIN users ON comments.user_id = users.id
            WHERE comments.id < ? AND comments.post_id = ?
            ORDER BY comments.id DESC
            LIMIT 3";
}
else {
    $sql = "SELECT comments.id, comments.comment, users.username
            FROM comments
            INNER JOIN users ON comments.user_id = users.id
            WHERE comments.post_id = ?
            ORDER BY comments.id DESC
            LIMIT 3";
}

try {
    $stmt = $pdo->prepare($sql);
    if (isset($_GET['lastCommentId'])) {
        $stmt->execute([$_GET['lastCommentId'], $_GET['postId']]);
    }
    else {
        $stmt->execute([$_GET['postId']]);
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