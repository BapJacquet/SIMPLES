/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "Utils" }] */
class Utils {
  /**
   * Return the amount of pixels in the given number of points.
   * @param {int} x - Number of pt.
   * @return {float} - Number of px.
   */
  static pointToPixel (x) {
    return x * (96.0 / 72.0);
  }

  /**
   * Return the amount of points in the given number of pixels.
   * @param {float} x - Number of px.
   * @return {int} - Number of pt.
   */
  static pixelToPoint (x) {
    return Math.round(x * (72.0 / 96.0));
  }

  static pixelToCm (px) {
    return (px * 25.4) / 96;
  }

  static cmToInches (cm) {
    return cm / 2.54;
  }

  static containsEncodedComponents (x) {
    // ie ?,=,&,/ etc
    return (decodeURI(x) !== decodeURIComponent(x));
  }

  static getRelativeOffset (element, relativeTo = $(element).parent().get(0)) {
    let elem = $(element);
    let eOffset = elem.offset();
    return {left: eOffset.left - $(relativeTo).offset().left, top: eOffset.top - $(relativeTo).offset().top};
  }

  static clamp (value, min, max) {
    return value > max ? max : (value < min ? min : value);
  }

  static lerp (startValue, endValue, interpolation) {
    interpolation = Utils.clamp(interpolation, 0, 1);
    let d = endValue - startValue;
    return startValue + (d * interpolation);
  }

  /**
   * Return whether or not the given variable has a value.
   * @param {Object} x - The object.
   * @return {boolean} true if the object is either null or undefined, false otherwise.
   */
  static isNullOrUndefined (x) {
    return (x == null || typeof (x) === 'undefined');
  }

  /**
   * Return whether or not the given string ends with the given suffix.
   * @param {String} string - The string to check.
   * @param {String} suffix - the suffix to test for.
   * @return {boolean} true if the string ends with the given suffix, false otherwise.
   */
  static stringEndsWith (string, suffix) {
    return string.indexOf(suffix, this.length - suffix.length) !== -1;
  }

  static pxToNumber (string) {
    return Number(string.replace('px', ''));
  }
}
