<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head lang="<?php echo $str_language; ?>" xml:lang="<?php echo $str_language; ?>">
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
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


  <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>

	<!-- ====== Bootstrap ====== -->

	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
  <!-- Popper -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>

  <!-- <link rel="stylesheet" type="text/css" href="main.css"/> -->

</head>

<body style="visibility:hidden;">


	<!--	<div class="box"> -->

			<div id="header">
				<img src="SimpLES.png" id="logo" alt="SIMPLES Logo" width="250" height="49" />
			</div>
<div id="conted" contenteditable="true">hello</div>

			<div class="dropdown">
<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
Dropdown button
</button>
<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
<a class="dropdown-item" href="#">Action</a>
<a class="dropdown-item" href="#">Another action</a>
<a class="dropdown-item" href="#">Something else here</a>
</div>
		</div>


			<div class="input-group" style="width:300px">

				 <select class="custom-select" aria-label="Example select with button addon">
					<option selected>Choose...</option>
					<option  value="2">Chrome</option>
					<option  value="2">Two</option>
					<option  value="3">Three</option>
				</select>
				<select title="Select your spell" class="selectpicker">
				  <option>Select...</option>
				  <option data-content="favicon.png">Eye of Medusa</option>
				  <option data-icon="glyphicon glyphicon-fire" data-subtext="area damage">Rain of Fire</option>
				</select>
			</div>


			<div id="content">
			<div id="simp-container">

				<table class="table">

					<tbody>
						<tr>
							<td width="200px">
								<div id="td-test">


								</div>
							</td>
						</tr>
						<tr>
							<td>coucou</td>
							<td>
								<div id="page-container">
									<div id="page">
										<!-- Create the editor container -->
										<div id="editor">
				<p>Coucou c'est nous!</p><p><br></p><h1><span class="ql-size-small">Et</span> <span style="color: rgb(230, 0, 0); background-color: rgb(255, 255, 0);">vlan</span><span class="ql-size-large">!</span> plein de <span class="ql-size-large">gros</span> <strong class="ql-size-huge">gras</strong></h1><p><br></p><p><br></p>
										</div>
									</div>
								</div>
							</td>
							<td>coucou</td>
						</tr>
					</tbody>
				</table>
			</div>

			</div>


			<div>
				<button onclick="logHtmlContent()">s HTML</button>
			</div>
			<br/>

  <script src="index.js"></script>
	<!-- Initialize Quill editor -->
	<!-- <script type="text/javascript" src="editor.js"></script> -->

</body>
</html>
