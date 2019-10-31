<?php
header('Content-Type: application/pdf');
require '../vendor/autoload.php';

use Dompdf\Dompdf;

$html = $_POST["html"];
$dompdf = new Dompdf();
$dompdf->set_option('isHtml5ParserEnabled', true);
$dompdf->loadHtml($html);
$dompdf->render();
$dompdf->stream();
//echo 'Réussi!';
?>
