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
