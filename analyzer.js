/*=======================================================================
  VARIABLES
  =======================================================================*/

var body = $("body").get(0);
var complexWords = [];

/*=======================================================================
  EVENTS
  =======================================================================*/

// NEED TO RAISE AN EVENT WHEN PROGRESS IS CHANGED
var progressChanged = new CustomEvent("progressChanged", {
  detail: {
    value: 0
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

// NEED TO RAISE AN EVENT WHEN ANALYSIS IS COMPLETED
var analysisStatusChanged = new CustomEvent("analysisStatusChanged", {
  detail: {},
  bubbles: false,
  cancelable : false
});


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

  progressChanged.detail.value = 0;
  body.dispatchEvent(progressChanged);

  var request = createCORSRequest("POST", 'http://sioux.univ-paris8.fr:9000/');
  //var request = createCORSRequest("POST", 'localhost:9000/');
  request.onreadystatechange = async function(){
    if(request.readyState == 4){
      if(request.status == 200){

        analysisStatusChanged.detail.status = "ok";
        analysisStatusChanged.detail.module = "stanford";
        body.dispatchEvent(analysisStatusChanged);
        //setStatus("Stanford", "ok");

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
            progressChanged.detail.value = (++progress * 100) / totalTokens;
            body.dispatchEvent(progressChanged);
            //setLexique3Progress((++progress * 100) / totalTokens);
          }
        }

        analysisCompleted.detail.complexWords = complexWords;
        body.dispatchEvent(analysisCompleted);
        //displayAnalysisResults();
      } else {
        analysisStatusChanged.detail.status = "echec";
        analysisStatusChanged.detail.module = "stanford";
        body.dispatchEvent(analysisStatusChanged);
        //setStatus("Stanford", "echec");
      }
    } else {
      analysisStatusChanged.detail.status = "en cours";
      analysisStatusChanged.detail.module = "stanford";
      body.dispatchEvent(analysisStatusChanged);
      //setStatus("Stanford", "en cours");
    }
  }
  request.send(text);
}

async function parseSentence(sentence){

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
  analysisStatusChanged.detail.status = "en cours";
  analysisStatusChanged.detail.module = "lexique3";
  body.dispatchEvent(analysisStatusChanged);
  //setStatus("Lexique3", "en cours");
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
    analysisStatusChanged.detail.status = "echec";
    analysisStatusChanged.detail.module = "lexique3";
    body.dispatchEvent(analysisStatusChanged);
    //setStatus("Lexique3", "echec");
  });
  let data = await response.json();

  //console.log(text + "(" +pos +") : " + JSON.stringify(data));
  analysisStatusChanged.detail.status = "ok";
  analysisStatusChanged.detail.module = "lexique3";
  body.dispatchEvent(analysisStatusChanged);
  //setStatus("Lexique3", "ok");
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
