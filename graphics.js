var Graphics = function() {}

Graphics.prototype.init = function() {
  var canvas = document.querySelector("canvas")
  this._ctx = canvas.getContext("2d")

  // Background image
  var bgImage = new Image()
  bgImage.onload = function () {
      _ctx.drawImage(bgImage, 0, 0)
  }
  bgImage.src = "img/green.png"
}

Graphics.prototype.drawTractor = function(x, y, deg) {

}
