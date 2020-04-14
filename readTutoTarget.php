<?php
header('Content-Type: text/plain; charset=utf-8');
$myfile = fopen("tuto_target.smp", "r") or die("Impossible de lire le fichier tuto_target.smp!");
echo fread($myfile,filesize("tuto_target.smp"));
fclose($myfile);
?>
