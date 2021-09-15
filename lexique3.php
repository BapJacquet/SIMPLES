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
header("Access-Control-Allow-Origin: *");
function startsWith($haystack, $needle)
{
     $length = strlen($needle);
     return (substr($haystack, 0, $length) === $needle);
}
$file = fopen("Lexique382Small.csv","r");
$word = $_GET["word"];
$pos = $_GET["pos"];
$data = [];
while(! feof($file)){
  $array = fgetcsv($file);
  if(strcmp($array[0], $word) == 0 && (startsWith($array[3], $pos) || strcmp($array[3], $pos) == 0)){
    $data = ['word' => $array[0], 'pos' => $array[3], 'lemma' => $array[2], 'movies' => $array[6], 'books' => $array[7]];
    break;
  }
}
echo json_encode($data);
fclose($file);
?>
