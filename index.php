<!DOCTYPE html>
<html lang="fr" xml:lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html charset=utf-8" />
	<meta name="viewport" content="width=device-width,  initial-scale=1.0, minimum-scale=1.0, maximum-scale=2.0">
	<title>Lirec</title>

  <!-- === HTML to PDF ===-->
	<script src="./html2canvas.min.js"></script>
  <script src="https://unpkg.com/jspdf@latest/dist/jspdf.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.60/pdfmake.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.60/vfs_fonts.js"></script>

	<!-- === ZIP ===-->
	<script src="./jszip-utils.min.js"></script>
	<script src="./jszip.min.js"></script>

	<!-- ====== Bootstrap ====== -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
	<!-- jQuery library -->
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
	<script src="https://cdn.rawgit.com/mgalante/jquery.redirect/master/jquery.redirect.js"></script>
  <!-- Popper -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
	<!-- Latest compiled JavaScript -->
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>
	<!-- awesome -->
	<script defer src="https://use.fontawesome.com/releases/v5.8.1/js/all.js" integrity="sha384-g5uSoOSBd7KkhAMlnQILrecXvzst9TdC09/VM+pjDTCM+1il8RHz5fKANTFFb+gQ" crossorigin="anonymous"></script>
	<!-- colorpicker  -->
	<script src='spectrum.js'></script>
	<link rel='stylesheet' href='spectrum.css' />

	<!-- Quill -->
	<!-- Main Quill library -->
  <script src="//cdn.quilljs.com/latest/quill.js"></script>

	<link href="//cdn.quilljs.com/latest/quill.snow.css" rel="stylesheet">

  <link rel="stylesheet" type="text/css" href="main.css"/>
	<link rel="stylesheet" type="text/css" href="editor.css"/>
</head>

