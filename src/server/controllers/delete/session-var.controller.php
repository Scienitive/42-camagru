<?php
include(__DIR__ . "/../../models/session.php");

$variables = json_decode($_GET['variables']);

foreach ($variables as $variable) {
    unset($_SESSION[$variable]);
}

exit;
?>