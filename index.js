//index.js


////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// F U N C T I O N S
////////////////////////////////////////////////////////////////////

// Ecriture fichier texte sur disque
function writeFile(data, filename, type) {
  var file;
  if (data instanceof Blob) {
    file = data;
  } else {
    file = new Blob([data], {type: type});
  }
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
      blockArrayLeave(); // palette position
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
/*function displayAnalysisResults(event){
  // Ajoute les résultats à la page d'analyse.
  let complexWords = event.detail.complexWords;
  analysisContent.innerHTML = "";
  if(complexWords.length > 0){
    analysisContent.insertAdjacentHTML('beforeend',`<div class="alert alert-danger" role="alert">${complexWords.length} mots compliqués !</div>`);
    for(var i = 0; i < complexWords.length; i++){
      let synonyms = '';
      let content = `<p>${description(frequencyToText(complexWords[i].frequency))}</p>`;
      if (complexWords[i].dictionary.meanings.length > 0) {
        for (let j = 0; j < complexWords[i].dictionary.meanings[0].synonyms.length; j++) {
          synonyms += complexWords[i].dictionary.meanings[0].synonyms[j] + ' ';
        }
        content += `<p><strong>Définition :</strong><br/>${complexWords[i].dictionary.meanings[0].definition}</p><p><strong>Synonymes :</strong><br/>${synonyms}</p>`;
      }
      let popover = `data-html="true" data-placement="left" data-trigger="click" data-toggle="popover" title='${frequencyToText(complexWords[i].frequency)}' data-content="${content}"`;
      analysisContent.insertAdjacentHTML('beforeend',
      `<input type='button' ${popover} class='btn btn-outline-danger btn-sm' type="button"  value='${complexWords[i].text}'
      onclick='editor.selectFirst("${complexWords[i].text}", true);' />`);
    }
    $('[data-toggle="popover"]').popover();
  } else {
    analysisContent.insertAdjacentHTML('beforeend',`<div class="alert alert-success" role="alert">Les mots semblent simples !</div>`);
  }
}*/

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

function showRule(rule) {
  let tab = '', color = 'black';
  switch (rule.priority) {
    case 3: tab = 'main'; break;
    case 2: tab = 'veryImportant'; break;
    case 1: tab = 'important'; break;
  }
  let regexp;
  if(!Utils.isNullOrUndefined(rule.success)) {
    color = rule.success ? 'green': 'red';
    regexp = rule.success ? null : rule.info.focusPattern;
  }
  let appendedContent = rule.info.append || '';
  regexp = Utils.isNullOrUndefined(regexp) ? '' : "<button type='button' data-toggle='tooltip' data-placement='left' title='Trouver dans le document' class='ruleButton' onclick=\"editor.selectNextMatch(" + regexp.toString() + ");\"><i class='fas fa-search'></i></button>";
  $(`#analysis-${tab}-content ul`).append(`<li style="color: ${color}"><div><div>${rule.rule}</div>${appendedContent}</div>${regexp}</li>`);
  $(`#analysis-${tab}-content ul li`).hide();
}

function displayAnalysisResults(result) {
  $("#result-export")[0].analysisResults = result;
  // Mise à jour des scores.
  $('#mainRules').text(result.mainRulesSuccess);
  $('#veryImportantRules').text(result.veryImportantRulesSuccess);
  $('#importantRules').text(result.importantRulesSuccess);
  $('.score').text(result.score);
  // Ajout des items dans les différentes catégories.
  // Draw errors first.
  for (let i = 0; i < result.rules.length; i++) {
    if(Utils.isNullOrUndefined(result.rules[i].success)) continue;
    if(result.rules[i].success) continue;
    showRule(result.rules[i]);
  }
  // Draw undefined next.
  for (let i = 0; i < result.rules.length; i++) {
    if(!Utils.isNullOrUndefined(result.rules[i].success)) continue;
    showRule(result.rules[i]);
  }
  // Draw successful last.
  for (let i = 0; i < result.rules.length; i++) {
    if(Utils.isNullOrUndefined(result.rules[i].success)) continue;
    if(!result.rules[i].success) continue;
    showRule(result.rules[i])
  }
  // Animations pour faire apparaitre les items.
  $('#analysis-main-content ul li').each(function(index, element) {
    setTimeout(() => {$(this).show(150)}, index * 150);
  });
  $('#analysis-veryImportant-content ul li').each(function(index, element) {
    setTimeout(() => {$(this).show(150)}, index * 150);
  });
  $('#analysis-important-content ul li').each(function(index, element) {
    setTimeout(() => {$(this).show(150)}, index * 150);
  });

  $('[data-toggle="tooltip"]').tooltip({delay: {"show": 1000, "hide": 100}});
  $('[data-toggle="popover"]').popover();
}
/**
 * When Verify Button is clicked
 * Start the analysis.
 */
function onVerifyClick(){
  //analyzeAllEditorContent();
  $('#analysis-main-content>ul').html('');
  $('#analysis-veryImportant-content>ul').html('');
  $('#analysis-important-content>ul').html('');
  $('.score').text('?')
  checkFalcQuality(editor).then((result) => displayAnalysisResults(result));
}

/**
 * When Verify Button is clicked
 * Start the analysis.
 */
function onVerifyBlockClick(){
  //analyzeAllEditorContent();
  $('#analysis-main-content>ul').html('');
  $('#analysis-veryImportant-content>ul').html('');
  $('#analysis-important-content>ul').html('');
  $('.score').text('?');
  checkFalcQualityForBlock(editor, editor.activeBlockId).then((result) => displayAnalysisResults(result));
}

/**
 * Create a PDF from the document.
 */
function onPDFClick(){
  Converter.toPdf(editor).then( function (docFactory) {
    docFactory.download("monfichier.pdf");
  });
}

/**
 * Create a ODT file from the document.
 */
function onODTClick(){
  Converter.toOdt(editor).then( function (blob) {
    writeFile(blob, 'monfichier.odt');
  });
}

function loadImageDialog (imageId) {
  $(".loader").show();
  $("#imageClickModal").find("#imgFromDisk").attr("data-id", imageId );
  $("#imageClickModal").find("#image-url").val(null);
  getImagesSuggestions(activeBlocId).then(function (result) {
    displayWebImages(result);
    $("#imageClickModal").modal();
    $(".loader").hide();
  });
}

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
  var keywords = imgURLs.searchText;
  if ( keywords ) {
    $("#imageClickModal").find("#image-url").val(keywords); // keywords
    $("#image-url").attr("data-val", keywords);
  }
  else {
    $("#imageClickModal").find("#image-url").val($("#image-url").attr("data-val"));
  }
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

  var qwant = imgURLs.qwant;
  if ( qwant.length ) {
    for (let i = 0; i < qwant.length; i++) {
      let imgTag = '<img src="' + qwant[i] + '" class="web-img">';
      $("#imageClickModal").find(".qwant").append(imgTag);
    }
    $("#imageClickModal").find(".qwant-lab").css("display", "inline-block");
  }
  else $("#imageClickModal").find(".qwant-lab").css("display", "none");

  var google = imgURLs.google;
  if ( google.length ) {
    for (let i = 0; i < google.length; i++) {
      let imgTag = '<img src="' + google[i] + '" class="web-img">';
      $("#imageClickModal").find(".google").append(imgTag);
    }
    $("#imageClickModal").find(".google-lab").css("display", "inline-block");
  }
  else $("#imageClickModal").find(".google-lab").css("display", "none");
}  // end displayWebImages
//------------------------

