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
header ("Content-type: text/plain");

$q = isset($_GET['q']) ? $_GET['q'] : null;
if(!$q) {
  die ('{error:2, errorText: "Please, inform query"}');
}
$q = rawurlencode($q);
$count = isset($_GET['count']) ? $_GET['count'] : 10;

$request = "https://api.qwant.com/api/search/images?count=".$count."&q=".$q."&t=images&safesearch=1&locale=fr_fr&uiv=4";
try {
  $json = file_get_contents($request);
  if($json === FALSE) {
    echo '{error:1, errorText: "Something went wrong while reading the remote file."}';
  }
  echo $json;
} catch (Exception $e) {
  echo $e;
}
?>
