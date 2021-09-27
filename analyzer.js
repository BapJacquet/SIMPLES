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

var pings = {
  Principal: {
    url: './index.php',
    latency: 0,
    usable: true
  },
  Lexique3: {
    url: './lexique3_multi.php',
    latency: 0,
    usable: true
  },
  Stanford: {
    url: 'http://51.91.138.70:9000',
    latency: 0,
    usable: true
  }
}

/*$('#pingbutton').on('click', function () {
  simplesAlert('Notifications', 'fa-exclamation-triangle', '<div><div id="pingers">Un instant...<div></div>');
});*/
$('#pingbutton').hide();
$('[data-toggle="popover"]').popover();
$('#pingbutton').on('shown.bs.popover', function () {
  pingAll();
})

async function pingAll () {
  let s = '';
  for (let p in pings) {
    pings[p] = await ping(pings[p]);
    let use = pings[p].usable ? '(Utilisable)' : '(Inaccessible)';
    s += `<div>${p} : ${pings[p].latency}ms ${use}</div>`;
  }
  if (pings.Principal.latency > 500 || pings.Lexique3.latency > 500 || pings.Stanford.latency > 500 ||
      !pings.Principal.usable || !pings.Lexique3.usable || !pings.Stanford.usable) {
    $('#pingbutton').show(150);
  } else {
    $('#pingbutton').hide(150);
  }
  $('#pingers').html(s);
}

var pingClock = setInterval(pingAll, 10000)

async function ping (object) {
  var start = $.now();
  let p = new Promise((resolve, reject) => {
    $.ajax({
      type: 'HEAD',
      url: object.url,
      cache: false,
      timeout: 5000,
      success: function () {
        object.usable = true;
      },
      error: function () {
        object.usable = false;
      },
      complete: function () {
        object.latency = $.now() - start;
        resolve(object);
      }
    });
  })
  return p;
}

