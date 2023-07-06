<?php

if ($_SESSION['main-view'] === "login" || $_SESSION['main-view'] === "home") {
    include(__DIR__ . "/login.view.php");
}
else if ($_SESSION['main-view'] === "sign-up") {
    include(__DIR__ . "/signup.view.php");
}
else if ($_SESSION['main-view'] === "email-verification") {
    include(__DIR__ . "/signup.verification.view.php");
}
else if ($_SESSION['main-view'] === "404") {
    include(__DIR__ . "/404.view.php");
}
else if ($_SESSION['main-view'] === "403") {
    include(__DIR__ . "/403.view.php");
}

?>