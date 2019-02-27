/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Editor" }] */
/* global $ */
/* global Image */
/* global Utils */
/* global CustomEvent */

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
  constructor (id) {
    this.id = id;
    this.format = null;
    this.addBlock('', false);

    this.registerEvents();
  }

  /**
   * Get the current amount of blocks in the editor.
   * @return {int} - Number of blocks.
   */
  get blockCount () {
    return $('.editor-block').length;
  }

  /**
   * Register all the events of the editor.
   */
  registerEvents () {
    $(this.id).on('keypress', '.editor-block', event => { this.onKeyPress(event); });
    $(this.id).on('keydown', '.editor-block', event => { this.onKeyDown(event); });
    $(this.id).on('click', '.editor-image', event => { this.dispatchImageClickEvent(event.target.id); });
    $(this.id).on('mouseup', '.editor-text', event => { this.updateFormat(); });
    $(this.id).on('focus', '.editor-text', event => { this.updateFormat(); });
  }

  /**
   * Handle special keys in editor blocks.
   * @param {KeyboardEvent} event - Event to handle.
   */
  onKeyDown (event) {
    let caller = event.target;
    let id = parseInt(caller.id.substring(4));
    switch (event.key) {
      case 'l':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          document.execCommand('insertUnorderedList', true, null);
        }
        break;
      case 'b':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          document.execCommand('bold', true, null);
        }
        break;
      case 'h':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          let current = this.getCurrentFormat().title;
          if (current === 'none') current = 'div';
          let formats = ['div', 'h1', 'h2', 'h3', 'h4', 'h5'];
          let index = formats.indexOf(current) + 1;
          if (index === formats.length) index = 0;
          document.execCommand('formatBlock', true, formats[index]);
        }
        break;
      case '+':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          var sel = this.getSelection();
          var range = sel.getRangeAt(0);
          var container = range.startContainer;
          while (!(container.classList && container.classList.contains('editor-block'))) {
            container = container.parentNode;
          }
          let size = Utils.pixelToPoint(parseFloat($(container).css('font-size')));
          $(container).css('font-size', `${Utils.pointToPixel(size + 1)}px`);
        }
        break;
      case '-':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          let sel = this.getSelection();
          let range = sel.getRangeAt(0);
          let container = range.startContainer;
          while (!(container.classList && container.classList.contains('editor-block'))) {
            container = container.parentNode;
          }
          let size = Utils.pixelToPoint(parseFloat($(container).css('font-size')));
          $(container).css('font-size', `${Utils.pointToPixel(size - 1)}px`);
        }
        break;
      case 'r':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.setFormatAtSelection({bold: true, listitem: true});
        }
        break;
      case 'Backspace':
        if (this.getTextContent(id).length === 0 && id !== 0) {
          this.removeBlockAt(id, id - 1);
        }
        break;
    }
    // Update the format.
    this.updateFormat();
  }

  /**
   * Handle special keys in editor blocks.
   * ENTER should add a new line or a new block if there is already a new line
   * BACKSPACE should remove a character or the current block if this one is empty
   * @param {KeyboardEvent} event - The event to handle.
   */
  onKeyPress (event) {
    let caller = event.target;
    let id = parseInt(caller.id.substring(4));
    switch (event.which) {
      case 13: // Line breaks
        let sel = this.getSelection();
        let range = sel.getRangeAt(0);
        let previousNode = range.startContainer;
        console.log(previousNode);
        if (!event.shiftKey && previousNode && previousNode.nodeName === 'DIV' && previousNode.childNodes[0].nodeName === 'BR' && previousNode.childNodes.length === 1) {
          previousNode.remove();
          event.stopPropagation();
          event.preventDefault();
          this.insertBlockAfter(id, '', true);
        }
        break;
      case 8: // Return
        if (this.getTextContent(id).length === 0 && id !== 0) {
          this.removeBlockAt(id, id - 1);
        }
        break;
    }
    // Update the format.
    this.updateFormat();
  }

  /**
   * Get the current selection within focused blocks.
   * @return {Selection} - The user's current selection.
   */
  getSelection () {
    /* global getSelection */
    if (getSelection().modify) { /* chrome */
      return window.getSelection();
    } else { /* IE */
      return getSelection();
    }
  }

  updateFormat () {
    let oldFormat = this.format;
    this.format = this.getCurrentFormat();
    if (oldFormat == null) {
      this.dispatchCurrentFormatChanged(this.format);
    } else {
      let boldChanged = oldFormat.bold !== this.format.bold;
      let titleChanged = oldFormat.title !== this.format.title;
      let listChanged = oldFormat.listitem !== this.format.listitem;
      if (boldChanged || titleChanged || listChanged) {
        this.dispatchCurrentFormatChanged(this.format);
      }
    }
  }

  /**
   * Get an object representing the format at the current selection.
   * @return {Object} - The current format at the selection.
   */
  getCurrentFormat () {
    let selection = this.getSelection();
    console.log(selection);
    if (selection.rangeCount === 0) return {};
    let range = selection.getRangeAt(0);
    return this.checkFormatAcrossSelection(this.getFormatForNode(range.startContainer));
  }

  getFormatForNode (element) {
    let bold = this.hasReccursiveTag('B', element);
    let listitem = this.hasReccursiveTag('LI', element);
    let h1 = this.hasReccursiveTag('H1', element);
    let h2 = this.hasReccursiveTag('H2', element);
    let h3 = this.hasReccursiveTag('H3', element);
    let h4 = this.hasReccursiveTag('H4', element);
    let h5 = this.hasReccursiveTag('H5', element);
    let result = {};
    result.bold = bold;
    result.listitem = listitem;
    result.title = h1 ? 'h1' : (h2 ? 'h2' : (h3 ? 'h3' : (h4 ? 'h4' : (h5 ? 'h5' : 'none'))));
    return result;
  }

  checkFormatAcrossSelection (format) {
    let selection = this.getSelection();
    let bold = format.bold;
    let listitem = format.listitem;
    let title = format.title;
    for (let i = 0; i < selection.rangeCount; i++) {
      let range = selection.getRangeAt(i);
      let nodes = this.getNodesInRange(range);
      for (let n = 0; n < nodes.length; n++) {
        let f = this.getFormatForNode(nodes[n]);
        format = this.mergeFormats(format, f);
      }
    }
    return format;
  }

  getNodesInRange (range) {
    let startNode = range.startContainer.childNodes[range.startOffset] || range.startContainer;
    let endNode = range.endContainer.childNodes[range.endOffset] || range.endContainer;
    if (startNode === endNode && startNode.childNodes.length === 0) {
      return [startNode];
    }

    let result = [];
    do {
      result.push(startNode);
    } while ((startNode = this.getNextNode(startNode, false, endNode)) !== null)
    // TODO do stuff.
    return result;
  }

  getNextNode (node, skipChildren, endNode) {
    if (endNode === node) {
      return null;
    }
    if (node.firstChild && !skipChildren) {
      return node.firstChild;
    }
    if (!node.parentNode) {
      return null;
    }
    return node.nextSibling || this.getNextNode(node.parentNode, true, endNode);
  }

  mergeFormats (left, right) {
    let result = {};
    if (left.bold === null || right.bold === null || left.bold !== right.bold) result.bold = null;
    if (left.listitem === null || right.listitem === null || left.listitem !== right.listitem) result.listitem = null;
    if (left.title === null || right.title === null || left.title !== right.title) result.title = null;
    return result;
  }

  /**
   * Check if the element or one of its parent has the given tag.
   * @param {string} tag - The tag to check.
   * @param {DOMElement} element - The element to check.
   * @return {Boolean} - True if the element or its parents have the tag, false otherwise.
   */
  hasReccursiveTag (tag, element) {
    return element.nodeName === tag || this.findParentElementWithTag(tag, element) !== null;
  }

  /**
   * Find the parent element with the given tag.
   * @param {string} tag - Tag to look for.
   * @param {DOMElement} startElement - Element to start at.
   * @return {DOMElement} - The element which has the given tag, or null.
   */
  findParentElementWithTag (tag, startElement) {
    if (startElement.classList && startElement.classList.contains('editor-text')) return null;
    let currentElement = startElement;
    while (currentElement.parentNode) {
      let parent = currentElement.parentNode;
      if (parent.classList && parent.classList.contains('editor-text')) break;
      if (parent.nodeName === tag) return parent;
      else {
        currentElement = parent;
      }
    }
    return null;
  }

  /**
   * Add a new line at the caret position.
   * @deprecated
   */
  processNewLine (id) {
    if (getSelection().modify) { /* chrome */
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      let br = document.createElement('br');
      range.deleteContents();
      range.insertNode(br);
      if (br.previousSibling.tagName === 'BR') {
        br.previousSibling.remove();
        br.remove();
        this.insertBlockAfter(id, '', true);
      } else {
        range.setStartAfter(br);
        range.setEndAfter(br);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range); /* end chrome */
      }
    } else {
      let br = document.createElement('br'); /* internet explorer */
      let range = getSelection().getRangeAt(0);
      range.surroundContents(br);
      if (br.previousSibling.nodeName === 'BR') {
        br.previousSibling.remove();
        br.remove();
        this.insertBlockAfter(id, '', true);
      } else {
        range.selectNode(br.nextSibling); /* end Internet Explorer 11 */
      }
    }
  }

  /**
   * Remove the block with the given ID and switch focus to a new id.
   * @param {int} id - ID of the block to remove.
   * @param {int} focusID - ID of the block that will get the focus.
   */
  removeBlockAt (id, focusID) {
    $('#blc-' + id).remove();
    $('#txt-' + focusID).focus();
    for (let i = id + 1; i < this.blockCount; i++) {
      this.changeBlockID(i, i - 1);
    }
  }

  /**
   * Insert a block just below the block with the given index.
   * @param {int} index - ID of the block that the new block should follow.
   * @param {string} text - Text the new block should be initialized with.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertBlockAfter (index, text, focus) {
    for (let i = this.blockCount - 1; i > index; i--) {
      this.changeBlockID(i, i + 1);
    }
    $('#blc-' + index).after(this.newBlockString(index + 1, text));
    if (focus) {
      $('#txt-' + (index + 1)).focus();
    }
    this.setImage('#img-' + (index + 1), 'img/placeholder.png');
  }

  /**
   * Add a block at the end of the editor.
   * @param {string} text - Text the new block should be initialized with.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  addBlock (text, focus) {
    let id = this.blockCount;
    $(this.id).append(this.newBlockString(id, text));
    if (focus) {
      $('#txt-' + id).focus();
    }
    this.setImage('#img-' + id, 'img/placeholder.png');
  }

  /**
   * Get the text content of the block with the given id.
   * @param {int} id - ID of the block to extract text from.
   * @return {string} - The extracted text.
   */
  getTextContent (id) {
    let element = $('#txt-' + id).get(0);
    return element.textContent;
  }

  /**
   * Get a HTML string to initialize a block.
   * @param {int} id - ID of the new block.
   * @param {string} text - Text the new block should be initialized with.
   * @return {string} - HTML string of the new block.
   */
  newBlockString (id, text) {
    return `<div id="blc-${id}" class="editor-block media" style="font-size: 14pt;">` +
             `<div id="txt-${id}" class="editor-text media-body align-self-center mr-3 border" contenteditable="true" style="margin:10px 0px 10px 0px; min-height: 22px">` +
                `<div>${text}</div>` +
             `</div>` +
             `<canvas id="img-${id}" class="editor-image align-self-center mr-3 hoverable" style="width:100px"/>` +
           `</div>`;
  }

  /**
   * Change the DOM ID of the block with the given id to the given new id.
   * @param {int} oldID - ID the block had until now.
   * @param {int} newID - ID the block should be having.
   */
  changeBlockID (oldID, newID) {
    $('#blc-' + oldID).attr('id', 'blc-' + newID);
    $('#txt-' + oldID).attr('id', 'txt-' + newID);
    $('#img-' + oldID).attr('id', 'img-' + newID);
  }

  /**
   * Set the format at the current selection.
   * @param {Object} format - The format object describing the changes to make.
   */
  setFormatAtSelection (format) {
    if (this.getSelection().rangeCount > 0) {
      let bold = this.format.bold;
      let list = this.format.listitem;
      let title = this.format.title;
      if (typeof (format.title) !== 'undefined' && format.title !== title) {
        let t = format.title;
        if (t === 'none') t = 'div';
        document.execCommand('formatBlock', true, t);
      }
      if (typeof (format.bold) !== 'undefined' && format.bold !== bold) {
        if (format.bold || bold) {
          document.execCommand('bold', true, null);
        } else {
          document.execCommand('bold', true, null);
          document.execCommand('bold', true, null);
        }
      }
      if (typeof (format.listitem) !== 'undefined' && format.listitem !== list) {
        document.execCommand('insertUnorderedList', true, null);
      }
      this.updateFormat();
    }
  }

  /**
   * Set the image in the block with the given id, making it DataURL-ready.
   * @param {int} id - ID of the block.
   * @param {string} path - Path of the image source.
   */
  setImage (id, path) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
      var canvas = $(id).get(0);
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      var ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      // var dataURL = canvas.toDataURL("image/png");
      // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };
    img.src = path;
  }

  /**
   * Send an event telling that an image has been clicked.
   * @param {string} id - The DOM ID of the image canvas.
   */
  dispatchImageClickEvent (id) {
    let e = new CustomEvent('imageclick', {
      detail: {
        id: id
      },
      bubbles: false,
      cancelable: false
    });
    console.log(e);
    $(this.id).get(0).dispatchEvent(e);
  }

  /**
   * Send an event telling that the formating at the Selection
   * has been changed. Either because the user changed it, or
   * because the current active selection was changed.
   * @param {string} format - The new format at the selection.
   */
  dispatchCurrentFormatChanged (format) {
    let e = new CustomEvent('currentformatchanged', {
      detail: {
        format: format
      },
      bubbles: false,
      cancelable: false
    });
    console.log(e);
    $(this.id).get(0).dispatchEvent(e);
  }
}
