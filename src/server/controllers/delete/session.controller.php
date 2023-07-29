<?php
if (isset($_GET['sessionId']) && $_GET['sessionId'] !== 'null') {
    session_id($_GET['sessionId']);
}
include(__DIR__ . "/../../models/session.php");

session_destroy();

exit;
?>