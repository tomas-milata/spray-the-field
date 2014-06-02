var Field = function(images, file) {
    this.images = images

    this.CELL_SIZE = 10
    this.MAX_NOT_RESPRAYED_DELAY = 100

    this.coverage = null
    this._coveredCells = 0
    this._cellsCount = null

    this._load(file)
}


Field.prototype._load = function(file) {

    var lines = file.split('\n')
    var params = lines[0].split(' ')

    var rows = params[0]
    var cols = params[1]
    this.LIMIT_SECONDS = params[2]
    this.LIMIT_COVERAGE = params[3]

    this._cellsCount = rows * cols

    var cells = new Array(rows)

    for (var i = 0; i < rows; ++i) {
        cells[i] = new Array(cols)
        for (var j = 0; j < cols; ++j) {
            var covered = -1
            if (lines[i + 1][j] == '|')
                covered = 0
            cells[i][j] = {covered: covered, timestamp: 0}
        }
    }




    this.cells = cells
}

Field.prototype.sprayCell = function(i, j) {
    var c = this.cells[i][j]
    var now = Date.now()
    var resprayed = false
    if (c.covered != -1) {
        if (now - c.timestamp > this.MAX_NOT_RESPRAYED_DELAY) {
            if (c.covered++ == 0) // sprayed for the first time
                this.coverage = 100 * ++this._coveredCells / this._cellsCount
            else resprayed = true
        }
        c.timestamp = now
    }
    return resprayed
}