<?php
function connect()
{
	define("MYHOST","localhost");
	define("MYUSER","simples");
	define("MYPASS","lutins");
	define("MYBASE","simples");

	$idcomW = new mysqli(MYHOST,MYUSER,MYPASS,MYBASE);
	if (!$idcomW)
	{
	  echo "<script type=text/javascript>";
		echo "alert('Connexion mode Write Impossible à la base simples')</script>";
		exit();
	}
	$idcomW->query("SET sql_mode = 'ONLY_FULL_GROUP_BY'");
	$idcomW->set_charset('utf8');
	return $idcomW;
}
?>
