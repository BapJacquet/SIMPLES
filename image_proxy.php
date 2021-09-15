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
$url = isset($_GET['url']) ? $_GET['url'] : null;
if(!$url) {
  die ('Please, inform URL');
}
$url =  rawurlencode($url);
$url = str_replace("%2F", "/", $url);
$url = str_replace("%3A", ":", $url);
$url = str_replace("%3D", "=", $url);
$url = str_replace("%3F", "?", $url);
$url = str_replace("%26", "&", $url);
$imgInfo = getimagesize($url);
if(stripos($imgInfo['mime'], 'image/') === false) {
  die ('Invalid image file at '.$url);
}
header ("Content-type: " .$imgInfo['mime']);
readfile($url);
?>
