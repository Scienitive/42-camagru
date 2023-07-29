<?php
if (isset($_GET['sessionId'])) {
    session_id($_GET['sessionId']);
}
include(__DIR__ . "/../../models/session.php");

session_destroy();

exit;
?>