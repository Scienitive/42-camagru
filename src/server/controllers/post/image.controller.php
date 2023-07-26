<?php

$stickers = json_decode($_POST['stickerArray']);

$base_image = imagecreatefromstring(base64_decode($_POST['baseImage']));
$img = imagecreatefromstring(base64_decode($stickers[0]->image));

$baseWidth = imagesx($base_image);
$baseHeight = imagesy($base_image);
$baseNewWidth = $_POST['width'];
$baseNewHeight = (int) ($baseHeight * ($baseNewWidth / $baseWidth));

$secondWidth = imagesx($img);
$secondHeight = imagesy($img);
$secondNewWidth = $stickers[0]->width;
//$secondNewHeight = (int) ($secondHeight * ($secondNewWidth / $secondWidth));
$secondNewHeight = $stickers[0]->height;

$resizedBaseImage = imagecreatetruecolor($baseNewWidth, $baseNewHeight);
$resizedSecondImage = imagecreatetruecolor($secondNewWidth, $secondNewHeight);

imagealphablending($resizedSecondImage, false);
imagesavealpha($resizedSecondImage, true);

imagecopyresampled($resizedBaseImage, $base_image, 0, 0, 0, 0, $baseNewWidth, $baseNewHeight, $baseWidth, $baseHeight);
imagecopyresampled($resizedSecondImage, $img, 0, 0, 0, 0, $secondNewWidth, $secondNewHeight, $secondWidth, $secondHeight);

//$black = imagecolorallocate($resizedBaseImage, 0, 0, 0);
//imagecolortransparent($resizedBaseImage, $black);
imagecopy($resizedBaseImage, $resizedSecondImage, $stickers[0]->x, $stickers[0]->y, 0, 0, $secondNewWidth, $secondNewHeight);

//$dst_image = imagecreatetruecolor(imagesx($base_image), imagesy($base_image));

//imagecopy($dst_image, $base_image, 0, 0, 0, 0, imagesx($base_image), imagesy($base_image));
//imagecopy($dst_image, $img, 0, 0, 0, 0, imagesx($img), imagesy($img));
//imagecopyresampled($base_image, $img, 0, 0, $stickers[0]->x, $stickers[0]->y, $_POST['width'], $_POST['height'], $stickers[0]->width, $stickers[0]->height);

header('Content-Type: image/png');
//imagealphablending($resizedBaseImage, false); 
//imagesavealpha($resizedBaseImage,true);
imagepng($resizedBaseImage);

exit;
?>