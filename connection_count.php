<?php
require_once("inc/connectMySqlW.php");
$base=connect();
//
$date = date('Y-m-d');
$time = date('H:i:s');
$clientIP = $_SERVER["REMOTE_ADDR"];
$version = $_POST["version"];
//echo $version; exit;
//
$query = "INSERT INTO Connection (`clientIP`, `date`, `time`, `version`) VALUES ('$clientIP', '$date', '$time', '$version')";
$result = $base->query($query);
if (!$result) {
  $err = $idcom->error;
  echo $err, " : ";
  echo $query;
}
else echo mysqli_insert_id($base);  # retourne l'index de la connection
?>
