//index.js


////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// F U N C T I O N S
////////////////////////////////////////////////////////////////////

// Ecriture fichier texte sur disque
function writeFile(data, filename, type) {
  var file = new Blob([data], {type: type});
  var a = document.createElement("a");
  var url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url); // free memory
  }, 0);
}

// lecture fichier .smp et envoie à l'éditeur
function readFile(ev) {
  var file = ev.target.files[0];
  if ( !file || !( file.name.match(/.smp$/)) ) return;
  var reader = new FileReader();
  reader.onload = function(ev2) {
    previousDocContent = ev2.target.result;
    editor.load(JSON.parse(previousDocContent));
    $("#openFileInput").val(""); // force value to be seen as new
    setTimeout( function () {
      triggerPseudoMouseenter(0); // palette position
    }, 150);
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
      `<input type='button' data-placement="bottom" data-trigger="hover" data-toggle="popover" title='${frequencyToText(complexWords[i].frequency)}' data-content="${description(frequencyToText(complexWords[i].frequency))}" class='btn btn-outline-danger btn-sm' type="button"  value='${complexWords[i].text}'
      onclick='editor.selectFirst("${complexWords[i].text}", true);' />`);
    }
    $('[data-toggle="popover"]').popover();
  } else {
    analysisContent.insertAdjacentHTML('beforeend',`<div class="alert alert-success" role="alert">Les mots semblent simples !</div>`);
  }
}

function description (frequency) {
  switch (frequency) {
    case 'inconnu': return "Ce mot n'est pas présent dans notre base de donnée.";
    case 'commun': return 'Ce mot est commun dans les livres ou dans les films.';
    case 'rare': return 'Ce mot est rare dans les livres ou dans les films.';
    case 'très rare': return 'Ce mot est très rare dans les livres ou dans les films.';
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

  $("#toolbarlist").children().each( function (i, elem) {
    $(elem).css("left", TOOLBAR_BLOCK_LEFT[elem.id]);
  });

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
/*
/////////////////////////////////////////////////////////////////
//                                            hide toolbar block
function hideToolbarBlock(blockId) {
  // $("#color").animate({"opacity": "0"}, 150); $("#title").animate({"left": "-400"}, 150);
  var left0 = TOOLBAR_BLOCK_LEFT[blockId];
  var left, last;
  $("#" + blockId).css("visibility", "hidden");
  $("#" + blockId).find(".tool-cursor").css("visibility", "hidden");
  last = $("#" + blockId).children().last();
  var leftLimit = 0;

  //if ( last.hasClass("tool-limit") ) {
  //  leftLimit = last.css("left");
  //  leftLimit = Number(/(.*)px$/.exec(leftLimit)[1]);
  //}

  $("#" + blockId).nextAll().each( function (i, elem) {
    elemLeft = TOOLBAR_BLOCK_LEFT[elem.id];
    if ( i == 0 ) left = elemLeft - left0 + leftLimit;
    $(elem).animate({"left": elemLeft + left}, 500);
  });
}
*/
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
  //$(".editor-text").css("border", "1px solid rgba(0, 0, 0, 0)");
  //$("#txt-" + String(activeBlocId + decal)).css("border", "1px solid rgba(0, 0, 0, 0.15)");
}

// page is empty
function pageEmpty() {
  if ( $("#editor").children().length > 1 || $("#txt-0").text() != "" ) return false;
  else return true;
}

// confirm dialog show or trigger
function confirmDialog(title, body, action) {
  $("#confirmDialog .modal-title").text(title);
  $("#confirmDialog .modal-body p").text(body);
  $("#confirmDialog").attr("data-action", action);
  if ( action == "newFile" || action == "loadFile" ) {
    var saved;
    editor.saveAsync().then(function (val) {
      if ( pageEmpty() ) saved = true;
      else if ( previousDocContent == JSON.stringify(val) ) saved = true;
      else saved = false;

      if ( saved ) $("#confirmDialog .ok").trigger("click");
      else if ( confirm(body) ) $("#confirmDialog .ok").trigger("click");
    });
  }
}

// askUserName
  function askUserName () {
    $('#modal-user-name').modal('show');
    $("#user-name").val('');
  }

// alert
  function simplesAlert(title) {
    $("#simplesAlert .modal-title").text(title);
    $("#simplesAlert").modal("show");
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
        onVerifyClick();
      }
      else {
          $(".hcollapsible").trigger("click").blur();
      }
  } );

  $("#redo-analyse").on("click", function () {
    $(this).blur();
    onVerifyClick();
  });

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

    // $(".hcollapsible").css("background-color", "#6c757d");

    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 15);

  } );

