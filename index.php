<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head lang="<?php echo $str_language; ?>" xml:lang="<?php echo $str_language; ?>">
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title>SimpLEs</title>

  <!-- === HTML to PDF ===-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.debug.js" integrity="sha384-NaWTHo/8YCBYJ59830LTz/P4aQZK1sS0SneOgAvhsIl3zBu8r9RevNg5lHCHAuQ/" crossorigin="anonymous"></script>

  <!-- ======  RTE  ====== -->
	<script language="JavaScript" type="text/javascript" src="../cbrte/html2xhtml.min.js"></script>
	<script language="JavaScript" type="text/javascript" src="../cbrte/richtext.js"></script>

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

  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>

	<!-- ====== Bootstrap ====== -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <!-- Popper -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

  <link rel="stylesheet" type="text/css" href="main.css"/>
</head>

<body>
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

	<!-- Initialize analyzer editor -->
	<script type="text/javascript" src="editor.js"></script>
	<script type="text/javascript" src="analyzer.js"></script>
	<script>
		var coll = document.getElementsByClassName("hcollapsible");
		var i;

		for (i = 0; i < coll.length; i++) {
		  coll[i].addEventListener("click", function() {
		    this.classList.toggle("active");
		    var content = this.nextElementSibling;
		    if (content.style.display === "block") {
		      content.style.display = "none";
		    } else {
		      content.style.display = "block";
		    }
		  });
		}
	</script>
	<script>
		var coll = document.getElementsByClassName("collapsible");
		var i;

		for (i = 0; i < coll.length; i++) {
		  coll[i].addEventListener("click", function() {
		    this.classList.toggle("active");
		    var content = this.nextElementSibling;
		    if (content.style.display === "block") {
		      content.style.display = "none";
		    } else {
		      content.style.display = "block";
		    }
		  });
		}
	</script>
</body>
</html>
