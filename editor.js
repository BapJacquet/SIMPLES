/**
 * A prévoir : Event formatChanged pour quand le format de la selection est différent du précédent
 * A prévoir : fonction setFormat(object)
 *
 */
class Editor {
  /**
   * @constructor
   * @param {string} id - The DOM ID of the editor element.
   */
  constructor(id, toolbarID){
    this.id = id;
    this.addBlock("", false);

    this.registerEvents();
  }

  /**
   * Get the current amount of blocks in the editor.
   * @return {int} - Number of blocks.
   */
  get blockCount() {
    return $(".editor-block").length;
  }

  /**
   * Register all the events of the editor.
   */
  registerEvents(){
    $(this.id).on("keypress", ".editor-block", event => { this.onKeypress(event) });
    $(this.id).on("blur", ".media-body", event => { this.onBlur(event) })
  }

  /**
   * Handle special keys in editor blocks.
   * ENTER should add a new line or a new block if there is already a new line
   * BACKSPACE should remove a character or the current block if this one is empty
   * @param {KeypressEvent} event - The event to handle.
   */
  onKeypress(event){
    let caller = event.target;
    let id = parseInt(caller.id.substring(4));
    switch(event.which){
      case 13: //Line breaks
        event.stopPropagation();
        event.preventDefault();
        let sel = this.getSelection();
        let range = sel.getRangeAt(0);
        let previousNode = range.startContainer;
        //if(previousNode && previousNode.nodeName === 'BR' && range.startOffset === 0){
          this.insertBlockAfter(id, "", true);
        //} else {*/
          //document.execCommand("insertHTML", true, null);
          //document.execCommand("bold", true, null);
          //document.execCommand("insertText", true, " ");
        //}
        //this.processNewLine(id);
        break;
      case 8: //Return
        if(this.getTextContent(id).length == 0 && id != 0){
          this.removeBlockAt(id, id-1);
        }
        break;
    }
    /* DEBUG */
    let selection = this.getSelection();
    let range = selection.getRangeAt(0);
    console.log(range.startContainer.parentNode.nodeName);
  }

  /**
   * Handle switching focus out of text blocks.
   * @param {BlurEvent} event - The event to handle.
   */
  onBlur(event){
    let caller = event.target;
    //alert("leaving " + caller.id);
  }

  /**
   * Get the current selection within focused blocks.
   * @return {Selection} - The user's current selection.
   */
  getSelection(){
    if(getSelection().modify) { /* chrome */
      return window.getSelection();
    } else { /* IE */
      return getSelection();
    }
  }

  /**
   * Add a new line at the caret position.
   * @deprecated
   */
  processNewLine(id){
    if(getSelection().modify) {     /* chrome */
      var selection = window.getSelection(),
        range = selection.getRangeAt(0),
        br = document.createElement('br');
      range.deleteContents();
      range.insertNode(br);
      if(br.previousSibling.tagName === 'BR'){
        br.previousSibling.remove();
        br.remove();
        this.insertBlockAfter(id, "", true);
      } else {
        range.setStartAfter(br);
        range.setEndAfter(br);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);       /* end chrome */
      }
    } else {
      br = document.createElement('br');    /* internet explorer */
      var range = getSelection().getRangeAt(0);
      range.surroundContents(br);
      if(br.previousSibling.nodeName === 'BR'){
        br.previousSibling.remove();
        br.remove();
        this.insertBlockAfter(id, "", true);
      } else {
        range.selectNode(br.nextSibling);   /* end Internet Explorer 11 */
      }
    }
  }

  /**
   * Remove the block with the given ID and switch focus to a new id.
   * @param {int} id - ID of the block to remove.
   * @param {int} focusID - ID of the block that will get the focus.
   */
  removeBlockAt(id, focusID){
    $("#blc-" + id).remove();
    $("#txt-" + focusID).focus();
    for(let i = id + 1; i < this.blockCount; i++){
      this.changeBlockID(i, i-1);
    }
  }

  /**
   * Insert a block just below the block with the given index.
   * @param {int} index - ID of the block that the new block should follow.
   * @param {string} text - Text the new block should be initialized with.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertBlockAfter(index, text, focus){
    for(let i = this.blockCount - 1; i > index; i--){
      this.changeBlockID(i, i+1);
    }
    $("#blc-"+index).after(this.newBlockString(index+1, text));
    if(focus){
      $("#txt-"+(index+1)).focus();
    }
    this.setImage("#img-" + (index+1), "img/placeholder.png");
  }

  /**
   * Add a block at the end of the editor.
   * @param {string} text - Text the new block should be initialized with.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  addBlock(text, focus){
    let id = this.blockCount;
    $(this.id).append(this.newBlockString(id, text));
    if(focus){
      $("#txt-"+id).focus();
    }
    this.setImage("#img-" + id, "img/placeholder.png");
  }

  /**
   * Get the text content of the block with the given id.
   * @param {int} id - ID of the block to extract text from.
   * @return {string} - The extracted text.
   */
  getTextContent(id){
    let element = $("#txt-" + id).get(0);
    return element.textContent;
  }

  /**
   * Get a HTML string to initialize a block.
   * @param {int} id - ID of the new block.
   * @param {string} text - Text the new block should be initialized with.
   * @return {string} - HTML string of the new block.
   */
  newBlockString(id, text){
    return `<div id="blc-${id}" class="editor-block media">`+
             `<div id="txt-${id}" class="media-body align-self-center mr-3 border" contenteditable="true" style="margin:10px 0px 10px 0px">` +
                text +
             `</div>` +
             `<canvas id="img-${id}" class="align-self-center mr-3 hoverable" style="width:100px"/>`+
           `</div>`;
  }

  /**
   * Change the DOM ID of the block with the given id to the given new id.
   * @param {int} oldID - ID the block had until now.
   * @param {int} newID - ID the block should be having.
   */
  changeBlockID(oldID, newID){
    $("#blc-" + oldID).attr("id", "blc-" + newID);
    $("#txt-" + oldID).attr("id", "txt-" + newID);
    $("#img-" + oldID).attr("id", "img-" + newID);
  }

  /**
   * Set the image in the block with the given id, making it DataURL-ready.
   * @param {int} id - ID of the block.
   * @param {string} path - Path of the image source.
   */
  setImage(id, path){
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
        var canvas = $(id).get(0);
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        //var dataURL = canvas.toDataURL("image/png");
        //alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };
    img.src = path;
  }
}