///////////////////////////////////////////////////
//                         blockcreated (editor event)
$("#editor").on("blockcreated", function (ev) {
  activeBlocId = ev.detail.intid;
  $("#blockCmd").find("span").text(activeBlocId + 1);
  triggerPseudoMouseenter(0);
});

///////////////////////////////////////////////////
//                      blockdestroyed (editor event)
$("#editor").on("blockdestroyed", function (ev) {
  var oldBlock = ev.detail.intid;
  if ( oldBlock > 0 && $("#blc-" + String(oldBlock)).next().length == 0 ) {
    // palette update when removing last (but not only) block
    activeBlocId = oldBlock - 1;
  }
  else activeBlocId = oldBlock;
  $("#blockCmd").find("span").text(activeBlocId + 1);
  triggerPseudoMouseenter(0);
});

////////////////////////////////////////////////////
//                               image modal dialog

//----------------------------------
// display web images in the image modal dialog
function displayWebImages(imgURLs) {
  /* imgURLs syntax:
  { arassaac: ["img1","img2"]
  sclera: ["img1","img2","img3"]
  serchText: ["mot1 mot2"]}
  */
  $("#imageClickModal").find(".modal-images").html(""); // clear images
  $("#imageClickModal").find("#image-url").val(imgURLs.searchText); // keywords

  var arasaac = imgURLs.arasaac;
  if ( arasaac.length ) {
    for (let i = 0; i < arasaac.length; i++) {
      let imgTag = '<img src="' + arasaac[i] + '" class="web-img">';
      $("#imageClickModal").find(".arasaac").append(imgTag);
    }
    $("#imageClickModal").find(".arasaac-lab").css("display", "inline-block");
  }
  else $("#imageClickModal").find(".arasaac-lab").css("display", "none");

  var sclera = imgURLs.sclera;
  if ( sclera.length ) {
    for (let i = 0; i < sclera.length; i++) {
      let imgTag = '<img src="' + sclera[i] + '" class="web-img">';
      $("#imageClickModal").find(".sclera").append(imgTag);
    }
    $("#imageClickModal").find(".sclera-lab").css("display", "inline-block");
  }
  else $("#imageClickModal").find(".sclera-lab").css("display", "none");
}  // end displayWebImages
//------------------------

// image dialog opening from editor block
$("#editor").on("click", ".editor-image", function(ev) {
  $(".loader").show();
  $("#imageClickModal").find("#imgFromDisk").attr("data-id", "#" + ev.target.id);
  $("#imageClickModal").find("#image-url").val(null);
  getImagesSuggestions(activeBlocId).then(function (result) {
    displayWebImages(result);
    $("#imageClickModal").modal();
    $(".loader").hide();
  });
});

// trigger input file tag in image dialog
$("#imgButtonFromDisk").on("click", function () {
  $("#imgFromDisk").trigger("click");
});

// input file tag in image dialog: Read file from disk, send to editor
$("#imgFromDisk").on("change", function (e) {
  var file = e.target.files[0];
  if ( !file || (!file.type.match(/image.*/)) ) {
    $("#imageClickModal .close").trigger("click");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    $("#imageClickModal .close").trigger("click");
    var imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
    editor.setImage(imageId, e.target.result);
    $("#imgFromDisk").val(""); // force value to be seen as new
  };
  reader.readAsDataURL(file);     // ou readAsText(file);
});

