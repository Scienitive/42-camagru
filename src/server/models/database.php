<?php

$host = $_ENV['DB_HOST'];
$dbname = $_ENV['DB_NAME'];;
$username = "root";
$password = $_ENV['DB_PASS'];;

$dsn = "mysql:host=" . $host . ";dbname=" . $dbname;

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    die("PDO Connection Failed: " . $e->getMessage());
}

return $pdo;