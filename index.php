<!DOCTYPE html>
<html lang="fr" xml:lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html charset=utf-8" />
	<meta name="viewport" content="width=device-width,  initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>SimpLEs</title>

  <!-- === HTML to PDF ===-->
	<script src="./html2canvas.min.js"></script>
  <script src="https://unpkg.com/jspdf@latest/dist/jspdf.min.js"></script>

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
	<div>
		<div class="box">
			<div id="header">
				<!-- <img src="SimpLES_black.png" id="logo" alt="SIMPLES Logo" height="49" /> -->
			</div>
			<!-- 												M E N U B A R -->
			<div id="main-menubar">
				<div class="btn-group" role="group">
					<div class="btn-group" role="group">
				    <button id="btnFichier" type="button" class="main-menu btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				      Fichier
				    </button>
				    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
				      <a id="newFile" class="dropdown-item" href="#">Nouveau...</a>
				      <a id="newModelFile" class="dropdown-item" href="#">Nouveau sur un modèle...</a>
							<div class="dropdown-divider"></div>
							<a id="openFile" class="read-file dropdown-item" href="#">Ouvrir...</a>
							<a id="saveFile" class="write-file dropdown-item" href="#">Enregistrer...</a>
							<div class="dropdown-divider"></div>
							<a id="importFile" class="read-file dropdown-item" href="#">Importer...</a>
							<a id="exportFilePDF" class="write-file dropdown-item" href="#">Exporter au format PDF...</a>
							<a id="exportFileHTML" class="write-file dropdown-item" href="#">Exporter au format HTML...</a>
				    </div>
				  </div>
					<div class="btn-group" role="group">
				    <button id="btnFichier" type="button" class="main-menu btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				      Edition
				    </button>
				    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
							<a id="cutItem" class="dropdown-item" href="#">Couper</a>
				      <a id="copyItem" class="dropdown-item" href="#">Copier</a>
							<a id="pasteItem" class="dropdown-item" href="#">Coller</a>
				    </div>
				  </div>
					<div class="btn-group" role="group">
				    <button id="btnResources" type="button" class="main-menu btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				      Resources
				    </button>
				    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
				      <a class="dropdown-item read-file" href="#">Importer un dictionnaire...</a>
				      <a class="dropdown-item" href="#">Exporter un dictonnaire...</a>
							<div class="dropdown-divider"></div>
							<a class="dropdown-item read-file" href="#">Importer un lexique...</a>
							<a class="dropdown-item" href="#">Exporter un lexique...</a>
				    </div>
				  </div>
				</div>

				<!-- hidden input for file dialog -->
				<input type="file" id="openFileInput" style="display:none;">
				<!-- fin main-menubar -->
			</div>


			<!--           							T O O L B A R -->
			<div id="toolbar">
				<div id="toolbarlist">

					<div id="bold">
						<div id="bold-caption" class="caption">gras</div>
						<div class="tool bold-false">a</div>
						<div class="tool bold-true">a</div>
						<div  id="bold-cursor" class="tool-cursor">
							<img src="arrow-u-black.png" />
						</div>
					</div>

					<div id="size">
						<div id="size-caption" class="caption">taille</div>
						<div class="tool size-s1">a</div>
						<div class="tool size-s2">a</div>
						<div class="tool size-s3">a</div>
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
						<div id="tool-limit-color" class="tool-limit">|</div>
					</div>

					<div id="title">
						<div id="title-caption" class="caption">titre</div>
						<div class="tool title-h1">T</div>
						<div class="tool title-h2">T</div>
						<div class="tool title-h3">T</div>
						<div class="tool title-h4">T</div>
						<div class="tool title-none"><img src="titleNone.png"></div>
						<div  id="title-cursor" class="tool-cursor">
							<img src="arrow-u-black.png" />
						</div>
					</div>

					<div id="bullet">
						<div id="bullet-caption" class="caption">puce</div>
						<div class="tool-frame-bullet bullet-true"><img src="bulletTrue.png" /></div>
						<div class="tool-frame-bullet bullet-false"><img src="titleNone.png" /></div>
						<div  id="bullet-cursor" class="tool-cursor">
							<img src="arrow-u-black.png" />
						</div>
						<div id="tool-limit-bullet" class="tool-limit">|</div>
					</div>

					<div id="frame">
						<div id="frame-caption" class="caption">cadre</div>
						<div class="tool-frame-bullet frame-true"><img src="frameTrue.png" /></div>
						<div class="tool-frame-bullet frame-false"><img src="titleNone.png" /></div>
						<div  id="frame-cursor" class="tool-cursor">
							<img src="arrow-u-black.png" />
						</div>
					</div>

					<div id="picture">
						<div id="picture-caption" class="caption">image</div>
						<div class="tool-frame-bullet picture-true"><img src="pictureTrue.png" /></div>
						<div class="tool-frame-bullet picture-false"><img src="titleNone.png" /></div>
						<div  id="picture-cursor" class="tool-cursor">
							<img src="arrow-u-black.png" />
						</div>
					</div>

					<div></div>
				</div>  <!-- fin toolbarlist -->


				<!-- 	VERIFY BUTTON + logo + scroll toolbar  &nbsp;  -->

				<div class="arrows arrow-l"  data-toggle="tooltip" data-placement="top" title="Défilement barre d'outils">  <!-- scroll toolbar -->
					<img id="img-arrow-l" src="carat-l-white.png">
				</div>

				<span id="analyze" class="simples-span" >
					<button id="verify-button" type="button" class="simples-button  btn-info">
						<img src="SimpLES_white_square.png" alt="SIMPLES Logo"  height="46" />
					</button>
				</span>

				<div class="arrows arrow-r"  data-toggle="tooltip" data-placement="top" title="Défilement barre d'outils">  <!-- scroll toolbar -->
					<img id="img-arrow-r" src="carat-r-white.png">
				</div>

			</div>  <!-- fin toolbar -->

			<!--															E D I T O R  -->
			<div class="hbox">
				<div id="content">
					<div id="page-container">
						<div id="page">
							<!-- Create the editor container -->
							<div id="editor">
								<!-- Block command box -->
								<div id="blockCmd">
									<div class="block-new-up"  data-toggle="tooltip" data-placement="top" title="Ajouter un bloc au dessus">
										<img src="plus-black.png">
									</div>
									<div class="block-delete"  data-toggle="tooltip" data-placement="right" title="Supprimer le bloc">  <!--  block delete -->
										<img src="delete-black.png">
									</div>
									<div class="block-new-down"  data-toggle="tooltip" data-placement="bottom" title="Ajouter un bloc en dessous">
										<img src="plus-black.png">
									</div>
									<div class="block-move-down"  data-toggle="tooltip" data-placement="right" title="Faire descendre le bloc">  <!--  block down -->
										<img src="carat-d-black.png">
									</div>
									<div class="block-move-up"  data-toggle="tooltip" data-placement="right" title="Faire monter le bloc">  <!--  block up -->
										<img src="carat-u-black.png">
									</div>
									<div class="block-number">
										<span>1</span>
									</div>
								</div>
							</div>
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
  				<!-- <p>Résultats de l'analyze :</p> -->
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
			</div>  <!-- end editor -->
	</div>
