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
