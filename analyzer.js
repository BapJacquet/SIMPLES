/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "analyzeAllEditorContent" }] */
/* global $ */
/* global CustomEvent */
/* global XMLHttpRequest */
/* global XDomainRequest */
/* global fetch */
/* global editor */
/* =======================================================================
   VARIABLES
   ======================================================================= */

var body = $('body').get(0);

/* =======================================================================
   EVENTS
   ======================================================================= */

/**
 * Raises an event when the progress of the analysis has changed.
 * @param {Number} value - New value of the progress.
 */
function dispatchProgressChanged (value) {
  body.dispatchEvent(new CustomEvent('progresschanged', {
    detail: {
      value: value
    },
    bubbles: false,
    cancelable: false
  }));
}

/**
 * Raises an event when the analysis is completed.
 * @param {WordArray} complexWords - List of the complex words in the text.
 */
function dispatchAnalysisCompleted (complexWords) {
  body.dispatchEvent(new CustomEvent('analysiscompleted', {
    detail: {
      complexWords: complexWords
    },
    bubbles: false,
    cancelable: false
  }));
}

/**
 * Raises an event when the status is changed.
 * @param {string} moduleName - Name of the module which status changed.
 * @param {string} status - The new status of the module.
 */
function dispatchAnalysisStatusChanged (moduleName, status) {
  body.dispatchEvent(new CustomEvent('analysisstatuschanged', {
    detail: {
      module: moduleName,
      status: status
    },
    bubbles: false,
    cancelable: false
  }));
}

/* =======================================================================
   FUNCTIONS
   ======================================================================= */

/**
 * Analyzes all the content of the editor.
 */
function analyzeAllEditorContent () {
  let array = [];
  for (let i = 0; i < editor.blockCount; i++) {
    array.push(editor.getRawTextContent(i));
  }
  analyzeText(array.join('\n'));
}

/**
 * Begins the analysis of the given text.
 * @param {string} text - Text to analyze.
 */
function analyzeText (text) {
  dispatchProgressChanged(0);

  var request = createCORSRequest('POST', 'http://sioux.univ-paris8.fr:9000/');
  // var request = createCORSRequest("POST", 'localhost:9000/');
  request.onreadystatechange = async function () {
    if (request.readyState === 4) {
      if (request.status === 200) {
        dispatchAnalysisStatusChanged('stanford', 'ok');
        let complexWords = [];

        // Parse la réponse en JSON.
        var obj = JSON.parse(request.responseText);

        // Count the total number of tokens.
        let totalTokens = 0;
        for (let i = 0; i < obj.sentences.length; i++) {
          totalTokens += obj.sentences[i].tokens.length;
        }
        let progress = 0;

        // Récupère le résultat pour chaque phrase.
        for (let i = 0; i < obj.sentences.length; i++) {
          let s = obj.sentences[i];
          // Récupère le résultat pour chaque mot.
          for (let t = 0; t < s.tokens.length; t++) {
            // Iterates through the list of complex words to check if it's already in there.
            let alreadyChecked = false;
            for (let w = 0; w < complexWords.length; w++) {
              if (complexWords[w].text === s.tokens[t].word) {
                alreadyChecked = true;
                break;
              }
            }
            if (!alreadyChecked) {
              let word = {};
              // Position de la première lettre
              word.startOffset = s.tokens[t].characterOffsetBegin;
              // Longueur
              word.length = s.tokens[t].characterOffsetEnd - word.startOffset;
              // Le mot
              word.text = s.tokens[t].word;
              // Sa fonction
              word.pos = s.tokens[t].pos;
              // Recherche plus d'informations dans le lexique si nécessaire.
              if (needLexique3(word.pos)) {
                // Autres informations
                let data = await checkLexique3(word);
                // Fréquence du mot
                if (!Utils.isNullOrUndefined(data)) {
                  word.frequency = Math.max(data.movies, data.books);
                  word.lemma = data.lemma;
                }
                // Ajoute le mot à la liste des mots complexes si besoin.
                switch (frequencyToText(word.frequency)) {
                  case 'inconnu': case 'très rare': case 'rare': case 'commun':
                    word.dictionary = await getDictionaryEntry(word.lemma || word.text);
                    complexWords.push(word);
                    break;
                }
              }
            }

            dispatchProgressChanged((++progress * 100) / totalTokens);
          }
        }
        dispatchAnalysisCompleted(complexWords);
      } else {
        dispatchAnalysisStatusChanged('stanford', 'echec');
      }
    } else {
      dispatchAnalysisStatusChanged('stanford', 'en cours');
    }
  };
  request.send(text);
}

/**
 * Check if the given Part-Of-Speech requires a check in Lexique3.
 * @param {string} pos - The Part-Of-Speech to test.
 * @return {boolean} - Whether the Part-Of-Speech requires a check or not.
 */
function needLexique3 (pos) {
  switch (pos) {
    case 'PUNCT' : case 'ADP' : case 'DET' : case 'PRON' : case 'PART': return false;
    default: return true;
  }
}

