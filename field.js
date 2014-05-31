var Field = function(file) {
    this.cells = this._load(file)
    this.images = null
}

Field.prototype._load = function(file) {
    // TODO
    cells = Array(60)
    for (var i = 0; i < 60; i++) {
        cells[i] = Array(60)
        for (var j = 0; j < 60; j++) {
            cells[i][j] = {covered: 0, timestamp: 0}
        }
    }
    cells[10][10] = 1
    return cells
}
