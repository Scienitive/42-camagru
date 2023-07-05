<?php
include(__DIR__ . "/../../session.php");

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) || empty($_POST['uname']) || empty($_POST['password'])) {
    die('Incorrect Input.');
}

$hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$pdo = require(__DIR__ . "/../../database.php");

$sql = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$_POST['email'], $_POST['uname'], $_POST['password']]);
}
catch (PDOException $e) {
    if ($e->getCode() === "23000" && strpos($e->getMessage(), 'email') !== false) {
        die("Email already taken.");
    }
    else if ($e->getCode() === "23000" && strpos($e->getMessage(), "username") !== false) {
        die("Username already taken.");
    }
    else {
        die("SQL Error: " . $e->getMessage());
    }
}
$_SESSION['main-view'] = "email-verification";
exit;
?>