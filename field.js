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


    cells = Array(rows)

    for (var i = 1; i < rows; ++i) {
        cells[i] = Array(cols)
        for (var j = 0; j < cols; ++j) {
            var covered = -1
            if (lines[i][j] == '|')
                covered = 0
            cells[i][j] = {covered: covered, timestamp: 0}
        }
    }




    // for (var i = 0; i < 60; i++) {
    //     cells[i] = Array(60)
    //     for (var j = 0; j < 60; j++) {
    //         cells[i][j] = {covered: 0, timestamp: 0}
    //     }
    //     cells[i][0] = {covered: -1, timestamp: 0}
    // }
    // cells[10][10] = {covered: 1, timestamp: 0}




    this.cells = cells
}
