<?php

if ($_SESSION['main-view'] === "login") {
    include(__DIR__ . '/visitor.login.header.view.php');
}
else if ($_SESSION['main-view'] === "sign-up" || $_SESSION['main-view'] === "email-verification") {
    include(__DIR__ . '/visitor.signup.header.view.php');
}

?>