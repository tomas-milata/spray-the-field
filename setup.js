var Setup = function() {
    this._sprayers = null
    this._fieldImages = null
    this.fieldsData = null
    this._selectedField = null
    this._selectedSprayer = null

    this._gui = new GUI()

    this._game = null


    window.addEventListener("keydown", function (e) {
        if (this._game) {
            this._game.onkeydown(e)
        }
    }.bind(this))

    window.addEventListener("keyup", function (e) {
        if (this._game) {
            this._game.onkeyup(e)
        }
    }.bind(this))

}

Setup.prototype.load = function() {

    this._gui.init()

    this._gui.onFileDropped = function(input) {
        this._selectedField = new FieldData(input)
    }.bind(this)

    this._gui.onGameStarted = function() {
        this._startGame()
    }.bind(this)

    this._gui.onVehicleSelected = function(vehicle) {
        this._selectedSprayer = this._sprayers[vehicle]
    }.bind(this)

    var loadImage = function(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image()
            img.onload = function() {
                resolve(img)
            }
            img.src = url
        })
    }

    var loadMap = function(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest()
            xhr.open("GET", url)
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(xhr.response)
                }
            }
            xhr.send()
        })
    }

    var imagePromises = [
        'img/sprayer_red.png',
        'img/sprayer_green.png',
        'img/sprayer_blue.png',
        'img/brown.png',
        'img/green.png',
        'img/yellow.png',
        'img/red.png'
    ].map(loadImage)

    var mapPromises = [
        'maps/beginners_luck',
        'maps/obstacle',
        'maps/rectangle',
        'maps/hard_time'
    ].map(loadMap)

    Promise.all(imagePromises.concat(mapPromises)).then(function(result) {
        this._sprayers = {
            red: new RedSprayer(result[0]),
            green: new GreenSprayer(result[1]),
            blue: new BlueSprayer(result[2])
        }

        this._fieldImages = {
            outside : result[3],
            uncovered : result[4],
            covered : result[5],
            resprayed : result[6]
        }

        this.fieldsData = {
            beginnersLuck: new FieldData(result[7]),
            obstacle: new FieldData(result[8]),
            rectangle: new FieldData(result[9]),
            hardTime: new FieldData(result[10])
         }

        this._selectedField = this.fieldsData.hardTime
        this._selectedSprayer = this._sprayers.blue

        setTimeout(this._initialized.bind(this), 1500) // TODO remove timeout
    }.bind(this)) // binds 'then' callback to this
}

Setup.prototype._initialized = function() {
    document.getElementById('loading').innerHTML = ''
}

Setup.prototype._startGame = function() {
    var field = new Field(this._fieldImages, this._selectedField);

    this._selectedSprayer.resetStartPosition()

    if (this._game)
        this._game.stopped = true

    this._game = new Game(field, this._selectedSprayer, this._gui.onUpdate.bind(this._gui))
    this._game.init()
    this._game.play()
}
