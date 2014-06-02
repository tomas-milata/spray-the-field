var Field = function(images, file) {
    this._load(file)
    this.timeRemaining

    this.images = images
    this.CELL_SIZE = 15
}


Field.prototype._load = function(file) {

    var lines = file.split('\n')
    var params = lines[0].split(' ')

    var rows = params[0]
    var cols = params[1]
    var limitSeconds = params[2]
    var limitCoverage = params[3]


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