<?php
header ("Content-type: text/json");

$q = isset($_GET['q']) ? $_GET['q'] : null;
if(!$q) {
  die ('{error:2, errorText: "Please, inform query"}');
}
$q = rawurlencode($q);
$count = isset($_GET['count']) ? $_GET['count'] : 10;

$request = "https://api.qwant.com/api/search/images?count=".$count."&q=".$q."&t=images&safesearch=1&locale=fr_fr&uiv=4";
try {
  $json = file_get_contents($request);
  if($json === FALSE) {
    echo '{error:1, errorText: "Something went wrong while reading the remote file."}';
  }
  echo $json;
} catch (Exception $e) {
  echo $e;
}
?>
