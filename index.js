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
      onclick='editor.selectFirst("${complexWords[i].text}", true);' />`);
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
  analyzeAllEditorContent();
}

/**
 * Create a PDF from the page.
 */
function onPDFClick(){
  editor.toPDF().then( function (doc) {
    doc.save('Mon fichier.pdf');
  });
}

// ******************************************** T O O L B A R

function initToolbar() {                 // tool cursor initial values
  $("#bold-cursor").css("left", CURSOR_DATA["bold-" + BOLD_INIT]);
  $("#size-cursor").css("left", CURSOR_DATA["size-" + SIZE_INIT]);
  $("#color-cursor").css("left", CURSOR_DATA["color-" + COLOR_INIT]);
  $("#title-cursor").css("left", CURSOR_DATA["title-" + TITLE_INIT]);
  $("#bullet-cursor").css("left", CURSOR_DATA["bullet-" + BULLET_INIT]);
  $("#frame-cursor").css("left", CURSOR_DATA["frame-" + FRAME_INIT]);
  $("#picture-cursor").css("left", CURSOR_DATA["picture-" + PICTURE_INIT]);

  activeTool("bold", BOLD_INIT);
  activeTool("size", SIZE_INIT);
  activeTool("color", COLOR_INIT);
  activeTool("title", TITLE_INIT);
  activeTool("bullet", BULLET_INIT);
  activeTool("frame", FRAME_INIT);
  activeTool("picture", PICTURE_INIT);


}
////////////
//                                            click on toolbar
function toolClick(e, toolTag) {
  var classes = $(toolTag).get(0).classList.value;
  var toolVal = classes.split(" ")[1];
  var tool = toolVal.split("-")[0];
  var val = toolVal.split("-")[1];
  if ( $(toolTag).hasClass("check") ) {
    if ( tool != "title" ) val = !Boolean(activeTools[tool]);
    else if ( activeTools[tool] != "none" && activeTools[tool] == val ) val = "none";
  }
  var anim = true;
  if ( activeTools[tool] == "none") anim = false;

  activeTools[tool] = val;
  moveCursor(tool, val, anim);
  if ( !(tool == "color" && val == "custom") ) sendtoEditor(tool, val);

}
/////////////
//                                             move tool cursor
function moveCursor(tool, val, anim) {
  var cursor = "#" + tool + "-cursor";
  if ( val == "ambiguous" ) {
    $(cursor).css("visibility", "hidden");
  }
  else {
    if ( tool != "bold" && ( !Boolean(activeTools[tool]) || activeTools[tool] == "none") ) {
      $(cursor).css("visibility", "hidden");
    }
    else {
      if ( $("." + tool + "-" + String(val)).hasClass("check") ) {
        if ( Boolean(activeTools[tool]) || activeTools[tool] != "none" ) {
          $(cursor).css("visibility", "visible");
        }
        else {
          $(cursor).css("visibility", "hidden");
        }
      }
      else {
        $(cursor).css("visibility", "visible");
      }

      var newTool = tool + "-" + val;
      var position = CURSOR_DATA[newTool];
      if ( anim ) $(cursor).animate({"left": position}, 150);
      else $(cursor).css({"left": position});
    }
  }
}

/////////////////////////////////////////////////////////////////
//                                    send toolbar data to editor
function sendtoEditor(tool, val) {
  var v = val;
  if ( tool == "color" ) {
    switch( val ) {
      case 'red':
        v = "#ff0000"; break;
      case 'green':
        v = COLOR_GREEN; break;
      case 'blue':
        v = "#0000ff"; break;
      case 'black':
        v = "#000000"; break;
      case 'custom':
        v = $(".color-custom").css("color");
    }
  }
  else {
    switch (val) {
      case 'true':
        v = true; break;
      case 'false':
        v = false; break;
    }
  }

  dataObj = {};
  dataObj[tool] = v;
  editor.setFormatAtSelection(dataObj);
}

/////////////////////////////////////////////////////////////////
//                                    toolbar update from editor
function setFormatAtToolbar(format) {
  var items = format.listitem;
  var color = format.color;
  console.log("couleur from ed: " + color);

  switch( color ) {
    case "#ff0000":
      color = 'red'; break;
    case COLOR_GREEN:
      color = 'green'; break;
    case "#0000ff":
      color = 'blue'; break;
    case "#000000":
      color = 'black'; break;
    case "ambiguous":
      color = "ambiguous"; break;
    default:
      color = "custom";
  }

  if ( color == "custom" ) {
    $(".color-custom").css("color", format.color);
  }

  activeTool("bold", format.bold);
  activeTool("size", format.size);
  activeTool("color", color);
  activeTool("title", format.title);
  activeTool("bullet", format.bullet);
  activeTool("frame", format.frame);
  activeTool("picture", format.picture);
}

// update cursor & activeTools
function activeTool(tool, value) {
  activeTools[tool] = value;
  moveCursor(tool, value, false);
}

function triggerPseudoMouseenter( decal ) {
  $("#blc-" + String(activeBlocId + decal)).trigger("mouseenter");
  $(".editor-text").css("border", "1px solid rgba(0, 0, 0, 0)");
  $("#txt-" + String(activeBlocId + decal)).css("border", "1px solid rgba(0, 0, 0, 0.15)");
}


// confirm dialog
function confirmDialog(title, body, action) {
  $("#confirmDialog .modal-title").text(title);
  $("#confirmDialog .modal-body p").text(body);
  $("#confirmDialog").attr("data-action", action);
  $("#confirmDialog").modal("show");
}

//*************************************************** askUserName
  function askUserName () {
    $('#modal-user-name').modal('show');
    $("#user-name").val('');
  }



////////////////////////////////////////////////  Fin F U N C T I O N S

//*********************************************************************
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

// Après méditations de Seb (Rempli le reste de l'écran avec la partie centrale de l'éditeur)
  $(window).on("load resize", function() {
    /*let grid = $(".box");
    let h = window.innerHeight;
    let remaining = h;
    for(let i = 0; i < grid.get(0).childNodes.length; i++){
      let n = grid.get(0).childNodes[i];
      if(n.classList && !n.classList.contains('hbox')){
        remaining -= $(n).outerHeight();
      }
    }
    */
    var remaining = window.innerHeight;
    $(".box").children().each( function () {
      if (this.classList && !this.classList.contains('hbox')){
        remaining -= $(this).outerHeight();
      }
    });
    $('.hbox').css({"max-height": remaining + "px", "margin": "0px"});
    //$('.hbox').css("margin", "0px");
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

    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 15);

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
    editor.setImage(imageId, e.target.result);
  };
  reader.readAsDataURL(file);     // ou readAsText(file);
});

$("#imageClickModal").on('hidden.bs.modal', function (ev) {
  var imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  var url = $("#imageClickModal").find("#image-url").val();
  // send url to editor
  if ( url ) editor.setImage(imageId, url);
  triggerPseudoMouseenter(0);
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
    if ( !file || !file.type.match(/image.*/) ) {
      // url
      var url = ev.dataTransfer.getData('text/uri-list');
      editor.setImage(imageId, url);
      setTimeout(function() {
        triggerPseudoMouseenter(0);
      }, 15);
    }
    else {
      // file
      var reader = new FileReader();
      reader.onload = function(e2) {
          var imageSrc = e2.target.result;
          editor.setImage(imageId, imageSrc);
          setTimeout(function() {
            triggerPseudoMouseenter(0);
          }, 15);
      };
    reader.readAsDataURL(file); // reading the file data.
  }
});

////////////////////////////////////////////////////////////
//                                             M E N U B A R

$(".main-menu, .hcollapsible").on("focus", function () {
  $(this).blur();
});

$("#editor").on("blur", ".editor-text", function () {
  lastBlockBlur = $(this).attr("id");
});

//////////////////////////////////////////
// new file
$("#newFile").on("click", function () {
  confirmDialog("Nouveau document", "Effacer la page actuelle ?", "newFile");
});
//////////////////////////////////////////
// read text files
$(".read-file").on("click", function () {
  globalMenuItem = $(this).attr("id");
  $("#openFileInput").trigger("click");
});

$("#openFileInput").on("change", readFile);

//////////////////////////////////////////
// write file
$(".write-file").on("click", function () {
  if ( $(this).attr("id") == "exportFilePDF" ) {
    onPDFClick();
  }
  else if ( $(this).attr("id") == "exportFileHTML" )  {
    writeFile( editor.toHTML(), "mon fichier.txt", "text/plain");
  }
  else writeFile( "contenu du fichier", "mon fichier.txt", "text/plain");
});

//////////////////////////////////////////
// edit menu
$("#cutItem").on("click", function() {
  document.execCommand("cut");
});
$("#copyItem").on("click", function() {
  document.execCommand("copy");
});
$("#pasteItem").on("click", function() {
  setTimeout(function() {
    $("#txt-" + String(activeBlocId)).focus();
  }, 10);
  document.execCommand("paste");
});

////////////////////////////////////////////////////////////////
//                                   T O O L B A R   E V E N T S

// jquery tool hover
  $(".tool, .tool-frame-bullet").mouseenter( function () {
    $(this).css({"top":"-5px", "cursor": "pointer"});
  } ).mouseleave( function () {
    $(this).css({"top":"0", "cursor": "default"});
  } );

$("#toolbarBottomMask").hover( function () {
  event.stopPropagation();
  event.preventDefault();
  return false;
});

//  tool click
  $(".tool, .tool-frame-bullet").on("click", function(e) {

    $(this).animate({"top": "-16px"}, 200,
      function () {
        $(this).animate({"top": 0}, 100,
          function () { $(this).blur();
        });
      }
    );

    toolClick(e, this);
    $(this).trigger("mouseleave");
    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 15);

  } );

//                                    C O L O R P I C K E R
//  colorpicker   $(".color-custom").spectrum("show")
  $(".color-custom").spectrum({
    chooseText: "choisir",
    cancelText: "annuler",
    color: "#ECC",
    showInput: false,
    showInitial: true,
    showPalette: true,
    showSelectionPalette: true,
    palette: [],
    maxSelectionSize: 6,
    preferredFormat: "hex",
    localStorageKey: "spectrum",
    clickoutFiresChange: false,
    move: function (color) {

    },
    show: function () {

    },
    beforeShow: function () {

    },
    hide: function(tinycolor) {
      $(".color-custom").css("color", tinycolor);
      sendtoEditor("color", tinycolor);
    },
    change: function() {

    }
  });

  /**
   * toolbar scrollbar
   */
   $("#toolbarScrollBar").on("mousedown", function (ev) {
     dragIsOn = true;
     dragMouseX0 = ev.clientX;
   });

  /**
  * toolbarScrollBar hover
  */
 $("#toolbarScrollBar").hover( function () {
   if ( TOOLBAR_WIDTH > $(body).width() ) {
     $("#toolbarScrollBar").css("cursor", "ew-resize");
   }
 }, function () {
   $("#toolbarScrollBar").css("cursor", "default");
 } );

  $("*").on("mousemove", function (ev) {
    if ( !dragIsOn ) return;
    var trueWidth = $(body).width();
    var offset = $("#toolbarlist").offset();
    var dragMouse = ev.clientX - dragMouseX0;
    dragMouseX0 = ev.clientX;
    if ( TOOLBAR_WIDTH > trueWidth ) {
      if ( offset.left >= 0  &&  dragMouse > 0)
          $("#toolbarlist").css({"left": 0});
      else if ( offset.left <= trueWidth - TOOLBAR_WIDTH  &&  dragMouse < 0)
          $("#toolbarlist").css({"left": trueWidth - TOOLBAR_WIDTH});
      else $("#toolbarlist").css({"left": offset.left + dragMouse});
    }
  });

  $("*").on("mouseup", function (ev) {
    dragIsOn = false;
  });

   /* wheel  ** UNUSED **
  $(document).on("wheel", function (ev) {
    if ( !ev.shiftKey ) return;
    if ( ev.originalEvent.wheelDeltaX > 0 ) $(".arrow-l").trigger("mousedown");
    else $(".arrow-r").trigger("mousedown");
  });
  */

/*
 * toolbar scroll button ** UNUSED **

  $(".arrow-l, .arrow-r").on("touchstart mousedown", function(e) {
  //  $(".arrow-l, .arrow-r").on(" pointerdown ", function(e) {
    if( mousedownID == -1 )  //anti loops!
      mousedownID = setInterval(function() {
        var offset = $("#toolbarlist").offset();
        var decal = 0;
        if ( $(e.target).hasClass("arrow-r") ) {
          if ( offset.left < TOOLBAR_DRAG_RANGE ) decal = 8;
        }
        else {
          if ( offset.left > -TOOLBAR_DRAG_RANGE ) decal = -8;
        }
        $("#toolbarlist").css({"top": 0, "left": offset.left + decal});
      }, 25);
  });
  */
/*
  $(".arrow-l, .arrow-r").on("mouseup mouseout touchend", function() {
  // $(".arrow-l, .arrow-r").on("pointerup pointerout ", function() {
    if( mousedownID != -1 ) {  // stop if exists
      clearInterval(mousedownID);
      mousedownID=-1;
    }
  });
  */

//  editor requires toolbar update
  $('#editor').on('currentformatchanged', function(e) {
    setFormatAtToolbar(e.detail.format);
  } );

  // toolbar init
  //initToolbar();

  $("#conted").on("mouseup", function(e) {
    //console.log(window.getSelection().toString());
    //console.log(window.getSelection().getRangeAt(0).toString());
  } );

  // ouverture port 9000
  $.ajax({
    'url': "https://sioux.univ-paris8.fr/standfordNLP/StandfordOpen.php"
  });

  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////// B L O C K S

// cacher #blockCmd
  $("#page").on("click", function ( ev ) {
    if (ev.target.id == "page") $("#blockCmd").css("opacity", 0);
    $(".editor-text").css("border", "1px solid rgba(0, 0, 0, 0)");
  });

//////////////////////////////////////////
// editor-block   ENTER
  $("#editor").on("mouseenter", ".editor-block", function (ev) {

  // hover  block text
    $(this).find(".editor-text").css("border", "1px solid rgba(0, 0, 0, 0.15)");

  // enable .block-move-up
    if ( activeBlocId == 0 ) {
      $("#blockCmd").find(".block-move-up").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-move-up").css({"opacity": 1, "pointer-events": "initial"});
    }
  // enable .block-move-down
    if ( $(this).next().length == 0 ) {
      $("#blockCmd").find(".block-move-down").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-move-down").css({"opacity": 1, "pointer-events": "initial"});
    }
  // enable .block-delete
    if ( $(this).siblings().length == 1 ) {
      $("#blockCmd").find(".block-delete").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-delete").css({"opacity": 1, "pointer-events": "initial"});
    }

    //  palette move
    var offset = $(this).offset();
    var left = $("#page").offset().left + 15;
    offset.left = left;
    var top = offset.top;
    var height = $(this).height();
    var commandHeight = $("#editor").find("#blockCmd").height();
    var decal = 0;
    if ( $("#blc-" + String(activeBlocId)).hasClass("frame") ) decal = 5;
    top = top + ((height - commandHeight) /2 + decal);
    offset.top = top;

    $("#blockCmd").css({"opacity": 1});
    $("#blockCmd").offset(offset);
    //$("#blockCmd").animate({"top": offset.top, "left": offset.left}, 100);
  });

  //////////////////////////////////////////
  // blockCmd LEAVE
  $("#editor").on("mouseleave", "#blockCmd", function (ev) {
    triggerPseudoMouseenter(0);
  });

  //////////////////////////////////////////
  // .editor-block  LEAVE
  $("#editor").on("mouseleave", ".editor-block", function (ev) {
    $(this).trigger("mouseenter");
  });

  //////////////////////////////////////////
  // update #blockCmd from keyboard
  $("#editor").on("keyup", ".editor-block", function (ev) {
    $(this).trigger("mouseenter");
  });

  ///////////////////////////////
  //  update palette activeBlocId
  $("#page").on("mousemove", function (ev) {
    var mouseY = ev.pageY;
    var target = ev.target;

    $(".editor-block").each( function (index) {
      var blockTop = $(this).offset().top;
      var blockHeight = $(this).height();
      if ( mouseY > blockTop && mouseY < blockTop + blockHeight ) {
        if ( target.id == "page" || $(target).hasClass("editor-block") || $(target).closest(".editor-block").length == 1 )  {
          activeBlocId = Number($(this).attr("id").split("-")[1]);
          $("#blockCmd").find("span").text(activeBlocId + 1);
          triggerPseudoMouseenter(0);
        }
      }
    });
  });

/////////////////////////////////////  B L O C K   C O M M A N D S

//  insertBlockBefore
  $("#blockCmd .block-new-up").on("click", function (ev) {
    var interBloc = 14;
    var newBlc = 100;
    var top = $("#blockCmd").position().top;
    var blockHeight = $("#blc-" + String(activeBlocId)).height();
    var commandHeight = $("#blockCmd").height();
    var upHeight = (blockHeight + commandHeight) /2;
    editor.insertBlockBefore( activeBlocId, "", true);
    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 15);
  });

  // insertBlockAfter
    $("#blockCmd .block-new-down").on("click", function (ev) {
      var interBloc = 14;
      var top = $("#blockCmd").position().top;
      var blockHeight = $("#blc-" + String(activeBlocId)).height();
      var commandHeight = $("#blockCmd").height();
      var downHeight = (blockHeight + commandHeight) /2;
/*
      $("#blockCmd").animate({"top": top + downHeight + interBloc}, 300, function () {
        editor.insertBlockAfter( activeBlocId, "", true);
        setTimeout( function () {
          triggerPseudoMouseenter(1);  // 1
        }, 15);
      });
*/
      editor.insertBlockAfter( activeBlocId, "", true);
      setTimeout( function () {
        activeBlocId++;
        $("#blockCmd").find("span").text(activeBlocId + 1);
        triggerPseudoMouseenter(0);
      }, 15);
    });

//  removeBlockAt
  $("#blockCmd .block-delete").on("click", function (ev) {
    if ( $(".editor-block").length == 1 ) return;

    $("#blc-" + String(activeBlocId)).slideUp(200);

    setTimeout( function () {
      editor.removeBlockAt(activeBlocId, activeBlocId);
    }, 220);

    if ( $("#blc-" + String(activeBlocId)).next().length == 0 ) {
      setTimeout( function () {
        activeBlocId--;
        $("#blockCmd").find("span").text(activeBlocId + 1);
        triggerPseudoMouseenter(0);
      }, 240);
    }
  });

//  moveBlockDown
  $("#blockCmd .block-move-down").on("click", function (ev) {
    var interBloc = 14;
    var top = $("#blockCmd").position().top;
    var downHeight = $("#blc-" + String(activeBlocId + 1)).height();

    $("#blockCmd").animate({"top": downHeight + top + interBloc}, 300, function () {
      editor.moveBlockDown( activeBlocId);
    });

    setTimeout( function () {
      activeBlocId++;
      $("#blockCmd").find("span").text(activeBlocId + 1);
      triggerPseudoMouseenter(0);
    }, 330);

  });

//  moveBlockUp
  $("#blockCmd .block-move-up").on("click", function (ev) {
    var interBloc = 14;
    var top = $("#blockCmd").position().top;
    var upHeight = $("#blc-" + String(activeBlocId - 1)).height();

    $("#blockCmd").animate({"top": top - upHeight - interBloc}, 300, function () {
      editor.moveBlockUp( activeBlocId);
    });

    setTimeout( function () {
      activeBlocId--;
      $("#blockCmd").find("span").text(activeBlocId + 1);
      triggerPseudoMouseenter(0);
    }, 330);

  });

  // resize & focus
  $( window ).on("resize focus", function () {
    triggerPseudoMouseenter(0);
    var move = ($(body).width() - TOOLBAR_WIDTH) /2 + TOOLBAR_DECAL;
    $("#toolbarlist").css({"left": move});
    if ( TOOLBAR_WIDTH < $(body).width() ) {
      $("#toolbarScrollBar").css({"background-color": TOOL_BACK_COLOR});
    }
    else {
      $("#toolbarScrollBar").css({"background-color": "white"});
    }
  });

  ////////////////////////////////////   DIVERS
  $(function () { // enable tooltips
    $('[data-toggle="tooltip"]').tooltip({delay: {"show": 500, "hide": 100}});
  });

  // confirm dialog result
  $("#confirmDialog .ok").on("click", function () {
    var action = $("#confirmDialog").attr("data-action");
    if ( action.match(/newFile/) ) { // (action == newFile) marche pas!
      editor.clear();
    }
  });

  // before page display
  setTimeout(function () {
    $("#blc-0").trigger("mouseenter");
    $( window ).trigger("resize");
    $('body').css({"visibility":"visible"});
  }, 300);

  // new connection
  $(window).on("load", function() {
  	var version = navigator.platform + ' ' + navigator.userAgent;
  	$.ajax({
  		url: 'connection_count.php',
  		type:'post',
  		data: {'version':version, 'user':localStorage.user}
  	});
  });


  // -----------------------------------    prevent stuff
  document.addEventListener('backbutton', function(event) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  }, false);

  $("body").css({"overflow-y": "hidden"}); // stop pull-down-to-refresh

}); // ******************************************************  F I N   R E A D Y
//  ****************************************************************************

// user

if ( localStorage.user == undefined || localStorage.user != "ok" ) window.location = "http://sioux.univ-paris8.fr/simples/index.html";


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

    "title-h1": "-132px",
    "title-h2": "-107px",
    "title-h3": "-81px",
    "title-h4":"-58px",

    "bullet-true": "-16px",

    "frame-true": "-16px",

    "picture-true": "-17px",

};

const BOLD_INIT = false;
const SIZE_INIT = "s1";
const COLOR_INIT = "black";
const TITLE_INIT = "none";
const BULLET_INIT = false;
const FRAME_INIT = false;
const PICTURE_INIT = true;
const TOOLBAR_WIDTH = 840; /* 844; */
const TOOLBAR_DECAL = 0; /* 22 */
const TOOL_BACK_COLOR = "#f0f0f0";
const COLOR_GREEN = "#2ea35f";

var activeTools = {}; // tools present state
var mousedownID = -1;
var dragIsOn = false;
var dragMouseX;

var globalMenuItem; // id menu item à envoyer à l'aditeur  avec fichier texte
var lastBlockBlur = ""; // id dernier bloc
var activeBlocId = 0; // id bloc actif

var slider = document.getElementById('zoom-range');
var page = document.getElementById('page');

var analysisContent = document.getElementById('analysis-content');
var stanfordConnection = document.getElementById('stanford-connection');
var lexique3Connection = document.getElementById('lexique3-connection');
var lexique3Progress = document.getElementById('lexique3-progress');

initToolbar();

// Appelle la fonction pour le zoom dés le début.
//refreshPageScale();

// slider.oninput = refreshPageScale;
