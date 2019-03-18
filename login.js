
//*************************************************** connection

function connection () {  // à mettre à jour

  if ( !localStorage.userName ) askUserName();
  else {
    var userName;
    if ( localStorage.userName ) userName = localStorage.userName;
    else userName = '';
    $.ajax({
      url: 'connection_count.php',
      type:'post',
      data: { 'identifier': sessionStorage.identifier,
              'userName': userName,
              'userAgent': window.navigator.userAgent.substr(12),
              'simplesVersion': "version number",
              'language': window.navigator.language,
              'platform': window.navigator.platform,
              'innerWidth': window.innerWidth,
              'innerHeight': window.innerHeight,
              'outerHeight':window.outerHeight
},
      complete: function(xhr, result) {
        // alert('complete');
        if (result != 'success') {
          localStorage.userName = '';
          modalAlert ( 'Network failure. Close app and try again.', ' error!' );
        }
        else {
          sessionStorage.connectionIndex = xhr.responseText;
          //initLevels();
        }
      }
    });
  }
}

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

//  user name
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

  /*
  var trimedName = $.trim($("#user-name").val());
  if ( !trimedName ) trimedName = 'Anonymous';
  if ( trimedName.match(/^[a-zA-Z](\w|_|-)+$/) ) {
    localStorage.userName = trimedName;
//    connection();
//    initLevels();
    modalAlert('Hello ' + trimedName + '!', '');
  }
  else askUserName();
  */

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

////
askUserName ();

}); // ******************************************************  F I N   R E A D Y
