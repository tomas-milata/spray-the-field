/**
 * @namespace
 */
stf = {}

stf.App = function() {
    this._sprayers = null

    this._fieldImages = null
    this._fieldsData = null
    this._tractorSound = new Audio('sound/tractor.mp3')

    this._selectedFieldData = null
    this._selectedSprayer = null

    this._game = null

    this.registerGlobalListeners()
    this.load()
}

stf.App.prototype.registerGlobalListeners = function() {
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

stf.App.prototype.load = function() {

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
            red: new stf.RedSprayer(result[0]),
            green: new stf.GreenSprayer(result[1]),
            blue: new stf.BlueSprayer(result[2])
        }

        this._fieldImages = {
            outside : result[3],
            uncovered : result[4],
            covered : result[5],
            resprayed : result[6]
        }

        this._fieldsData = {
            beginnersLuck: new stf.FieldData(result[7], 'beginnersLuck'),
            obstacle: new stf.FieldData(result[8], 'obstacle'),
            rectangle: new stf.FieldData(result[9], 'rectangle'),
            hardTime: new stf.FieldData(result[10], 'hardTime')
         }

        this._selectField(this._fieldsData.beginnersLuck)
        this._selectedSprayer = this._sprayers.blue

        setTimeout(this._initialized.bind(this), 1500) // TODO remove timeout
    }.bind(this)) // binds 'then' callback to this
}

stf.App.prototype.initGui = function() {
    document.addEventListener("DOMContentLoaded", function() {

        this._setActiveTabListeners()

        var droppable = document.querySelector(".droppable")
        droppable.addEventListener('dragover', function(e) {
            e.preventDefault()
        })
        droppable.addEventListener('drop', this._onDrop.bind(this))

        window.onhashchange = this._onHashChange.bind(this)

        var vehicleInputs = document.querySelectorAll('input[name="sprayer"]')
        for (var i = 0; i < vehicleInputs.length; i++)
            vehicleInputs[i].addEventListener('change', function(e) {
                this._selectedSprayer = this._sprayers[e.target.value]
            }.bind(this))

        document.querySelector('select[name="field"]').addEventListener('change',
            function(e) {
                this._selectField(this._fieldsData[e.target.value])
            }.bind(this))

        document.getElementById('record').addEventListener('submit',
            this._onBestSubmit.bind(this))

        this.timeLeft = document.getElementById('time_left')
        this._coverage = document.getElementById('coverage')
        this._coverageGoal = document.getElementById('coverage_goal')

    }.bind(this))
}

stf.App.prototype._onHashChange = function() {
    if (location.hash == '#play')
        this._startGame()
    else if (this._game != null)
        this._game.stop()
}

stf.App.prototype._selectField = function(field) {
    this._selectedFieldData = field
    var record = JSON.parse(localStorage.getItem(field.name))
    this._displayRecord(record)
}

stf.App.prototype._onBestSubmit = function(e) {
    var time = this._game.timeLeft
    var fieldName = this._selectedFieldData.name
    var playerName = e.target.elements[0].value
    var record = {name: playerName, time: time};
    localStorage.setItem(fieldName, JSON.stringify(record))
    this._displayRecord(record)

    e.preventDefault()
}

stf.App.prototype._displayRecord = function(record){
    if (typeof record == undefined || record == null) {
        record = {time: 0, name: 'Mr. Nobody'}
    }
    document.getElementById('best_time').innerHTML = record.time
    document.getElementById('best_name').innerHTML = record.name
}

stf.App.prototype._setActiveTabListeners = function(event) {
    var a = document.querySelectorAll('nav a')
    for (var i = 0; i < a.length; i++) {
        a[i].addEventListener('click', function(e) {
            document.querySelector('a.active_tab').classList.remove('active_tab')
            e.target.classList.add('active_tab')
        })
    }
}

stf.App.prototype._onDrop = function(e) {
    e.preventDefault()
    var file = e.dataTransfer.files[0]
    var reader = new FileReader()
    reader.onload = function(event) {
        this._selectedFieldData = new stf.FieldData(event.target.result)
    }.bind(this)
    reader.readAsText(file)
}

stf.App.prototype._initialized = function() {
    document.querySelector('body').classList.remove('loading')
}

stf.App.prototype._startGame = function() {

    document.getElementById('play').className = 'playing'

    var field = new stf.Field(this._fieldImages, this._selectedFieldData);

    this._selectedSprayer.resetStartPosition()

    var record = JSON.parse(localStorage.getItem(this._selectedFieldData.name))
    var recordTime = record == null ? 0 : record.time

    if (this._game)
        this._game.stop()

    this._game = new stf.Game(field, this._selectedSprayer, this.onUpdate.bind(this),
        this._tractorSound, recordTime)
    this._game.stopCallback = this.onGameStop
    this._game.init()
    this._game.play()
}

stf.App.prototype.onGameStop = function(result) {
    document.getElementById('play').className = 'finished ' + result
}

stf.App.prototype.onUpdate = function(state) {
    var timeLeftSecs = state.timeLeft / 1000;
    timeLeftSecs = timeLeftSecs >= 0 ? timeLeftSecs : 0
    this.timeLeft.innerHTML = Math.floor(timeLeftSecs)
    this._coverage.innerHTML = Math.floor(state.coverage)
    this._coverageGoal.innerHTML = state.coverageGoal
}

new stf.App()