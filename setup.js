var Setup = function() {
    this._sprayers = null
    this._fieldImages = null
}

Setup.prototype.load = function() {

    var loadImage = function(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image()
            img.onload = function() {
                resolve(img)
            }
            img.src = url
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

    Promise.all(imagePromises).then(function(images) {
        this._sprayers = {
            red: new RedSprayer(images[0]),
            green: new GreenSprayer(images[1]),
            blue: new BlueSprayer(images[2])
        }

        this._fieldImages = {
            outside : images[3],
            uncovered : images[4],
            covered : images[5],
            resprayed : images[6]
        }

        setTimeout(this._initialized.bind(this), 1500) // TODO remove timeout
    }.bind(this)) // binds 'then' callback to this
}

Setup.prototype._initialized = function() {
    document.getElementById('loading').innerHTML = ''
    var g = new Game(new Field(this._fieldImages), this._sprayers.blue)
    g.init()
    g.play()
}
