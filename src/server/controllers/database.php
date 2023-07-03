<?php

$host = "db";
$dbname = "camagru";
$username = "root";
$password = "123";

$mysqli = new mysqli($host, $username, $password, $dbname, 3306);

if ($mysqli->connect_errno) {
    die('Connection Error: ' . $mysqli->connect_error);
}

return $mysqli;