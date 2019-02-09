<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

session_start();
require_once("connectMySQL.php");
$base = connect();

$word = $_GET["word"];
$pos = $_GET["pos"];

$query = "SELECT `1_ortho` AS 'word', `4_cgram` AS 'pos', `3_lemme` AS 'lemma', `7_freqlemfilms2` AS 'movies', `8_freqlemlivres` AS 'books' FROM `Lexique3` WHERE `1_ortho` = '"
  . $word . "' AND `4_cgram` LIKE ('%"
  . $pos . "');";

$result = $base->query($query);
$result = $result->fetch_array(MYSQLI_NUM);
echo json_encode($result);
?>