<!-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ -->
<body style="visibility:hidden;">
	<!-- loaderB32.gif -->
	<div class="loader" style="display:none"><img src="img/loaderB32.gif" /></div>
	<!-- hidden canvas -->
	<canvas id="hidden-canvas" style="display:none"></canvas>
	<div>
		<div class="box">
			<div id="header">
				<img id="logoLirec" src="img/lirec-black_BgLight74.png" alt="LIREC Logo" />
			</div>
			<!-- 												M E N U B A R -->
			<div id="main-menubar">
				<div class="btn-group" role="group">
					<div class="btn-group" role="group">
				    <button id="btnFichier" type="button" class="main-menu btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				      Fichier
				    </button>
				    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
							<a id="newFile" class="dropdown-item" href="#">Nouveau</a>
				      <a id="newModelFile" class="dropdown-item" href="#">Nouveau sur un modèle...</a>
							<div class="dropdown-divider"></div>
							<a id="openFile" class="read-file dropdown-item" href="#">Ouvrir...</a>
							<a id="saveFile" class="write-file dropdown-item" href="#">Enregistrer...</a>
							<div class="dropdown-divider"></div>
							<a id="importFile" class="read-file dropdown-item" href="#">Importer...</a>
							<a id="exportFilePDF" class="write-file dropdown-item" href="#">Exporter au format PDF...</a>
							<a id="exportFileODT" class="write-file dropdown-item" href="#">Exporter au format ODT...</a>
							<a id="exportFileHTML" class="write-file dropdown-item" href="#">Exporter au format HTML...</a>
				    </div>
				  </div>
					<div class="btn-group" role="group">
				    <button id="btnEdition" type="button" class="main-menu btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
				      <a id="importDic" class="dropdown-item read-file" href="#">Importer un dictionnaire...</a>
				      <a id="exportDic" class="dropdown-item" href="#">Exporter un dictonnaire...</a>
							<div class="dropdown-divider"></div>
							<a id="importLex" class="dropdown-item read-file" href="#">Importer un lexique...</a>
							<a id="exportLex" class="dropdown-item" href="#">Exporter un lexique...</a>
				    </div>
				  </div>
					<div class="btn-group" role="group">
				    <button id="btnAide" type="button" class="main-menu btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				      Aide
				    </button>
				    <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
							<a id="aideItem" class="dropdown-item" href="#">Aide...</a>
				    </div>
				  </div>
				</div>

				<div>
					<a id="pingbutton"><i class="fas fa-exclamation-triangle"></i></a>
				</div>

				<!-- hidden input for file dialog -->
				<input type="file" id="openFileInput" style="display:none;">
				<!-- hidden input for file colorpicker
				<input type="text" id="openColorInput" style="display:none;"> -->
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
							<img src="img/arrow-u-black.png" />
						</div>
					</div>

					<div id="size">
						<div id="size-caption" class="caption">taille</div>
						<div class="tool size-s1">a</div>
						<div class="tool size-s2">a</div>
						<div class="tool size-s3">a</div>
						<div  id="size-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
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
							<img src="img/arrow-u-black.png" />
						</div>
						<div id="tool-limit-color" class="tool-limit">|</div>
					</div>

					<div id="title">
						<div id="title-caption" class="caption">titre</div>
						<div class="tool title-h1 check">T</div>
						<div class="tool title-h2 check">T</div>
						<div class="tool title-h3 check">T</div>
						<div class="tool title-h4 check">T</div>
						<div  id="title-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
						</div>
					</div>

					<div id="bullet">
						<div id="bullet-caption" class="caption">puce</div>
						<div class="tool-frame-bullet bullet-true check"><img src="img/bulletTrue.png" /></div>
						<div  id="bullet-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
						</div>
					</div>

					<div id="number">
						<div id="number-caption" class="caption">numéro</div>
						<div class="tool-frame-bullet number-true check"><img src="img/numberTrue.png" /></div>
						<div  id="number-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
						</div>
						<div id="tool-limit-number" class="tool-limit">|</div>
					</div>

					<div id="frame">
						<div id="frame-caption" class="caption">cadre</div>
						<div class="tool-frame-bullet frame-true check"><img src="img/frameTrue.png" /></div>
						<div  id="frame-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
						</div>
					</div>

					<div id="pictureL">
						<div id="pictureL-caption" class="caption">images</div>
						<div class="tool-frame-bullet pictureL-true check"><img src="img/pictureLTrue.png" /></div>
						<div  id="pictureL-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
						</div>
					</div>

					<div id="pictureText">
						<img src="img/pictureText.png" />
					</div>

					<div id="picture">
						<div id="picture-caption" class="caption">image</div>
						<div class="tool-frame-bullet picture-true check"><img src="img/pictureTrue.png" /></div>
						<div  id="picture-cursor" class="tool-cursor">
							<img src="img/arrow-u-black.png" />
						</div>
					</div>

				</div>  <!-- fin toolbarlist -->


				<!-- 	VERIFY BUTTON + logo + scroll toolbar  &nbsp;  -->

				<div class="arrows arrow-l"  data-toggle="tooltip" data-placement="top" title="Défilement barre d'outils">  <!-- scroll toolbar -->
					<img id="img-arrow-l" src="img/carat-l-white.png">
				</div>

				<span id="analyze" class="simples-span" >
					<button id="verify-button" type="button" class="simples-button">Analyse</button>
				</span>
				<div><div id="toolMask"></div></div>

				<div class="arrows arrow-r"  data-toggle="tooltip" data-placement="top" title="Défilement barre d'outils">  <!-- scroll toolbar -->
					<img id="img-arrow-r" src="img/carat-r-white.png">
				</div>

			</div>  <!-- fin toolbar -->

			<!-- double div to avoid 'à méditer pour Seb' -->
			<div><div id="toolbarBottomMask"></div></div>
			<div><div id="toolbarScrollBar"></div></div>


			<!--															E D I T O R  -->
			<div class="hbox">
				<div id="content">
					<div id="page-container">
						<div id="page">
							<div id="blockCmd"><!-- Block command palette -->
								<div class="block-new-up"  data-toggle="tooltip" data-placement="right" title="Ajouter un bloc TEXTE au dessus">
									<img src="img/plus-black.png">
								</div>
								<div class="block-delete"  data-toggle="tooltip" data-placement="right" title="Supprimer le bloc">  <!--  block delete -->
									<img src="img/delete-black.png">
								</div>
								<div class="block-new-down"  data-toggle="tooltip" data-placement="right" title="Ajouter un bloc TEXTE en dessous">
									<img src="img/plus-black.png">
								</div>
								<div class="block-move-down"  data-toggle="tooltip" data-placement="right" title="Faire descendre le bloc">  <!--  block down -->
									<img src="img/carat-d-black.png">
								</div>
								<div class="block-move-up"  data-toggle="tooltip" data-placement="right" title="Faire monter le bloc">  <!--  block up -->
									<img src="img/carat-u-black.png">
								</div>
								<div class="block-number" contenteditable="false">
									<span>1</span>
								</div>
								<div class="block-new2-up"  data-toggle="tooltip" data-placement="right" title="Ajouter un bloc IMAGE au dessus">
									<img src="img/mini-mount.png">
								</div>
								<div class="block-new2-down"  data-toggle="tooltip" data-placement="right" title="Ajouter un bloc IMAGE en dessous">
									<img src="img/mini-mount.png">
								</div>
							</div><!-- Fin block command palette -->
							<!-- Image widgets -->
										<!---->
										<!-- img-txt-widget -->
							<div class="block-new img-txt-widget img-right"  data-toggle="tooltip" data-placement="right" title="Ajouter une image">
								<img src="img/mini-mount.png">
							</div>
							<div class="block-new img-txt-widget img-left"  data-toggle="tooltip" data-placement="right" title="Ajouter une image">
								<img src="img/mini-mount.png">
							</div>
										<!-- img-widget & img-txt-widget -->
							<div class="block-delete img-widget" data-toggle="tooltip" data-placement="right" title="" data-original-title="Supprimer l'image">
								<img src="img/delete-black.png">
							</div>
										<!-- img-widget -->
							<div class="block-new-right img-widget"  data-toggle="tooltip" data-placement="right" title="Ajouter une image à droite">
								<img src="img/mini-mount.png">
							</div>
							<div class="block-new-left img-widget"  data-toggle="tooltip" data-placement="left" title="Ajouter une image à gauche">
								<img src="img/mini-mount.png">
							</div>
							<div class="block-move-right img-widget"  data-toggle="tooltip" data-placement="right" title="Dépacer l'image à droite">
								<img src="img/carat-r-black.png">
							</div>
							<div class="block-move-left img-widget"  data-toggle="tooltip" data-placement="left" title="Dépacer l'image à gauche">
								<img src="img/carat-l-black.png">
							</div>
							<!-- Fin image widgets -->
							<!-- Editor container -->
							<div id="editor">
							</div>
						</div>
					</div>
				</div>
				<!--button class="hcollapsible" style="display: none"><div class="rotate">Montrer&nbsp;l'analyse</div></button-->
				<div id="analysisPanel">
					<div class="analysis-header">
						<button id="redo-analyse" type="button">Faire l'analyse</button>
					</div>
					<div class="analysiscontainer">
						<div id="stanford-connection"></div>
						<div class="alert alert-light" role="alert" id="lexique3-connection">
							<div>Un instant... : </div>
							<div class="progress">
								<div class="progress-bar bg-success" role="progressbar" aria-valuenow="0"
								aria-valuemin="0" aria-valuemax="100" id="lexique3-progress" style="width:0%">
									0%
								</div>
							</div>
						</div>
						<div class="score" data-toggle="tooltip" title="Il faut un score d'au moins 80 pour pouvoir être considéré comme du FALC, avec au moins 14 règles prioritaires, 2 très importantes et 15 importantes.">90</div>
					</div>
					<div>
						<ul class="nav nav-tabs nav-justified rulesScores" role="tablist">
							<li class="nav-item">
								<a class="nav-link active" id="mainTab" data-toggle="tab" href="#analysis-main-content" role="tab">
									<p>Prioritaires</p>
									<p><span id="mainRules"></span><span> sur 15</span></p>
								</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" id="veryImportantTab" data-toggle="tab" href="#analysis-veryImportant-content" role="tab">
									<p>Très Importantes</p>
									<p><span id="veryImportantRules"></span><span> sur 4</span></p>
								</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" id="importantTab" data-toggle="tab" href="#analysis-important-content" role="tab">
									<p>Importantes</p>
									<p><span id="importantRules"></span><span> sur 30</span></p>
								</a>
							</li>
						</ul>
					</div>
					<!-- <p>Résultats de l'analyze :</p> -->
					<div id="analysis-content" class="tab-content">
						<div id="analysis-main-content" class="tab-pane fade show active" role="tabpanel" aria-labelledby="mainTab"><ul></ul></div>
						<div id="analysis-veryImportant-content" class="tab-pane fade" role="tabpanel" aria-labelledby="veryImportantTab"><ul></ul></div>
						<div id="analysis-important-content" class="tab-pane fade" role="tabpanel" aria-labelledby="importantTab"><ul></ul></div>
					</div>
				</div>
			</div>  <!-- end editor -->
	</div>
