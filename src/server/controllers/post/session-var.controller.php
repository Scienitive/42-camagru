<?php
include(__DIR__ . "/../../models/session.php");

$variables = json_decode($_POST['variables']);
$values = json_decode($_POST['values']);

for ($i = 0; $i < count($variables); $i++) {
    $_SESSION[$variables[$i]] = $values[$i];
}

exit;
?>