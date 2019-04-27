/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Editor" }] */
/* global $ */
/* global Image */
/* global Animator */
/* global Utils */
/* global CustomEvent */
/* global jsPDF */

/**
 * Class containing all the functions and tools for the editor.
 */
class Editor {
  /**
   * @constructor
   * @param {string} id - The DOM ID of the editor element.
   */
  constructor (id) {
    this.id = id;
    this.fileVersion = 0;
    this.format = null;
    this.addBlock('', false);
    this.lastBlock = 0;
    this.lastSelection = null;

    this.registerEvents();
  }

  /**
   * Get the current amount of blocks in the editor.
   * @return {int} Number of blocks.
   */
  get blockCount () {
    return $('.editor-block').length;
  }

  /**
   * Check whether the editor has the focus.
   * @return {boolean} true if it does have the focus, false otherwise.
   */
  get hasFocus () {
    return $(document.activeElement).hasClass('editor-text');
  }

  /**
   * Get the id of the currently active block.
   * @return {int} id of the block.
   */
  get activeBlockId () {
    if (this.hasFocus) {
      let current = document.activeElement;
      while (!$(current).hasClass('editor-text')) {
        current = current.parentNode;
      }
      return parseInt(current.id.substring(4));
    } else {
      return this.lastBlock;
    }
  }

  /**
   * Register all the events of the editor.
   */
  registerEvents () {
    $(this.id).on('keypress', '.editor-block', event => { this.onKeyPress(event); });
    $(this.id).on('keydown', '.editor-block', event => { this.onKeyDown(event); });
    // $(this.id).on('click', '.editor-image', event => { this.dispatchImageClickEvent('#' + event.target.id); });
    $(this.id).on('click', '.editor-block', event => {
      if ($(event.target).hasClass('editor-block')) {
        event.stopPropagation();
        event.preventDefault();
        $(event.target).children('.editor-text').focus();
        console.log("Focusing " + $(event.target).children('.editor-text').id);
      }
    });
    $(this.id).on('focus', '.editor-text', event => { this.updateFormat(); });
    $(this.id).on('focus', '.editor-block', event => {
      if ($(event.target).hasClass('editor-block')) {
        event.stopPropagation();
        event.preventDefault();
        $(event.target).children('.editor-text').focus();
      }
    });
    $(this.id).on('blur', '.editor-text', event => { this.onBlur(event); });
    $(this.id).on('click', '.editor-text', event => { this.updateFormat(); });
    $(this.id).on('mousedown', '.editor-text', event => { this.capturedMouseDown = true; });
    $('body').on('mouseup', event => {
      if (this.capturedMouseDown) {
        setTimeout(() => this.updateFormat(), 1);
        this.capturedMouseDown = false;
      }
    });
  }

