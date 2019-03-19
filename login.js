

//***************************************************** modalAlert
function modalAlert ( message, titre , message2) {
  $('#modal-alert').modal('show');
  $("#modal-alert .modal-body .dru-text").text(message);
  $("#modal-alert .modal-title").text(titre);
  if ( message2 ) $("#modal-alert .modal-body .dru-text2").text(message2);
}

//***********************
function askUserName () {
  $("#user-name").val('');
  $('#modal-user-name').modal('show');
}


// ********************************************************** R E A D Y
$(document).ready(function () {

////  connection
$('#modal-user-name').on( 'hidden.bs.modal', function (e) {
  var version = navigator.platform + ' ' + navigator.userAgent;
  $.ajax({
    url: 'connection_count.php',
    type:'post',
    data: { 'version': version,
            'user': $("#user-name").val()},
    complete: function(xhr, result) {
      // alert('complete');
      if (result != 'success') {
        modalAlert ( 'Erreur réseau!', 'Rechargez la page' );
      }
      else {
        if ( xhr.responseText == "error") {
          localStorage.userName = '';
          modalAlert ( 'Identifiant erroné!', '' );
          setTimeout(function () {
            window.location = window.location.href;
          }, 2000);
        }
        else {
          localStorage.user = 'ok';
          window.location = xhr.responseText;
        }
      }
    }
  });
});

////
$('#modal-user-name').on('shown.bs.modal', function () {
  $("#user-name").val('');
  $('#user-name').focus();
});

////
$("#modal-user-name .ok").on("click", function () {
  var id = $("#user-name").text();
  console.log(id);
});

}); // ******************************************************  F I N   R E A D Y

if ( localStorage.user != "ok" ) askUserName ();
else window.location = "http://sioux.univ-paris8.fr/simples/index.php";
