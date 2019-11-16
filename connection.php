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
if ( $user == 'lutins' ) $user = 'ok';
else $user ='unknown';

$query = "INSERT INTO Connection (`user`, `clientIP`, `date`, `time`, `version`) VALUES ('$user', '$clientIP', '$date', '$time', '$version')";
$result = $base->query($query);

if (!$result) {
  $err = $idcom->error;
  echo $err, " : ";
  echo $query;
}
else {
  if ( $user == 'ok' ) exit; // echo 'http://sioux.univ-paris8.fr/simples/index.php';
  else echo 'error';
}
/*
session_start();
if (isset($_SESSION['user'] && $_SESSION['user'] == 'lutins') {
  echo 'http://sioux.univ-paris8.fr/simples/index.php';
}
else echo 'error';
*/
?>
