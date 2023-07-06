<?php
include(__DIR__ . "/../../session.php");

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) || empty($_POST['password'])) {
    die({'Incorrect Input.'});
}

$pdo = require(__DIR__ . "/../../database.php");

$sql = ""

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