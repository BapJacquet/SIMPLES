$('body').append('<span id="ruler" style="visibility: hidden; white-space: no-wrap;"></span>');
var ruler = $('#ruler').get(0);

String.prototype.visualWidth = function (fontSize = 14) {
  ruler.style.fontSize = '' + fontSize + 'pt';
  ruler.innerHTML = this;
  return ruler.offsetWidth;
}

String.prototype.visualHeight = function (fontSize = 14) {
  ruler.style.fontSize = '' + fontSize + 'pt';
  ruler.innerHTML = this;
  return ruler.offsetHeight;
}