var rules = [
  // Prioritaires
  {priority: 3,
    text: 'Impliquez&nbsp;des&nbsp;personnes en&nbsp;situation&nbsp;de&nbsp;handicap ou&nbsp;du&nbsp;groupe&nbsp;cible.',
    test: function (data) { return {result: false, info: {}}; }},
  {priority: 3,
    text: 'Placez&nbsp;vos&nbsp;informations dans&nbsp;un&nbsp;ordre facile&nbsp;à&nbsp;comprendre et&nbsp;facile&nbsp;à&nbsp;suivre.',
    test: function (data) { return {result: false, info: {}}; }},
  {priority: 3,
    text: 'Faites&nbsp;des&nbsp;phrases&nbsp;courtes. Ecrivez&nbsp;une&nbsp;seule&nbsp;idée par&nbsp;phrase.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 3,
    text: "Si&nbsp;possible, une&nbsp;phrase&nbsp;doit&nbsp;tenir sur&nbsp;une&nbsp;seule&nbsp;ligne.\nSinon,&nbsp;coupez&nbsp;la&nbsp;phrase à&nbsp;l'endroit où&nbsp;une&nbsp;pause&nbsp;sera&nbsp;faite lorsque&nbsp;le&nbsp;texte&nbsp;sera&nbsp;lu à&nbsp;voix&nbsp;haute.",
    test: function (data) {
      let pattern = /[^.!?\s][^.!?\n]+[.?!\n]/gm;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          for (let s of m) {
            if (s.visualWidth() >= $(editor.getTextElement(i)).width()) {
              count++;
            }
          }
        }
      }
      return {result: count === 0, info: {}};
    }},
  {priority: 3,
    text: 'Mettez&nbsp;un&nbsp;point et&nbsp;faites&nbsp;une&nbsp;nouvelle&nbsp;phrase avant&nbsp;de&nbsp;commencer une&nbsp;nouvelle&nbsp;idée.\nÉvitez&nbsp;les&nbsp;virgules et&nbsp;les&nbsp;"et".',
    test: function (data) {
      let pattern = /(?:,|\bet\b)/ig;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count <= data.raw.length, info: {focusPattern: pattern}};
    }},
  {priority: 3,
    text: 'Utilisez&nbsp;des&nbsp;mots faciles&nbsp;à&nbsp;comprendre.\nUtilisez&nbsp;des&nbsp;mots que&nbsp;les&nbsp;personnes connaissent&nbsp;bien.',
    test: function (data) {
      let appendedContent = '';
      for(let cm of data.complexWords) {
        let synonyms = '';
        let color = '#333333';
        if (cm.frequency < 5) color = '#c10000';
        else if (cm.frequency < 10) color = '#c16700';
        else if (cm.frequency < 20) color = '#006700';
        let content = `<p>${description(frequencyToText(cm.frequency))}</p>`;
        if (cm.dictionary.meanings.length > 0) {
          for (let j = 0; j < cm.dictionary.meanings[0].synonyms.length; j++) {
            synonyms += cm.dictionary.meanings[0].synonyms[j] + ' ';
          }
          content += `<p><strong>Définition :</strong><br/>${cm.dictionary.meanings[0].definition.replace(/"/g, '\'\'')}</p><p><strong>Synonymes :</strong><br/>${synonyms}</p>`;
        }
        let popover = `data-html="true" data-boundary="viewport" data-placement="auto" data-trigger="hover" data-toggle="popover" title='${frequencyToText(cm.frequency)}' data-content="${content}"`;

        appendedContent += `<button style="background: ${color}; border-color: ${color};" type="button" class="ruleButton" ${popover} onClick='editor.selectFirst("${cm.text}", true)'>${cm.text}</button>`
      }
      return {result: data.complexWords.length === 0, info: {append: '<div>' + appendedContent + '</div>'}};
    }},
  {priority: 3,
    text: 'Expliquez&nbsp;clairement les&nbsp;mots&nbsp;difficiles au&nbsp;moment où&nbsp;ils&nbsp;sont&nbsp;utilisés.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 3,
    text: "Utilisez&nbsp;toujours une&nbsp;police&nbsp;d'écriture facile&nbsp;à&nbsp;lire comme&nbsp;Arial&nbsp;14.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 3,
    text: "N'utilisez&nbsp;jamais une&nbsp;écriture&nbsp;trop&nbsp;claire ou&nbsp;en&nbsp;couleur qui&nbsp;ne&nbsp;s'imprime&nbsp;pas&nbsp;bien.",
    test: function (data) {
      let wrongColors = [];
      for (let i = 0; i < data.styled.length; i++) {
        for (let j = 0; j < data.styled[i].length; j++) {
          if (!Utils.isNullOrUndefined(data.styled[i][j].color)) {
            if (!w3color(data.styled[i][j].color).isDark(64)) {
              wrongColors.push(data.styled[i][j].color);
            }
          }
        }
      }
      console.log(wrongColors);
      return {result: wrongColors.length === 0, info: {}};
    }},
  {priority: 3,
    text: "N'écrivez&nbsp;jamais en&nbsp;italique.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 3,
    text: "N'écrivez&nbsp;pas avec&nbsp;des&nbsp;ombres ou&nbsp;des&nbsp;contours.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 3,
    text: 'Ne&nbsp;soulignez&nbsp;pas le&nbsp;texte.',
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 3,
    text: 'Commencez&nbsp;toujours une&nbsp;nouvelle&nbsp;phrase sur&nbsp;une&nbsp;nouvelle&nbsp;ligne.',
    test: function (data) {
      let pattern = /[\.\?\!][^\n\.\?\!]+/gm;
      let result = true;
      for (let i = 0; i < data.raw.length; i++) {
        if (!Utils.isNullOrUndefined(data.raw[i].match(pattern))) {
          result = false;
        }
      }
      return {result: result, info: {focusPattern: pattern}};
    }},
  {priority: 3,
    text: 'Ne&nbsp;mettez&nbsp;pas trop&nbsp;de&nbsp;texte sur&nbsp;une&nbsp;page.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 3,
    text: 'Placez&nbsp;des&nbsp;images à&nbsp;coté&nbsp;du&nbsp;texte pour&nbsp;le&nbsp;décrire.',
    test: function (data) { return {result: undefined, info: {}}; }},
  // Très importantes
  {priority: 2,
    text: 'Utilisez&nbsp;le&nbsp;même&nbsp;mot pour&nbsp;parler&nbsp;de&nbsp;la&nbsp;même&nbsp;chose.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 2,
    text: 'Parlez&nbsp;directement&nbsp;aux&nbsp;gens. Utilisez&nbsp;des&nbsp;mots&nbsp;comme&nbsp;"vous".',
    test: function (data) {
      let positivePattern = /\b(?:vous|tu|je)\b/gmi;
      let negativePattern = /\b(?:il|elle|on|ils|elles|nous)\b/gmi;
      let positiveCount = 0;
      let negativeCount = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let pm = data.raw[i].match(positivePattern);
        let nm = data.raw[i].match(negativePattern);
        if (!Utils.isNullOrUndefined(pm)) {
          positiveCount += pm.length;
        }
        if (!Utils.isNullOrUndefined(nm)) {
          negativeCount += nm.length;
        }
      }
      return {result: negativeCount <= positiveCount / 2, info: {focusPattern: negativePattern}};
    }},
  {priority: 2,
    text: "Utilisez&nbsp;des&nbsp;phrases&nbsp;positives. Evitez&nbsp;les&nbsp;phrases&nbsp;négatives quand&nbsp;c'est&nbsp;possible.",
    test: function (data) {
      let pattern = /\bn(?:e|').+pas\b/gmi;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 2,
    text: 'Alignez&nbsp;le&nbsp;texte à&nbsp;gauche.',
    test: function (data) { return {result: true, info: {}}; }},
  // importantes
  {priority: 1,
    text: 'Placez&nbsp;les&nbsp;informations&nbsp;importantes au&nbsp;début&nbsp;du&nbsp;document.',
    test: function (data) { return {result: false, info: {}}; }},
  {priority: 1,
    text: 'Les&nbsp;informations&nbsp;importantes doivent&nbsp;être&nbsp;faciles à&nbsp;trouver.',
    test: function (data) { return {result: false, info: {}}; }},
  {priority: 1,
    text: 'Mettez les informations importantes en gras, ou encadrées.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: 'Utilisez&nbsp;des&nbsp;titres&nbsp;clairs et&nbsp;faciles&nbsp;à&nbsp;comprendre. Les&nbsp;titres&nbsp;doivent&nbsp;expliquer ce&nbsp;qui&nbsp;va&nbsp;suivre juste&nbsp;après.',
    test: function (data) { return {result: false, info: {}}; }},
  {priority: 1,
    text: "N'utilisez&nbsp;pas&nbsp;de&nbsp;notes de&nbsp;bas&nbsp;de&nbsp;page.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: "N'utilisez pas trop de sous-titres ou de points comme 1.2.1.",
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: "N'utilisez&nbsp;pas des&nbsp;idées&nbsp;difficiles comme&nbsp;la&nbsp;métaphore.",
    test: function (data) { return {result: false, info: {}}; }},
  {priority: 1,
    text: "Attention&nbsp;aux&nbsp;pronoms&nbsp;: vérifiez&nbsp;qu'il&nbsp;est&nbsp;toujours&nbsp;clair de&nbsp;qui&nbsp;ou&nbsp;de&nbsp;quoi parle&nbsp;le&nbsp;pronom.",
    test: function (data) {
      let pattern = /\b(?:il|elle|on|ils|elles|nous)\b/gmi;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: 'Écrivez&nbsp;les&nbsp;nombres en&nbsp;chiffres, pas&nbsp;en&nbsp;lettres.',
    test: function (data) {
      let pattern = /\b(?:deux|trois|quatre|cinq|six|sept|huigt|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingts?|trente|quarante|cinquante|soixante|cent|mille)(?:(?:-|\s)?(?:deux|trois|quatre|cinq|six|sept|huigt|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingts?|trente|quarante|cinquante|soixante|cent|mille))*\b/ig
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: 'Favorisez le présent.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: "Évitez d'utiliser des initiales. Utilisez le mot entier quand c'est possible.",
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: 'Écrivez&nbsp;les&nbsp;dates en&nbsp;entier.',
    test: function (data) {
      let pattern = /\b(?:[0-2]?[0-9](?::|\s*h\s*)(?:[0-9]{2})?|[0-3]?[0-9]\/[0-1]?[0-9](?:\/\d{2})?)\b/igm;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: "N'utilisez pas de mots d'une langue étrangère, sauf si ces mots sont connus.",
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: "Évitez&nbsp;d'utiliser&nbsp;des&nbsp;pourcentages ou&nbsp;de&nbsp;grands&nbsp;nombres. Utilisez&nbsp;plutôt&nbsp;\"peu&nbsp;de\" ou&nbsp;\"beaucoup&nbsp;de\".",
    test: function (data) {
      let pattern = /[0-1]?[0-9]{1,2}\s*%/gm;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: 'Évitez les caractères spéciaux.',
    test: function (data) {
      let pattern = /[&#§¤|]/gm;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: 'Évitez toutes les abréviations.',
    test: function (data) {
      let pattern = /\W(?:etc\.|par ex\.|e\.?g\.)\W/gmi;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: "N'utilisez jamais de chiffres romains.",
    test: function (data) {
      let pattern = /[^a-zA-Z0-9éèêàùû_][IVX]+[^a-zA-Z0-9éèêàùû_]/gm;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: "N'écrivez pas de mots entiers en majuscules.",
    test: function (data) {
      let pattern = /(?:\W|^)[A-Z]+(?:\W|$)/gm;
      let count = 0;
      for (let i = 0; i < data.raw.length; i++) {
        let m = data.raw[i].match(pattern);
        if (!Utils.isNullOrUndefined(m)) {
          count += m.length;
        }
      }
      return {result: count === 0, info: {focusPattern: pattern}};
    }},
  {priority: 1,
    text: "Utilisez&nbsp;un&nbsp;seul&nbsp;type&nbsp;d'écriture dans&nbsp;le&nbsp;texte.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: 'Laissez&nbsp;des&nbsp;espaces entre&nbsp;les&nbsp;paragraphes.',
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: "Laissez&nbsp;de&nbsp;grandes&nbsp;marges quand&nbsp;c'est&nbsp;possible.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: 'Utilisez&nbsp;des&nbsp;points ou&nbsp;des&nbsp;numéros pour&nbsp;les&nbsp;listes.',
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: 'Alignez&nbsp;la&nbsp;première&nbsp;ligne du&nbsp;paragraphe avec&nbsp;le&nbsp;reste&nbsp;du&nbsp;texte.',
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: 'Numérotez&nbsp;les&nbsp;pages de&nbsp;votre&nbsp;document.',
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: "N'écrivez&nbsp;pas dans&nbsp;des&nbsp;colonnes.",
    test: function (data) { return {result: true, info: {}}; }},
  {priority: 1,
    text: 'Utilisez des images faciles à comprendre.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: 'Évitez des images surchargées avec trop de choses à regarder.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: 'Utilisez la même image pour décrire la même chose dans tout le document.',
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: "Utilisez le même type d'image à travers tout le document.",
    test: function (data) { return {result: undefined, info: {}}; }},
  {priority: 1,
    text: 'Les graphiques et les tableaux doivent être simples et bien expliqués.',
    test: function (data) { return {result: undefined, info: {}}; }}
];

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
 * Analyzes one block.
 */
/*function analyzeAllEditorContent () {
  let array = [];
  for (let i = 0; i < editor.blockCount; i++) {
    array.push(editor.getRawTextContent(i));
  }
  analyzeText(array.join('\n'));
}*/

/**
 * Begins the analysis of the given text.
 * @param {string} text - Text to analyze.
 */
function analyzeText (text) {
  dispatchProgressChanged(0);

  var request = createCORSRequest('POST', 'http://51.91.138.70:9000/');
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

async function checkTokensComplexity (tokens, checkedWords) {
  let complexWords = [];
  for (let t = 0; t < tokens.length; t++) {
    let alreadyChecked = false;
    for (let w = 0; w < checkedWords.length; w++) {
      if (checkedWords[w].text === tokens[t].word && checkedWords[w].pos === tokens[t].pos) {
        alreadyChecked = true;
        break;
      }
    }
    if (alreadyChecked) continue;
    let word = {
      text: tokens[t].word,
      pos: tokens[t].pos
    };
    if (needLexique3(word.pos) && pings.Lexique3.usable) {
      checkedWords.push(word);
      let data = await checkLexique3(word);
      if (!Utils.isNullOrUndefined(data)) {
        word.frequency = Math.max(data.movies, data.books);
        word.lemma = data.lemma;
      }
      switch (frequencyToText(word.frequency)) {
        case 'inconnu': case 'très rare': case 'rare': case 'commun':
          word.dictionary = await getGoogleEntry(word.lemma || word.text);
          //word.dictionary = await getInternauteEntry(word.lemma || word.text);
          complexWords.push(word);
          break;
      }
    }
  }
  return complexWords;
}

/**
 * Check if the given Part-Of-Speech requires a check in Lexique3.
 * @param {string} pos - The Part-Of-Speech to test.
 * @return {boolean} - Whether the Part-Of-Speech requires a check or not.
 */
function needLexique3 (pos) {
  switch (pos) {
    case 'PUNCT' : case 'ADP' : case 'DET' : case 'PRON' : case 'PART': case 'SCONJ': case 'CONJ': case 'NUM': return false;
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
  if (text.startsWith('-')) text = text.substring(1);
  // Transforme la fonction syntaxique pour être compatible avec Lexique3.
  const pos = convertPos(word.pos, 'Lexique3');
  console.log(text + '  ' + pos);
  // Lance la requète pour rechercher les informations pour le mot et sa fonction.
  const data = await $.ajax('./lexique3_multi.php', {
    data: {
      word: text,
      pos: pos
    },
    error: function (error) {
      dispatchAnalysisStatusChanged('lexique3', 'echec');
      console.log(error);
    },
    dataType: 'json'
  });
  // let response = await fetch(`http://51.91.138.70/lirec/lexique3_multi.php?word=${text}&pos=${pos}`)
  // let response = await fetch(`https://sioux.univ-paris8.fr/simples/lexique3_multi.php?word=${text}&pos=${pos}`)
  // let response = await fetch(`http://localhost/lexique3.php?word=${text}&pos=${pos}`)
  // let response = await fetch(`http://localhost:8888/simples2/lexique3_multi.php?word=${text}&pos=${pos}`)
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

async function getGoogleEntry (word) {
  let response;
  try {
    response = await $.get(`https://api.dictionaryapi.dev/api/v1/entries/fr/${encodeURIComponent(word)}`);
  } catch (e) {
    console.log("Error: " + e.message);
    return {meanings: []};
  }
  let result = {
    meanings: []
  };
  for (let i = 0; i < response.length; i++) {
    let type = Object.keys(response[i].meaning)[0];
    if (!Utils.isNullOrUndefined(response[i].meaning[type].definitions)) {
      for (let j = 0; j < response[i].meaning[type].definitions.length; j++) {
        result.meanings.push({
          type: type,
          definition: response[i].meaning[type].definitions[j].definition,
          example: response[i].meaning[type].definitions[j].example,
          synonyms: response[i].meaning[type].definitions[j].synonyms
        });
      }
    } else {
      console.log("Error: No definition found.");
    }
  }
  return result;
}

async function getInternauteEntry (word, pos = null) {
  let response;
  try {
    response = await $.get('./internaute_proxy.php', { word: encodeURIComponent(word) });
  } catch (e) {
    console.log('Error: ' + e.message);
    return { meanings: [] };
  }
  response = JSON.parse(response);
  const result = { meanings: [] };
  for (let i = 0; i < response.length; i++) {
    const type = response[i].pos;
    for (let j = 0; j < response[i].meanings.length; j++) {
      result.meanings.push({
        type: type,
        definition: response[i].meanings[j].definition,
        example: response[i].meanings[j].example,
        synonyms: response[i].meanings[j].synonyms
      });
    }
  }
  return result;
}

async function getImagesSuggestions (blockIndex) {
  const words = editor.getSignificantWords(blockIndex);
  let search = '';
  for (let i = 0; i < words.length; i++) {
    search += words[i] + ' ';
  }
  return getImagesForKeyword(search);
}

async function getImagesForKeyword (keyword, options = { arasaac: true, sclera: true, qwant: true }) {
  console.log('Checking images for: ' + keyword);
  const result = { arasaac: [], sclera: [], qwant: [], google: [], searchText: keyword };
  if (keyword) {
    if (options.arasaac) {
      console.log('Trying on ARASAAC...')
      try {
        // let response = await fetch('https://api.arasaac.org/api/pictograms/fr/search/' + keyword);
        const json = await $.ajax('https://api.arasaac.org/api/pictograms/fr/search/' + keyword, {
          dataType: 'json',
          timeout: 5000
        });
        console.log('Found ' + json.length + ' pictograms.');
        for (let i = 0; i < json.length; i++) {
          result.arasaac.push(`https://static.arasaac.org/pictograms/${json[i]._id}_300.png`);
        }
      } catch (ex) {
        console.log('Failed to get images from ARASAAC.');
        console.log(ex);
      }
    }
    if (options.sclera) {
      console.log('Trying on SCLERA...');
      try {
        // let response = await fetch(`./qwant_proxy.php?count=10&q=${keyword} pictogramme`);
        const response = await $.ajax('./sclera_proxy.php', {
          data: {
            q: keyword
          },
          dataType: 'json',
          timeout: 5000
        });
        const items = response;
        console.log('Found ' + items.length + ' pictograms.');
        for (const r in items) {
          result.sclera.push(items[r]);
        }
      } catch (ex) {
        console.log('Failed to get images from SCLERA.');
        console.log(ex);
      }
    }
    if (options.qwant) {
      console.log('Trying on QWANT...');
      let qwanted = false;
      try {
        // let response = await fetch(`./qwant_proxy.php?count=10&q=${keyword} pictogramme`);
        const response = await $.ajax('./qwant_proxy.php', {
          data: {
            count: 10,
            q: keyword + ' pictogramme'
          },
          dataType: 'json',
          timeout: 5000
        });
        const items = response.data.result.items;
        console.log('Found ' + items.length + ' pictograms.');
        for (const r in items) {
          result.qwant.push(items[r].media);
        }
        qwanted = true;
      } catch (ex) {
        console.log('Failed to get images from QWANT.');
        console.log(ex);
      }
      if (!qwanted) {
        console.log('Trying to get them from Google instead.');
        try {
          // let response = await fetch(`./qwant_proxy.php?count=10&q=${keyword} pictogramme`);
          const response = await $.ajax('./google_images_proxy.php', {
            data: {
              q: keyword + ' pictogramme'
            },
            dataType: 'json',
            timeout: 5000
          });
          const items = response[0];
          console.log('Found ' + items.length + ' pictograms.');
          for (const r in items) {
            result.google.push(items[r]);
          }
        } catch (ex) {
          console.log('Failed to get images from Google.');
          console.log(ex);
        }
      }
    }
  }
  console.log(result);
  return result;
}

async function checkFalcQualityForBlock (editor, blockid) {
  dispatchProgressChanged(0);
  const rawTextContent = [];
  const sentencesTokens = [];
  const fullStyledContent = [];
  rawTextContent.push(editor.getRawTextContent(blockid));
  if (pings.Stanford.usable) sentencesTokens.push(await getTokens(rawTextContent[0]));
  fullStyledContent.push(editor.getStyledText(blockid));

  let checkedTokens = 0;
  let tokensCount = 0;

  if (sentencesTokens.length > 0) {
    for(let i = 0; i < sentencesTokens[0].sentences.length; i++) {
      tokensCount += sentencesTokens[0].sentences[i].tokens.length;
    }
  }

  let complexWords = [];
  const checkedWords = [];

  if (sentencesTokens.length > 0) {
    for (let s = 0; s < sentencesTokens[0].sentences.length; s++) {
      const cw = await checkTokensComplexity(sentencesTokens[0].sentences[s].tokens, checkedWords);
      complexWords = complexWords.concat(cw);
      checkedTokens += sentencesTokens[0].sentences[s].tokens.length;
      dispatchProgressChanged(((checkedTokens) * 100) / tokensCount);
    }
  }

  const result = {
    rules: await checkRules({ raw: rawTextContent, complexWords: complexWords, tokens: sentencesTokens, styled: fullStyledContent })
  };
  let mainRules = 0;
  let veryImportantRules = 0;
  let importantRules = 0;
  for (let i = 0; i < result.rules.length; i++) {
    if (result.rules[i].priority === 3 && result.rules[i].success) {
      mainRules++;
    } else if (result.rules[i].priority === 2 && result.rules[i].success) {
      veryImportantRules++;
    } else if (result.rules[i].priority === 1 && result.rules[i].success) {
      importantRules++;
    }
  }
  result.mainRulesSuccess = mainRules;
  result.veryImportantRulesSuccess = veryImportantRules;
  result.importantRulesSuccess = importantRules;

  result.score = Math.round(((mainRules * 3 + veryImportantRules * 2 + importantRules) / (15 * 3 + 4 * 2 + 30)) * 100);

  return result;
}

function createAnalysisLog (analysisResults) {
  let result = ";Score Total; " + analysisResults.score + "\n";
  result += "Règle;Remplie;Score\n";
  for (let i = 0; i < analysisResults.rules.length; i++) {
    result += `${analysisResults.rules[i].rule.replace(/&nbsp;/g, ' ').replace(/\n/g,' ')};${analysisResults.rules[i].success ? 'oui' : 'non'};${analysisResults.rules[i].success ? analysisResults.rules[i].priority : 0}\n`;
  }
  return '\ufeff' + result; // Add UTF-8
}

async function checkFalcQuality (editor) {
  // Prepare data
  dispatchProgressChanged(0);
  const rawTextContent = [];
  const sentencesTokens = [];
  const fullStyledContent = [];
  for (let i = 0; i < editor.blockCount; i++) {
    const text = editor.getRawTextContent(i);
    rawTextContent.push(text);
    try{
        if (pings.Stanford.usable) sentencesTokens.push(await getTokens(text));
    } catch (err) {
        alert("Impossible de se connecter au serveur Stanford.\nL'analyse peut être incomplête.\nErreur : " + err);
    }
    fullStyledContent.push(editor.getStyledText(i));
    dispatchProgressChanged(((i + 1) * 100) / editor.blockCount);
  }
  // Check complex words.
  dispatchProgressChanged(0);
  let checkedSentences = 0;
  let sentencesCount = 0;
  for (let i = 0; i < editor.blockCount; i++) {
    if (sentencesTokens.length > 0) {
      sentencesCount += sentencesTokens[i].sentences.length;
    }
  }

  let complexWords = [];
  const checkedWords = [];
  for (let i = 0; i < editor.blockCount; i++) {
    if (sentencesTokens.length > 0) {
      for (let s = 0; s < sentencesTokens[i].sentences.length; s++) {
        const cw = await checkTokensComplexity(sentencesTokens[i].sentences[s].tokens, checkedWords);
        complexWords = complexWords.concat(cw);
        checkedSentences += 1;
        dispatchProgressChanged(((checkedSentences) * 100) / sentencesCount);
      }
    }
  }
  const result = {
    rules: await checkRules({ raw: rawTextContent, complexWords: complexWords, tokens: sentencesTokens, styled: fullStyledContent })
  };
  let mainRules = 0;
  let veryImportantRules = 0;
  let importantRules = 0;
  for (let i = 0; i < result.rules.length; i++) {
    if (result.rules[i].priority === 3 && result.rules[i].success) {
      mainRules++;
    } else if (result.rules[i].priority === 2 && result.rules[i].success) {
      veryImportantRules++;
    } else if (result.rules[i].priority === 1 && result.rules[i].success) {
      importantRules++;
    }
  }
  result.mainRulesSuccess = mainRules;
  result.veryImportantRulesSuccess = veryImportantRules;
  result.importantRulesSuccess = importantRules;

  result.score = Math.round(((mainRules * 3 + veryImportantRules * 2 + importantRules) / (15 * 3 + 4 * 2 + 30)) * 100);
  return result;
}

async function getTokens (text) {
  return $.ajax({
    type: 'POST',
    timeout: 5000,
    url: 'http://51.91.138.70:9000',
    data: text,
    dataType: 'json',
    async: false,
    error: function(xhr){
        console.log("Erreur pour obtenir les tokens.");
        console.log(xhr);
    }
  });
}

async function checkRules (data) {
  const result = [];
  dispatchProgressChanged(0);
  for (let i = 0; i < rules.length; i++) {
    const testResult = rules[i].test(data);
    result.push({ priority: rules[i].priority, rule: rules[i].text, success: testResult.result, info: testResult.info });
    dispatchProgressChanged(((i + 1) * 100) / rules.length);
  }
  return result;
}
