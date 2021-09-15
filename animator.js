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
      if ($(element).outerHeight() <= 0 || duration <= 0) {
        clearInterval(id);
        if (callback !== null) callback();
      } else {
        let h = $(element).outerHeight();
        $(element).outerHeight(h - rate);
      }
      duration--;
    }
  }

  /**
   * Move an element by a given offset.
   * @param {DOMElement} element - The element to collapse.
   * @param {Object} params - Object containing the x and y offset.
   * @param {Number} duration - How long the animation should last.
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

  /**
   * Move an element vertically by a given offset, with a deviation during the animation.
   * @param {DOMElement} element - The element to collapse.
   * @param {Number} offset - y offset to move the element by.
   * @param {Number} deviation - x offset to displace the element during the animation.
   * @param {Number} duration - How long the animation should last.
   * @param {Function} callback - Callback function.
   */
  static moveVertical (element, offset, deviation = 0, duration = 1000, callback = null) {
    duration = duration / 5;
    let totalDuration = duration;
    $(element).css('position', 'relative');
    let top = parseInt($(element).css('top'), 10);
    let left = parseInt($(element).css('left'), 10);
    let targetTop = top + offset;
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

  /**
   * Move an element horizontally by a given offset, with a deviation during the animation.
   * @param {DOMElement} element - The element to collapse.
   * @param {Number} offset - x offset to move the element by.
   * @param {Number} deviation - y offset to displace the element during the animation.
   * @param {Number} duration - How long the animation should last.
   * @param {Function} callback - Callback function.
   */
  static moveHorizontal (element, offset, deviation = 0, duration = 1000, callback = null) {
    duration = duration / 5;
    let totalDuration = duration;
    $(element).css('position', 'relative');
    let top = parseInt($(element).css('top'), 10);
    let left = parseInt($(element).css('left'), 10);
    let midTop = top + deviation;
    let targetLeft = left + offset;
    let id = setInterval(frame, 5);
    function frame () {
      if (duration <= 0) {
        clearInterval(id);
        if (callback !== null) callback();
      } else {
        let interpolation = (totalDuration - duration) / totalDuration;
        $(element).css('top', Utils.lerp(top, midTop, Math.sin(interpolation * Math.PI)));
        $(element).css('left', Utils.lerp(left, targetLeft, interpolation));
        duration--;
      }
    }
  }

  static switchVertical (element1, element2, relativeTo = element1.parentNode, deviation = 0, duration = 1000, callback = null) {
    duration = duration / 5;
    let totalDuration = duration;
    $(element1).css('position', 'relative');
    $(element2).css('position', 'relative');
    let pos1 = Utils.getRelativeOffset(element1, relativeTo);
    let pos2 = Utils.getRelativeOffset(element2, relativeTo);
    let top1 = parseInt($(element1).css('top'), 10);
    let top2 = parseInt($(element2).css('top'), 10);
    let left1 = parseInt($(element1).css('left'), 10);
    let left2 = parseInt($(element2).css('left'), 10);
    let midLeft1 = left1 + deviation;
    let midLeft2 = left2 - deviation;
    let targetTop1 = pos2.top - pos1.top;
    let targetTop2 = pos1.top - pos2.top;
    let id = setInterval(frame, 5);
    function frame () {
      if (duration <= 0) {
        clearInterval(id);
        $(element1).css('top', top1);
        $(element1).css('left', left2);
        $(element2).css('top', top2);
        $(element2).css('left', left1);
        if (callback !== null) callback();
      } else {
        let interpolation = (totalDuration - duration) / totalDuration;
        $(element1).css('left', Utils.lerp(left1, midLeft1, Math.sin(interpolation * Math.PI)));
        $(element1).css('top', Utils.lerp(top1, targetTop1, interpolation));
        $(element2).css('left', Utils.lerp(left2, midLeft2, Math.sin(interpolation * Math.PI)));
        $(element2).css('top', Utils.lerp(top2, targetTop2, interpolation));
        duration--;
      }
    }
  }

  static switchHorizontal (element1, element2, relativeTo = element1.parentNode, deviation = 0, duration = 1000, callback = null) {
    duration = duration / 5;
    let totalDuration = duration;
    $(element1).css('position', 'relative');
    $(element2).css('position', 'relative');
    let pos1 = Utils.getRelativeOffset(element1, relativeTo);
    let pos2 = Utils.getRelativeOffset(element2, relativeTo);
    let top1 = parseInt($(element1).css('top'), 10);
    let top2 = parseInt($(element2).css('top'), 10);
    let left1 = parseInt($(element1).css('left'), 10);
    let left2 = parseInt($(element2).css('left'), 10);
    let midTop1 = top1 + deviation;
    let midTop2 = top2 - deviation;
    let targetLeft1 = pos2.left - pos1.left;
    let targetLeft2 = pos1.left - pos2.left;
    let id = setInterval(frame, 5);
    function frame () {
      if (duration <= 0) {
        clearInterval(id);
        $(element1).css('top', top1);
        $(element1).css('left', left2);
        $(element2).css('top', top2);
        $(element2).css('left', left1);
        if (callback !== null) callback();
      } else {
        let interpolation = (totalDuration - duration) / totalDuration;
        $(element1).css('top', Utils.lerp(top1, midTop1, Math.sin(interpolation * Math.PI)));
        $(element1).css('left', Utils.lerp(left1, targetLeft1, interpolation));
        $(element2).css('top', Utils.lerp(top2, midTop2, Math.sin(interpolation * Math.PI)));
        $(element2).css('left', Utils.lerp(left2, targetLeft2, interpolation));
        duration--;
      }
    }
  }
}
