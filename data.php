<!DOCTYPE html>
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
<html lang="fr">
<head>
	<title>SIMPLES infos</title>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon" />
	<!-- ====== Bootstrap ====== -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
	<!-- jQuery library -->
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
  <!-- Popper -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
</head>
<body style="margin-left:3%;margin-right:3%">
<br />
<div><img src="img/LUTINLOGO.jpg" /></div>
<h4 style="color: gray">Le FALC c'est simple</h4>
<h4	style="color: gray">&nbsp;avec&nbsp;&nbsp;&nbsp;<img src="img/lirec-black_BgLight74.png" /"></h4>
<form role="form" action="read_q_access.php">
<!-- <br />
<button type="submit" class="btn btn-success"> Téléchager les questionnaires</button>
<br /><br /> -->
<?php
	require_once("connectMySQL.php");
	$base=connect();

// enregistrements
/*
	$query = "SELECT COUNT(*) FROM Quest";
	$result = $base->query($query);
	$data = $result->fetch_array(MYSQLI_NUM);
	echo "<i>Nombre de questionnaires enregistrés: </i><strong style='font-size:1.3em'>", $data[0], "</strong><br />";
	echo "<i>Dernier questionnaire:</i><br />";

	$query = "SELECT _date, _time, `_client-IP`, profession, age, _version FROM Quest ORDER BY id DESC LIMIT 1";
	$result = $base->query($query);
	$data = $result->fetch_array(MYSQLI_NUM);
	echo '<strong>', $data[0], '&nbsp;&nbsp;&nbsp;', $data[1], '</strong>', "<br />", $data[2], "<br />", "Profession: ", $data[3], "<br />", "Age: ", $data[4], "<br />", $data[5], "<br /><br />";
*/

// connections
	$query = "SELECT COUNT(*) FROM Connection";
	$result = $base->query($query);
	$data = $result->fetch_array(MYSQLI_NUM);
	echo "<i>Nombre de visites: </i><strong style='font-size:1.3em'>", $data[0], "</strong><br />";
	echo "<i>Dernière visite:</i><br />";

	$query = "SELECT date, time, clientIP, version FROM Connection ORDER BY id DESC LIMIT 1";
	$result = $base->query($query);
	$data = $result->fetch_array(MYSQLI_NUM);
	echo '<strong>', $data[0], '&nbsp;&nbsp;&nbsp;', $data[1], '</strong>', "<br />", $data[2], "<br />", $data[3], "<br /><br />";
//
	echo "<script>";
	echo "setTimeout(function() {location.href = 'data.php'},60000);";
	echo "</script>";
?>
<br />
<!--
<i style="color:#AAA; background:white; border:0px">Sébastien Poitrenaud pour LutinUserlab</i>
-->
</form>
</body>
</html>