  /**
   * Handles text blocks being blurred.
   * @param {Event} event - Event to handle.
   */
  onBlur (event) {
    let caller = event.target;
    let id = parseInt(caller.id.substring(4));
    console.log(id + ' has lost focus.');
    this.lastBlock = id;
    this.lastSelection = this.getSelection();
    console.log(this.lastSelection);
    this.updateFormat();
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
          document.execCommand('insertUnorderedList', false, null);
        }
        break;
      case 'b':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          document.execCommand('bold', false, null);
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
          document.execCommand('formatBlock', false, formats[index]);
        }
        break;
      case 'o':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          console.log(this.toHTML());
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
      case 'i':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.setFormatAtSelection({picture: !this.format.picture});
        }
        break;
      case 'ArrowUp':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.moveBlockUp(id);
        }
        break;
      case 'ArrowDown':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.moveBlockDown(id);
        }
        break;
      case 'Backspace':
        if (this.getRawTextContent(id).length === 0 && id !== 0) {
          this.removeBlockAt(id, id - 1);
        }
        break;
    }
    // Update the format.
    setTimeout(() => this.updateFormat(), 1);
    setTimeout(() => this.processAllSpaces(id), 1);
  }

  processAllSpaces (id) {
    let text = this.getRawTextContent(id);
    let i = -1;
    while (++i < text.length - 1) {
      if (['\xa0', ' '].includes(text[i])) {
        let start = i;
        while (--start >= 0) {
          if (['\xa0', ' '].includes(text[start])) {
            start++;
            break;
          }
        }
        let end = i;
        while (++end < text.length) {
          if (['\xa0', ' '].includes(text[end])) {
            break;
          }
        }
        let context = {previous: text.substring(start, i), next: text.substring(i + 1, end)};
        let ideal = this.getRelevantSpace(context);
        this.setTextAt(id, i, 1, ideal);
      }
    }
  }

  /**
   * Get the type of space relevant given the context.
   * @param {Object} context - The context of the space.
   * @return {string} The space character relevant.
   */
  getRelevantSpace (context) {
    if (['le', 'ne', 'la', 'de', 'du', 'se', 'les', 'pour', 'à', 'et', 'un', 'une'].includes(context.next.toLowerCase())) {
      return ' ';
    } else if (Utils.stringEndsWith(context.previous, '.')) {
      return ' ';
    } else if (Utils.stringEndsWith(context.previous, '?')) {
      return ' ';
    } else if (Utils.stringEndsWith(context.previous, '!')) {
      return ' ';
    } else if (Utils.stringEndsWith(context.previous, ',')) {
      return ' ';
    } else if (Utils.stringEndsWith(context.previous, ';')) {
      return ' ';
    } else {
      return '\xa0';
    }
  }

  /**
   * Decide whether the space inserted should be breaking or non-breaking.
   * @param {Number} id - Id of the block.
   * @param {Number} index - Index of the space character to insert in the block.
   */
  processSpace (id, index) {
    let text = this.getRawTextContent(id);
    let i = index;
    let pWord = '';
    while (--i >= 0) {
      if (text[i] === ' ') break;
      pWord += text[i];
    }
    let allowBreaking = true;
    allowBreaking = !['le', 'ne', 'la', 'de', 'se', 'les', 'pour'].includes(pWord);
    if (allowBreaking) {
      document.execCommand('insertText', false, ' ');
    } else {
      document.execCommand('insertText', false, '\xa0');
    }
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
    setTimeout(() => this.updateFormat(), 1);
  }

  /**
   * Get the current selection within focused blocks.
   * @return {Selection} The user's current selection.
   */
  getSelection () {
    /* global getSelection */
    if (getSelection().modify) { /* chrome */
      return window.getSelection();
    } else { /* IE */
      return getSelection();
    }
  }

  /**
   * Update the cached format from the current selection.
   */
  updateFormat () {
    let oldFormat = this.format;
    this.format = this.getCurrentFormat();
    // console.log(this.format);
    if (oldFormat == null) {
      this.dispatchCurrentFormatChanged(this.format);
    } else {
      let boldChanged = oldFormat.bold !== this.format.bold;
      let titleChanged = oldFormat.title !== this.format.title;
      let listChanged = oldFormat.bullet !== this.format.bullet;
      let frameChanged = oldFormat.frame !== this.format.frame;
      let colorChanged = oldFormat.color !== this.format.color;
      let pictureChanged = oldFormat.picture !== this.format.picture;
      if (boldChanged || titleChanged || listChanged || frameChanged || colorChanged || pictureChanged) {
        this.dispatchCurrentFormatChanged(this.format);
      }
    }
  }

  /**
   * Get an object representing the format at the current selection.
   * @return {Format} The current format at the selection.
   */
  getCurrentFormat () {
    let selection = this.getSelection();
    if (selection.rangeCount === 0) return {};
    let range = selection.getRangeAt(0);
    return this.checkFormatAcrossSelection(this.getFormatForNode(range.startContainer));
  }

  /**
   * Get the format for the given node.
   * @param {DOMElement} element - Element to check the format for.
   * @return {Format} The format of the element.
   */
  getFormatForNode (element) {
    let bold = this.hasReccursiveTag('B', element) || this.hasReccursiveTag('STRONG', element);
    let listitem = this.hasReccursiveTag('LI', element);
    let h1 = this.hasReccursiveTag('H1', element);
    let h2 = this.hasReccursiveTag('H2', element);
    let h3 = this.hasReccursiveTag('H3', element);
    let h4 = this.hasReccursiveTag('H4', element);
    let h5 = this.hasReccursiveTag('H5', element);
    let color = this.getNodeFontColor(element) || '#000000';
    let size = this.getNodeFontSize(element) || '14pt';
    let result = {};
    result.bold = bold;
    result.bullet = listitem;
    result.title = h1 ? 'h1' : (h2 ? 'h2' : (h3 ? 'h3' : (h4 ? 'h4' : (h5 ? 'h5' : 'none'))));
    result.frame = $('#blc-' + this.activeBlockId).hasClass('frame');
    result.picture = $('#img-' + this.activeBlockId).is(':visible');
    result.color = color;
    return result;
  }

  /**
   * Get the font color of the element as it is displayed to the user.
   * @param {DOMElement} element - Element to check the color for.
   * @return {String} String representing the color in hexadecimal.
   */
  getNodeFontColor (element) {
    if (element.nodeName === 'FONT') {
      return element.color;
    } else {
      let e = this.findParentElementWithTag('FONT', element);
      if (e !== null) {
        return e.color;
      }
    }
    return null;
  }

  /**
   * Get the font size of the element as it is displayed to the user.
   * @param {DOMElement} element - Element to check the color for.
   * @return {String} String representing the color in hexadecimal.
   */
  getNodeFontSize (element) {
    if (element.nodeName === 'FONT') {
      return element.color;
    } else {
      let e = this.findParentElementWithTag('FONT', element);
      if (e !== null) {
        return e.color;
      }
    }
    return null;
  }

  /**
   * Check all nodes in the current selection and merge formats into one.
   * @param {Format} format - Initial format.
   * @return {Format} Format of the entire selection.
   */
  checkFormatAcrossSelection (format) {
    let selection = this.getSelection();
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

  /**
   * Get all the nodes in the given range.
   * @param {Range} range - Selection range.
   * @return {DOMElementList} List of nodes within that range.
   */
  getNodesInRange (range) {
    let startNode = range.startContainer.childNodes[range.startOffset] || range.startContainer;
    let endNode = range.endContainer.childNodes[range.endOffset] || range.endContainer;
    if (startNode === endNode && startNode.childNodes.length === 0) {
      return [startNode];
    }

    let result = [];
    do {
      result.push(startNode);
    } while ((startNode = this.getNextNode(startNode, false, endNode)) !== null);
    return result;
  }

  /**
   * Get all the nodes in the given element.
   * @param {DOMElement} element - Element.
   * @return {DOMElementList} List of nodes within that element.
   */
  getNodesInElement (element) {
    let startNode = element.firstChild;
    let endNode = element;
    if (startNode === endNode && startNode.childNodes.length === 0) {
      return [startNode];
    }

    let result = [];
    do {
      result.push(startNode);
    } while ((startNode = this.getNextNode(startNode, false, endNode)) !== null);
    return result;
  }

  /**
   * Get the node next to the given node.
   * @param {DOMElement} node - The previous node.
   * @param {boolean} skipChildren - Whether the children nodes should be skipped.
   * @param {DOMElement} endNode - The final node.
   * @return {DOMElement} The next node in the hierarchy.
   */
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

  /**
   * Merge formats to create a combination of the two.
   * @param {Format} left - Format from the previous node.
   * @param {Format} right - Format from the next node.
   * @return {Format} The resulting format.
   */
  mergeFormats (left, right) {
    let result = {
      bold: left.bold,
      bullet: left.bullet,
      title: left.title,
      frame: left.frame,
      picture: left.picture,
      color: left.color
    };
    if (left.bold === null || right.bold === null || left.bold !== right.bold) result.bold = 'ambiguous';
    if (left.bullet === null || right.bullet === null || left.bullet !== right.bullet) result.bullet = 'ambiguous';
    if (left.title === null || right.title === null || left.title !== right.title) result.title = 'ambiguous';
    if (left.color === null || right.color === null || left.color !== right.color) result.color = 'ambiguous';
    // console.log({left: left, right: right, result: result});
    return result;
  }

  /**
   * Check if the element or one of its parent has the given tag.
   * @param {string} tag - The tag to check.
   * @param {DOMElement} element - The element to check.
   * @return {Boolean} True if the element or its parents have the tag, false otherwise.
   */
  hasReccursiveTag (tag, element) {
    return element.nodeName === tag || this.findParentElementWithTag(tag, element) !== null;
  }

  /**
   * Find the parent element with the given tag.
   * @param {string} tag - Tag to look for.
   * @param {DOMElement} startElement - Element to start at.
   * @return {DOMElement} The element which has the given tag, or null.
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
   * @deprecated Should not be used.
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
   * Clear all blocks of the document.
   */
  clear () {
    $('.editor-block').remove();
    this.addBlock('', true);
  }

  /**
   * Remove the block with the given ID and switch focus to a new id.
   * @param {int} id - ID of the block to remove.
   * @param {int} focusID - ID of the block that will get the focus.
   */
  removeBlockAt (id, focusID = id + 1, duration = 250) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);

    if (!this.dispatchBlockDestroyEvent(id).defaultPrevented) {
      if (id === 0 && this.blockCount === 1) {
        // There is only one block. Clear it instead of removing it.
        $('#txt-0').empty();
        this.setImage('#img-0', 'img/placeholder.png');
        $('#txt-0').focus();
      } else {
        // There will be at least one block remaining.
        let element = $('#blc-' + id)[0];
        if (typeof (focusID) === 'number') {
          $('#txt-' + focusID).focus();
        }
        Animator.collapse(element, duration, () => {
          $(element).remove();
          this.refreshAllBlockID();
          this.dispatchBlockDestroyedEvent(id);
        });
      }
    }
  }

  /**
   * Insert a block just below the block with the given index.
   * @param {int} index - ID of the block that the new block should follow.
   * @param {string} text - Text the new block should be initialized with.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertBlockAfter (index, text, focus) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    $('#blc-' + index).after(this.newBlockString(index + 1, text));
    this.refreshAllBlockID();
    if (focus) {
      $('#txt-' + (index + 1)).focus();
    }
    this.setImage('#img-' + (index + 1), 'img/placeholder.png');
    this.dispatchBlockCreatedEvent(index + 1);
  }

  /**
   * Insert a block just above the block with the given index.
   * @param {int} index - ID of the block that the new block should precede.
   * @param {string} text - Text the new block should be initialized with.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertBlockBefore (index, text, focus) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    $('#blc-' + index).before(this.newBlockString(index, text));
    this.refreshAllBlockID();
    if (focus) {
      $('#txt-' + (index)).focus();
    }
    this.setImage('#img-' + (index), 'img/placeholder.png');
    this.dispatchBlockCreatedEvent(index);
  }

  /**
   * Move a block up by the given amount.
   * @param {int} index - ID of the block to move.
   * @param {int} amount - (Optional) amount to move the block by.
   */
  moveBlockUp (index, amount = 1, duration = 250) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    if (index - amount >= 0) {
      let element = $('#blc-' + index)[0];
      let upElement = $('#blc-' + (index - amount))[0];
      let moveDistance = $(upElement).outerHeight();
      Animator.moveVertical(element, -moveDistance, 50, duration);
      Animator.moveVertical(upElement, moveDistance, -50, duration);
      setTimeout(() => {
        $(element).css('top', 0);
        $(element).css('left', 0);
        $(upElement).css('top', 0);
        $(upElement).css('left', 0);
        $(element).insertBefore($(upElement));
        $(element).children('.editor-text').focus();
        this.refreshAllBlockID();
      }, duration * 1.1);
    }
  }

  /**
   * Move a block down by the given amount.
   * @param {int} index - ID of the block to move.
   * @param {int} amount - (Optional) amount to move the block by.
   * @param {int} duration - (Optional) duration of the animation.
   */
  moveBlockDown (index, amount = 1, duration = 250) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    if (index + amount < this.blockCount) {
      let element = $('#blc-' + (index + amount))[0];
      let upElement = $('#blc-' + (index))[0];
      let moveDistance = $(upElement).outerHeight();
      Animator.moveVertical(element, -moveDistance, 50, duration);
      Animator.moveVertical(upElement, moveDistance, -50, duration);
      setTimeout(() => {
        $(element).css('top', 0);
        $(element).css('left', 0);
        $(upElement).css('top', 0);
        $(upElement).css('left', 0);
        $(upElement).insertAfter($(element));
        $(upElement).children('.editor-text').focus();
        this.refreshAllBlockID();
      }, duration * 1.1);
    }
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
    this.dispatchBlockCreatedEvent(id);
  }

  /**
   * Get the text content of the block with the given id.
   * @param {int} id - ID of the block to extract text from.
   * @return {string} The extracted text.
   */
  getRawTextContent (id) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);

    let element = $('#txt-' + id).get(0);
    return element.textContent;
  }

  /**
   * Get a HTML string to initialize a block.
   * @param {int} id - ID of the new block.
   * @param {string} text - Text the new block should be initialized with.
   * @return {string} HTML string of the new block.
   */
  newBlockString (id, text) {
    return `<div id="blc-${id}" class="editor-block media" style="font-size: 14pt;">` +
             `<div id="txt-${id}" class="editor-text media-body align-self-center mr-3" contenteditable="true">` +
                `<div>${text}</div>` +
             `</div>` +
             `<canvas id="img-${id}" class="editor-image align-self-center mr-3 hoverable" style="width:100px"/>` +
           `</div>`;
  }

  /**
   * Change the DOM ID of the block with the given id to the given new id.
   * @param {int} oldID - ID the block had until now.
   * @param {int} newID - ID the block should be having.
   * @deprecated Use refreshAllBlockId() instead.
   */
  changeBlockID (oldID, newID) {
    $('#blc-' + oldID).attr('id', 'blc-' + newID);
    $('#txt-' + oldID).attr('id', 'txt-' + newID);
    $('#img-' + oldID).attr('id', 'img-' + newID);
  }

  /**
   * Refresh all the IDs of the blocks in the editor.
   */
  refreshAllBlockID () {
    $('.editor-block').each(function (index) {
      $(this).attr('id', 'blc-' + index);
    });
    $('.editor-text').each(function (index) {
      $(this).attr('id', 'txt-' + index);
    });
    $('.editor-image').each(function (index) {
      $(this).attr('id', 'img-' + index);
    });
  }

  /**
   * Set the format at the current selection.
   * @param {Object} format - The format object describing the changes to make.
   */
  setFormatAtSelection (format) {
    console.log(format);
    console.log(!this.hasFocus);
    if (!this.hasFocus) {
      $('#txt-' + this.lastBlock).focus();
    }
    if (this.getSelection().rangeCount > 0) {
      let bold = this.format.bold;
      let list = this.format.bullet;
      let frame = this.format.frame;
      let title = this.format.title;
      let picture = this.format.picture;
      let color = this.format.color;
      if (typeof (format.title) !== 'undefined' && format.title !== title) {
        let t = format.title;
        if (t === 'none') t = 'div';
        document.execCommand('formatBlock', false, t);
      }
      if (typeof (format.frame) !== 'undefined' && format.frame !== frame) {
        console.log('Frame: ' + format.frame);
        if (format.frame) {
          console.log('Adding frame on block ' + this.activeBlockId);
          $('#blc-' + this.activeBlockId).addClass('frame');
        } else {
          $('#blc-' + this.activeBlockId).removeClass('frame');
        }
      }
      if (typeof (format.bold) !== 'undefined' && format.bold !== bold) {
        if (bold === 'ambiguous' && format.bold === false) {
          document.execCommand('bold', false, null);
          document.execCommand('bold', false, null);
        } else {
          document.execCommand('bold', false, null);
        }
      }
      if (typeof (format.bullet) !== 'undefined' && format.bullet !== list) {
        document.execCommand('insertUnorderedList', false, null);
      }
      if (typeof (format.picture) !== 'undefined' && format.picture !== picture) {
        if (format.picture) {
          $('#img-' + this.activeBlockId).show();
        } else {
          $('#img-' + this.activeBlockId).hide();
        }
      }
      if (typeof (format.color) !== 'undefined' && format.color !== color) {
        document.execCommand('foreColor', false, format.color);
      }
      this.updateFormat();
    }
  }

  /**
   * Set the image in the block with the given id, making it DataURL-ready.
   * @param {string} selector - ID of the block.
   * @param {string} src - Path of the image source.
   */
  async setImage (selector, src) {
    if ($(selector).length === 0) throw new Error(`There is no element matching selector "${selector}"`);
    console.log(src);
    if (src.match(/^https?:\/\//)) {
      src = './image_proxy.php?url=' + src;
    }
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      var canvas = $(selector).get(0);
      canvas.width = 100;
      canvas.height = 100;
      let scale = Math.max(img.naturalWidth / canvas.width, img.naturalHeight / canvas.height);
      let width = img.naturalWidth / scale;
      let height = img.naturalHeight / scale;
      let offsetX = (canvas.width - width) / 2;
      let offsetY = (canvas.height - height) / 2;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(this, offsetX, offsetY, width, height);
      // var dataURL = canvas.toDataURL("image/png");
      // console.log(dataURL);
      // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };
    img.src = src;
  }

  /**
   * Set the text at the given index.
   * @param {Number} blockIndex - Index of the block where the change happens.
   * @param {Number} startIndex - Index of the character where the change happens.
   * @param {Number} length - Length of the text to replace.
   * @param {String} text - Text to insert.
   */
  setTextAt (blockIndex, startIndex, length, text) {
    let sel = this.getSelection();
    let range = sel.getRangeAt(0);
    let element = range.startContainer;
    let offset = range.startOffset;
    let endElement = range.endContainer;
    let endOffset = range.endOffset;
    this.select(blockIndex, startIndex, length, text);
    document.execCommand('insertText', false, text);
    sel.removeAllRanges();
    sel.addRange(range);
    sel.getRangeAt(0).setStart(element, offset);
    sel.getRangeAt(0).setEnd(endElement, endOffset);
  }

  moveCaretForward (amount = 1) {
    let sel = this.getSelection();
    let range = sel.getRangeAt(0);
    if (range.startOffset + 1 >= range.startContainer.length) {
      range.setStart(this.getNextNode(range.startContainer, false), 0);
    } else {
      range.setStart(range.startContainer, range.startOffset + 1);
    }
  }

  /**
   * Sets the selection in the editor.
   * @param {int} blockIndex - Index of the block.
   * @param {int} startIndex - Start index of the selection.
   * @param {int} length - (optional) length of the selection;
   */
  select (blockIndex, startIndex, length = 0) {
    let sel = this.getSelection();
    sel.removeAllRanges();
    let range = document.createRange();
    let elemAndOffset = this.getBlockElementAndOffsetAtIndex(blockIndex, startIndex);
    if (elemAndOffset !== null) {
      range.setStart(elemAndOffset.element, elemAndOffset.offset);
      if (length > 0) {
        elemAndOffset = this.getBlockElementAndOffsetAtIndex(blockIndex, startIndex + length);
        if (elemAndOffset !== null) {
          range.setEnd(elemAndOffset.element, elemAndOffset.offset);
        }
      }
    }
    sel.addRange(range);
  }

  /**
   * Select the first occurence of the given text.
   * @param {string} text - Text to search for.
   * @param {boolean} word - Whether to look for words or any string.
   */
  selectFirst (text, word = false) {
    let offset = -1;
    let patt = new RegExp('(?:^|[^a-zA-Z0-9éèêîïû])(' + text + ')(?:[^a-zA-Z0-9éèêîïû]|$)');
    for (let i = 0; i < this.blockCount; i++) {
      let matches = this.getRawTextContent(i).match(patt);
      if (matches != null) {
        offset = matches.index;
        offset += matches[0].search(matches[1]);
        this.select(i, offset, text.length);
        break;
      }
    }
  }

  /**
   * Get the node and the offset at the given index.
   * @param {int} blockIndex - Index of the block to look into.
   * @param {int} index - Index of the character.
   * @return {Object} Corresponding node and offset.
   */
  getBlockElementAndOffsetAtIndex (blockIndex, index) {
    let root = $('#txt-' + blockIndex).get(0);
    let remainingChars = index;
    let nodes = this.getNodesInElement(root);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === 3) {
        if (remainingChars < nodes[i].length) {
          return {element: nodes[i], offset: remainingChars};
        } else {
          remainingChars -= nodes[i].length;
        }
      }
    }
    return null;
  }

  /**
   * Get the index of the character in the element at the given offset.
   * @param {DOMElement} element - Element.
   * @param {Number} offset - Offset of the character in the given element.
   * @return {Number} - Index of the character in the given block.
   */
  getIndexFromElementAndOffset (element, offset) {
    let current = $(element);
    while (!current.hasClass('editor-text')) {
      current = current.parent();
    }
    let root = current.get(0);
    let nodes = this.getNodesInElement(root);
    let index = 0;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === 3) {
        if (nodes[i] === element) {
          return index + offset;
        } else {
          index += nodes[i].length;
        }
      }
    }
  }

  /**
   * Save asynchronously the document into a JSON compatible format
   * which can be reloaded using load().
   * @return {JSONObject} A JSON object of the document.
   */
  async save () {
    let object = {
      meta: {
        version: this.fileVersion
      },
      blocks: []
    };

    for (let i = 0; i < this.blockCount; i++) {
      object.blocks.push({
        type: 'default',
        content: $('#txt-' + i)[0].innerHTML,
        image: $('#img-' + i)[0].toDataURL()
      });
    }

    return object;
  }

  /**
   * Reload asynchronously a previous document from its JSON object
   * obtained from save().
   * @param {JSONObject} json - A JSON object of the document.
   */
  async load (json) {
    if (json.meta.version > this.fileVersion) {
      throw new Error('Data was generated with a more recent version of SIMPLES. It cannot be loaded.');
    }

    this.clear();

    for (let i = 0; i < json.blocks.length; i++) {
      if (i > 0) { // Clearing always leaves an empty block. No need to add it.
        this.addBlock();
      }
      $('#txt-' + i)[0].innerHTML = json.blocks[i].content;
      setTimeout(() => {
        this.setImage('#img-' + i, json.blocks[i].image);
      }, 250);
    }
  }

  /**
   * Turn the content of the editor into a website-ready HTML.
   * @return {string} The HTML string.
   */
  toHTML (bootstrap = true) {
    if (bootstrap) {
      let result = '<!-- IMPORT BOOTSTRAP IN YOUR HEADER -->\n';
      for (let i = 0; i < this.blockCount; i++) {
        result += `<div class="media${$('#blc-' + i).hasClass('frame') ? ' frame' : ''}" style="font-size: 14pt;">` +
        `\n<div class="media-body align-self-center mr-3">` +
        $('#txt-' + i).html() +
        `</div>\n` + ($('#img-' + i).is(':visible') ? `<img src="${$('#img-' + i)[0].toDataURL()}" class="align-self-center mr-3" style="width:100px"/>` : '') +
        `</div>\n`;
      }
      result += '<!-- END OF CONTENT GENERATED IN SIMPLES -->';
      return result;
    } else {
      return '<!-- CASE WITHOUT BOOTSTRAP -->';
    }
  }

  /**
   * Turn the content of the editor into a PDF document.
   * @return {jsPDF} The generated PDF document.
   */
  async toPDF () {
    let doc = new jsPDF();

    let totalWidth = 210; // 210 mm, 21 cm
    let margin = 25.4; // 1 inch = 25.4mm
    let pageHeight = 297;

    let currentYOffset = margin;

    for (let i = 0; i < this.blockCount; i++) {
      if (currentYOffset + Utils.pixelToCm($('#blc-' + i).outerHeight()) > pageHeight - margin) {
        doc = doc.addPage();
        currentYOffset = margin;
      }
      /*doc.fromHTML($('#txt-' + i).get(0),
        margin,
        currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset($('#txt-' + i)[0]).top),
        {
          'width': Utils.pixelToCm($('#txt-' + i).width()),
          'height': Utils.pixelToCm($('#txt-' + i).height())
        }
      );*/

      doc.addImage((await html2canvas($('#txt-' + i).get(0))).toDataURL(), 'JPEG',
        margin + Utils.pixelToCm(Utils.getRelativeOffset($('#txt-' + i)[0]).left),
        currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset($('#txt-' + i)[0]).top),
        Utils.pixelToCm($('#txt-' + i).width()),
        Utils.pixelToCm($('#txt-' + i).height()),
        '',
        'NONE',
        0
      );

      doc.addImage($('#img-' + i).get(0).toDataURL(), 'JPEG',
        totalWidth - margin - Utils.pixelToCm($('#img-' + i).outerWidth()),
        currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset($('#img-' + i)[0]).top),
        Utils.pixelToCm($('#img-' + i).width()),
        Utils.pixelToCm($('#img-' + i).height()),
        '',
        'NONE',
        0
      );

      currentYOffset += Utils.pixelToCm($('#blc-' + i).outerHeight());
    }
    return doc;
  }

  /**
   * Send an event telling that a block has been created.
   * @param {int} id - The integer ID of the new block.
   */
  dispatchBlockCreatedEvent (id) {
    let e = new CustomEvent('blockcreated', {
      detail: {
        intid: id,
        blockid: 'blc-' + id,
        textid: 'txt-' + id,
        imageid: 'img-' + id
      },
      bubbles: false,
      cancelable: true
    });
    console.log(e);
    $(this.id).get(0).dispatchEvent(e);
  }

  /**
   * Send an event telling that a block is being destroyed.
   * @param {int} id - The integer ID of the removed block.
   * @return {boolean} Whether the event was cancelled or not.
   */
  dispatchBlockDestroyEvent (id) {
    let e = new CustomEvent('blockdestroy', {
      detail: {
        intid: id,
        blockid: 'blc-' + id,
        textid: 'txt-' + id,
        imageid: 'img-' + id
      },
      bubbles: false,
      cancelable: true
    });
    console.log(e);
    $(this.id).get(0).dispatchEvent(e);
    return e;
  }

  /**
   * Send an event telling that a block has been destroyed.
   * @param {int} id - The integer ID of the removed block.
   */
  dispatchBlockDestroyedEvent (id) {
    let e = new CustomEvent('blockdestroyed', {
      detail: {
        intid: id,
        blockid: 'blc-' + id,
        textid: 'txt-' + id,
        imageid: 'img-' + id
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
