<?php
header('Content-Type: text/plain; charset=utf-8');
$q = $_GET['q'];

$source = file_get_contents('https://www.sclera.be/fr/picto/search?searchField='.$q);
$doc = new DOMDocument();
$doc->loadHTML($source);

$x = new DOMXPath($doc);

$elements = $x->query("//div/a/span/img");
$output=[];
if (!is_null($elements)) {
  foreach ($elements as $element) {
    $output[] = 'https://www.sclera.be'.$element->getAttribute("src");
  }
}

echo json_encode($output);
?>