// send image url OR keyword to editor
$("#imageClickModal").find("#modalFind").on("click", function (ev) {
  var imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  var urlOrKeyword = $("#imageClickModal").find("#image-url").val();
  if ( urlOrKeyword ) {
    if ( urlOrKeyword.match(/^https?:\/\//) ) {
      $("#imageClickModal").modal('hide');
      editor.setImage(imageId, urlOrKeyword);
      triggerPseudoMouseenter(0);
    }
    else {
      $(".loader").show();
      getImagesForKeyword(urlOrKeyword).then(function (result) {
        displayWebImages(result);
        $(".loader").hide();
      });
    }
  }
});

// trigger #modalFind from Keyboard
$("#imageClickModal").find("#image-url").on("keyup", function(ev) {
  if (ev.keyCode === 13) {
    ev.preventDefault();
    $("#imageClickModal").find("#modalFind").trigger("click");
    $(this).blur();
  }
});

// send web image to editor
$("#imageClickModal").on("click", ".web-img", function (ev) {
  var imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  var url = $(ev.target).attr("src");
  editor.setImage(imageId, url);
  $(".loader").show();
  $("#imageClickModal").find("#image-url").val(null);
  $("#imageClickModal .close").trigger("click");
});

//  ***************************  image drag & drop  ************

// prevention du drop n'importe ou
$(document).on('drop dragover', function(e){
  if ( !( $(e.target).hasClass("editor-image") ) )
    return false;
});

$("#editor").on("dragover", ".editor-image", function(e) {
    e.stopPropagation();
    e.preventDefault();
    var ev = e.originalEvent;
    ev.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
  $("#editor").on("drop", ".editor-image", function(e) {
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

////////////////////////////////////////// file menu
// Nouveau...
$("#newFile").on("click", function () {
  confirmDialog("Nouveau document", "Effacer la page actuelle", "newFile");
  // window.open(document.URL, '_blank');
});

//////////////////////////////////////////
// Nouveau sur un modèle...
$("#newModelFile").on("click", function () {
  simplesAlert("En chantier!");
  //  confirmDialog("Nouveau document", "Effacer la page actuelle", "newFile");
});
//////////////////// readFile
// Ouvrir...
$("#openFile").on("click", function () {
  confirmDialog("Ouvrir un document sauvegardé", "Effacer la page actuelle", "loadFile");
  //localStorage.setItem('simplesLoadFile', 'yes');
  //window.open(document.URL, '_blank');
});
// Importer...
$("#importFile").on("click", function () {
  simplesAlert("En chantier!");
  //  confirmDialog("Importer un document", "Effacer la page actuelle", "loadFile");
});

/////////////////////  write file
$(".write-file").on("click", function () {
  // Exporter au format PDF...
  if ( $(this).attr("id") == "exportFilePDF" ) {
    onPDFClick();
  }
  // Exporter au format HTML...
  else if ( $(this).attr("id") == "exportFileHTML" )  {
    writeFile(editor.toHTML(), "mon fichier.txt", "text/plain");
  }
  // Enregistrer...
  else if ( $(this).attr("id") == "saveFile") {
    editor.saveAsync().then(function (val) {
      let jsonContent = JSON.stringify(val);
      writeFile(jsonContent, "mon fichier.smp", "text/plain");
      previousDocContent = jsonContent;
    });
  }
//  else writeFile( "contenu du fichier", "mon fichier.txt", "text/plain");
});

////////////////////////////////// edit menu

$("#cutItem").on("click", function() {
  //document.execCommand("cut");
  editor.cut();
});
$("#copyItem").on("click", function() {
  //document.execCommand("copy");
  editor.copy();
});
$("#pasteItem").on("click", function() {
  //simplesAlert("En chantier!");
  //document.execCommand("paste");
  editor.paste();
});

///////////////////////////////// Resources menu
// Importer un dictionnaire...
$("#importDic").on("click", function () {
  simplesAlert("En chantier!");
});

// Exporter un dictonnaire...
$("#exportDic").on("click", function () {
  simplesAlert("En chantier!");
});

// Importer un lexique...
$("#importLex").on("click", function () {
  simplesAlert("En chantier!");
});

// Exporter un lexique...
$("#exportLex").on("click", function () {
  simplesAlert("En chantier!");
});

///////////
// readFile input dialog
$("#openFileInput").on("change", readFile);

///////////////////////////////// Aide menu
// Aide...
$("#aideItem").on("click", function () {
  $("#helpAlert").modal("show");

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


// hide #blockCmd
  $("#page").on("click", function ( ev ) {
    if (ev.target.id == "page") $("#blockCmd").css("opacity", 0);
    $("#blc-" + activeBlocId).css("background-color", "white");
  });
//////////////////////////////////////////
// editor-block   ENTER
  $("#editor").on("mouseenter", ".editor-block", function (ev) {

  // hover  block
    $(".editor-block").css("background-color", "white");
    $("#blc-" + activeBlocId).css("background-color", "#f6f6f6");

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
    if ( $(this).siblings().length == 0 ) { // only 1 block
      $("#blockCmd").find(".block-delete").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-delete").css({"opacity": 1, "pointer-events": "initial"});
    }

    //  palette move
    var offset = $(this).offset();
    var left = $("#page").offset().left + 4; // + 15;
    offset.left = left;
    var top = offset.top;
    var height = $(this).height();
    var commandHeight = $("#blockCmd").height();
    var decal = 0;
    if ( $("#blc-" + String(activeBlocId)).hasClass("frame") ) decal = 5;
    //top = top + ((height - commandHeight) /2 + decal); // centered palette
    var decalPalette = 5;
    top = top + decal - decalPalette; // top aligned palette
    offset.top = top;

    $("#blockCmd").css({"opacity": 1});
    $("#blockCmd").offset(offset);
    //$("#blockCmd").animate({"top": offset.top, "left": offset.left}, 100);
  });

  //////////////////////////////////////////
  // blockCmd LEAVE
  $("#blockCmd").on("mouseleave", function (ev) {
    triggerPseudoMouseenter(0);
  });

  //////////////////////////////////////////
  // .editor-block  LEAVE
  $("#editor").on("mouseleave", ".editor-block", function (ev) {
    triggerPseudoMouseenter(0);
  });

  //////////////////////////////////////////
  // update #blockCmd from keyboard
  $("#editor").on("keyup", ".editor-block", function (ev) {
    triggerPseudoMouseenter(0);
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
          let oldBlocId = activeBlocId;
          activeBlocId = Number($(this).attr("id").split("-")[1]);
          if ( oldBlocId != activeBlocId ) {
            $("#blc-" + oldBlocId).css("background-color", "white");
            $("#blc-" + activeBlocId).css("background-color", "#f6f6f6");
          }
          $("#blockCmd").find("span").text(activeBlocId + 1);
          triggerPseudoMouseenter(0);
        }
      }
    });
  });

/////////////////////////////////////  B L O C K   C O M M A N D S


  //  insertBlockBefore
  $("#blockCmd .block-new-up").on("click", function (ev) {
    editor.insertBlockBefore( activeBlocId, "", true);
    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 15);
  });

  //  insertImageBlockBefore
  $("#blockCmd .block-new2-up").on("click", function (ev) {
    editor.insertImageBlockBefore( activeBlocId, true);
    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 15);
  });

  // insertBlockAfter
    $("#blockCmd .block-new-down").on("click", function (ev) {
      editor.insertBlockAfter( activeBlocId, "", true);
      setTimeout( function () {
        $("#blockCmd").find("span").text(activeBlocId + 1);
        triggerPseudoMouseenter(0);
      }, 15);
    });

  // insertImageBlockAfter
    $("#blockCmd .block-new2-down").on("click", function (ev) {
      editor.insertImageBlockAfter( activeBlocId, true);
      setTimeout( function () {
        $("#blockCmd").find("span").text(activeBlocId + 1);
        triggerPseudoMouseenter(0);
      }, 15);
    });



//  removeBlockAt
  $("#blockCmd .block-delete").on("click", function (ev) {
    editor.removeBlockAt(activeBlocId, activeBlocId);
    // wait for animation ending
    setTimeout( function () {
      // palette update when removing last (but not only) block
      if ( activeBlocId > 0 && $("#blc-" + String(activeBlocId)).next().length == 0 ) {
        activeBlocId--;
        $("#blockCmd").find("span").text(activeBlocId + 1);
      }
      triggerPseudoMouseenter(0);
    }, 150);
  });

//  moveBlockDown
  $("#blockCmd .block-move-down").on("click", function (ev) {
    editor.moveBlockDown(activeBlocId);
    // wait for animation ending
    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 300);
  });