</div>
<!--                         			 D I A L O G S  -->
<!-- image dialog -->
<div id="imageClickModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title">Choisir une image</h1>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
				<label class="col-form-label">Choisir&nbsp;</label>
				<button id="imgButtonFromDisk" type="button" class="btn btn-secondary">un fichier sur l'ordinateur</button>
				<button id="imgButtonHour" type="button" class="btn btn-secondary">une heure</button>
				<button id="imgButtonDay" type="button" class="btn btn-secondary">une date</button>
				<br/>	<br/>
        <div class="input-group mb-3" style="display:none;"> <!-- triggered -->
					<div class="custom-file">
						<input id="imgFromDisk" type="file" class="custom-file-input btn btn-info">
						<label class="custom-file-label" for="inputGroupFile01"></label>
					</div>
        </div>
				<label class="col-form-label">Entrer une URL ou des mots-clés</label>
				<div class="input-group mb-3">
					<input  id="image-url" type="text" class="form-control" data-val="">
					<div class="input-group-append">
						<button id="modalFind" type="button" class="btn btn-success">Chercher</button>
					</div>
				</div>
				<!-- modal-images -->
				<label class="col-form-label arasaac-lab"><strong>Arasaac</strong></label>
				<div class="modal-images arasaac  flex-nowrap">
				</div>
				<br>
				<label class="col-form-label sclera-lab"><strong>Sclera</strong></label>
				<div class="modal-images sclera flex-nowrap">
				</div>
				<label class="col-form-label qwant-lab"><strong>Qwant</strong></label>
				<div class="modal-images qwant flex-nowrap">
				</div>
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

<!-- simple alert -->
<div id="simplesAlert" data-action="" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"></h5>
				<span style="font-size: 36px;">
					 <i class="fas fa-hammer"></i>
				</span>
      </div>
			<div class="modal-body">
      </div>
      <div class="modal-footer">
				<button type="button" class="ok btn btn-secondary" data-dismiss="modal">Ok</button>
      </div>
    </div>
  </div>
</div>  <!-- end simple alert -->

<!-- help alert -->
<div id="helpAlert" data-action="" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog .modal-xl" role="document">
    <div class="modal-content">
			<iframe src="help.htm"></iframe>
    </div>
  </div>
</div>  <!-- end help alert -->

	<!-- Initialize Simples Editor -->
	<script type="text/javascript" src="editor.js"></script>
	<script type="text/javascript" src="analyzer.js"></script>
	<script type="text/javascript" src="animator.js"></script>
	<script type="text/javascript" src="utils.js"></script>
	<script type="text/javascript" src="extensions.js"></script>
	<script type="text/javascript" src="converter.js"></script>
	<script type="text/javascript" src="w3color.js"></script>

	<!-- jQuery ready -->
	<script src="index.js"></script>
</body>
</html>
