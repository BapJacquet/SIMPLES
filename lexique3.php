<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
function startsWith($haystack, $needle)
{
     $length = strlen($needle);
     return (substr($haystack, 0, $length) === $needle);
}
// 
$file = fopen("Lexique382Small.csv","r");
$word = $_GET["word"];
$pos = $_GET["pos"];
$data = [];
while(! feof($file)) {
  $array = fgetcsv($file);
  if(strcmp($array[0], $word) == 0 && (startsWith($array[3], $pos) || strcmp($array[3], $pos) == 0)){
    $data = ['word' => $array[0], 'pos' => $array[3], 'lemma' => $array[2], 'movies' => $array[6], 'books' => $array[7]];
    break;
  }
}
echo json_encode($data);
fclose($file);
?>