// ******************************************** T O O L B A R

function initToolbar() {                 // tool cursor initial values
  $("#size").css("display","none");

  $("#bold-cursor").css("left", CURSOR_DATA["bold-" + BOLD_INIT]);
  $("#size-cursor").css("left", CURSOR_DATA["size-" + SIZE_INIT]);
  $("#color-cursor").css("left", CURSOR_DATA["color-" + COLOR_INIT]);
  $("#title-cursor").css("left", CURSOR_DATA["title-" + TITLE_INIT]);
  $("#bullet-cursor").css("left", CURSOR_DATA["bullet-" + BULLET_INIT]);
  $("#number-cursor").css("left", CURSOR_DATA["number-" + NUMBER_INIT]);
  $("#frame-cursor").css("left", CURSOR_DATA["frame-" + FRAME_INIT]);
  $("#pictureL-cursor").css("left", CURSOR_DATA["pictureL-" + PICTUREL_INIT]);
  $("#picture-cursor").css("left", CURSOR_DATA["picture-" + PICTURE_INIT]);

  $("#toolbarlist").children().each( function (i, elem) {
    $(elem).css("left", TOOLBAR_BLOCK_LEFT[elem.id]);
  });

  activeTool("bold", BOLD_INIT);
  activeTool("size", SIZE_INIT);
  activeTool("color", COLOR_INIT);
  activeTool("title", TITLE_INIT);
  activeTool("bullet", BULLET_INIT);
  activeTool("number", NUMBER_INIT);
  activeTool("frame", FRAME_INIT);
  activeTool("pictureL", PICTUREL_INIT);
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
//                                            hide toolbar block (UNUSED)
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
  if( tool === "number" ) {
    tool = "list";
    switch (val) {
      case true:
        v = 'ordered'; break;
      case false:
        v = false; break;
    }
  }
  if( tool === "bullet" ) {
    tool = "list";
    switch (val) {
      case true:
        v = 'bullet'; break;
      case false:
        v = false; break;
    }
  }
  if ( tool === "color" ) {
    switch( val ) {
      case 'red':
        v = COLOR_RED; break;
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
  if ( tool == "pictureL" && v ) {
    loadImageDialog("#img-" + editor.activeBlockId + "-0");
  }
  else if ( tool == "picture" && v ) {
    loadImageDialog("#img-" + editor.activeBlockId + "-1");
  }
}

////////////////////////////////////////////////////////////////////
//                                             P R E F E R E N C E S
function getPrefColor (selector) {
  let path = $(selector + ' img').attr('src').split('/');
  let ba = path[path.length - 1].split('.')[0].split('-');
  let c = 'black';
  let baba = ba[ba.length - 1];
  if ( baba == "back" || baba == "color" ) baba = ba[ba.length - 2];
  switch (baba) {
    case 'red': c = COLOR_RED; break;
    case 'green': c = COLOR_GREEN; break;
    case 'blue': c = '#0000ff'; break;
    case 'black': break;
    case 'colorplus':
      c = $(selector + ' .color-plus').css('color');
  }
  return c;
}

function collectPreferencesData () {
  let data = {};
  data.default = {};
  // font size
  data.default['font-size'] = $('#pref-text-size')[0].value + 'pt';
  // font color
  data.default.color = getPrefColor('#pref-text-color');
  // frame
  data.frame = {};
  let fs = $('#pref-frame-size')[0].value + 'pt';
  let fc = getPrefColor('#pref-frame-color');
  let fb = getPrefColor('#pref-frame-back');
  let fr = $('#pref-frame-radius')[0].value + 'pt';
  data.frame.border = `${fs} solid ${fc}`;
  data.frame['border-radius'] = fr;
  data.frame.background = fb;
  // levels
  for (const level of ['h1', 'h2', 'h3', 'h4']) {
    data[level] = {};
    // font size
    data[level]['font-size'] = $('#pref-' + level + '-size')[0].value + 'pt';
    // font weight
    const path = $('#pref-' + level + '-bold img').attr('src').split('/');
    const ba = path[path.length - 1].split('.')[0].split('-');
    data[level]['font-weight'] = ba[ba.length - 1] === 'bold' ? 'bold' : 'normal';
    // font color
    data[level].color = getPrefColor('#pref-' + level + '-color');
  }

  /* TODO: add alignment directly in preferences window. */
  data.h1['text-align'] = 'center';

  data.page = {};
  let mt = Utils.cmToInches(Number($('#pref-margin-top')[0].value) - 2.54) + 'in';
  let mr = Utils.cmToInches(Number($('#pref-margin-right')[0].value) - 2.54) + 'in';
  let mb = Utils.cmToInches(Number($('#pref-margin-bottom')[0].value) - 2.54) + 'in';
  let ml = Utils.cmToInches(Number($('#pref-margin-left')[0].value) - 2.54) + 'in';
  data.page.padding = `${mt} ${mr} ${mb} ${ml}`;
  return data;
}

function sendPreferencesToEditor () {
  editor.setTheme(collectPreferencesData());
}

function getImgColorName(color, selector) {
  let img;
  switch (color) {
    case COLOR_RED: img = "red"; break;
    case COLOR_GREEN: img = "green"; break;
    case "#0000ff": img = "blue"; break;
    case "black": img = "black"; break;
    case "normal": img = "thin"; break;
    case "bold": img = "bold"; break;
    default:
      img = "colorplus"; break;
  }
  if ( selector.attr("id").match(/frame-back/) ) img = "img/pref/pref-" + img + "-back.png";
  else if ( selector.attr("id").match(/frame-color/) ) img = "img/pref/pref-" + img + "-color.png";
  else img = "img/pref/pref-" + img + ".png";

  selector.find("img").attr("src", img);
  if ( img.match(/colorplus/) ) {
    selector.find(".color-plus").css("color", color);
  }
}

function initPreferencesDialog(theme) {
  if ( !theme ) return;
// text
  $("#pref-text-size").val(theme.default["font-size"].split("pt")[0]);
  getImgColorName(theme.default.color, $("#pref-text-color"));
// frame
  getImgColorName(theme.frame.background, $("#pref-frame-back"));
  getImgColorName(theme.frame.border.split(" ")[2], $("#pref-frame-color"));
  $("#pref-frame-size").val(theme.frame.border.split(" ")[0].split("pt")[0]);
  $("#pref-frame-radius").val(theme.frame["border-radius"].split("pt")[0]);


  for (var level of ['h1', 'h2', 'h3', 'h4']) {
    getImgColorName(theme[`${level}`].color, $(`#pref-${level}-color`));
    $("#pref-h1-size").val(theme[`${level}`]["font-size"].split("pt")[0]);
    $("#pref-h1-bold").val(theme[`${level}`]["font-weight"].split("pt")[0]);
  }
}

/////////
function displayPrefPreview(zone) {
  if ( !zone ) return;
  var data = collectPreferencesData();
  var pp = "#pref-preview";
  var lineHeight0; // = 48 ou 64
  var height0; // = 60 ou 80

  $(pp).css({"display": "block",
            "border-width": 0,
            "background-color": "white",
            "border-radius": 0});

  if ( zone == "text" ) {
    lineHeight0 = 48;
    $("#color-select").attr("data-lineHeight0", "text");
    height0 = 60;
    $(pp).css({"line-height": lineHeight0 + "px",
              "height": height0 + "px"});

    $(pp).css({"color": data.default.color,
              "font-size": data.default["font-size"]});
    $(pp).css({"text-align": "left"});
  }

  else if ( zone == "frame") {
    var back = data.frame.background;
    if ( back == "rgba(255, 255, 255, 0)" ) back = "white";
    $(pp).css({"background-color": back,
                            "border": data.frame.border,
                            "border-radius": data.frame["border-radius"]});
    var border = $(pp).css("border-width").split("px")[0] *2;
    if ( $("#color-select").attr("data-lineHeight0") == "text" ) lineHeight0 = 48;
    else lineHeight0 = 64;
    $(pp).css({"line-height": lineHeight0 - border + "px"});
  }

  else {
    lineHeight0 = 64;
    $("#color-select").attr("data-lineHeight0", "title");
    height0 = 80;
    $(pp).css({"line-height": lineHeight0 + "px",
              "height": height0 + "px"});

    for ( var zh of ["h1", "h2", "h3", "h4"]) {
      if ( zh == zone )
        $(pp).css({"color": (data[zh]).color,
                "font-size": (data[zh])["font-size"],
                "font-weight": (data[zh])["font-weight"]});
        if ( zone == "h1" ) $(pp).css({"text-align": "center"});
        else $(pp).css({"text-align": "left"});
    }
  }
}

///////// save picked color
function savePickedColor (color) {
  let pc = JSON.parse(localStorage.paletteColors);
  for ( let i = 0; i < pc.length; i++ ) {
    if ( pc[i][0] == color ) return;
  }
  let colorTab = [color];
  pc.push(colorTab);
  if ( pc.length > 6 ) pc.shift();
  localStorage.paletteColors = JSON.stringify(pc);
}

/////////////////////////////////////////////////////////////////
//                                    toolbar update from editor
function setFormatAtToolbar(format) {
  var items = format.listitem;
  var color = format.color;
  console.log("couleur from ed: " + color);

  switch( color ) {
    case COLOR_RED:
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
  activeTool("bullet", format.list === "bullet");
  activeTool("number", format.list === "ordered");
  activeTool("frame", format.frame);
  activeTool("pictureL", format.pictureLeft);
  activeTool("picture", format.pictureRight);
  activeTool("title", format.title);
}

// update cursor & activeTools
function activeTool(tool, value) {
  activeTools[tool] = value;
  moveCursor(tool, value, false);
}

///////////////////////////////////////////////   verify block widget highlight
/*
setInterval( function () {
  if ( flagImageDialogEnd ) return;
  blockArrayEnter();
}, 200);
*/
///////////////////////////////////////////////   blockArrayLeave
function blockArrayLeave() {
  $("#blockCmd").css("display", "none");
  $(".img-txt-widget").css("display", "none");
  $(".text-block .editor-image").css("border", "2px solid rgba(0, 0, 0, 0)");
}
///////////////////////////////////////////////   blockArrayEnter
function blockArrayEnter() {
    var iBlock = $(`#blc-${activeBlocId}`);

    $("#blockCmd").css("display", "block");
    $(".img-txt-widget").css("display", "none");
    //$(iBlock).find(".img-txt-widget").css("display", "none");
    $(".text-block .editor-image").css("border", "2px solid rgba(0, 0, 0, 0)");
    //$(iBlock).find(".text-block .editor-image").css("border", "2px solid rgba(0, 0, 0, 0)");

    if ( iBlock.hasClass("text-block") ) {
      // image text widgets
      var widgetOffset;
      var blockMiddle = $(iBlock).height() /2 - 19;

      if ( iBlock.find(".left-image").css("display") == "none" ) { // left image hidden
         $(".img-txt-widget.img-left").css("display", "block");
         $(".img-txt-widget.img-left").attr("data-true-imageID", $(iBlock).attr("id"));
         $(".img-txt-widget.img-left").attr("data-block-id", ($(iBlock).attr("id")).split("-")[1]);
         widgetOffset = iBlock.offset();
         widgetOffset.left -= 65;
         widgetOffset.top += blockMiddle;
         $(".img-txt-widget.img-left").offset(widgetOffset);
      }

      else {                                                  // left image visible
        let leftImage = iBlock.find(".left-image").find(".editor-image");
        leftImage.css("border", "2px solid #4b4");

        $(".img-txt-widget.block-delete-left").css("display", "block");

        $(".img-txt-widget.block-delete-left").attr("data-true-imageID", leftImage.attr("id"));
        $(".img-txt-widget.block-delete-left").attr("data-block-id", (leftImage.attr("id")).split("-")[1]);
        $(".img-txt-widget.block-delete-left").attr("data-image-id", (leftImage.attr("id")).split("-")[2]);
        widgetOffset = iBlock.find(".left-image").offset();
        //widgetOffset.left += iBlock.find(".left-image").width() - 19;
        widgetOffset.left += iBlock.find(".left-image").width() /2 -17; // widget centered
        widgetOffset.top += -16;
        $(".img-txt-widget.block-delete-left").offset(widgetOffset);

      }

     if ( iBlock.find(".right-image").css("display") == "none" ) { // right image hidden
         $(".img-txt-widget.img-right").css("display", "block");
         $(".img-txt-widget.img-right").attr("data-true-imageID", $(iBlock).attr("id"));
         $(".img-txt-widget.img-right").attr("data-block-id", ($(iBlock).attr("id")).split("-")[1]);
         widgetOffset = iBlock.offset();
         widgetOffset.left += $(iBlock).width() + 34;
         widgetOffset.top += blockMiddle;
         $(".img-txt-widget.img-right").offset(widgetOffset);
     }
     else {                                                     // right image visible
       let rightImage = iBlock.find(".right-image").find(".editor-image");
       rightImage.css("border", "2px solid #4b4");

       $(".img-txt-widget.block-delete-right").css("display", "block");

       $(".img-txt-widget.block-delete-right").attr("data-true-imageID", rightImage.attr("id"));
       $(".img-txt-widget.block-delete-right").attr("data-block-id", (rightImage.attr("id")).split("-")[1]);
       $(".img-txt-widget.block-delete-right").attr("data-image-id", (rightImage.attr("id")).split("-")[2]);
       widgetOffset = iBlock.find(".right-image").offset();
       widgetOffset.left += iBlock.find(".right-image").width() /2 - 17; // widget centered
       widgetOffset.top += -16;
       $(".img-txt-widget.block-delete-right").offset(widgetOffset);

    }

  }

  //                        palette widget activation
  // enable .block-move-up
    if ( activeBlocId == 0 ) {
      $("#blockCmd").find(".block-move-up").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-move-up").css({"opacity": 1, "pointer-events": "initial"});
    }
  // enable .block-move-down
    if ( $(iBlock).next().length == 0 ) {
      $("#blockCmd").find(".block-move-down").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-move-down").css({"opacity": 1, "pointer-events": "initial"});
    }
  // enable .block-delete
    if ( $(iBlock).siblings().length == 0 ) { // only 1 block
      $("#blockCmd").find(".block-delete").css({"opacity": 0.3, "pointer-events": "none"});
    }
    else {
      $("#blockCmd").find(".block-delete").css({"opacity": 1, "pointer-events": "initial"});
    }

    //                                palette move
    var offset = $(iBlock).offset();
    var left = $("#page").offset().left +  798; // 8;
    offset.left = left;
    var top = offset.top;
    var height = $(iBlock).height();
    var commandHeight = $("#blockCmd").height();
    var decal = 0;
    if ( $("#blc-" + String(activeBlocId)).hasClass("frame") ) decal = 5;
    top = top + ((height - commandHeight) /2 + decal); // centered palette
    var decalPalette = 5;
    top = top + decal - decalPalette; // top aligned palette
    offset.top = top;

    $("#blockCmd").css({"opacity": 1});
    $("#blockCmd").offset(offset);
    //$("#blockCmd").animate({"top": offset.top, "left": offset.left}, 100);
}
/////////////////////////////////  E N D  blockArrayEnter()

///////////////////////////////////////////////////////////
// show hide analysis panel and move block palette accordingly
function analysisPanelShowHide(showHide, timeOut) {
  $("#blockCmd").hide(50);
  $("#analysisContentPanel")[showHide](timeOut);
  $(".analysis-expander-icon.fa-chevron-left")[showHide](0);
  $(".analysis-expander-icon.fa-chevron-right")[showHide === 'show' ? 'hide' : 'show'](0);
  setTimeout( function () {
      $("#blockCmd").show(50);
      $("#blc-" + String(activeBlocId)).trigger("mouseenter");
    }, timeOut + 10);
}

// page is empty
function pageEmpty() {
  if ( $("#editor").children().length > 2 || $("#txt-0").text() != "" ) return false;
  else return true;
}

// confirm dialog show or trigger
function confirmDialog(title, body, action) {
  $("#confirmDialog .modal-title").text(title);
  $("#confirmDialog .modal-body p").text(body);
  $("#confirmDialog").attr("data-action", action);
  if ( action == "newFile" || action == "loadFile" || action == "openExemple" || action == "openTuto") {
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
  function simplesAlert(title, icon = 'fa-hammer', content = "Cette commande n'est pas disponible.") {
    $("#simplesAlert .modal-title").text(title);
    $("#simplesAlert .modal-body").html(content);
    $("#simplesAlert i").removeClass();
    $("#simplesAlert i").addClass('fas ' + icon);
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

// click on #result-export button
$("#result-export").on("click", function () {
  const results = $("#result-export")[0].analysisResults;
  if (!Utils.isNullOrUndefined(results)) {
    writeFile(createAnalysisLog(results), "resultats analyse.csv", "text/csv");
  } else {
    alert("Commencez une analyse avant de vouloir l'enregistrer.");
  }
});

// click on speech button
  $("#speech-button").on("click", function () {
    editor.focus();
    $("#speech-button").addClass('listening');
    Speech.instance.listen().then((text) => {
      $("#speech-button").removeClass('listening');
      if (text !== '') {
        editor.setTextAtSelection(text);
      } else {
        alert("Je n'ai rien entendu.");
      }
    });
  });

// click on full-analysis-buttonand open panel if closed
  $(".full-analysis-button").on("click", function () {
      $(this).blur();
      if ($("#analysisContentPanel").is(':visible')) {
        //analysisPanelShowHide("hide", 200);
        onVerifyClick();
      } else {
        analysisPanelShowHide("show", 200);
        $("#speech-button").addClass('active');
        onVerifyClick();
        setTimeout( function () {
          blockArrayEnter();
        }, 205);
      }
  } );

  // click on block-analysis-button and open panel if closed
    $(".block-analysis-button").on("click", function () {
        $(this).blur();
        if ($("#analysisContentPanel").is(':visible')) {
          //analysisPanelShowHide("hide", 200);
          onVerifyBlockClick();
        } else {
          analysisPanelShowHide("show", 200);
          $("#speech-button").addClass('active');
          onVerifyBlockClick();
          setTimeout( function () {
            blockArrayEnter();
          }, 205);
        }
    } );

    $("#analysisExpanderButton").on("click", function () {
        $(this).blur();
        if ($("#analysisContentPanel").is(':visible')) {
          analysisPanelShowHide("hide", 150);
          $("#analysis-content input").popover('hide');
        } else {
          analysisPanelShowHide("show", 150);
        }
        setTimeout( function () {
          $(window).trigger("resize");
          blockArrayEnter();
        }, 155);
    } );

  $("#redo-analyse").on("click", function () {
    $(this).blur();
    onVerifyClick();
  });

// Après méditations de Seb (Rempli le reste de l'écran avec la partie centrale de l'éditeur)
  $(window).on("load resize", function() {
    var remaining = window.innerHeight;
    $(".box").children().each( function () {
      if (this.classList && !this.classList.contains('hbox')){
        remaining -= $(this).outerHeight();
      }
    });
    $('.hbox').css({"max-height": remaining + "px", "margin": "0px"});
    //$('.hbox').css("margin", "0px");
    $('.box').css("overflow", "hidden");

    let cmdWidth = $("#blockCmd").width() + 8;
    if ( $("#page").outerWidth(true) < $("#page").outerWidth() + cmdWidth ) {
      $("#page").css("margin-left", 0);
    }
    else {
      let marginLeft = ($("#page").outerWidth(true) - $("#page").outerWidth()) /2 - cmdWidth /2;
      $("#page").css("margin-left", marginLeft + "px");
    }
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
      blockArrayEnter();
    }, 15);

  } );

///////////////////////////////////////////////////
//                         blockcreated (editor event)
$("#editor").on("blockcreated", function (ev) {
  activeBlocId = ev.detail.intid;
  $("#blockCmd").find("span").text(activeBlocId + 1);
  blockArrayEnter();
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
  blockArrayEnter();
});


// image dialog opening from editor block image
$("#editor").on("click", ".editor-image", function(ev) {
  loadImageDialog("#" + ev.target.id);
});

// click on time button...
$("#imgButtonTime").on("click", function () {
  $("#imageClickModal2").modal();
});

// click on date button...
$("#imgButtonDate").on("click", function () {
  simplesAlert("En chantier!");
});

//////////////////  C L O C K
var clock = new Clock("#imageClickModal2 #clock-canvas");
// draw clock
function updateModalClock () {
  let hour = $("#imageClickModal2 #hour-input").val();
  let minutes = $("#imageClickModal2 #minutes-input").val();
  let strict = $("#imageClickModal2-check").prop("checked");
  clock.set(hour, minutes, strict);
}
// clock dialog opening
$("#imageClickModal2").on('show.bs.modal', function (e) {
  updateModalClock();
});

// hour or minutes change
$("#imageClickModal2 #hour-input, #imageClickModal2 #minutes-input").on("change", function (e) {
  updateModalClock();
});

// checkbox time strict click
$("#imageClickModal2-check").on("click", function () {
  if ( $(this).attr("checked") ) $(this).removeAttr("checked");
  else $(this).attr("checked", "checked");
  updateModalClock();
});

// click on time button
$("#imgButtonTimeOK").on("click", function () {
  $("#imageClickModal2").modal('hide');
  $("#imageClickModal").modal('hide');
  let imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  let hour = $("#imageClickModal2 #hour-input").val();
  let minutes = $("#imageClickModal2 #minutes-input").val();
  let strict = $("#imageClickModal2-check").prop("checked");
  editor.setImage(imageId, drawClock(hour, minutes, {"strict": strict}));
  flagImageDialogEnd = true; // avoid wrong block highlight
});

// trigger input file tag in image dialog
$("#imgButtonFromDisk").on("click", function () {
  $("#imgFromDisk").trigger("click");
});

// input file tag in image dialog: Read file from disk, send to editor
$("#imgFromDisk").on("change", function (e) {
  let file = e.target.files[0];
  if ( !file || (!file.type.match(/image.*/)) ) {
    $("#imageClickModal .close").trigger("click");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    $("#imageClickModal .close").trigger("click");
    let imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
    editor.setImage(imageId, e.target.result);
    flagImageDialogEnd = true; // avoid wrong block highlight
    $("#imgFromDisk").val(""); // force value to be seen as new
  };
  reader.readAsDataURL(file);     // ou readAsText(file);
});

// send image url OR keyword to editor
$("#imageClickModal").find("#modalFind").on("click", function (ev) {
  let imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  let urlOrKeyword = $("#imageClickModal").find("#image-url").val();
  if ( urlOrKeyword ) {
    if ( urlOrKeyword.match(/^https?:\/\//) ) {
      $("#imageClickModal").modal('hide');
      editor.setImage(imageId, urlOrKeyword);
      flagImageDialogEnd = true; // avoid wrong block highlight
    }
    else {
      $(".loader").show();
      getImagesForKeyword(urlOrKeyword).then(function (result) {
        displayWebImages(result);
        $(".loader").hide();
      });
      $("#image-url").attr("data-val", urlOrKeyword);
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
  let imageId = $("#imageClickModal").find("#imgFromDisk").attr("data-id");
  let url = $(ev.target).attr("src");
  editor.setImage(imageId, url);
  flagImageDialogEnd = true; // avoid wrong block highlight
  //blockArrayLeave();

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
      flagImageDialogEnd = true; // avoid wrong block highlight
    }
    else {
      // file
      var reader = new FileReader();
      reader.onload = function(e2) {
        var imageSrc = e2.target.result;
        editor.setImage(imageId, imageSrc);
        flagImageDialogEnd = true; // avoid bad block highlight
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
// Ouvrir exemple...
$("#openExemple").on("click", function () {
  confirmDialog("Ouvrir un exemple", "Effacer la page actuelle", "openExemple");
});
// Ouvrir le tuto...
$("#openTuto").on("click", function () {
  confirmDialog("Ouvrir le tuto", "Effacer la page actuelle", "openTuto");
});
/////////////////////  write file
$(".write-file").on("click", function () {
  // Exporter au format PDF...
  if ( $(this).attr("id") == "exportFilePDF" ) {
    onPDFClick();
  }
  // Exporter au format ODT...
  if ( $(this).attr("id") == "exportFileODT" ) {
    onODTClick();
  }
  // Exporter au format HTML...
  else if ( $(this).attr("id") == "exportFileHTML" )  {
    Converter.toHtml(editor).then(function(string) {
      writeFile(string, "mon fichier.html", "text/html");
    });
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
// Ouvrir préférences...
$("#preferences").on("click", function () {
  try { initPreferencesDialog(editor.theme);
  } catch (ex) {
    console.log("Old document");
  }
  $("#prefDialog").modal("show");
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
    if ( editor.hasFocus ) $(this).css({"top":"-5px", "cursor": "pointer"});
  } ).mouseleave( function () {
    if ( editor.hasFocus ) $(this).css({"top":"0", "cursor": "default"});
  } );

$("#toolbarBottomMask").hover( function () {
  event.stopPropagation();
  event.preventDefault();
  return false;
});

//  tool click
  $(".tool, .tool-frame-bullet").on("click", function(e) {
    if ( editor.hasFocus ) {

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
        blockArrayEnter();
      }, 15);
    }
  } );

//                                    C O L O R P I C K E R
//  colorpicker   $(".color-custom").spectrum("show")
  $(".color-custom").spectrum({
    chooseText: "choisir",
    cancelText: "annuler",
    hideAfterPaletteSelect:true,
    color: $(".color-custom").css("color"),
    showInput: false,
    showInitial: true,
    showPalette: true,
    showSelectionPalette: false,
    palette: [],
    selectionPalette: [],
    maxSelectionSize: 6,
    preferredFormat: "hex",
    //localStorageKey: "spectrum",
    clickoutFiresChange: false,
    move: function (color) {
    },
    show: function () {
    },
    beforeShow: function () {
      $(".color-custom").spectrum("option", "palette", JSON.parse(localStorage.paletteColors));
    },
    hide: function() {
    },
    change: function(tinycolor) {
      let color = tinycolor.toHexString();
      savePickedColor(color);
      $("#" + prefColorplusButton).css("color", color);
      $(".color-custom").css("color", color);
      sendtoEditor("color", color);
    }
  });


  /**
   * toolbar scrollbar
   */
   $("#toolbarScrollBar").on("mousedown", function (ev) {
    if ( $("#toolbarScrollBar").css("background-color") == "rgb(255, 255, 255)" )
          return; // scroolbar hidden
     dragIsOn = true;
     dragMouseX0 = ev.clientX;
   });

  /**
  * toolbarScrollBar hover
  */
 $("#toolbarScrollBar").hover( function () {
   if ( TOOLBAR_WIDTH > $(body).width()  + LOGO_DECAL) {
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
          $("#toolbarlist").css({"left": trueWidth - TOOLBAR_WIDTH });
      else $("#toolbarlist").css({"left": offset.left + dragMouse});
    }
  });

  $("*").on("mouseup", function (ev) {
    dragIsOn = false;
  });


//  editor requires toolbar update
  $('#editor').on('currentformatchanged', function(e) {
    setFormatAtToolbar(e.detail.format);
  } );

  $("#conted").on("mouseup", function(e) {
    //console.log(window.getSelection().toString());
    //console.log(window.getSelection().getRangeAt(0).toString());
  } );

  ////////////////////// PREFERENCES events ///////////////////////

  /////////// color palette for colorplus pref
  $(".color-custom-plus").spectrum({
    chooseText: "choisir",
    cancelText: "annuler",
    hideAfterPaletteSelect:true,
    showInput: false,
    showInitial: true,
    showPalette: true,
    showSelectionPalette: false,
    palette: [],
    maxSelectionSize: 6,
    preferredFormat: "hex",
    //localStorageKey: "spectrum",
    clickoutFiresChange: false,
    move: function (color) {
    },
    show: function () {
      console.log($("#" + $("#color-select").attr("data-place") + " div").css("color"));
    },
    beforeShow: function () {
      $(".color-custom-plus").spectrum("option", "palette", JSON.parse(localStorage.paletteColors));
      $(".color-custom-plus").spectrum("set", $("#" + $("#color-select").attr("data-place") + " div").css("color"));
    },
    hide: function(tinycolor) {
    },
    change: function(tinycolor) {
      let color = tinycolor.toHexString();
      savePickedColor(color);
      let place = $(this).attr("data-place");
      let elem = place.split("-")[1];
      $(`#${place} div`).css("color", color);
      displayPrefPreview($("#color-select").attr("data-pref-zone"));
    }
  });

  // dont change zone when color palette is open
  $(".sp-container").on("mouseenter", function (ev) {
    $("#pref-preview").css("display", "block");
    //$(".pref-header").css("background-color", "white");
  });
/////////// fin color palette

  // pref color images
    $(".pref-color-button").on("click", function(e) {
      prefColorplusButton = e.target.id;
      let img = $(this).attr("data-img");
      $(this).prev().attr("src", img);
    });

  // #color-select button move
    $(".pref-color, .pref-h-bold").on("mousemove", function (ev) {
      let frameString;
      let decal = 22;
      let margin = 4;
      let imgTop = $(this).offset().top - margin;
      let imgLeft = $(this).offset().left - margin;
      let mouseY = ev.pageY;
      let mouseX = ev.pageX;
      $(".color-custom-plus").spectrum("disable");

      if ( $(this).parent().attr("id") == "pref-frame-back" ) frameString = "-back";
      else if ( $(this).parent().attr("id") == "pref-frame-color" ) frameString = "-color";
      else frameString = "";

      if ( $(ev.target).hasClass("pref-h-bold") ) {
        imgLeft+= 26;
        if ( mouseX - imgLeft < decal ) {
          $("#color-select").attr("data-img", "img/pref/pref-thin.png");
          $("#color-select").attr("data-color", "thin");
        }
        else if ( mouseX - imgLeft < decal *2 ) {
          imgLeft+= decal;
          $("#color-select").attr("data-img", "img/pref/pref-bold.png");
          $("#color-select").attr("data-color", "bold");
        }
      }
      else {
        if ( mouseX - imgLeft < decal ) {
          $("#color-select").attr("data-img", "img/pref/pref-black" + frameString + ".png");
          $("#color-select").attr("data-color", "black");
        }
        else if ( mouseX - imgLeft < decal *2 ) {
          imgLeft+= decal;
          $("#color-select").attr("data-img", "img/pref/pref-red" + frameString + ".png");
          $("#color-select").attr("data-color", "red");
        }
        else if ( mouseX - imgLeft < decal *3 ) {
          imgLeft+= decal *2;
          $("#color-select").attr("data-img", "img/pref/pref-blue" + frameString + ".png");
          $("#color-select").attr("data-color", "blue");
        }
        else if ( mouseX - imgLeft < decal *4 ) {
          imgLeft+= decal *3;
          $("#color-select").attr("data-img", "img/pref/pref-green" + frameString + ".png");
          $("#color-select").attr("data-color", "green");
        }
        else if ( mouseX - imgLeft < decal *5 ) {
          imgLeft+= decal *4;
          $("#color-select").attr("data-img", "img/pref/pref-colorplus" + frameString + ".png");
          $(".color-custom-plus").spectrum("enable");
        }
      }
      $("#color-select").attr("data-place", $(ev.target).parent().attr("id"));
      $("#color-select").offset({ "top": imgTop, "left": imgLeft }).css("visibility", "visible");
    });

  // click color-select button
    $("#color-select").on("click", function (ev) {
      $("#color-select").animate({
        height: 55 // 43
      }, 200, function() {
        $("#color-select").animate({
          height: 51 // 40
        }, 50);
      });

      let img = $(this).attr("data-img");
      let place = $(this).attr("data-place");
      let color = $(this).attr("data-color");
      let elem = place.split("-")[1];
      $("#" + place).find("img").attr("src", img);
      displayPrefPreview($("#color-select").attr("data-pref-zone"));
    });

  // unsel color-select button
    $(".row").on("mouseenter", function (ev) {
      $("#color-select").css("visibility", "hidden");
    });

  // hide color showPalette
    $(".pref-bold, .pref-color, .num-pref").on("mouseenter", function (ev) {
      $(".color-custom-plus").spectrum("hide");
    });

  // record-pref button
    $("#record-pref").on("click", function (ev) {
      sendPreferencesToEditor();
      $("#prefDialog").modal("hide");
    });

  // after hidding modal
    $("#prefDialog").on("hidden.bs.modal", function (e) {
    });

  // num imput value
    $(".num-pref").on("change", function (ev) {
      let elem = $(this).attr("id").split("-")[1] + "-" +
                  $(this).attr("id").split("-")[2];
      let value = $(this).val();
      displayPrefPreview($("#color-select").attr("data-pref-zone"));
    });

  // mousemove over: find pref zones
    $(".pref-body").on("mousemove", function(ev) {
      // return pref zone containing cursor
      function mouseInZone(X0, Y0) {
        var z = {text: {top: -20, right: 720, bottom: 94, left: 200},
                frame: {top: 93, right: 720, bottom: 204, left: 200},
                h1: {top: 203, right: 337, bottom: 462, left: 200},
                h2: {top: 203, right: 464, bottom: 462, left: 336},
                h3: {top: 203, right: 591, bottom: 462, left: 463},
                h4: {top: 203, right: 720, bottom: 462, left: 590}
              };

        var X = X0 - $(".pref-body").offset().left;
        var Y = Y0 - $(".pref-body").offset().top;

        for ( var zone in z ) {
          if ( X > z[zone].left && X < z[zone].right && Y > z[zone].top && Y < z[zone].bottom ) {
            $("#color-select").attr("data-pref-zone", zone);
            return zone;
          }
        }
        return false;
      }
      //
      var zone = mouseInZone(ev.pageX, ev.pageY);
      if ( zone ) {
        $("#pref-preview").css("display", "block");
        $(".pref-header").css("background-color", "#f2f2f2");
        displayPrefPreview(zone);
      }
      else {
        $("#pref-preview").css("display", "none");
        $(".pref-header").css("background-color", "lightgrey");
      }
    });

  ////
    $(".pref-modal-content").on("mouseleave", function(ev) {
      $("#pref-preview").css("display", "none");
      $(".pref-header").css("background-color", "lightgrey");
    });





  ////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////// B L O C K S

  //////////////////////////////////////////
  // editor-block   ENTER
  $("#editor").on("mouseenter", ".editor-block", function (ev) {
    //
  });

  //////////////////////////////////////////
  // .editor-block  LEAVE
  $("#editor").on("mouseleave", ".editor-block", function (ev) {
    //
  });

  //////////////////////////////////////////
  //////////////////////////////////////////
  // blockCmd LEAVE
  $("#blockCmd").on("mouseleave", function (ev) {
    $(`#blc-${activeBlocId}`).css("background-color", "");
  });

  // blockCmd ENTER
  $("#blockCmd").on("mouseenter", function (ev) {
    blockArrayEnter();
    $(`#blc-${activeBlocId}`).css("background-color", "#bfb");
  });

  // page LEAVE
  $("#page").on("mouseleave", function ( ev ) {
  });

  // page ENTER
  $("#page").on("mouseenter", function ( ev ) {
    //
  });

// keyboard enter and del keys
  $("#editor").on("keyup", ".text-block", function(ev) {
    if (ev.keyCode === 13 || (ev.keyCode === 8) ) {
      // ev.preventDefault();
      blockArrayEnter();
    }
  });

  ///////////////////////////////      M O U S E M O V E
  //  update palette activeBlocId
  $("#page, #page-container").on("mousemove", function (ev) {
    var target = ev.target;
    if ( target.id == "blockCmd" || $(target).parent("#blockCmd").length == 1 ) return;

    var mouseY = ev.pageY;
    var mouseX = ev.pageX;
    var noBlock = false;
    var oldBlocId = activeBlocId;
    var nbBlocks = $(".editor-block").length;

    for ( let i = 0; i < nbBlocks; i++ ) {
      let iBlock = $(`#blc-${i}`);
      let blockTop = iBlock.offset().top;
      let blockHeight = iBlock.height();
      if ( mouseY > blockTop && mouseY < blockTop + blockHeight ) {
        //if ( target.id == "page" || $(target).hasClass("editor-block") || $(target).closest(".editor-block").length == 1 )  {
        activeBlocId = Number(iBlock.attr("id").split("-")[1]);

          //if ( oldBlocId != activeBlocId ) {

            //$("#blc-" + oldBlocId).css("background-color", "white");
            //$("#blc-" + activeBlocId).css("background-color", "#f6f6f6");
            $("#blockCmd").find("span").text(activeBlocId + 1);
            blockArrayEnter();

          //}

        //}
        noBlock = false;
        break;
      }
      noBlock = true;
    }
    //console.log(noBlock);
    if ( noBlock ) {
      //if ( activeBlocId != oldBlocId ) {
        if ( target.id == "page" || target.id == "page-container" ) blockArrayLeave();
      //}
    }

  });

/////////////////////////////////////  B L O C K   C O M M A N D S

  // block-delete hover
  $(".block-delete").hover( function () {
    if ( $(this).hasClass("img-widget") ) return;
    $(`#blc-${activeBlocId}`).css("background-color", "#fbb");
  }, function () {
    $(`#blc-${activeBlocId}`).css("background-color", "#bfb");
  });

  //  insertBlock & block-move  hover
  $("#blockCmd .block-move-up, #blockCmd .block-move-down, #blockCmd .block-new-up,  #blockCmd .block-new2-up, #blockCmd .block-new-down, #blockCmd .block-new2-down").hover( function () {
    $(`#blc-${activeBlocId}`).css("background-color", "#bfb");
  //}, function () {
  //    $(".editor-block").css("background-color", "white");
  });
////////////////////////
  // insertBlockAfter
    $("#blockCmd .block-new-down").on("click", function (ev) {
      $("#new-text-block-btn").attr("data-lirec-dir", "after");
      $("#new-images-block-btn").attr("data-lirec-dir", "after");
      $("#chooseBlockTypeDialog").modal("show");
    });

  // insertBlockBefore
    $("#blockCmd .block-new-up").on("click", function (ev) {
      $("#new-text-block-btn").attr("data-lirec-dir", "before");
      $("#new-images-block-btn").attr("data-lirec-dir", "before");
      $("#chooseBlockTypeDialog").modal("show");
    });

  // new text block
    $("#new-text-block-btn").on("click", function (ev) {
      $("#chooseBlockTypeDialog").modal("hide");
      if ( $(this).attr("data-lirec-dir") == "after" ) {
        editor.insertBlockAfter( activeBlocId, "", true);
        setTimeout( function () {
          $("#blockCmd").find("span").text(activeBlocId + 1);
          $(`#blc-${activeBlocId - 1}`).css("background-color", "");
          $(`#blc-${activeBlocId}`).css("background-color", "");
          blockArrayEnter();
        }, 15);
      }
      else if ( $(this).attr("data-lirec-dir") == "before" ) {
        editor.insertBlockBefore( activeBlocId, "", true);
        setTimeout( function () {
          $(`#blc-${activeBlocId + 1}`).css("background-color", "");
          blockArrayEnter();
        }, 15);
      }
    });

  // new images block
    $("#new-images-block-btn").on("click", function (ev) {
      $("#chooseBlockTypeDialog").modal("hide");
      $(`#blc-${activeBlocId}`).css("background-color", "");
      if ( $(this).attr("data-lirec-dir") == "after" ) {
        editor.insertImageBlockAfter( activeBlocId, true);
        setTimeout( function () {
          $("#blockCmd").find("span").text(activeBlocId + 1);
          blockArrayEnter();
          loadImageDialog("#img-" + activeBlocId + "-0");
        }, 15);
      }
      else if ( $(this).attr("data-lirec-dir") == "before" ) {
        $(`#blc-${activeBlocId}`).css("background-color", "");
        editor.insertImageBlockBefore( activeBlocId, true);
        setTimeout( function () {
          blockArrayEnter();
          loadImageDialog("#img-" + activeBlocId + "-0");
        }, 15);
      }
    });

//  removeBlockAt
  $("#blockCmd .block-delete").on("click", function (ev) {
    editor.removeBlockAt(activeBlocId, { focusID: activeBlocId + 1 });
    // wait for animation ending
    setTimeout( function () {
      // palette update when removing last (but not only) block
      if ( activeBlocId > 0 && $("#blc-" + String(activeBlocId)).next().length == 0 ) {
        activeBlocId--;
        $("#blockCmd").find("span").text(activeBlocId + 1);
      }
      blockArrayEnter();
    }, 150);
  });

//  moveBlockDown
  $("#blockCmd .block-move-down").on("click", function (ev) {
    $(`#blc-${activeBlocId}`).css("background-color", "");
    editor.moveBlockDown(activeBlocId);
    // wait for animation ending
    setTimeout( function () {
      $(`#blc-${activeBlocId + 1}`).css("background-color", "");
      blockArrayLeave();
    }, 250);
  });

//  moveBlockUp
  $("#blockCmd .block-move-up").on("click", function (ev) {
    $(`#blc-${activeBlocId}`).css("background-color", "");
    editor.moveBlockUp(activeBlocId);
    // wait for animation ending
    setTimeout( function () {
      $(`#blc-${activeBlocId - 1}`).css("background-color", "");
      blockArrayLeave();
    }, 250);
  });

///////////////////////////////

/*  show/hide .block-new2
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
*/
////////////////////////////////////////////////////////////////////////
/////////////////////////////                  I M A G E  W I D G E T S

// click text block add image widget
  $("#page").on("click", ".img-left", function (ev) {
    editor.setBlockFormat(activeBlocId, {pictureLeft: true});
    activeTool("pictureL", true);
    blockArrayEnter();
    loadImageDialog("#img-" + activeBlocId + "-0");
  });

  $("#page").on("click", ".img-right", function (ev) {
    editor.setBlockFormat(activeBlocId, {pictureRight: true});
    activeTool("picture", true);
    blockArrayEnter();
    loadImageDialog("#img-" + activeBlocId + "-1");
  });
////////////////////////////////////////
// .img-widget
  $("#editor").on("mouseenter", ".editor-image", function (ev) {
    if ( flagImageDialogEnd ) { // avoid wrong block highlight
      flagImageDialogEnd = false;
      blockArrayLeave();
      //return;
    }
    $(this).css("border", "2px solid #4b4");
    $(".img-widget.block-delete").attr("data-true-imageID", $(this).attr("id"));
    $(".img-widget.block-delete").attr("data-block-id", ($(this).attr("id")).split("-")[1]);
    $(".img-widget.block-delete").attr("data-image-id", ($(this).attr("id")).split("-")[2]);

    if ( $(this).parent().hasClass("col") ) { // image block
      $(".img-widget").css("display", "block");

      let widgetOffset = $(ev.target).offset();
      //widgetOffset.left += $(this).width() - 14;
      widgetOffset.left += $(this).width() /2 - 15; // center widget
      widgetOffset.top += -16;
      $(".img-widget.block-delete").offset(widgetOffset);

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
  });
////
  $("#editor").on("mouseleave", ".image-block .editor-image", function (ev) {
      $(this).css("border", "2px solid rgba(0, 0, 0, 0)");
      $(".img-widget").css("display", "none");
  });
/////////////////
///////////////////  enter img-widget
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
  /////////  leave img-widget
  $("#page").on("mouseleave", ".img-widget", function (ev) {
    $("#" + $(".img-widget.block-delete").attr("data-true-imageid")).css("border", "2px solid rgba(0, 0, 0, 0)");
    $(".img-widget").css("display", "none");
    $(`#blc-${activeBlocId}`).css("background-color", "#fff");
  });
/////////////////////////////
//              image actions
  $("#page").on("click", ".img-widget, .block-delete-right, .block-delete-left", function (ev) {
    var trueImageID = "#" + $(".img-widget.block-delete").attr("data-true-imageID");
    var blockID = Number($(".img-widget.block-delete").attr("data-block-id"));
    var imageID = Number($(".img-widget.block-delete").attr("data-image-id"));
    // image block
    if ( $(trueImageID).parent().hasClass("col") ) {
      if ( $(this).hasClass("block-delete") )
        editor.removeImageInBlock(blockID, imageID);
      else if ( $(this).hasClass("block-new-right")) {
        editor.insertImageInBlockAfter(blockID, imageID);
        loadImageDialog("#img-" + blockID + "-" + String(imageID + 1));
      }
      else if ( $(this).hasClass("block-new-left")) {
        editor.insertImageInBlockBefore(blockID, imageID);
        loadImageDialog("#img-" + blockID + "-" + imageID);
      }
      else if ( $(this).hasClass("block-move-left"))
        editor.moveImageLeft(blockID, imageID);
      else if ( $(this).hasClass("block-move-right"))
        editor.moveImageRight(blockID, imageID);

      setTimeout( function () {
        $(".img-widget").css("display", "none");
        $(".editor-image").css("border", "2px solid rgba(0, 0, 0, 0)");
      }, 300);

    }
    // text block
    else {
      if ( imageID == 0 ) {
        activeTool("pictureL", false);
        editor.setBlockFormat(blockID, {pictureLeft: false});
      }
      else {
        activeTool("picture", false);
        editor.setBlockFormat(blockID, {pictureRight: false});
      }
      blockArrayEnter();
    }
  });



/////////////////////////////////////////  D I V E R S
// toolbarlist click don't unsel text block
/*  $("#toolbarlist").on("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
*/
  document.addEventListener('mousedown', function (e) {
    if ( ( e.target.id == "toolbarScrollBar" &&  $("#toolbarScrollBar").css("background-color") == "rgb(255, 255, 255)" ) ||
          e.target.id == "toolbar" ||
          e.target.id == "toolbarBottomMask" ||
          e.target.id == "toolbarlist" ||
          ( e.target.src && e.target.src.match(/arrow-/) ) ||
          ( e.target.id && $(`#${e.target.id}`).hasClass("tool-cursor") ) ) {
      e.stopPropagation();
      e.preventDefault();
      console.log("Don't unsel text: " + e.target.id);
      return false;
    }
  }, false);

// resize & focus
  $( window ).on("resize focus", function () {
    blockArrayEnter();
    //$("#blockCmd, .img-widget, .img-txt-widget").css("display","none");
    var panel = ($("#analysisPanel").width() - $("#analysisSidebar").width() - $("#analysisExpander").width()) /2;
    var move = ($(body).width() - TOOLBAR_WIDTH) /2 + TOOLBAR_DECAL_RIGHT + panel;
    $("#toolbarlist").css({"left": move});
    if ( TOOLBAR_WIDTH < $(body).width() + LOGO_DECAL) {
      $("#toolbarScrollBar").css({"background-color": "white"});
    }
    else {
      $("#toolbarScrollBar").css({"background-color": TOOL_BACK_COLOR});
    }
    if ( TOOLBAR_WIDTH < $(body).width()  + TOOLBAR_DECAL_RIGHT + panel ) {
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
    else if ( action == "openExemple") { // Charger exemple lirec
      console.log("openExemple");
      $.ajax({
        'url': 'readTutoTarget.php',
        'type': 'post',
        'complete': function(xhr, result) {
          previousDocContent = xhr.responseText;
          editor.load(JSON.parse(previousDocContent));
          $("#openFileInput").val(""); // force value to be seen as new
          setTimeout( function () {
            blockArrayLeave(); // palette position
          }, 150);
        }
      });
    }
    else if ( action == "openTuto") { // Charger tuto lirec
      console.log("openTuto");
      $.ajax({
        'url': 'readTuto.php',
        'type': 'post',
        'complete': function(xhr, result) {
          previousDocContent = xhr.responseText;
          editor.load(JSON.parse(previousDocContent));
          $("#openFileInput").val(""); // force value to be seen as new
          setTimeout( function () {
            blockArrayLeave(); // palette position
          }, 150);
        }
      });
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
  analysisPanelShowHide("hide", 0);
  setTimeout(function () {
    initToolbar();

    if ( !localStorage.paletteColors ) localStorage.paletteColors = JSON.stringify([]);

    $( window ).trigger("resize");
    $("#blockCmd").css("display", "none");
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
//debugger;
//if ( localStorage.user == undefined || localStorage.user != "ok" ) askUserName();
//else window.location = window.location.href.split(".")[0] + ".php";


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

    "number-true": "-14px",

    "frame-true": "-16px",

    "pictureL-true": "-31px",

    "picture-true": "-30px",

};

const BOLD_INIT = false;
const SIZE_INIT = "s1";
const COLOR_INIT = "black";
const TITLE_INIT = "none";
const BULLET_INIT = false;
const NUMBER_INIT = false;
const FRAME_INIT = false;
const PICTUREL_INIT = false;
const PICTURE_INIT = true;

const TOOLBAR_WIDTH = 900;
const TOOLBAR_DECAL_RIGHT = 50; // 90;
const LOGO_DECAL = 80; /* 65; */
const TOOL_BACK_COLOR = "#e0e0e0"; // "#f0f0f0";
const COLOR_GREEN = "#006700"; // "#009940"; // "#2ea35f";
const COLOR_RED = "#c10000";

const TOOLBAR_BLOCK_LEFT = {"bold": 0, "color": -90, "title": -172, "bullet": -255, "number": -310, "frame": -320, "pictureL": -355, "pictureText": -387, "picture": -445};

var activeTools = {}; // tools present state
var mousedownID = -1;
var dragIsOn = false;
var dragMouseX;

var prefColorplusButton;

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

var flagImageDialogEnd = false;

// Appelle la fonction pour le zoom dés le début.
//refreshPageScale();

// slider.oninput = refreshPageScale;
