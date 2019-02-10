<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

session_start();
require_once("connectMySQL.php");
$base = connect();

$word = $_GET["word"];
//$word = utf8_decode($word);
$pos = $_GET["pos"];

$query = "SELECT `1_ortho` AS 'word', `4_cgram` AS 'pos', `3_lemme` AS 'lemma', `7_freqlemfilms2` AS 'movies', `8_freqlemlivres` AS 'books' FROM `Lexique3` WHERE `1_ortho` = '"
  . $word . "' AND `4_cgram` LIKE ('%"
  . $pos . "');";

///////
  function jsonResult($requete, $idcom) {
  $result = $idcom->query($requete);
  $debut = true;
  $nbColonnes=$result->field_count;

  $json =  "[";
  if ($result->num_rows){
  $colonnes = $result->fetch_fields();
  while ($ligne = $result->fetch_array(MYSQLI_NUM)) {
  	if ($debut){
  		$json = $json . "{";
  		$debut = false;
  	} else {
  		$json = $json . ",{";
  	}
  	for($j = 0; $j < $nbColonnes; $j++){
  		$colonne = $colonnes[$j]->name;

  	//	$json = $json . "\"".utf8_encode($colonne)."\":\"". utf8_encode($ligne[$j])."\"";
      $json = $json . "\"".$colonne."\":\"". $ligne[$j]."\"";

  		if ($j != $nbColonnes-1)	$json = $json .  ",";	//condition virgule dernière colonne
  	}
  	$json = $json .  "}";
  }
  }
  $json = $json .  "]";
  return($json);
  }
////////

$result = jsonResult($query,$base);
echo $result;
/*
echo "\n";
echo $base->error; echo "\n";
echo json_last_error_msg (); echo "\n";
echo utf8_encode($word); echo "\n";
//echo utf8_décode('format\u00e9'); "\n";
echo 'coucou';
*/
?>
