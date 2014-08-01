/**
 * Creates Graphics object, queires for canvas and creates context.
 * @constructor
 */
stf.Graphics = function() {
    this.sprayer = null
    this.field = null

    this.canvas = document.querySelector("canvas")
    this._ctx = this.canvas.getContext("2d")

    this._sprayerImgLastXMin = null
    this._sprayerImgLastYMin = null
    this._sprayerImgLastXMax = null
    this._sprayerImgLastYMax = null
}

/**
 * Draws all scene
 */
stf.Graphics.prototype.draw = function() {
    this._drawField()
    this.drawSprayer()
}

/**
 * Draws sprayer stored within this graphics instance.
 */
stf.Graphics.prototype.drawSprayer = function() {

    this._ctx.save();
    var img = this.sprayer.image

    var halfW = img.width / 2
    var halfH = img.height / 2

    this._ctx.translate(this.sprayer.x, this.sprayer.y)
    this._ctx.rotate(this.sprayer.angle)

    this._ctx.drawImage(this.sprayer.image, -halfW, -halfH)
    this._ctx.restore()

    // store a biggest possible rectangle that needs to be redrawn
    this._sprayerImgLastXMin = this.sprayer.x - halfW * Math.sqrt(2)
    this._sprayerImgLastYMin = this.sprayer.y - halfH * Math.sqrt(2)
    this._sprayerImgLastXMin = this._sprayerImgLastXMin < 0 ? 0 : this._sprayerImgLastXMin
    this._sprayerImgLastYMin = this._sprayerImgLastYMin < 0 ? 0 : this._sprayerImgLastYMin

    this._sprayerImgLastXMax = this._sprayerImgLastXMin + img.width * Math.sqrt(2)
    this._sprayerImgLastYMax = this._sprayerImgLastYMin + img.height * Math.sqrt(2)
}

/**
 * Draws field stored within this graphics instance
 * @private
 */
stf.Graphics.prototype._drawField = function() {
    var f = this.field

    var xMin = this._sprayerImgLastXMin == null ?
        0 : this._pix2Cell(this._sprayerImgLastXMin)
    var yMin = this._sprayerImgLastYMin == null ?
        0 : this._pix2Cell(this._sprayerImgLastYMin)

    var xMax = this._sprayerImgLastXMax == null ?
        f.cells.length : this._pix2Cell(this._sprayerImgLastXMax)
    var yMax = this._sprayerImgLastYMax == null ?
        f.cells.length : this._pix2Cell(this._sprayerImgLastYMax)
    xMax = xMax >= f.cells.length ? f.cells.length : xMax
    yMax = yMax >= f.cells.length ? f.cells.length : yMax

    for (var i = xMin; i < xMax; i++)
        for (var j = yMin; j < yMax; j++)
            if (f.cells[i][j].covered === -1) // outside area
                this._drawCell(i, j, f.images.outside)
            else if (f.cells[i][j].covered === 0) // fresh
                this._drawCell(i, j, f.images.uncovered)
            else if (f.cells[i][j].covered === 1) // covered
                this._drawCell(i, j, f.images.covered)
            else // resprayed
                this._drawCell(i, j, f.images.resprayed)
}

/**
 * Converts pixel coordinates to cell coordinates
 */
stf.Graphics.prototype._pix2Cell = function(pix) {
    return Math.floor(pix / this.field.CELL_SIZE)
}

/**
 * Draws cell in a certain colour depending on its state.
 * @param i
 * @param j
 * @param image
 * @private
 */
stf.Graphics.prototype._drawCell = function(i, j, image) {
    var x = i * this.field.CELL_SIZE
    var y = j * this.field.CELL_SIZE

    this._ctx.drawImage(image,
        x, y, this.field.CELL_SIZE, this.field.CELL_SIZE,
        x, y, this.field.CELL_SIZE, this.field.CELL_SIZE)
}
