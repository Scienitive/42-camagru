<?php

$pdo = require(__DIR__ . "/../../models/database.php");

// $sql = "UPDATE users SET email = ?, SET username = ?, SET password = ?, SET email_notification = ? WHERE id = ?";
$vars = [];
$sql = "UPDATE users ";
if (isset($_POST['email'])) {
    if (count($vars) !== 0) {$sql .= ", ";}
    else {$sql .= "SET ";}
    $sql .= "email = ?";
    $vars[] = $_POST['email'];
}
if (isset($_POST['username'])) {
    if (count($vars) !== 0) {$sql .= ", ";}
    else {$sql .= "SET ";}
    $sql .= "username = ?";
    $vars[] = $_POST['username'];
}
if (isset($_POST['password'])) {
    if (count($vars) !== 0) {$sql .= ", ";}
    else {$sql .= "SET ";}
    $sql .= "password = ?";
    $hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $vars[] = $hashed_password;
}
if (isset($_POST['emailNotification'])) {
    if (count($vars) !== 0) {$sql .= ", ";}
    else {$sql .= "SET ";}
    $sql .= "email_notification = ?";
    $vars[] = $_POST['emailNotification'];
}
$sql .= " WHERE id = ?";

try {
    $stmt = $pdo->prepare($sql);
    for ($i = 0; $i < count($vars); $i++) {
        $stmt->bindParam($i + 1, $vars[$i]);
    }
    $stmt->bindParam(count($vars) + 1, $_POST['id']);
    $stmt->execute();
}
catch (PDOException $e) {
    if ($e->getCode() === "23000" && strpos($e->getMessage(), 'email') !== false) {
        http_response_code(409); // 409 Conflict
        die("Email already taken.");
    }
    else if ($e->getCode() === "23000" && strpos($e->getMessage(), "username") !== false) {
        http_response_code(409); // 409 Conflict
        die("Username already taken.");
    }
    else {
        http_response_code(500); // 500 Internal Server Error
        die("SQL Error: " . $e->getMessage());
    }
}
exit;
?>