<?php
$url = isset($_GET['url']) ? $_GET['url'] : null;
if(!$url) {
  die ('Please, inform URL');
}
$url =  rawurlencode($url);
$url = str_replace("%2F", "/", $url);
$url = str_replace("%3A", ":", $url);
$url = str_replace("%3D", "=", $url);
$url = str_replace("%3F", "?", $url);
$url = str_replace("%26", "&", $url);
$imgInfo = getimagesize($url);
if(stripos($imgInfo['mime'], 'image/') === false) {
  die ('Invalid image file at '.$url);
}
header ("Content-type: " .$imgInfo['mime']);
readfile($url);
?>
