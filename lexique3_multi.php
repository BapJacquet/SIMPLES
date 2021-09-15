<!--
    This file is part of the LIREC program developped for the SIMPLES project.
    It was developped by Baptiste Jacquet and Sébastien Poitrenaud for the
    LUTIN-Userlab from 2018 to 2020.
    Copyright (C) 2018  Baptiste Jacquet & Sébastien Poitrenaud

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<?php
header('Content-Type: application/json');
// à virer en production
header("Access-Control-Allow-Origin: *");

session_start();
require_once("connectMySQL.php");
$base = connect();

$word = $_GET["word"];
//$word = utf8_decode($word);
$pos = $_GET["pos"];

$query = "SELECT `1_ortho` AS 'word', `4_cgram` AS 'pos', `3_lemme` AS 'lemma', `7_freqlemfilms2` AS 'movies', `8_freqlemlivres` AS 'books' FROM `Lexique3` WHERE `1_ortho` = '"
  . $word . "' AND `4_cgram` LIKE ('"
  . $pos . "%');";

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
?>
