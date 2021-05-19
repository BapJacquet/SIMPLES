/*
    This file is part of the LIREC program developped for the SIMPLES project.
    It was developped by Baptiste Jacquet and Sébastien Poitrenaud for the
    LUTIN-Userlab from 2018 to 2020.
    Copyright (C) 2018  Baptiste Jacquet & Sébastien Poitrenaud

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
    url: 'connection.php',
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
          window.location = window.location.href;
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
// user
//debugger;
if ( localStorage.user == undefined || localStorage.user != "ok" ) askUserName();
else window.location = window.location.href + "index.php";
