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
header('Content-Type: text/html; charset=utf-8');
include('./lib/simple_html_dom.php');
$word = $_GET['word'];

$source = file_get_html('https://www.linternaute.fr/dictionnaire/fr/definition/'. $word .'/');
$types = array ();
$meanings = array ();
$object = array ();
try {
  foreach($source->find('section.dico_definition span.dico_title_2 em') as $e) {
    $types[] = trim(preg_split('/\s+, /', $e->plaintext)[1]);
  }
  foreach($source->find('section.dico_definition ul.dico_liste') as $e) {
    $definitions = array ();
    foreach($e->find('li div div.grid_last') as $el) {
      $def = $el->plaintext;
      //echo $def;
      $arr = preg_split('/\s{2,}/', $def);
      /*echo '<pre>';
      print_r($arr);
      echo '</pre>';*/
      $s = array ();
      for($i = 0; $i < count($arr); $i++) {
        if($arr[$i] == 'Synonymes :') {
          $s = preg_split('/,\s/', $arr[$i + 1]);
        }
      }
      $definitions[] = array('definition' => $arr[1], 'synonyms' => $s);
    }
    $meanings[] = $definitions;
  }
  for($i = 0; $i < count($types); $i++) {
    $object[] = array ('pos' => $types[$i], 'meanings' => $meanings[$i]);
  }
} catch (Exception $ex) {
  //echo 'Exception reçue : ', $ex->getMessage(), '\n';
}
echo json_encode($object);
?>
