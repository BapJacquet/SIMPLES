<!DOCTYPE html>
<html lang="fr" xml:lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html charset=utf-8" />
<meta name="viewport" content="width=device-width,  initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>SimpLEs</title>

  <!-- === HTML to PDF ===-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js" integrity="sha384-NaWTHo/8YCBYJ59830LTz/P4aQZK1sS0SneOgAvhsIl3zBu8r9RevNg5lHCHAuQ/" crossorigin="anonymous"></script>

	<!-- ====== Quill ====== -->

	<!-- Include stylesheet -->
	<!--link rel="stylesheet" href="https://cdn.quilljs.com/1.3.6/quill.core.css"-->
	<link href="quill.snow.css" rel="stylesheet">

	<!-- Include the Quill library -->
	<script src="quill.js"></script>

	<!-- Include the Image Drop Module for Quill -->
	<script src="image-drop.min.js"></script>

	<!-- Include the Image Resize Module for Quill -->
	<script src="image-resize.min.js"></script>

	<!-- ====== Bootstrap ====== -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
	<!-- jQuery library -->
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
  <!-- Popper -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>

  <link rel="stylesheet" type="text/css" href="main.css"/>
</head>

<body style="visibility:hidden;">
	<div>

		<div class="box">

			<div id="header">
				<img src="SimpLES.png" id="logo" alt="SIMPLES Logo" height="49" />
			</div>

			<div>
				<div id="menu">
				</div>
				<!-- Create toolbar container -->
				<div class="hbox">
					<span id="toolbar">
						<img src="outilsEdit.png">
					</span>
					<span id="analyze">
						<button id="pdf-button" type="button" class="toolbar-button btn btn-primary">Exporter PDF</button>
					</span>
					<span id="analyze">
						<button id="verify-button" type="button" class="toolbar-button btn btn-success">Verifier</button>
					</span>
				</div>
			</div>

			<div class="hbox">
				<div id="content">
					<div id="page-container">
						<div id="page">
							<!-- Create the editor container -->
							<div id="editor">
							  <p>D'un point de vue méthodologique, ils apportent une objectivité nécessaire à la validation scientifique en traitement automatique du langage naturel. L'information n'est plus empirique, elle est vérifiée par le corpus. Il est donc possible de s'appuyer sur des corpus (à condition qu'ils soient bien formés) pour formuler et vérifier des hypothèses scientifiques.</p>
							</div>
						</div>
					</div>
				</div>
				<button class="hcollapsible"><div class="rotate">Analyse</div></button>
				<div class="hcollapsible-content">
					<div id="stanford-connection"></div>
					<div class="alert alert-info" role="alert" id="lexique3-connection">
						<div>Lexique3 : </div>
						<div class="progress">
							<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="70"
							aria-valuemin="0" aria-valuemax="100" id="lexique3-progress" style="width:70%">
								70%
							</div>
						</div>
					</div>
					<div class="score">90</div>
  				<p>Résultats de l'analyze :</p>
					<div id="analysis-content"></div>
					<button class="collapsible">Règles prioritaires</button>
					<div class="collapsible-content">
	  				<p>Résultats de l'analyze</p>
					</div>
					<button class="collapsible">Règles très importantes</button>
					<div class="collapsible-content">
	  				<p>Résultats de l'analyze</p>
					</div>
					<button class="collapsible">Règles importantes</button>
					<div class="collapsible-content">
	  				<p>Résultats de l'analyze</p>
					</div>
				</div>
				<!--div id="analysis-container">
					<h1>90</h1>
					<p>Hello World</p>
				</div-->
			</div>

				<!--button onclick="logHtmlContent()">s HTML</button-->
			<div class="slider-container">
				<input type="range" step="0.1" min="0.1" max="5" value="1" class="slider" id="zoom-range"/>
			</div>
		</div>

	</div>


	<!-- Initialize Quill editor -->
	<script type="text/javascript" src="editor.js"></script>

	<!-- jQuery ready -->
	<script src="index.js"></script>
</body>
</html>
