<?php

if ($_SESSION['main-view'] === "login" || $_SESSION['main-view'] === "home") {
    include(__DIR__ . '/visitor.login.header.view.php');
}
else if ($_SESSION['main-view'] === "sign-up" || $_SESSION['main-view'] === "email-verification" || $_SESSION['main-view'] === "email-verify") {
    include(__DIR__ . '/visitor.signup.header.view.php');
}

?>