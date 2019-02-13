//index.js
////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// F U N C T I O N S
////////////////////////////////////////////////////////////////////
var lastReadText;

function readFile(e) {
  console.log("readFile");
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    saveContents(contents);
  };
  reader.readAsText(file);
}

function saveContents(contents) {
  lastReadText = contents;
  console.log("lastReadText: " + lastReadText);
}
//////////////////////////////////////////////////  Fin F U N C T I O N S

/////////////////////////////////////////////////////////////////////////
// ---------------------------------------------------------- R E A D Y
$(document).ready(function () {

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

  // test file
  $("#file-input").on('change', readFile);

}); // ------------------------------------------------------  fin ready
