<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head lang="<?php echo $str_language; ?>" xml:lang="<?php echo $str_language; ?>">
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title>MAMP PRO</title>
	<link rel="stylesheet" type="text/css" href="main.css"/>


	<!-- ====== Quill ====== -->
	<!-- Include stylesheet -->
	<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
	<!-- Include the Quill library -->
	<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>

	<!-- ====== Bootstrap ====== -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<!-- jQuery library -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>

<body>
	<div>

		<div class="box">

			<div id="header">
				<img src="SimpLES.png" id="logo" alt="SIMPLES Logo" width="250" height="49" />
			</div>

			<div>
				<div id="menu">
				</div>
				<!-- Create toolbar container -->
				<div id="toolbar">
				  <!-- Add font size dropdown -->
				  <select class="ql-size">
				    <option value="small">Petit</option>
				    <!-- Note a missing, thus falsy value, is used to reset to default -->
				    <option selected>Normal</option>
				    <option value="large">Grand</option>
				    <option value="huge">Très grand</option>
				  </select>
				  <!-- Add format buttons -->
				  <button class="ql-bold"><span style="font-weight:bold; font-family:'Cambria'">G</span></button>
				  <button class="ql-italic"><span style="font-style:italic; font-family:'Cambria'">I</span></button>
				  <button class="ql-underline"><span style="text-decoration: underline; font-family:'Cambria'">U</span></button>
				  <button class="ql-strike"><span style="text-decoration: line-through; font-family:'Cambria'">S</span></button>
				  <!-- Add subscript and superscript buttons -->
				  <button class="ql-script" value="sub"></button>
				  <button class="ql-script" value="super"></button>
				  <!-- Color button -->
				  <select class="ql-color"></select>
					<!-- Text Alignment buttons -->
					<button class="ql-align"><span class="glyphicon glyphicon-align-left"></span></button>
					<button class="ql-align" value="center"><span class="glyphicon glyphicon-align-center"></span></button>
					<button class="ql-align" value="right"><span class="glyphicon glyphicon-align-right"></span></button>
					<button class="ql-align" value="justiy"><span class="glyphicon glyphicon-align-justify"></span></button>
				</div>
			</div>

			<div id="content">
				<div id="page-container">
					<div id="page">
						<!-- Create the editor container -->
						<div id="editor">
						  <p>Hello World!</p>
						  <p>Some initial <strong>bold</strong> text</p>
						  <p><br></p>
						</div>
					</div>
				</div>
			</div>

			<div>
				<button onclick="logHtmlContent()">s HTML</button>
			</div>
		</div>

	</div>

	<!-- Initialize Quill editor -->
	<script type="text/javascript" src="editor.js"></script>

</body>
</html>
