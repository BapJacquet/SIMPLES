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
require_once("connectMySQL.php");
$base=connect();
//
$date = date('Y-m-d');
$time = date('H:i:s');
$clientIP = $_SERVER["REMOTE_ADDR"];
$version = $_POST["version"];
$user = $_POST["user"];
//echo $version; exit;
$query = "INSERT INTO Connection (`user`, `clientIP`, `date`, `time`, `version`) VALUES ('$user', '$clientIP', '$date', '$time', '$version')";
$result = $base->query($query);
?>
