<?php
include(__DIR__ . "/../../models/session.php");

$session_variables = $_SESSION;
header('Content-Type: application/json');
echo json_encode($session_variables);
exit;
?>