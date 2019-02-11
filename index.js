

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
  $.ajax({url: "https://sioux.univ-paris8.fr/standfordNLP/StandfordOpen.php"});

}); // ------------------------------------------------------  fin ready
