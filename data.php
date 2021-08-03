<!DOCTYPE html>
<?php
// *******************************************************
function arrayResult($result, $colTitles) {
	$nbRows = $result->num_rows;

	$nbCols=$result->field_count;
	if ($colTitles) {
		$titres = $result->fetch_fields();
		for($i = 0; $i < $nbCols; $i++) {
			$tab[0][$i] = $titres[$i]->name;
		}
		$nbRows++;
	}
	$i = ($colTitles)? 1: 0;
	for (; $i < $nbRows; $i++) {
		$row = $result->fetch_array(MYSQLI_NUM);
//echo $i, "  ", "***********************************  ";  // debug
		for ($j = 0; $j < $nbCols; $j++) {
			$donn = preg_replace('/<!--/','<--',$row[$j]);   // virer les comm. html
			$tab[$i][$j] = $donn;   // utf8_encode($donn);
//echo utf8_encode($donn), "  ";  // debug
		}
	}
	return($tab);
}
// ******************************************************
?>
<html lang="fr">
<head>
	<title>SIMPLES infos</title>
	<meta charset="UTF-8" />
<<<<<<< HEAD
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=yes">
=======
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1, shrink-to-fit=yes">
>>>>>>> sioux
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
	<!-- d3js
	<script src="https://d3js.org/d3.v6.min.js"></script>
	-->
</head>
<<<<<<< HEAD
<body style="margin-left:3%;margin-right:3%;user-select:none;pointer-events:none">
=======
<!--    -->
<body style="opacity: 0; margin-left: 3%; margin-right: 3%; user-select: none; pointer-events: none;">
>>>>>>> sioux
<br />
<div><img src="img/LUTINLOGO.jpg" /></div>
<h4 style="color: gray">&nbsp;Le FALC c'est simple</h4>
<h4	style="color: gray">&nbsp;avec&nbsp;&nbsp;&nbsp;<img src="img/lirec-black_BgLight74.png" /"></h4>
<?php
	require_once("connectMySQL.php");
	$base=connect();
	$query = 'SELECT COUNT(*) FROM Connection';
	$result = $base->query($query);
	$data = $result->fetch_array(MYSQLI_NUM);
	$nbVisTotal = $data[0];
//
	$query = "SELECT date, time, clientIP, version FROM Connection ORDER BY id DESC LIMIT 1";
	$result = $base->query($query);
	$data = $result->fetch_array(MYSQLI_NUM);

	echo "<div style='width:700px;position:relative;left:6px;'>";
	echo "<div>Dernière&nbsp;visite:</div>";
	echo "<strong>$data[0] à $data[1] GMT</strong>";
	echo "<small><div>IP: $data[2]</div><div>Browser signature: $data[3]</div></small>";
	echo "</div>";
	echo "<div id='nbVisTotal'>$nbVisTotal&nbsp;visites</div><br>";

// build table for graph 1
 	$query = "SELECT left(date,7), count(*) FROM Connection GROUP BY left(date,7)";
	$result = $base->query($query);
	$data1 = json_encode(arrayResult($result, 0));

// build table for graph 2
	$query = "SELECT date, count(*) FROM Connection GROUP BY date";
	$result = $base->query($query);
	$nbRows = $base->affected_rows;
	if ( $nbRows < 30 ) $firstRow = 0;
	else $firstRow = $nbRows - 30;
	$query = "SELECT date, count(*) FROM Connection GROUP BY date LIMIT $firstRow,$nbRows";
	$result = $base->query($query);
	$data2 = json_encode(arrayResult($result, 0));

//	build table for graph 3
	$data3 = [];

	$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'Chrome'";
	$result = $base->query($query);
	$data3[0] = ['Chrome', $result->fetch_array(MYSQLI_NUM)[0]];

	$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'Firefox'";
	$result = $base->query($query);
	$data3[1] = ['Firefox', $result->fetch_array(MYSQLI_NUM)[0]];

	$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'Edg'";
	$result = $base->query($query);
	$data3[2] = ['Edge', $result->fetch_array(MYSQLI_NUM)[0]];

	$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'MacIntel' AND version NOT RLIKE 'Edg' AND version NOT RLIKE 'Firefox' AND version NOT RLIKE 'Chrome'";
	$result = $base->query($query);
	$data3[3] = ['Safari', $result->fetch_array(MYSQLI_NUM)[0]];

	$data3 = json_encode($data3);

//	build table for graph 4
$data4 = [];

$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'Win32'";
$result = $base->query($query);
$data4[0] = ['Windows', $result->fetch_array(MYSQLI_NUM)[0]];

$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'MacIntel'";
$result = $base->query($query);
$data4[1] = ['MacOS', $result->fetch_array(MYSQLI_NUM)[0]];

<<<<<<< HEAD
$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'Linux'";
=======
$query = "SELECT count(*) FROM Connection WHERE version RLIKE 'Linux' AND version NOT RLIKE 'Android'";
>>>>>>> sioux
$result = $base->query($query);
$data4[2] = ['Linux', $result->fetch_array(MYSQLI_NUM)[0]];

$data4 = json_encode($data4);

echo "
<script> var nbVisTotal = $nbVisTotal; </script>
<!-- plot chart1 -->
<script> var data1 = $data1; </script>
<div id='chart1' style='height:400px; width:700px;'></div>
<!-- plot chart2 -->
<script> var data2 = $data2; </script>
<br /><br />
<div id='chart2' style='height:400px; width:700px;'></div>
<br /><br />
<!-- plot chart3 -->
<script> var data3 = $data3; </script>
<div id='chart3' style='height:400px; width:600px;'></div>
<br /><br />
<!-- plot chart4 -->
<script> var data4 = $data4; </script>
<div id='chart4' style='height:400px; width:600px;'></div>
<br /><br />";
?>
<!--                                                    -->
<!-- jqplot scripts -->
<script src="jqplot/jquery.jqplot.min.js"></script>
<script src="jqplot/jqplot.barRenderer.js"></script>
<script src="jqplot/jqplot.highlighter.js"></script>
<script src="jqplot/jqplot.cursor.js"></script>
<script src="jqplot/jqplot.pointLabels.js"></script>
<script src="jqplot/jqplot.logAxisRenderer.js"></script>
<script src="jqplot/jqplot.canvasTextRenderer.js"></script>
<script src="jqplot/jqplot.canvasAxisLabelRenderer.js"></script>
<script src="jqplot/jqplot.canvasAxisTickRenderer.js"></script>
<script src="jqplot/jqplot.dateAxisRenderer.js"></script>
<script src="jqplot/jqplot.categoryAxisRenderer.js"></script>
<script src="jqplot/jqplot.pieRenderer.js"></script>
<link rel="stylesheet" href="jqplot/jquery.jqplot.min.css" />
<!-- -->
<script src="data.js"></script>
</body>
<?$base.close();?>
</html>
<!--
select count(*) from Connection where version rlike 'Chrome';
select count(*) from Connection where version rlike 'Firefox';
select count(*) from Connection where version rlike 'Edg';
select count(*) from Connection where version rlike 'MacIntel' and version not rlike 'Edg' and version not rlike 'Firefox' and version not rlike 'Chrome';

select count(*) from Connection where version rlike 'Linux';
select count(*) from Connection where version rlike 'MacIntel';
select count(*) from Connection where version rlike 'Win32';
-->
