/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "Converter" }] */
/* global $ */
/* global JSZip */
/* global Utils */
/* global pdfMake */

class Converter {
  /**
   * Fills the editor with the content of the given string, clearing any
   * previous content.
   * @param {Editor} editor - The editor to put the content into.
   * @param {string} string - The string content to insert.
   */
  static fromTxt (editor, string) {
    editor.clear();
    const lines = string.split('\n');
    let currentBlockContent = '';
    let blockId = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '') {
        if (blockId === 0) {
          editor.setTextAt(0, 0, 0, currentBlockContent);
        } else {
          editor.addBlock(currentBlockContent);
        }
        blockId++;
        currentBlockContent = '';
      } else {
        currentBlockContent += currentBlockContent === '' ? lines[i] : '\n' + lines[i];
      }
    }
  }

  /**
   * Create the TXT string from the content of the given editor.
   * @param {Editor} editor - The editor to draw the content from.
   * @return {string} The resulting text string.
   */
  static async toTxt (editor) {
    let result = "";
    for (let i = 0; i < editor.blockCount; i++) {
      let blockFormat = editor.getBlockFormat(i);
      switch (blockFormat.blockType) {
        case 'default':
          result += editor.getRawTextContent(i);
          break;
        case 'images':
          result += "[Les blocs images ne peuvent pas être exportés en fichiers texte]\n";
          break;
      }
      result += "\n";
    }
    return result;
  }

  /**
   * Create the HTML code from the content of the given editor.
   * @param {Editor} editor - The editor to draw the content from.
   * @return {string} The resulting HTML string.
   */
  static async toHtml (editor) {
    function times (string, times) {
      let result = '';
      for (let i = 0; i < times; i++) {
        result += string;
      }
      return result;
    }

    let blocks = '';
    for (let i = 0; i < editor.blockCount; i++) {
      let blockFormat = editor.getBlockFormat(i);
      let blockClasses = blockFormat.blockType + '-block' + (blockFormat.frame ? ' frame' : '');
      let blockStyle = '';
      let content = '';
      switch (blockFormat.blockType) {
        case 'default':
          if (blockFormat.pictureRight && blockFormat.pictureLeft) {
            content += `<div class="leftpicture"><img src="${editor.getImageElement(i, 0).dataURL}"></img></div>`;
            content += `<div class="middletext">${editor.getTextElement(i).children[0].innerHTML}</div>`;
            content += `<div class="rightpicture"><img src="${editor.getImageElement(i, 1).dataURL}"></img></div>`;
          } else if (!blockFormat.pictureRight && blockFormat.pictureLeft) {
            content += `<div class="leftpicture"><img src="${editor.getImageElement(i, 0).dataURL}"></img></div>`;
            content += `<div class="righttext">${editor.getTextElement(i).children[0].innerHTML}</div>`;
          } else if (blockFormat.pictureRight && !blockFormat.pictureLeft) {
            content += `<div class="lefttext">${editor.getTextElement(i).children[0].innerHTML}</div>`;
            content += `<div class="rightpicture"><img src="${editor.getImageElement(i, 1).dataURL}"></img></div>`;
          } else {
            content = `<div class="fulltext">${editor.getTextElement(i).children[0].innerHTML}</div>`;
          }
          break;
        case 'images':
          for (let c = 0; c < editor.getImageCountInBlock(i); c++) {
            content += `<div><img class="image" src="${editor.getImageElement(i, c).dataURL}"></img></div><div>${editor.getTextElement(i, c).children[0].innerHTML}</div>`;
          }
          blockStyle = 'grid-template-columns:' + times(' 1fr', editor.getImageCountInBlock(i)) + ';';
          break;
      }
      blocks += `<div class="${blockClasses}" style="${blockStyle}">${content}</div>`;
    }
    let style = '.lirec-container {font-size: 14pt; font-family: Arial; max-width: 600px; margin: auto;}';
    style += '.default-block {display: grid; grid-template-columns: 100px 1fr 100px; margin-bottom: 1em; margin-top: 1em;}';
    style += '.images-block {display: grid;}';
    style += '.frame {border: 4pt solid black; border-thickness: 4pt}';
    style += '.fulltext {grid-column: 1 / span 3;}';
    style += '.lefttext {grid-column: 1 / span 2; align-self: center;}';
    style += '.righttext {grid-column: 2 / span 2; align-self: center;}';
    style += '.middletext {grid-column: 2 / span 1; align-self: center;}';
    style += '.leftpicture {grid-column: 1 / span 1; width: 100px; align-self: center;}';
    style += '.rightpicture {grid-column: 3 / span 1; width: 100px; align-self: center;}';
    style += '.image {display: block; max-width: 100%; height: auto; margin: auto;}';
    style += '.ql-wrap-nowrap {white-space: nowrap; display: inline-block;}'
    style += 'p {margin: 0;}';
    style += 'h1 {text-align: center;}'
    style += 'h2,h3,h4,h5 {margin: 0;}';
    let styleContainer = `<style type="text/css">${style}</style>`;
    let container = `<html><head><meta http-equiv="content-type" content="text/html charset=utf-8" />${styleContainer}</head><body><div class="lirec-container">${blocks}</div></body></html>`;
    return container;
  }

  /**
   * Create a PDF document from the content of the given editor.
   * @param {Editor} editor - The editor to draw the content from.
   * @return {makePdfDocument} The resulting pdf.
   */
  static async toPdf (editor) {
    let margin = 72;
    let docDefinition = {
      content: [],
      pageSize: 'A4',
      styles: editor.styles,
      defaultStyle: editor.defaultStyle,
      footer: function (currentPage, pageCount) {
        if (pageCount > 1) return { text: 'Page ' + currentPage.toString() + ' sur ' + pageCount, alignment: 'right', margin: [0, 0, margin, 0] };
        else return '';
      },
      pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        return false;
      },
      pageMargins: [margin, margin, margin, margin] // 96 = 1 inch
    };
    let contentLength = 1300 - docDefinition.pageMargins[1] - docDefinition.pageMargins[3];
    let bottomY = docDefinition.pageMargins[1];
    for (let i = 0; i < editor.blockCount; i++) {
      let blockElement = editor.getBlockElement(i);
      let blockFormat = editor.getBlockFormat(i);
      let blockHeight = 0;
      blockHeight += Utils.pxToNumber($(blockElement).css("margin-top"));
      blockHeight += Utils.pxToNumber($(blockElement).css("height"));
      let blockDefinition = {
        layout: blockFormat.frame ? 'frame' : 'noBorders',
        margin: [0, 4]
      };
      console.log(blockHeight);
      if (bottomY + blockHeight > contentLength) {
        console.log("Pagebreak because Y (" + (bottomY+blockHeight) + ") would be greater than " + contentLength);
        blockDefinition.pageBreak = 'before';
        bottomY = docDefinition.pageMargins[1] + blockHeight + Utils.pxToNumber($(blockElement).css("margin-bottom"));
      } else {
        bottomY += blockHeight + Utils.pxToNumber($(blockElement).css("margin-bottom"));
      }

      switch (blockFormat.blockType) {
        case 'default': {
          let content = [[]];
          if (blockFormat.pictureLeft) {
            content[0].push({
              image: editor.getImageElement(i, 0).dataURL,
              width: Utils.pixelToPoint(100),
              margin: [0, Utils.pixelToPoint(Utils.getRelativeOffset(editor.getImageElement(i, 0), blockElement).top), 0, 0]
            });
          }
          //console.log(editor.getStyledText(i));
          content[0].push({
            stack: editor.getStyledText(i),
            margin: [5, Utils.pixelToPoint(Utils.getRelativeOffset(editor.getTextElement(i), blockElement).top), 5, 1]
          });
          if (blockFormat.pictureRight) {
            content[0].push({
              image: editor.getImageElement(i, 1).dataURL,
              width: Utils.pixelToPoint(100),
              margin: [0, Utils.pixelToPoint(Utils.getRelativeOffset(editor.getImageElement(i, 1), blockElement).top), 0, 0]
            });
          }
          blockDefinition.table = {
            widths: blockFormat.pictureRight ? (blockFormat.pictureLeft ? ['auto', '*', 'auto'] : ['*', 'auto']) : (blockFormat.pictureLeft ? ['auto', '*'] : ['*']),
            body: content
          };
          break;
        }
        case 'images': {
          let imageCount = editor.getImageCountInBlock(i);
          let widths = [];
          let content = [[], []];
          for (let c = 0; c < imageCount; c++) {
            let img = editor.getImageElement(i, c);
            widths.push('*');
            content[0].push({
              image: img.dataURL,
              width: Utils.pixelToPoint($(img).width()),
              margin: [Utils.pixelToPoint(Utils.getRelativeOffset(img, editor.getTextElement(i, c)).left), 0, 0, 0]
            });
            content[1].push({ stack: editor.getStyledText(i, c), alignment: 'center' });
          }
          blockDefinition.table = {
            widths: widths,
            body: content
          };
          break;
        }
      }
      docDefinition.content.push(blockDefinition);
    }
    console.log(docDefinition);
    return pdfMake.createPdf(docDefinition, editor.tableLayouts);
  }

  /**
   * Create a DOCX file from the content of the given editor.
   * @param {Editor} editor - The editor to draw the content from.
   * @return {Blob} The resulting archive.
   */
  static async toDocx (editor) {
    simplesAlert("En chantier");
    let zip = new JSZip();
    let word = zip.folder('word');
    let props = zip.folder('docProps');
    let rels = zip.folder('_rels');
    word.folder('rels').file('document.rels.xml', '');
    word.folder('media');
    word.folder('theme').file('theme1.xml', '');
    word.file('document.xml', '');
    word.file('fontTable.xml', '');
    word.file('numbering.xml', '');
    word.file('settings.xml', '');
    word.file('styles.xml', '');
    word.file('webSettings.xml', '');
    props.file('app.xml', '');
    props.file('core.xml', '');
    props.file('custom.xml', '');
    rels.file('.rels', '');
    return zip.generateAsync({type: 'blob'});
  }

  /**
   * Create an ODT file from the content of the given editor.
   * @param {Editor} editor - The editor to draw the content from.
   * @return {Blob} The resulting archive.
   */
  static async toOdt (editor) {
    simplesAlert("En chantier");
    let templateData = await JSZipUtils.getBinaryContent('./converters/template.odt');
    let templateZip = await JSZip.loadAsync(templateData);

    let doc = document.implementation.createDocument('', '', null);

    function setAttributes (element, attributes) {
      for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
      }
    }
    function createTable (name, style) {
      let table = doc.createElement('table:table');
      setAttributes(table, {
        'table:name': name,
        'table:style-name': style
      });
      return table;
    }
    function createColumn (style) {
      let column = doc.createElement('table:table-column');
      setAttributes(column, {
        'table:style-name': style
      });
      return column;
    }
    function createRow () {
      return doc.createElement('table:table-row');
    }
    function createCell (style, valueType) {
      let cell = doc.createElement('table:table-cell');
      setAttributes(cell, {
        'table:style-name': style,
        'office:value-type': valueType
      });
      return cell;
    }
    function createParagraph (text) {
      let paragraph = doc.createElement('text:p');
      paragraph.setAttribute('text:style-name', 'P1');
      if (!Utils.isNullOrUndefined(text)) paragraph.innerHTML = text;
      return paragraph;
    }
    function createStyle (name, family, parentStyleName, properties) {
      let style = doc.createElement('style:style');
      setAttributes(style, {
        'style:name': name,
        'style:family': family,
        'style:parent-style-name': parentStyleName
      });
      let props = doc.createElement(`style:${family}-properties`);
      setAttributes(props, properties);
      style.appendChild(props);
      return style;
    }

    {
      let docContent = doc.createElement('office:document-content');
      setAttributes(docContent, {
        'xmlns:meta': 'urn:oasis:names:tc:opendocument:xmlns:meta:1.0',
        'xmlns:office': 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
        'xmlns:draw': 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
        'xmlns:ooo': 'http://openoffice.org/2004/office',
        'xmlns:fo': 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        'xmlns:style': 'urn:oasis:names:tc:opendocument:xmlns:style:1.0',
        'xmlns:text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
        'xmlns:dr3d': 'urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0',
        'xmlns:svg': 'urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0',
        'xmlns:chart': 'urn:oasis:names:tc:opendocument:xmlns:chart:1.0',
        'xmlns:rpt': 'http://openoffice.org/2005/report',
        'xmlns:table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
        'xmlns:number': 'urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0',
        'xmlns:ooow': 'http://openoffice.org/2004/writer',
        'xmlns:oooc': 'http://openoffice.org/2004/calc',
        'xmlns:of': 'urn:oasis:names:tc:opendocument:xmlns:of:1.2',
        'xmlns:css3t': 'http://www.w3.org/TR/css3-text/',
        'xmlns:tableooo': 'http://openoffice.org/2009/table',
        'xmlns:calcext': 'urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0',
        'xmlns:drawooo': 'http://openoffice.org/2010/draw',
        'xmlns:loext': 'urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0',
        'xmlns:grddl': 'http://www.w3.org/2003/g/data-view#',
        'xmlns:field': 'urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0',
        'xmlns:math': 'http://www.w3.org/1998/Math/MathML',
        'xmlns:form': 'urn:oasis:names:tc:opendocument:xmlns:form:1.0',
        'xmlns:script': 'urn:oasis:names:tc:opendocument:xmlns:script:1.0',
        'xmlns:dom': 'http://www.w3.org/2001/xml-events',
        'xmlns:xforms': 'http://www.w3.org/2002/xforms',
        'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xmlns:formx': 'urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
        'xmlns:officeooo': 'http://openoffice.org/2009/office',
        'office:version': '1.2'
      });
      docContent.appendChild(doc.createElement('office:scripts'));
      let docFontFaces = doc.createElement('office:font-face-decls');
      let arial = doc.createElement('style:font-face');
      setAttributes(arial, {
        'style:font-pitch': 'variable',
        'style:font-family-generic': 'swiss',
        'svg:font-family': 'Arial',
        'style:name': 'Arial'
      });
      docFontFaces.appendChild(arial);
      docContent.appendChild(docFontFaces);
      let autoStyles = doc.createElement('office:automatic-styles');
      let p1Style = createStyle('P1', 'paragraph', 'Standard', {
        'style:font-name': 'Arial',
        'fo:font-size': '14pt',
        'officeooo:rsid': '000d98b9',
        'officeooo:paragraph-rsid': '000d98b9',
        'style:font-size-asian': '14pt',
        'style:font-size-complex': '14pt'
      });
      let tableStyle = createStyle('Table', 'table', null, {
        'table:align': 'margins',
        'style:width': '17cm'
      });
      let mainColumnStyle = createStyle('MainColumn', 'table-column', null, {
        'style:column-width': '14cm'
      });
      let pictureColumnStyle = createStyle('PictureColumn', 'table-column', null, {
        'style:column-width': '3cm'
      });
      let framedCellLeftStyle = createStyle('CellFramedLeft', 'table-cell', null, {
        'fo:border-bottom': '4pt solid #000000',
        'fo:border-top': '4pt solid #000000',
        'fo:border-left': '4pt solid #000000',
        'fo:border-right': 'none',
        'fo:padding': '0.097cm',
        'style:vertical-align': 'middle'
      });
      let framedCellRightStyle = createStyle('CellFramedRight', 'table-cell', null, {
        'fo:border-bottom': '4pt solid #000000',
        'fo:border-top': '4pt solid #000000',
        'fo:border-left': 'none',
        'fo:border-right': '4pt solid #000000',
        'fo:padding': '0.097cm',
        'style:vertical-align': 'middle'
      });
      let framedCellStyle = createStyle('CellFramed', 'table-cell', null, {
        'fo:border-bottom': '4pt solid #000000',
        'fo:border-top': '4pt solid #000000',
        'fo:border-left': '4pt solid #000000',
        'fo:border-right': '4pt solid #000000',
        'fo:padding': '0.097cm',
        'style:vertical-align': 'middle'
      });
      let openCellStyle = createStyle('CellOpen', 'table-cell', null, {
        'fo:border-bottom': 'none',
        'fo:border-top': 'none',
        'fo:border-left': 'none',
        'fo:border-right': 'none',
        'fo:padding': '0.097cm',
        'style:vertical-align': 'middle'
      });
      autoStyles.appendChild(p1Style);
      autoStyles.appendChild(tableStyle);
      autoStyles.appendChild(mainColumnStyle);
      autoStyles.appendChild(pictureColumnStyle);
      autoStyles.appendChild(framedCellLeftStyle);
      autoStyles.appendChild(framedCellRightStyle);
      autoStyles.appendChild(framedCellStyle);
      autoStyles.appendChild(openCellStyle);
      docContent.appendChild(autoStyles);

      let docBody = doc.createElement('office:body');
      let docText = doc.createElement('office:text');
      for (let i = 0; i < editor.blockCount; i++) {
        let blockFormat = editor.getBlockFormat(i);
        switch (blockFormat.blockType) {
          case 'default':
            if (blockFormat.picture || blockFormat.frame) {
              let t = createTable(`Table${i + 1}`, 'Table');
              t.appendChild(createColumn(`MainColumn`));
              if (blockFormat.picture) {
                t.appendChild(createColumn(`PictureColumn`));
              }
              let row = createRow();
              let c1 = createCell((blockFormat.frame ? (blockFormat.picture ? 'CellFramedLeft' : 'CellFramed') : 'CellOpen'), 'string');
              c1.appendChild(createParagraph(editor.getRawTextContent(i)));
              row.appendChild(c1);
              if (blockFormat.picture) {
                let c2 = createCell(blockFormat.frame ? 'CellFramedRight' : 'CellOpen', 'string');
                row.appendChild(c2);
              }
              t.appendChild(row);
              docText.appendChild(t);
            } else {
              docText.appendChild(createParagraph(editor.getRawTextContent(i)));
            }
            break;
          case 'images':
            docText.appendChild(createParagraph('Les blocs images ne sont pas encore supportés.'));
            break;
        }
        docText.appendChild(createParagraph());
      }
      docBody.appendChild(docText);
      docContent.appendChild(docBody);

      doc.appendChild(docContent);
    } // Creates the content.xml file.

    let serializer = new XMLSerializer();
    templateZip.file('content.xml', serializer.serializeToString(doc));

    return templateZip.generateAsync({type: 'blob'});
  }
}
