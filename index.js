//index.js


////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// F U N C T I O N S
////////////////////////////////////////////////////////////////////

// copie fichier text disque -> lastReadText
function readFile(e) {
  // <!-- test readFile  -->
  // <input type="file" id="file-input" />
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    lastReadText = e.target.result;
    console.log("lastReadText: " + lastReadText);
  };
  reader.readAsText(file);
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
      onclick='quill.setSelection(${complexWords[i].startOffset}, ${complexWords[i].length});' />`);
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
function onVerifyClick(){
  let content = [];
  //alert(editor.blockCount);
  for(let i = 0; i < editor.blockCount; i++){
    content.push(editor.getTextContent(i));
  }
  analyzeText(content.join("\n"));
  //alert(content.join("\n"));
}

/**
 * Create a PDF from the page.
 */
function onPDFClick(){
  var doc = new jsPDF();

  var totalWidth = 210; // 210 mm, 21 cm
  var margin = 25.4; // 1 inch = 25.4mm
  doc.fromHTML($('#page').get(0),
    margin,
    margin,
    {
      'width': (totalWidth - (margin*2))
    }
  );

  doc.save('Test.pdf');
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
  }
  dataObj = `\{"${tool}": ${v}"\}`;
  editor.setFormatAtSelection(dataObj);
}

//                                    toolbar update from editor
function setFormatAtToolbar(format) {
  var items = format.listitem;
  var color = items.color;

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
  activeTool("bold", items.bold);
  activeTool("size", items.size);
  activeTool("title", items.title);
  activeTool("frame", items.frame);
  activeTool("bullet", items.bullet);
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

/*
$("#verify-button").on("click", function () {
  $(this).blur();
  if ( !$(".hcollapsible").hasClass("active") ) {
    $(".hcollapsible").trigger("click").blur();
  }

  onVerifyClick();
}
*/



////////////////////////////////////////////////////////
//                                        toolbar events

// jquery tool hover
  $(".tool, .tool-frame-bullet").mouseenter( function () {
//    console.log("avant enter: " + $(this).css("top") + $(this).css("cursor"));
    $(this).css({"top":"-5px", "cursor": "pointer"});
//    console.log("après enter: " + $(this).css("top") + $(this).css("cursor"));
  } ).mouseleave( function () {
//    console.log("avant leave: " + $(this).css("top") + $(this).css("cursor"));
    $(this).css({"top":"0", "cursor": "default"});
//    console.log("après leave: " + $(this).css("top") + $(this).css("cursor"));
  } );

//  tool click
  $(".tool, .tool-frame-bullet").on("click", function(e) {
    e.preventDefault();
    $(this).animate({"top": "-10px"}, 100,
      function () {
        $(this).animate({"top": "0px"}, 300,
          function () { $(this).blur();
        });
      }
    );
    toolClick(e, this);
  } );

//  toolbar scroll
/*
  $(".arrow-l").on("click", function() {
    var offset = $("#toolbarlist").offset();
    $("#toolbarlist").animate({"top": 0, "left": offset.left - 90}, 200);
  });
  $(".arrow-r").on("click", function() {
    var offset = $("#toolbarlist").offset();
    $("#toolbarlist").animate({"top": 0, "left": offset.left + 90}, 200);
  });
*/
  $(".arrow-l, .arrow-r").on("mousedown", function(e) {
    if( mousedownID == -1 )  //Prevent multimple loops!
      mousedownID = setInterval(function() {
        var offset = $("#toolbarlist").offset();
        var decal;
        if ( $(e.target).hasClass("arrow-l") ) decal = 8;
        else decal = -8;
        $("#toolbarlist").css({"top": 0, "left": offset.left + decal});
      }, 25 /*execute every 100ms*/);
  });
  $(".arrow-l, .arrow-r").on("mouseup mouseout", function() {
    if(mousedownID!=-1) {  //Only stop if exists
      clearInterval(mousedownID);
      mousedownID=-1;
    }
  });



//  editor requires toolbar update
  $('#editor').on('currentformatchanged', function(e) {
    setFormatAtToolbar(e.detail);
  } );

  // toolbar init
  initToolbar();

  $("#conted").on("mouseup", function(e) {
    console.log(window.getSelection().toString());
    console.log(window.getSelection().getRangeAt(0).toString());
  } );

// choix fichier texte sur disque client
  $("#file-input").on('change', readFile);


  // ouverture port 9000
  $.ajax({
    'url': "https://sioux.univ-paris8.fr/standfordNLP/StandfordOpen.php"
  });


  //$("body").css({"margin-left":"3%", "margin-right":"3%"});
  //$("table").css({"margin-left":"auto", "margin-right":"auto", "min-width":900, "max-width":900});
  //$("#page").height(1100).width(800);
  //$("td").css({"border":0});
  //$("#td-test").css({"text-align":"center"});

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

var slider = document.getElementById('zoom-range');
var page = document.getElementById('page');

var pdfButton = document.getElementById('pdf-button');
var analysisContent = document.getElementById('analysis-content');
var stanfordConnection = document.getElementById('stanford-connection');
var lexique3Connection = document.getElementById('lexique3-connection');
var lexique3Progress = document.getElementById('lexique3-progress');

var lastReadText;

// Appelle la fonction pour le zoom dés le début.
//refreshPageScale();

// pdfButton.onclick = onPDFClick;
// slider.oninput = refreshPageScale;
