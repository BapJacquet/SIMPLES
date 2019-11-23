/**
 * Draws a clock.
 * @param {int} hour - The hour displayed on the clock.
 * @param {int} minutes - The minutes displayed on the clock.
 * @param {object} options - Options for drawing the clock.
 * @return {DataURL} The data URL representing the clock.
 */
function drawClock (hour, minutes, options = { size: 300, strict: false }) {
  const can = document.createElement('canvas');
  can.width = options.size || 300;
  can.height = options.size || 300;
  const c = new Clock(can);
  c.set(hour, minutes, options.strict);
  return can.toDataURL();
}

class Clock {
  /**
   * @constructor
   * @param {string} selector - The selector of the canvas element.
   */
  constructor (selector) {
    this.selector = selector;
    const canvas = $(this.selector)[0];
    this.ctx = canvas.getContext('2d');
    this.radius = Math.min(canvas.height, canvas.width) / 2;
    this.ctx.translate(canvas.width / 2, canvas.height / 2);
  }

  /**
   * Sets the time on the clock, and draws it.
   * @param {int} hour - The hour.
   * @param {int} minute - The number of minutes.
   * @param {boolean} strict - (Default: false) If the hour hand should point
   * straight at the given hour, or move with the minutes as well.
   */
  set (hour, minute, strict = false) {
    this.drawClock();
    this.drawNumbers();
    this.drawTime(hour, minute, strict);
  }

  /**
   * Draws the clock frame itself.
   */
  drawClock () {
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius * 0.85, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'white';
    this.ctx.fill();

    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = this.radius * 0.04;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius * 0.1, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
  }

  /**
   * Draws the numbers on the clock.
   */
  drawNumbers () {
    this.ctx.font = this.radius * 0.18 + 'px arial';
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    for (let num = 1; num < 13; num++) {
      const ang = num * Math.PI / 6;
      this.ctx.rotate(ang);
      this.ctx.translate(0, -this.radius * 0.72);
      this.ctx.rotate(-ang);
      this.ctx.fillText(num.toString(), 0, 0);
      this.ctx.rotate(ang);
      this.ctx.translate(0, this.radius * 0.72);
      this.ctx.rotate(-ang);
    }
  }

  /**
   * Draws the hands representing the time.
   * @param {int} hour - The hour.
   * @param {int} minutes - The number of minutes.
   * @param {boolean} strict - Whether the hour hand should be pointing strictly
   * at the given hour, or if it should move with the minutes as well.
   */
  drawTime (hour, minutes, strict) {
    hour = hour % 12;
    minutes = minutes % 60;
    if (!strict) hour += minutes / 60;
    this.drawHand((hour / 6) * Math.PI, this.radius * 0.4, this.radius * 0.07);
    this.drawHand((minutes / 30) * Math.PI, this.radius * 0.6, this.radius * 0.07);
  }

  /**
   * Draws a hand at the given position.
   * @param {float} pos - Position on the clock.
   * @param {float} length - Length of the hand.
   * @param {float} width - Width of the hand.
   */
  drawHand (pos, length, width) {
    this.ctx.beginPath();
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.moveTo(0, 0);
    this.ctx.rotate(pos);
    this.ctx.lineTo(0, -length);
    this.ctx.stroke();
    this.ctx.rotate(-pos);
  }
}
