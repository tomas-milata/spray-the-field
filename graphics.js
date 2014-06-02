var Graphics = function() {
    this.sprayer = null
    this.field = null

    this.canvas = document.querySelector("canvas")
    this._ctx = this.canvas.getContext("2d")
}

Graphics.prototype.draw = function() {
    this._drawField()
    this.drawSprayer()
}

Graphics.prototype.drawSprayer = function() {
    this._drawField()

    this._ctx.save();
    var img = this.sprayer.image

    var halfW = img.width / 2
    var halfH = img.height / 2

    var x = this.sprayer.x - halfW
    var y = this.sprayer.y - halfH
    this._ctx.translate(x + halfW, y + halfH)
    this._ctx.rotate(this.sprayer.angle)

    this._ctx.drawImage(this.sprayer.image, -halfW, -halfH)
    this._ctx.restore()
}

Graphics.prototype._drawField = function() {
    var f = this.field
    for (var i = 0; i < f.cells.length; i++)
        for (var j = 0; j < f.cells.length; j++)
            if (f.cells[i][j].covered === -1) // outside area
                this._drawCell(i, j, f.images.outside)
            else if (f.cells[i][j].covered === 0) // fresh
                this._drawCell(i, j, f.images.uncovered)
            else if (f.cells[i][j].covered === 1) // covered
                this._drawCell(i, j, f.images.covered)
            else // resprayed
                this._drawCell(i, j, f.images.resprayed)
}

Graphics.prototype._drawCell = function(i, j, image) {
    var x = i * this.field.CELL_SIZE
    var y = j * this.field.CELL_SIZE

    this._ctx.drawImage(image,
        x, y, this.field.CELL_SIZE, this.field.CELL_SIZE,
        x, y, this.field.CELL_SIZE, this.field.CELL_SIZE)
}
