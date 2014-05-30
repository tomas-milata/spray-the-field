var Graphics = function() {
}

Graphics.prototype.init = function() {
  this.canvas = document.querySelector("canvas")
  this._ctx = this.canvas.getContext("2d")

  // Background image
  this._bgImage = new Image()
  this._bgImage.onload = function () {
      this._ctx.drawImage(this._bgImage, 0, 0)
  }.bind(this)
  this._bgImage.src = "img/green.png"
}

Graphics.prototype.drawSprayer = function() {
    this._ctx.drawImage(this._bgImage, 0, 0)

    this._ctx.save();
    var img = this.sprayer.image;
    var x = this.sprayer.x
    var y = this.sprayer.y
    this._ctx.translate(x + img.width / 2, y + img.height / 2);
    this._ctx.rotate(this.sprayer.angle);
    this._ctx.translate(-(x + img.width / 2), -(y + img.height / 2));
    this._ctx.drawImage(this.sprayer.image, this.sprayer.x, this.sprayer.y)
    this._ctx.restore();
}
