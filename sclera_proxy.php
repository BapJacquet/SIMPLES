<?php
/*
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
*/
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
