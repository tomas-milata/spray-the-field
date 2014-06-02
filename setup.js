var Setup = function() {
    this._sprayers = null
    this._fieldImages = null
    this.fields = null

    this._gui = new GUI()

}

Setup.prototype.load = function() {

    this._gui.init()

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

        this.fields = {
            beginnersLuck: new Field(this._fieldImages, result[7]),
            obstacle: new Field(this._fieldImages, result[8]),
            rectangle: new Field(this._fieldImages, result[9]),
            hardTime: new Field(this._fieldImages, result[10])
         }

        setTimeout(this._initialized.bind(this), 1500) // TODO remove timeout
    }.bind(this)) // binds 'then' callback to this
}

Setup.prototype._initialized = function() {
    document.getElementById('loading').innerHTML = ''
    var g = new Game(this.fields.hardTime, this._sprayers.blue,
        this._gui.onUpdate.bind(this._gui))
    g.init()
    g.play()
}
