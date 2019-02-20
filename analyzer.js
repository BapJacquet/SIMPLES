
/*=======================================================================
  VARIABLES
  =======================================================================*/
/*var quill = new Quill('#editor', {
  modules: {
    toolbar: {
	    container: '#toolbar'
	  },
    imageResize: {
      displaySize: true
    },
    imageDrop: true
  },
  theme: 'snow'
});*/
var editor = new Editor('#editor', '#toolbar');

var slider = document.getElementById('zoom-range');
var page = document.getElementById('page');
var verifyButton = document.getElementById('verify-button');
var pdfButton = document.getElementById('pdf-button');
var analysisContent = document.getElementById('analysis-content');
var stanfordConnection = document.getElementById('stanford-connection');
var lexique3Connection = document.getElementById('lexique3-connection');
var lexique3Progress = document.getElementById('lexique3-progress');

var complexWords = [];

/*=======================================================================
  EVENTS
  =======================================================================*/

// NEED TO RAISE AN EVENT WHEN PROGRESS IS CHANGED
var progressChanged = new CustomEvent("progressChanged", {
  detail: {
    progress: 0
  },
  bubbles: false,
  cancelable : false
});
// NEED TO RAISE AN EVENT WHEN ANALYSIS IS COMPLETED
var analysisCompleted = new CustomEvent("analysisCompleted", {
  detail: {
    complexWords: []
  },
  bubbles: false,
  cancelable : false
});

/*=======================================================================
  LISTENERS
  =======================================================================*/

/* INDEX.JS */
verifyButton.onclick = onVerifyClick;
/* INDEX.JS */
pdfButton.onclick = onPDFClick;
/* INDEX.JS */
slider.oninput = refreshPageScale;

/*=======================================================================
  INITIALIZATION
  =======================================================================*/

/* INDEX.JS */
refreshPageScale();

/*=======================================================================
  FUNCTIONS
  =======================================================================*/

/**
 * Begins the analysis of the given text.
 * @param {string} text - Multiline string to analyse.
 */
function analyzeText(text){
  // Clear list of complex words
  complexWords.length = 0;
  setLexique3Progress(0);

  var request = createCORSRequest("POST", 'http://sioux.univ-paris8.fr:9000/');
  //var request = createCORSRequest("POST", 'localhost:9000/');
  request.onreadystatechange = async function(){
    if(request.readyState == 4){
      if(request.status == 200){
        setStatus("Stanford", "ok");
        // Parse la réponse en JSON.
        var obj = JSON.parse(request.responseText);

        // Count the total number of tokens.
        var totalTokens = 0;
        for(var i = 0; i < obj.sentences.length; i++){
          totalTokens += obj.sentences[i].tokens.length;
        }
        var progress = 0;

        // Récupère le résultat pour chaque phrase.
        for(var i = 0; i < obj.sentences.length; i++){
          var s = obj.sentences[i];
          // Récupère le résultat pour chaque mot.
          for(var t = 0; t < s.tokens.length; t++){
            var word = {};
            // Position de la première lettre
            word.startOffset = s.tokens[t].characterOffsetBegin;
            // Longueur
            word.length = s.tokens[t].characterOffsetEnd - word.startOffset;
            // Le mot
            word.text = s.tokens[t].word;
            // Sa fonction
            word.pos = s.tokens[t].pos;
            // Recherche plus d'informations dans le lexique si nécessaire.
            if(needLexique3(word.pos)){
              // Autres informations
              let data = await checkLexique3(word);
              // Fréquence du mot
              try {
                word.frequency = Math.max(data.movies, data.books);
                // Ajoute le mot à la liste des mots complexes si besoin.
                switch(frequencyToText(word.frequency)){
                  case 'inconnu': case 'très rare': case 'rare': case 'commun':
                  complexWords.push(word); break;
                }
              }
              catch (e) {
                console.log('Erreur data: ' + data);
              }
            }
            setLexique3Progress((++progress * 100) / totalTokens);
          }
        }

        displayAnalysisResults();
        setTimeout(clearStatus, 1000);
      } else {
        setStatus("Stanford", "echec");
      }
    } else {
      setStatus("Stanford", "en cours");
    }
  }
  request.send(text);
}

