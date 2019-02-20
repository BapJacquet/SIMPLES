//index.js
////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// F U N C T I O N S
////////////////////////////////////////////////////////////////////
var lastReadText;

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
//////////////////////////////////////////////////  Fin F U N C T I O N S

/////////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------- R E A D Y
$(document).ready(function () {

  $("#conted").on("mouseup", function(e) {
    console.log(window.getSelection().toString());
    console.log(window.getSelection().getRangeAt(0).toString());
  } );

  // choix fichier texte sur disque client
  $("#file-input").on('change', readFile);

  // à méditer pour Baptiste
  $(".hcollapsible, .collapsible").on("click", function(e) {
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