/**
 * Requests a check of the Lexique3 database for the given word.
 * @param {Word} word - Word object to check the database with.
 * @return {Object} - Data returned from Lexique3.
 */
async function checkLexique3 (word) {
  dispatchAnalysisStatusChanged('lexique3', 'en cours');
  // S'assure que le mot est en minuscules.
  let text = word.text.toLowerCase();
  // Enlève le tiret si il y en a un au début du mot.
  if (text.startsWith('-')) text = text.substring(1, text.length);
  // Transforme la fonction syntaxique pour être compatible avec Lexique3.
  let pos = convertPos(word.pos, 'Lexique3');
  console.log(text + '  ' + pos);
  // Lance la requète pour rechercher les informations pour le mot et sa fonction.
  let response = await fetch(`https://sioux.univ-paris8.fr/simples/lexique3_multi.php?word=${text}&pos=${pos}`)
  // let response = await fetch(`http://localhost/lexique3.php?word=${text}&pos=${pos}`)
  // let response = await fetch(`http://localhost:8888/simples2/lexique3_multi.php?word=${text}&pos=${pos}`)
    .catch(function (error) {
      dispatchAnalysisStatusChanged('lexique3', 'echec');
      console.log(error);
    });
  let data = await response.json();

  // console.log(text + "(" +pos +") : " + JSON.stringify(data));
  dispatchAnalysisStatusChanged('lexique3', 'ok');
  console.log(data);
  return data[0];
}

/**
 * Turn a given frequency into a user-friendly text.
 * @param {int} frequency - The frequency of the word.
 * @return {string} - A user friendly text.
 */
function frequencyToText (frequency) {
  if (typeof frequency === 'undefined') return 'inconnu';
  if (frequency < 5) return 'très rare';
  if (frequency < 10) return 'rare';
  if (frequency < 20) return 'commun';
  if (frequency < 50) return 'fréquent';
  return 'très fréquent';
}

/**
 * Turn a given Part-Of-Speech label into its equivalent in the
 * target format.
 * @param {string} pos - The Part-Of-Speech label to convert.
 * @param {string} targetFormat - The target format. Can be Lexique3 or Google.
 * @return {string} - The converted Part-Of-Speech label.
 */
function convertPos (pos, targetFormat) {
  switch (targetFormat) {
    case 'Lexique3':
      switch (pos) {
        case 'VERB': return 'VER';
        case 'INTJ': return 'ONO';
        case 'PRON': return 'PRO';
        case 'NOUN': return 'NOM';
        default: return pos;
      }
    default: return pos;
  }
}

/**
 * Create a CORS request.
 * @param {string} method - Either GET or POST.
 * @param {string} url - The url of the request.
 * @param {boolean} async - (optional) Whether the request is async or not.
 * @return - Either a XMLHttpRequest or an XDomainRequest or null.
 */
function createCORSRequest (method, url, async = true) {
  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, async);
  } else if (typeof XDomainRequest !== 'undefined') {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

async function getDictionaryEntry (word) {
  let response;
  try {
    response = await $.get('https://googledictionaryapi.eu-gb.mybluemix.net/', {define: word, lang: 'fr'});
  } catch (e) {
    return {meanings: []};
  }
  let result = {
    meanings: []
  };
  for (let i = 0; i < response.length; i++) {
    let type = Object.keys(response[i].meaning)[0];
    for (let j = 0; j < response[i].meaning[type].definitions.length; j++) {
      result.meanings.push({
        type: type,
        definition: response[i].meaning[type].definitions[j].definition,
        example: response[i].meaning[type].definitions[j].example,
        synonyms: response[i].meaning[type].definitions[j].synonyms
      });
    }
  }
  return result;
}

async function getImagesSuggestions (blockIndex) {
  let words = editor.getSignificantWords(blockIndex);
  let search = '';
  for (let i = 0; i < words.length; i++) {
    search += words[i] + ' ';
  }
  return getImagesForKeyword(search);
}

async function getImagesForKeyword (keyword, options = {arasaac: true, sclera: true, qwant: true}) {
  let result = {arasaac: [], sclera: [], qwant: [], searchText: keyword};
  if (keyword) {
    if (options.arasaac) {
      try {
        let response = await fetch('https://api.arasaac.org/api/pictograms/fr/search/' + keyword);
        let json = await response.json();
        for (let i = 0; i < json.length; i++) {
          result.arasaac.push(`https://static.arasaac.org/pictograms/${json[i].idPictogram}_300.png`);
        }
      } catch (ex) {
        console.log(ex);
      }
    }
    if (options.sclera) {
      // TODO add.
    }
    if (options.qwant) {
      try {
        let response = await fetch(`qwant_proxy.php?count=10&q=${keyword}`);
        let json = await response.json();
        let items = json.data.result.items;
        for (let r in items) {
          result.qwant.push(items[r].media);
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }
  console.log(result);
  return result;
}
