<?php
include(__DIR__ . "/../../models/session.php");

$elements = [];

ob_start();
include(__DIR__ . "/../../views/headers/header.php");
$elements[] = ob_get_clean();
ob_start();
include(__DIR__ . "/../../views/mains/main.php");
$elements[] = ob_get_clean();

header('Content-Type: application/json');
echo json_encode($elements);
exit;
?>