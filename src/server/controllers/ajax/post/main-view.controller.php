<?php
include(__DIR__ . "/../../session.php");

$new_main_view = $_POST['data'];
if ($new_main_view === "home") {
    $new_main_view = "login";
}
$_SESSION['main-view'] = $new_main_view;

echo $new_main_view;
exit;
?>