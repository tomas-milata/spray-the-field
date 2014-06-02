var App = function() {
    this._sprayers = null
    this._fieldImages = null
    this._fieldsData = null
    this._selectedField = null
    this._selectedSprayer = null

    this._game = null

    this.registerGlobalListeners()
    this.load()
}

App.prototype.registerGlobalListeners = function() {
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

App.prototype.load = function() {

    this.initGui()

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

        this._fieldsData = {
            beginnersLuck: new FieldData(result[7], 'beginnersLuck'),
            obstacle: new FieldData(result[8], 'obstacle'),
            rectangle: new FieldData(result[9], 'rectangle'),
            hardTime: new FieldData(result[10], 'hardTime')
         }

        this._selectField(this._fieldsData.beginnersLuck)
        this._selectedSprayer = this._sprayers.blue

        setTimeout(this._initialized.bind(this), 1500) // TODO remove timeout
    }.bind(this)) // binds 'then' callback to this
}

App.prototype.initGui = function() {
    document.addEventListener("DOMContentLoaded", function() {

        this._setActiveTabListeners()

        var droppable = document.querySelector(".droppable")
        droppable.addEventListener('dragover', function(e) {
            e.preventDefault()
        })
        droppable.addEventListener('drop', this._onDrop.bind(this))

        document.querySelector('a[href="#play"]').addEventListener('click',
            this._startGame.bind(this))

        var vehicleInputs = document.querySelectorAll('input[name="sprayer"]')
        for (var i = 0; i < vehicleInputs.length; i++)
            vehicleInputs[i].addEventListener('change', function(e) {
                this._selectedSprayer = this._sprayers[e.target.value]
            }.bind(this))

        document.querySelector('select[name="field"]').addEventListener('change',
            function(e) {
                this._selectField(this._fieldsData[e.target.value])
            }.bind(this))

        document.getElementById('submit_best').addEventListener('submit',
            this._onBestSubmit.bind(this))

        this.timeLeft = document.getElementById('time_left')
        this._coverage = document.getElementById('coverage')
        this._coverageGoal = document.getElementById('coverage_goal')

    }.bind(this))
}

App.prototype._selectField = function(field) {
    this._selectedField = field
    var record = JSON.parse(localStorage.getItem(field.name))
    this._displayRecord(record)
}

App.prototype._onBestSubmit = function(e) {
    var time = this._game.timeLeft
    var fieldName = this._selectedField.name
    var playerName = e.target.elements[0].value
    var record = {name: playerName, time: time};
    localStorage.setItem(fieldName, JSON.stringify(record))
    this._displayRecord(record)

    e.preventDefault()
}

App.prototype._displayRecord = function(record){
    if (typeof record == undefined || record == null) {
        record = {time: 0, name: 'Mr. Nobody'}
    }
    document.getElementById('best_time').innerHTML = record.time
    document.getElementById('best_name').innerHTML = record.name
}

App.prototype._setActiveTabListeners = function(event) {
    for (var a of document.querySelectorAll('nav a')) {
        a.addEventListener('click', function(e) {
            document.querySelector('a.active_tab').classList.remove('active_tab')
            e.target.classList.add('active_tab')
        })
    }
}

App.prototype._onDrop = function(e) {
    e.preventDefault()
    var file = e.dataTransfer.files[0]
    var reader = new FileReader()
    reader.onload = function(event) {
        this._selectedField = new FieldData(event.target.result)
    }.bind(this)
    reader.readAsText(file)
}

App.prototype._initialized = function() {
    document.getElementById('loading').innerHTML = ''
}

App.prototype._startGame = function() {
    var field = new Field(this._fieldImages, this._selectedField);

    this._selectedSprayer.resetStartPosition()

    if (this._game)
        this._game.stopped = true

    this._game = new Game(field, this._selectedSprayer, this.onUpdate.bind(this))
    this._game.init()
    this._game.play()
}

App.prototype.onUpdate = function(state) {
    var timeLeftSecs = state.timeLeft / 1000;
    timeLeftSecs = timeLeftSecs >= 0 ? timeLeftSecs : 0
    this.timeLeft.innerHTML = Math.floor(timeLeftSecs)
    this._coverage.innerHTML = Math.floor(state.coverage)
    this._coverageGoal.innerHTML = state.coverageGoal
}

new App()