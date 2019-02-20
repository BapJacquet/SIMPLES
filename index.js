//index.js

const editor = new Editor('#editor');

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

$("#verify-button").on("click", function () {
    if ( !$(".hcollapsible").hasClass("active") ) {
      $(".hcollapsible").trigger("click").blur();
    }
    onVerifyClick();
} );
// pdfButton.onclick = onPDFClick;
// slider.oninput = refreshPageScale;


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
  alert(editor.blockCount);
  for(let i = 0; i < editor.blockCount; i++){
    content.push(editor.getTextContent(i));
  }
  analyzeText(content.join("\n"));
  alert(content.join("\n"));
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
//////////////////////////////////////////////////  Fin F U N C T I O N S

/////////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------- R E A D Y
$(document).ready(function () {

  // Evenements qui viennent de analyser.js
  $("body").on("progressChanged", setLexique3Progress);
  $("body").on("analysisStatusChanged", setStatus);
  $("body").on("analysisCompleted", displayAnalysisResults);

  $("#conted").on("mouseup", function(e) {
    console.log(window.getSelection().toString());
    console.log(window.getSelection().getRangeAt(0).toString());
  } );

  // choix fichier texte sur disque client
  $("#file-input").on('change', readFile);

  // à méditer pour Baptiste
  $(".hcollapsible, .collapsible").on("click", function(e) {
    $(this).blur();
    $(this).toggleClass("active");
    if ( $(this).next().css("display") == "block" )
          $(this).next().css({"display": "none"});
    else  $(this).next().css({"display": "block"});
  } );

  // ouverture port 9000
  $.ajax({
    'url': "https://sioux.univ-paris8.fr/standfordNLP/StandfordOpen.php"
  });

  // Logo
  $("#logo").css({"opacity": 0.5, "height": "45px", "padding-left": "60px"});


  //$("body").css({"margin-left":"3%", "margin-right":"3%"});
  $("table").css({"margin-left":"auto", "margin-right":"auto", "min-width":900, "max-width":900});
  //$("#page").height(1100).width(800);
  $("td").css({"border":0});
  $("#td-test").css({"text-align":"center"});



   $('body').css({"visibility":"visible"});
}); // ------------------------------------------------------  fin ready
