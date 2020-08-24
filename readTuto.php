<?php
header('Content-Type: text/plain; charset=utf-8');
$myfile = fopen("tuto/tuto.smp", "r") or die("Impossible de lire le fichier tuto.smp!");
echo fread($myfile,filesize("tuto/tuto.smp"));
fclose($myfile);
?>
