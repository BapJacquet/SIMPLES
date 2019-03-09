//index.js


////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// F U N C T I O N S
////////////////////////////////////////////////////////////////////

// Ecriture fichier texte sur disque
function writeFile(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

// lecture fichier texte et envoie à l'éditeur
function readFile(ev) {
  // <!-- test readFile  -->
  // <input type="file" id="file-input" />
  var file = ev.target.files[0];
  if ( !file || !( file.type.match(/text*/)) ) return;
  var reader = new FileReader();
  reader.onload = function(ev2) {
    var text = ev2.target.result;
    console.log("textFile: " + text);
    // ici envoyer à l'éditeur
    // functionEdit(globalMenuItem, text);
  };
  reader.readAsText(file); // readAsDataURL(file);
}

/**
 * Change the value of the progress bar for
 * Lexique 3 in the "Analyse" Panel.
 */
function setLexique3Progress(event){
  let value = event.detail.value;
  let percent = ''+Math.floor(value)+'%';
  lexique3Progress.style.width = percent;
  lexique3Progress.setAttribute('aria-valuenow', value);
  lexique3Progress.innerHTML = percent;
  if ( $(lexique3Connection).css("display") == "none" )
    $(lexique3Connection).css("display", "block");
  if ( value == 100 ) {
    $(lexique3Connection).css("display", "none");
  }
}

/**
 * Display the result of the analysis.
 * in the "Analyse" panel.
 */
function displayAnalysisResults(event){
  // Ajoute les résultats à la page d'analyse.
  let complexWords = event.detail.complexWords;
  analysisContent.innerHTML = "";
  if(complexWords.length > 0){
    analysisContent.insertAdjacentHTML('beforeend',`<div class="alert alert-danger" role="alert">${complexWords.length} mots compliqués !</div>`);
    for(var i = 0; i < complexWords.length; i++){
      analysisContent.insertAdjacentHTML('beforeend',
      `<input type='button' title='${frequencyToText(complexWords[i].frequency)}' class='btn btn-outline-danger btn-sm' type="button" value='${complexWords[i].text}'
      onclick='editor.select(${complexWords[i].blockIndex}, ${complexWords[i].startOffset}, ${complexWords[i].length});' />`);
    }
  } else {
    analysisContent.insertAdjacentHTML('beforeend',`<div class="alert alert-success" role="alert">Les mots semblent simples !</div>`);
  }
}

/**
 * Display the status indicators for the analysis
 * in "Analyse" panel.
 */
function setStatus(event){
  let moduleName = event.detail.module;
  let status = event.detail.status;

  var divText;
  switch(status){
    case 'en cours':
    divText = `<div class="alert alert-info" role="alert">${moduleName} : En cours</div>`; break;
    case 'echec':
    divText = `<div class="alert alert-danger" role="alert">${moduleName} : Echec</div>`; break;
    case 'ok':
    divText = `<div class="alert alert-success" role="alert">${moduleName} : OK</div>`; break;
  }
  switch(moduleName){
    case 'Stanford':
    stanfordConnection.innerHTML=divText;
    stanfordConnection.style.display = 'block';
    break;
    case 'Lexique3':
    lexique3Connection.style.display = 'block';
    break;
  }
}

/**
 * Remove status indicators for Stanford and Lexique3
 * in the "Analyse" panel.
 */
function clearStatus(){
  stanfordConnection.style.display = 'none';
  lexique3Connection.style.dipslay = 'none'; // IL y a un truc à changer ici
}

/**
 * ZOOM
 */
function refreshPageScale(){
  var scaleFunction = 'scale(' + slider.value + ')';
  //page.css('transform', scaleFunction);
  page.style.transform = scaleFunction;
}

/**
 * When Verify Button is clicked
 * Start the analysis.
 */
function onVerifyClick () {
  /*let content = [];
  //alert(editor.blockCount);
  for(let i = 0; i < editor.blockCount; i++){
    content.push(editor.getTextContent(i));
  }
  analyzeText(content.join("\n"));
  //alert(content.join("\n"));*/
  analyzeAllEditorContent();
}

/**
 * Create a PDF from the page.
 */
function onPDFClick(){
  let doc = editor.toPDF();
  doc.save('Mon fichier.pdf');
}

// ******************************************** T O O L B A R

function initToolbar() {                 // tool cursor initial values
  $("#bold-cursor").css("left", CURSOR_DATA["bold-" + BOLD_INIT]);
  $("#size-cursor").css("left", CURSOR_DATA["size-" + SIZE_INIT]);
  $("#color-cursor").css("left", CURSOR_DATA["color-" + COLOR_INIT]);
  $("#title-cursor").css("left", CURSOR_DATA["title-" + TITLE_INIT]);
  $("#frame-cursor").css("left", CURSOR_DATA["frame-" + FRAME_INIT]);
  $("#bullet-cursor").css("left", CURSOR_DATA["bullet-" + BULLET_INIT]);

  activeTool("bold", BOLD_INIT);
  activeTool("size", SIZE_INIT);
  activeTool("color", COLOR_INIT);
  activeTool("title", TITLE_INIT);
  activeTool("frame", FRAME_INIT);
  activeTool("bullet", BULLET_INIT);
}

//                                            click on toolbar
function toolClick(e, toolTag) {
  var classes = $(toolTag).get(0).classList.value;
  var toolVal = classes.split(" ")[1];
  var tool = toolVal.split("-")[0];
  var val = toolVal.split("-")[1];
  activeTools[tool] = val;
  moveCursor(tool, val, true);
  sendtoEditor(tool, val);
}

//                                             move tool cursor
function moveCursor(tool, val, anim) {
  var cursor = "#" + tool + "-cursor";
  if ( val == "ambiguous" ) {
    $(cursor).css("visibility", "hidden");
  }
  else {
    $(cursor).css("visibility", "visible");
    var newTool = tool + "-" + val;
    var position = CURSOR_DATA[newTool];

  /*  if ( anim ) */
    $(cursor).animate({"left": position}, 300);
  //  $(cursor).css({"left": position});
  }
}

//                                    send toolbar data to editor
function sendtoEditor(tool, val) {
  var v = val;
  if ( tool == "color" ) {
    switch( val ) {
      case 'red':
      v = "#ff0000"; break;
      case 'green':
      v = "#00ff00"; break;
      case 'blue':
      v = "#0000ff"; break;
      case 'black':
      v = "#000000"; break;
    }
  } else {
    switch (val) {
      case 'true':
        v = true; break;
      case 'false':
        v = false; break;
    }
  }
  let dataObj = {};
  dataObj[tool] = v;
  editor.setFormatAtSelection(dataObj);
}

//                                    toolbar update from editor
function setFormatAtToolbar(format) {
  var items = format.listitem;
  var color = format.color;

  switch( color ) {
    case "#ff0000":
    color = 'red'; break;
    case "#00ff00":
    color = 'green'; break;
    case "#0000ff":
    color = 'blue'; break;
    case "#000000":
    color = 'black'; break;
  }

  activeTool("color", color);
  activeTool("bold", format.bold);
  activeTool("size", format.size);
  activeTool("title", format.title);
  activeTool("frame", format.frame);
  activeTool("bullet", format.bullet);
}

// update cursor & activeTools
function activeTool(tool, value) {
  activeTools.tool = value;
  moveCursor(tool, value, false);
}

////////////////////////////////////////////////  Fin F U N C T I O N S

//*********************************************************************
// ********************************************************** R E A D Y
$(document).ready(function () {

  // Evenements qui viennent de analyser.js
  $("body").on("progresschanged", setLexique3Progress);
  $("body").on("analysisstatuschanged", setStatus);
  $("body").on("analysiscompleted", displayAnalysisResults);

  $("#lexique3-connection").css("display", "none");

// click on verify button and open panel if closed
  $("#verify-button").on("click", function () {
      $(this).blur();
      if ( !$(".hcollapsible").hasClass("active") ) {
        $(".hcollapsible").trigger("click").blur();
      }
      onVerifyClick();
  } );

// à méditer pour Seb (Rempli le reste de l'écran avec la partie centrale de l'éditeur)
  $(window).on("load resize", function() {
    let grid = $(".box");
    let h = window.innerHeight;
    let remaining = h;
    for(let i = 0; i < grid.get(0).childNodes.length; i++){
      let n = grid.get(0).childNodes[i];
      if(n.classList && !n.classList.contains('hbox')){
        remaining -= $(n).outerHeight();
      }
    }
    $('.hbox').css("max-height", remaining + "px");
    $('.hbox').css("margin", "0px");
    $('.box').css("overflow", "hidden");
  });
// à méditer pour Baptiste
  $(".hcollapsible, .collapsible").on("click", function(e) {
    $(this).blur();
    $(this).toggleClass("active");
    if ( $(this).next().css("display") == "block" )
          $(this).next().css({"display": "none"});
    else  $(this).next().css({"display": "block"});

    if ( $(".hcollapsible").hasClass("active") )
          $(".hcollapsible div").text("Masquer\xA0l'analyse");
    else  $(".hcollapsible div").text("Montrer\xA0l'analyse");

    $(".hcollapsible").css("background-color", "#6c757d");
  } );

/********************  image click  ***************/

$("#editor").on("click", ".editor-image", function(ev) {
  $("#imageClickModal").find("#imgFromDisk").attr("data-id", "#" + ev.target.id);
  $("#imageClickModal").find("#image-url").val("");
  $("#imageClickModal").modal();
});

// bouton dans dialog modal
$("#imgFromDisk").on("change", function (e) {
  var file = e.target.files[0];
  if ( !file || (!file.type.match(/image.*/)) ) {
    $("#imageClickModal .close").trigger("click");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    $("#imageClickModal .btn-dark").trigger("click");
    var imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
    // editor.setImage(globalImageId, e.target.result);
    editor.setImage(imageId, e.target.result);
  };
  reader.readAsDataURL(file);     // ou readAsText(file);
});

$("#imageClickModal").on('hidden.bs.modal', function (ev) {
  var imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  var url = $("#imageClickModal").find("#image-url").val();
  // send url to editor
  if ( url ) editor.setImage(imageId, url);
});

//  ***************************  image drag & drop  ************

// prevention du drop n'importe ou
$(document).on('drop dragover', function(e){
  if ( !( $(e.target).hasClass("editor-image") ) )
    return false;
});

//$("#editor").find(".editor-image").on('dragover', function(e) {
$("#editor").on('dragover', ".editor-image", function(e) {
    e.stopPropagation();
    e.preventDefault();
    var ev = e.originalEvent;
    ev.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
//$("#editor").find(".editor-image").on('drop',  function(e) {
  $("#editor").on('drop', ".editor-image", function(e) {
    e.stopPropagation();
    e.preventDefault();
    var imageId = "#" + e.target.id;
    var ev = e.originalEvent;
    var file = ev.dataTransfer.files[0];
    if ( !file ) return;
    if ( (!file.type.match(/image.*/)) ) return;
    var reader = new FileReader();
    reader.onload = function(e2) {
        var imageSrc = e2.target.result;
        editor.setImage(imageId, imageSrc);
    };
    reader.readAsDataURL(file); // start reading the file data.
});

////////////////////////////////////////////////////////
//                                             menubar

$(".main-menu, .hcollapsible").on("focus", function () {
  $(this).blur();
});

$("#editor").on("blur", ".editor-text", function () {
  lastBlockBlur = $(this).attr("id");
});
//////////////////////////////////////////
// read text files
$(".read-file").on("click", function () {
  globalMenuItem = $(this).attr("id");
  $("#openFileInput").trigger("click");
});

$("#openFileInput").on("change", readFile);

// write text file
$(".write-file").on("click", function () {
  if ( $(this).attr("id") == "exportFile" ) onPDFClick();
  else writeFile( "contenu du fichier", "mon fichier.txt", "text/plain");
});

// edit menu
$("#cutItem").on("click", function() {
  document.execCommand("cut");
});
$("#copyItem").on("click", function() {
  document.execCommand("copy");
});
$("#pasteItem").on("click", function() {
  setInterval(function() {
    $(lastBlockBlur).focus();
  }, 10);
  document.execCommand("paste");
});

////////////////////////////////////////////////////////
//                                        toolbar events

// jquery tool hover
/*
  $(".tool, .tool-frame-bullet").mouseenter( function () {
    $(this).css({"top":"-5px", "cursor": "pointer"});
  } ).mouseleave( function () {
    $(this).css({"top":"0", "cursor": "default"});
  } );
*/

//  tool click
  $(".tool, .tool-frame-bullet").on("click", function(e) {
    //e.preventDefault();
/*    $(this).animate({"top": "-16px"}, 200,
      function () {
        $(this).animate({"top": "0px"}, 100,
          function () { $(this).blur();
        });
      }
    ); */
    toolClick(e, this);
    $(this).trigger("mouseleave");
  } );

//  toolbar scroll
  $(".arrow-l, .arrow-r").on(" touchstart mousedown ", function(e) {
//    $(".arrow-l, .arrow-r").on(" pointerdown ", function(e) {
    if( mousedownID == -1 )  //Prevent multimple loops!
      mousedownID = setInterval(function() {
        var offset = $("#toolbarlist").offset();
        var decal;
        if ( $(e.target).hasClass("arrow-l") ) decal = 8;
        else decal = -8;
        $("#toolbarlist").css({"top": 0, "left": offset.left + decal});
      }, 25);
  });
  $(".arrow-l, .arrow-r").on("mouseup mouseout touchend", function() {
// $(".arrow-l, .arrow-r").on("pointerup pointerout ", function() {
    if( mousedownID != -1 ) {  //Only stop if exists
      clearInterval(mousedownID);
      mousedownID=-1;
    }
  });

//  editor requires toolbar update
  $('#editor').on('currentformatchanged', function(e) {
    setFormatAtToolbar(e.detail.format);
  } );

  // toolbar init
  initToolbar();

  $("#conted").on("mouseup", function(e) {
    console.log(window.getSelection().toString());
    console.log(window.getSelection().getRangeAt(0).toString());
  } );

  // ouverture port 9000
  $.ajax({
    'url': "https://sioux.univ-paris8.fr/standfordNLP/StandfordOpen.php"
  });

  //////////////////////////////////////////////////////////
  ////////////////////////////////////////////// B L O C K S


  $("#editor").on("blockcreated", function (ev) {
    console.log("Nouveau bloc: " + ev.detail.blockid);
  });

  $("#editor").on("mouseenter", ".editor-block", function (ev) {
    activeBlocId = Number(this.id.split("-")[1]);
  });

  //  blockCmd
  $("#editor").on("mouseenter", ".editor-block, #blockCmd", function (ev) {
    //if ( document.activeElement.)
    var offset = $(this).offset();
    var left = $("#page").offset().left + 55;
    offset.left = left;
    $("#blockCmd").offset(offset);
    $("#blockCmd").css({"opacity": 1});
  });

  //  blockCmdInter
  $("#editor").on("mouseenter", ".editor-block, #blockCmdInter", function (ev) {
    var offset = $(this).offset();
    var left = $("#page").offset().left + 698;
    offset.left = left;
    $("#blockCmdInter").offset(offset);
    $("#blockCmdInter").css({"opacity": 1});
  });

  // blockCmd  et   blockCmdInter
  $("#editor").on("mouseleave", ".editor-block, #blockCmd, #blockCmdInter", function (ev) {
    $("#blockCmd, #blockCmdInter").css({"opacity": 0});
  });

  // block Events
  $("#blockCmdInter div").on("click", function (ev) {
    editor.insertBlockAfter( activeBlocId, "", true);
  });

  $("#blockCmd .block-delete").on("click", function (ev) {
    console.log("Supprimer bloc " + activeBlocId);
    editor.removeBlockAt( activeBlocId, 0);
  });




  // -----------------------------------    BLOQUAGES DIVERS
  $( window ).on("resize", function (event) {  // stop rubberband scroll
    event.stopPropagation();
    event.preventDefault();
    $( document ).width(screen.innerWidth).height(screen.innerHeight);
    return false;
  });

  document.addEventListener('backbutton', function(event) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  }, false);

  $( document ).on('dblclick', function() {
    event.stopPropagation();
    event.preventDefault();
    return false;
  } );

  //screen.lockOrientation('portrait');

  $("body").css({"overflow-y": "hidden"}); // stop pull-down-to-refresh

  $( window ).on("resize orientationchange", function() {
    event.stopPropagation();
    event.preventDefault();
    return false;
  });




  //$("body").css({"margin-left":"3%", "margin-right":"3%"});
  //$("table").css({"margin-left":"auto", "margin-right":"auto", "min-width":900, "max-width":900});
  //$("#page").height(1100).width(800);
  //$("td").css({"border":0});
  //$("#td-test").css({"text-align":"center"});

  $(function () { // enable tooltips
    $('[data-toggle="tooltip"]').tooltip();
  });

  $('body').css({"visibility":"visible"});

}); // ******************************************************  F I N   R E A D Y
//  ****************************************************************************

const editor = new Editor('#editor');

const CURSOR_DATA = {

    "bold-false": "-63px",
    "bold-true": "-38px",

    "size-s1": "-97px",
    "size-s2": "-74px",
    "size-s3": "-46px",

    "color-black": "-168px",
    "color-red": "-143px",
    "color-blue": "-118px",
    "color-green": "-93px",
    "color-custom":"-67px",

    "title-h1": "-168px",
    "title-h2": "-142px",
    "title-h3": "-117px",
    "title-h4":"-94px",
    "title-none":"-70px",

    "frame-true": "-50px",
    "frame-false": "-7px",

    "bullet-true": "-50px",
    "bullet-false": "-7px",
};

const BOLD_INIT = "false";
const SIZE_INIT = "s1";
const COLOR_INIT = "black";
const TITLE_INIT = "none";
const FRAME_INIT = "false";
const BULLET_INIT = "false";

var activeTools = {}; // tools present state
var mousedownID = -1;

var globalMenuItem; // id menu item à envoyer à l'aditeur  avec fichier texte
var lastBlockBlur = ""; // id dernier bloc
var activeBlockId;

var slider = document.getElementById('zoom-range');
var page = document.getElementById('page');

var analysisContent = document.getElementById('analysis-content');
var stanfordConnection = document.getElementById('stanford-connection');
var lexique3Connection = document.getElementById('lexique3-connection');
var lexique3Progress = document.getElementById('lexique3-progress');

// Appelle la fonction pour le zoom dés le début.
//refreshPageScale();

// slider.oninput = refreshPageScale;
