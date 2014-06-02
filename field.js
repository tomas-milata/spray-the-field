var Field = function(images, data) {
    this.images = images

    this.CELL_SIZE = 10
    this.MAX_NOT_RESPRAYED_DELAY = 100

    this.coverage = 0
    this._coveredCells = 0
    this.cells = this._cloneCells(data.cells) // clone array
    this._cellsCount = data.cellsCount
    this.LIMIT_SECONDS = data.limitSeconds
    this.LIMIT_COVERAGE = data.limitCoverage
}

Field.prototype._cloneCells = function(cellData) {
    var cells = new Array(cellData.length)
    for (var i = 0; i < cellData.length; i++) {
        cells[i] = new Array(cellData[i].length)
        for (var j = 0; j < cellData[i].length; j++) {
            var oldCell = cellData[i][j]
            cells[i][j] = {covered: oldCell, timestamp: 0}
        }
    }
    return cells
}


var FieldData = function(input, name) {

    this.name = name

    var lines = input.split('\n')
    var params = lines[0].split(' ')

    var rows = params[0]
    var cols = params[1]

    var cells = new Array(rows)

    for (var i = 0; i < rows; ++i) {
        cells[i] = new Array(cols)
        for (var j = 0; j < cols; ++j) {
            var covered = -1
            if (lines[i + 1][j] == '|')
                covered = 0
            cells[i][j] = covered
        }
    }

    this.limitSeconds = params[2]
    this.limitCoverage = params[3]
    this.cellsCount = rows * cols
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