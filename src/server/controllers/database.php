<?php

$host = "db";
$dbname = "camagru";
$username = "root";
$password = "123";

$dsn = "mysql:host=" . $host . ";dbname=" . $dbname;

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
}
catch (PDOException $e) {
    die("PDO Connection Failed: " . $e->getMessage());
}

return $pdo;