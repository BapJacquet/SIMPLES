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
class Speech {
  /**
   * @constructor
   * @param {string} id - The DOM ID of the editor element.
   */
  constructor (id) {
    try {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "fr-FR";
      this.isListening = false;
      this.utterance = "";
      this.recognition.onstart = () => {
        console.log("Voice recognition activated.");
        this.utterance = "";
      };
      this.recognition.onend = () => {
        console.log("End of voice recognition.");
        setTimeout(_ => {
          this.isListening = false;
        }, 1);
      };
      this.recognition.onerror = () => {
        console.log("No speech was detected.");
      };
      this.recognition.onresult = (event) => {
        let current = event.resultIndex;
        let transcript = event.results[current][0].transcript;
        console.log(transcript);
        this.utterance = transcript;
        this.isListening = false;
      };
    } catch (e) {
      console.error(e); // No speech recognition available.
    }
  }

  listen () {
    this.recognition.start();
    this.isListening = true;
    const promise = new Promise((resolve, reject) => {
      let id = null;
      id = setInterval(_ => {
        if (!this.isListening) {
          resolve(this.utterance);
          clearInterval(id);
        }
      }, 100);
    });
    return promise;
  }

  speak (text) {
    var speech = new SpeechSynthesisUtterance();

    speech.lang = "fr-FR";
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  }
}

Speech.instance = new Speech('#speech-button');