//  moveBlockUp
  $("#blockCmd .block-move-up").on("click", function (ev) {
    editor.moveBlockUp(activeBlocId);
    // wait for animation ending
    setTimeout( function () {
      triggerPseudoMouseenter(0);
    }, 300);
  });

///////////////////////////////

//  show/hide .block-new2
  $("#blockCmd .block-new-up").mouseenter( function () {
    $(".block-new2-up").css("display","block");
  } ).mouseleave( function () {
    $(".block-new2-up").css("display","none");
  } );
  $("#blockCmd .block-new2-up").mouseenter( function () {
    $(".block-new2-up").css("display","block");
  } ).mouseleave( function () {
    $(".block-new2-up").css("display","none");
  } );

  $("#blockCmd .block-new-down").mouseenter( function () {
    $(".block-new2-down").css("display","block");
  } ).mouseleave( function () {
    $(".block-new2-down").css("display","none");
  } );
  $("#blockCmd .block-new2-down").mouseenter( function () {
    $(".block-new2-down").css("display","block");
  } ).mouseleave( function () {
    $(".block-new2-down").css("display","none");
  } );

////////////////////////////////////////////////////////////////////////
/////////////////////////////                  I M A G E  W I D G E T S

  $("#editor").on("mouseenter", ".editor-image", function (ev) {
    $(this).css("border", "2px solid #4b4");
    $(".img-widget").css("display", "block");
    $(".img-widget.block-delete").attr("data-true-imageID", $(this).attr("id"));
    $(".img-widget.block-delete").attr("data-block-id", ($(this).attr("id")).split("-")[1]);
    $(".img-widget.block-delete").attr("data-image-id", ($(this).attr("id")).split("-")[2]);

    let widgetOffset = $(ev.target).offset();
    widgetOffset.left += $(this).width() - 14;
    widgetOffset.top += -16;
    $(".img-widget.block-delete").offset(widgetOffset);

    if ( $(this).parent().hasClass("col") ) {
      var decal = $(this).height() /40;
      widgetOffset = $(ev.target).offset();
      widgetOffset.left += $(this).width() - 14;
      widgetOffset.top += $(this).height() - 33 - decal;
      $(".img-widget.block-new-right").offset(widgetOffset);

      widgetOffset = $(ev.target).offset();
      widgetOffset.left += $(this).width() - 14;
      widgetOffset.top += $(this).height() - 67 - decal;
      $(".img-widget.block-move-right").offset(widgetOffset);

      widgetOffset = $(ev.target).offset();
      widgetOffset.left += -16;
      widgetOffset.top += $(this).height() - 33 - decal;
      $(".img-widget.block-new-left").offset(widgetOffset);

      widgetOffset = $(ev.target).offset();
      widgetOffset.left += -16;
      widgetOffset.top += $(this).height() - 67 - decal;
      $(".img-widget.block-move-left").offset(widgetOffset);

      if ( $(this).parent().next().length == 0 ) {
        $(".img-widget.block-move-right").css("display", "none");
      }
      if ( $(this).parent().prev().length == 0 ) {
        $(".img-widget.block-move-left").css("display", "none");
      }
    }
    else {
      $(".img-widget").css("display", "none");
      $(".img-widget.block-delete").css("display", "block");
    }
  });
