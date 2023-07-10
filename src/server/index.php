<?php include("./models/session.php"); ?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Camagru</title>
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
            integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
            crossorigin="anonymous"
        />
        <link rel="stylesheet" href="../public/css/style.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Niconne&display=swap" rel="stylesheet">
    </head>
    <body>
        <div class="vh-100 d-flex flex-column">
            <div id="header-section">
                <?php include('./views/headers/header.php'); ?>
            </div>
            <div id="main-section" class="d-flex flex-grow-1 align-items-center">
                <?php include('./views/mains/main.php'); ?>
            </div>
        </div>
        <script src="../public/js/router.js" type="module"></script>
    </body>
</html>
