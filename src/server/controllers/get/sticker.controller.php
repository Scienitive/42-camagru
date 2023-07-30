<?php

$folderPath = __DIR__ . "/../../../public/media/stickers";
$pngFiles = array();
$files = scandir($folderPath);

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) === 'png') {
        $pngFiles[] = $file;
    }
}

header('Content-Type: application/json');
echo json_encode($pngFiles);
exit;
?>