////
  $("#editor").on("mouseleave", ".editor-image", function (ev) {
      $(this).css("border", "2px solid rgba(0, 0, 0, 0)");
      $(".img-widget").css("display", "none");
  });
////
  $("#page").on("mouseenter", ".img-widget", function (ev) {
    var trueImageID = "#" + $(".img-widget.block-delete").attr("data-true-imageID");
    if ( $(this).hasClass("block-delete") ) {
      if ( $(trueImageID).parent().hasClass("col") ) $(".img-widget").css("display", "block");
      else $(this).css("display", "block");
    }
    else $(".img-widget").css("display", "block");

    if ( $(trueImageID).parent().next().length == 0 ) {
      $(".img-widget.block-move-right").css("display", "none");
    }
    if ( $(trueImageID).parent().prev().length == 0 ) {
      $(".img-widget.block-move-left").css("display", "none");
    }

    $("#" + $(".img-widget.block-delete").attr("data-true-imageid")).css("border", "2px solid #4b4");
  });
  ////
  $("#page").on("mouseleave", ".img-widget", function (ev) {
    $("#" + $(".img-widget.block-delete").attr("data-true-imageid")).css("border", "2px solid rgba(0, 0, 0, 0)");
    $(".img-widget").css("display", "none");
  });

//  image actions
  $("#page").on("click", ".img-widget", function (ev) {
    var trueImageID = "#" + $(".img-widget.block-delete").attr("data-true-imageID");
    if ( $(trueImageID).parent().hasClass("col") ) {
      var blockID = Number($(".img-widget.block-delete").attr("data-block-id"));
      var imageID = Number($(".img-widget.block-delete").attr("data-image-id"));
      if ( $(this).hasClass("block-delete") )
        editor.removeImageInBlock(blockID, imageID);
      else if ( $(this).hasClass("block-new-right"))
        editor.insertImageInBlockAfter(blockID, imageID);
      else if ( $(this).hasClass("block-new-left"))
        editor.insertImageInBlockBefore(blockID, imageID);
      else if ( $(this).hasClass("block-move-left"))
        editor.moveImageLeft(blockID, imageID);
      else if ( $(this).hasClass("block-move-right"))
        editor.moveImageRight(blockID, imageID);
    }
    else { // click image on text block
      $("#picture .tool-frame-bullet").trigger("click");
    }
    $(".img-widget").css("display", "none");
  });

