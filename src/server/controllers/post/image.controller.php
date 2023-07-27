<?php
try {
    // Base Image
    $baseImage = imagecreatefromstring(base64_decode($_POST['baseImage']));

    $baseWidth = imagesx($baseImage);
    $baseHeight = imagesy($baseImage);
    $baseNewHeight = $_POST['height'];
    $baseNewWidth = (int) ($baseWidth * ($baseNewHeight / $baseHeight));

    $mergedImage = imagecreatetruecolor($baseNewWidth, $baseNewHeight);

    imagealphablending($mergedImage, false);
    imagesavealpha($mergedImage, true);

    $resizedBaseImage = imagecreatetruecolor($baseNewWidth, $baseNewHeight);

    imagealphablending($resizedBaseImage, false);
    imagesavealpha($resizedBaseImage, true);

    imagecopyresampled($resizedBaseImage, $baseImage, 0, 0, 0, 0, $baseNewWidth, $baseNewHeight, $baseWidth, $baseHeight);

    imagecopy($mergedImage, $resizedBaseImage, 0, 0, 0, 0, $baseNewWidth, $baseNewHeight);
    imagealphablending($mergedImage, true);

    // Stickers
    $stickers = json_decode($_POST['stickerArray']);

    foreach ($stickers as $sticker) {
        $stickerImage = imagecreatefromstring(base64_decode($sticker->image));

        $stickerWidth = imagesx($stickerImage);
        $stickerHeight = imagesy($stickerImage);
        $stickerNewWidth = $sticker->width;
        $stickerNewHeight = $sticker->height;

        $resizedStickerImage = imagecreatetruecolor($stickerNewWidth, $stickerNewHeight);

        imagealphablending($resizedStickerImage, false);
        imagesavealpha($resizedStickerImage, true);

        imagecopyresampled($resizedStickerImage, $stickerImage, 0, 0, 0, 0, $stickerNewWidth, $stickerNewHeight, $stickerWidth, $stickerHeight);

        imagecopy($mergedImage, $resizedStickerImage, $sticker->x, $sticker->y, 0, 0, $stickerNewWidth, $stickerNewHeight);
    }

    $basePath = __DIR__ . '/../../../public/uploads/';
    $fileName = $_POST['userId'] . '.png';
    $index = 1;

    while (file_exists($basePath . $fileName)) {
        $fileName = $_POST['userId'] . '_' . $index . '.png';
        $index++;
    }

    header('Content-Type: image/png');
    imagepng($mergedImage, $basePath . $fileName);
    echo $fileName;
}
catch (Exception $e) {
    http_response_code(500); // 500 Internal Server Error
    echo "Error: " . $e->getMessage();
}
exit;
?>