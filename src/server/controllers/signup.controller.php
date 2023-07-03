<?php

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) || empty($_POST['uname']) || empty($_POST['password'])) {
    die('Incorrect Input.');
}

$hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);


print_r($_POST);
var_dump($hashed_password);
