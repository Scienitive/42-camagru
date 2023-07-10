<?php
include(__DIR__ . "/../../models/session.php");

$new_main_view = $_POST['data'];

if ($new_main_view === "home" || $new_main_view === "login") {
    $new_main_view = isset($_SESSION['user-id']) ? "home" : "login";
}
else if ($new_main_view === "sign-up") {
    $new_main_view = isset($_SESSION['user-id']) ? "home" : "sign-up";
}

$_SESSION['main-view'] = $new_main_view;

echo $new_main_view;
exit;
?>