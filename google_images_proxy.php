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
header('Content-Type: text/json; charset=utf-8');
/*include('./lib/simple_html_dom.php');
$q = $_GET["q"];

$source = file_get_html("https://google.com/search?q=".$q."&tbm=isch");
echo $source;*/
$q = rawurlencode($_GET["q"]);
$res = file_get_contents("https://www.google.com/search?q=".$q."&tbm=isch");
    if ($res === false) {
        die('error: ' . curl_error($res));
    }
    /*$d = new DOMDocument();
    @$d->loadHTML($res);*/
preg_match_all('/http\:\/\/t[123]\.gstatic\.com\/images\?q=tbn\:[^"]+/', $res, $matches);
echo "";
echo json_encode($matches);

    /*$output = array(
        'title' => '',
        'meta'  => ''
    );

    $x = new DOMXPath($d);

    $title = $x->query("//title");
    if ($title->length > 0) {
        $output['title'] = $title->item(0)->textContent;
    }

    $meta = $x->query("//meta[@name = 'description']");
    if ($meta->length > 0) {
        $output['meta'] = $meta->item(0)->getAttribute('content');
    }

    print_r($output);*/
?>
