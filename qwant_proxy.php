<?php
$q = isset($_GET['q']) ? $_GET['q'] : null;
if(!$q) {
  die ('Please, inform query');
}
$q = rawurlencode($q);
$count = isset($_GET['count']) ? $_GET['count'] : 10;
header ("Content-type: text/json");
readfile("https://api.qwant.com/api/search/images?count=".$count."&q=".$q."&t=images&safesearch=1&locale=fr_fr&uiv=4");
?>