/////////////////////////////////////////  D I V E R S
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
    if ( TOOLBAR_WIDTH < $(body).width() - LOGO_DECAL) {
      $("#logoLirec").css("visibility","visible");
    }
    else {
      $("#logoLirec").css("visibility","hidden");
    }

  });

  $(function () { // enable tooltips
    $('[data-toggle="tooltip"]').tooltip({delay: {"show": 1000, "hide": 100}});
  });

  // confirm dialog with ok result
  $("#confirmDialog .ok").on("click", function () {
    var action = $("#confirmDialog").attr("data-action");
    if ( action == "newFile" ) { // Fichier/Nouveau
      editor.clear();
      setTimeout( function () {
        $("#blc-0").trigger("mouseenter"); // palette position
      }, 15);
    }
    else if ( action == "loadFile" ) { // Fichier/Ouvrir...
      $("#openFileInput").attr("accept", ".smp");
      $("#openFileInput").trigger("click");
    }
  });

  // new connection
  $(window).on("load", function() {
    var version = navigator.platform + ' ' + navigator.userAgent;
    $.ajax({
      url: 'connection_count.php',
      type:'post',
      data: {'version':version, 'user':localStorage.user}
    });
  });

  /////////////////////////////////
  //// close tab backstop function
  function backstop (event) {
    var saved;
    editor.saveAsync().then(function (val) {
      if ( pageEmpty() ) saved = true;
      else if ( previousDocContent == JSON.stringify(val) ) saved = true;
      else saved = false;

      if ( saved ) event.preventDefault(); // without dialog
      else if ( !navigator.userAgent.match(/Firefox/) )
                event.returnValue = "\o/"; // with dialog firefox
      else; // with dialog webkit
    });
  }

  //// close tab backstop event
  window.addEventListener("beforeunload", backstop);


  // image loaded (editor event) hide gif
  $("#editor").on("imageloaded", function (ev) {
    $(".loader").hide();
  });

  ////////////////////////////////////////////
  // before body display
  setTimeout(function () {
    initToolbar();
    $("#blc-0").trigger("mouseenter");
    $( window ).trigger("resize");
    $('body').css({"visibility":"visible"});
  }, 200);
  /*
    if ( localStorage.getItem('simplesLoadFile') == 'yes' ) {
      localStorage.removeItem('simplesLoadFile');
      console.log('effacer localStorage');
      $("#openFileInput").attr("accept", ".smp");
      $("#openFileInput").trigger("click");
    }
  */

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
const LOGO_DECAL = 65;
const TOOL_BACK_COLOR = "#f0f0f0";
const COLOR_GREEN = "009940"; // "#2ea35f";

const TOOLBAR_BLOCK_LEFT = {"bold": 0, "size": -64, "color": -158, "title": -240, "bullet": -328, "frame": -355, "picture": -390};

var activeTools = {}; // tools present state
var mousedownID = -1;
var dragIsOn = false;
var dragMouseX;

var globalMenuItem; // id menu item à envoyer à l'aditeur  avec fichier texte
var lastBlockBlur = ""; // id dernier bloc
var activeBlocId = 0; // id bloc actif

var previousDocContent = ""; // empty, saved or loaded file content

var slider = document.getElementById('zoom-range');
var page = document.getElementById('page');

var analysisContent = document.getElementById('analysis-content');
var stanfordConnection = document.getElementById('stanford-connection');
var lexique3Connection = document.getElementById('lexique3-connection');
var lexique3Progress = document.getElementById('lexique3-progress');



// Appelle la fonction pour le zoom dés le début.
//refreshPageScale();

// slider.oninput = refreshPageScale;
