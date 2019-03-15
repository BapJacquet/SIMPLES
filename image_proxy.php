<?php
$url = isset($_GET['url']) ? $_GET['url'] : null;
if(!$url) {
  die ('Please, inform URL');
}
$imgInfo = getimagesize($url);
if(stripos($imgInfo['mime'], 'image/') === false) {
  die ('Invalid image file');
}
header ("Content-type: " .$imgInfo['mime']);
readfile($url);
?>