</div>
<!--                         			 D I A L O G S  -->
<!-- image dialog -->
<div id="imageClickModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Choisir une image</h3>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
          <div class="input-group mb-3">
        <!--    <input id="imgFromDisk" type="file" > -->
						<div class="custom-file">
							<input id="imgFromDisk" type="file" class="custom-file-input">
							<label class="custom-file-label" for="inputGroupFile01">Choisir un fichier</label>
						</div>
          </div>
          <div class="form-group">
            <label for="message-text" class="col-form-label">Entrer un URL:</label>
            <input type="url" class="form-control" id="image-url"></textarea>
          </div>
      </div>
      <div class="modal-footer">
				<button type="button" class="btn btn-dark" data-dismiss="modal">OK</button>
      </div>
    </div>
  </div>
</div>  <!-- end image dialog -->

<!--  confirm dialog -->
<div id="confirmDialog" data-action="" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"></h5>
      </div>
      <div class="modal-body">
        <p></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="cancel btn btn-secondary" data-dismiss="modal">Annuler</button>
				<button type="button" class="ok btn btn-primary" data-dismiss="modal">Ok</button>
      </div>
    </div>
  </div>
</div>  <!-- end confirm dialog -->



	<!-- Initialize Simples Editor -->
	<script type="text/javascript" src="editor.js"></script>
	<script type="text/javascript" src="analyzer.js"></script>
	<script type="text/javascript" src="utils.js"></script>

	<!-- jQuery ready -->
	<script src="index.js"></script>
</body>
</html>
