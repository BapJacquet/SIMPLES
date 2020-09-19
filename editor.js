/* eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Editor" }] */
/* global $ */
/* global Image */
/* global Animator */
/* global Utils */
/* global CustomEvent */
/* global jsPDF */
/* global pdfMake */
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
    this.fileVersion = 4;
    this.format = null;
    this.initializeStyles();
    this.initializeQuill();
    this.addBlock('', false);
    this.lastBlock = 0;
    this.lastSelection = null;
    this.registerEvents();
  }

  /**
   * Get the keyboard bindings for the editor.
   * @return {object} Object containing all bindings.
   */
  get bindings () {
    return {
      list: {
        key: 'l',
        shortKey: true,
        handler: () => {
          this.setFormatAtSelection({ list: !this.getCurrentFormat().list });
        }
      },
      frame: {
        key: 'f',
        shortKey: true,
        handler: () => {
          this.setFormatAtSelection({ frame: !this.getCurrentFormat().frame });
        }
      },
      bold: {
        key: 'B',
        shortKey: true,
        handler: () => {
          this.setFormatAtSelection({ bold: !this.getCurrentFormat().bold });
        }
      },
      title: {
        key: 'h', // h
        shortKey: true,
        handler: () => {
          console.log('test');
          const list = ['none', 'h1', 'h2', 'h3', 'h4'];
          const t = this.getCurrentFormat().title;
          const index = list.indexOf(t);
          const newT = index < list.length - 1 ? list[index + 1] : list[0];
          this.setFormatAtSelection({ title: newT });
        }
      },
      pictureRight: {
        key: 'i',
        shortKey: true,
        handler: () => {
          const bf = this.getCurrentFormat().pictureRight;
          this.setFormatAtSelection({ pictureRight: !bf });
        }
      },
      pictureLeft: {
        key: 'I',
        shortKey: true,
        shiftKey: true,
        handler: () => {
          const bf = this.getCurrentFormat().pictureLeft;
          this.setFormatAtSelection({ pictureLeft: !bf });
        }
      },
      wrap: {
        key: 'U', // U
        shortKey: true,
        handler: () => {
          console.log('test2!');
          const w = this.getCurrentFormat().wrap;
          if (w === 'nowrap') {
            this.setFormatAtSelection({ wrap: 'normal' });
          } else {
            this.setFormatAtSelection({ wrap: 'nowrap' });
          }
        }
      },
      newBlock: {
        key: Keyboard.keys.ENTER,
        prefix: /^$/,
        handler: () => {
          const s = this.getSelection();
          if (this.getQuill(s.block).getText(s.range.index - 1, 1) === '\n') {
            if (this.getQuill(s.block).getText(s.range.index, 1) === '\n') {
              this.getQuill(s.block).deleteText(s.range.index, 1);
            } else {
              this.getQuill(s.block).deleteText(s.range.index - 1, 1);
            }
            this.splitBlock(s.block, s.range.index - 1);
            this.select(s.block + 1, null, 0);
            return false;
          }
          return true;
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
   * Get the words after which there can be line breaks.
   * @return {Array} Array of strings.
   */
  get precedeBreakKeywords () {
    return ['?', '.', '!', ':', ',', ';'];
  }

  /**
   * Get the words before which there can be line breaks.
   * @return {Array} Array of strings.
   */
  get breakKeywords () {
    return ['le', 'ne', 'la', 'de', 'du', 'dans', 'se', 'les', 'pour', 'à', 'et', 'un', 'une', 'en', 'est', 'sont', 'avec', 'qui'];
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

  focus () {
    if (!this.hasFocus) {
      if (!Utils.isNullOrUndefined(this.lastSelection)) {
        this.restoreSelection();
      } else {
        switch (this.getBlockFormat(0).blockType) {
          case 'default':
            this.select(0, null, 0, 0); break;
          case 'images':
            this.select(0, 0, 0, 0); break;
        }
      }
    }
  }

  /**
   * Get the block with the given ID.
   * @param {int} id - The ID of the block.
   * @return {DOMElement} The block element.
   */
  getBlockElement (id) {
    return $('#blc-' + id)[0];
  }

  /**
   * Get the text with the given ID.
   * @param {int} id - The ID of the block.
   * @param {int} subid - (Optional) The subid of the text.
   * @return {DOMElement} The text element.
   */
  getTextElement (id, subid) {
    if (Utils.isNullOrUndefined(subid)) {
      return $('#txt-' + id)[0];
    } else {
      return $(`#txt-${id}-${subid}`)[0];
    }
  }

  /**
   * Get the image with the given ID.
   * @param {int} id - The ID of the block.
   * @param {int} subid - (Optional) The subid of the image.
   * @return {DOMElement} The image element.
   */
  getImageElement (id, subid) {
    if (Utils.isNullOrUndefined(subid)) {
      return $('#img-' + id)[0];
    } else {
      return $(`#img-${id}-${subid}`)[0];
    }
  }

  /**
   * Get the quill for the given id.
   * @param {int} id - The id of the block.
   * @param {int} subid - (Optional) The subid of the text.
   * @return {Quill} The quill of this block.
   */
  getQuill (id, subid) {
    if (Utils.isNullOrUndefined(this.getTextElement(id, subid))) return null;
    return this.getTextElement(id, subid).quill;
  }

  /**
   * Get the current selection in the editor.
   * @return {JSONObject} Contains the id of the block, and the range.
   */
  getSelection () {
    for (let i = 0; i < this.blockCount; i++) {
      switch (this.getBlockFormat(i).blockType) {
        case 'default': {
          const s = this.getQuill(i).getSelection();
          if (!Utils.isNullOrUndefined(s)) {
            return { block: i, subBlock: undefined, range: s };
          }
          break;
        } case 'images':
          for (let j = 0; j < this.getImageCountInBlock(i); j++) {
            const s = this.getQuill(i, j).getSelection();
            if (!Utils.isNullOrUndefined(s)) {
              return { block: i, subBlock: j, range: s };
            }
          }
          break;
        case 'letter':
        for (let j = 0; j < 2; j++) {
          const s = this.getQuill(i, j).getSelection();
          if (!Utils.isNullOrUndefined(s)) {
            return { block: i, subBlock: j, range: s };
          }
        }
      }
    }
  }

  /**
   * Create the default styles.
   */
  initializeStyles () {
    this.defaultTheme = {
      h1: {
        'text-align': 'center',
        'font-size': '28pt',
        color: 'black'
      },
      h2: {
        'font-size': '20pt',
        color: 'black'
      },
      h3: {
        'font-size': '18pt',
        color: 'black'
      },
      h4: {
        'font-size': '16pt',
        color: 'black'
      },
      p: {
        'text-align': 'left',
        'font-size': '14pt',
        color: 'black'
      },
      frame: {
        border: '4pt solid black',
        'border-radius': '0pt',
        background: 'transparent'
      },
      page: {
        padding: '0in 0in 0in 0in'
      }
    };
    this.defaultTheme.default = this.defaultTheme.p;
    this.setTheme(this.defaultTheme);
  }

  /**
   * Initializes quill for the editor.
   */
  initializeQuill () {
    Quill.imports['modules/keyboard'].DEFAULTS = [];

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
    $(this.id).on('click', '.editor-block.text-block', event => {
      const id = Number(event.currentTarget.id.substring(4));
      this.getQuill(id).focus();
    });
    // $(this.id).on('click', '.editor-image', event => { this.dispatchImageClickEvent('#' + event.target.id); });
    $(this.id).on('click', '.editor-block', event => {
      if ($(event.target).hasClass('editor-block')) {
        event.stopPropagation();
        event.preventDefault();
        $(event.target).children('.editor-text').focus();
        console.log("Focusing " + $(event.target).children('.editor-text').id);
      }
    });
    $(this.id).on('click', '.col.editor-image-container', event => {
      if ($(event.currentTarget).hasClass('editor-image-container')) {
        event.stopPropagation();
        event.preventDefault();
        let textid = $(event.currentTarget).children('.editor-text')[0].id;
        let blockid = Number(textid.split('-')[1]);
        let subid = Number(textid.split('-')[2]);
        this.getQuill(blockid, subid).focus();
        console.log("Focusing " + textid);
      }
    });
    //$(this.id).parent().on('click', event => {if (!this.hasFocus) this.restoreSelection();})
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
    //$(this.id).on('focuslost', event => { this.onBlur(event); });
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
    /*let interval = setInterval(() => {
      if (!this.hasFocus) {
        this.restoreSelection();
      }
    }, 250);*/
  }

  /**
   * Handle special keys in editor blocks.
   * @param {KeyboardEvent} event - Event to handle.
   */
  onKeyDown (event) {
    if (!this.hasFocus) return;
    let id = this.getSelection().block;
    let subid = this.getSelection().subBlock;
    switch (event.key) {
      /*case 'l':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.setFormatAtSelection({ list: !this.getCurrentFormat().list });
        }
        break;*/
      /*case 'b':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.setFormatAtSelection({ bold: !this.getCurrentFormat().bold });
        }
        break;*/
      /*case 'h':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          let current = this.getCurrentFormat().title;
          let formats = ['none', 'h1', 'h2', 'h3', 'h4'];
          let index = formats.indexOf(current) + 1;
          if (index === formats.length) index = 0;
          this.setFormatAtSelection({title: formats[index]});
        }
        break;*/
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
      /*case 'i':
        if (event.ctrlKey) {
          event.stopPropagation();
          event.preventDefault();
          this.setFormatAtSelection({ pictureRight: !this.getCurrentFormat().pictureRight });
        }
        break;*/
      /*case 'ArrowUp':
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
        break;*/
      case 'Backspace':
        let s = this.getSelection();
        if (s.range.index === 0 && id !== 0 && this.getBlockFormat(id).blockType === 'default' && this.getBlockFormat(id - 1).blockType === 'default') {
          if (Utils.isNullOrUndefined(this.getQuill(id))) return;
          event.stopPropagation();
          event.preventDefault();
          let format = this.getQuill(id).getFormat();
          if (format.list === 'bullet' || format.list === 'ordered') {
            this.setFormatAtSelection({ list: false });
            break;
          }
          if (event.ctrlKey) { // If control key is pressed, try to merge blocks.
            let l = this.getBlockLength(id - 1);
            this.mergeBlocks(id - 1, id, 1);
            if (l > 0) {
              this.select(id - 1, null, l - 1);
            }
          }
        }
        break;
    }
    // Update the format.
    setTimeout(() => { this.processBlock(id); this.updateFormat(); }, 1);
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
   * Process the block to make it FALC style.
   */
  processBlock (id) {
    switch (this.getBlockFormat(id).blockType) {
      case 'default': {
        const text = this.getQuill(id).getText();
        const spacesPattern = /[ \u00A0]/gm;
        let array;
        while ((array = spacesPattern.exec(text)) != null) {
          let spacebreak = false;
          for (const word of this.breakKeywords) {
            const patt = RegExp('^' + word + '\\b');
            if (patt.test(text.substring(spacesPattern.lastIndex))) {
              spacebreak = true;
              break;
            }
          }
          if (!spacebreak) {
            for (const word of this.precedeBreakKeywords) {
              if (text.substring(0, array.index).endsWith(word)) {
                spacebreak = true;
                break;
              }
            }
          }
          if (!spacebreak) {
            // Replace with non breaking space.
            const format = this.getQuill(id).getFormat(array.index, 1);
            this.getQuill(id).deleteText(array.index, 1);
            this.getQuill(id).insertText(array.index, '\xa0', format);
          } else {
            // Replace with breaking space.
            const format = this.getQuill(id).getFormat(array.index, 1);
            this.getQuill(id).deleteText(array.index, 1);
            this.getQuill(id).insertText(array.index, ' ', format);
          }
        }
        break;
      }
      default: break;
    }
  }

  /**
   * Restore the selection to what it was last.
   */
  restoreSelection () {
    this.select(this.lastSelection.block, this.lastSelection.subBlock, this.lastSelection.range.index, this.lastSelection.range.length);
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
          this.removeBlockAt(id, { focusID: id - 1 });
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
      let pictureLeftChanged = oldFormat.pictureLeft !== this.format.pictureLeft;
      let pictureRightChanged = oldFormat.pictureRight !== this.format.pictureRight
      if (boldChanged || titleChanged || listChanged || frameChanged || colorChanged || pictureLeftChanged || pictureRightChanged) {
        this.dispatchCurrentFormatChanged(this.format);
      }
    }
  }

  getBlockFormat (blockIndex) {
    let format = {};
    format.frame = $('#blc-' + blockIndex).hasClass('frame');
    format.blockType = $('#blc-' + blockIndex).hasClass('text-block') ? 'default' :
      ($('#blc-' + blockIndex).hasClass('image-block') ? 'images' :
        ($('#blc-' + blockIndex).hasClass('letter-block') ? 'letter' : 'unknown')
      );
    format.pictureLeft = $('#img-' + blockIndex + '-0').parent().is(':visible');
    format.pictureRight = $('#img-' + blockIndex + '-1').parent().is(':visible');
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

    let format = this.getBlockFormat(selection.block);
    let quillFormat = this.getQuill(selection.block, selection.subBlock).getFormat(selection.index, selection.length);

    format.bold = Utils.isNullOrUndefined(quillFormat.bold) ? false : quillFormat.bold;
    format.list = Utils.isNullOrUndefined(quillFormat.list) ? false : quillFormat.list;
    format.indent = Utils.isNullOrUndefined(quillFormat.indent) ? 0 : quillFormat.indent;
    format.title = Utils.isNullOrUndefined(quillFormat.header) ? 'none' : (quillFormat.header === false ? 'none' : 'h' + quillFormat.header);
    format.color = Utils.isNullOrUndefined(quillFormat.color) ? '#000000' : quillFormat.color;
    format.wrap = Utils.isNullOrUndefined(quillFormat.wrap) ? 'normal' : quillFormat.wrap;

    return format;
  }

  /**
   * Clear all blocks of the document.
   * @param {boolean} fullclear - Whether to clear the document completely (true) or to reset it to a new document (false).
   */
  clear (fullClear = false) {
    $('.editor-block').remove();
    if (!fullClear) this.addBlock('', true);
    this.setTheme(null);
  }

  /**
   * Create the instance of quill in the element with the given selector.
   * @param {String} selector - Selector to get the element. The first matching element will be chosen.
   */
  createQuill (selector, placeholder = 'Tapez le texte ici...') {
    let element = $(selector)[0];
    let options = {
      formats: ['align', 'bold', 'list', 'header', 'color', 'wrap'],
      modules: {
        toolbar: false,
        keyboard: {
          bindings: this.bindings
        }
      },
      placeholder: placeholder,
      theme: 'snow'
    };
    element.quill = new Quill(element, options);
    element.quill.on('selection-change', (range, oldRange, source) => {
      console.log(oldRange);
      if (range === null && oldRange !== null && !this.hasFocus) {
        const split = element.id.split('-');
        let blockID = Number(split[1]);
        let subID;
        if (split.length > 2) {
          subID = Number(split[2]);
        }
        this.lastBlock = blockID;
        this.lastSelection = {block: blockID, subBlock: subID, range: oldRange};
        this.dispatchFocusLost(this.lastSelection);
      }
    });
  }

  /**
   * Splits a text block into two at the given index.
   * @param {int} id - The id of the block to split.
   * @param {int} index - The index where to do the split.
   */
  splitBlock (id, index) {
    let d1 = this.getQuill(id).getContents(0, index);
    let d2 = this.getQuill(id).getContents(index);
    let copiedFormat = false;
    for (let i = 0; i < d2.ops.length; i++) {
      if (d2.ops[i].insert === '\n') {
        d1.ops.push(d2.ops[i]);
        copiedFormat = true;
      }
    }
    if (!copiedFormat) {
      d1.ops.push({insert: '\n'});
    }
    let l = this.getBlockLength(id) - index;
    this.insertBlockAfter(id, '');
    this.getQuill(id + 1).setContents(d2);
    this.getQuill(id).setContents(d1);
  }

  /**
   * Merge two text blocks together into one.
   * @param {int} first - Text block which will be on top.
   * @param {int} last - Text block which will be at the bottom.
   */
  mergeBlocks (first, last, duration) {
    let d2 = this.getQuill(last).getContents();
    let d1 = this.getQuill(first).getContents();
    let dr = d1;
    let lastOp = dr.ops[dr.ops.length - 1];
    if (lastOp.insert.lastIndexOf('\n') === 0) {
      dr.ops.splice(-1, 1);
    } else {
      lastOp.insert = lastOp.insert.substring(0, lastOp.insert.length - 1);
    }
    dr.ops = dr.ops.concat(d2.ops);
    this.getQuill(first).setContents(dr);
    this.removeBlockAt(last, { focusID: first, duration: duration });
  }

  /**
   * Remove the block with the given ID and switch focus to a new id.
   * @param {int} id - ID of the block to remove.
   * @param {Object} options - Options.
   */
  removeBlockAt (id, options = { focusID: id + 1, duration: 250, instant: false }) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);
    if (Utils.isNullOrUndefined(options.focusID)) options.focusID = id + 1;
    if (Utils.isNullOrUndefined(options.duration)) options.duration = 250;
    if (Utils.isNullOrUndefined(options.instant)) options.false = 250;
    if (id === options.focusID) throw new Error('Option "focusID" cannot be the same as param "id". You cannot focus the block you are removing.');

    if (!this.dispatchBlockDestroyEvent(id).defaultPrevented) {
      if (id === 0 && this.blockCount === 1) {
        // There is only one block. Clear it instead of removing it.
        $('#txt-0').empty();
        this.setImage('#img-0', 'img/placeholder.png');
        try {
          this.select(0, null, 0, 0);
        } catch (ex) {
          console.error('Cannot select block 0.');
        }
      } else {
        // There will be at least one block remaining.
        let element = $('#blc-' + id)[0];
        if (typeof (options.focusID) === 'number') {
          try {
            this.select(options.focusID, options.focusSubID, 0, 0);
          } catch (ex) {
            console.error(`Cannot select block ${options.focusID} with subBlock ${options.focusSubID}.`);
          }
        }
        if (options.instant) {
          $(element).remove();
          this.refreshAllBlockID();
          this.dispatchBlockDestroyedEvent(id);
        } else {
          Animator.collapse(element, options.duration, () => {
            $(element).remove();
            this.refreshAllBlockID();
            this.dispatchBlockDestroyedEvent(id);
          });
        }
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
    this.createQuill('#txt-' + (index + 1));
    if (focus) {
      this.select(index + 1, null, 0, 0);
    }
    this.setImage('#img-' + (index + 1) + '-0', 'img/placeholder.png');
    this.setImage('#img-' + (index + 1) + '-1', 'img/placeholder.png');
    this.hideBlockImage(index + 1, 0);
    this.hideBlockImage(index + 1, 1);
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
    this.setImage('#img-' + (index + 1) + '-0', 'img/placeholder.png');
    this.createQuill('#txt-' + (index + 1) + '-0', 'Tapez la légende ici...');
    if (focus) {
      this.select(index + 1, 0, 0, 0);
    }
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
    this.createQuill('#txt-' + index);
    if (focus) {
      this.select(index, null, 0, 0);
    }
    this.setImage('#img-' + (index) + '-0', 'img/placeholder.png');
    this.setImage('#img-' + (index) + '-1', 'img/placeholder.png');
    this.hideBlockImage(index, 0);
    this.hideBlockImage(index, 1);
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
    this.setImage('#img-' + (index) + '-0', 'img/placeholder.png');
    this.createQuill('#txt-' + index + '-0', 'Tapez la légende ici...');
    if (focus) {
      this.select(index, 0, 0, 0);
    }
    this.dispatchBlockCreatedEvent(index);
  }

  /**
   * Insert a block just above the block with the given index.
   * @param {int} index - ID of the block that the new block should precede.
   * @param {boolean} focus - Whether the new block should be focused.
   */
  insertLetterHeaderBlockBefore (index, focus) {
    if (typeof (index) !== 'number') throw new Error(`Param "index" should be a number but was ${typeof (index)}!`);

    $('#blc-' + index).before(this.newLetterHeaderBlockString(index));
    this.refreshAllBlockID();
    this.createQuill('#txt-' + index +'-0');
    this.createQuill('#txt-' + index +'-1');
    const l = this.getQuill(index, 1).getLength();
    this.getQuill(index, 1).formatText(0, l, {'align': 'right'});
    if (focus) {
      this.select(index, null, 0, 0);
    }
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
    this.createQuill('#txt-' + id);
    if (focus) {
      this.select(id, null, 0, 0);
    }
    this.setImage('#img-' + id + '-0', 'img/placeholder.png');
    this.setImage('#img-' + id + '-1', 'img/placeholder.png');
    this.hideBlockImage(id, 0);
    this.hideBlockImage(id, 1);
    this.dispatchBlockCreatedEvent(id);
  }

  /**
   * Add an image block at the end of the editor.
   */
  addImageBlock () {
    let id = this.blockCount;
    $(this.id).append(this.newImageBlockString(id));
    this.setImage('#img-' + id + '-0', 'img/placeholder.png');
    this.createQuill('#txt-' + id + '-0', 'Tapez la légende ici...');
    this.dispatchBlockCreatedEvent(id);
  }

  /**
   * Add a letter header block.
   */
  addLetterHeaderBlock () {
    let id = this.blockCount;
    $(this.id).append(this.newLetterHeaderBlockString(id));
    this.createQuill('#txt-' + id +'-0');
    this.createQuill('#txt-' + id +'-1');
    const l = this.getQuill(id, 1).getLength();
    this.getQuill(id, 1).formatText(0, l, {'align': 'right'});
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
      this.createQuill('#txt-' + blockID + '-' + (imgID), 'Tapez la légende ici...');
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
      this.createQuill('#txt-' + blockID + '-' + (imgID + 1), 'Tapez la légende ici...');
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
      this.createQuill('#txt-' + id + '-' + (lastImg + 1), 'Tapez la légende ici...');
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
    if ($('#blc-' + id).hasClass('text-block')) {
      return 2;
    } else {
      return $('#blc-' + id).children('.row').children('.col').length;
    }
  }

  /**
   * Get the text content of the block with the given id.
   * @param {int} id - ID of the block to extract text from.
   * @param {int} subBlockID - ID of the sub block.
   * @return {string} The extracted text.
   */
  getRawTextContent (id, subBlockID) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);
    if (this.getBlockFormat(id).blockType !== 'default') return '';
    return this.getQuill(id, subBlockID).getText();
  }

  /**
   * Get the Quill Delta of the block with the given id.
   * @param {int} id - ID of the block to get the delta of.
   * @param {int} subBlockID - ID of the sub block.
   * @return {JSONObject} The delta.
   */
  getDelta (id, subBlockID) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);
    return this.getQuill(id, subBlockID).getContents();
  }

  /**
   * Get the Styled text of the block with the given id.
   * @param {int} id - ID of the block to get the Styled text from.
   * @param {int} subBlockID - ID of the sub block.
   * @return {JSONObject} The styled text.
   */
  getStyledText (id, subBlockID) {
    if (typeof (id) !== 'number') throw new Error(`Param "id" should be a number but was ${typeof (id)}!`);
    if (Utils.isNullOrUndefined(this.getQuill(id, subBlockID))) return [];
    let delta = this.getQuill(id, subBlockID).getContents();
    let result = [];
    for (let i = 0; i < delta.ops.length; i++) {
      let item = delta.ops[i];
      if (Utils.isNullOrUndefined(item.attributes)) {
        let split = item.insert.split('\n');
        for (let s = 0; s < split.length; s++) {
          if (s > 0) {
            result.push('\n');
          }
          if (split[s] !== '') result.push(split[s]);
        }
      } else {
        if (item.insert === '\n') {
          result.push('\n');
          if (!Utils.isNullOrUndefined(item.attributes.header)) {
            let j = result.length - 2;
            while (j >= 0 && result[j] !== '\n') {
              if (Utils.isNullOrUndefined(result[j].text)) {
                result[j] = { text: result[j], style: 'h' + item.attributes.header };
              } else {
                result[j].style = 'h' + item.attributes.header;
              }
              j--;
            }
          }
          if (!Utils.isNullOrUndefined(item.attributes.list)) {
            let j = result.length - 2;
            while (j >= 0 && result[j] !== '\n') {
              if (Utils.isNullOrUndefined(result[j].text)) {
                result[j] = { text: result[j], list: item.attributes.list };
              } else {
                result[j].list = item.attributes.list;
              }
              j--;
            }
          }
        } else {
          let split = item.insert.split('\n');
          for (let s = 0; s < split.length; s++) {
            if (s > 0) {
              result.push('\n');
            }
            if (split[s] !== '') result.push({ text: split[s], bold: item.attributes.bold, color: item.attributes.color });
          }
        }
      }
    }

    // collapse lines
    const result2 = [];
    let merging = false;
    for (let i = 0; i < result.length; i++) {
      if (i + 1 < result.length && result[i] !== '\n' && result[i + 1] !== '\n' && merging === false) {
        merging = true;
        result2.push({ text: [result[i]], list: result[i].list });
      } else if (result[i] === '\n') {
        result2.push('\n');
        merging = false;
      } else if (merging === true) {
        result2[result2.length - 1].text.push(result[i]);
      } else {
        result2.push(result[i]);
      }
    }

    // list pass
    const result3 = [];
    let inBulletList = false;
    let inOrderedList = false;
    for (let i = 0; i < result2.length; i++) {
      if ((!inBulletList && result2[i].list === 'bullet') || (!inOrderedList && result2[i].list === 'ordered')) {
        if (result2[i].list === 'bullet') {
          result2[i].list = undefined;
          result3.push({ ul: [result2[i]], margin: [1.5 * Utils.pointToPixel(14), 0, 0, 0] });
          inBulletList = true;
          inOrderedList = false;
        } else {
          result2[i].list = undefined;
          result3.push({ ol: [result2[i]], margin: [1.5 * Utils.pointToPixel(14), 0, 0, 0] });
          inOrderedList = true;
          inBulletList = false;
        }
      } else if ((inBulletList && result2[i].list === 'bullet') || (inOrderedList && result2[i].list === 'ordered')) {
        if (result2[i].list === 'bullet') {
          result2[i].list = undefined;
          result3[result3.length - 1].ul.push(result2[i]);
        } else {
          result2[i].list = undefined;
          result3[result3.length - 1].ol.push(result2[i]);
        }
      } else if (result2[i].list !== 'bullet' && result2[i].list !== 'ordered' && result2[i] !== '\n') {
        inBulletList = false;
        inOrderedList = false;
        result3.push(result2[i]);
      } else if (!inBulletList && !inOrderedList) {
        //result3.push(result2[i]);
      }
    }

    console.log(result3);
    /*let fresult = [];
    let inOrderedList = false;
    let inBulletList = false;
    lastIndex = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i].list === 'bullet') {
        if (inBulletList) {
          fresult[lastIndex].push(result[i]);
        }
      }
    }*/

    return result3;
  }

  /**
   * Get the length of the text content of the block with the given id.
   * @param {Number} id - ID of the block.
   * @param {Number} subBlockID - ID of the sub block.
   * @return {Number} The number of characters in this block.
   */
  getBlockLength (id, subBlockID) {
    return this.getRawTextContent(id, subBlockID).length;
  }

  /**
   * Get a HTML string to initialize a block.
   * @param {int} id - ID of the new block.
   * @param {string} text - Text the new block should be initialized with.
   * @return {string} HTML string of the new block.
   */
  newBlockString (id, text) {
    return `<div id="blc-${id}" class="editor-block text-block" style="font-size: 14pt;">` +
             `<div class="editor-image-container left-image" style="width:100px">` +
                `<img id="img-${id}-0" class="editor-image align-self-center hoverable"/>` +
             `</div>` +
             `<div id="txt-${id}" class="editor-text align-self-center">` +
                `<div>${text}</div>` +
             `</div>` +
             `<div class="editor-image-container right-image" style="width:100px">` +
                `<img id="img-${id}-1" class="editor-image align-self-center hoverable"/>` +
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
      `<div id="txt-${id}-${imgID}" class="editor-text align-self-center" style="width: auto;"></div>` +
    `</div>`;
  }

  /**
   * Get a HTML string to initialize a letter header block.
   * @param {int} id - Id of the block.
   * @return {string} HTML string of the new letter header block.
   */
  newLetterHeaderBlockString (id) {
    return `<div id="blc-${id}" class="editor-block letter-block">` +
      `<div id="txt-${id}-0" class="editor-text letter-left align-self-center">` +
        `<div>Nom Prénom</div>` +
        `<div>Adresse</div>` +
        `<div>Téléphone</div>` +
      `</div>` +
      `<div id="txt-${id}-1" class="editor-text letter-right align-self-center">` +
        `<div>Nom Prénom</div>` +
        `<div>Adresse</div>` +
        `<div>Téléphone</div>` +
      `</div>` +
    `</div>`
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
    $('#img-' + oldID + '-0').attr('id', 'img-' + newID + '-0');
    $('#img-' + oldID + '-1').attr('id', 'img-' + newID + '-1');
  }

  /**
   * Refresh all the IDs of the blocks in the editor.
   */
  refreshAllBlockID () {
    $('.editor-block').each(function (index) {
      $(this).attr('id', 'blc-' + index);
      if ($(this).hasClass('text-block')) {
        $(this).find('.editor-text').attr('id', 'txt-' + index);
        $(this).find('.left-image .editor-image').attr('id', 'img-' + index + '-0');
        $(this).find('.right-image .editor-image').attr('id', 'img-' + index + '-1');
      } else if ($(this).hasClass('image-block')) {
        $(this).find('.editor-text').each(function (subIndex) {
          $(this).attr('id', 'txt-' + index + '-' + subIndex);
        });
        $(this).find('.editor-image').each(function (subIndex) {
          $(this).attr('id', 'img-' + index + '-' + subIndex);
        });
      } else if ($(this).hasClass('letter-block')) {
        $(this).find('.editor-text').each(function (subIndex) {
          $(this).attr('id', 'txt-' + index + '-' + subIndex);
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
    if (!Utils.isNullOrUndefined(currentSelection)) {
      let quill = this.getQuill(currentSelection.block, currentSelection.subBlock);
      let currentFormat = quill.getFormat();
      let bold = currentFormat.bold;
      let list = currentFormat.list;
      let title = currentFormat.title;
      let color = currentFormat.color;
      let wrap = currentFormat.wrap;
      let indent = currentFormat.indent;
      if (typeof (format.title) !== 'undefined' && title !== format.title) {
        let t = format.title;
        if (t === 'none') t = null;
        quill.format('header', t);
      }
      if (typeof (format.bold) !== 'undefined' && format.bold !== bold) {
        quill.format('bold', format.bold);
      }
      if (typeof (format.list) !== 'undefined' && format.list !== list) {
        quill.format('list', format.list);
      }
      if (typeof (format.indent) !== 'undefined' && format.indent !== indent) {
        quill.format('indent', format.indent);
      }
      if (typeof (format.color) !== 'undefined' && format.color !== color) {
        quill.format('color', format.color);
      }
      if (typeof (format.wrap) !== 'undefined' && format.wrap !== wrap) {
        let w = format.wrap === 'normal' ? null : format.wrap;
        quill.format('wrap', w);
      }
      this.setBlockFormat(currentSelection.block, format);
    } else {
      console.error("There was no selection. Can't set format at selection.")
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
    let lp = Utils.isNullOrUndefined(format.pictureLeft) ? format.pictureL : format.pictureLeft;
    let leftPicture = oldFormat.pictureLeft;
    let rp = Utils.isNullOrUndefined(format.pictureRight) ? format.picture : format.pictureRight;
    let rightPicture = oldFormat.pictureRight;
    if (!Utils.isNullOrUndefined(format.frame) && format.frame !== frame) {
      this.setBlockFrameVisibility(blockID, format.frame);
    }
    if (!Utils.isNullOrUndefined(rp) && rp !== rightPicture) {
      this.setBlockImageVisibility(blockID, rp, 1);
    }
    if (!Utils.isNullOrUndefined(lp) && lp !== leftPicture) {
      this.setBlockImageVisibility(blockID, lp, 0);
    }
    this.updateFormat();
  }

  /**
   * Hide the image associated to the given blockID.
   * @param {int} blockID - The index of the block containing the image.
   * @param {int} imageID - The id of the image. 0 For left, 1 for right.
   */
  hideBlockImage (blockID, imageID) {
    $('#img-' + blockID + '-' + imageID).parent().hide();
  }

  /**
   * Show the image associated to the given blockID.
   * @param {int} blockID - The index of the block containing the image.
   * @param {int} imageID - The id of the image. 0 For left, 1 for right.
   */
  showBlockImage (blockID, imageID) {
    $('#img-' + blockID + '-' + imageID).parent().show();
  }

  /**
   * Set the visibility of the image associated to the given blockID.
   * @param {int} blockID - The index of the block containing the image.
   * @param {boolean} visibility - The visibility of the image.
   * @param {int} imageID - The id of the image. 0 For left, 1 for right.
   */
  setBlockImageVisibility (blockID, visibility, imageID) {
    if (visibility) this.showBlockImage(blockID, imageID);
    else this.hideBlockImage(blockID, imageID);
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
    //if (src === '') src = './img/placeholder.png';
    if (src === '') {
      this.hideBlockImage(Number(selector.split('-')[1], Number(selector.split('-')[2])));
      return;
    }
    if ($(selector).length === 0) throw new Error(`There is no element matching selector "${selector}"`);
    if ($('.text-block ' + selector).length > 0) {
      requestedWidth = 100;
    }
    if (Utils.containsEncodedComponents(src)) src = decodeURIComponent(src);
    //console.log(src);
    if (src.match(/^https?:\/\//)) {
      let res = src.match(/image_proxy\.php\?url=(https?:\/\/.+$)/);
      if (res) {
        // For when we're moving an image already within the editor.
        src = './image_proxy.php?url=' + encodeURIComponent(res[1]);
      } else {
        // Ensure cross domain images are displayed.
        src = './image_proxy.php?url=' + encodeURIComponent(src);
      }
    }
    var img = $(selector)[0];
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      if (typeof (requestedWidth) !== 'number') {
        requestedWidth = img.naturalWidth;
      }
      try {
        let canvas = this.hiddenCanvas;
        let scale = img.naturalWidth / requestedWidth;
        canvas.width = img.naturalWidth / scale;
        canvas.height = img.naturalHeight / scale;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.dataURL = canvas.toDataURL('image/png');
      } catch (ex) {
        alert("Erreur lors chargement de l'image. Elle ne sera pas exporté.")
        setTimeout(() => {
          img.src = 'img/placeholder.png';
        }, 1);
      }
      // var dataURL = canvas.toDataURL("image/png");
      // console.log(dataURL);
      // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
      this.dispatchImageLoaded(Number(selector.split('-')[1]));
    };
    img.onerror = (e) => {
      alert("Erreur lors du chargement de l'image." + e);
      setTimeout(() => {
        img.src = 'img/placeholder.png';
      }, 1);
      this.dispatchImageLoaded(Number(selector.split('-')[1]));
    };
    img.src = src;
    this.showBlockImage(Number(selector.split('-')[1]), Number(selector.split('-')[2]));
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

  setTextAtSelection (text) {
    if (!this.hasFocus) {
      this.focus();
    }
    const s = this.getSelection();
    this.setTextAt(s.block, s.range.index, s.range.length, text);
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
    this.select(this.savedSelection.block, this.savedSelection.subBlock, this.savedSelection.index, this.savedSelection.length);
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
   * @param {int} subIndex - Index of the sub-block.
   * @param {int} startIndex - Start index of the selection.
   * @param {int} length - (optional) length of the selection;
   */
  select (blockIndex, subIndex, startIndex, length = 0) {
    this.getQuill(blockIndex, subIndex).setSelection(startIndex, length);
  }

  /**
   * Select the first occurence of the given text.
   * @param {string} text - Text to search for.
   * @param {boolean} word - Whether to look for words or any string.
   */
  selectFirst (text, word = false) {
    let offset = -1;
    const patt = new RegExp('(?:^|[^a-zA-Z0-9éèêîïû])(' + text + ')(?:[^a-zA-Z0-9éèêîïû]|$)');
    for (let i = 0; i < this.blockCount; i++) {
      switch (this.getBlockFormat(i).blockType) {
        case 'default': {
          const matches = this.getQuill(i).getText().match(patt);
          if (matches != null) {
            offset = matches.index;
            offset += matches[0].search(matches[1]);
            this.select(i, null, offset, text.length);
            return;
          }
          break;
        } case 'images':
          for (let j = 0; j < this.getImageCountInBlock(i); j++) {
            const matches = this.getQuill(i, j).getText().match(patt);
            if (matches != null) {
              offset = matches.index;
              offset += matches[0].search(matches[1]);
              this.select(i, j, offset, text.length);
            }
          }
      }
    }
  }

  /**
   * Select the next occurence of the given pattern.
   * @param {RegExp} pattern - Pattern to search for.
   * @param {int} startBlock - (Optional) The block id to start searching in.
   * @param {int} startSubBlock - (Optional) The sub block id to start searching in.
   * @param {int} startIndex - (Optional) The index to start searching from.
   * @param {boolean} loop - (Optional) If the search should loop back to the start.
   */
  selectNextMatch (pattern, startBlock = null, startSubBlock = null, startIndex = null, loop = true) {
    let sel = this.getSelection();
    startBlock = startBlock == null ? (this.hasFocus ? sel.block : 0) : startBlock;
    startSubBlock = startSubBlock == null ? (this.hasFocus ? sel.subBlock : 0) : startSubBlock;
    startIndex = startIndex == null ? (this.hasFocus ? sel.range.index + sel.range.length : 0) : startIndex;
    let offset = -1;
    for (let i = startBlock; i < this.blockCount; i++) {
      if (this.getBlockFormat(i).blockType === 'default') {
        startSubBlock = 0;
        let index = i === startBlock ? startIndex : 0;
        pattern.lastIndex = index;
        let matches = pattern.exec(this.getRawTextContent(i));
        if (matches != null) {
          offset = matches.index;
          this.select(i, null, offset, matches[0].length);
          return;
        }
      } else if (this.getBlockFormat(i).blockType === 'images') {
        for (let j = startSubBlock; j < this.getImageCountInBlock(i); j++) {
          startSubBlock = 0;
          let index = i === startBlock ? (j === startSubBlock ? startIndex : 0) : 0;
          pattern.lastIndex = index;
          let matches = pattern.exec(this.getRawTextContent(i, j));
          if (matches != null) {
            offset = matches.index;
            this.select(i, j, offset, matches[0].length);
            return;
          }
        }
      }
    }
    if (loop && (startBlock !== 0 || startIndex !== 0)) this.selectNextMatch(pattern, 0, 0, 0, false);
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
      blocks: [],
      theme: this.theme
    };
    for (let i = 0; i < this.blockCount; i++) {
      let format = this.getBlockFormat(i);
      switch (format.blockType) {
        case 'default':
          object.blocks.push({
            type: 'default',
            content: this.getQuill(i).getContents(),
            images: [this.getImageElement(i, 0).dataURL, this.getImageElement(i, 1).dataURL],
            options: {
              leftPicture: format.pictureLeft,
              rightPicture: format.pictureRight,
              frame: format.frame
            }
          });
          break;
        case 'images':
          let imagesCount = this.getImageCountInBlock(i);
          let images = [];
          for (let img = 0; img < imagesCount; img++) {
            images.push({image: $('#img-' + i + '-' + img)[0].dataURL, caption: this.getQuill(i, img).getContents()});
          }
          object.blocks.push({
            type: 'images',
            images: images,
            options: {}
          });
          break;
        case 'letter':
        object.blocks.push({
          type: 'letter',
          expeditor: this.getQuill(i, 0).getContents(),
          recipient: this.getQuill(i,1).getContents()
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

    this.clear(true);

    for (let i = 0; i < json.blocks.length; i++) {
      switch (json.blocks[i].type) {
        case 'default':
          this.addBlock();
          if (json.meta.version < 2) {
            this.getQuill(i).clipboard.dangerouslyPasteHTML(json.blocks[i].content);
          } else {
            this.getQuill(i).setContents(json.blocks[i].content);
          }
          setTimeout(() => {
            if (json.meta.version < 3) {
              this.setImage('#img-' + i + '-1', json.blocks[i].image);
            } else {
              this.setImage('#img-' + i + '-0', json.blocks[i].images[0]);
              this.setImage('#img-' + i + '-1', json.blocks[i].images[1]);
            }
            if (json.meta.version >= 1) {
              this.setBlockFormat(i, {
                frame: json.blocks[i].options.frame,
                pictureRight: json.blocks[i].options.rightPicture,
                pictureLeft: json.blocks[i].options.leftPicture
              });
            }
          }, 250);
          break;
        case 'images':
          this.addImageBlock();
          for (let img = 0; img < json.blocks[i].images.length; img++) {
            if (img > 0) {
              this.addImageInBlock(i);
            }
            if (json.meta.version < 4) {
              this.getQuill(i, img).clipboard.dangerouslyPasteHTML(json.blocks[i].images[img].text);
            } else {
              this.getQuill(i, img).setContents(json.blocks[i].images[img].caption);
            }
            setTimeout(() => {
              this.setImage('#img-' + i + '-' + img, json.blocks[i].images[img].image);
            }, 250);
          }
          break;
        case 'letter':
          this.addLetterHeaderBlock();
          this.getQuill(i, 0).setContents(json.blocks[i].expeditor);
          this.getQuill(i, 1).setContents(json.blocks[i].recipient);
          break;
      }
    }
    if (!Utils.isNullOrUndefined(json.theme)) {
      this.setTheme(json.theme);
    }
  }

  /**
   * Import a compatible file into the editor, replacing the current contents in the process.
   * @param {string} path - Path of the file to import.
   */
  import (path) {
    let splitPath = path.split('.');
    let extension = splitPath[splitPath.length - 1];
    switch (extension) {
      case 'docx':
        alert("Il n'est pas encore possible d'importer des documents DOCX."); break;
      case 'odt':
        alert("Il n'est pas encore possible d'importer des documents ODT."); break;
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
   * Set the theme for the document.
   * @param {Object} theme - The description of the theme, or null.
   */
  setTheme (theme) {
    if (Utils.isNullOrUndefined(theme)) theme = this.defaultTheme;
    for (const level of ['h1', 'h2', 'h3', 'h4', 'default', 'frame', 'page']) {
      if (Utils.isNullOrUndefined(theme[level])) {
        theme[level] = this.defaultTheme[level];
        console.log('No theme information found for ' + level + '. Filling in with default theme.');
      }
    }
    this.theme = theme;
    let style = '';
    if ($(this.id + ' style').length > 0) {
      $(this.id + ' style').remove();
    }
    style += this.toCSS('h1', theme.h1);
    style += this.toCSS('h2', theme.h2);
    style += this.toCSS('h3', theme.h3);
    style += this.toCSS('h4', theme.h4);
    style += this.toCSS('p', theme.default);
    style += this.toCSS('', theme.default);
    style += this.toCSS('.frame', theme.frame);
    style += this.toCSS('', theme.page);
    $(`<style>${style}</style>`).appendTo(this.id);
  }

  toCSS (selector, object) {
    if (Utils.isNullOrUndefined(object)) return '';
    let css = this.id + ' ' + selector + ' {';
    for (const k of Object.keys(object)) {
      css += k + ': ' + object[k] + ';';
    }
    css += '}';
    return css;
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

  /**
   * Send an event telling that the editor has lost focus.
   * @param {object} lastSelection - The last selection of the editor.
   */
  dispatchFocusLost (lastSelection) {
    let e = new CustomEvent('focuslost', {
      detail: {
        lastSelection: lastSelection
      },
      bubbles: false,
      cancelable: false
    });
    console.log(e);
    $(this.id).get(0).dispatchEvent(e);
  }
}
