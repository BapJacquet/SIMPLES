<!DOCTYPE html>
<html lang="fr" xml:lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html charset=utf-8" />
<meta name="viewport" content="width=device-width,  initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>SimpLEs</title>

  <!-- === HTML to PDF ===-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js" integrity="sha384-NaWTHo/8YCBYJ59830LTz/P4aQZK1sS0SneOgAvhsIl3zBu8r9RevNg5lHCHAuQ/" crossorigin="anonymous"></script>

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
	<link rel="stylesheet" type="text/css" href="editor.css"/>
</head>

<!-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ -->
<body style="visibility:hidden;">
<!--
	<div style=" z-index: 100; position: fixed; top: 50px; left: 20px;">graisse   taille</div>
-->

	<div>
		<div class="box">
			<div id="header">
				<!-- <img src="SimpLES_black.png" id="logo" alt="SIMPLES Logo" height="49" /> -->
			</div>
			<!-- 												M E N U B A R -->
			<div id="main-menubar">
				<div id="file-menu" class="dropdown main-menu">
					<!-- class="btn btn-secondary dropdown-toggle" -->
					<button class="btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Fichier</button>
					<div class="dropdown-menu" aria-labelledby= "dropdownMenuButton">
						<a class="dropdown-item" href="#">Action</a>
						<a class="dropdown-item" href="#">Another action</a>
						<a class="dropdown-item" href="#">Something else here</a>
					</div>
				</div>
				<div id="resource-menu" class="dropdown main-menu">
					<button class="btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Ressource</button>
					<div class="dropdown-menu" aria-labelledby= "dropdownMenuButton">
						<a class="dropdown-item" href="#">Action</a>
						<a class="dropdown-item" href="#">Another action</a>
						<a class="dropdown-item" href="#">Something else here</a>
					</div>
				</div>
				<!-- LOGO -->
				<div  id="logo">
					<img src="SimpLES_white.png" alt="SIMPLES Logo" width="130" height="45" />
				</div>
			</div>
				<!--           			T O O L B A R -->
				<div id="toolbar">
					<div id="toolbarlist">

						<div id="bold">
							<div id="bold-caption" class="caption">gras</div>
							<div class="tool bold-true">a</div>
							<div  id="bold-cursor" class="tool-cursor">
								<img src="arrow-u-black.png" />
							</div>
						</div>

						<div id="size">
							<div id="size-caption" class="caption">taille</div>
							<div class="tool size-small">a</div>
							<div class="tool size-medium">a</div>
							<div class="tool size-large">a</div>
							<div  id="size-cursor" class="tool-cursor">
								<img src="arrow-u-black.png" />
							</div>
						</div>

						<div id="color">
							<div id="color-caption" class="caption">couleur</div>
							<div class="tool color-black">a</div>
							<div class="tool color-red">a</div>
							<div class="tool color-blue">a</div>
							<div class="tool color-green">a</div>
							<div class="tool color-custom">?</div>
							<div  id="color-cursor" class="tool-cursor">
								<img src="arrow-u-black.png" />
							</div>
							<div id="tool-limit">|</div>
						</div>

						<div id="title">
							<div id="title-caption" class="caption">titre</div>
							<div class="tool title-h1">T</div>
							<div class="tool title-h2">T</div>
							<div class="tool title-h3">T</div>
							<div class="tool title-h4">T</div>
							<div  id="title-cursor" class="tool-cursor">
								<img src="arrow-u-black.png" />
							</div>
						</div>

						<div id="border">
							<div id="border-caption" class="caption">cadre</div>
							<div class="tool-border-bullet border-true"><img src="borderTrue.png" /></div>
							<div  id="border-cursor" class="tool-cursor">
								<img src="arrow-u-black.png" />
							</div>
						</div>

						<div id="bullet">
							<div id="bullet-caption" class="caption">puce</div>
							<div class="tool-border-bullet bullet-true"><img src="bulletTrue.png" /></div>
							<div  id="bullet-cursor" class="tool-cursor">
								<img src="arrow-u-black.png" />
							</div>
						</div>

						<div></div>
					</div>

					<!-- 							VERIFY BUTTON    -->
					<span id="analyze" class="simples-span" >
						<button id="verify-button" type="button" class="simples-button  btn-info">&nbsp;</button>
					</span>

				</div>

				<!-- <div >  class="hbox" ???? -->


					<!--
					<span id="analyze">
						<button id="pdf-button" type="button" class="toolbar-button btn btn-primary">Exporter PDF</button>
					</span>

					<span id="analyze">
						<button id="verify-button" type="button" class="toolbar-button btn btn-success">Verifier</button>
					</span>
				</div>
			</div>
		-->

			<div class="hbox">
				<div id="content">
					<div id="page-container">
						<div id="page">
							<!-- Create the editor container -->
							<div id="editor"></div>
						</div>
					</div>
				</div>
				<button class="hcollapsible"><div class="rotate">Montrer&nbsp;l'analyse</div></button>
				<div class="hcollapsible-content">
					<div id="stanford-connection"></div>
					<div class="alert alert-light" role="alert" id="lexique3-connection">
						<div>Lexique3 : </div>
						<div class="progress">
							<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0"
							aria-valuemin="0" aria-valuemax="100" id="lexique3-progress" style="width:0%">
								0%
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
	<!--	</div> ???? -->


	<!-- Initialize Simples Editor -->
	<script type="text/javascript" src="editor.js"></script>
	<script type="text/javascript" src="analyzer.js"></script>
	<script type="text/javascript" src="utils.js"></script>

	<!-- jQuery ready -->
	<script src="index.js"></script>
</body>
</html>
