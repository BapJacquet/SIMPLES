/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "Converter" }] */
/* global $ */

class Converter {
  static async htmlToDocx (html) {
    let data = {
      html: html
    };
    $.post('./converters/toDOCX.php', data);
  }
}