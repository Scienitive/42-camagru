<?php

session_start();
if (!isset($_SESSION['main-view'])) {$_SESSION['main-view'] = "login";}

?>