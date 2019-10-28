/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Editor" }] */
/* global $ */
/* global Image */
/* global Animator */
/* global Utils */
/* global CustomEvent */
/* global jsPDF */
/* global Quill */

var Keyboard = Quill.import('modules/keyboard');
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
    this.fileVersion = 2;
    this.format = null;
    this.initializeQuill();
    this.addBlock('', false);
    this.lastBlock = 0;
    this.lastSelection = null;
    this.registerEvents();
  }

  get bindings () {
    let bindings = {
      bold: {
        key: 'B',
        shortKey: true,
        handler: () => {
          this.setFormatAtSelection({bold: !this.getCurrentFormat().bold});
        }
      },
      title: {
        key: 84, // T
        shortKey: true,
        handler: () => {
          console.log('test');
          let list = [null, 'H1', 'H2', 'H3', 'H4'];
          let t = this.getCurrentFormat().title;
          let index = list.indexOf(t);
          let newT = index < list.length - 1 ? list[index + 1] : list[0];
          this.setFormatAtSelection({title: newT});
        }
      },
      wrap: {
        key: 85, // U
        shortKey: true,
        handler: () => {
          console.log('test2!');
          let w = this.getCurrentFormat().wrap;
          if (w === 'nowrap') {
            this.setFormatAtSelection({wrap: 'normal'});
          } else {
            this.setFormatAtSelection({wrap: 'nowrap'});
          }
        }
      },
      newBlock: {
        key: Keyboard.keys.ENTER,
        prefix: "\n",
        handler: () => {
          let s = this.getSelection();
          this.insertBlockAfter(s.block);
        }
      },
      moveBlockDown: {
        key: Keyboard.keys.DOWN, // ArrowDown
        shortKey: true,
        handler: () => {
          this.moveBlockDown(this.getSelection().block);
        }
      },
      moveBlockUp: {
        key: Keyboard.keys.UP, // ArrowUp
        shortKey: true,
        handler: () => {
          this.moveBlockUp(this.getSelection().block);
        }
      }
    };
    return bindings;
  }

  /**
   * Get the current amount of blocks in the editor.
   * @return {int} Number of blocks.
   */
  get blockCount () {
    return $('.editor-block').length;
  }

  /**
   * Get the hidden canvas used to process images.
   * @return {Canvas} Canvas.
   */
  get hiddenCanvas () {
    return $('#hidden-canvas')[0];
  }

  /**
   * Get the words before which there can be line breaks.
   * @return {Array} Array of strings.
   */
  get breakKeywords () {
    return ['le', 'ne', 'la', 'de', 'du', 'dans', 'se', 'les', 'pour', 'à', 'et', 'un', 'une', 'en', 'est', 'sont', 'es', 'êtes', 'sommes', 'avec'];
  }

  /**
   * Check whether the editor has the focus.
   * @return {boolean} true if it does have the focus, false otherwise.
   */
  get hasFocus () {
    return !Utils.isNullOrUndefined(this.getSelection());
  }

  /**
   * Get the id of the currently active block.
   * @return {int} id of the block.
   */
  get activeBlockId () {
    if (this.hasFocus) {
      return this.getSelection().block;
    } else {
      return this.lastBlock;
    }
  }

  /**
   * Get the quill for the given id.
   * @param {int} id - The id of the block.
   * @return {Quill} The quill of this block.
   */
  getQuill (id, subid = 0) {
    return $('#txt-' + id)[0].quill;
  }

  /**
   * Get the current selection in the editor.
   * @return {JSONObject} Contains the id of the block, and the range.
   */
  getSelection () {
    for (let i = 0; i < this.blockCount; i++) {
      let s = this.getQuill(i).getSelection();
      if (!Utils.isNullOrUndefined(s)) {
        return {block: i, range: s};
      }
    }
  }

  /**
   * Initializes quill for the editor.
   */
  initializeQuill () {
    let Inline = Quill.import('blots/inline');
    let Block = Quill.import('blots/block');
    let Container = Quill.import('blots/container');
    let Parchment = Quill.import('parchment');

    class ColorAttributor extends Parchment.Attributor.Style {
      value (domNode) {
        let value = super.value(domNode);
        if (!value.startsWith('rgb(')) return value;
        value = value.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
        const hex = value
          .split(',')
          .map(component => `00${parseInt(component, 10).toString(16)}`.slice(-2))
          .join('');
        return `#${hex}`;
      }
    }

    const ColorStyle = new ColorAttributor('color', 'color', {
      scope: Parchment.Scope.INLINE
    });
    const WrapClass = new Parchment.Attributor.Class('wrap', 'ql-wrap', {
      scope: Parchment.Scope.INLINE
    });

    //Quill.register(BoldBlot);
    //Quill.register(HeaderBlot);
    Quill.register(ColorStyle);
    Quill.register(WrapClass);
    //Quill.register(IndentClass);
  }

  /**
   * Register all the events of the editor.
   */
  registerEvents () {
    //$(this.id).on('keypress', '.editor-block', event => { this.onKeyPress(event); });
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
    $(this.id).on('click', '.editor-image-container', event => {
      if ($(event.target).hasClass('editor-image-container')) {
        event.stopPropagation();
        event.preventDefault();
        $(event.target).children('.editor-text').focus();
        console.log("Focusing " + $(event.target).children('.editor-text').id);
      }
    });
    $(this.id).on('focus', '.editor-text', event => {
      setTimeout(() => this.updateFormat(), 1);
    });
    $(this.id).on('focus', '.editor-block', event => {
      if ($(event.target).hasClass('editor-block')) {
        event.stopPropagation();
        event.preventDefault();
        $(event.target).children('.editor-text').focus();
      }
    });
    $(this.id).on('blur', '.editor-text', event => { this.onBlur(event); });
    $(this.id).on('click', '.editor-text', event => {
      setTimeout(() => this.updateFormat(), 1);
    });
    /*$(this.id).on('mousedown', '.editor-text', event => { this.capturedMouseDown = true; });
    $('body').on('mouseup', event => {
      if (this.capturedMouseDown) {
        var sel = this.getSelection();
        var range = sel.getRangeAt(0);
        let r = this.getBlockIndexFromElement(range.startContainer);
        let o = this.getIndexFromElementAndOffset(range.startContainer, range.startOffset);
        console.log({blockIndex: r, index: o});
        setTimeout(() => this.updateFormat(), 1);
        this.capturedMouseDown = false;
      }
    });*/
  }

  /**
   * Handles text blocks being blurred.
   * @param {Event} event - Event to handle.
   */
  onBlur (event) {
    /*let caller = event.target;
    console.log(caller);
    console.log(caller.id);
    let id = parseInt(caller.id.substring(4));
    console.log(id + ' has lost focus.');
    this.lastBlock = id;*/
    this.lastSelection = this.getSelection();
    this.lastBlock = this.lastSelection.block;
    console.log(this.lastSelection);
    //this.updateFormat();
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
          this.setFormatAtSelection({list: !this.getCurrentFormat().list});
        }
        break;
      case 'b':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.setFormatAtSelection({bold: !this.getCurrentFormat().bold});
        }
        break;
      case 'h':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          let current = this.getCurrentFormat().title;
          if (current === 'none') current = null;
          let formats = [null, 'h1', 'h2', 'h3', 'h4'];
          let index = formats.indexOf(current) + 1;
          if (index === formats.length) index = 0;
          this.setFormatAtSelection({title: formats[index]});
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
          this.setFormatAtSelection({picture: !this.getCurrentFormat().picture});
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
        if (this.getBlockLength(id) === 0 && id !== 0 && $('#txt-' + id).children().length === 0) {
          event.stopPropagation();
          event.preventDefault();
          this.removeBlockAt(id, id - 1);
          let l = this.getBlockLength(id - 1);
          if (l > 0) {
            this.select(id - 1, l);
          }
        }
        break;
    }
    // Update the format.
    setTimeout(() => this.updateFormat(), 1);
    /*switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        if (!event.ctrlKey) return;
    }
    setTimeout(() => this.processAllSpaces(id), 1);
    setTimeout(() => this.cleanContent(id), 2);*/
  }

  /**
   * Restore the selection to what it was last.
   */
  restoreSelection () {
    let sel = this.getSelection();
    let oldRange = sel.getRangeAt(0);
    if (this.getBlockIndexFromElement(oldRange.startContainer) === -1) {
      // The selection is not already in a block, so restore the last one.
      let range = document.createRange();
      if (this.lastSelection != null) {
        range.setStart(this.lastSelection.startContainer, this.lastSelection.startOffset);
        range.setEnd(this.lastSelection.endContainer, this.lastSelection.endOffset);
      }
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      $(oldRange.startContainer).focus();
    }
  }

  /**
   * Process all the spaces and replace them with the relevant equivalent.
   * @param {Number} id - Index of the block to process.
   */
  processAllSpaces (id) {
    return; // Disabling.
    let text = this.getRawTextContent(id);
    let i = -1;
    while (++i < text.length - 1) {
      if (['\xa0', ' '].includes(text[i])) {
        let start = i;
        while (--start >= 0) {
          if (['\xa0', ' ', '\n'].includes(text[start])) {
            start++;
            break;
          }
        }
        let end = i;
        while (++end < text.length) {
          if (['\xa0', ' ', '\n'].includes(text[end])) {
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
    if (this.breakKeywords.includes(context.next.toLowerCase())) {
      if (this.breakKeywords.includes(context.previous.toLowerCase())) {
        return '\xa0';
      } else {
        return ' ';
      }
    } else if (Utils.stringEndsWith(context.previous, '.')) {
      return '\n';
    } else if (Utils.stringEndsWith(context.previous, '?')) {
      return '\n';
    } else if (Utils.stringEndsWith(context.previous, '!')) {
      return '\n';
    } else if (Utils.stringEndsWith(context.previous, ',')) {
      return '\n';
    } else if (Utils.stringEndsWith(context.previous, ';')) {
      return '\n';
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
   * Cut the current selection to the clipboard.
   */
  async cut () {
    this.restoreSelection();
    document.execCommand('cut');
  }

  /**
   * Cut the current selection to the clipboard.
   */
  async copy () {
    this.restoreSelection();
    document.execCommand('copy');
  }

  /**
   * Cut the current selection to the clipboard.
   */
  async paste () {
    this.restoreSelection();
    let data;
    if (navigator.clipboard) {
      data = await navigator.clipboard.readText();
    } else if (window.clipboardData) {
      data = window.clipboardData.getData('Text');
    } else {
      alert("Cette fonction n'est pas disponible dans votre navigateur.\nUtilisez Ctrl+V.");
    }
    document.execCommand('insertText', false, data);
  }

  /**
   * Update the cached format from the current selection.
   */
  updateFormat () {
    let oldFormat = this.format;
    this.format = this.getCurrentFormat();
    if (oldFormat == null) {
      this.dispatchCurrentFormatChanged(this.format);
    } else {
      let boldChanged = oldFormat.bold !== this.format.bold;
      let titleChanged = oldFormat.title !== this.format.title;
      let listChanged = oldFormat.list !== this.format.list;
      let frameChanged = oldFormat.frame !== this.format.frame;
      let colorChanged = oldFormat.color !== this.format.color;
      let pictureChanged = oldFormat.picture !== this.format.picture;
      if (boldChanged || titleChanged || listChanged || frameChanged || colorChanged || pictureChanged) {
        this.dispatchCurrentFormatChanged(this.format);
      }
    }
  }

  getBlockFormat (blockIndex) {
    let format = {};
    format.frame = $('#blc-' + blockIndex).hasClass('frame');
    format.blockType = $('#blc-' + blockIndex).hasClass('text-block') ? 'default' : ($('#blc-' + blockIndex).hasClass('image-block') ? 'images' : 'unknown');
    format.picture = $('#img-' + blockIndex).parent().is(':visible');
    return format;
  }

  /**
   * Get an object representing the format at the current selection.
   * @return {Format} The current format at the selection.
   */
  getCurrentFormat () {
    let selection = this.getSelection();
    if (Utils.isNullOrUndefined(selection)) {
      return {};
    }
    let quillFormat = this.getQuill(selection.block).getFormat(selection.index, selection.length);

    let format = this.getBlockFormat(selection.block);
    format.bold = Utils.isNullOrUndefined(quillFormat.bold) ? false : quillFormat.bold;
    format.list = Utils.isNullOrUndefined(quillFormat.list) ? false : quillFormat.list;
    format.indent = Utils.isNullOrUndefined(quillFormat.indent) ? 0 : quillFormat.indent;
    format.title = Utils.isNullOrUndefined(quillFormat.header) ? false : quillFormat.header;
    format.color = Utils.isNullOrUndefined(quillFormat.color) ? '#000000' : quillFormat.color;
    format.wrap = Utils.isNullOrUndefined(quillFormat.wrap) ? 'normal' : quillFormat.wrap;

    return format;
  }

  /**
   * Clear all blocks of the document.
   */
  clear () {
    $('.editor-block').remove();
    this.addBlock('', true);
  }

  /**
   * Create the instance of quill in the element with the given selector.
   * @param {String} selector - Selector to get the element. The first matching element will be chosen.
   */
  createQuill (selector) {
    let element = $(selector)[0];
    let options = {
      modules: {
        toolbar: false,
        keyboard: {
          bindings: this.bindings
        }
      },
      placeholder: 'Tapez le texte ici...',
      theme: 'snow'
    };
    element.quill = new Quill(element, options);
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
    this.createQuill('#txt-' + (index + 1));
    this.setImage('#img-' + (index + 1), 'img/placeholder.png');
    this.dispatchBlockCreatedEvent(index + 1);
  }

  /**
   * Insert an image block just below the block with the given index.
   * @param {int} index - ID of the block that the new block should follow.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertImageBlockAfter (index, focus) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    $('#blc-' + index).after(this.newImageBlockString(index + 1));
    this.refreshAllBlockID();
    if (focus) {
      $('#txt-' + (index + 1) + '-0').focus();
    }
    this.setImage('#img-' + (index + 1) + '-0', 'img/placeholder.png');
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
    this.createQuill('#txt-' + index);
    this.setImage('#img-' + (index), 'img/placeholder.png');
    this.dispatchBlockCreatedEvent(index);
  }

  /**
   * Insert an image block just above the block with the given index.
   * @param {int} index - ID of the block that the new block should precede.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertImageBlockBefore (index, focus) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    $('#blc-' + index).before(this.newImageBlockString(index));
    this.refreshAllBlockID();
    if (focus) {
      $('#txt-' + (index) + '-1').focus();
    }
    this.setImage('#img-' + (index) + '-0', 'img/placeholder.png');
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
      Animator.switchVertical(element, upElement, $(this.id)[0], 50, duration, () => {
        $(element).css('top', 0);
        $(element).css('left', 0);
        $(upElement).css('top', 0);
        $(upElement).css('left', 0);
        $(upElement).insertAfter($(element));
        $(element).children('.editor-text').focus();
        this.refreshAllBlockID();
      });
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
      Animator.switchVertical(element, upElement, $(this.id)[0], 50, duration, () => {
        $(element).css('top', 0);
        $(element).css('left', 0);
        $(upElement).css('top', 0);
        $(upElement).css('left', 0);
        $(upElement).insertAfter($(element));
        $(upElement).children('.editor-text').focus();
        this.refreshAllBlockID();
      });
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
    this.createQuill('#txt-' + id);
    this.setImage('#img-' + id, 'img/placeholder.png');
    this.dispatchBlockCreatedEvent(id);
  }

  /**
   * Add an image block at the end of the editor.
   */
  addImageBlock () {
    let id = this.blockCount;
    $(this.id).append(this.newImageBlockString(id));
    this.setImage('#img-' + id + '-0', 'img/placeholder.png');
    this.dispatchBlockCreatedEvent(id);
  }

  /**
   * Remove the image with the given ID and switch focus to a new id.
   * @param {int} blockID - ID of the block.
   * @param {int} imageID - ID of the image to remove.
   * @param {int} focusID - ID of the block that will get the focus.
   */
  removeImageInBlock (blockID, imageID, focusID = imageID + 1, duration = 250) {
    if (typeof (blockID) !== 'number') throw new Error(`Param "blockID" should be a number but was ${typeof (blockID)}!`);
    if (typeof (imageID) !== 'number') throw new Error(`Param "blockID" should be a number but was ${typeof (imageID)}!`);

    if ($('#blc-' + blockID).hasClass('image-block')) {
      if (imageID === 0 && this.getImageCountInBlock(blockID) === 1) {
        this.removeBlockAt(blockID);
      } else {
        // There will be at least one image remaining.
        let element = $('#img-' + blockID + '-' + imageID).parent()[0];
        if (typeof (focusID) === 'number') {
          $('#txt-' + focusID).focus();
        }
        Animator.collapse(element, duration, () => {
          $(element).remove();
          this.refreshAllBlockID();
          //this.dispatchBlockDestroyedEvent(id);
        });
      }
    }
  }

  /**
   * Insert an image within the image block with the given ID, just before the
   * image with the given ID.
   * @param {int} blockID - ID of the block.
   * @param {int} imgID - ID of the image to insert the new one before.
   */
  insertImageInBlockBefore (blockID, imgID) {
    if ($('#blc-' + blockID).hasClass('image-block')) {
      if (this.getImageCountInBlock(blockID) === 6) {
        alert("Vous ne pouvez pas mettre plus d'images dans ce bloc !");
        return;
      }
      let selector = '#img-' + blockID + '-';
      $(selector + imgID).parent().before(this.newImageInImageBlockString(blockID, imgID));
      this.refreshAllBlockID();
      setTimeout(() => {
        this.setImage(selector + imgID, 'img/placeholder.png');
        $('#txt-' + blockID + '-' + imgID).focus();
      }, 1);
    }
  }

  /**
   * Insert an image within the image block with the given ID, just after the
   * image with the given ID.
   * @param {int} blockID - ID of the block.
   * @param {int} imgID - ID of the image to insert the new one after.
   */
  insertImageInBlockAfter (blockID, imgID) {
    if ($('#blc-' + blockID).hasClass('image-block')) {
      if (this.getImageCountInBlock(blockID) === 6) {
        alert("Vous ne pouvez pas mettre plus d'images dans ce bloc !");
        return;
      }
      let selector = '#img-' + blockID + '-';
      $(selector + imgID).parent().after(this.newImageInImageBlockString(blockID, imgID + 1));
      this.refreshAllBlockID();
      setTimeout(() => {
        this.setImage(selector + (imgID + 1), 'img/placeholder.png');
        $('#txt-' + blockID + '-' + (imgID + 1)).focus();
      }, 1);
    }
  }

  /**
   * Add an image within the image block with the given id.
   * @param {int} id - The id of the block.
   */
  addImageInBlock (id) {
    if ($('#blc-' + id).hasClass('image-block')) {
      let lastImg = this.getImageCountInBlock(id) - 1;
      if (lastImg === 5) {
        alert("Vous ne pouvez pas mettre plus d'images dans ce bloc !");
        return;
      }
      let selector = '#img-' + id + '-' + lastImg;
      $(selector).parent().after(this.newImageInImageBlockString(id, lastImg + 1));
      setTimeout(() => {
        this.setImage('#img-' + id + '-' + (lastImg + 1), 'img/placeholder.png');
        $('#txt-' + id + '-' + (lastImg + 1)).focus();
      }, 1);
    } else {
      throw new Error('Can only add images within image blocks.');
    }
  }

  /**
   * Move a block up by the given amount.
   * @param {int} blockID - ID of the block to move.
   * @param {int} imageID - ID of the image to move.
   * @param {int} amount - (Optional) amount to move the block by.
   * @param {int} duration - (Optional) duration of the animation.
   */
  moveImageLeft (blockID, imageID, amount = 1, duration = 250) {
    if (typeof (blockID) !== 'number') throw new Error(`Param "blockID" should be a number but was ${typeof (blockID)}!`);
    if (typeof (imageID) !== 'number') throw new Error(`Param "blockID" should be a number but was ${typeof (imageID)}!`);

    if (imageID - amount >= 0) {
      let element = $('#img-' + blockID + '-' + imageID).parent()[0];
      let leftElement = $('#img-' + blockID + '-' + (imageID - amount)).parent()[0];
      Animator.switchHorizontal(element, leftElement, $(this.id)[0], 50, duration, () => {
        $(element).css('top', 0);
        $(element).css('left', 0);
        $(leftElement).css('top', 0);
        $(leftElement).css('left', 0);
        $(element).insertBefore($(leftElement));
        $(element).children('.editor-text').focus();
        this.refreshAllBlockID();
      });
    }
  }

  /**
   * Move a block down by the given amount.
   * @param {int} blockID - ID of the block to move.
   * @param {int} imageID - ID of the image to move.
   * @param {int} amount - (Optional) amount to move the block by.
   * @param {int} duration - (Optional) duration of the animation.
   */
  moveImageRight (blockID, imageID, amount = 1, duration = 250) {
    if (typeof (blockID) !== 'number') throw new Error(`Param "blockID" should be a number but was ${typeof (blockID)}!`);
    if (typeof (imageID) !== 'number') throw new Error(`Param "blockID" should be a number but was ${typeof (imageID)}!`);

    if (imageID + amount < this.getImageCountInBlock(blockID)) {
      let element = $('#img-' + blockID + '-' + (imageID + amount)).parent()[0];
      let leftElement = $('#img-' + blockID + '-' + imageID).parent()[0];
      Animator.switchHorizontal(element, leftElement, $(this.id)[0], 50, duration, () => {
        $(element).css('top', 0);
        $(element).css('left', 0);
        $(leftElement).css('top', 0);
        $(leftElement).css('left', 0);
        $(leftElement).insertAfter($(element));
        $(leftElement).children('.editor-text').focus();
        this.refreshAllBlockID();
      });
    }
  }

  /**
   * Get the number of images within a block.
   */
  getImageCountInBlock (id) {
    if ($('#blc-' + id).hasClass('media')) {
      return 1;
    } else {
      return $('#blc-' + id).children('.row').children('.col').length;
    }
  }

  /**
   * Get the text content of the block with the given id.
   * @param {int} id - ID of the block to extract text from.
   * @return {string} The extracted text.
   */
  getRawTextContent (id) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);
    return this.getQuill(id).getText();
  }

  /**
   * Get the length of the text content of the block with the given id.
   * @param {Number} id - ID of the block.
   * @return {Number} The number of characters in this block.
   */
  getBlockLength (id) {
    return this.getRawTextContent(id).length;
  }

  /**
   * Get a HTML string to initialize a block.
   * @param {int} id - ID of the new block.
   * @param {string} text - Text the new block should be initialized with.
   * @return {string} HTML string of the new block.
   */
  newBlockString (id, text) {
    return `<div id="blc-${id}" class="editor-block text-block media" style="font-size: 14pt;">` +
             `<div id="txt-${id}" class="editor-text media-body align-self-center mr-3">` +
                `<div>${text}</div>` +
             `</div>` +
             `<div class="editor-image-container mr-3" style="width:100px">` +
                `<img id="img-${id}" class="editor-image align-self-center hoverable"/>` +
             `</div>` +
           `</div>`;
  }

  /**
   * Get a HTML string to initialize an Image Block.
   * @param {int} id - ID of the new block.
   * @return {string} HTML string of the new block.
   */
  newImageBlockString (id) {
    return `<div id="blc-${id}" class="editor-block image-block mx-auto" style="font-size:14pt;">` +
              `<div class="row">` +
                this.newImageInImageBlockString(id, 0) +
              `</div>` +
          `</div>`;
  }

  /**
   * Get a HTML string to initialize an Image for an Image Block.
   * @param {int} id - Id of the block.
   * @param {int} imgID - Id of the image within the block.
   * @return {string} HTML string of the new image container.
   */
  newImageInImageBlockString (id, imgID) {
    return `<div class="col editor-image-container">` +
      `<img id="img-${id}-${imgID}" class="editor-image align-self-center hoverable px-auto"/>` +
      `<div id="txt-${id}-${imgID}" class="editor-text align-self-center" contenteditable="true"></div>` +
    `</div>`;
  }

  /**
   * Change the DOM ID of the block with the given id to the given new id.
   * @param {int} oldID - ID the block had until now.
   * @param {int} newID - ID the block should be having.
   * @deprecated Use refreshAllBlockID() instead.
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
      if ($(this).hasClass('text-block')) {
        $(this).find('.editor-text').attr('id', 'txt-' + index);
        $(this).find('.editor-image').attr('id', 'img-' + index);
      } else if ($(this).hasClass('image-block')) {
        $(this).find('.editor-text').each(function (subIndex) {
          $(this).attr('id', 'txt-' + index + '-' + subIndex);
        });
        $(this).find('.editor-image').each(function (subIndex) {
          $(this).attr('id', 'img-' + index + '-' + subIndex);
        });
      }
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
    let currentSelection = this.getSelection();
    let currentFormat = this.getQuill(currentSelection.block).getFormat();
    if (!Utils.isNullOrUndefined(currentSelection)) {
      let bold = currentFormat.bold;
      let list = currentFormat.list;
      let title = currentFormat.title;
      let color = currentFormat.color;
      let wrap = currentFormat.wrap;
      let indent = currentFormat.indent;
      if (typeof (format.title) !== 'undefined' && title !== format.title) {
        let t = format.title;
        if (t === 'none') t = null;
        this.getQuill(currentSelection.block).format('header', t);
      }
      if (typeof (format.bold) !== 'undefined' && format.bold !== bold) {
        this.getQuill(currentSelection.block).format('bold', format.bold);
      }
      if (typeof (format.list) !== 'undefined' && format.list !== list) {
        let l = format.list === 'bullet' ? true : format.list;
        this.getQuill(currentSelection.block).format('list', l);
      }
      if (typeof (format.indent) !== 'undefined' && format.indent !== indent) {
        this.getQuill(currentSelection.block).format('indent', format.indent);
      }
      if (typeof (format.color) !== 'undefined' && format.color !== color) {
        this.getQuill(currentSelection.block).format('color', format.color);
      }
      if (typeof (format.wrap) !== 'undefined' && format.wrap !== wrap) {
        let w = format.wrap === 'normal' ? null : format.wrap;
        this.getQuill(currentSelection.block).format('wrap', w);
      }
      this.setBlockFormat(currentSelection.block, format);
    }
  }

  /**
   * Set the format of the block with the given ID.
   * @param {int} blockID - The index of the block to change the format of.
   * @param {Object} format - The new format of the block.
   */
  setBlockFormat (blockID, format) {
    let oldFormat = this.getBlockFormat(blockID);
    let frame = oldFormat.frame;
    let picture = oldFormat.picture;
    if (typeof (format.frame) !== 'undefined' && format.frame !== frame) {
      this.setBlockFrameVisibility(blockID, format.frame);
    }
    if (typeof (format.picture) !== 'undefined' && format.picture !== picture) {
      this.setBlockImageVisibility(blockID, format.picture);
    }
    this.updateFormat();
  }

  /**
   * Hide the image associated to the given blockID.
   * @param {int} blockID - The index of the block containing the image.
   */
  hideBlockImage (blockID) {
    $('#img-' + blockID).parent().hide();
  }

  /**
   * Show the image associated to the given blockID.
   * @param {int} blockID - The index of the block containing the image.
   */
  showBlockImage (blockID) {
    $('#img-' + blockID).parent().show();
  }

  /**
   * Set the visibility of the image associated to the given blockID.
   * @param {int} blockID - The index of the block containing the image.
   * @param {boolean} visibility - The visibility of the image.
   */
  setBlockImageVisibility (blockID, visibility) {
    if (visibility) this.showBlockImage(blockID);
    else this.hideBlockImage(blockID);
  }

  /**
   * Hide the frame associated to the given blockID.
   * @param {int} blockID - The index of the block containing the frame.
   */
  hideBlockFrame (blockID) {
    $('#blc-' + blockID).removeClass('frame');
  }

  /**
   * Show the frame associated to the given blockID.
   * @param {int} blockID - The index of the block containing the frame.
   */
  showBlockFrame (blockID) {
    $('#blc-' + blockID).addClass('frame');
  }

  /**
   * Set the visibility of the frame associated to the given blockID.
   * @param {int} blockID - The index of the block containing the frame.
   * @param {boolean} visibility - The visibility of the frame.
   */
  setBlockFrameVisibility (blockID, visibility) {
    if (visibility) this.showBlockFrame(blockID);
    else this.hideBlockFrame(blockID);
  }

  /**
   * Set the image in the block with the given id, making it DataURL-ready.
   * @param {string} selector - ID of the block.
   * @param {string} src - Path of the image source.
   * @param {int} requestedWidth - Width of the resulting image.
   */
  async setImage (selector, src, requestedWidth) {
    if ($(selector).length === 0) throw new Error(`There is no element matching selector "${selector}"`);
    //console.log(src);
    if (src.match(/^https?:\/\//)) {
      let res = src.match(/image_proxy\.php\?url=(https?:\/\/.+$)/);
      if (res) {
        // For when we're moving an image already within the editor.
        src = './image_proxy.php?url=' + res[1];
      } else {
        // Ensure cross domain images are displayed.
        src = './image_proxy.php?url=' + src;
      }
    }
    var img = $(selector)[0];
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      if (typeof (requestedWidth) !== 'number') {
        requestedWidth = img.naturalWidth;
      }
      let canvas = this.hiddenCanvas;
      let scale = img.naturalWidth / requestedWidth;
      canvas.width = img.naturalWidth / scale;
      canvas.height = img.naturalHeight / scale;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.dataURL = canvas.toDataURL('image/png');
      // var dataURL = canvas.toDataURL("image/png");
      // console.log(dataURL);
      // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
      this.dispatchImageLoaded(Number(selector.substring(5)));
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
    let maxLength = this.getQuill(blockIndex).getText().length;
    length = startIndex + length > maxLength ? maxLength - startIndex : length;
    this.getQuill(blockIndex).deleteText(startIndex, length);
    this.getQuill(blockIndex).insertText(startIndex, text);
  }

  /**
   * Clean the HTML content of the block with the given id.
   * @param {Number} blockIndex - Id of the block to clean.
   */
  /*cleanContent (blockIndex) {
    this.saveSelection();
    let jElement = $('#blc-' + blockIndex).find('.editor-text');
    jElement.find('span').contents().unwrap();
    jElement.get(0).normalize();
    $(jElement.find('div div').get().reverse()).each(function () {
      $(this).insertAfter(($(this).parent()));
    });
    jElement.find('div').each(function () {
      if ($(this).is(':empty')) $(this).remove();
    });
    let edit = this;
    jElement.each(function () {
      let nodes = edit.getNodesInElement(this);
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType === 3 && nodes[i].parentNode === this) {
          let s = document.createElement('span');
          this.insertBefore(s, nodes[i]);
          s.appendChild(nodes[i]);
        }
      }
    });
    this.restoreSavedSelection();
  }*/

  saveSelection () {
    this.savedSelection = this.getSelection();
  }

  restoreSavedSelection () {
    this.select(this.savedSelection.block, this.savedSelection.index, this.savedSelection.length);
  }

  /**
   * Get a list of words that seem to be significant within the given block.
   * @param {Number} blockIndex - Id of the block to check.
   * @return {Array} Array of words.
   */
  getSignificantWords (blockIndex) {
    let jElement = $('#txt-' + blockIndex);
    let bold = jElement.find('strong');
    let result = [];
    for (let i = 0; i < bold.length; i++) {
      result.push(bold[i].textContent);
    }
    return result;
  }

  /**
   * Sets the selection in the editor.
   * @param {int} blockIndex - Index of the block.
   * @param {int} startIndex - Start index of the selection.
   * @param {int} length - (optional) length of the selection;
   */
  select (blockIndex, startIndex, length = 0) {
    this.getQuill(blockIndex).setSelection(startIndex, length);
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
      let matches = this.getQuill(i).getText().match(patt);
      if (matches != null) {
        offset = matches.index;
        offset += matches[0].search(matches[1]);
        this.select(i, offset, text.length);
        break;
      }
    }
  }

  /**
   * Get the element and the offset at the given index.
   * @param {int} blockIndex - Index of the block to look into.
   * @param {int} index - Index of the character.
   * @return {Object} Corresponding element and offset.
   */
  getBlockElementAndOffsetAtIndex (blockIndex, index) {
    let root = $('#blc-' + blockIndex).find('.editor-text')[0];
    let remainingChars = index;
    let nodes = this.getNodesInElement(root);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === 3) {
        if (remainingChars <= nodes[i].length) {
          return {element: nodes[i], offset: remainingChars};
        } else {
          remainingChars -= nodes[i].length + 1;
        }
      }
    }
    return {element: root, offset: 0};
  }

  /**
   * Get the index of block containing the element.
   * @param {DOMElement} element - Element.
   * @return {Number} - Index of the block containing the element, or -1.
   */
  getBlockIndexFromElement (element) {
    let current = $(element);
    while (!current.hasClass('editor-block')) {
      current = current.parent();
      if (current.length === 0) {
        return -1;
      }
    }
    return Number(current[0].id.substring(4));
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
      if (current.length === 0) {
        throw new Error('Element is not within a block!');
      }
    }
    let root = current.get(0);
    let nodes = this.getNodesInElement(root);
    let index = 0;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === 3) {
        if (nodes[i] === element) {
          return index + offset;
        } else {
          index += nodes[i].length + 1;
        }
      }
    }
    return 0;
  }

  /**
   * Get all the nodes in the given element.
   * @param {DOMElement} element - Element.
   * @return {DOMElementList} List of nodes within that element.
   */
  getNodesInElement (element) {
    let startNode = element.firstChild;
    let endNode = element;
    if (startNode === null) {
      return [];
    }
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
   * Get the format for the given node.
   * @param {DOMElement} element - Element to check the format for.
   * @return {Format} The format of the element.
   */
  getFormatForNode (node) {
    if (node.nodeType === 3) node = node.parentNode;
    let weight = window.getComputedStyle(node)['font-weight'];
    /* let listitem = this.hasReccursiveTag('LI', node);
    let h1 = this.hasReccursiveTag('H1', node);
    let h2 = this.hasReccursiveTag('H2', node);
    let h3 = this.hasReccursiveTag('H3', node);
    let h4 = this.hasReccursiveTag('H4', node);
    let h5 = this.hasReccursiveTag('H5', node); */
    let color = window.getComputedStyle(node)['color'];
    let size = parseFloat(window.getComputedStyle(node)['font-size']);
    let result = {};
    result.bold = weight === '700';
    // result.bullet = listitem;
    // result.title = h1 ? 'h1' : (h2 ? 'h2' : (h3 ? 'h3' : (h4 ? 'h4' : (h5 ? 'h5' : 'none'))));
    let id = this.getBlockIndexFromElement(node);
    result.frame = $('#blc-' + id).hasClass('frame');
    result.blockType = $('#blc-' + id).hasClass('text-block') ? 'default' : ($('#blc-' + id).hasClass('image-block') ? 'images' : 'unknown');
    result.picture = $('#img-' + id).parent().is(':visible');
    result.size = size;
    result.color = color;
    return result;
  }

  /**
   * Save asynchronously the document into a JSON compatible format
   * which can be reloaded using load().
   * @return {JSONObject} A JSON object of the document within a promise.
   * @deprecated
   */
  async save () {
    return this.saveSync();
  }

  /**
   * Save asynchronously the document into a JSON compatible format
   * which can be reloaded using load().
   * @return {JSONObject} A JSON object of the document within a promise.
   */
  async saveAsync () {
    return this.saveSync();
  }

  /**
   * Save synchronously the document into a JSON compatible format
   * which can be reloaded using load().
   * @return {JSONObject} A JSON object of the document.
   */
  saveSync () {
    let object = {
      meta: {
        version: this.fileVersion
      },
      blocks: []
    };
    for (let i = 0; i < this.blockCount; i++) {
      let format = this.getBlockFormat(i);
      switch (format.blockType) {
        case 'default':
          object.blocks.push({
            type: 'default',
            content: this.getQuill(i).getContents(),
            image: $('#img-' + i)[0].dataURL,
            options: {
              leftPicture: false,
              rightPicture: format.picture,
              frame: format.frame
            }
          });
          break;
        case 'images':
          let imagesCount = this.getImageCountInBlock(i);
          let images = [];
          for (let img = 0; img < imagesCount; img++) {
            images.push({image: $('#img-' + i + '-' + img)[0].dataURL, text: $('#txt-' + i + '-' + img)[0].innerHTML});
          }
          object.blocks.push({
            type: 'images',
            images: images,
            options: {}
          });
          break;
      }
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
      alert('Le fichier a été sauvegardé\navec une version plus récente de LIREC.\nIl ne peut pas être chargé.\n\nVersion du fichier : ' +
        json.meta.version + '\nVersion actuelle : ' + this.fileVersion
      );
      throw new Error('Data was generated with a more recent version of LIREC. It cannot be loaded.');
    }

    this.clear();

    for (let i = 0; i < json.blocks.length; i++) {
      switch (json.blocks[i].type) {
        case 'default':
          if (i > 0) { // Clearing always leaves an empty block. No need to add it.
            this.addBlock();
          }
          if (json.meta.version < 2) {
            this.getQuill(i).clipboard.dangerouslyPasteHTML(json.blocks[i].content);
          } else {
            this.getQuill(i).setContents(json.blocks[i].content);
          }
          setTimeout(() => {
            this.setImage('#img-' + i, json.blocks[i].image);
            if (json.meta.version >= 1) {
              this.setBlockFormat(i, {frame: json.blocks[i].options.frame, picture: json.blocks[i].options.rightPicture});
              //if (!json.blocks[i].options.rightPicture) $('#img-' + i).hide();
              //if (json.blocks[i].options.frame) $('#blc-' + i).addClass('frame');
            }
          }, 250);
          break;
        case 'images':
          if (i === 0) { // Clearing always leaves an empty block. We need to replace it.
            this.insertImageBlockBefore(0);
            this.removeBlockAt(1);
          } else {
            this.addImageBlock();
          }
          for (let img = 0; img < json.blocks[i].images.length; img++) {
            if (img > 0) {
              this.addImageInBlock(i);
            }
            $('#txt-' + i + '-' + img)[0].innerHTML = json.blocks[i].images[img].text;
            setTimeout(() => {
              this.setImage('#img-' + i + '-' + img, json.blocks[i].images[img].image);
            }, 250);
          }
      }
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
      let blockFormat = this.getBlockFormat(i);
      let marginTop = parseFloat(window.getComputedStyle($('#blc-' + i)[0])['margin-top']);
      if (currentYOffset + Utils.pixelToCm($('#blc-' + i).height()) + Utils.pixelToCm(marginTop) > pageHeight - margin) {
        doc = doc.addPage();
        currentYOffset = margin;
      }
      currentYOffset += Utils.pixelToCm(marginTop);
      if (blockFormat.frame) {
        doc.setLineWidth(Utils.pixelToCm(5));
        doc.rect(margin, currentYOffset, Utils.pixelToCm($('#blc-' + i).width()), Utils.pixelToCm($('#blc-' + i).height()));
        doc.setLineWidth(Utils.pixelToCm(1));
      }
      switch (blockFormat.blockType) {
        case 'default':
          let txt = $('#txt-' + i).get(0);
          /* doc.fromHTML($('#txt-' + i).get(0),
            margin,
            currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset($('#txt-' + i)[0]).top),
            {
              'width': Utils.pixelToCm($('#txt-' + i).width()),
              'height': Utils.pixelToCm($('#txt-' + i).height())
            }
          ); */
          let nodes = this.getNodesInElement(txt);
          for (let n = 0; n < nodes.length; n++) {
            if (nodes[n].nodeType === 3) {
              let format = this.getFormatForNode(nodes[n]);
              let fontSize = format.size;
              let fontSizeCm = Utils.pixelToCm(fontSize);
              let color = format.color;
              doc.setTextColor(color);
              doc.setFontSize(Utils.pixelToPoint(fontSize));
              if (format.bold) {
                doc.setFontType('bold');
              } else {
                doc.setFontType('normal');
              }
              let x = margin + Utils.pixelToCm(Utils.getRelativeOffset(nodes[n].parentNode, $('#blc-' + i)[0]).left);
              let y = currentYOffset + fontSizeCm + Utils.pixelToCm(Utils.getRelativeOffset(nodes[n].parentNode, $('#blc-' + i)[0]).top);
              //doc.rect(x, y, 1, fontSizeCm);
              doc.text(nodes[n].textContent, x, y);
            }
          }
          /* let txtWidth = Utils.pixelToCm($(txt).width());
          let txtHeight = Utils.pixelToCm($(txt).height());
          doc.addImage((await html2canvas(txt, {scale: 3})).toDataURL(), 'JPEG',
            margin + Utils.pixelToCm(Utils.getRelativeOffset(txt).left),
            currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset(txt).top),
            txtWidth,
            txtHeight,
            '',
            'NONE',
            0
          ); */

          if (blockFormat.picture) {
            doc.addImage($('#img-' + i).get(0).dataURL, 'JPEG',
              margin + Utils.pixelToCm(Utils.getRelativeOffset($('#img-' + i)[0], $('#blc-' + i)[0]).left),
              //totalWidth - margin - Utils.pixelToCm($('#img-' + i).outerWidth()),
              currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset($('#img-' + i)[0]).top),
              Utils.pixelToCm($('#img-' + i).width()),
              Utils.pixelToCm($('#img-' + i).height()),
              '',
              'NONE',
              0
            );
          }
          break;
        case 'images':
          let imageCount = this.getImageCountInBlock(i);
          for (let img = 0; img < imageCount; img++) {
            let jImage = $('#img-' + i + '-' + img);
            doc.addImage(jImage.get(0).dataURL, 'JPEG',
              margin + Utils.pixelToCm(Utils.getRelativeOffset(jImage[0], $('#blc-' + i)[0]).left),
              currentYOffset + Utils.pixelToCm(Utils.getRelativeOffset(jImage[0], $('#blc-' + i)[0]).top),
              Utils.pixelToCm(jImage.width()),
              Utils.pixelToCm(jImage.height()),
              '',
              'NONE',
              0
            );
            // todo write captions.
          }
          break;
      }

      currentYOffset += Utils.pixelToCm($('#blc-' + i).height() + parseFloat(window.getComputedStyle($('#blc-' + i)[0])['margin-bottom']));
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

  /**
   * Send an event telling that an image is ready to be displayed.
   * @param {string} id - id of the image.
   */
  dispatchImageLoaded (id) {
    let e = new CustomEvent('imageloaded', {
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
}
