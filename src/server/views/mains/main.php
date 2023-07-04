<?php

if (isset($_SESSION['email-verification']) && $_SESSION['email-verification'] === true) {
    include('./views/mains/signup.verification.view.php');
}
else {
    include('./views/mains/signup.view.php');
}

?>