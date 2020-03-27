<?php
header('Content-Type: text/plain; charset=utf-8');

$q = isset($_GET['q']) ? $_GET['q'] : null;
if(!$q) {
  die ('{error:2, errorText: "Please, inform query"}');
}

$source = file_get_contents('https://www.sclera.be/fr/picto/search?searchField='.$q);

if($source === FALSE) {
  die ("{error:1, errorText: 'Cannot read remote file.'}");
}

try {
  $doc = new DOMDocument();
  @$doc->loadHTML($source);
  $x = new DOMXPath($doc);
  $elements = $x->query("//div/a/span/img");
  $output=[];
  if (!is_null($elements)) {
    foreach ($elements as $element) {
      $output[] = 'https://www.sclera.be'.$element->getAttribute("src");
    }
  }

  echo json_encode($output);
} catch (Throwable $ex) {
  echo "{error:2, errorText: \"Something went very wrong: ",$ex->getMessage(),"\"}";
}
?>
