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