/* INDEX.JS */
function setLexique3Progress(value){
  let percent = ''+Math.floor(value)+'%';
  lexique3Progress.style.width = percent;
  lexique3Progress.setAttribute('aria-valuenow', value);
  lexique3Progress.innerHTML = percent;
}

/* INDEX.JS */
function displayAnalysisResults(){
  // Ajoute les résultats à la page d'analyse.
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

async function parseSentence(sentence){

}

/* INDEX.JS */
function setStatus(moduleName, status){
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

/* INDEX.JS */
function clearStatus(){
  stanfordConnection.style.display = 'none';
  lexique3Connection.style.dipslay = 'none';
}

/**
 * Check if the given Part-Of-Speech requires a check in Lexique3.
 * @param {string} pos - The Part-Of-Speech to test.
 * @return {boolean} - Whether the Part-Of-Speech requires a check or not.
 */
function needLexique3(pos){
  switch(pos){
    case 'PUNCT' : case 'ADP' : case 'DET' : case 'PRON' : return false;
    default: return true;
  }
}

/**
 * Requests a check of the Lexique3 database for the given word.
 * @param {Word} word - Word object to check the database with.
 * @return {Object} - Data returned from Lexique3.
 */
async function checkLexique3(word){
  setStatus("Lexique3", "en cours");
  // S'assure que le mot est en minuscules.
  let text = word.text.toLowerCase();
  // Enlève le tiret si il y en a un au début du mot.
  if(text.startsWith("-")) text = text.substring(1, text.length);
  // Transforme la fonction syntaxique pour être compatible avec Lexique3.
  pos = convertPos(word.pos, 'Lexique3');
  console.log(text + '  ' + pos);

  ///////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////
  // Lance la requète pour rechercher les informations pour le mot et sa fonction.
  let response = await fetch(`https://sioux.univ-paris8.fr/simplestest/lexique3_multi.php?word=${text}&pos=${pos}`)
  //let response = await fetch(`http://localhost/lexique3.php?word=${text}&pos=${pos}`)
  //let response = await fetch(`http://localhost:8888/simples2/lexique3_multi.php?word=${text}&pos=${pos}`)
  .catch(function(error) {
    setStatus("Lexique3", "echec");
  });
  let data = await response.json();

  //console.log(text + "(" +pos +") : " + JSON.stringify(data));
  setStatus("Lexique3", "ok");
  console.log(data);
  return data[0];
}

/**
 * Turn a given frequency into a user-friendly text.
 * @param {int} frequency - The frequency of the word.
 * @return {string} - A user friendly text.
 */
function frequencyToText(frequency){
  if (typeof frequency == 'undefined') return "inconnu";
  if(frequency < 5) return "très rare";
  if(frequency < 10) return "rare";
  if(frequency < 20) return "commun";
  if(frequency < 50) return "fréquent";
  return "très fréquent";
}

/**
 * Turn a given Part-Of-Speech label into its equivalent in the
 * target format.
 * @param {string} pos - The Part-Of-Speech label to convert.
 * @param {string} targetFormat - The target format. Can be Lexique3 or Google.
 * @return {string} - The converted Part-Of-Speech label.
 */
function convertPos(pos, targetFormat){
  switch(targetFormat){
    case 'Lexique3':
    switch(pos){
      case 'VERB': return 'VER';
      case 'INTJ': return 'ONO';
      case 'PRON': return 'PRO';
      case 'NOUN': return 'NOM';
      default: return pos;
    }
    break;
    default: return pos;
  }
}

// INDEX.JS
function refreshPageScale(){
  var scaleFunction = 'scale(' + slider.value + ')';
  //page.css('transform', scaleFunction);
  page.style.transform = scaleFunction;
}

/* INDEX.JS */
function onVerifyClick(){
  let content = [];
  alert(editor.blockCount);
  for(let i = 0; i < editor.blockCount; i++){
    content.push(editor.getTextContent(i));
  }
  analyzeText(content.join("\n"));
  alert(content.join("\n"));
}

/* INDEX.JS */
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

/**
 * Create a CORS request.
 * @param {string} method - Either GET or POST.
 * @param {string} url - The url of the request.
 * @return - Either a XMLHttpRequest.
 */
function createCORSRequest(method, url){
  var xhr = new XMLHttpRequest();
  if("withCredentials" in xhr){
    xhr.open(method, url, true);
  } else if( typeof XDomainRequest != "undefined"){
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}
