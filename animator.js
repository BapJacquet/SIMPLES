/* eslint no-unused-vars: ["error", { "varsIgnorePattern":"Animator" }] */
/* global $ */
/* global Utils */

/**
 * Class containing static functions to animate elements.
 */
class Animator {
  /**
   * Collapses an element.
   * @param {DOMElement} element - The element to collapse.
   * @param {Number} duration - How long the collapse should last.
   * @param {Function} callback - Callback function.
   */
  static collapse (element, duration = 1000, callback = null) {
    duration = duration / 5;
    let startHeight = $(element).outerHeight();
    $(element).css('overflow-y', 'hidden');
    let rate = startHeight / duration;
    let id = setInterval(frame, 5);
    function frame () {
      if ($(element).outerHeight() <= 0) {
        clearInterval(id);
        if (callback !== null) callback();
      } else {
        let h = $(element).outerHeight();
        $(element).outerHeight(h - rate);
      }
    }
  }

  /**
   * Collapses an element.
   * @param {DOMElement} element - The element to collapse.
   * @param {Number} duration - How long the collapse should last.
   * @param {Function} callback - Callback function.
   */
  static move (element, params, duration = 1000, callback = null) {
    duration = duration / 5;
    let totalDuration = duration;
    $(element).css('position', 'relative');
    let top = parseInt($(element).css('top'), 10);
    let left = parseInt($(element).css('left'), 10);
    let targetTop = top + params.y;
    let targetLeft = left + params.x;
    let id = setInterval(frame, 5);
    function frame () {
      if (duration <= 0) {
        clearInterval(id);
        if (callback !== null) callback();
      } else {
        $(element).css('top', Utils.lerp(targetTop, top, duration / totalDuration));
        $(element).css('left', Utils.lerp(targetLeft, left, duration / totalDuration));
        duration--;
      }
    }
  }

  static moveVertical (element, distance, deviation = 0, duration = 1000, callback = null) {
    duration = duration / 5;
    let totalDuration = duration;
    $(element).css('position', 'relative');
    let top = parseInt($(element).css('top'), 10);
    let left = parseInt($(element).css('left'), 10);
    let targetTop = top + distance;
    let midLeft = left + deviation;
    let id = setInterval(frame, 5);
    function frame () {
      if (duration <= 0) {
        clearInterval(id);
        if (callback !== null) callback();
      } else {
        let interpolation = (totalDuration - duration) / totalDuration;
        $(element).css('top', Utils.lerp(top, targetTop, interpolation));
        $(element).css('left', Utils.lerp(left, midLeft, Math.sin(interpolation * Math.PI)));
        duration--;
      }
    }
  }
}
